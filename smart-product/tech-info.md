# Technical Documentation: Confidence Score System for Agentic AI Application

*Based on the exact Sage AI scoring algorithm from `sage_ai_be/data_service/service/scoring_service.py`*

---

## 1. System Overview

The confidence score is a **per-submission quality metric** (0.0 – 1.0) that measures how well the user's answers address predefined suggestions for each question. It is composed of two layers:

**Layer 1** — Per-question **coverage scores** (LLM evaluates each answer against suggestions)
**Layer 2** — Aggregate **approval score** (weighted combination of all coverage scores with mandatory penalties)

```
                        CONFIDENCE SCORE SYSTEM
                        
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   LAYER 1: PER-QUESTION COVERAGE SCORE                     │
│   (Runs after EVERY answer the user gives)                  │
│                                                             │
│   User Answer + Question Text + Suggestions[]               │
│              │                                              │
│              ▼                                              │
│   ┌──────────────────────────────┐                         │
│   │  GPT: Evaluate answer vs     │                         │
│   │  each suggestion             │                         │
│   │  → "completed" or "required" │                         │
│   │  → rationale per suggestion  │                         │
│   │  → overall score: 0.0 – 1.0 │                         │
│   └──────────────────────────────┘                         │
│              │                                              │
│              ▼                                              │
│   Store: coverage_scores[question_id] = 0.78               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   LAYER 2: AGGREGATE APPROVAL SCORE                        │
│   (Recalculated after every coverage score update)          │
│                                                             │
│   1. Normalize weights → sum to 1.0                        │
│   2. Base = Σ(weight_i × coverage_i)                       │
│   3. Penalty = Π(1 - 0.15) for each mandatory < 0.6       │
│   4. Final = Base × Penalty                                │
│              │                                              │
│              ▼                                              │
│   Push via WebSocket → Tech Info panel shows 78.2%          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Configuration Constants

Directly from the Sage AI settings:

```python
# Settings (from sage_ai_be/data_service/configurations/settings.py)

MANDATORY_THRESHOLD     = 0.6    # A mandatory question must score above this
STATIC_PENALTY          = 0.15   # 15% penalty per failing mandatory question
DEFAULT_WEIGHT          = 0.5    # Weight assigned if none configured
DEFAULT_MANDATORY_CONF  = 0.5    # Confidence assumed if mandatory Q not yet scored
DEFAULT_CONFIDENCE      = 0.5    # Confidence assumed if no suggestions found

# LLM settings
ANALYSIS_TIMEOUT        = 10     # Seconds per LLM call
MAX_RETRIES             = 3      # Retry attempts for failed LLM calls
MAX_CONCURRENT_CALLS    = 5      # Semaphore limit for parallel LLM calls
```

---

## 3. Layer 1 — Per-Question Coverage Score

### 3.1 When It Triggers

In our agentic app, this runs **every time the user answers a question that has suggestions**. It is an **async background task** — it does NOT block the chat.

```
User answers question in chat
       │
       ▼
Agent stores answer → fires ChatResponse (next question)
       │
       └──── ASYNC BACKGROUND ────►  coverage_scoring_task(question_id, answer)
                                            │
                                            ▼
                                     WebSocket push → Tech Info panel
```

### 3.2 LLM Prompt (Exact from Sage AI)

```
SCORING_PROMPT:

"You are an expert content analyst. Analyze the user's answer against the 
provided suggestions to determine which suggestions are adequately covered 
and which are still required.

Question: {question_text}
User's Answer: {user_text}

Suggestions to check:
{suggestions_text}

For each suggestion, determine if it is:
1. "completed" — The user's answer adequately addresses this suggestion
2. "required" — The user's answer does not adequately address this suggestion

Return JSON:
{
    "suggestions_analysis": [
        {
            "text": "suggestion text",
            "status": "completed|required",
            "rationale": "explanation"
        }
    ],
    "score": float_between_0_and_1
}"
```

### 3.3 Suggestions Coverage Prompt (Detailed Version from Sage AI)

```
SUGGESTIONS_COVERAGE_PROMPT:

