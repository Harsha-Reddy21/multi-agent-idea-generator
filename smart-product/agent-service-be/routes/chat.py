"""Chat route — single endpoint that drives the entire agent conversation."""

from fastapi import APIRouter

from agent.orchestrator import process_message
from models.schemas import ChatRequest, ChatResponse

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    return await process_message(
        session_id=request.session_id,
        message=request.message,
        message_type=request.message_type,
    )
