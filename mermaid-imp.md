# Cortex Implementation — Agent Hierarchy (Mermaid Diagrams)

This document describes the **Cortex Agentic V2** implementation of the Idea Generator. The architecture uses a **root supervisor** that routes to **three child agents** based on user intent.

---

## Agent Hierarchy

```
Root Supervisor (agent-chain)
    ├── Update Agent     (agentic-model) — create/update/enhance document
    ├── Review Agent     (agentic-model) — validate document via 5 section reviewers
    └── Conversational Agent — irrelevant/chat; direct response (no child agent)
```

---

## Hierarchy Diagram

```mermaid
graph TB
    subgraph root["Root Supervisor (agent-chain)"]
        SUP[Supervisor LLM<br/>Classifies intent → routes to child]
    end
    
    subgraph children["Child Agents (agentic-model)"]
        UPDATE[Update Agent<br/>✏️ Document create/update/enhance]
        REVIEW[Review Agent<br/>📋 Validate via 5 section reviewers]
    end
    
    CONV[Conversational Agent<br/>💬 Direct response — no tool]
    
    SUP -->|intent = update| UPDATE
    SUP -->|intent = review| REVIEW
    SUP -->|intent = irrelevant<br/>or chat| CONV
    
    subgraph update_tools["Update Agent tools"]
        DOC_UPDATE[document_update]
    end
    
    subgraph review_tools["Review Agent tools"]
        SOL[review_solution]
        AI[review_ai_registry]
        LEGAL[review_legal]
        SEC[review_security]
        TP[review_third_party]
    end
    
    UPDATE --> DOC_UPDATE
    REVIEW --> SOL
    REVIEW --> AI
    REVIEW --> LEGAL
    REVIEW --> SEC
    REVIEW --> TP
    
    style SUP fill:#e1f5ff,stroke:#01579b
    style UPDATE fill:#f3e5f5,stroke:#4a148c
    style REVIEW fill:#e8f5e9,stroke:#1b5e20
    style CONV fill:#fce4ec,stroke:#880e4f
```

---

## Request Flow (Sequence)

```mermaid
sequenceDiagram
    participant User
    participant App as Frontend/Backend
    participant Cortex as /model/ask/{model}
    participant Sup as Root Supervisor
    participant Upd as Update Agent
    participant Rev as Review Agent
    
    User->>App: Message + document + chat_history
    App->>Cortex: q = "Document: ... Chat: ... User: ..."
    
    Cortex->>Sup: Invoke supervisor with question
    
    alt intent = update
        Sup->>Upd: Handoff (document + user_query)
        Upd->>Upd: Call document_update tool
        Upd-->>Sup: document_suggestions
        Sup-->>Cortex: Final response + suggestions
    else intent = review
        Sup->>Rev: Handoff (document)
        Rev->>Rev: Call 5 review tools (parallel)
        Rev-->>Sup: Aggregated feedback
        Sup-->>Cortex: Final response (summary + feedback)
    else intent = irrelevant or chat
        Sup->>Sup: Respond directly (no tool)
        Sup-->>Cortex: Chat response
    end
    
    Cortex-->>App: message, steps
    App-->>User: response, document_content?, confidence_score?
```

---

## State / Routing Diagram

```mermaid
stateDiagram-v2
    [*] --> RootSupervisor
    
    RootSupervisor --> ClassifyIntent: User query
    
    state ClassifyIntent {
        [*] --> irrelevant
        [*] --> chat
        [*] --> update
        [*] --> review
    }
    
    ClassifyIntent --> UpdateAgent: update
    ClassifyIntent --> ReviewAgent: review
    ClassifyIntent --> ConversationalResponse: irrelevant
    ClassifyIntent --> ConversationalResponse: chat
    
    state UpdateAgent {
        [*] --> document_update_tool
        document_update_tool --> document_suggestions
    }
    
    state ReviewAgent {
        [*] --> solution_tool
        [*] --> ai_registry_tool
        [*] --> legal_tool
        [*] --> security_tool
        [*] --> third_party_tool
        solution_tool --> collector
        ai_registry_tool --> collector
        legal_tool --> collector
        security_tool --> collector
        third_party_tool --> collector
        collector --> feedback_summary
    }
    
    UpdateAgent --> RootSupervisor: return suggestions
    ReviewAgent --> RootSupervisor: return feedback
    ConversationalResponse --> RootSupervisor: return text
    
    RootSupervisor --> [*]: Response to user
```

---

## Child Agent Details

| Child Agent           | Trigger Intent | Tools / Behavior | Output |
|-----------------------|----------------|------------------|--------|
| **Update Agent**      | update         | `document_update` | document_suggestions (section → content) |
| **Review Agent**      | review         | `review_solution`, `review_ai_registry`, `review_legal`, `review_security`, `review_third_party` | Aggregated feedback per section |
| **Conversational Agent** | irrelevant, chat | None (direct LLM response) | Chat message using document + history |

---

## Autocomplete (Separate Trigger)

The **Autocomplete** flow is **not** routed by the Root Supervisor. It is triggered by the frontend ~10s after document changes and can call a **separate Cortex model** or the same model with a special question prefix.

```mermaid
graph LR
    DOC[Document changed] -->|10s debounce| APP[Frontend]
    APP -->|POST /model/ask| CORTEX[Cortex]
    CORTEX --> AUTO[Autocomplete tool or model]
    AUTO -->|suggestions + confidence| APP
    APP --> CHAT[Message in chat]
    APP --> PROP[Proposed changes]
    APP --> CONF[Confidence updated]
```

---

## Summary

- **Root Supervisor**: Single agent-chain; classifies intent and routes to Update Agent, Review Agent, or Conversational (direct) path.
- **Update Agent**: Child agent with `document_update` tool.
- **Review Agent**: Child agent with 5 section review tools.
- **Conversational Agent**: Handled by the supervisor itself when no tool/child is needed.
- **Autocomplete**: Separate trigger (10s after doc change); not part of the main hierarchy.
