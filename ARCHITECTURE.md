# Multi-Agent Idea Generator - Architecture Documentation

## System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React Frontend<br/>TextEditor + AIAgent]
        FE -->|POST /api/chat<br/>message + document + history| API
    end
    
    subgraph "API Layer"
        API[FastAPI Server<br/>main.py]
        API -->|Request Logging| LOG[Logger]
        API -->|CORS Middleware| CORS[CORS Handler]
        API -->|Validate Request| VALID[Request Validator]
    end
    
    subgraph "Service Layer"
        CS[ChatService<br/>chat_service.py]
        API -->|chat_service.get_response| CS
        
        CS -->|Parse HTML| HTML[HTML Parser<br/>BeautifulSoup]
        CS -->|Format History| HIST[History Formatter]
        CS -->|Invoke Graph| AG[Agent Graph]
    end
    
    subgraph "Multi-Agent System - LangGraph"
        AG -->|Entry Point| INTENT[Intent Classifier<br/>Classifies Query]
        
        INTENT -->|Route Decision| ROUTE{Route by Intent}
        
        ROUTE -->|review| RS[Review Start<br/>Parallel Trigger]
        ROUTE -->|enhance| ENHANCE[Enhance Path]
        ROUTE -->|irrelevant| RESPOND[Direct Response]
        
        subgraph "Review Path - Parallel Agents"
            RS -->|Parallel| SOL[Solution Agent<br/>Reviews solution_overview]
            RS -->|Parallel| AI[AI Registry Agent<br/>Reviews ai_registry]
            RS -->|Parallel| LEGAL[Legal Agent<br/>Reviews digital_legal]
            RS -->|Parallel| SEC[Security Agent<br/>Reviews security_architecture]
            RS -->|Parallel| TP[Third Party Agent<br/>Reviews third_party]
            SOL --> RC[Review Collector<br/>Collects All Feedback]
            AI --> RC
            LEGAL --> RC
            SEC --> RC
            TP --> RC
            RC --> RESPOND
        end
        
        subgraph "Enhance Path"
            ENHANCE --> ENH[Document Enhancer<br/>Improves all sections]
            ENH --> CONF
        end
        
        RESPOND --> CONF[Confidence Agent<br/>Calculates Score]
        CONF -->|Final State| END[END]
    end
    
    subgraph "LLM Layer"
        LLM[LLMService<br/>llm_service.py]
        
        INTENT -.->|generate_response_text| LLM
        SOL -.->|generate_response_text| LLM
        AI -.->|generate_response_text| LLM
        LEGAL -.->|generate_response_text| LLM
        SEC -.->|generate_response_text| LLM
        TP -.->|generate_response_text| LLM
        ENH -.->|generate_response_text| LLM
        
        LLM -->|OAuth Token| OAUTH[Azure AD<br/>OAuth2]
        LLM -->|GET Request| CORTEX[Cortex API<br/>/model/ask]
        CORTEX -->|JSON Response| LLM
    end
    
    subgraph "State Management"
        STATE[AgentState<br/>TypedDict]
        STATE -->|user_query| INTENT
        STATE -->|document sections| REVIEW
        STATE -->|intent + scores| ROUTE
        STATE -->|feedback| RESPOND
        STATE -->|confidence| CONF
    end
    
    AG -->|Returns Result| CS
    CS -->|response + confidence_score| API
    API -->|JSON Response| FE
    
    style INTENT fill:#e1f5ff
    style REVIEW fill:#fff4e1
    style ENHANCE fill:#e8f5e9
    style CONF fill:#fce4ec
    style LLM fill:#f3e5f5
    style CORTEX fill:#fff9c4
