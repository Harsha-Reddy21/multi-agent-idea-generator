# Agent Architecture - Mermaid Diagrams

## Intent Taxonomy

Every user message is classified into exactly one intent:

| Intent       | Description |
|-------------|-------------|
| **irrelevant** | Greetings, casual chat, off-topic. |
| **chat**       | Questions about the app/document/review (no document change). |
| **update**     | Create, update, or enhance the document (from scratch, sections, or lines). |
| **review**     | Review/validate the document (runs parallel review agents). |

---

## Agent Graph Flow (Intent-Driven)

This graph is invoked on **POST /api/chat** with `user_query`, `document`, and `chat_history`.

```mermaid
graph TB
    START([User message]) --> INTENT[Intent Classifier]
    INTENT -->|LLM: intent, relevance, ambiguity| ROUTE{Router}
    
    ROUTE -->|irrelevant| RESPOND[Chat Responder]
    ROUTE -->|chat| RESPOND
    ROUTE -->|update| ENHANCE[Document Update Agent]
    ROUTE -->|review| REVIEW_START[Review Start]
    
    subgraph review["Review path"]
        REVIEW_START --> SOL[Solution Agent]
        REVIEW_START --> AI[AI Registry Agent]
        REVIEW_START --> LEGAL[Legal Agent]
        REVIEW_START --> SEC[Security Agent]
        REVIEW_START --> TP[Third Party Agent]
        SOL --> COLLECTOR[Review Collector]
        AI --> COLLECTOR
        LEGAL --> COLLECTOR
        SEC --> COLLECTOR
        TP --> COLLECTOR
        COLLECTOR --> RESPOND
    end
    
    ENHANCE -->|document_suggestions| CONF_SCORE[Confidence Scorer]
    RESPOND -->|chat_response| CONF_SCORE
    CONF_SCORE -->|confidence_score| END([Response + optional document_content])
    
    style INTENT fill:#e1f5ff
    style ROUTE fill:#fff4e1
    style ENHANCE fill:#f3e5f5
    style RESPOND fill:#fce4ec
    style CONF_SCORE fill:#fff9c4
```

---

## Agent State Flow (Intent-Driven)

```mermaid
stateDiagram-v2
    [*] --> IntentClassifier
    
    IntentClassifier --> Router
    
    Router --> ReviewStart: review
    Router --> DocumentUpdater: update
    Router --> ChatResponder: chat
    Router --> ChatResponder: irrelevant
    
    state "Review path" as review {
        ReviewStart --> SolutionAgent
        ReviewStart --> AIRegistryAgent
        ReviewStart --> LegalAgent
        ReviewStart --> SecurityAgent
        ReviewStart --> ThirdPartyAgent
        SolutionAgent --> ReviewCollector
        AIRegistryAgent --> ReviewCollector
        LegalAgent --> ReviewCollector
        SecurityAgent --> ReviewCollector
        ThirdPartyAgent --> ReviewCollector
        ReviewCollector --> ChatResponder
    }
    
    DocumentUpdater --> ConfidenceScorer
    ChatResponder --> ConfidenceScorer
    ConfidenceScorer --> [*]
```

---

## Evaluate Flow — Confidence Agent (Separate from Chat)

The **Confidence Agent** is a separate flow triggered by the **"Evaluate" button** in the UI and invoked via **POST /api/evaluate**. It uses the same review sub-agents (Solution, AI Registry, Legal, Security, Third Party) to produce **scores** based on their feedback—similar to the review path but with scores instead of a chat summary.

- **Trigger:** User clicks **Evaluate** → API call with current document.
- **Flow:** Runs all five review sub-agents in parallel → **Confidence Agent** aggregates their feedback and computes section-level and/or overall scores.
- **Output:** Scores (per section or overall) for display in the UI.

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant API as POST /api/evaluate
    participant Svc as Evaluate Service
    participant SOL as Solution Agent
    participant AI as AI Registry Agent
    participant LEGAL as Legal Agent
    participant SEC as Security Agent
    participant TP as Third Party Agent
    participant CONF as Confidence Agent
    
    Note over UI: User clicks Evaluate button
    UI->>API: POST { document_content }
    API->>Svc: evaluate(document_content)
    
    par Parallel review
        Svc->>SOL: review
        Svc->>AI: review
        Svc->>LEGAL: review
        Svc->>SEC: review
        Svc->>TP: review
    end
    
    SOL-->>Svc: solution_feedback
    AI-->>Svc: ai_registry_feedback
    LEGAL-->>Svc: legal_feedback
    SEC-->>Svc: security_feedback
    TP-->>Svc: third_party_feedback
    
    Svc->>CONF: Confidence Agent (aggregate feedback → scores)
    CONF->>CONF: Compute scores from sub-agent outputs
    CONF-->>Svc: section_scores, overall_score
    
    Svc-->>API: scores response
    API-->>UI: Display scores (e.g. per-section, overall)
