from typing import TypedDict, List, Dict, Optional, Tuple
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
    
    prompt = f"""You are classifying user queries for a document review system. The system reviews idea documents with sections like Solution Overview, AI Registry, Legal/Privacy, Security Architecture, and Third Party Engagement.

User Query: "{state['user_query']}"

Classify this query into one of these categories:
- "irrelevant": General conversation, greetings, questions unrelated to document or app (e.g., "how are you", "what's the weather", casual chat)
- "chat": Questions about the document, the review process, or the application itself that do NOT directly ask you to change the document
- "update": Requests to create, update, or enhance parts of the document (from scratch, specific sections, or small edits)
- "review": Requests to review or validate the current document content without changing it directly

For relevance score (0-1):
- 0.0-0.3: Completely unrelated to document review (greetings, casual chat, unrelated questions)
- 0.4-0.6: Somewhat related but vague or unclear
- 0.7-1.0: Directly related to document review

For ambiguity score (0-1):
- 0.0-0.3: Very clear and specific query
- 0.4-0.7: Somewhat unclear or could have multiple interpretations
- 0.8-1.0: Very ambiguous or unclear

Return ONLY valid JSON. No markdown. No explanation.

Format:
{{
  "intent": "chat | update | review | irrelevant",
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
    content = state["document"]
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
    logger.info(f"[Solution Agent] Review completed. Feedback length: {feedback} chars")
    
    return {
        "solution_feedback": feedback
    }



def ai_registry_agent(state: AgentState):
    logger.info("[AI Registry Agent] Starting AI registry review")
    content = state["document"]
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
    logger.info(f"[AI Registry Agent] Review completed. Feedback length: {feedback} chars")
    
    return {
        "ai_registry_feedback": feedback
    }


def legal_agent(state: AgentState):
    logger.info("[Legal Agent] Starting legal/privacy review")
    content = state["document"]
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
    logger.info(f"[Legal Agent] Review completed. Feedback length: {feedback} chars")
    
    return {
        "legal_feedback": feedback
    }



def security_agent(state: AgentState):
    logger.info("[Security Agent] Starting security architecture review")
    content = state["document"]
    logger.info(f"[Security Agent] Content length: {content} chars")

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
    logger.info(f"[Security Agent] Review completed. Feedback length: {feedback} chars")
    
    return {
        "security_feedback": feedback
    }


def third_party_agent(state: AgentState):
    logger.info("[Third Party Agent] Starting third party review")
    content = state["document"]
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
    logger.info(f"[Third Party Agent] Review completed. Feedback length: {feedback} chars")
    
    return {
        "third_party_feedback": feedback
    }


def _context_blocks(state: AgentState) -> Tuple[str, str]:
    """Build document and chat-history context strings for prompts."""
    doc = state.get("document") or {}
    doc_block = "\n".join(f"**{k}**:\n{v}" for k, v in doc.items()) if doc else "(No document yet)"
    history = state.get("chat_history") or []
    history_block = "\n".join(history) if history else "(No previous messages)"
    return doc_block, history_block


def chat_responder(state: AgentState):
    logger.info("[Chat Responder] Starting response generation")
    user_query = state.get("user_query", "")
    intent = state.get("intent", "")
    relevance_score = state.get("relevance_score", 0.5)
    doc_ctx, chat_ctx = _context_blocks(state)

    logger.info(f"[Chat Responder] Intent: {intent}, Relevance: {relevance_score}")

    # Handle irrelevant queries first - don't process document feedbacks
    if intent == "irrelevant" or relevance_score < 0.3:
        prompt = f"""The user asked: "{user_query}"

Current document (for context):
{doc_ctx}

Recent conversation:
{chat_ctx}

This is a general conversation query or greeting that is not related to document review. Provide a brief, friendly response that acknowledges the query, redirects back to document review, and offers to help. Keep it short (2-3 sentences)."""
        logger.info("[Chat Responder] Query is irrelevant, generating simple response")
        response = llm_service.generate_response_text(prompt)
        logger.info(f"[Chat Responder] Generated response length: {len(response)} chars")
        return {"chat_response": response}

    # Pure chat about the app / document without changing it
    if intent == "chat":
        prompt = f"""You are a helpful assistant for a document review application.

Current document:
{doc_ctx}

Recent conversation:
{chat_ctx}

The user asked: "{user_query}"