"You are an expert content analyst. Your task is to evaluate whether the 
user's answer adequately addresses each provided suggestion.

Question: {question_text}
User's Answer: {user_text}

Suggestions to Evaluate:
{suggestions_text}

EVALUATION CRITERIA:

1. "completed" — The user's answer addresses the core intent of the suggestion 
   with reasonable detail
   - The answer demonstrates understanding and provides relevant information
   - Exact wording or exhaustive detail is NOT required
   - Accept answers that show good-faith effort to address the suggestion
   - Explain WHAT specific content in the answer covers this suggestion
   - Quote or reference the relevant part of the user's answer

2. "required" — The user's answer genuinely lacks the core information requested
   - ONLY mark as required if the fundamental aspect is missing
   - The answer shows no attempt to address this specific suggestion
   - Missing minor details or additional depth should NOT trigger "required"
   - Explain WHAT critical information is missing
   - Provide a clear, actionable recommendation focused on the gap

RESPONSE GUIDELINES:
- Be generous in marking suggestions as "completed" if the core intent is addressed
- Reserve "required" status only for genuinely missing fundamental information
- Avoid asking for incremental improvements to already-addressed points
- Keep rationales concise (1-2 sentences)
- Use encouraging, professional language
- Focus on whether the answer demonstrates understanding, not perfection

Coverage score ranges:
- 1.0: Fully addresses all suggestions comprehensively
- 0.7-0.9: Addresses all or most suggestions (use this generously)
- 0.4-0.6: Partially addresses suggestions with room for improvement
- 0.1-0.3: Minimally touches on suggestions
- 0.0: Does not address suggestions at all

Return JSON:
{
    "suggestions_analysis": [
        {
            "text": "suggestion text",
            "status": "completed|required",
            "rationale": "explanation"
        }
    ],
    "score": float_value_between_0_and_1
}"
```

### 3.4 Score Ranges

| Range | Meaning |
|-------|---------|
| **1.0** | Fully addresses all suggestions comprehensively |
| **0.7–0.9** | Addresses all or most suggestions (use generously) |
| **0.4–0.6** | Partially addresses with room for improvement |
| **0.1–0.3** | Minimally touches on suggestions |
| **0.0** | Does not address suggestions at all |

### 3.5 Flow in Our Agentic App

```python
# agent-service-be/services/scoring_service.py

async def score_question_answer(session_id, question_id, user_answer):
    """
    Background task: score a single question answer.
    Called after every answer with suggestions.
    """
    
    # Step 1: Get suggestions for this question
    suggestions = QUESTION_REGISTRY[question_id].suggestions
    if not suggestions:
        return  # No suggestions = no scoring for this question
    
    question_text = QUESTION_REGISTRY[question_id].text
    
    # Step 2: Call GPT with Sage AI scoring prompt
    prompt = SCORING_PROMPT.format(
        question_text=question_text,
        user_text=user_answer,
        suggestions_text="\n".join(f"- {s}" for s in suggestions)
    )
    
    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,   # Deterministic (same as Sage AI)
        seed=42            # Fixed seed (same as Sage AI)
    )
    
    # Step 3: Parse JSON response
    result = parse_json_from_response(response.choices[0].message.content)
    # result = {
    #   "suggestions_analysis": [
    #     {"text": "...", "status": "completed", "rationale": "..."},
    #     {"text": "...", "status": "required", "rationale": "..."}
    #   ],
    #   "score": 0.78
    # }
    
    # Step 4: Clamp score to [0.0, 1.0]
    score = max(0.0, min(1.0, float(result["score"])))
    
    # Step 5: Store in session
    session = get_session(session_id)
    session.coverage_scores[question_id] = score
    session.coverage_analysis[question_id] = result["suggestions_analysis"]
    
    # Step 6: Recalculate aggregate (Layer 2)
    aggregate = calculate_aggregate_approval(session)
    
    # Step 7: Push to frontend via WebSocket
    await websocket_manager.send(session_id, {
        "type": "score_update",
        "question_id": question_id,
        "coverage_score": score,
        "suggestions_analysis": result["suggestions_analysis"],
        "aggregate_score": aggregate,
    })
