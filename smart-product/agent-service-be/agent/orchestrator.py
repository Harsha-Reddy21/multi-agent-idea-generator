"""Agent orchestrator — the core brain that processes messages, classifies intent,
manages suggestions loops, handles cross-block jumps, and drives the conversation."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from config import settings
from forms.registry import form_registry
from models.schemas import (
    ChatResponse,
    QuestionPayload,
    SessionState,
)
from services import openai_service
from services.scoring_service import score_answer_and_push
from services.session_service import session_store

logger = logging.getLogger(__name__)


def _question_to_payload(question_id: str) -> QuestionPayload | None:
    q = form_registry.get(question_id)
    if not q:
        return None
    return QuestionPayload(
        id=q.id,
        text=q.text,
        q_type=q.q_type.value,
        required=q.required,
        target_block=q.block.value,
        target_field_label=q.label,
        options=q.options,
        suggestions=q.suggestions,
        ai_enabled=q.ai_enabled,
    )


def _answered_summary(session: SessionState) -> str:
    parts = []
    for qid in session.answered_questions[-10:]:
        q = form_registry.get(qid)
        label = q.label if q else qid
        answer = session.answers.get(qid, "")
        short = answer[:60] + "..." if len(answer) > 60 else answer
        parts.append(f"{label}: {short}")
    return "\n".join(parts) if parts else "None yet"


def _build_system_info(session: SessionState) -> dict[str, Any]:
    answered = len(session.answered_questions)
    total = len([
        q for q in session.pending_questions
        if q not in session.skipped_questions
    ])
    return {
        "form_type": session.form_type,
        "questions_answered": answered,
        "total_questions": total,
        "progress_pct": round(answered / total * 100) if total > 0 else 0,
        "status": session.status,
    }


def _build_user_info(session: SessionState) -> dict[str, Any]:
    return {
        "user_name": session.user_name,
        "user_email": session.user_email,
        "submission_id": session.session_id[:8],
    }


async def process_message(session_id: str, message: str, message_type: str = "answer") -> ChatResponse:
    session = session_store.get_session(session_id)
    if not session:
        return ChatResponse(agent_message="Session not found. Please start a new session.")

    # Record user message
    session_store.add_conversation(session_id, "user", message)

    # If session is completed
    if session.status == "completed" and message_type == "answer":
        return ChatResponse(
            agent_message="All questions have been answered! Your submission is complete.",
            system_info=_build_system_info(session),
            user_info=_build_user_info(session),
        )

    # --- Handle action commands from suggestions loop BEFORE intent classification ---
    # (Removed — suggestions are now handled as natural follow-up questions)

    # Get current question context
    current_q = form_registry.get(session.current_question_id) if session.current_question_id else None

    # --- Intent Classification ---
    if current_q:
        intent = await openai_service.classify_intent(
            user_message=message,
            current_question_text=current_q.text,
            current_question_id=current_q.id,
            answered_summary=_answered_summary(session),
        )
    else:
        intent = {"type": "ANSWER_CURRENT", "target": ""}

    intent_type = intent["type"]
    intent_target = intent.get("target", "")

    logger.info(f"Intent: {intent_type} target={intent_target}")

    # --- Handle each intent ---

    if intent_type == "ANSWER_CURRENT":
        return await _handle_answer(session, session.current_question_id, message)

    elif intent_type == "EDIT_FIELD":
        return await _handle_edit_field(session, intent_target, message)

    elif intent_type == "ASK_ABOUT":
        return await _handle_ask_about(session, intent_target, message)

    elif intent_type == "ASK_HELP":
        return await _handle_help(session, message)

    elif intent_type == "ASK_GENERAL":
        return await _handle_general(session, message)

    elif intent_type == "COMMAND_SKIP":
        return await _handle_skip(session)

    elif intent_type == "COMMAND_BACK":
        return await _handle_back(session)

    elif intent_type == "COMMAND_ENHANCE":
        return await _handle_enhance(session)

    elif intent_type == "COMMAND_STATUS":
        return _handle_status(session)

    else:  # UNCLEAR or unrecognized
        return await _handle_unclear(session)


# ---------------------------------------------------------------------------
# Intent handlers
# ---------------------------------------------------------------------------

async def _handle_answer(session: SessionState, question_id: str, answer: str) -> ChatResponse:
    """Process an answer: store → suggestions check → conditional eval → next question.
    
    When coverage is low, the agent asks a natural follow-up question about
    the missing suggestions rather than presenting buttons or a checklist.
    The question stays current so subsequent answers update/improve it.
    """
    question = form_registry.get(question_id)
    if not question:
        return ChatResponse(agent_message="Something went wrong. Let me try the next question.")

    # Validate select/multiselect options
    if question.options and question.q_type.value in ("select", "radio"):
        matched = _match_option(answer, question.options)
        if matched:
            answer = matched
        else:
            options_str = ", ".join(question.options)
            return ChatResponse(
                agent_message=f"Please select one of the available options: {options_str}",
                question=_question_to_payload(question_id),
                system_info=_build_system_info(session),
                user_info=_build_user_info(session),
            )

    # If user already answered this question, combine with previous answer
    existing_answer = session.answers.get(question_id)
    if existing_answer:
        answer = f"{existing_answer}\n\n{answer}"

    # Store the answer
    session_store.update_answer(session.session_id, question_id, answer)

    # Evaluate conditionals
    added, removed = session_store.apply_conditionals(session.session_id, question_id, answer)

    # If question has suggestions → evaluate coverage
    suggestions = question.suggestions

    if suggestions and question.ai_enabled:
        coverage = await openai_service.evaluate_coverage(answer, question.text, suggestions)
        required = [s["text"] for s in coverage.get("suggestions_analysis", []) if s.get("status") == "required"]
        score = coverage.get("score", 0.5)

        if score < settings.coverage_accept_threshold and required:
            # Coverage insufficient — ask a natural follow-up question
            missing_text = "\n".join(f"  - {r}" for r in required)
            agent_msg = await openai_service.generate_agent_response(
                context_message=(
                    f"The user answered the question '{question.text}' with: \"{answer}\"\n"
                    f"Their answer is good but doesn't fully address these aspects:\n{missing_text}\n\n"
                    f"Ask ONE natural follow-up question that helps the user elaborate on "
                    f"the most important missing aspect. Do NOT list what's missing. "
                    f"Do NOT offer buttons or choices like improve/enhance/accept. "
                    f"Just ask a conversational follow-up question. If the user wants to "
                    f"move on, they can say 'skip' or 'next'."
                ),
                form_type=session.form_type,
                answered_count=len(session.answered_questions),
                total_count=len(session.pending_questions),
                conversation_history=session.conversation,
            )
            session_store.add_conversation(session.session_id, "assistant", agent_msg)

            # Fire background scoring for the partial answer
            asyncio.create_task(score_answer_and_push(session, question_id))

            # Keep the same question as current — next answer will augment it
            return ChatResponse(
                agent_message=agent_msg,
                question=_question_to_payload(question_id),
                system_info=_build_system_info(session),
                user_info=_build_user_info(session),
            )

    # Fire background scoring task (pushes via WebSocket)
    asyncio.create_task(score_answer_and_push(session, question_id))

    # Advance to next question
    next_qid = session_store.advance_to_next(session.session_id)

    if next_qid is None:
        agent_msg = await openai_service.generate_agent_response(
            context_message="All questions have been answered. Congratulate the user and let them know the submission is complete.",
            form_type=session.form_type,
            answered_count=len(session.answered_questions),
            total_count=len(session.pending_questions),
            conversation_history=session.conversation,
        )
        session_store.add_conversation(session.session_id, "assistant", agent_msg)
        return ChatResponse(
            agent_message=agent_msg,
            system_info=_build_system_info(session),
            user_info=_build_user_info(session),
        )

    # Generate agent response introducing next question
    next_q = form_registry.get(next_qid)
    agent_msg = await openai_service.generate_agent_response(
        context_message=(
            f"The user just answered '{question.text}'. Acknowledge briefly. "
            f"Now ask the next question: '{next_q.text}'"
            + (f"\nAvailable options: {', '.join(next_q.options)}" if next_q.options else "")
        ),
        form_type=session.form_type,
        answered_count=len(session.answered_questions),
        total_count=len(session.pending_questions),
        conversation_history=session.conversation,
    )
    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(next_qid),
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


async def _handle_edit_field(session: SessionState, target: str, message: str) -> ChatResponse:
    """User wants to edit a previously filled field."""
    # Try to find the question by ID or label
    question_id = _resolve_question(session, target)
    if not question_id or question_id not in session.answers:
        return ChatResponse(
            agent_message=f"I couldn't find that field. Could you be more specific about which answer you want to change?",
            question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
            system_info=_build_system_info(session),
            user_info=_build_user_info(session),
        )

    q = form_registry.get(question_id)
    old_answer = session.answers[question_id]

    # Save where we were
    session.paused_question_id = session.current_question_id
    session.current_question_id = question_id

    agent_msg = f"Your current answer for **{q.label}** is:\n\n> {old_answer}\n\nWhat would you like to change it to?"
    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(question_id),
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


async def _handle_ask_about(session: SessionState, block_name: str, message: str) -> ChatResponse:
    """User asks about a field in a different block."""
    # Get the block fields and their current values
    block_data = session.blocks.get(block_name, {})
    filled_fields = {qid: f for qid, f in block_data.items() if f.get("filled")}
    empty_fields = {qid: f for qid, f in block_data.items() if not f.get("filled")}

    summary_parts = []
    if filled_fields:
        for qid, f in filled_fields.items():
            val = f["value"]
            short = val[:80] + "..." if isinstance(val, str) and len(val) > 80 else val
            summary_parts.append(f"• **{f['label']}**: {short}")
    if empty_fields:
        summary_parts.append(f"\n*{len(empty_fields)} fields not yet filled.*")

    block_label = block_name.replace("_", " ").title()
    summary = "\n".join(summary_parts) if summary_parts else "No fields filled yet."

    current_q = form_registry.get(session.current_question_id)
    current_text = current_q.text if current_q else ""

    agent_msg = (
        f"Here's what's in your **{block_label}**:\n\n{summary}\n\n"
        f"Would you like to edit anything? Otherwise, let's continue with: *{current_text}*"
    )
    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


async def _handle_help(session: SessionState, message: str) -> ChatResponse:
    """User needs help with the current question."""
    q = form_registry.get(session.current_question_id) if session.current_question_id else None
    if not q:
        return ChatResponse(agent_message="No current question to help with.")

    help_parts = [f"**{q.text}**\n"]
    if q.suggestions:
        help_parts.append("Here's what a good answer should cover:")
        for s in q.suggestions:
            help_parts.append(f"  • {s}")
    if q.options:
        help_parts.append(f"\nAvailable options: {', '.join(q.options)}")

    agent_msg = "\n".join(help_parts)
    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(session.current_question_id),
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


async def _handle_general(session: SessionState, message: str) -> ChatResponse:
    """General question about the process."""
    form_context = f"Form type: {session.form_type}, Progress: {len(session.answered_questions)}/{len(session.pending_questions)}"
    answer = await openai_service.answer_general_question(message, form_context)

    current_q = form_registry.get(session.current_question_id)
    if current_q:
        answer += f"\n\nWhenever you're ready, let's continue: *{current_q.text}*"

    session_store.add_conversation(session.session_id, "assistant", answer)

    return ChatResponse(
        agent_message=answer,
        question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


async def _handle_skip(session: SessionState) -> ChatResponse:
    """Skip current question."""
    current_q = form_registry.get(session.current_question_id) if session.current_question_id else None
    if current_q and current_q.required:
        return ChatResponse(
            agent_message=f"**{current_q.label}** is required and can't be skipped. Want some help answering it?",
            question=_question_to_payload(session.current_question_id),
            system_info=_build_system_info(session),
            user_info=_build_user_info(session),
        )

    if session.current_question_id:
        session.skipped_questions.append(session.current_question_id)

    next_qid = session_store.advance_to_next(session.session_id)
    if next_qid:
        next_q = form_registry.get(next_qid)
        agent_msg = f"Skipped. Next question: *{next_q.text}*"
        if next_q.options:
            agent_msg += f"\n\nOptions: {', '.join(next_q.options)}"
    else:
        agent_msg = "That was the last question! Your submission is complete."

    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(next_qid) if next_qid else None,
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


async def _handle_back(session: SessionState) -> ChatResponse:
    """Go to previous question."""
    if not session.answered_questions:
        return ChatResponse(
            agent_message="No previous questions to go back to.",
            question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
            system_info=_build_system_info(session),
            user_info=_build_user_info(session),
        )

    prev_qid = session.answered_questions[-1]
    q = form_registry.get(prev_qid)
    old_answer = session.answers.get(prev_qid, "Not answered")

    session.paused_question_id = session.current_question_id
    session.current_question_id = prev_qid

    agent_msg = f"Going back to **{q.label}**. Your answer was:\n\n> {old_answer}\n\nWould you like to change it?"
    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(prev_qid),
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


async def _handle_enhance(session: SessionState) -> ChatResponse:
    """Enhance the last answered question."""
    if not session.answered_questions:
        return ChatResponse(
            agent_message="No answer to enhance yet.",
            system_info=_build_system_info(session),
            user_info=_build_user_info(session),
        )

    last_qid = session.answered_questions[-1]
    q = form_registry.get(last_qid)
    answer = session.answers.get(last_qid, "")

    if len(answer) < 25:
        return ChatResponse(
            agent_message="The answer is too short to enhance (minimum 25 characters). Could you provide more detail first?",
            question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
            system_info=_build_system_info(session),
            user_info=_build_user_info(session),
        )

    enhanced = await openai_service.enhance_answer(answer, q.text, q.suggestions)
    enhanced_text = enhanced.get("enhanced_text", answer)
    rationale = enhanced.get("rationale", "")

    agent_msg = (
        f"Here's an enhanced version of your answer for **{q.label}**:\n\n"
        f"> {enhanced_text}\n\n"
        f"**Rationale:** {rationale}\n\n"
        f"Would you like to accept this enhanced version? (Yes/No)"
    )
    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    # Temporarily store enhanced text for acceptance
    session.answers[f"_enhanced_{last_qid}"] = enhanced_text

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


def _handle_status(session: SessionState) -> ChatResponse:
    """Show current progress."""
    answered = len(session.answered_questions)
    total = len(session.pending_questions)
    skipped = len(session.skipped_questions)
    score = session.aggregate_score

    lines = [
        f"**Progress: {answered}/{total} questions answered**",
        f"Skipped: {skipped}",
        f"Confidence Score: {score:.0%}",
        "",
    ]

    for block_name in ["system_info", "user_info", "tech_info"]:
        block = session.blocks.get(block_name, {})
        filled = sum(1 for f in block.values() if f.get("filled"))
        label = block_name.replace("_", " ").title()
        lines.append(f"  {label}: {filled}/{len(block)} fields")

    agent_msg = "\n".join(lines)
    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


async def _handle_unclear(session: SessionState) -> ChatResponse:
    """Handle unclear messages."""
    current_q = form_registry.get(session.current_question_id) if session.current_question_id else None
    q_text = f"**{current_q.text}**" if current_q else "the next question"

    agent_msg = (
        f"I didn't quite catch that. I'm currently asking:\n\n{q_text}\n\n"
        f"You can:\n"
        f"• Answer the question above\n"
        f"• Say **help** for guidance\n"
        f"• Say **skip** to skip (if optional)\n"
        f"• Say **back** to revisit a previous answer\n"
        f"• Say **status** to see progress\n"
        f"• Ask me anything about the process"
    )
    session_store.add_conversation(session.session_id, "assistant", agent_msg)

    return ChatResponse(
        agent_message=agent_msg,
        question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
        system_info=_build_system_info(session),
        user_info=_build_user_info(session),
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _match_option(answer: str, options: list[str]) -> str | None:
    answer_lower = answer.lower().strip()
    for opt in options:
        if opt.lower() == answer_lower:
            return opt
    # Partial match
    for opt in options:
        if answer_lower in opt.lower() or opt.lower() in answer_lower:
            return opt
    return None


def _resolve_question(session: SessionState, target: str) -> str | None:
    """Try matching target to a question ID or label."""
    target_lower = target.lower().strip()
    # Direct ID match
    if form_registry.get(target):
        return target
    # Label match across blocks
    for block_name, fields in session.blocks.items():
        for qid, field_data in fields.items():
            if field_data.get("label", "").lower() == target_lower:
                return qid
    return None