Use the document and conversation above to ground your answer. Do NOT modify the document. Explain how the system works, how reviews/updates happen, or answer questions about the document. Be professional and concise."""
        logger.info("[Chat Responder] Query is chat, generating explanatory response")
        response = llm_service.generate_response_text(prompt)
        logger.info(f"[Chat Responder] Generated response length: {len(response)} chars")
        return {"chat_response": response}
    
    # For relevant queries, check if we have feedback from review agents
    logger.info("[Chat Responder] Aggregating feedback from all agents")
    feedbacks = [
        state.get("solution_feedback"),
        state.get("ai_registry_feedback"),
        state.get("legal_feedback"),
        state.get("security_feedback"),
        state.get("third_party_feedback"),
    ]
    
    logger.info(f"[Chat Responder] Collected {len(feedbacks)} feedback items")
    
    # Filter out empty feedbacks and "sufficient" responses
    relevant_feedback = []
    feedback_labels = []
    
    if state.get("solution_feedback") and "sufficient" not in state.get("solution_feedback", "").lower():
        relevant_feedback.append(state["solution_feedback"])
        feedback_labels.append("Solution Overview")
    
    if state.get("ai_registry_feedback") and "sufficient" not in state.get("ai_registry_feedback", "").lower():
        relevant_feedback.append(state["ai_registry_feedback"])
        feedback_labels.append("AI Registry")
    
    if state.get("legal_feedback") and "sufficient" not in state.get("legal_feedback", "").lower():
        relevant_feedback.append(state["legal_feedback"])
        feedback_labels.append("Legal/Privacy")
    
    if state.get("security_feedback") and "sufficient" not in state.get("security_feedback", "").lower():
        relevant_feedback.append(state["security_feedback"])
        feedback_labels.append("Security Architecture")
    
    if state.get("third_party_feedback") and "sufficient" not in state.get("third_party_feedback", "").lower():
        relevant_feedback.append(state["third_party_feedback"])
        feedback_labels.append("Third Party Engagement")
    
    logger.info(f"[Chat Responder] Found {len(relevant_feedback)} relevant feedback items")
    
    # Build prompt for LLM to generate final response
    if not relevant_feedback:
        prompt = f"""Current document:
{doc_ctx}

Recent conversation:
{chat_ctx}

The user asked: "{user_query}"

After reviewing all sections, they appear sufficient and complete. Provide a positive, encouraging response confirming the document looks complete for this stage."""
        logger.info("[Chat Responder] Document complete, generating response via LLM")
    else:
        feedback_text = ""
        for i, (label, feedback) in enumerate(zip(feedback_labels, relevant_feedback), 1):
            feedback_text += f"\n{i}. {label}:\n{feedback}\n"
        prompt = f"""Current document:
{doc_ctx}

Recent conversation:
{chat_ctx}

The user asked: "{user_query}"

After reviewing the document, the following areas need attention:
{feedback_text}

Generate a clear, professional response that acknowledges the question, summarizes key areas needing attention, gives constructive guidance, and keeps a helpful tone."""
        logger.info(f"[Chat Responder] Generating LLM response for {len(relevant_feedback)} areas needing attention")
    
    # Generate final response using LLM
    logger.info("[Chat Responder] Calling LLM to generate final response")
    response = llm_service.generate_response_text(prompt)
    logger.info(f"[Chat Responder] Generated response length: {len(response)} chars")
    
    return {"chat_response": response}




def document_enhancer(state: AgentState):
    logger.info("[Document Enhancer] Starting document enhancement/update")
    suggestions = {}
    document = state["document"]
    sections = list(document.keys())
    logger.info(f"[Document Enhancer] Processing {len(sections)} sections: {sections}")

    # If there is no document yet, start from scratch by asking the LLM to propose a structure
    if not document:
        prompt = f"""
The user wants to create a new idea document from scratch.

User request:
{state['user_query']}

Create a reasonable initial document structure as a JSON object mapping section names to fully written section content.

Return ONLY valid JSON for the object."""
        raw = llm_service.generate_response_text(prompt)
        suggestions = parse_llm_json(raw)
        logger.info("[Document Enhancer] Created initial document from scratch")
        return {"document_suggestions": suggestions}

    # Otherwise, selectively update/enhance existing sections based on the user request
    for section, content in document.items():
        logger.info(f"[Document Enhancer] Enhancing/updating section: {section} ({len(content)} chars)")
        prompt = f"""
You are updating a single section of a compliance-oriented idea document.

User request:
{state['user_query']}

Current section name:
{section}

Current section content:
{content}

Decide whether this section should be:
- left unchanged,
- updated only where needed,
- or more fully rewritten / enhanced.

If you decide to change it, return the improved full section text.
If you decide to leave it unchanged, just return the original content.
Do not remove required compliance language."""
        suggestions[section] = llm_service.generate_response_text(prompt)
        logger.info(f"[Document Enhancer] Completed enhancement for {section}")

    logger.info(f"[Document Enhancer] Enhancement/update completed for all {len(suggestions)} sections")
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
    if intent == "update":
        logger.info("[Router] Routing to: enhance (document update/enhancement)")
        return "enhance"
    if intent == "review":
        logger.info("[Router] Routing to: review_start (parallel review path)")
        return "review_start"
    
    logger.info("[Router] Routing to: respond (chat / fallback)")
    return "respond"


def autocomplete_agent(state: AgentState):
    """
    Standalone autocomplete agent.
    This is NOT routed by intent; it should be called by the backend
    shortly after a document update to propose refinements and an
    updated confidence score based on the latest document content.
    """
    logger.info("[Autocomplete Agent] Starting autocomplete suggestions")
    document = state["document"]

    prompt = f"""
You are an autocomplete assistant for a document review system.

Given the current document (a mapping of section name to content), propose small, high-confidence refinements
to any sections that would make the document clearer, more complete, or more compliant.

Document:
{document}

Return ONLY valid JSON with this shape:
{{
  "document_suggestions": {{ "section_name": "improved full section text", ... }},
  "confidence_score": 0-1
}}"""

    raw = llm_service.generate_response_text(prompt)
    result = parse_llm_json(raw)

    new_suggestions = result.get("document_suggestions") or {}
    new_confidence = result.get("confidence_score", state.get("confidence_score") or 0.0)

    logger.info(f"[Autocomplete Agent] Generated suggestions for {len(new_suggestions)} sections")
    return {
        "document_suggestions": new_suggestions,
        "confidence_score": float(new_confidence),
    }



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