"""Pydantic models for API request/response and session state."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# API Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    session_id: str
    message: str
    message_type: str = "answer"  # answer | command


class QuestionPayload(BaseModel):
    id: str
    text: str
    q_type: str
    required: bool
    target_block: str
    target_field_label: str
    options: list[str] | None = None
    suggestions: list[str] = []
    ai_enabled: bool = False


class SuggestionsStatus(BaseModel):
    completed: list[str] = []
    required: list[str] = []
    score: float = 0.0


class ChatResponse(BaseModel):
    agent_message: str
    question: QuestionPayload | None = None
    system_info: dict[str, Any] = {}
    user_info: dict[str, Any] = {}


class SessionCreateRequest(BaseModel):
    form_type: str
    user_name: str = "User"
    user_email: str = ""


class SessionCreateResponse(BaseModel):
    session_id: str
    form_type: str
    first_message: str
    question: QuestionPayload | None = None


# ---------------------------------------------------------------------------
# WebSocket message types
# ---------------------------------------------------------------------------

class BlockUpdateMessage(BaseModel):
    type: str = "block_update"
    block: str
    fields: dict[str, dict[str, Any]]
    filled_count: int
    total_count: int


class ScoreUpdateMessage(BaseModel):
    type: str = "score_update"
    question_scores: dict[str, dict[str, Any]] = {}
    aggregate_score: float = 0.0
    penalty_multiplier: float = 1.0
    mandatory_below_threshold: list[str] = []
    questions_scored: int = 0
    questions_total: int = 0


# ---------------------------------------------------------------------------
# Session State
# ---------------------------------------------------------------------------

class SessionState(BaseModel):
    session_id: str
    form_type: str
    user_name: str = "User"
    user_email: str = ""
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

    # Question flow
    current_question_id: str | None = None
    pending_questions: list[str] = []
    answered_questions: list[str] = []
    skipped_questions: list[str] = []
    active_conditionals: list[str] = []  # Questions added via conditionals

    # Context for cross-block jumps
    paused_question_id: str | None = None  # The question we were on before a jump

    # Answers
    answers: dict[str, str] = {}

    # Scores (populated asynchronously)
    question_scores: dict[str, float] = {}
    question_analyses: dict[str, list[dict]] = {}
    aggregate_score: float = 0.0
    penalty_multiplier: float = 1.0
    novelty_score: float | None = None

    # Block field values { block_name: { question_id: { label, value, filled } } }
    blocks: dict[str, dict[str, dict[str, Any]]] = {}

    # Conversation history (for context to GPT)
    conversation: list[dict[str, str]] = []

    # Status
    status: str = "in_progress"  # in_progress | completed
