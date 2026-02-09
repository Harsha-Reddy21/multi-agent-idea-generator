# Agent Architecture - Mermaid Diagrams

## Agent Graph Flow Diagram (Parallel Execution)

```mermaid
graph TB
    START([Start: Agent Graph Invoked]) --> INTENT[Intent Classifier<br/>🔍 Classifies Query]
    
    INTENT -->|Calls LLM| LLM1[LLMService<br/>Cortex API]
    LLM1 -->|Returns JSON| INTENT
    
    INTENT -->|Sets intent, relevance_score, ambiguity_score| ROUTE{Router<br/>route_by_intent}
    
    ROUTE -->|intent = 'irrelevant'| RESPOND[Chat Responder<br/>📝 Aggregates Feedback]
    ROUTE -->|intent = 'enhance'| ENHANCE[Document Enhancer<br/>✨ Improves Sections]
    ROUTE -->|intent = 'review'| REVIEW_START[Review Start<br/>🚀 Parallel Trigger]
    
    subgraph "Review Path - Parallel Execution"
        REVIEW_START -->|Parallel| SOL[Solution Agent<br/>🔧 Reviews solution_overview]
        REVIEW_START -->|Parallel| AI[AI Registry Agent<br/>🤖 Reviews ai_registry]
        REVIEW_START -->|Parallel| LEGAL[Legal Agent<br/>⚖️ Reviews digital_legal]
        REVIEW_START -->|Parallel| SEC[Security Agent<br/>🔒 Reviews security_architecture]
        REVIEW_START -->|Parallel| TP[Third Party Agent<br/>🤝 Reviews third_party]
        
        SOL -->|solution_feedback| COLLECTOR[Review Collector<br/>📦 Collects All Feedback]
        AI -->|ai_registry_feedback| COLLECTOR
        LEGAL -->|legal_feedback| COLLECTOR
        SEC -->|security_feedback| COLLECTOR
        TP -->|third_party_feedback| COLLECTOR
        
        COLLECTOR --> RESPOND
    end
    
    SOL -.->|Calls LLM| LLM2[LLMService]
    AI -.->|Calls LLM| LLM3[LLMService]
    LEGAL -.->|Calls LLM| LLM4[LLMService]
    SEC -.->|Calls LLM| LLM5[LLMService]
    TP -.->|Calls LLM| LLM6[LLMService]
    
    ENHANCE -->|document_suggestions| CONF[Confidence Agent<br/>📊 Calculates Score]
    RESPOND -->|chat_response| CONF
    
    CONF -->|confidence_score| END([End: Returns Final State])
    
    style INTENT fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style ROUTE fill:#fff4e1,stroke:#e65100,stroke-width:2px
    style REVIEW_START fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style SOL fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style AI fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style LEGAL fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style SEC fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style TP fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style COLLECTOR fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    style ENHANCE fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style RESPOND fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    style CONF fill:#fff9c4,stroke:#f57f17,stroke-width:2px
```

## Agent State Flow Diagram (Parallel Execution)

```mermaid
stateDiagram-v2
    [*] --> IntentClassifier
    
    IntentClassifier --> Router
    
    Router --> ReviewStart: review
    Router --> DocumentEnhancer: enhance
    Router --> ChatResponder: irrelevant
    
    state ParallelReview {
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
    
    DocumentEnhancer --> ConfidenceAgent
    ChatResponder --> ConfidenceAgent
    ConfidenceAgent --> [*]
```
