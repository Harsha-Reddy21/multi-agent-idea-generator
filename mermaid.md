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
    
    ENHANCE -->|document_suggestions| CONF[Confidence Agent]
    RESPOND -->|chat_response| CONF
    CONF -->|confidence_score| END([Response + optional document_content])
    
    style INTENT fill:#e1f5ff
    style ROUTE fill:#fff4e1
    style ENHANCE fill:#f3e5f5
    style RESPOND fill:#fce4ec
    style CONF fill:#fff9c4
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
    
    DocumentUpdater --> ConfidenceAgent
    ChatResponder --> ConfidenceAgent
    ConfidenceAgent --> [*]
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
| Review agents       | intent = review      | Parallel feedback → chat responder → confidence. |
| Confidence agent    | After respond or enhance | confidence_score (0–100). |
| Autocomplete agent  | Frontend 10s after doc change | Chat message + proposed document + new confidence (separate API). |
