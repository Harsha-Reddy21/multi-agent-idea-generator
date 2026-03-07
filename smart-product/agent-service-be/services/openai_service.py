"""OpenAI GPT service — handles conversation, intent classification, coverage scoring, and enhancement."""

from __future__ import annotations

import json
import logging
from typing import Any

from openai import AsyncOpenAI

from config import settings

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.openai_api_key)
MODEL = settings.openai_model

_KEY_IS_PLACEHOLDER = settings.openai_api_key in ("your-openai-api-key-here", "")


# ---------------------------------------------------------------------------
# Intent classification
# ---------------------------------------------------------------------------

INTENT_SYSTEM_PROMPT = """You are an intent classifier for a form-filling assistant agent.

Current question being asked: {current_question}
Current question ID: {current_question_id}
Previously answered questions: {answered_summary}

Classify the user's message into EXACTLY one of these intents:

- ANSWER_CURRENT — the message is an answer to the current question
- EDIT_FIELD:<question_id> — user wants to change a previously filled field (include the question_id)
- ASK_ABOUT:<block_name> — user is asking about a field in a specific block (system_info, user_info, tech_info)
- ASK_HELP — user needs help with the current question
- ASK_GENERAL — general question about the process or the system
- COMMAND_SKIP — user wants to skip the current question
- COMMAND_BACK — user wants to go to a previous question
- COMMAND_ENHANCE — user wants to improve/enhance their last answer
- COMMAND_STATUS — user wants to see progress
- UNCLEAR — cannot determine intent

Respond with ONLY the intent label.
If an answer could plausibly be answering the current question, prefer ANSWER_CURRENT.
"""


async def classify_intent(
    user_message: str,
    current_question_text: str,
    current_question_id: str,
    answered_summary: str,
) -> dict[str, str]:
    if _KEY_IS_PLACEHOLDER:
        return {"type": "ANSWER_CURRENT", "target": ""}

    prompt = INTENT_SYSTEM_PROMPT.format(
        current_question=current_question_text,
        current_question_id=current_question_id,
        answered_summary=answered_summary,
    )
    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0,
        max_tokens=50,
    )
    raw = response.choices[0].message.content.strip()
    # Parse intent
    if ":" in raw:
        parts = raw.split(":", 1)
        return {"type": parts[0].strip(), "target": parts[1].strip()}
    return {"type": raw, "target": ""}


# ---------------------------------------------------------------------------
# Coverage scoring (suggestions evaluation)
# ---------------------------------------------------------------------------

COVERAGE_SYSTEM_PROMPT = """You are a quality evaluator. Given a user's answer and a list of suggestions for a question, evaluate how well the answer addresses each suggestion.

For each suggestion, respond with:
- "completed" if the answer reasonably addresses the core intent
- "required" if fundamental information is missing

Be generous: if the core intent is addressed, mark completed. Only mark required if truly missing.

Respond ONLY in this JSON format:
{
  "suggestions_analysis": [
    {"text": "suggestion text", "status": "completed|required", "rationale": "brief reason"}
  ],
  "score": 0.75
}

Score guide: 1.0=fully covers all, 0.7-0.9=most covered, 0.4-0.6=partial, 0.1-0.3=minimal, 0.0=none.
"""


async def evaluate_coverage(answer: str, question_text: str, suggestions: list[str]) -> dict[str, Any]:
    if not suggestions:
        return {"suggestions_analysis": [], "score": 1.0}

    if _KEY_IS_PLACEHOLDER:
        # Without GPT, give a basic pass-through score
        return {
            "suggestions_analysis": [{"text": s, "status": "completed", "rationale": "auto-accepted"} for s in suggestions],
            "score": 0.8,
        }

    suggestions_text = "\n".join(f"- {s}" for s in suggestions)
    user_content = f"Question: {question_text}\n\nUser's Answer: {answer}\n\nSuggestions to evaluate:\n{suggestions_text}"

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": COVERAGE_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0,
            max_tokens=800,
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        score = max(0.0, min(1.0, float(result.get("score", 0.5))))
        result["score"] = score
        return result
    except Exception:
        logger.exception("Coverage evaluation failed")
        return {"suggestions_analysis": [], "score": 0.5}


# ---------------------------------------------------------------------------
# Answer enhancement
# ---------------------------------------------------------------------------

ENHANCE_SYSTEM_PROMPT = """You are an expert writer specializing in project documentation.

Given a user's answer and the question's suggestions, improve the answer to:
1. Address any missing suggestions
2. Improve clarity and structure
3. Preserve the user's original intent

Do NOT fabricate information. Only enhance with what the user has provided.

Respond ONLY in this JSON format:
{
  "enhanced_text": "The improved answer",
  "rationale": "Brief explanation of what was improved"
}
"""


async def enhance_answer(answer: str, question_text: str, suggestions: list[str]) -> dict[str, str]:
    if _KEY_IS_PLACEHOLDER:
        return {"enhanced_text": answer, "rationale": "Enhancement unavailable (no API key configured)"}

    suggestions_text = "\n".join(f"- {s}" for s in suggestions)
    user_content = f"Question: {question_text}\n\nOriginal Answer: {answer}\n\nSuggestions:\n{suggestions_text}"

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": ENHANCE_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.3,
            max_tokens=600,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        logger.exception("Enhancement failed")
        return {"enhanced_text": answer, "rationale": "Enhancement unavailable"}


# ---------------------------------------------------------------------------
# Conversational agent response
# ---------------------------------------------------------------------------

AGENT_SYSTEM_PROMPT = """You are a friendly, professional AI assistant helping a user fill out an innovation submission form.

Your role:
- Ask the current question naturally in conversation
- When the user answers, acknowledge briefly and transition to what comes next
- If the user asks for help, give guidance based on the question context and suggestions
- If the user asks a general question, answer it helpfully then steer back
- Keep responses concise (2-4 sentences max)
- Never reveal internal question IDs to the user
- Be encouraging and supportive

Current context:
- Form type: {form_type}
- Questions answered so far: {answered_count}/{total_count}
"""


async def generate_agent_response(
    context_message: str,
    form_type: str,
    answered_count: int,
    total_count: int,
    conversation_history: list[dict[str, str]],
) -> str:
    if _KEY_IS_PLACEHOLDER:
        return context_message

    system = AGENT_SYSTEM_PROMPT.format(
        form_type=form_type,
        answered_count=answered_count,
        total_count=total_count,
    )

    messages: list[dict[str, str]] = [{"role": "system", "content": system}]
    # Add last 10 conversation messages for context
    messages.extend(conversation_history[-10:])
    messages.append({"role": "user", "content": context_message})

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.5,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        logger.exception("Agent response generation failed")
        return context_message


# ---------------------------------------------------------------------------
# General Q&A
# ---------------------------------------------------------------------------

async def answer_general_question(question: str, form_context: str) -> str:
    if _KEY_IS_PLACEHOLDER:
        return "I'm running without an AI model right now. Please set your OPENAI_API_KEY in the .env file to enable AI responses."

    system = (
        "You are a helpful assistant for an innovation submission system. "
        "Answer the user's question briefly and helpfully. Context: " + form_context
    )
    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": question},
            ],
            temperature=0.5,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        logger.exception("General Q&A failed")
        return "I'm sorry, I couldn't process that right now. Let's continue with the form."
