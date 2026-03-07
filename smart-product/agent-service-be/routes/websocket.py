"""WebSocket routes — separate channels for block updates and score updates."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.websocket_manager import ws_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/scores/{session_id}")
async def ws_scores(websocket: WebSocket, session_id: str):
    await ws_manager.connect_scores(session_id, websocket)
    try:
        while True:
            # Keep connection alive — client doesn't send data on this channel
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_scores(session_id, websocket)


@router.websocket("/blocks/{session_id}")
async def ws_blocks(websocket: WebSocket, session_id: str):
    await ws_manager.connect_blocks(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_blocks(session_id, websocket)
