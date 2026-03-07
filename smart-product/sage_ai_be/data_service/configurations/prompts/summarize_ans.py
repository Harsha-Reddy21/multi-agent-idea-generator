"""
Prompt for summarizing answers to questions in a concise manner and multi-turn support.
"""

SUMMARIZE_MULTI_SOURCE_PROMPT = """Create a brief summary from the following answer. Make it shorter and more concise.

**Answer to Summarize:**
{multi_source_answer}

**Instructions:**
- Merge similar points into one
- Remove repeated information
- Use fewer words to express the same meaning
- Keep only the most important facts
- Write 1-2 sentences maximum

**Rules:**
- No extra explanations
- No introductory phrases
- Plain, direct language only
- Return JSON format

**Output:**
{{
  "summarized_answer": "Brief summary here"
}}
"""
