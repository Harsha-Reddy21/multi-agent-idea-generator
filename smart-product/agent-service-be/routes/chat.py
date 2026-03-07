"""Chat route — single endpoint that drives the entire agent conversation."""

import logging
from fastapi import APIRouter, HTTPException

from agent.orchestrator import process_message
from models.schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        return await process_message(
            session_id=request.session_id,
            message=request.message,
            message_type=request.message_type,
        )
    except Exception:
        logger.exception("Chat endpoint error")
        raise HTTPException(status_code=500, detail="Internal error processing message")
