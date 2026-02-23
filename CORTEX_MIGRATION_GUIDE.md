# How to Run the Idea Generator Agent Fully on Cortex

This guide explains how to implement your current **LangGraph-based** multi-agent flow (intent → update / review / chat / irrelevant, plus autocomplete) using **Cortex’s Agentic V2 Framework** and **agent-chain**, so everything runs on Cortex instead of your backend LangGraph.

---

## 1. Cortex vs LangGraph (high level)

| Today (LangGraph) | On Cortex |
|-------------------|-----------|
| You run a **StateGraph** in Python; nodes call your LLM (Cortex) for each step. | Cortex runs an **agent-chain**: one **supervisor** LLM chooses and calls **tools** or **sub-agents** (agentic-model / model). |
| Intent classifier, router, review agents, document enhancer, chat responder, confidence are **Python nodes**. | Same behaviors become **tools** (gRPC or MCP) and/or **child Cortex models** (agentic-model). The **supervisor prompt** encodes routing (e.g. “classify intent, then call the right tool/agent”). |
| Autocomplete is a separate Python function invoked by your backend after 10s. | Autocomplete is a **tool** or a **separate Cortex model** your app calls (e.g. after 10s) with the current document. |

**Important:** Cortex docs say **LangGraph** (`supervisor-agent-chain`) and **Swarm** (`multi-agent-collaboration-chain`) are **deprecated**. The supported way to build multi-step agentic flows is **Agentic V2** with **`chain_class: "agent-chain"`**.

---

## 2. Cortex concepts you need

- **Model config**  
  Defines the assistant: chain (e.g. `agent-chain`), LLM, prompts, **toolkits**, and for agent-chain the **chain_params** (supervisor + executables).

- **agent-chain**  
  One **supervisor** agent that sees the user question (and chat history, if configured). It can call:
  - **tool-call**: tools from a **Toolkit** (gRPC server or MCP server you deploy).
  - **agentic-model**: another Cortex model that is itself an agent (recursive hierarchy).
  - **model**: a Cortex RAG or model-only model (e.g. for generic chat or retrieval).

- **Toolkit**  
  A set of tools Cortex can call. Either:
  - **gRPC Tool Server** (proto: `DescribeTools`, `ExecuteTool`) deployed on CATS and registered in Cortex, or  
  - **MCP server** (e.g. FastMCP, `mcp://host:port`) registered as a toolkit.

- **Invocation**  
  Your app calls **GET/POST `/model/ask/{model}`** with `q=<user question>`. Cortex runs the chain; the supervisor may call tools/sub-agents; the final reply is in the response. Prompts can use `{question}` and `{chat_history}` (Cortex-managed).

---

## 3. Mapping your architecture to Cortex

### 3.1 Intent + routing

In LangGraph you have: **intent_classifier** → **route_by_intent** → review_start | enhance | respond.

In Cortex you have one supervisor. Two patterns:

- **Option A – Supervisor does intent in prompt**  
  In the supervisor prompt, instruct the LLM to:
  1. Classify the user message (irrelevant / chat / update / review).
  2. Call **only** the right executable:
     - **irrelevant** or **chat** → no tool, or a “respond” tool that uses document + history.
     - **update** → call a “document update” tool or child agent.
     - **review** → call a “review” tool or child agent that runs the five section reviews.

- **Option B – Intent as a tool**  
  Implement an **intent_classifier** tool (input: user message; output: JSON `intent`, `relevance`, `ambiguity`). Supervisor prompt: “First call intent_classifier, then based on result call the appropriate tool/agent.”  
  This mirrors your current code but adds a tool call per request.

Recommendation: start with **Option A** (simpler; one less tool and no strict schema). Refine the supervisor prompt with few-shot examples so it reliably picks the right executable.

### 3.2 Document update agent (create / update / enhance)

Today: **document_enhancer** node (from scratch or per-section) calling your LLM.

On Cortex:

- Implement a **tool** (e.g. `document_update`) that:
  - **Input:** e.g. JSON `{ "user_query": "...", "document_sections": { "solution_overview": "...", ... } }`.
  - **Logic:** same as today (if empty doc → one LLM call for full structure; else per-section LLM calls), using **Cortex model-only or RAG model** via Cortex API from inside the tool, or your existing LLM client that talks to Cortex.
  - **Output:** JSON `{ "document_suggestions": { "section_name": "content", ... } }` (and optionally a short summary for the chat).

