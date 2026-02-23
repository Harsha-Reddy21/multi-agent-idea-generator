# Cortex Implementation — Agent Architecture

How the two flows (Document-based and Supervisor) are implemented on **Cortex** using the Agentic V2 framework, `agent-chain`, and `agentic-model` executables.

---

## Cortex Concepts Used

| Concept | Role |
|---------|------|
| **agent-chain** | Model config chain class; one supervisor LLM routes to executables. |
| **agentic-model** | Child agent = another Cortex model; supervisor hands off conversation. |
| **tool-call** | Tool from a Toolkit (gRPC/MCP); agent invokes for actions. |
| **/model/ask/{model}** | API to invoke a Cortex model with `q` (question). |
| **chain_params** | Supervisor prompt, resources (executables), max_turns, execution_type. |

---

## Flow 1: Document-Based Agents (Cortex)

Each document section (User / System / Tech info) triggers a **separate Cortex model** or a **single model with section parameter**. Backend calls `/model/ask/{model}` with the section and document context.

### Option A: Three separate Cortex models

```mermaid
graph TB
    subgraph doc["Document"]
        UI[User Information]
        SI[System Information]
        TI[Tech Information]
    end
    
    subgraph cortex["Cortex Models"]
        M1[user-info-model]
        M2[system-info-model]
        M3[tech-info-model]
    end
    
    subgraph api["Backend"]
        API[POST /api/section-evaluate]
    end
    
    UI -->|Click| API
    SI -->|Click| API
    TI -->|Click| API
    
    API -->|section=user| M1
    API -->|section=system| M2
    API -->|section=tech| M3
    
    M1 -->|GET /model/ask/user-info-model| R1[response + confidence]
    M2 -->|GET /model/ask/system-info-model| R2[response + confidence]
    M3 -->|GET /model/ask/tech-info-model| R3[response + confidence]
    
    R1 --> UI_OUT([Display])
    R2 --> UI_OUT
    R3 --> UI_OUT
    
    style cortex fill:#e0f2f1
```

### Option B: Single model with section in question

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API as Backend
    participant Cortex as /model/ask/section-agent
    
    User->>UI: Clicks User Info
    UI->>API: POST { section: "user", document }
    API->>Cortex: q = "Section: USER_INFO. Document: {document}"
    Cortex->>Cortex: Process + confidence
    Cortex-->>API: message, confidence
    API-->>UI: response + confidence_score
```

### Flow 1 — Cortex model config (per section)

Each section agent can be a **model-only-chain** or a light **agent-chain** with one tool that returns confidence. Example for one section:

```json
{
  "name": "user-info-agent",
  "chain": [{ "chain_class": "model-only-chain", ... }],
  "model_versions": [{ "model_class": "claude", "model_iteration": 17 }]
}
```

---

## Flow 2: Supervisor Agent (Cortex agent-chain)

The **Supervisor** is one Cortex model with **agent-chain**. It has three **agentic-model** executables: Update Agent, Review Agent, Conversational Agent. Each child is a separate Cortex model config.

### Cortex hierarchy

```mermaid
graph TB
    subgraph root["Root Model Config: idea-supervisor"]
        SUP[Supervisor LLM<br/>chain_class: agent-chain]
    end
    
    subgraph executables["chain_params.resources.executables"]
        UPD_EXEC[Update Agent<br/>type: agentic-model]
        REV_EXEC[Review Agent<br/>type: agentic-model]
        CONV_EXEC[Conversational Agent<br/>type: agentic-model]
    end
    
    subgraph children["Child Cortex Models"]
        UPD_MOD[idea-update-agent]
        REV_MOD[idea-review-agent]
        CONV_MOD[idea-conversational-agent]
    end
    
    QUERY([User query]) --> SUP
    SUP -->|intent=update| UPD_EXEC
    SUP -->|intent=review| REV_EXEC
    SUP -->|intent=chat/irrelevant| CONV_EXEC
    
    UPD_EXEC --> UPD_MOD
    REV_EXEC --> REV_MOD
    CONV_EXEC --> CONV_MOD
    
    UPD_MOD -->|handoff| OUT1[document_suggestions + confidence]
    REV_MOD -->|handoff| OUT2[feedback + confidence]
    CONV_MOD -->|handoff| OUT3[chat_response + confidence]
    
    style SUP fill:#e1f5ff
    style executables fill:#fff4e1
