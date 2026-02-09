from typing import TypedDict, List, Dict, Optional
from langgraph.graph import StateGraph, END
import json
import re
import logging

from services.llm_service import LLMService

logger = logging.getLogger(__name__)

# Initialize LLM service (uses Cortex API)
llm_service = LLMService()

class AgentState(TypedDict):
    # Inputs
    user_query: str
    document: Dict[str, str]  # section_name -> content
    chat_history: List[str]

    # Intent & routing
    intent: Optional[str]
    relevance_score: Optional[float]
    ambiguity_score: Optional[float]

    # Agent outputs
    solution_feedback: Optional[str]
    ai_registry_feedback: Optional[str]
    legal_feedback: Optional[str]
    security_feedback: Optional[str]
    third_party_feedback: Optional[str]

    # Final outputs
    chat_response: Optional[str]
    document_suggestions: Optional[Dict[str, str]]
    confidence_score: Optional[float]


def parse_llm_json(text: str) -> dict:
    """
    Safely extract and parse JSON from LLM output.
    Handles markdown fences and extra text.
    """
    # Remove ```json ``` or ``` fences
    cleaned = re.sub(r"```(?:json)?", "", text)
    cleaned = cleaned.replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from LLM:\n{cleaned}") from e


def intent_classifier(state: AgentState):
    logger.info("[Intent Classifier] Starting intent classification")
    logger.info(f"[Intent Classifier] User query: {state['user_query'][:100]}...")
    
    prompt = f"""
Classify the user query.

Query:
{state['user_query']}

Return ONLY valid JSON.
No markdown. No explanation.

Format:
{{
  "intent": "chat | enhance | autocomplete | irrelevant",
  "relevance": 0-1,
  "ambiguity": 0-1
}}
"""

    logger.info("[Intent Classifier] Calling LLM for classification")
    response = llm_service.generate_response_text(prompt)
    result = parse_llm_json(response)

    logger.info(f"[Intent Classifier] Classification result: intent={result['intent']}, relevance={result['relevance']}, ambiguity={result['ambiguity']}")
    
    return {
        "intent": result["intent"],
        "relevance_score": float(result["relevance"]),
        "ambiguity_score": float(result["ambiguity"]),
    }


def solution_agent(state: AgentState):
    logger.info("[Solution Agent] Starting solution overview review")
    content = state["document"].get("solution_overview", "")
    logger.info(f"[Solution Agent] Content length: {(content)} chars")

    prompt = f"""
Review the Solution Overview section.

Content:
{content}

Check for:
- Missing technical solution
- Unclear users
- Missing success criteria

Respond with issues or say "Looks sufficient".
"""

    logger.info("[Solution Agent] Calling LLM for review")
    feedback = llm_service.generate_response_text(prompt)
    logger.info(f"[Solution Agent] Review completed. Feedback length: {len(feedback)} chars")
    
    return {
        "solution_feedback": feedback
    }



def ai_registry_agent(state: AgentState):
    logger.info("[AI Registry Agent] Starting AI registry review")
    content = state["document"].get("ai_registry", "")
    logger.info(f"[AI Registry Agent] Content length: {len(content)} chars")

    prompt = f"""
Review AI Registry & Innovation Pipeline section.

Content:
{content}

Check for:
- Missing deployment info
- Missing maturity
- Third-party usage clarity
"""

    logger.info("[AI Registry Agent] Calling LLM for review")
    feedback = llm_service.generate_response_text(prompt)
    logger.info(f"[AI Registry Agent] Review completed. Feedback length: {len(feedback)} chars")
    
    return {
        "ai_registry_feedback": feedback
    }


def legal_agent(state: AgentState):
    logger.info("[Legal Agent] Starting legal/privacy review")
    content = state["document"].get("digital_legal", "")
    logger.info(f"[Legal Agent] Content length: {len(content)} chars")

    prompt = f"""
Review Digital Legal Office (Privacy).

Content:
{content}

Check for:
- Missing accountability
- Missing privacy concern clarity
"""

    logger.info("[Legal Agent] Calling LLM for review")
    feedback = llm_service.generate_response_text(prompt)
    logger.info(f"[Legal Agent] Review completed. Feedback length: {len(feedback)} chars")
    
    return {
        "legal_feedback": feedback
    }



def security_agent(state: AgentState):
    logger.info("[Security Agent] Starting security architecture review")
    content = state["document"].get("security_architecture", "")
    logger.info(f"[Security Agent] Content length: {len(content)} chars")

    prompt = f"""
Review Security Architecture section.

Content:
{content}

Check for:
- AI usage clarity
- Hosting details
- Data types
"""

    logger.info("[Security Agent] Calling LLM for review")
    feedback = llm_service.generate_response_text(prompt)
    logger.info(f"[Security Agent] Review completed. Feedback length: {len(feedback)} chars")
    
    return {
        "security_feedback": feedback
    }


def third_party_agent(state: AgentState):
    logger.info("[Third Party Agent] Starting third party review")
    content = state["document"].get("third_party", "")
    logger.info(f"[Third Party Agent] Content length: {len(content)} chars")

    prompt = f"""
Review Third Party Engagement section.

Content:
{content}

Check for:
- External exposure
- Vendor risks
"""

    logger.info("[Third Party Agent] Calling LLM for review")
    feedback = llm_service.generate_response_text(prompt)
    logger.info(f"[Third Party Agent] Review completed. Feedback length: {len(feedback)} chars")
    
    return {
        "third_party_feedback": feedback
    }