- Register this tool in a **Toolkit** (gRPC or MCP). In the **model config**, add that toolkit and in **chain_params.resources.executables** add:
  - `name`: same as the tool name (e.g. `document_update`),
  - `type`: `"tool-call"`,
  - `description`: e.g. “Updates or creates the idea document from user request. Use when the user wants to fill, edit, or enhance the document.”

The supervisor will call this when it infers “update” intent.

### 3.3 Review agents (solution, AI registry, legal, security, third-party)

Today: five parallel nodes (solution_agent, ai_registry_agent, legal_agent, security_agent, third_party_agent) → review_collector → chat_responder.

On Cortex you can do either:

- **Option A – Five tools**  
  One tool per section, e.g. `review_solution`, `review_ai_registry`, `review_legal`, `review_security`, `review_third_party`. Each tool input: document (or relevant section); output: feedback text. Supervisor prompt: “For review intent, call all five review tools (or the ones relevant to the question), then summarize the feedback for the user.”  
  Tools can call Cortex (or your LLM) internally to generate the feedback.

- **Option B – One “review” child agent**  
  Create a **separate Cortex model** that uses **agent-chain** with five tools (same as above). Then in the **main** model’s chain_params, add one executable:
  - `name`: e.g. `idea-review-agent`,
  - `type`: `"agentic-model"`,
  - `description`: “Reviews the idea document across Solution, AI Registry, Legal, Security, and Third Party. Call when the user asks to review or validate the document.”
  Supervisor then delegates “review” to this child agent; the child calls its five tools and returns a summary.

Same toolkit can be used by both the main and the review model if they share the same tool server.

### 3.4 Chat responder (irrelevant + chat + review summary)

Today: **chat_responder** node that uses document + chat_history and (for review path) review feedback to produce the final message.

On Cortex:

- If the supervisor **does not** call any tool (e.g. irrelevant or simple chat), the supervisor’s own reply is the chat response. So the **supervisor prompt** must say: “When the query is irrelevant or general chat, respond directly using the conversation and any document context provided in the question; do not call tools.”
- **Document + history:** Cortex provides `{chat_history}` and `{question}`. Your **frontend** can send the current document (and any review feedback) **inside the question**, e.g. “Document (sections): … \n\n Conversation: … \n\n User: …” so the supervisor has full context when it answers without tools.
- For **review** path: the “review” tool or child agent returns a summary; the supervisor includes that in its final answer (prompt: “When you call the review tool/agent, use its output to write a clear, actionable response to the user.”).

So “chat responder” is mostly **supervisor behavior** (prompt + when to call tools), not a separate node.

### 3.5 Confidence score

Today: **confidence_agent** computes a score from relevance and ambiguity.

On Cortex:

- **Option A – Tool**  
  Implement a **confidence** tool: input `relevance`, `ambiguity`; output `confidence_score`. Supervisor prompt: “After classifying intent, call the confidence tool with relevance and ambiguity, then include the returned confidence in your final answer in a structured way (e.g. ‘Confidence: X%’).” Your app parses that from the reply.
- **Option B – Backend post-processing**  
  Supervisor only returns text. Your backend calls a small “confidence” tool or function with intent/context and attaches the score to the response before sending to the frontend.
- **Option C – Opaque to Cortex**  
  If you don’t need the LLM to “see” confidence, compute it in your backend after you get the Cortex reply (e.g. from intent + tool calls) and add it to the API response.

### 3.6 Autocomplete (after ~10s on document change)

Today: **autocomplete_agent** in Python, triggered by your backend 10s after document edit; returns suggestions + confidence.

On Cortex:

- **Option A – Same model, special “question”**  
  Frontend (or your backend) calls **`/model/ask/{model}`** with a dedicated question, e.g. “AUTocomplete: <document JSON or text>.” Supervisor prompt: “When the user message starts with AUTocomplete, call only the autocomplete tool with the attached document; return the tool’s suggestions and confidence.” You implement an **autocomplete** tool that takes document, calls LLM, returns `document_suggestions` + `confidence_score`.
- **Option B – Separate Cortex model**  
  Create a second model config that has only one tool (autocomplete). Your app calls **`/model/ask/{autocomplete-model}`** with the current document (e.g. in the question body) after the 10s debounce. Response = suggestions + confidence; your backend converts to `document_content` (HTML) and confidence and sends to the frontend.

