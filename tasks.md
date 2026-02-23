AI-related tasks and subtasks

Intent classifier
1.1 Refine intent-classifier prompt (examples for chat / update / review / irrelevant).

Router
2.1 Verify route_by_intent maps all intents to correct graph nodes.


Confidence agent
3.1 Validate confidence formula
3.2 Define how autocomplete-derived confidence overrides or blends with graph confidence.
3.3 Ensure every response path (chat, update, review, autocomplete) sets confidence_score.


Document update agent 
4.1 Lock down JSON schema and examples for “create document from scratch” LLM output.
4.2 Harden parse_llm_json (fences, extra text, fallback/retry).
4.3 Add guardrails in from-scratch prompt (max size/sections, required compliance sections).

Document update agent (partial update / enhance)
5.1 Refine per-section update prompt (when to leave / lightly edit / rewrite).
5.2 Implement or document section-selection (only sections in user query or specified list).
5.3 Define idempotency expectations and test (same query + doc → stable output).


Review agents (solution, AI registry, legal, security, third-party)
6.1 Harden each agent’s prompt (checklists, compliance constraints).
6.2 Standardize “no issues” phrasing and filtering in chat responder.
6.3 Build eval set and grade precision/recall of issues per section; iterate prompts.


Chat responder
7.1 Tune irrelevant (redirect, document-review framing).
7.2 Tune chat (document + chat_history context, no edits, no hallucinated process).
7.3 Tune review-path messages (“all sufficient” vs “areas need attention”) for clarity and actionability.


Autocomplete agent
8.1 Refine autocomplete prompt (small, high-confidence refinements; conservative; no full rewrites).
8.2 Align autocomplete confidence_score semantics with main graph confidence.
8.3 Add rate limiting / cooldown for autocomplete API.


Evaluation and safety
9.1 Review prompts for sensitive/internal policy leakage and overpromising compliance.
9.2 Define golden test set (queries + docs + expected intent/behavior) and automate regression runs.
9.3 Add response disclaimer pattern where needed.


Observability (AI-specific)
10.1 Log intent, path taken, confidence scores, and truncated prompts/responses per request.
10.2 Add metrics: calls per intent, per agent; autocomplete trigger rate and latency; confidence distribution.


Document Exaction Agent:
11. Extract the document which is uploaded by the user and make sure that the llm has the context of it

Document Exaction Agent for form filling:
12. Extract the document and fill the form