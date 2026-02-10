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
    
    prompt = f"""You are classifying user queries for a document review system. The system reviews idea documents with sections like Solution Overview, AI Registry, Legal/Privacy, Security Architecture, and Third Party Engagement.

User Query: "{state['user_query']}"

Classify this query into one of these categories:
- "irrelevant": General conversation, greetings, questions unrelated to document review (e.g., "how are you", "what's the weather", casual chat)
- "chat": Questions about the document review process, asking for feedback on specific sections, asking if document is complete (e.g., "is my document complete?", "what's missing?", "review my document")
- "enhance": Requests to ADD, improve, enhance, modify, or update document content. This includes ANY request starting with "add", "include", "put", "insert", or asking to enhance/improve specific content (e.g., "add idea generation", "add idea generation on prd generator", "add prd generator", "include X feature", "improve the solution section", "add more details about X", "put Y in the document")
- "autocomplete": Requests to fill in missing information or complete sections

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


def chat_responder(state: AgentState):
    logger.info("[Chat Responder] Starting response generation")
    user_query = state.get("user_query", "")
    intent = state.get("intent", "")
    relevance_score = state.get("relevance_score", 0.5)
    
    logger.info(f"[Chat Responder] Intent: {intent}, Relevance: {relevance_score}")
    
    # Handle irrelevant queries first - don't process document feedbacks
    if intent == "irrelevant" or relevance_score < 0.3:
        prompt = f"""The user asked: "{user_query}"

This is a general conversation query or greeting that is not related to document review. Examples include greetings like "how are you", casual conversation, or questions unrelated to reviewing idea documents.

Provide a brief, friendly, and professional response that:
1. Acknowledges the query politely
2. Redirects the conversation back to document review
3. Offers to help with document-related questions

Keep it short (2-3 sentences) and friendly."""
        logger.info("[Chat Responder] Query is irrelevant, generating simple response")
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
        prompt = f"""The user asked: "{user_query}"

After reviewing all sections of the document (Solution Overview, AI Registry, Legal/Privacy, Security Architecture, and Third Party Engagement), all sections appear to be sufficient and complete.

Provide a positive and encouraging response confirming that the document looks complete for this stage."""
        logger.info("[Chat Responder] Document complete, generating response via LLM")
    else:
        # Format feedbacks with labels
        feedback_text = ""
        for i, (label, feedback) in enumerate(zip(feedback_labels, relevant_feedback), 1):
            feedback_text += f"\n{i}. {label}:\n{feedback}\n"
        
        prompt = f"""The user asked: "{user_query}"

After reviewing the document, the following areas need attention:

{feedback_text}

Generate a clear, professional, and actionable response that:
1. Acknowledges the user's question
2. Summarizes the key areas that need attention
3. Provides constructive guidance on how to address these issues
4. Maintains a helpful and supportive tone

Structure the response clearly and make it easy to understand."""
        logger.info(f"[Chat Responder] Generating LLM response for {len(relevant_feedback)} areas needing attention")
    
    # Generate final response using LLM
    logger.info("[Chat Responder] Calling LLM to generate final response")
    response = llm_service.generate_response_text(prompt)
    logger.info(f"[Chat Responder] Generated response length: {len(response)} chars")
    
    return {"chat_response": response}




def document_enhancer(state: AgentState):
    logger.info("[Document Enhancer] Starting document enhancement")
    user_query = state.get("user_query", "")
    logger.info(f"[Document Enhancer] User request: {user_query}")
    
    suggestions = {}
    sections = list(state["document"].keys())
    logger.info(f"[Document Enhancer] Processing {len(sections)} sections: {sections}")

    # First, determine which sections are most relevant to the user's request
    relevance_prompt = f"""The user wants to: "{user_query}"

Available document sections:
{chr(10).join([f"- {section}" for section in sections])}

Identify which sections are MOST relevant to this request. Return ONLY a JSON array of section names that should be enhanced with the requested content. If the request is general, include all sections.

Format: ["section1", "section2", ...]"""
    
    logger.info("[Document Enhancer] Determining relevant sections")
    relevant_sections_json = llm_service.generate_response_text(relevance_prompt)
    logger.info(f"[Document Enhancer] Relevant sections response: {relevant_sections_json[:200]}")
    
    # Try to parse JSON, fallback to all sections if parsing fails
    import json
    import re
    try:
        # Extract JSON array from response
        json_match = re.search(r'\[.*?\]', relevant_sections_json, re.DOTALL)
        if json_match:
            relevant_sections = json.loads(json_match.group())
            # Filter to only sections that exist
            relevant_sections = [s for s in relevant_sections if s in sections]
        else:
            relevant_sections = sections
    except:
        relevant_sections = sections
    
    if not relevant_sections:
        relevant_sections = sections
    
    logger.info(f"[Document Enhancer] Will enhance sections: {relevant_sections}")

    for section, content in state["document"].items():
        logger.info(f"[Document Enhancer] Enhancing section: {section} ({len(content)} chars)")
        is_relevant = section in relevant_sections
        
        # Create enhancement prompt that includes user's specific request
        if is_relevant:
            prompt = f"""The user wants to ADD/ENHANCE the document with this specific request: "{user_query}"

Section Name: {section}

Current Content:
{content}

IMPORTANT: The user specifically requested to add content related to "{user_query}". 
- If this section is relevant to the request, ADD the requested content to this section
- Integrate it naturally with existing content
- Maintain compliance language and professional tone
- Make sure the new content addresses the user's specific request

Return the ENHANCED content for this section with the requested additions."""
        else:
            prompt = f"""The user wants to enhance the document with this request: "{user_query}"

Section Name: {section}

Current Content:
{content}

This section may be less directly related to the user's specific request, but still improve it by:
1. Enhancing clarity and completeness
2. Maintaining compliance language
3. General improvements

Return the enhanced content for this section."""
        
        suggestions[section] = llm_service.generate_response_text(prompt)
        logger.info(f"[Document Enhancer] Completed enhancement for {section}")

    logger.info(f"[Document Enhancer] Enhancement completed for all {len(suggestions)} sections")
    
    # Generate a response explaining what was enhanced
    logger.info("[Document Enhancer] Generating response about enhancements")
    enhanced_sections_list = ", ".join(relevant_sections) if relevant_sections else "all sections"
    response_prompt = f"""The user requested: "{user_query}"

I have enhanced the document based on this request. The following sections were specifically updated with the requested content:
{enhanced_sections_list}

Generate a clear, professional, and helpful response that:
1. Directly acknowledges what the user asked for ("{user_query}")
2. Confirms that the requested content has been ADDED to the relevant sections
3. Explains which sections were updated (focus on: {enhanced_sections_list})
4. Provides a brief summary of what was added
5. Invites the user to review the enhanced document

Be specific about what was added, not generic. The user wants to know their request was fulfilled."""
    
    enhancement_response = llm_service.generate_response_text(response_prompt)
    logger.info(f"[Document Enhancer] Generated response length: {len(enhancement_response)} chars")
    
    return {
        "document_suggestions": suggestions,
        "chat_response": enhancement_response
    }



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