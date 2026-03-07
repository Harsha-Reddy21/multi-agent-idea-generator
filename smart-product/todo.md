# Agentic AI Application — Build Checklist

## Backend (agent-service-be)
- [ ] 1. Project scaffold (main.py, requirements.txt, .env, folder structure)
- [ ] 2. Form registry — all 143+ questions with types, options, conditionals, suggestions, weights
- [ ] 3. Session state machine + Pydantic models
- [ ] 4. OpenAI service (conversation, enhancement, coverage scoring)
- [ ] 5. Scoring service (Sage AI algorithm — per-question + aggregate + penalties)
- [ ] 6. Agent orchestrator (intent classification, suggestions loop, cross-block jumps)
- [ ] 7. Routes — POST /chat, POST /session, WebSocket /ws/blocks, /ws/scores

## Frontend (agent-service-fe)
- [ ] 8. Project scaffold (Vite + React + TypeScript)
- [ ] 9. Types + API service (Axios client)
- [ ] 10. Session context + WebSocket hooks (useChat, useScoreStream, useBlockStream)
- [ ] 11. ChatPanel (MessageBubble, InputBar, ChoiceSelector, SuggestionsDisplay)
- [ ] 12. ContentBlock panels (SystemInfo, UserInfo, TechInfo with ScoreGauge)
- [ ] 13. App layout + SCSS styling (left panels 40%, right chat 60%)

## Integration
- [ ] 14. End-to-end test