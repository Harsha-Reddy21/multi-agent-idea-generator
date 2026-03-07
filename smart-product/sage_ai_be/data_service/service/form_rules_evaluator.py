"""
Form Rules Evaluation Service

Handles business logic for evaluating form rules against submission journey data
to determine form categories (recommended vs optional).
"""

import logging
from typing import List, Dict, Any

from data_service.constants.constants import FormType
from data_service.models.form_rules import FormRules

logger = logging.getLogger(__name__)


class FormRulesEvaluator:
    """Service for evaluating form rules against submission data."""

    @staticmethod
    def extract_answers_from_journey(
        submission_journey: Dict[str, Any], form_type: str
    ) -> Dict[str, Any]:
        """
        Extract answers map from submission journey.

        Args:
            submission_journey: User's answers from submission journey.
            form_type: Type of the form being evaluated.

        Returns:
            Dict mapping question IDs to answers.
        """
        answers_map = {}
        try:
            form_data = submission_journey.get("form_data", [])
            if not isinstance(form_data, list):
                logger.warning(
                    "Invalid submission_journey format for form '%s': "
                    "form_data is not a list, returning empty answers map",
                    form_type,
                )
                return answers_map

            for item in form_data:
                if not isinstance(item, dict):
                    continue
                question_id = item.get("questionId")
                answer_list = item.get("answer", [])
                # Store first answer if available
                if question_id and answer_list:
                    answers_map[question_id] = (
                        answer_list[0] if isinstance(answer_list, list) else answer_list
                    )
        except (KeyError, TypeError, AttributeError):
            logger.warning(
                "Error parsing submission_journey for form '%s', returning empty answers map",
                form_type,
                exc_info=True,
            )

        return answers_map

    @staticmethod
    def evaluate_single_rule(
        rule: FormRules, answers_map: Dict[str, Any]
    ) -> tuple[bool, str]:
        """
        Evaluate a single rule against the answers map.

        Args:
            rule: The form rule to evaluate.
            answers_map: Dictionary mapping question IDs to user answers.

        Returns:
            Tuple of (matches: bool, category: str)
        """
        condition_json = rule.condition_json
        rule_category = rule.category

        # Check if all conditions in the rule match
        all_conditions_match = True
        for question_id, expected_answer in condition_json.items():
            user_answer = answers_map.get(question_id)
            if user_answer != expected_answer:
                all_conditions_match = False
                break

        return all_conditions_match, rule_category

    @classmethod
    def evaluate_form_rules(
        cls,
        form_rules: List[FormRules],
        submission_journey: Dict[str, Any],
        form_type: str,
    ) -> str:
        """
        Evaluate form rules against submission journey to determine form category.

        Args:
            form_rules: List of rules for the form.
            submission_journey: User's answers from submission journey.
            form_type: Type of the form being evaluated.

        Returns:
            str: "recommended", "optional", or "exclude" based on matching rules.

        Logic:
            - If any rule matches and has category "recommended", return "recommended" (takes precedence).
            - If any rule matches and has category "optional", return "optional".
            - If no rules match for wwtp-form or wwtp-new-vendor-form, return "exclude".
            - If no rules match for other forms, return "optional" (default).
        """
        # Special handling: WWTP forms should not default to optional
        wwtp_forms = [FormType.WWTP, FormType.WWTP_NEW_VENDOR]

        if not form_rules:
            if form_type in wwtp_forms:
                logger.info(
                    "No rules found for WWTP form '%s', returning 'exclude'", form_type
                )
                return "exclude"
            logger.info(
                "No rules found for form type '%s', defaulting to 'optional'", form_type
            )
            return "optional"

        # Extract answers from submission_journey
        answers_map = cls.extract_answers_from_journey(submission_journey, form_type)

        logger.info(
            "Evaluating %d rules for form type '%s'", len(form_rules), form_type
        )
        logger.debug("Extracted answers: %s", answers_map)

        # Track matched categories
        matched_recommended = False
        matched_optional = False

        for rule in form_rules:
            matches, category = cls.evaluate_single_rule(rule, answers_map)

            if matches:
                logger.info(
                    "Rule matched for form '%s': conditions=%s, category=%s",
                    form_type,
                    rule.condition_json,
                    category,
                )
                if category == "recommended":
                    matched_recommended = True
                elif category == "optional":
                    matched_optional = True

        # Recommended takes precedence over optional
        if matched_recommended:
            logger.info(
                "Form '%s' determined as 'recommended' (precedence rule applied)",
                form_type,
            )
            return "recommended"
        elif matched_optional:
            logger.info("Form '%s' determined as 'optional' (rule matched)", form_type)
            return "optional"
        else:
            # Special handling: WWTP forms should not default to optional
            if form_type in wwtp_forms:
                logger.info(
                    "No rules matched for WWTP form '%s', returning 'exclude'",
                    form_type,
                )
                return "exclude"
            logger.info(
                "No rules matched for form '%s', defaulting to 'optional'", form_type
            )
            return "optional"
