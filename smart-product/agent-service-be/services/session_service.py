"""In-memory session store. Manages creation, retrieval, and updates of session state."""

from __future__ import annotations

import uuid
from typing import Any

from forms.registry import Block, form_registry
from models.schemas import SessionState


class SessionStore:
    def __init__(self):
        self._sessions: dict[str, SessionState] = {}

    def create_session(self, form_type: str, user_name: str = "User", user_email: str = "") -> SessionState:
        session_id = str(uuid.uuid4())

        # Build block structures
        blocks: dict[str, dict[str, dict[str, Any]]] = {
            Block.SYSTEM.value: {},
            Block.USER.value: {},
            Block.TECH.value: {},
        }
        questions = form_registry.get_questions_for_form(form_type)
        for q in questions:
            blocks[q.block.value][q.id] = {
                "label": q.label,
                "value": None,
                "filled": False,
            }

        # Initial pending questions (no conditional parents)
        pending = form_registry.get_base_questions(form_type)

        session = SessionState(
            session_id=session_id,
            form_type=form_type,
            user_name=user_name,
            user_email=user_email,
            pending_questions=pending,
            blocks=blocks,
        )

        # Set first question
        if pending:
            session.current_question_id = pending[0]

        self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> SessionState | None:
        return self._sessions.get(session_id)

    def update_answer(self, session_id: str, question_id: str, answer: str) -> None:
        session = self._sessions.get(session_id)
        if not session:
            return

        session.answers[question_id] = answer

        if question_id not in session.answered_questions:
            session.answered_questions.append(question_id)

        # Update block
        block_name = form_registry.get_block_for_question(question_id)
        if block_name and block_name in session.blocks and question_id in session.blocks[block_name]:
            session.blocks[block_name][question_id]["value"] = answer
            session.blocks[block_name][question_id]["filled"] = True

    def advance_to_next(self, session_id: str) -> str | None:
        session = self._sessions.get(session_id)
        if not session:
            return None

        # Find next unanswered question in pending
        for qid in session.pending_questions:
            if qid not in session.answered_questions and qid not in session.skipped_questions:
                session.current_question_id = qid
                return qid

        session.current_question_id = None
        session.status = "completed"
        return None

    def apply_conditionals(self, session_id: str, question_id: str, answer: str) -> tuple[list[str], list[str]]:
        """Evaluate conditional rules. Returns (added, removed) question IDs."""
        session = self._sessions.get(session_id)
        if not session:
            return [], []

        rules = form_registry.get_conditionals_for(question_id)
        added: list[str] = []
        removed: list[str] = []

        for rule in rules:
            answer_lower = answer.lower().strip()
            triggers = [v.lower() for v in rule.trigger_values]

            if any(t in answer_lower for t in triggers):
                for qid in rule.add_questions:
                    if qid not in session.pending_questions:
                        # Insert after the current question position
                        idx = session.pending_questions.index(question_id) + 1 if question_id in session.pending_questions else len(session.pending_questions)
                        session.pending_questions.insert(idx, qid)
                        session.active_conditionals.append(qid)
                        # Also register in blocks
                        q = form_registry.get(qid)
                        if q and q.block.value in session.blocks:
                            session.blocks[q.block.value][qid] = {
                                "label": q.label,
                                "value": None,
                                "filled": False,
                            }
                        added.append(qid)
                        idx += 1
            else:
                for qid in rule.remove_questions:
                    if qid in session.pending_questions:
                        session.pending_questions.remove(qid)
                    session.skipped_questions.append(qid)
                    removed.append(qid)

        return added, removed

    def get_block_state(self, session_id: str, block_name: str) -> dict:
        session = self._sessions.get(session_id)
        if not session:
            return {}
        fields = session.blocks.get(block_name, {})
        filled = sum(1 for f in fields.values() if f.get("filled"))
        return {
            "fields": fields,
            "filled_count": filled,
            "total_count": len(fields),
        }

    def add_conversation(self, session_id: str, role: str, content: str) -> None:
        session = self._sessions.get(session_id)
        if not session:
            return
        session.conversation.append({"role": role, "content": content})
        # Keep last 20 messages for context
        if len(session.conversation) > 20:
            session.conversation = session.conversation[-20:]


session_store = SessionStore()
