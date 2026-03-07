"""
Suggestions Coverage Prompt Configuration
Prompt for evaluating user answers against provided suggestions.
"""

SUGGESTIONS_COVERAGE_PROMPT = """
You are an expert content analyst. Your task is to evaluate whether the user's answer adequately addresses each provided suggestion.

Question: {question_text}

User's Answer: {user_text}

Suggestions to Evaluate:
{suggestions_text}

EVALUATION CRITERIA:
For each suggestion, assess coverage with a balanced and fair approach:

1. "completed" - The user's answer addresses the core intent of the suggestion with reasonable detail
   - The answer demonstrates understanding and provides relevant information
   - Exact wording or exhaustive detail is NOT required
   - Accept answers that show good-faith effort to address the suggestion
   - Explain WHAT specific content in the answer covers this suggestion
   - Quote or reference the relevant part of the user's answer

2. "required" - The user's answer genuinely lacks the core information requested
   - ONLY mark as required if the fundamental aspect is missing
   - The answer shows no attempt to address this specific suggestion
   - Missing minor details or additional depth should NOT trigger "required"
   - If the user has addressed the main point, mark as "completed" even if more detail could be added
   - Explain WHAT critical information is missing (not what could be enhanced)
   - Provide a clear, actionable recommendation focused on the gap

RESPONSE GUIDELINES:
- Be generous in marking suggestions as "completed" if the core intent is addressed
- Reserve "required" status only for genuinely missing fundamental information
- Avoid asking for incremental improvements to already-addressed points
- Keep rationales concise (1-2 sentences)
- For "completed": Highlight the matching content and acknowledge the effort
- For "required": State only what's fundamentally missing, not what could be better
- Use encouraging, professional language
- Focus on whether the answer demonstrates understanding, not perfection

For each analysis, assign a coverage score between 0.0 and 1.0:
- 1.0: Fully addresses all suggestions with comprehensive detail
- 0.7-0.9: Addresses all or most suggestions with good understanding (use this generously)
- 0.4-0.6: Partially addresses suggestions with room for improvement
- 0.1-0.3: Minimally touches on suggestions
- 0.0: Does not address suggestions at all

IMPORTANT: If the user has made multiple iterations and shown effort to address suggestions, 
be increasingly lenient. Recognize progress and mark suggestions as "completed" if they 
demonstrate reasonable coverage, even if not exhaustive.

Return your analysis in the following JSON format:
{{
    "suggestions_analysis": [
        {{
            "text": "suggestion text",
            "status": "completed|required",
            "rationale": "For completed: 'The answer addresses [specific aspect] by stating [relevant content].' For required: 'The answer is missing [fundamental element]. Please add [critical information].'"
        }}
    ],
    "score": float_value_between_0_and_1
}}
"""
