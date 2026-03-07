"""WebSocket connection manager — manages per-session connections for blocks and scores."""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    def __init__(self):
        # session_id → list of WebSocket connections
        self._score_connections: dict[str, list[WebSocket]] = {}
        self._block_connections: dict[str, list[WebSocket]] = {}

    async def connect_scores(self, session_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._score_connections.setdefault(session_id, []).append(ws)

    async def connect_blocks(self, session_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._block_connections.setdefault(session_id, []).append(ws)

    def disconnect_scores(self, session_id: str, ws: WebSocket) -> None:
        conns = self._score_connections.get(session_id, [])
        if ws in conns:
            conns.remove(ws)

    def disconnect_blocks(self, session_id: str, ws: WebSocket) -> None:
        conns = self._block_connections.get(session_id, [])
        if ws in conns:
            conns.remove(ws)

    async def send_score(self, session_id: str, data: dict[str, Any]) -> None:
        conns = self._score_connections.get(session_id, [])
        dead: list[WebSocket] = []
        for ws in conns:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            conns.remove(ws)

    async def send_block(self, session_id: str, data: dict[str, Any]) -> None:
        conns = self._block_connections.get(session_id, [])
        dead: list[WebSocket] = []
        for ws in conns:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            conns.remove(ws)


ws_manager = WebSocketManager()
