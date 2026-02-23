# Agent Architecture — Mermaid Diagrams

Two flows:

1. **Document-based flow** — User clicks a document section (User / System / Tech info) → triggers the corresponding agent → each returns a confidence score.
2. **Supervisor flow** — Supervisor receives user query → routes to Update Agent, Review Agent, or Conversational Agent based on intent.

---

## Flow 1: Document-Based Agent Triggers

Document has three sections. Clicking a section triggers its agent; each agent returns output plus a confidence score.

| Section            | Triggered agent    | Output                 |
|--------------------|--------------------|------------------------|
| User Information   | User Info Agent    | Response + confidence  |
| System Information | System Info Agent  | Response + confidence  |
| Tech Information   | Tech Info Agent    | Response + confidence  |

```mermaid
graph TB
    subgraph doc["Document"]
        UI[User Information]
        SI[System Information]
        TI[Tech Information]
    end
    
    subgraph agents["Agents (triggered by click)"]
        UIA[User Info Agent]
        SIA[System Info Agent]
        TIA[Tech Info Agent]
    end
    
    subgraph outputs["Each agent returns"]
        CONF1[confidence_score]
        CONF2[confidence_score]
        CONF3[confidence_score]
    end
    
    UI -->|Click| UIA
    SI -->|Click| SIA
    TI -->|Click| TIA
    
    UIA --> CONF1
    SIA --> CONF2
    TIA --> CONF3
    
    style doc fill:#e3f2fd
    style agents fill:#e8f5e9
    style outputs fill:#fff9c4
```

```mermaid
sequenceDiagram
    participant User
    participant UI as Frontend
    participant API as Backend API
    participant Agent as User/System/Tech Info Agent
    
    User->>UI: Clicks User Info (or System Info or Tech Info)
    UI->>API: POST /api/... { section, document }
    
    alt User Information
        API->>Agent: User Info Agent
    else System Information
        API->>Agent: System Info Agent
    else Tech Information
        API->>Agent: Tech Info Agent
    end
    
    Agent->>Agent: Process + compute confidence
    Agent-->>API: response, confidence_score
    API-->>UI: Display response + confidence
    UI-->>User: Show result
```

```mermaid
stateDiagram-v2
    [*] --> Document
    
    state Document {
        [*] --> UserInfo
        [*] --> SystemInfo
        [*] --> TechInfo
    }
    
    UserInfo --> UserInfoAgent: Click
    SystemInfo --> SystemInfoAgent: Click
    TechInfo --> TechInfoAgent: Click
    
    UserInfoAgent --> Result1: response + confidence_score
    SystemInfoAgent --> Result2: response + confidence_score
    TechInfoAgent --> Result3: response + confidence_score
    
    Result1 --> [*]
    Result2 --> [*]
    Result3 --> [*]
```

---

## Flow 2: Supervisor Agent with Child Agents

User sends a query → **Supervisor Agent** classifies intent → routes to one of three child agents.

| Child Agent           | When triggered       | Role                            |
|-----------------------|------------------------|---------------------------------|
| **Update Agent**      | intent = update       | Create, update, or enhance doc |
| **Review Agent**      | intent = review       | Validate and review document    |
| **Conversational Agent** | intent = chat, irrelevant | Answer questions, redirect, chat |

```mermaid
graph TB
    QUERY([User query]) --> SUP[Supervisor Agent]
    
    SUP -->|Classify intent| ROUTE{Router}
    
    ROUTE -->|update| UPD[Update Agent]
    ROUTE -->|review| REV[Review Agent]
    ROUTE -->|chat / irrelevant| CONV[Conversational Agent]
    
    UPD --> UPD_OUT[document_suggestions + confidence]
    REV --> REV_OUT[feedback + confidence]
    CONV --> CONV_OUT[chat_response + confidence]
    
    UPD_OUT --> RESP([Response to user])
    REV_OUT --> RESP
    CONV_OUT --> RESP
    
    style SUP fill:#e1f5ff,stroke:#01579b
    style ROUTE fill:#fff4e1
    style UPD fill:#f3e5f5
    style REV fill:#e8f5e9
    style CONV fill:#fce4ec
```

```mermaid
graph TB
    subgraph supervisor["Supervisor Agent"]
        SUP_LLM[Supervisor LLM<br/>Intent classification]
    end
    
    subgraph children["Child Agents"]
        UPDATE[Update Agent<br/>✏️ Document create/update/enhance]
        REVIEW[Review Agent<br/>📋 Document validation]
        CONV[Conversational Agent<br/>💬 Chat, questions, redirect]
    end
    
    QUERY([User query]) --> SUP_LLM
    SUP_LLM -->|update| UPDATE
    SUP_LLM -->|review| REVIEW
    SUP_LLM -->|chat, irrelevant| CONV
    
    UPDATE -->|confidence_score| OUT1([Output])
    REVIEW -->|confidence_score| OUT2([Output])
    CONV -->|confidence_score| OUT3([Output])
    
    style SUP_LLM fill:#e1f5ff
    style UPDATE fill:#f3e5f5
    style REVIEW fill:#e8f5e9
    style CONV fill:#fce4ec
```

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Sup as Supervisor Agent
    participant Upd as Update Agent
    participant Rev as Review Agent
    participant Conv as Conversational Agent
    
    User->>App: Query
    App->>Sup: Invoke with query
    
    Sup->>Sup: Classify intent
    
    alt intent = update
        Sup->>Upd: Handoff
        Upd->>Upd: Process document
        Upd-->>Sup: response + confidence_score
    else intent = review
        Sup->>Rev: Handoff
        Rev->>Rev: Run review
        Rev-->>Sup: feedback + confidence_score
    else intent = chat / irrelevant
        Sup->>Conv: Handoff (or direct)
        Conv-->>Sup: chat_response + confidence_score
    end
    
    Sup-->>App: Final response + confidence
    App-->>User: Display
```

```mermaid
stateDiagram-v2
    [*] --> Supervisor
    
    Supervisor --> Route: Classify intent
    
    state Route {
        update
        review
        chat
        irrelevant
    }
    
    Route --> UpdateAgent: update
    Route --> ReviewAgent: review
    Route --> ConversationalAgent: chat
    Route --> ConversationalAgent: irrelevant
    
    UpdateAgent --> Output: response + confidence_score
    ReviewAgent --> Output: feedback + confidence_score
    ConversationalAgent --> Output: chat_response + confidence_score
    
    Output --> [*]
```

---

## Summary

| Flow        | Trigger              | Agents                                                | Output                 |
|------------|----------------------|--------------------------------------------------------|------------------------|
| **Document** | Click section (User / System / Tech) | User Info Agent, System Info Agent, Tech Info Agent | Response + confidence  |
| **Supervisor** | User query           | Supervisor → Update / Review / Conversational Agent   | Response + confidence  |
