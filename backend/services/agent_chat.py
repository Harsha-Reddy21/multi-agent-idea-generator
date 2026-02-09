from typing import TypedDict, List, Dict, Optional
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import os
import json
import re

from dotenv import load_dotenv
load_dotenv()
load_dotenv(override=True)

openai_api_key = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.2
)

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

    response = llm.invoke([HumanMessage(content=prompt)]).content
    result = parse_llm_json(response)

    return {
        "intent": result["intent"],
        "relevance_score": float(result["relevance"]),
        "ambiguity_score": float(result["ambiguity"]),
    }


def solution_agent(state: AgentState):
    content = state["document"].get("solution_overview", "")

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

    return {
        "solution_feedback": llm.invoke([HumanMessage(content=prompt)]).content
    }



def ai_registry_agent(state: AgentState):
    content = state["document"].get("ai_registry", "")

    prompt = f"""
Review AI Registry & Innovation Pipeline section.

Content:
{content}

Check for:
- Missing deployment info
- Missing maturity
- Third-party usage clarity
"""

    return {
        "ai_registry_feedback": llm.invoke([HumanMessage(content=prompt)]).content
    }


def legal_agent(state: AgentState):
    content = state["document"].get("digital_legal", "")

    prompt = f"""
Review Digital Legal Office (Privacy).

Content:
{content}

Check for:
- Missing accountability
- Missing privacy concern clarity
"""

    return {
        "legal_feedback": llm.invoke([HumanMessage(content=prompt)]).content
    }



def security_agent(state: AgentState):
    content = state["document"].get("security_architecture", "")

    prompt = f"""
Review Security Architecture section.

Content:
{content}

Check for:
- AI usage clarity
- Hosting details
- Data types
"""

    return {
        "security_feedback": llm.invoke([HumanMessage(content=prompt)]).content
    }


def third_party_agent(state: AgentState):
    content = state["document"].get("third_party", "")

    prompt = f"""
Review Third Party Engagement section.

Content:
{content}

Check for:
- External exposure
- Vendor risks
"""

    return {
        "third_party_feedback": llm.invoke([HumanMessage(content=prompt)]).content
    }


def chat_responder(state: AgentState):
    feedbacks = [
        state.get("solution_feedback"),
        state.get("ai_registry_feedback"),
        state.get("legal_feedback"),
        state.get("security_feedback"),
        state.get("third_party_feedback"),
    ]

    relevant_feedback = [f for f in feedbacks if f and "sufficient" not in f.lower()]

    if state["relevance_score"] < 0.3:
        response = "This query is not relevant to the current idea document."
    elif not relevant_feedback:
        response = "Your document looks complete for this stage."
    else:
        response = "Here are areas that need attention:\n\n" + "\n\n".join(relevant_feedback)

    return {"chat_response": response}




def document_enhancer(state: AgentState):
    suggestions = {}

    for section, content in state["document"].items():
        prompt = f"""
Improve this section without removing compliance language.

Section:
{section}

Content:
{content}
"""
        suggestions[section] = llm.invoke([HumanMessage(content=prompt)]).content

    return {"document_suggestions": suggestions}



def confidence_agent(state: AgentState):
    confidence = (
        0.5 * state["relevance_score"]
        + 0.3 * (1 - state["ambiguity_score"])
        + 0.2
    )

    return {"confidence_score": round(min(confidence, 1.0), 2)}



def route_by_intent(state: AgentState):
    if state["intent"] == "irrelevant":
        return "respond"
    if state["intent"] == "enhance":
        return "enhance"
    return "review"



graph = StateGraph(AgentState)

graph.set_entry_point("intent")

graph.add_node("intent", intent_classifier)

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
        "review": "solution",
        "enhance": "enhance",
        "respond": "respond",
    }
)

# Parallel fan-out
graph.add_edge("solution", "ai_registry")
graph.add_edge("ai_registry", "legal")
graph.add_edge("legal", "security")
graph.add_edge("security", "third_party")

graph.add_edge("third_party", "respond")
graph.add_edge("respond", "confidence")
graph.add_edge("enhance", "confidence")
graph.add_edge("confidence", END)

# Compile the graph - this is the main entry point for the agent system
agent_app = graph.compile()