```

```mermaid
graph TB
    EVAL_BTN([Evaluate button]) -->|POST /api/evaluate| API[Backend API]
    API --> EVAL_START[Evaluate Start]
    
    subgraph subagents["Review sub-agents (parallel)"]
        EVAL_START --> ESOL[Solution Agent]
        EVAL_START --> EAI[AI Registry Agent]
        EVAL_START --> ELEGAL[Legal Agent]
        EVAL_START --> ESEC[Security Agent]
        EVAL_START --> ETP[Third Party Agent]
        ESOL --> ECOL[Collector]
        EAI --> ECOL
        ELEGAL --> ECOL
        ESEC --> ECOL
        ETP --> ECOL
    end
    
    ECOL --> CONF_AGENT[Confidence Agent]
    CONF_AGENT -->|scores from sub-agent feedback| SCORES[section_scores + overall_score]
    SCORES --> UI_DISPLAY([Display in UI])
    
    style CONF_AGENT fill:#fff9c4,stroke:#f57f17
    style EVAL_BTN fill:#e8f5e9
```

---

## Autocomplete Flow (Separate from Intent Graph)

The **Autocomplete Agent** is **not** in the main graph. It is triggered by the **frontend** ~10 seconds after the document content changes, and called via **POST /api/autocomplete** with only the current document.

- **Input:** `document_content` (current editor HTML).
- **Output:** Chat message (gaps/suggestions), proposed document HTML (accept/reject in UI), updated confidence score.

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant API as POST /api/autocomplete
    participant Svc as ChatService.get_autocomplete
    participant Agent as autocomplete_agent
    
    Note over UI: User edits document
    UI->>UI: 10s debounce on documentContent
    UI->>API: POST { document_content }
    API->>Svc: get_autocomplete(document_content)
    Svc->>Svc: _parse_html_to_sections
    Svc->>Agent: autocomplete_agent(state)
    Agent->>Agent: LLM: suggestions + confidence
    Agent-->>Svc: document_suggestions, confidence_score
    Svc->>Svc: _sections_to_html(suggestions)
    Svc-->>API: response, document_content, confidence_score
    API-->>UI: AutocompleteResponse
    UI->>UI: Append message to chat
    UI->>UI: Update confidence score
    UI->>UI: onProposeChanges(document_content)
```

```mermaid
graph LR
    DOC[Document changed] -->|~10s debounce| UI[Frontend]
    UI -->|POST /api/autocomplete| API[Backend]
    API --> AUTO[Autocomplete Agent]
    AUTO -->|LLM| SUG[document_suggestions + confidence_score]
    SUG --> CHAT[Message in chat]
    SUG --> PROP[Proposed changes in editor]
    SUG --> CONF[Confidence score updated]
```

---

## Summary

| Component            | Trigger              | Result |
|---------------------|----------------------|--------|
| Intent classifier   | Every /api/chat      | Routes to respond / enhance / review_start. |
| Chat responder      | irrelevant, chat, or after review | Chat message (with document + history context). |
| Document updater    | intent = update      | document_suggestions → HTML → UI proposed changes. |
| Review agents       | intent = review      | Parallel feedback → chat responder → confidence scorer. |
| Confidence scorer   | After respond or enhance (in chat flow) | confidence_score (0–100) from relevance + ambiguity. |
| **Confidence agent**| **Evaluate button → POST /api/evaluate** | **Runs review sub-agents → aggregates feedback → produces section/overall scores.** |
| Autocomplete agent  | Frontend 10s after doc change | Chat message + proposed document + new confidence (separate API). |
