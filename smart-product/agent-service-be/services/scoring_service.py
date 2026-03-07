"""Scoring service — implements the Sage AI confidence score algorithm.

Layer 1: Per-question coverage scores (GPT evaluates answer vs suggestions)
Layer 2: Aggregate approval score (weighted combination + mandatory penalties)
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from config import settings
from forms.registry import form_registry
from models.schemas import SessionState
from services import openai_service
from services.websocket_manager import ws_manager

logger = logging.getLogger(__name__)


async def score_answer_and_push(session: SessionState, question_id: str) -> None:
    """Background task: score a single answer then recalculate aggregate and push via WS."""
    question = form_registry.get(question_id)
    if not question:
        return

    answer = session.answers.get(question_id, "")
    if not answer:
        return

    # --- Layer 1: Per-question coverage score ---
    suggestions = question.suggestions
    if suggestions:
        result = await openai_service.evaluate_coverage(answer, question.text, suggestions)
        score = result.get("score", 0.5)
        session.question_scores[question_id] = score
        session.question_analyses[question_id] = result.get("suggestions_analysis", [])
    else:
        # No suggestions → default full score
        session.question_scores[question_id] = 1.0
        session.question_analyses[question_id] = []

    # --- Layer 2: Aggregate approval score ---
    aggregate, penalty_multiplier, mandatory_below = calculate_aggregate(session)
    session.aggregate_score = aggregate
    session.penalty_multiplier = penalty_multiplier

    # --- Push via WebSocket ---
    score_data = {
        "type": "score_update",
        "question_scores": {
            question_id: {
                "score": round(session.question_scores[question_id], 4),
                "analysis": session.question_analyses.get(question_id, []),
            }
        },
        "aggregate_score": round(aggregate, 4),
        "penalty_multiplier": round(penalty_multiplier, 4),
        "mandatory_below_threshold": mandatory_below,
        "questions_scored": len(session.question_scores),
        "questions_total": len([
            q for q in session.pending_questions
            if q not in session.skipped_questions
        ]),
    }
    await ws_manager.send_score(session.session_id, score_data)

    # Also push block update
    block_name = form_registry.get_block_for_question(question_id)
    if block_name:
        block_state = _build_block_state(session, block_name)
        await ws_manager.send_block(session.session_id, block_state)


def calculate_aggregate(session: SessionState) -> tuple[float, float, list[str]]:
    """Sage AI algorithm: weighted base score × mandatory penalty multiplier."""
    form_type = session.form_type
    active_questions = [
        qid for qid in session.pending_questions
        if qid not in session.skipped_questions
    ]

    if not active_questions:
        return 0.0, 1.0, []

    # Collect weights for scored questions
    scored_weights: dict[str, float] = {}
    scored_confidences: dict[str, float] = {}

    for qid in active_questions:
        if qid in session.question_scores:
            scored_weights[qid] = form_registry.get_weight(qid)
            scored_confidences[qid] = session.question_scores[qid]

    if not scored_weights:
        return 0.0, 1.0, []

    # Step 1: Normalize weights to sum to 1.0
    total_weight = sum(scored_weights.values())
    if total_weight == 0:
        return 0.0, 1.0, []

    normalized: dict[str, float] = {qid: w / total_weight for qid, w in scored_weights.items()}

    # Step 2: Weighted base score
    base_score = sum(normalized[qid] * scored_confidences[qid] for qid in normalized)

    # Step 3: Mandatory penalties
    mandatory_qs = form_registry.get_mandatory_questions(form_type)
    penalty_multiplier = 1.0
    mandatory_below: list[str] = []

    for qid in mandatory_qs:
        if qid in session.skipped_questions:
            continue
        q_score = session.question_scores.get(qid, settings.default_mandatory_confidence)
        if q_score < settings.mandatory_threshold:
            penalty_multiplier *= (1.0 - settings.static_penalty)
            mandatory_below.append(qid)

    final_score = base_score * penalty_multiplier
    return round(final_score, 4), round(penalty_multiplier, 4), mandatory_below


def _build_block_state(session: SessionState, block_name: str) -> dict[str, Any]:
    fields = session.blocks.get(block_name, {})
    filled = sum(1 for f in fields.values() if f.get("filled"))
    return {
        "type": "block_update",
        "block": block_name,
        "fields": fields,
        "filled_count": filled,
        "total_count": len(fields),
    }
