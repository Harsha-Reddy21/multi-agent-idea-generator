# Idea Generator Agent — Overview (from scratch)

This document explains how the agent in **`backend/services/agent_chat.py`** works: what it is, how the graph is built, and how a single user message flows from input to response.

---

## 1. What this file is

- **`agent_chat.py`** defines a **LangGraph** workflow: a **state graph** whose nodes are Python functions. Each function reads from and writes to a shared **state** dictionary (`AgentState`).
- The graph is **compiled** into a single callable, **`agent_app`**. Your backend (e.g. `chat_service.py`) runs one user request by calling **`agent_app.invoke(initial_state)`**.
- All LLM calls go through **`LLMService`** (e.g. Cortex API). The graph only orchestrates: it does not implement the model itself.

So: **one invocation** = one run over the graph from the **entry point** to **END**, with state passed from node to node and optional **branching** based on intent.

---

## 2. State: what flows through the graph

**`AgentState`** is a TypedDict: a single dictionary that every node receives and can update (by returning a partial dict that gets merged in).

| Field | Role |
|-------|------|
| **user_query** | The user’s current message (input). |
| **document** | Current document as a dict: `section_name → content` (e.g. `solution_overview`, `ai_registry`, `digital_legal`, `security_architecture`, `third_party`). |
| **chat_history** | List of prior messages (e.g. `["user: ...", "assistant: ..."]`) for context. |
| **intent** | Set by **intent_classifier**: one of `"chat"`, `"update"`, `"review"`, `"irrelevant"`. |
| **relevance_score**, **ambiguity_score** | Set by **intent_classifier** (0–1). Used for irrelevant threshold and by **confidence_agent**. |
| **solution_feedback**, **ai_registry_feedback**, **legal_feedback**, **security_feedback**, **third_party_feedback** | Set by the five **review agents**. |
| **chat_response** | Set by **chat_responder**: the final text reply to the user. |
| **document_suggestions** | Set by **document_enhancer** (or **autocomplete_agent** when used). Section name → new content for the UI to show as “proposed changes”. |
| **confidence_score** | Set by **confidence_agent** (0–1). Often shown as a percentage in the UI. |

The backend prepares **user_query**, **document** (from parsed HTML), and **chat_history**, then invokes the graph. When the run reaches END, the same state dict is returned; the backend reads **chat_response**, **document_suggestions**, and **confidence_score** to build the API response.

---

## 3. Graph shape (high level)

- **Entry point:** the node **`intent`** (intent_classifier).
- After **intent**, a **router** (**route_by_intent**) chooses the next node:
  - **irrelevant** → **respond** (chat_responder)
  - **chat** → **respond**
  - **update** → **enhance** (document_enhancer)
  - **review** → **review_start**
- **respond** and **enhance** both lead to **confidence**, then **END**.
- The **review** path: **review_start** → five review nodes in **parallel** → **review_collector** → **respond** → **confidence** → **END**.

So there are three main paths:

1. **Respond path** (irrelevant or chat): intent → respond → confidence → END.  
2. **Enhance path** (update): intent → enhance → confidence → END.  
3. **Review path** (review): intent → review_start → (solution, ai_registry, legal, security, third_party) → review_collector → respond → confidence → END.

---

## 4. Step-by-step: what each node does

### 4.1 intent (intent_classifier)

- **Input:** state with **user_query** (and optionally document/chat_history; the prompt doesn’t use them for classification).
- **Action:** Builds a prompt that asks the LLM to classify the query into **irrelevant / chat / update / review** and to output **relevance** and **ambiguity** (0–1). Calls **llm_service.generate_response_text**, then **parse_llm_json** to get a dict.
- **Output (merged into state):** **intent**, **relevance_score**, **ambiguity_score**.

So after this node, the state always has an intent and two scores; the rest of the graph uses them to route and to compute confidence.

---

### 4.2 Router (route_by_intent)

- **Not a node.** It’s the **conditional edge** from **intent** to the next node.
- **Logic:** Reads **state["intent"]** and returns one of the strings **`"respond"`**, **`"enhance"`**, **`"review_start"`**.
- **Mapping:**
  - **irrelevant** → **respond**
  - **update** → **enhance**
  - **review** → **review_start**
  - **chat** (and anything else) → **respond**

So the graph never “does” intent classification again; it only branches once based on the classifier’s result.

---

### 4.3 respond (chat_responder)

- **Input:** full state (including **intent**, **relevance_score**, **document**, **chat_history**, and, on the review path, the five **\*_feedback** fields).
- **Action:**
  - Builds **document context** and **chat context** strings from state (**\_context_blocks**).
  - **If intent is irrelevant or relevance_score < 0.3:** Asks the LLM for a short, friendly reply that redirects to document review; no feedback used.
  - **Else if intent is chat:** Asks the LLM to answer using document and conversation context, without modifying the document.
  - **Else (review path):** Collects all five feedbacks, drops any that say “sufficient” (or similar). If none left, prompts the LLM to say the document looks complete; otherwise prompts the LLM to summarize the issues and give guidance. In both cases, document and chat context are included.
- **Output (merged into state):** **chat_response**.