In both cases, **invocation** is still via `/model/ask/...`; only the “question” or model name changes.

---

## 4. Implementation steps (summary)

1. **Tool server(s)**  
   - Implement tools: e.g. `document_update`, `review_solution`, `review_ai_registry`, `review_legal`, `review_security`, `review_third_party`, optionally `intent_classifier`, `confidence`, `autocomplete`.  
   - Each tool can call Cortex (model-only or RAG) or your existing LLM service for the actual LLM calls.  
   - Expose via **gRPC** (Cortex agent template) or **MCP** (FastMCP); deploy on CATS; register as **Toolkit(s)** in Cortex.

2. **Cortex model config (main idea assistant)**  
   - **chain**: single entry, `chain_class`: `"agent-chain"`, `chain_params`:  
     - **supervisor**: prompt (intent + routing rules + how to use document/history) and description.  
     - **resources.executables**: list all tools (and optionally the review child agent) with `name`, `type` (`tool-call` or `agentic-model`), and `description`.  
   - **toolkits**: reference the toolkit(s) that host the tools.  
   - **allowed_tools_list**: restrict to the tools this model may use (if required).  
   - Set **agent_tool_max_iterations** (e.g. 10–20) so the supervisor can call multiple tools in one turn.

3. **Optional: review child model**  
   - If you use Option B for review: create a second model config with agent-chain and the five review tools; reference it as `agentic-model` in the main model’s executables.

4. **Optional: autocomplete model**  
   - If you use a dedicated autocomplete model: create a small agent-chain model with only the autocomplete tool.

5. **Your backend / frontend**  
   - Replace **LangGraph** `agent_app.invoke(...)` with **HTTP calls to Cortex** `GET/POST /model/ask/{model}` with `q=<user message>`.  
   - Build the “question” so it includes document and conversation context when needed (e.g. “Document: … \n\n Chat: … \n\n User: …”).  
   - For autocomplete: after 10s debounce, call `/model/ask/{model}` (or autocomplete model) with the document in the question; parse response and map to `document_content` + confidence.  
   - Keep **document_content** and **confidence_score** in your API response contract; compute or parse them from Cortex responses and any post-processing.

6. **CATS + auth**  
   - Follow **cats-docs** for deployment (namespace, ingress, SG rules for `llm-dev`).  
   - Use **Cortex auth** (e.g. delegated or AWS) as in cortex_documentation; ensure your app sends the right headers when calling Cortex.

---

## 5. References in the docs

- **Agentic V2 / agent-chain:**  
  `cortex_documentation.md` – “Cortex Agentic V2 Framework Multiagent Guide” (around 4536+). Use **agent-chain** and **chain_params** (supervisor, resources.executables; executables type: tool-call, agentic-model, model).

- **Creating tools:**  
  “Creating an Agent Tool for the Cortex Platform” (cortex_documentation.md ~515+) and **cortex-agent-template** (Backstage / GitHub). Proto: `DescribeTools`, `ExecuteTool`; deploy on CATS; register toolkit; add to model.

- **MCP (alternative to gRPC):**  
  “Creating and Running MCP Server” (cortex_documentation.md ~3754+). FastMCP, `mcp://host:port`, toolkit and model config with `agent-chain` and tool-call executables.

- **Asking the model:**  
  **GET/POST `/model/ask/{model}`** – `q` = question; Cortex substitutes `{question}` and `{chat_history}` in prompts. Swagger: “Ask Handler” under `/model/ask/{model}`.

- **Environment and auth:**  
  **cats-docs.md** (environments, clusters, VPC); **cortex_documentation.md** (Authentication Guidelines, Environment Guidelines).

---

## 6. Summary

- **Use Cortex Agentic V2** with **agent-chain**; do not use deprecated LangGraph/Swarm chains.
- **Supervisor** = single LLM that routes (via prompt and/or an intent tool) and calls **tools** or **agentic-model** / **model** executables.
- **Your current nodes** become **tools** (and optionally one review **child agent** and one **autocomplete** model).
- **Document and chat context** go into the **question** (or into tool inputs) so the supervisor and tools have what they need.
- **Invocation** is always **`/model/ask/{model}`**; your backend translates that into your existing API (response, document_content, confidence_score) and handles the 10s autocomplete trigger.

This is how you run the idea generator agent **fully on Cortex** while keeping your UI and product behavior the same.