```

### chain_params (supervisor config)

```mermaid
graph LR
    subgraph chain_params
        MAX[max_turns: 25]
        EXEC_TYPE[execution_type: handoff]
        SUP_PROMPT[supervisor.prompt]
        SUP_DESC[supervisor.description]
        EXEC[resources.executables]
    end
    
    EXEC --> UPD[Update Agent agentic-model]
    EXEC --> REV[Review Agent agentic-model]
    EXEC --> CONV[Conversational Agent agentic-model]
```

### Request flow: /model/ask/idea-supervisor

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Cortex as /model/ask/idea-supervisor
    participant Sup as Supervisor
    participant Upd as idea-update-agent
    participant Rev as idea-review-agent
    participant Conv as idea-conversational-agent
    
    User->>App: Query + document + chat_history
    App->>Cortex: q = "Document: ... Chat: ... User: ..."
    
    Cortex->>Sup: Invoke supervisor (agent-chain)
    Sup->>Sup: Classify intent from prompt
    
    alt intent = update
        Sup->>Upd: Handoff (full conversation)
        Upd->>Upd: Run tools / logic
        Upd-->>Sup: response + confidence_score
    else intent = review
        Sup->>Rev: Handoff
        Rev->>Rev: Run review tools
        Rev-->>Sup: feedback + confidence_score
    else intent = chat / irrelevant
        Sup->>Conv: Handoff (or direct)
        Conv-->>Sup: chat_response + confidence_score
    end
    
    Sup-->>Cortex: Final message
    Cortex-->>App: { message, steps }
    App-->>User: response + document_content? + confidence_score
```

### Child model: Update Agent (agentic-model)

```mermaid
graph TB
    subgraph update_model["Model: idea-update-agent"]
        UPD_SUP[Supervisor]
        TOOL[document_update tool]
    end
    UPD_SUP --> TOOL
```

### Child model: Review Agent (agentic-model)

```mermaid
graph TB
    subgraph review_model["Model: idea-review-agent"]
        REV_SUP[Supervisor]
        SOL[review_solution]
        AI[review_ai_registry]
        LEGAL[review_legal]
        SEC[review_security]
        TP[review_third_party]
    end
    REV_SUP --> SOL
    REV_SUP --> AI
    REV_SUP --> LEGAL
    REV_SUP --> SEC
    REV_SUP --> TP
```

### Child model: Conversational Agent (agentic-model)

```mermaid
graph TB
    subgraph conv_model["Model: idea-conversational-agent"]
        CONV_LLM[Model-only or light agent]
    end
```

Can be **model-only-chain** (no tools) or a minimal agent-chain. Supervisor may also handle conversational directly without handoff.

---

## Summary: Cortex Mapping

| Flow | Cortex implementation | Invocation |
|------|------------------------|------------|
| **Document** (User/System/Tech click) | One model per section, or one model with `q` including section | Backend → `GET /model/ask/{section-model}?q=...` |
| **Supervisor** (query → Update/Review/Conversational) | Root model: `agent-chain` with 3 `agentic-model` executables | Backend → `GET /model/ask/idea-supervisor?q=...` |

| Component | Cortex type | Config |
|-----------|-------------|--------|
| Root Supervisor | agent-chain | chain_params.supervisor + resources.executables (3 agentic-model) |
| Update Agent | agentic-model | Separate model; tools: document_update |
| Review Agent | agentic-model | Separate model; tools: 5 section reviewers |
| Conversational Agent | agentic-model | Separate model; model-only or minimal agent |
| User/System/Tech Info agents | model-only or agent-chain | One model per section or one parameterized model |