So the **respond** node is the only place that produces the final user-facing message; it behaves differently for irrelevant/chat vs review, and always uses document + history when relevant.

---

### 4.4 enhance (document_enhancer)

- **Input:** state with **user_query** and **document**.
- **Action:**
  - **If document is empty:** One LLM call to generate a full document structure (JSON: section name → content). Parsed with **parse_llm_json** → **document_suggestions**.
  - **If document exists:** For each section, one LLM call with user request + section name + content; the model may leave it unchanged or return improved text. All section results are collected into **document_suggestions**.
- **Output (merged into state):** **document_suggestions**. No **chat_response** is set here; the backend can use a fixed message (e.g. “I’ve updated your document…”) when it sees **document_suggestions** and no chat_response, or you could add a follow-up path later.

So “update” intent is handled entirely by this node; the UI “proposed changes” come from **document_suggestions** (converted to HTML elsewhere).

---

### 4.5 review_start (review_start)

- **Input:** state (unchanged).
- **Action:** No LLM call. Logs and returns **{}**.
- **Purpose:** A single node that **fans out** to five edges. LangGraph runs the five target nodes (**solution**, **ai_registry**, **legal**, **security**, **third_party**) in **parallel** (conceptually; implementation may interleave). So **review_start** is the fork for the parallel review.

---

### 4.6 solution, ai_registry, legal, security, third_party (review agents)

- **Input:** state; each agent uses **state["document"]** (the whole document is passed; the prompts refer to the section by name).
- **Action:** Each builds a section-specific prompt (e.g. “Review Solution Overview…”, “Review AI Registry…”, etc.) with checks (missing technical solution, deployment info, accountability, etc.). One LLM call per agent; response is free text (e.g. “Looks sufficient” or a list of issues).
- **Output (merged into state):** Each writes one field: **solution_feedback**, **ai_registry_feedback**, **legal_feedback**, **security_feedback**, **third_party_feedback**.

So after the parallel block, state contains all five feedback strings. **review_collector** runs next but doesn’t add new state; it’s a sync point before **respond**.

---

### 4.7 review_collector (review_collector)

- **Input:** state (with all five feedbacks).
- **Action:** No LLM call. Logs which feedback keys are present and returns **{}**.
- **Purpose:** A single node that all five review agents point to. LangGraph waits for all five to finish before running **review_collector**, then follows the edge to **respond**. So the collector is the **join** after the parallel review.

---

### 4.8 confidence (confidence_agent)

- **Input:** state with **relevance_score** and **ambiguity_score** (from intent_classifier).
- **Action:** Formula: **confidence = 0.5 × relevance + 0.3 × (1 − ambiguity) + 0.2**, then clamped to 1.0 and rounded to two decimals. No LLM.
- **Output (merged into state):** **confidence_score**.

So every path that reaches END (respond path, enhance path, review path) ends with this node; the returned state always has **confidence_score** set when the run completes normally.

---

### 4.9 autocomplete_agent (not in the graph)

- **autocomplete_agent** is a **standalone function** in the same file. It is **not** added as a node and is **not** triggered by the intent router.
- **When it runs:** The backend calls it explicitly (e.g. from **chat_service.get_autocomplete**) when the app wants “autocomplete” behavior—e.g. ~10 seconds after the user edits the document. The backend builds a minimal state (e.g. **document**, empty **chat_history**), calls **autocomplete_agent(state)**, and uses the returned **document_suggestions** and **confidence_score** to build the autocomplete API response (and optionally the proposed-document HTML).
- **What it does:** One LLM call that takes the current document and returns JSON: **document_suggestions** (section → refined content) and **confidence_score**. So it’s a separate “agent” in the sense of logic, but it’s outside the main graph.

---

## 5. End-to-end flow (one user message)

1. Backend receives **user_query**, **document** (parsed from HTML), and **chat_history**. It builds **initial_state = { user_query, document, chat_history }** (other keys absent or default).
2. Backend calls **agent_app.invoke(initial_state)**.
3. **intent** node runs: LLM classifies → state gets **intent**, **relevance_score**, **ambiguity_score**.
4. **route_by_intent** chooses **respond**, **enhance**, or **review_start**.
5. **One of:**
   - **respond:** **chat_responder** runs (irrelevant / chat / or review summary), sets **chat_response**.
   - **enhance:** **document_enhancer** runs, sets **document_suggestions**.
   - **review_start:** **review_start** runs (no state change), then **solution**, **ai_registry**, **legal**, **security**, **third_party** run in parallel and set their **\*_feedback**; **review_collector** runs; **respond** runs and sets **chat_response** from the collected feedbacks.
6. **confidence** runs and sets **confidence_score**.
7. Graph hits **END** and returns the final state.
8. Backend reads **chat_response**, **document_suggestions**, **confidence_score** from the returned state, converts suggestions to HTML if needed, and returns the API response (and optionally proposed document) to the frontend.

So from scratch: **one graph, one entry (intent), one router, three paths (respond / enhance / review), one final scorer.** The autocomplete flow is a separate code path that reuses **autocomplete_agent** and the same state shape but is not part of this graph.