```

## Agent Graph Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> IntentClassifier: user_query + document + history
    
    IntentClassifier --> RouteDecision: intent, relevance_score, ambiguity_score
    
    RouteDecision --> SolutionAgent: intent == "review"
    RouteDecision --> DocumentEnhancer: intent == "enhance"
    RouteDecision --> ChatResponder: intent == "irrelevant"
    
    state ReviewPath {
        SolutionAgent --> AIRegistryAgent: solution_feedback
        AIRegistryAgent --> LegalAgent: ai_registry_feedback
        LegalAgent --> SecurityAgent: legal_feedback
        SecurityAgent --> ThirdPartyAgent: security_feedback
        ThirdPartyAgent --> ChatResponder: third_party_feedback
    }
    
    DocumentEnhancer --> ConfidenceAgent: document_suggestions
    ChatResponder --> ConfidenceAgent: chat_response
    
    ConfidenceAgent --> [*]: confidence_score + final_response
    
    note right of IntentClassifier
        Uses LLMService to classify:
        - Intent: chat/enhance/autocomplete/irrelevant
        - Relevance: 0-1
        - Ambiguity: 0-1
    end note
    
    note right of ReviewPath
        Sequential execution:
        Each agent reviews specific
        document section and provides
        feedback using LLMService
    end note
    
    note right of ConfidenceAgent
        Formula:
        confidence = 0.5 * relevance
        + 0.3 * (1 - ambiguity)
        + 0.2
    end note
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as FastAPI
    participant CS as ChatService
    participant AG as Agent Graph
    participant IC as Intent Classifier
    participant SA as Solution Agent
    participant AA as AI Registry Agent
    participant LA as Legal Agent
    participant SEA as Security Agent
    participant TA as Third Party Agent
    participant CR as Chat Responder
    participant CA as Confidence Agent
    participant LLM as LLMService
    participant CORTEX as Cortex API
    
    FE->>API: POST /api/chat<br/>{message, document_content, chat_history}
    API->>CS: get_response(message, document, history)
    
    CS->>CS: Parse HTML to sections<br/>(solution_overview, ai_registry, etc.)
    CS->>CS: Format chat history
    
    CS->>AG: invoke({user_query, document, chat_history})
    
    AG->>IC: Classify intent
    IC->>LLM: generate_response_text(prompt)
    LLM->>CORTEX: GET /model/ask?q=prompt
    CORTEX-->>LLM: {message: "..."}
    LLM-->>IC: response text
    IC-->>AG: {intent, relevance_score, ambiguity_score}
    
    alt intent == "review"
        AG->>SA: Review solution_overview
        SA->>LLM: generate_response_text(prompt)
        LLM->>CORTEX: GET request
        CORTEX-->>LLM: response
        LLM-->>SA: feedback text
        SA-->>AG: solution_feedback
        
        AG->>AA: Review ai_registry
        AA->>LLM: generate_response_text(prompt)
        LLM->>CORTEX: GET request
        CORTEX-->>LLM: response
        LLM-->>AA: feedback text
        AA-->>AG: ai_registry_feedback
        
        AG->>LA: Review digital_legal
        LA->>LLM: generate_response_text(prompt)
        LLM->>CORTEX: GET request
        CORTEX-->>LLM: response
        LLM-->>LA: feedback text
        LA-->>AG: legal_feedback
        
        AG->>SEA: Review security_architecture
        SEA->>LLM: generate_response_text(prompt)
        LLM->>CORTEX: GET request
        CORTEX-->>LLM: response
        LLM-->>SEA: feedback text
        SEA-->>AG: security_feedback
        
        AG->>TA: Review third_party
        TA->>LLM: generate_response_text(prompt)
        LLM->>CORTEX: GET request
        CORTEX-->>LLM: response
        LLM-->>TA: feedback text
        TA-->>AG: third_party_feedback
        
        AG->>CR: Aggregate feedback
        CR-->>AG: chat_response
    else intent == "enhance"
        AG->>AG: Document Enhancer<br/>(improves all sections)
    else intent == "irrelevant"
        AG->>CR: Direct response
    end
    
    AG->>CA: Calculate confidence
    CA-->>AG: confidence_score
    
    AG-->>CS: {chat_response, confidence_score, ...}
    CS-->>API: {response, confidence_score}
    API-->>FE: JSON Response
```

## Component Details

### 1. Agent State (AgentState)
```python
{
    # Inputs
    "user_query": str,
    "document": {
        "solution_overview": str,
        "ai_registry": str,
        "digital_legal": str,
        "security_architecture": str,
        "third_party": str
    },
    "chat_history": List[str],
    
    # Intent & Routing
    "intent": "chat | enhance | autocomplete | irrelevant",
    "relevance_score": float (0-1),
    "ambiguity_score": float (0-1),
    
    # Agent Outputs
    "solution_feedback": str,
    "ai_registry_feedback": str,
    "legal_feedback": str,
    "security_feedback": str,
    "third_party_feedback": str,
    
    # Final Outputs
    "chat_response": str,
    "document_suggestions": Dict[str, str],
    "confidence_score": float (0-1)
}
```

### 2. Specialized Agents

| Agent | Section Reviewed | Checks For |
|-------|-----------------|-----------|
| **Solution Agent** | `solution_overview` | Missing technical solution, unclear users, missing success criteria |
| **AI Registry Agent** | `ai_registry` | Missing deployment info, missing maturity, third-party usage clarity |
| **Legal Agent** | `digital_legal` | Missing accountability, missing privacy concern clarity |
| **Security Agent** | `security_architecture` | AI usage clarity, hosting details, data types |
| **Third Party Agent** | `third_party` | External exposure, vendor risks |

### 3. Routing Logic

```python
if intent == "irrelevant":
    → Direct to Chat Responder
elif intent == "enhance":
    → Document Enhancer (improves all sections)
else:
    → Review Path (all 5 agents sequentially)
```

### 4. Confidence Score Calculation

```python
confidence = (
    0.5 * relevance_score +
    0.3 * (1 - ambiguity_score) +
    0.2
)
# Converted to 0-100% for frontend
```

## Key Features

1. **Intent-Based Routing**: Automatically routes queries to appropriate processing path
2. **Multi-Agent Review**: 5 specialized agents review different document sections
3. **Sequential Processing**: Agents execute in sequence, building on previous feedback
4. **Cortex API Integration**: All LLM calls go through Cortex API with OAuth
5. **HTML Parsing**: Automatically extracts document sections from HTML content
6. **Confidence Scoring**: Dynamic confidence calculation based on relevance and ambiguity
7. **Document Enhancement**: Can suggest improvements for all document sections

## Technology Stack

- **Frontend**: React + TypeScript + TipTap
- **Backend**: FastAPI (Python)
- **Agent Framework**: LangGraph
- **LLM**: Cortex API (via LLMService)
- **HTML Parsing**: BeautifulSoup4
- **Authentication**: Azure AD OAuth2
