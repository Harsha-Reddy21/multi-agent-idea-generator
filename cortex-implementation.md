# Cortex Implementation Guide: Idea Generator Agent

Step-by-step guide to build the same multi-agent Idea Generator (intent → chat / update / review / irrelevant, plus autocomplete) **fully on Cortex** using the Agentic V2 Framework.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Architecture Overview on Cortex](#2-architecture-overview-on-cortex)
3. [Step 1: Create the Tool Server](#3-step-1-create-the-tool-server)
4. [Step 2: Implement Each Tool](#4-step-2-implement-each-tool)
5. [Step 3: Deploy Tool Server to CATS](#5-step-3-deploy-tool-server-to-cats)
6. [Step 4: Register Toolkit in Cortex](#6-step-4-register-toolkit-in-cortex)
7. [Step 5: Create the Main Model Config](#7-step-5-create-the-main-model-config)
8. [Step 6: (Optional) Create Review Child Model](#8-step-6-optional-create-review-child-model)
9. [Step 7: (Optional) Create Autocomplete Model](#9-step-7-optional-create-autocomplete-model)
10. [Step 8: Integrate Your App with Cortex](#10-step-8-integrate-your-app-with-cortex)
11. [Step 9: Testing and Validation](#11-step-9-testing-and-validation)
12. [Checklist](#12-checklist)

---

## 1. Prerequisites

Before starting, ensure you have:

| Item | Where to get it |
|------|------------------|
| Cortex API access | Request via your org; see cortex_documentation.md “Getting Started”. |
| CATS access and namespace | cats-docs.md – request namespace, SG rules for `llm-dev`. |
| Backstage / Cortex agent template | https://github.com/EliLillyCo/cortex-agent-template (or Backstage Accelerator). |
| List of Cortex model classes | `GET /models/classes/list` from Cortex API. |
| Auth (Delegated or AWS) | cortex_documentation.md “Authentication Guidelines for Cortex”. |

You will build:

- One **Tool Server** (gRPC or MCP) hosting all tools.
- One **Toolkit** in Cortex pointing to that server.
- One **main Cortex model** (agent-chain) for the idea assistant.
- Optionally: one **review** child model and one **autocomplete** model.

---

## 2. Architecture Overview on Cortex

Your current flow:

- **Intent** → **Router** → [ **Respond** | **Document Update** | **Review** ] → **Confidence** → response.

On Cortex:

- **One supervisor** (agent-chain) receives the user question (and document/chat if you put them in the question).
- The supervisor **classifies intent** from the prompt and **calls one or more tools** (or no tool for irrelevant/chat).
- **Tools** implement: document update, five section reviews (or one review child agent), confidence, and optionally autocomplete.

High-level mapping:

| Current component      | On Cortex |
|------------------------|-----------|
| Intent classifier      | Supervisor prompt (classify then route). |
| Document update agent  | Tool `document_update`. |
| Review (5 agents)      | 5 tools or 1 child agent with 5 tools. |
| Chat responder         | Supervisor direct reply (no tool). |
| Confidence             | Tool `confidence` or backend post-process. |
| Autocomplete           | Tool `autocomplete` (same or separate model). |

---

## 3. Step 1: Create the Tool Server

### 3.1 Choose: gRPC or MCP

- **gRPC**: Use the Cortex agent template (Backstage). Proto defines `DescribeTools` and `ExecuteTool`. Best for production and strict contracts.
- **MCP**: Use FastMCP (Python). Simpler to implement; register as `mcp://host:port` in Cortex. See cortex_documentation.md “Creating and Running MCP Server”.

Below we assume **one gRPC Tool Server**; MCP steps are analogous (implement same tools as MCP tools, then register toolkit with `server: "mcp://..."`).

### 3.2 Create repo and proto

1. From Backstage, create a new repo from the **Cortex agent / tool template** (Go or Python).
2. Ensure the proto matches the Cortex contract (package `toolv2`, service `Toolkit`, rpcs `DescribeTools` and `ExecuteTool`). See cortex_documentation.md “Create an Agent Tool” for the exact proto.
3. Run codegen (e.g. `make proto`).

### 3.3 Implement DescribeTools

In your server implementation, `DescribeTools` must return a list of tools with:

- `name`: exact name the supervisor will use to call the tool.
- `description`: used by the LLM to decide when to call this tool (be clear and concise).
- `json_input_schema`: JSON Schema for the tool input (optional but recommended).
- `direct_return`: whether the tool result is returned directly to the user (typically `false` for internal tools).

You will add one entry per tool: see Step 4 for the list and descriptions.

---

## 4. Step 2: Implement Each Tool

Implement `ExecuteTool`: dispatch by `request.name` and execute the corresponding logic. Input is in `request.input` (JSON string if you use `json_input_schema`).

### 4.1 Tool: `document_update`

**Purpose:** Create document from scratch or update/enhance sections (same behavior as your current document_enhancer).

**Input (JSON):**

```json
{
  "user_query": "string",
  "document_sections": {
    "solution_overview": "string",
    "ai_registry": "string",
    "digital_legal": "string",
    "security_architecture": "string",
    "third_party": "string"
  }
}
```

**Logic:**

- If `document_sections` is empty or all values empty: call LLM once to generate a full document structure (JSON section name → content). Return that as `document_suggestions`.
- Else: for each section, call LLM with user_query + section name + section content; decide leave/update/enhance; return full section text. Build `document_suggestions` (section → content).

**Output (JSON string in ToolResponseV2.output):**

```json
{
  "document_suggestions": { "section_name": "content", ... },
  "summary": "Short message for the user (e.g. I've updated your document...)"
}
```

**DescribeTools description (for supervisor):**

> "Updates or creates the idea document. Input: user_query and document_sections (keys: solution_overview, ai_registry, digital_legal, security_architecture, third_party). Use when the user wants to fill, create, edit, or enhance the document."

---

### 4.2 Tools: `review_solution`, `review_ai_registry`, `review_legal`, `review_security`, `review_third_party`

**Purpose:** One tool per section; same checks as your current solution_agent, ai_registry_agent, etc.

**Input (JSON):**

```json
{
  "section_content": "string",
  "section_name": "string"
}
```

Or pass the full document and let the tool use only the relevant section.

**Logic:** Call LLM with the section-specific review prompt (e.g. “Review Solution Overview…”, “Review AI Registry…”, etc.). Return feedback text or “Looks sufficient.”

**Output (plain string or JSON):**

```json
{ "feedback": "string" }
```

**DescribeTools descriptions (examples):**

- review_solution: "Reviews the Solution Overview section for missing technical solution, unclear users, missing success criteria."
- review_ai_registry: "Reviews AI Registry section for deployment info, maturity, third-party usage clarity."
- review_legal: "Reviews Legal/Privacy section for accountability and privacy concern clarity."
- review_security: "Reviews Security Architecture for AI usage clarity, hosting details, data types."
- review_third_party: "Reviews Third Party Engagement for external exposure and vendor risks."

---

### 4.3 Tool: `confidence`

**Purpose:** Compute confidence score from relevance and ambiguity (same formula as your confidence_agent).

**Input (JSON):**

```json
{
  "relevance": 0.0,
  "ambiguity": 0.0
}
```

**Logic:** `confidence = min(1.0, 0.5 * relevance + 0.3 * (1 - ambiguity) + 0.2)`, round to 2 decimals. Return 0–100 for frontend if desired.

**Output (JSON string):**

```json
{ "confidence_score": 0.75 }
```

**DescribeTools description:**

> "Computes confidence score from relevance (0-1) and ambiguity (0-1). Call after you have classified the user intent to attach a confidence score to your response."

---

### 4.4 Tool: `autocomplete`

**Purpose:** Suggest refinements and a confidence score for the current document (same as your autocomplete_agent). Used when the app calls the model with a special “autocomplete” question after ~10s.

**Input (JSON):**

```json
{
  "document_sections": { "solution_overview": "...", ... }
}
```

**Logic:** Call LLM to propose small refinements per section and a confidence score. Return document_suggestions + confidence_score.

**Output (JSON string):**

```json
{
  "document_suggestions": { "section_name": "improved content", ... },
  "confidence_score": 0.8
}
```

**DescribeTools description:**

> "Proposes small refinements for the document sections and a confidence score. Input: document_sections. Use only when the user message explicitly asks for autocomplete suggestions (e.g. message starts with AUTocomplete)."

---

### 4.5 LLM calls inside tools

Each tool that needs an LLM (document_update, review_*, autocomplete) must call Cortex (or your existing LLM service). Options:

- **Cortex model-only API:** From inside the tool server, call Cortex `GET/POST /model/ask/{model}` with a model that has no tools (model-only-chain) and pass the prompt in `q`. Use the response as the LLM output.
- **Existing LLM client:** If your current backend uses a client that talks to Cortex, the tool server can call your backend over HTTP, or you can embed the same client in the tool server (if same runtime).

Keep prompts aligned with your current agent_chat.py (intent, document_enhancer, solution_agent, etc.) so behavior stays the same.

---

## 5. Step 3: Deploy Tool Server to CATS

1. **Build and push image**  
   Use your CI/CD; image stored in ECR (or org’s registry).

2. **Namespace and SG rule**  
   - Create a namespace for your tool (e.g. `idea-generator-tools-dev`).  
   - Add an ingress rule so **llm-dev** can reach your service port (e.g. 50051 for gRPC). See cortex_documentation.md “Set up CATS infrastructure” and cats-docs for SG rules.

3. **Deploy**  
   - Deployment + Service (same port as in namespace config).  
   - Ingress if Cortex needs to reach it via hostname; otherwise Cortex may use in-cluster DNS (e.g. `service-name.namespace.svc.cluster.local:50051`). Confirm in Cortex docs how the toolkit “server” URL is formed.

4. **Verify**  
   From a pod in llm-dev (or as documented), confirm you can reach the tool server (e.g. gRPC health check or a test client).

---

## 6. Step 4: Register Toolkit in Cortex

1. In Cortex, call the **Toolkit config API** (see Swagger / cortex_documentation for the exact endpoint, e.g. POST to create or update a toolkit).

2. **Request body (example):**

```json
{
  "name": "idea-generator-toolkit",
  "description": "Tools for idea document review, update, and autocomplete.",
  "server": "grpc://idea-generator-tools.idea-generator-tools-dev.svc.cluster.local:50051",
  "auth": { "owners": ["your-team@lilly.com"], "private": true },
  "allowed_model_configs": ["idea-generator-assistant"],
  "agent_tool_max_iterations": 15,
  "allowed_file_types": ["*"]
}
```

- `server`: Your gRPC (or `mcp://...`) URL as required by Cortex.
- `allowed_model_configs`: List of model config names that may use this toolkit (add your main and, if you create them, review and autocomplete model names).

3. **Save the toolkit name** (e.g. `idea-generator-toolkit`); you will reference it in the model config(s).

---

## 7. Step 5: Create the Main Model Config

This is the main idea assistant: one agent-chain with a supervisor and all executables (tools).

1. In Cortex API, **POST** to the model config endpoint (e.g. `/manage/config` or as in Swagger).

2. **Request body (structure):**

```json
{
  "name": "idea-generator-assistant",
  "displayName": "Idea Generator Assistant",
  "model_description": "Document review and idea generator with intent routing: chat, update, review.",
  "auth": { "owners": ["your-team@lilly.com"], "private": true },
  "chain": [
    {
      "chain_class": "agent-chain",
      "model_iteration": 1,
      "order": 1,
      "chain_params": {
        "max_turns": 50,
        "execution_type": "handoff",
        "supervisor": {
          "prompt": "You are the supervisor for an idea document review assistant. The user will send messages that may include: (1) the current document (as section names and content), (2) recent chat history, (3) their question or request.\\n\\nClassify the intent: irrelevant (greetings, off-topic), chat (questions about the app/document, no edit), update (create/fill/edit/enhance the document), review (validate/review the document).\\n\\n- If irrelevant or chat: respond directly and helpfully; do NOT call any tool. Use the document and chat history in the message for context.\\n- If update: call the document_update tool with the user_query and document_sections from the message, then respond with the tool's summary and tell the user to check proposed changes.\\n- If review: call review_solution, review_ai_registry, review_legal, review_security, review_third_party with the document sections, then summarize the feedback for the user.\\n- After answering, you may call the confidence tool with relevance and ambiguity (0-1) and include Confidence: X% in your reply.\\n- If the user message starts with AUTocomplete and includes document content, call only the autocomplete tool and return its suggestions and confidence.",
          "description": "Supervisor that routes between chat, document update, review, and autocomplete based on user intent."
        },
        "resources": {
          "executables": [
            { "name": "document_update", "type": "tool-call", "description": "" },
            { "name": "review_solution", "type": "tool-call", "description": "" },
            { "name": "review_ai_registry", "type": "tool-call", "description": "" },
            { "name": "review_legal", "type": "tool-call", "description": "" },
            { "name": "review_security", "type": "tool-call", "description": "" },
            { "name": "review_third_party", "type": "tool-call", "description": "" },
            { "name": "confidence", "type": "tool-call", "description": "" },
            { "name": "autocomplete", "type": "tool-call", "description": "" }
          ]
        }
      }
    }
  ],
  "toolkits": ["idea-generator-toolkit"],
  "allowed_tools_list": [
    "document_update",
    "review_solution",
    "review_ai_registry",
    "review_legal",
    "review_security",
    "review_third_party",
    "confidence",
    "autocomplete"
  ],
  "model_versions": [
    { "model_class": "<your-llm-class>", "model_iteration": 1, "priority": 0 }
  ],
  "prompts": {}
}
```

3. **Adjust:**
   - `model_class`: from `GET /models/classes/list`.
   - `supervisor.prompt`: refine with few-shot examples if needed so the supervisor reliably classifies and calls the right tools.
   - Add any Cortex-required fields (e.g. `security_config`, `labels`) per your environment.

4. **Save** the model name `idea-generator-assistant` for the /ask calls.

---

## 8. Step 6: (Optional) Create Review Child Model

If you prefer one “review” child agent instead of the supervisor calling five tools directly:

1. **Create a second model config** (e.g. `idea-generator-review-agent`) with:
   - `chain_class`: `"agent-chain"`.
   - `chain_params.supervisor`: prompt that says “You have five review tools; call all of them with the document sections provided, then return a single summarized feedback.”
   - `chain_params.resources.executables`: the five review tools only (`review_solution`, …).
   - Same `toolkits` and `allowed_tools_list` for those five.

2. **In the main model** (`idea-generator-assistant`), in `chain_params.resources.executables`:
   - Remove the five individual review tools.
   - Add one executable: `"name": "idea-generator-review-agent"`, `"type": "agentic-model"`, `"description": "Reviews the idea document across Solution, AI Registry, Legal, Security, and Third Party. Call with the document when the user asks to review or validate."`

3. Ensure the toolkit’s `allowed_model_configs` includes both model names.

---

## 9. Step 7: (Optional) Create Autocomplete Model

If you want a dedicated model for autocomplete (e.g. called after 10s with only document):

1. **Create a model** (e.g. `idea-generator-autocomplete`) with:
   - `chain_class`: `"agent-chain"`.
   - Supervisor prompt: “When you receive a message containing document sections, call only the autocomplete tool with that document and return its output (suggestions and confidence).”
   - `resources.executables`: only `autocomplete` (tool-call).
   - Same toolkit (with `autocomplete` tool), `allowed_tools_list`: `["autocomplete"]`.

2. **In your app:** For the 10s-debounced autocomplete request, call **`/model/ask/idea-generator-autocomplete`** with `q` = e.g. `"AUTocomplete: " + JSON.stringify(document_sections)` (or a convention your supervisor/autocomplete tool understands). Parse the response to get `document_suggestions` and `confidence_score`, then convert to HTML and return `document_content` + confidence to the frontend.

---

## 10. Step 8: Integrate Your App with Cortex

### 10.1 Replace LangGraph invoke with Cortex /ask

**Current (example):**

```python
result = agent_app.invoke({
    "user_query": user_message,
    "document": document_sections,
    "chat_history": formatted_history,
})
```

**With Cortex:**

1. **Build the question string** so the supervisor (and tools) have full context. Example:

```python
def build_question(user_message: str, document_sections: dict, chat_history: list) -> str:
    doc_str = json.dumps(document_sections, indent=2) if document_sections else "(empty)"
    history_str = "\n".join(chat_history[-10:]) if chat_history else "(none)"
    return f"Document (sections):\n{doc_str}\n\nConversation:\n{history_str}\n\nUser: {user_message}"
```

2. **Call Cortex:**

```python
import requests

def ask_cortex(model: str, question: str, auth_headers: dict) -> dict:
    url = f"{CORTEX_BASE_URL}/model/ask/{model}"
    resp = requests.get(url, params={"q": question}, headers=auth_headers, timeout=120)
    resp.raise_for_status()
    return resp.json()
```

3. **Map response to your API contract:**
   - **response**: Use the main `message` (or the final step message) from the Cortex response.
   - **document_content**: If the supervisor called `document_update` or `autocomplete`, parse the tool output from the response steps (or from the final message if the supervisor echoes it). Convert `document_suggestions` to HTML with your existing `_sections_to_html` logic.
   - **confidence_score**: Parse from the supervisor’s reply (e.g. “Confidence: 75%”) or from a `confidence` tool output in the steps; or compute in backend from tool outputs.

### 10.2 Autocomplete flow (10s after document change)

- **Option A – Same model:** Frontend (or backend) sends a question like `"AUTocomplete: " + JSON.stringify(document_sections)`. Supervisor calls `autocomplete` tool; you parse tool result from the response and return `document_content` + `confidence_score` to the frontend.
- **Option B – Dedicated model:** Backend calls `/model/ask/idea-generator-autocomplete` with the document in `q`; same parsing and response mapping.

### 10.3 Auth

- Use **Delegated** or **AWS** auth as per Cortex “Authentication Guidelines”. Attach the required headers (e.g. cookies, Bearer token, or AWS signature) to every `/model/ask/...` request.

---

## 11. Step 9: Testing and Validation

1. **Tool server locally**  
   Run the tool server and use the template’s test client to call `DescribeTools` and `ExecuteTool` for each tool. Verify inputs/outputs match the contracts above.

2. **Toolkit in Cortex**  
   Use Cortex API or Swagger to hit `/toolkits/{toolkit_name}/describe` and confirm the tool list and descriptions match.

3. **Main model in Cortex**  
   - In CIAB or via Swagger, call `GET /model/ask/idea-generator-assistant?q=...` with a test question that includes document + history.  
   - Test one query per intent: irrelevant (“hi”), chat (“what sections are there?”), update (“fill the document for PRD Generator”), review (“review my document”).  
   - Confirm the supervisor calls the expected tools and the final message and (if applicable) document_suggestions and confidence are correct.

4. **Autocomplete**  
   Call the model (or autocomplete model) with an AUTocomplete-style message and a sample document. Verify response contains suggestions and confidence.

5. **End-to-end**  
   Point your frontend to your backend; backend uses Cortex only (no LangGraph). Verify chat, update (and proposed changes in the editor), review, and 10s autocomplete all work and confidence updates.

---

## 12. Checklist

Use this to track progress:

- [ ] Prerequisites: Cortex access, CATS namespace, auth, model class list.
- [ ] Tool server repo created (gRPC or MCP); proto/codegen done.
- [ ] `DescribeTools` returns all tools with correct names and descriptions.
- [ ] `document_update` implemented and tested.
- [ ] All five review tools implemented and tested.
- [ ] `confidence` tool implemented and tested.
- [ ] `autocomplete` tool implemented and tested.
- [ ] Tool server deployed to CATS; SG rule for llm-dev; reachable.
- [ ] Toolkit registered in Cortex; `allowed_model_configs` set.
- [ ] Main model config created (agent-chain, supervisor, executables, toolkits, allowed_tools_list, model_versions).
- [ ] (Optional) Review child model created and referenced as agentic-model.
- [ ] (Optional) Autocomplete model created.
- [ ] Backend builds question (document + history + user message) and calls `/model/ask/{model}`.
- [ ] Backend parses Cortex response into response, document_content, confidence_score.
- [ ] Autocomplete flow (10s) implemented via same or dedicated model.
- [ ] Auth headers applied to all Cortex requests.
- [ ] Tests: each intent, autocomplete, and E2E with frontend.

---

## References

- **Cortex Agentic V2:** cortex_documentation.md – “Cortex Agentic V2 Framework Multiagent Guide”.
- **Creating tools:** cortex_documentation.md – “Creating an Agent Tool for the Cortex Platform”; cortex-agent-template (GitHub/Backstage).
- **MCP:** cortex_documentation.md – “Creating and Running MCP Server”.
- **Ask API:** Swagger – `/model/ask/{model}` (Ask Handler).
- **CATS and auth:** cats-docs.md; cortex_documentation.md – “Authentication Guidelines”, “Environment Guidelines”.
