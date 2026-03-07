"""
Form Processing and Orchestration
Handles form data matching, question processing, and automation orchestration
"""

import re
import time
import logging
import asyncio
from typing import Optional, Dict, List, Any
from utils.browser_automation import BrowserAutomation

logger = logging.getLogger(__name__)


class FormProcessor:
    """Orchestrates form processing with question matching and data population"""

    def __init__(self, form_type: str = "ai-registry-form", config_path: Optional[str] = None):
        self.form_type = form_type
        self.browser_automation = BrowserAutomation(form_type, config_path)
        self.config = self.browser_automation.config

    def normalize_question_text(self, text: str) -> str:
        """Normalize question text for better matching"""
        if not text:
            return ""

        normalized = text.lower().strip()
        normalized = re.sub(r"^\d+\.\s*", "", normalized)
        normalized = re.sub(r"\(select all that apply\)\s*", "", normalized)
        normalized = re.sub(r"\s*\(select all that apply\)", "", normalized)
        normalized = re.sub(r"\s+", " ", normalized).strip()

        return normalized

    def find_matching_form_data(self, form_question_text: str, form_data: List[Dict]) -> Optional[Dict]:
        """Find matching form data based on question text with stricter rules.
        Only exact normalized match or core-phrase containment are allowed.
        Substring and keyword-overlap heuristics are removed to prevent duplicates.
        """
        if not form_question_text:
            return None

        form_question_normalized = self.normalize_question_text(form_question_text)

        # 1) Exact normalized match
        for item in form_data:
            db_question = item.get("question", "")
            db_question_normalized = self.normalize_question_text(db_question)
            if db_question_normalized == form_question_normalized:
                return item

        # 2) Core-phrase containment (after removing leading question words and '?')
        form_core = form_question_normalized
        form_core = re.sub(r"\?$", "", form_core)
        form_core = re.sub(r"^(what|which|where|when|who|how|do|does|is|are)\s+", "", form_core)

        for item in form_data:
            db_question = item.get("question", "")
            db_question_normalized = self.normalize_question_text(db_question)
            db_core = re.sub(r"\?$", "", db_question_normalized)
            db_core = re.sub(r"^(what|which|where|when|who|how|do|does|is|are)\s+", "", db_core)

            if len(form_core) > 10 and len(db_core) > 10:
                if form_core in db_core or db_core in form_core:
                    return item

        # If nothing matched by strict rules
        return None

    def get_hardcoded_question(self, form_question_text: str) -> Optional[Dict]:
        """Check if this question has a hardcoded override in config"""
        all_hardcoded_questions = self.config.get("hardcoded_questions", {})
        hardcoded_questions = all_hardcoded_questions.get(self.form_type, {})

        clean_question = form_question_text.strip()
        clean_question = re.sub(r"^\d+\.\s*", "", clean_question).strip()

        if clean_question in hardcoded_questions:
            hardcoded_config = hardcoded_questions[clean_question]
            logger.info(
                "Found exact match for '%s' - reason: %s",
                clean_question,
                hardcoded_config.get("reason", "Not specified"),
            )
            return hardcoded_config

        for config_question, config_data in hardcoded_questions.items():
            if config_question in clean_question or clean_question in config_question:
                logger.info(
                    "Found partial match for '%s' with '%s' - reason: %s",
                    clean_question,
                    config_question,
                    config_data.get("reason", "Not specified"),
                )
                return config_data

        return None

    def _process_form_question(
        self,
        q_num: int,
        form_question_text: str,
        form_data: List[Dict],
        matched_question_ids: List[str],
    ) -> tuple:
        """
        Process a single form question and attempt to fill it.

        Returns:
            tuple: (status, question_id, failed_detail) where status is 'filled', 'skipped', 'failed', or 'no_match'
        """
        form_data_item = self.find_matching_form_data(form_question_text, form_data)

        if not form_data_item:
            logger.warning("[NO MATCH] No matching question found in form_data")
            return ("no_match", None, None)

        hardcoded_config = self.get_hardcoded_question(form_question_text)

        if hardcoded_config:
            hardcoded_answer = hardcoded_config.get("answer")
            if hardcoded_answer:
                matched_item = {
                    "questionId": form_data_item.get("questionId", "Unknown"),
                    "question": form_data_item.get("question", form_question_text),
                    "answer": hardcoded_answer,
                    "type": hardcoded_config.get("type", form_data_item.get("type", "text")),
                }
                logger.info(
                    "[FULL HARDCODE] Using hardcoded answer '%s' and type '%s' - Reason: %s",
                    hardcoded_answer,
                    hardcoded_config.get("type"),
                    hardcoded_config.get("reason", "Not specified"),
                )
            else:
                matched_item = {
                    "questionId": form_data_item.get("questionId", "Unknown"),
                    "question": form_data_item.get("question", form_question_text),
                    "answer": form_data_item.get("answer", []),
                    "type": hardcoded_config.get("type", form_data_item.get("type", "text")),
                }
                logger.info(
                    "[TYPE OVERRIDE] Using hardcoded type '%s' with form_data answer - Reason: %s",
                    hardcoded_config.get("type"),
                    hardcoded_config.get("reason", "Not specified"),
                )
        else:
            matched_item = form_data_item
            logger.info("[FORM DATA] Using form_data type and answer directly")

        question_id = matched_item.get("questionId", "Unknown")
        db_question = matched_item.get("question", "Unknown")
        answer = matched_item.get("answer", [])
        field_type = matched_item.get("type", "text")

        matched_question_ids.append(question_id)

        logger.info("[MATCHED] %s: %s...", question_id, db_question[:60])
        logger.info("[ANSWER] %s", answer)
        logger.info("[TYPE] %s", field_type)

        if (
            not answer
            or (isinstance(answer, list) and len(answer) == 0)
            or (isinstance(answer, list) and answer[0] == "")
        ):
            logger.warning("[SKIP] No answer provided")
            return ("skipped", question_id, None)

        success = self.browser_automation.fill_field_by_type(
            question_num=q_num,
            field_type=field_type,
            answer=answer,
            field_name=db_question[:50],
        )

        if success:
            logger.info("[SUCCESS] Question %s filled successfully", q_num)
            return ("filled", question_id, None)
        else:
            logger.error("[FAILED] Question %s failed to fill", q_num)
            failed_detail = {
                "questionId": question_id,
                "question": db_question,
                "answer": answer,
                "type": field_type,
                "form_question_text": form_question_text,
            }
            return ("failed", question_id, failed_detail)

    def _log_fill_statistics(
        self,
        final_question_count: int,
        iteration: int,
        processed_questions: set,
        matched_count: int,
        filled_count: int,
        skipped_count: int,
        failed_count: int,
        max_iterations: int,
        unmatched_questions: List[Dict],
        failed_questions_detail: List[Dict],
    ):
        """Log detailed statistics about the form filling process."""
        if unmatched_questions:
            logger.error(
                "[UNMATCHED QUESTIONS] %s -> %s",
                len(unmatched_questions),
                ", ".join([uq.get("question", "?")[:80] for uq in unmatched_questions]),
            )
        if failed_questions_detail:
            logger.error(
                "[FAILED QUESTIONS DETAIL] %s -> %s",
                len(failed_questions_detail),
                "; ".join(
                    [f"{fq['questionId']}:{fq['question'][:60]} ({fq['type']})" for fq in failed_questions_detail]
                ),
            )

        logger.info("\n%s", "=" * 60)
        logger.info("DYNAMIC FORM FILLING RESULTS:")
        logger.info("Final form questions: %s", final_question_count)
        logger.info("Processing iterations: %s", iteration)
        logger.info("Questions processed: %s", len(processed_questions))
        logger.info("Questions matched: %s", matched_count)
        logger.info("Successfully filled: %s", filled_count)
        logger.info("Skipped (no answer): %s", skipped_count)
        logger.info("Failed to fill: %s", failed_count)

        if matched_count > 0:
            success_rate = (filled_count / matched_count) * 100
            logger.info("Fill success rate: %s/%s (%.1f%%)", filled_count, matched_count, success_rate)

        total_attempted = filled_count + failed_count
        if total_attempted > 0:
            overall_rate = (filled_count / total_attempted) * 100
            logger.info("Overall success rate: %s/%s (%.1f%%)", filled_count, total_attempted, overall_rate)

        if iteration >= max_iterations:
            logger.warning("Stopped after %s iterations (safety limit)", max_iterations)

        logger.info("%s\n", "=" * 60)

    def fill_form_with_data(self, form_data: List[Dict]) -> Dict[str, Any]:
        """Fill the dynamic form by processing questions as they appear"""
        try:
            if not self.browser_automation.open_form():
                return False

            logger.info("Starting DYNAMIC form filling process with sequential question matching...")
            logger.info("[INFO] Available form data: %s questions from database", len(form_data))

            filled_count = 0
            skipped_count = 0
            failed_count = 0
            matched_count = 0
            processed_questions = set()
            matched_question_ids = []
            failed_questions_detail = []

            max_iterations = 50
            iteration = 0

            while iteration < max_iterations:
                iteration += 1
                current_question_count = self.browser_automation.count_form_questions()

                if iteration == 1:
                    logger.info("[INFO] Form initially shows %s questions", current_question_count)
                else:
                    logger.info("[INFO] Iteration %s: Form now shows %s questions", iteration, current_question_count)
                    logger.info("[INFO] Questions already processed: %s", sorted(processed_questions))

                new_questions_found = False

                for q_num in range(1, current_question_count + 1):
                    if q_num in processed_questions:
                        continue

                    new_questions_found = True
                    logger.info("[PROCESSING] Form Question #%s (Iteration %s)", q_num, iteration)

                    form_question_text = self.browser_automation.get_form_question_text(q_num)

                    if not form_question_text:
                        logger.error("[ERROR] Could not extract question text for Q%s", q_num)
                        failed_count += 1
                        processed_questions.add(q_num)
                        continue

                    logger.info("[FORM QUESTION] %s...", form_question_text[:100])

                    # Process the question
                    status, _, failed_detail = self._process_form_question(
                        q_num, form_question_text, form_data, matched_question_ids
                    )

                    if status == "no_match":
                        skipped_count += 1
                    elif status == "skipped":
                        matched_count += 1
                        skipped_count += 1
                    elif status == "filled":
                        matched_count += 1
                        filled_count += 1
                    elif status == "failed":
                        matched_count += 1
                        failed_count += 1
                        failed_questions_detail.append(failed_detail)

                    processed_questions.add(q_num)
                    time.sleep(self.config["wait_times"]["between_fields"])

                    # Wait for potential form expansion
                    expansion_wait_time = self.config["wait_times"].get("form_expansion", 10)
                    new_count = self.browser_automation.wait_for_new_questions(
                        current_question_count, max_wait_time=expansion_wait_time
                    )
                    if new_count > current_question_count:
                        current_question_count = new_count
                        logger.info("[INFO] Form expanded to %s questions", current_question_count)

                # Check for new questions after iteration
                expansion_wait_time = self.config["wait_times"].get("new_questions_appear", 8)
                time.sleep(expansion_wait_time)
                final_count = self.browser_automation.count_form_questions()

                if final_count > current_question_count:
                    logger.info("[INFO] Form has more questions: %s total, continuing...", final_count)
                    continue

                # Check for unprocessed questions
                unprocessed_questions = [
                    q_num for q_num in range(1, final_count + 1) if q_num not in processed_questions
                ]

                if unprocessed_questions:
                    logger.info("[INFO] Still have unprocessed questions: %s, continuing...", unprocessed_questions)
                    continue

                if not new_questions_found:
                    logger.info(
                        "\n[INFO] No more new questions found. All %s questions processed.", len(processed_questions)
                    )
                    break
                else:
                    logger.info("[INFO] Processed questions in this iteration, checking for more...")
                    continue

            # Determine unmatched DB questions
            unmatched_questions = [
                item for item in form_data if item.get("questionId", "Unknown") not in matched_question_ids
            ]

            final_question_count = self.browser_automation.count_form_questions()

            # Log statistics
            self._log_fill_statistics(
                final_question_count,
                iteration,
                processed_questions,
                matched_count,
                filled_count,
                skipped_count,
                failed_count,
                max_iterations,
                unmatched_questions,
                failed_questions_detail,
            )

            # Attempt form submission
            submission_success = self.browser_automation.submit_form()

            if not submission_success:
                logger.error("Form submission failed - submit button not found or not clickable")
                return {
                    "success": False,
                    "error": "Form submission failed - submit button not found",
                    "final_question_count": final_question_count,
                    "filled_count": filled_count,
                    "matched_count": matched_count,
                    "skipped_count": skipped_count,
                    "failed_count": failed_count,
                }

            logger.info("Form automation completed successfully!")

            return {
                "success": True,
                "final_question_count": final_question_count,
                "filled_count": filled_count,
                "matched_count": matched_count,
                "skipped_count": skipped_count,
                "failed_count": failed_count,
                "matched_question_ids": matched_question_ids,
                "unmatched_questions": unmatched_questions,
                "failed_questions": failed_questions_detail,
            }

        except Exception as e:
            logger.exception("Error in form automation: %s", str(e))
            return {"success": False, "error": str(e)}

        finally:
            self.browser_automation.close_browser()

    async def process_single_submission(self, form_data: List[Dict]) -> Dict[str, Any]:
        """Process a single form submission"""
        try:
            logger.info("=== Starting Microsoft Forms Automation (Simplified) ===")

            # Run browser automation in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self.fill_form_with_data, form_data)

            if isinstance(result, dict):
                if result.get("success"):
                    logger.info("Form automation completed successfully!")
                    result["message"] = "Form submitted successfully"
                    return result
                else:
                    logger.error("Form automation failed!")
                    result["message"] = result.get("error", "Form submission failed")
                    return result
            else:
                if result:
                    logger.info("Form automation completed successfully!")
                    return {"success": True, "message": "Form submitted successfully"}
                else:
                    logger.error("Form automation failed!")
                    return {"success": False, "message": "Form submission failed"}

        except Exception as e:
            logger.exception("Error in automation: %s", str(e))
            return {"success": False, "message": f"Error: {str(e)}"}
