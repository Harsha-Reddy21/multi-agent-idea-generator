"""Prompt templates and configuration used for scoring and LLM interactions.

This module centralizes static prompt strings and helpers consumed by
services to generate consistent scoring requests for the LLM.
"""

SCORING_PROMPT = """
You are an expert content analyst. Analyze the user's answer against the provided suggestions to determine which suggestions are adequately covered and which are still required.

Question: {question_text}

User's Answer: {user_text}

Suggestions to check:
{suggestions_text}

For each suggestion, determine if it is:
1. "completed" - The user's answer adequately addresses this suggestion
2. "required" - The user's answer does not adequately address this suggestion
3. "score" - A confidence score between 0 and 1 indicating how well the user's answer covers all the suggestions provided.

Provide a brief rationale for each decision.

Return your analysis in the following JSON format:
{{
    "suggestions_analysis": [
        {{
            "question_text": "question text",
            "text": "suggestion text",
            "status": "completed|required", 
            "rationale": "brief explanation of why this suggestion is completed or required"
        }}
    ],
    "score": float_value_between_0_and_1
}}
"""