```

---

## 4. Layer 2 — Aggregate Approval Score

This is the **main confidence score** shown in the Tech Info panel. It combines all per-question coverage scores into one number.

### 4.1 Algorithm (Exact from Sage AI `aggregate_approval()`)

```
INPUT:
  coverage_scores: { "D-Q01": 0.82, "D-Q02": 0.75, "AI-Q6": 0.90, ... }
  weights:         { "D-Q01": 1.0,  "D-Q02": 1.0,  "AI-Q6": 1.5,  ... }
  mandatory:       { "AI-Q6", "AI-Q7", "AI-Q12", "AI-Q20", "AI-Q23" }

ALGORITHM:

┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: NORMALIZE CONFIDENCES                                   │
│                                                                  │
│ For each question_id in (weights ∪ coverage_scores ∪ mandatory): │
│                                                                  │
│   IF coverage_score exists:                                      │
│     normalized = clamp(score, 0.0, 1.0)                         │
│                                                                  │
│   ELSE IF question is mandatory:                                 │
│     normalized = DEFAULT_MANDATORY_CONFIDENCE (0.5)              │
│     (Assume moderate confidence for unscored mandatory Qs)       │
│                                                                  │
│   ELSE (non-mandatory, not scored):                              │
│     IF policy = IGNORE_AND_RENORM:                               │
│       SKIP this question entirely (don't include in calc)        │
│     IF policy = ZERO_SCORE:                                      │
│       normalized = 0.0                                           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ STEP 2: NORMALIZE WEIGHTS                                       │
│                                                                  │
│ Only include questions with positive weight AND not skipped      │
│                                                                  │
│   total_weight = Σ weight_i  (for included questions)           │
│   normalized_weight_i = weight_i / total_weight                 │
│                                                                  │
│   (So all normalized weights sum to 1.0)                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ STEP 3: CALCULATE BASE WEIGHTED SCORE                           │
│                                                                  │
│   base_score = Σ (normalized_weight_i × normalized_confidence_i)│
│                                                                  │
│   This is a weighted average of all coverage scores              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ STEP 4: APPLY MANDATORY PENALTIES                               │
│                                                                  │
│   penalty_multiplier = 1.0                                      │
│                                                                  │
│   For each mandatory question:                                   │
│     IF confidence < MANDATORY_THRESHOLD (0.6):                  │
│       penalty_multiplier *= (1.0 - STATIC_PENALTY)              │
│       penalty_multiplier *= 0.85                                │
│                                                                  │
│   This is COMPOUNDING: 2 failing mandatory Qs                   │
│   → penalty = 0.85 × 0.85 = 0.7225                             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ STEP 5: FINAL SCORE                                             │
│                                                                  │
│   final_score = base_score × penalty_multiplier                 │
│                                                                  │
│   Range: 0.0 – 1.0                                             │
│   Display: (final_score × 100)%                                │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Exact Code Implementation (from Sage AI)

```python
def aggregate_approval(
    confidences: Dict[str, float],   # {question_id: coverage_score}
    weights: Dict[str, float],       # {question_id: weight}
    mandatory: set,                  # set of mandatory question_ids
    missing_policy: MissingPolicy = MissingPolicy.IGNORE_AND_RENORM,
    settings: Optional[Settings] = None,
) -> float:

    # Load configuration constants from settings
    STATIC_PENALTY = settings.scoring_static_penalty                   # 0.15
    MANDATORY_THRESHOLD = settings.mandatory_threshold                 # 0.6
    DEFAULT_MANDATORY_CONFIDENCE = settings.scoring_default_mandatory_confidence  # 0.5

    normalized_confidences = {}
    normalized_weights = {}
    total_weight = 0.0
    included_questions = []
    
    # Get all unique question IDs from all sources
    all_question_ids = set(weights.keys()) | set(confidences.keys()) | mandatory

    # Combined normalization and weight calculation
    for question_id in all_question_ids:
        # Step 1: Confidence normalization
        raw_confidence = confidences.get(question_id)

        if raw_confidence is None:
            if question_id in mandatory:
                confidence = DEFAULT_MANDATORY_CONFIDENCE   # 0.5
            else:
                confidence = None
        else:
            confidence = min(1.0, max(0.0, raw_confidence))   # Clamp [0, 1]

        # Apply missing policy
        if confidence is None and missing_policy == MissingPolicy.IGNORE_AND_RENORM:
            continue

        normalized_confidences[question_id] = (
            confidence if confidence is not None else 0.0
        )

        # Step 2: Weight processing
        question_weight = max(0.0, weights.get(question_id, 0.0) or 0.0)

        if question_weight > 0:
            included_questions.append(question_id)
            total_weight += question_weight

    # Step 3: Weight normalization
    if not included_questions or total_weight == 0:
        raise ScoringValidationError(
            "No valid questions to score or total weight is zero"
        )

    for qid in included_questions:
        normalized_weights[qid] = (weights.get(qid, 0.0) or 0.0) / total_weight

    # Step 4: Calculate base weighted score
    base_score = sum(
        normalized_weights[qid] * normalized_confidences[qid]
        for qid in included_questions
    )

    # Step 5: Apply mandatory question penalties
    penalty_multiplier = 1.0

    for qid in mandatory:
        if (
            normalized_confidences.get(qid, DEFAULT_MANDATORY_CONFIDENCE)
            < MANDATORY_THRESHOLD
        ):
            penalty_multiplier *= 1.0 - STATIC_PENALTY   # *= 0.85

    return base_score * penalty_multiplier
```

### 4.3 Missing Policy Enum

```python
class MissingPolicy(str, Enum):
    IGNORE_AND_RENORM = "ignore_and_renorm"  # Skip missing, renormalize weights
    ZERO_SCORE = "zero_score"                # Assign 0.0 to missing (stricter)
```

### 4.4 Worked Example

```
Questions answered so far:
  D-Q01 (Title):         score = 0.92, weight = 1.0, mandatory = NO
  D-Q02 (Users/Problem): score = 0.65, weight = 1.0, mandatory = NO
  AI-Q6 (Users/Use):     score = 0.85, weight = 1.5, mandatory = YES
  AI-Q7 (Scope):         score = 0.42, weight = 1.0, mandatory = YES  ⚠ Below 0.6
  AI-Q12 (User Desc):    Not answered yet         , mandatory = YES

─── STEP 1: Normalize Confidences ───
  D-Q01: 0.92 (clamped, valid)
  D-Q02: 0.65 (clamped, valid)
  AI-Q6: 0.85 (clamped, valid)
  AI-Q7: 0.42 (clamped, valid)
  AI-Q12: None → mandatory → DEFAULT = 0.5

─── STEP 2: Normalize Weights ───
  total_weight = 1.0 + 1.0 + 1.5 + 1.0 + 1.0 = 5.5
  D-Q01: 1.0/5.5 = 0.1818
  D-Q02: 1.0/5.5 = 0.1818
  AI-Q6: 1.5/5.5 = 0.2727
  AI-Q7: 1.0/5.5 = 0.1818
  AI-Q12: 1.0/5.5 = 0.1818

─── STEP 3: Base Score ───
  base = (0.1818 × 0.92) + (0.1818 × 0.65) + (0.2727 × 0.85) 
       + (0.1818 × 0.42) + (0.1818 × 0.50)
  base = 0.1673 + 0.1182 + 0.2318 + 0.0764 + 0.0909
  base = 0.6846

─── STEP 4: Mandatory Penalties ───
  AI-Q6:  0.85 ≥ 0.6 → NO penalty
  AI-Q7:  0.42 < 0.6 → penalty *= 0.85 → 0.85
  AI-Q12: 0.50 < 0.6 → penalty *= 0.85 → 0.7225

─── STEP 5: Final Score ───
  final = 0.6846 × 0.7225 = 0.4946

  Display: 49.5% confidence
  
  ⚠ Low due to:
    1. AI-Q7 scored 0.42 (below 0.6 threshold)
    2. AI-Q12 not answered yet (defaults to 0.5, also below 0.6)
    3. Both triggered 15% compounding penalty (0.85 × 0.85)
```

---

## 5. Conditional Logic (AI Registry Form)

Before calculating, the system determines **which mandatory questions are active** based on conditional answers:

```
                    ┌─────────┐
                    │ AI-Q15  │
                    │ "Additional technical info?"
                    └────┬────┘
                         │
                    ┌────┴────┐
                    ▼         ▼
               AI-Q15=YES   AI-Q15=NO
                    │         │
                    │         └──► REMOVE from scoring:
                    │               • AI-Q20 (Data Description)
                    │               • AI-Q23 (Impact if Wrong)
                    │               (These questions don't exist,
                    │                so they can't be scored)
                    │
                    ▼
            ┌───────────┐
            │  AI-Q22   │
            │  "Human review of AI output?"
            └─────┬─────┘
                  │
        ┌─────────┼──────────┐
        ▼         ▼          ▼
    "Yes-100%"  "Sampling"  "No"
        │         │          │
        │         └────┬─────┘
        │              ▼
        │         AI-Q23 IS MANDATORY
        │         (Must explain impact)
        │
        └──► AI-Q23 REMOVED from scoring
             (Not needed if 100% human review)
```

### 5.1 Implementation

```python
def determine_active_mandatory_questions(session):
    """
    Determine which mandatory questions should be scored.
    Replicates Sage AI _determine_questions_to_analyze()
    """
    # Start with ALL configured mandatory questions
    active = set(MANDATORY_QUESTIONS.keys())  
    # e.g. {"AI-Q6", "AI-Q7", "AI-Q12", "AI-Q20", "AI-Q23"}
    
    answers = session.answers
    
    # Check AI-Q15
    ai15 = answers.get("AI-Q15", "")
    ai15_is_yes = "yes" in str(ai15).lower()
    
    if not ai15_is_yes:
        # AI-Q15 = "No" → remove conditional questions
        active.discard("AI-Q20")
        active.discard("AI-Q23")
    else:
        # AI-Q15 = "Yes" → check AI-Q22
        ai22 = answers.get("AI-Q22", "")
        ai22_text = str(ai22).lower()
        ai22_triggers_q23 = ("no" in ai22_text) or ("sampling" in ai22_text)
        
        if not ai22_triggers_q23:
            # AI-Q22 = "Yes - 100%" → Q23 not needed
            active.discard("AI-Q23")
    
    return active
```

### 5.2 Exact Sage AI Code

```python
def _determine_questions_to_analyze(mandatory, form_data):
    # Start with all mandatory questions
    questions_to_analyze = set(mandatory.keys())

    # Build a lookup for form answers
    form_answers = {entry.questionId: entry.answer for entry in form_data}

    # Helper function to check answer text
    def check_answer(answer, keywords):
        if answer is None:
            return False
        if isinstance(answer, list):
            answer_text = " ".join(str(a) for a in answer).lower()
        else:
            answer_text = str(answer).lower()
        return any(keyword.lower() in answer_text for keyword in keywords)

    # Check AI-Q15 answer
    ai15_answer = form_answers.get("AI-Q15")
    ai15_is_yes = check_answer(ai15_answer, ["yes"])

    if not ai15_is_yes:
        conditional_questions = ["AI-Q20", "AI-Q23"]
        for question_id in conditional_questions:
            if question_id in questions_to_analyze:
                questions_to_analyze.remove(question_id)
    else:
        ai22_answer = form_answers.get("AI-Q22")
        ai22_triggers_ai23 = check_answer(ai22_answer, ["no", "yes - a sampling"])

        if "AI-Q23" in questions_to_analyze:
            if not ai22_triggers_ai23:
                questions_to_analyze.remove("AI-Q23")

    return questions_to_analyze
```

---

## 6. Complete Scoring Orchestrator Flow (from Sage AI `scoring_service()`)

```
scoring_service(request) is called:

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 1: VALIDATE INPUT                                               │
│   • request must be ScoreRequest instance                            │
│   • form_data must be non-empty list                                 │
│   • form_type must be non-empty string                               │
│                                                                      │
│ STEP 2: FETCH CONFIGURATION                                         │
│   • Query QuestionScoringConfig table                                │
│     → Returns: {question_id, weight, is_mandatory, threshold}        │
│   • Query Suggestions table by form_type                             │
│     → Returns: {question_id: suggestions[]}                          │
│                                                                      │
│ STEP 3: BUILD WEIGHTS & MANDATORY MAPPINGS                          │
│   • weights = {question_id: weight_float}                            │
│   • mandatory = {question_id: threshold}                             │
│   • Default weight = 0.5 if None                                     │
│                                                                      │
│ STEP 4: DETERMINE ACTIVE MANDATORY QUESTIONS                        │
│   • Apply AI-Q15 / AI-Q22 conditional logic                         │
│   • Result: set of question_ids that should actually be scored       │
│                                                                      │
│ STEP 5: LOAD EXISTING COVERAGE SCORES                               │
│   • Query SuggestionCoverageScore table                              │
│   • Filter by submission_id AND questions_to_analyze                 │
│   • Result: {question_id: coverage_score}                            │
│                                                                      │
│ STEP 6: ANALYZE MANDATORY QUESTIONS (PARALLEL LLM CALLS)            │
│   • For each question in questions_to_analyze:                       │
│     a. Get suggestions from lookup                                   │
│     b. Get user's answer from form_data                              │
│     c. Call LLM with SCORING_PROMPT (with semaphore, max 5 parallel) │
│     d. Parse JSON response                                           │
│     e. Validate score ∈ [0.0, 1.0]                                  │
│     f. Store/update SuggestionCoverageScore in DB                    │
│     g. Update confidence_scores dict                                 │
│   • Timeout: 10 seconds per call                                     │
│   • Retries: 3 attempts per question                                 │
│   • On failure: assign default confidence (0.5)                      │
│                                                                      │
│ STEP 7: CALCULATE AGGREGATE APPROVAL                                │
│   • Call aggregate_approval(                                         │
│       confidences=confidence_scores,                                 │
│       weights=weights,                                               │
│       mandatory=questions_to_analyze,                                │
│       missing_policy="ignore_and_renorm"                             │
│     )                                                                │
│   • Returns: float (0.0 – 1.0)                                      │
│                                                                      │
│ STEP 8: PERSIST FINAL SCORE                                         │
│   • Update submission_forms.final_score in DB                        │
│   • Commit transaction                                               │
│                                                                      │
│ STEP 9: RETURN                                                       │
│   • ScoreResponse(submission_id, total_score)                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 7. Complete Flow in the Agentic App

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SCORING FLOW PER ANSWER                           │
│                                                                      │
│  1. User answers question via chat                                   │
│     │                                                                │
│  2. Agent stores answer in session                                   │
│     │                                                                │
│  3. Agent returns next question immediately (NO blocking)            │
│     │                                                                │
│  4. BACKGROUND TASK fires:                                           │
│     │                                                                │
│     ├─ 4a. Get suggestions for this question_id                      │
│     │       from QUESTION_REGISTRY[question_id].suggestions          │
│     │       (If no suggestions → skip scoring for this Q)            │
│     │                                                                │
│     ├─ 4b. Call GPT with SCORING_PROMPT                              │
│     │       Input: question_text + user_answer + suggestions[]       │
│     │       Settings: temperature=0.0, seed=42 (deterministic)       │
│     │       Retry: up to 3 attempts, timeout: 10s per attempt        │
│     │                                                                │
│     ├─ 4c. Parse JSON response                                       │
│     │       Extract: suggestions_analysis[], score                   │
│     │       Validate: score ∈ [0.0, 1.0]                            │
│     │       Handle: retry on parse failure, default 0.5 on total fail│
│     │                                                                │
│     ├─ 4d. Store coverage score                                      │
│     │       session.coverage_scores[question_id] = score             │
│     │                                                                │
│     ├─ 4e. Determine active mandatory questions                      │
│     │       Apply AI-Q15 / AI-Q22 conditional logic                  │
│     │       Result: set of active mandatory question_ids             │
│     │                                                                │
│     ├─ 4f. Calculate aggregate approval                              │
│     │       ┌─────────────────────────────────────────┐             │
│     │       │ For each question with weight > 0:      │             │
│     │       │   if has coverage_score → use it        │             │
│     │       │   if mandatory & no score → use 0.5     │             │
│     │       │   if non-mandatory & no score → SKIP    │             │
│     │       │                                         │             │
│     │       │ Normalize weights to sum to 1.0         │             │
│     │       │                                         │             │
│     │       │ base = Σ(norm_weight × norm_confidence) │             │
│     │       │                                         │             │
│     │       │ penalty = 1.0                           │             │
│     │       │ for each mandatory q:                   │             │
│     │       │   if score < 0.6:                       │             │
│     │       │     penalty *= 0.85                     │             │
│     │       │                                         │             │
│     │       │ final = base × penalty                  │             │
│     │       └─────────────────────────────────────────┘             │
│     │                                                                │
│     └─ 4g. Push via WebSocket to frontend                            │
│            {                                                         │
│              type: "score_update",                                    │
│              question_scores: {                                       │
│                "D-Q01": {score: 0.92, analysis: [...]},              │
│              },                                                       │
│              aggregate_score: 0.784,                                  │
│              penalty_multiplier: 0.85,                               │
│              mandatory_below_threshold: ["AI-Q7"],                    │
│              questions_scored: 4,                                     │
│              questions_total: 8                                       │
│            }                                                         │
│                                                                      │
│  5. Frontend Tech Info panel re-renders                               │
│     • Confidence gauge updates to 78.4%                              │
│     • Per-question score bars update                                 │
│     • Penalty warnings show for failing mandatory Qs                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 8. Agent Suggestions Loop Integration

The coverage score also drives the **agent's behavior** — the agent uses it to decide whether to accept an answer or prompt the user to improve:

```
                     User gives answer
                           │
                           ▼
                  ┌─────────────────┐
                  │ Score answer    │ (same GPT call as above)
                  │ via SCORING_    │
                  │ PROMPT          │
                  └────────┬────────┘
                           │
                  Returns: score + suggestions_analysis
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        score ≥ 0.7               score < 0.7
              │                         │
              ▼                         ▼
    ACCEPT answer              Agent intervenes:
    → Store in session         "Your answer covers 2/4 suggestions.
    → Update block             Missing:
    → Score push (WS)           ⚠ {required suggestion 1}
    → Next question             ⚠ {required suggestion 2}
                               
                               Options:
                               1. Improve your answer
                               2. Let me enhance it (GPT rewrite)
                               3. Accept as-is and move on"
                                        │
                          ┌──────────────┼──────────────┐
                          ▼              ▼              ▼
                    User improves   User says       User says
                    answer          "enhance"       "accept"
                          │              │              │
                          ▼              ▼              ▼
                    Re-score       GPT rewrites   Store as-is
                    (loop back)    → Re-score     → penalty stays
                                   → likely ≥0.7   in aggregate
                                   → accept
```

---

## 9. WebSocket Message Specification

```typescript
// Score update message (Backend → Frontend)
interface ScoreUpdateMessage {
  type: "score_update";
  
  // The question that was just scored
  question_id: string;               // e.g. "D-Q01"
  
  // Per-question detail
  coverage_score: number;            // 0.0 – 1.0
  suggestions_analysis: Array<{
    text: string;                    // suggestion text
    status: "completed" | "required";
    rationale: string;               // why completed/required
  }>;
  
  // Aggregate (recalculated)
  aggregate_score: number;           // 0.0 – 1.0 (THE confidence score)
  penalty_multiplier: number;        // 1.0 = no penalties, <1.0 = penalties applied
  mandatory_below_threshold: string[]; // ["AI-Q7", "AI-Q12"] — which mandatory Qs are failing
  
  // Progress
  questions_scored: number;          // How many have coverage scores
  questions_total: number;           // Total questions with suggestions
}
```

---

## 10. Database Models (from Sage AI)

### 10.1 QuestionScoringConfig

```python
class QuestionScoringConfig(Base):
    __tablename__ = "sage_ai_question_scoring_config"
    
    id          = Column(UUID, primary_key=True, default=uuid4)
    question_id = Column(String, ForeignKey("sage_ai_questions.question_id"), unique=True)
    weight      = Column(Float, default=1.0)         # Scoring weight
    is_mandatory = Column(Boolean, default=False)     # Is this mandatory?
    mandatory_threshold = Column(Float, nullable=True) # Custom threshold (or use global 0.6)
    threshold_penalty   = Column(Float, nullable=True) # Custom penalty (or use global 0.15)
```

### 10.2 SuggestionCoverageScore

```python
class SuggestionCoverageScore(Base):
    __tablename__ = "sage_ai_suggestion_coverage_score"
    
    id            = Column(UUID, primary_key=True, default=uuid4)
    submission_id = Column(UUID, ForeignKey("sage_ai_submissions.id"))
    question_id   = Column(String, ForeignKey("sage_ai_questions.question_id"))
    coverage_score = Column(Float)    # 0.0 – 1.0
    created_at    = Column(DateTime)
    updated_at    = Column(DateTime)
```

### 10.3 Suggestions

```python
class Suggestions(Base):
    __tablename__ = "sage_ai_suggestions"
    
    question_id = Column(String, primary_key=True)
    suggestions = Column(JSON)        # Array of suggestion strings
    form_type   = Column(String, index=True)
    created_at  = Column(DateTime)
    updated_at  = Column(DateTime)
    
    # form_type IN ('ai-registry-form', 'ai-registry-update-form',
    #   'wwtp-form', 'dlo-form', 'gco-risk-registry-form',
    #   'security-arch-form', 'idea-sub-form', 'wwtp-new-vendor-form')
```

---

## 11. Implementation Checklist for `agent-service-be`

| # | File | What to Implement |
|---|------|-------------------|
| 1 | `agent/scoring.py` | `calculate_aggregate_approval()` — exact Sage AI algorithm |
| 2 | `agent/scoring.py` | `determine_active_mandatory_questions()` — conditional logic |
| 3 | `agent/scoring.py` | `score_question_background()` — async task, calls GPT, pushes WS |
| 4 | `forms/registry.py` | Per-question: `suggestions[]`, `weight`, `is_mandatory`, `mandatory_threshold` |
| 5 | `services/openai_service.py` | GPT call with `SCORING_PROMPT`, temperature=0.0, seed=42, max_retries=3 |
| 6 | `routes/websocket.py` | `WS /ws/scores/{session_id}` — push score updates |
| 7 | `agent/orchestrator.py` | After storing answer → `asyncio.create_task(score_question_background(...))` |
| 8 | `agent/orchestrator.py` | Suggestions loop: if score < 0.7 → ask user to address gaps |
| 9 | `agent/prompts.py` | Store SCORING_PROMPT and SUGGESTIONS_COVERAGE_PROMPT |
| 10 | `models/schemas.py` | Pydantic models for ScoreUpdate, SuggestionAnalysis |

---

## 12. Summary Formulas

### Per-Question Coverage Score (Layer 1)

```
coverage_score_i = GPT_evaluate(user_answer, question_text, suggestions[])
                   → float ∈ [0.0, 1.0]
```

### Aggregate Approval Score (Layer 2)

```
                    Σ(w_i · c_i)
base_score =  ─────────────────────
                      Σ(w_i)

                    ┌                                          ┐
penalty =           │  Π  (1 - 0.15)                           │
                    │ j ∈ mandatory                             │
                    │ where c_j < 0.6                           │
                    └                                          ┘

final_score = base_score × penalty

Where:
  w_i = weight of question i
  c_i = coverage score of question i (0.5 if mandatory & unscored)
  0.15 = STATIC_PENALTY
  0.6 = MANDATORY_THRESHOLD
```