def chat_responder(state: AgentState):
    logger.info("[Chat Responder] Aggregating feedback from all agents")
    feedbacks = [
        state.get("solution_feedback"),
        state.get("ai_registry_feedback"),
        state.get("legal_feedback"),
        state.get("security_feedback"),
        state.get("third_party_feedback"),
    ]

    relevant_feedback = [f for f in feedbacks if f and "sufficient" not in f.lower()]
    logger.info(f"[Chat Responder] Found {len(relevant_feedback)} relevant feedback items out of {len(feedbacks)} total")

    if state["relevance_score"] < 0.3:
        response = "This query is not relevant to the current idea document."
        logger.info("[Chat Responder] Response: Query not relevant")
    elif not relevant_feedback:
        response = "Your document looks complete for this stage."
        logger.info("[Chat Responder] Response: Document complete")
    else:
        response = "Here are areas that need attention:\n\n" + "\n\n".join(relevant_feedback)
        logger.info(f"[Chat Responder] Response: {len(relevant_feedback)} areas need attention")

    return {"chat_response": response}




def document_enhancer(state: AgentState):
    logger.info("[Document Enhancer] Starting document enhancement")
    suggestions = {}
    sections = list(state["document"].keys())
    logger.info(f"[Document Enhancer] Processing {len(sections)} sections: {sections}")

    for section, content in state["document"].items():
        logger.info(f"[Document Enhancer] Enhancing section: {section} ({len(content)} chars)")
        prompt = f"""
Improve this section without removing compliance language.

Section:
{section}

Content:
{content}
"""
        suggestions[section] = llm_service.generate_response_text(prompt)
        logger.info(f"[Document Enhancer] Completed enhancement for {section}")

    logger.info(f"[Document Enhancer] Enhancement completed for all {len(suggestions)} sections")
    return {"document_suggestions": suggestions}



def confidence_agent(state: AgentState):
    logger.info("[Confidence Agent] Calculating confidence score")
    relevance = state["relevance_score"]
    ambiguity = state["ambiguity_score"]
    
    confidence = (
        0.5 * relevance
        + 0.3 * (1 - ambiguity)
        + 0.2
    )
    
    final_score = round(min(confidence, 1.0), 2)
    logger.info(f"[Confidence Agent] Relevance: {relevance}, Ambiguity: {ambiguity}, Confidence: {final_score}")
    
    return {"confidence_score": final_score}



def review_start(state: AgentState):
    """Pass-through node to enable parallel execution of review agents"""
    logger.info("[Review Start] Starting parallel execution of all review agents")
    return {}

def review_collector(state: AgentState):
    """Collector node that waits for all review agents to complete"""
    logger.info("[Review Collector] All review agents completed, proceeding to chat responder")
    # Check which feedbacks are available
    feedbacks_available = []
    if state.get("solution_feedback"):
        feedbacks_available.append("solution_feedback")
    if state.get("ai_registry_feedback"):
        feedbacks_available.append("ai_registry_feedback")
    if state.get("legal_feedback"):
        feedbacks_available.append("legal_feedback")
    if state.get("security_feedback"):
        feedbacks_available.append("security_feedback")
    if state.get("third_party_feedback"):
        feedbacks_available.append("third_party_feedback")
    
    logger.info(f"[Review Collector] Collected feedbacks: {feedbacks_available}")
    return {}

def route_by_intent(state: AgentState):
    intent = state["intent"]
    logger.info(f"[Router] Routing based on intent: {intent}")
    
    if intent == "irrelevant":
        logger.info("[Router] Routing to: respond (irrelevant query)")
        return "respond"
    if intent == "enhance":
        logger.info("[Router] Routing to: enhance (document enhancement)")
        return "enhance"
    
    logger.info("[Router] Routing to: review_start (parallel review path)")
    return "review_start"



graph = StateGraph(AgentState)

graph.set_entry_point("intent")

graph.add_node("intent", intent_classifier)
graph.add_node("review_start", review_start)
graph.add_node("review_collector", review_collector)

graph.add_node("solution", solution_agent)
graph.add_node("ai_registry", ai_registry_agent)
graph.add_node("legal", legal_agent)
graph.add_node("security", security_agent)
graph.add_node("third_party", third_party_agent)

graph.add_node("respond", chat_responder)
graph.add_node("enhance", document_enhancer)
graph.add_node("confidence", confidence_agent)

graph.add_conditional_edges(
    "intent",
    route_by_intent,
    {
        "review_start": "review_start",
        "enhance": "enhance",
        "respond": "respond",
    }
)

# Parallel execution: All review agents execute simultaneously from review_start
graph.add_edge("review_start", "solution")
graph.add_edge("review_start", "ai_registry")
graph.add_edge("review_start", "legal")
graph.add_edge("review_start", "security")
graph.add_edge("review_start", "third_party")

# All agents converge to review_collector (ensures all complete before proceeding)
graph.add_edge("solution", "review_collector")
graph.add_edge("ai_registry", "review_collector")
graph.add_edge("legal", "review_collector")
graph.add_edge("security", "review_collector")
graph.add_edge("third_party", "review_collector")

# Collector then proceeds to chat responder
graph.add_edge("review_collector", "respond")

graph.add_edge("respond", "confidence")
graph.add_edge("enhance", "confidence")
graph.add_edge("confidence", END)

# Compile the graph - this is the main entry point for the agent system
logger.info("[Agent Graph] Compiling agent graph...")
agent_app = graph.compile()
logger.info("[Agent Graph] Agent graph compiled successfully")