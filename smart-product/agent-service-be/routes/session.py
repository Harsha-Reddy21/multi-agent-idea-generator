"""Session routes — create and query sessions."""

from fastapi import APIRouter, HTTPException

from agent.orchestrator import _question_to_payload, _build_system_info, _build_user_info
from forms.registry import form_registry
from models.schemas import SessionCreateRequest, SessionCreateResponse
from services.session_service import session_store

router = APIRouter(tags=["session"])


@router.post("/session", response_model=SessionCreateResponse)
async def create_session(request: SessionCreateRequest):
    if request.form_type not in form_registry.list_form_types():
        raise HTTPException(status_code=400, detail=f"Unknown form type: {request.form_type}")

    session = session_store.create_session(
        form_type=request.form_type,
        user_name=request.user_name,
        user_email=request.user_email,
    )

    # Build welcome message
    first_q = form_registry.get(session.current_question_id) if session.current_question_id else None
    welcome = (
        f"Welcome, {session.user_name}! Let's get started with your "
        f"**{request.form_type.replace('-', ' ').title()}** submission.\n\n"
    )
    if first_q:
        welcome += f"First question: *{first_q.text}*"
        if first_q.options:
            welcome += f"\n\nOptions: {', '.join(first_q.options)}"

    session_store.add_conversation(session.session_id, "assistant", welcome)

    return SessionCreateResponse(
        session_id=session.session_id,
        form_type=session.form_type,
        first_message=welcome,
        question=_question_to_payload(session.current_question_id) if session.current_question_id else None,
    )


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session.session_id,
        "form_type": session.form_type,
        "status": session.status,
        "system_info": _build_system_info(session),
        "user_info": _build_user_info(session),
        "blocks": {
            block_name: {
                "fields": fields,
                "filled_count": sum(1 for f in fields.values() if f.get("filled")),
                "total_count": len(fields),
            }
            for block_name, fields in session.blocks.items()
        },
        "scores": {
            "aggregate_score": session.aggregate_score,
            "question_scores": session.question_scores,
            "penalty_multiplier": session.penalty_multiplier,
        },
    }


@router.get("/session/{session_id}/blocks/{block_name}")
async def get_block(session_id: str, block_name: str):
    state = session_store.get_block_state(session_id, block_name)
    if not state:
        raise HTTPException(status_code=404, detail="Session or block not found")
    return state


@router.get("/forms")
async def list_forms():
    return {"form_types": form_registry.list_form_types()}
