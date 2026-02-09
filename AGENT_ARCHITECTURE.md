# Multi-Agent System Architecture

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
    style LLM1 fill:#e0f2f1,stroke:#004d40,stroke-width:1px
    style LLM2 fill:#e0f2f1,stroke:#004d40,stroke-width:1px
    style LLM3 fill:#e0f2f1,stroke:#004d40,stroke-width:1px
    style LLM4 fill:#e0f2f1,stroke:#004d40,stroke-width:1px
    style LLM5 fill:#e0f2f1,stroke:#004d40,stroke-width:1px
    style LLM6 fill:#e0f2f1,stroke:#004d40,stroke-width:1px
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
    
    note right of IntentClassifier
        Analyzes user query
        Returns intent type
        relevance and ambiguity scores
    end note
    
    note right of ParallelReview
        Parallel execution
        All agents run simultaneously
        Review Collector waits for all
        to complete before proceeding
    end note
    
    note right of ConfidenceAgent
        Formula
        confidence = 0.5 * relevance
        + 0.3 * (1 - ambiguity)
        + 0.2
    end note
```

## Agent Execution Sequence (Parallel Execution)

```mermaid
sequenceDiagram
    participant Graph as Agent Graph
    participant IC as Intent Classifier
    participant Router as Router
    participant RS as Review Start
    participant SA as Solution Agent
    participant AA as AI Registry Agent
    participant LA as Legal Agent
    participant SEA as Security Agent
    participant TA as Third Party Agent
    participant RC as Review Collector
    participant CR as Chat Responder
    participant ENH as Document Enhancer
    participant CA as Confidence Agent
    participant LLM as LLMService
    
    Graph->>IC: invoke(state)
    IC->>LLM: generate_response_text(prompt)
    LLM-->>IC: JSON response
    IC-->>Graph: {intent, relevance_score, ambiguity_score}
    
    Graph->>Router: route_by_intent(state)
    
    alt intent == "review"
        Router-->>Graph: "review_start"
        Graph->>RS: Execute (trigger parallel)
        
        par Parallel Execution
            RS->>SA: Execute in parallel
            RS->>AA: Execute in parallel
            RS->>LA: Execute in parallel
            RS->>SEA: Execute in parallel
            RS->>TA: Execute in parallel
        end
        
        par All agents call LLM simultaneously
            SA->>LLM: generate_response_text(prompt)
            AA->>LLM: generate_response_text(prompt)
            LA->>LLM: generate_response_text(prompt)
            SEA->>LLM: generate_response_text(prompt)
            TA->>LLM: generate_response_text(prompt)
        end
        
        par All agents return feedback
            LLM-->>SA: solution_feedback
            LLM-->>AA: ai_registry_feedback
            LLM-->>LA: legal_feedback
            LLM-->>SEA: security_feedback
            LLM-->>TA: third_party_feedback
        end
        
        SA-->>RC: solution_feedback
        AA-->>RC: ai_registry_feedback
        LA-->>RC: legal_feedback
        SEA-->>RC: security_feedback
        TA-->>RC: third_party_feedback
        
        RC->>CR: All feedbacks collected
        CR->>Graph: chat_response
        
    else intent == "enhance"
        Router-->>Graph: "enhance"
        Graph->>ENH: Execute (for each section)
        loop For each document section
            ENH->>LLM: generate_response_text(prompt)
            LLM-->>ENH: suggestion
        end
        ENH-->>Graph: document_suggestions
        
    else intent == "irrelevant"
        Router-->>Graph: "respond"
        Graph->>CR: Direct response
        CR-->>Graph: chat_response
    end
    
    Graph->>CA: Calculate confidence
    CA-->>Graph: confidence_score
    Graph-->>Graph: Return final state
```

## Agent Responsibilities

```mermaid
mindmap
  root((Multi-Agent System))
    Intent Classifier
      Classifies query intent
      Calculates relevance
      Calculates ambiguity
      Routes to appropriate path
    
    Review Agents
      Solution Agent
        Reviews solution_overview
        Checks technical solution
        Validates users clarity
        Verifies success criteria
      
      AI Registry Agent
        Reviews ai_registry section
        Checks deployment info
        Validates maturity level
        Reviews third-party usage
      
      Legal Agent
        Reviews digital_legal section
        Checks accountability
        Validates privacy concerns
      
      Security Agent
        Reviews security_architecture
        Validates AI usage clarity
        Checks hosting details
        Reviews data types
      
      Third Party Agent
        Reviews third_party section
        Checks external exposure
        Validates vendor risks
    
    Enhancement
      Document Enhancer
        Improves all sections
        Maintains compliance language
        Provides suggestions
    
    Response
      Chat Responder
        Aggregates all feedback
        Filters relevant issues
        Generates final response
    
    Scoring
      Confidence Agent
        Uses relevance score
        Uses ambiguity score
        Calculates final confidence
```

## Agent State Structure

```mermaid
classDiagram
    class AgentState {
        +str user_query
        +Dict document
        +List chat_history
        +str intent
        +float relevance_score
        +float ambiguity_score
        +str solution_feedback
        +str ai_registry_feedback
        +str legal_feedback
        +str security_feedback
        +str third_party_feedback
        +str chat_response
        +Dict document_suggestions
        +float confidence_score
    }
    
    class IntentClassifier {
        +classify(state) Dict
    }
    
    class SolutionAgent {
        +review(state) Dict
    }
    
    class AIRegistryAgent {
        +review(state) Dict
    }
    
    class LegalAgent {
        +review(state) Dict
    }
    
    class SecurityAgent {
        +review(state) Dict
    }
    
    class ThirdPartyAgent {
        +review(state) Dict
    }
    
    class ChatResponder {
        +aggregate(state) Dict
    }
    
    class DocumentEnhancer {
        +enhance(state) Dict
    }
    
    class ConfidenceAgent {
        +calculate(state) Dict
    }
    
    class Router {
        +route(state) str
    }
    
    AgentState --> IntentClassifier
    AgentState --> SolutionAgent
    AgentState --> AIRegistryAgent
    AgentState --> LegalAgent
    AgentState --> SecurityAgent
    AgentState --> ThirdPartyAgent
    AgentState --> ChatResponder
    AgentState --> DocumentEnhancer
    AgentState --> ConfidenceAgent
    IntentClassifier --> Router
    Router --> SolutionAgent
    Router --> DocumentEnhancer
    Router --> ChatResponder
```
