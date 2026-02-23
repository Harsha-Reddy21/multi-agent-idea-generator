# SPE Support Assistant (Task-Based) — Cortex Model Config Explained

This document explains the **Cortex model configuration** for **spesupportassistant-taskbased**: a task-based support assistant that uses the **Agentic V2** framework with one **supervisor** and multiple **sub-agents** (agentic-model executables).

---

## 1. What This Config Is

This JSON is a **Cortex Model Config**. It defines:

- **Who** can use the model (auth).
- **How** the model behaves (chain: agent-chain with a supervisor and sub-agents).
- **Which** LLM runs the supervisor (model_versions).
- **Which** prompts and UX options apply (prompts, labels, session_config, etc.).

When a user sends a message to this model (e.g. via Chat-in-a-Box or `/model/ask/spesupportassistant-taskbased`), Cortex runs the **agent-chain**: the **supervisor** reads the query and **delegates** to one of the **sub-agents** (creation, read, update, or feedback). Those sub-agents are themselves Cortex models of type **agentic-model**, so they can use their own tools and logic. The supervisor does not call raw tools directly; it only hands off to these child agents.

---

## 2. Top-Level Identity and Access

| Field | Value | Meaning |
|-------|--------|--------|
| **name** | `spesupportassistant-taskbased` | Unique model ID in Cortex. Used in `/model/ask/{name}`. |
| **displayName** | SPE Support Assistant - Task-Based Architecture | Human-readable name in UIs (e.g. CIAB). |
| **model_description** | Long welcome + example prompts | Shown to users (e.g. in CIAB) and may be used as context. Describes JIRA, ServiceNow, GitHub, Kubernetes, docs; gives sample messages. |
| **security_config** | `null` | No extra security layer specified. |

### auth

Controls who can use and manage this model.

- **owners** — Users who can edit the config and are responsible for the model.
- **owners_aws_roles** — AWS role used by CIAB (e.g. `lrl-light-apps-chatbuilder-prd-ciab`) for production Chat-in-a-Box binding.
- **users** — Users (and one app ID) allowed to use the model.
- **private: true** — Model is not discoverable by everyone; only owners, users, and any access_groups/access_aws_roles can use it.
- **owners_group**, **access_groups**, **access_aws_roles**, **allow_access_to_reports_of** — Empty here; could be used for group-based access or report sharing.

---

## 3. The Chain: agent-chain and Supervisor

The **chain** array defines the processing pipeline. This config has a single step:

```json
"chain": [
  {
    "chain_class": "agent-chain",
    "model_iteration": 1,
    "order": 1,
    "chain_params": { ... }
  }
]
```

- **chain_class: "agent-chain"** — Uses Cortex **Agentic V2**: one LLM acts as a **supervisor** and can call **executables** (here, only sub-agents of type **agentic-model**).
- **model_iteration** — Version of the chain implementation (1 = current).
- **order** — Execution order when multiple chains exist (1 = first and only).

Everything that defines behavior lives under **chain_params**.

---

## 4. chain_params in Detail

### 4.1 max_turns

- **Value:** `25`
- **Meaning:** Maximum number of “turns” (e.g. supervisor → sub-agent → back to supervisor) before Cortex stops. Prevents infinite loops and caps cost/latency.

### 4.2 execution_type

- **Value:** `"handoff"`
- **Meaning:** When the supervisor calls a sub-agent, the **full conversation history** is passed to that agent (handoff). The alternative (e.g. tool-style) would pass only the current input. Handoff is appropriate when the sub-agent needs prior context (e.g. “update the ticket we just discussed”).

### 4.3 supervisor

The **supervisor** is the single LLM that sees the user message and decides which sub-agent to call (or whether to ask for clarification or return the greeting).

| Field | Purpose |
|-------|--------|
| **prompt** | System instructions for the supervisor. It defines: (1) the four sub-agents and when to use each, (2) examples of user phrases per agent, (3) rules: “analyze query → invoke one agent,” “if unclear, ask one concise clarification,” “use session memory for references like ‘that ticket’,” “after 8–10 tasks or long conversation, suggest a fresh chat.” |
| **description** | High-level description of the supervisor (e.g. for internal docs or tool discovery). Here it says it routes to task-based sub-agents (Creation, Read, Update, Feedback) and handles clarification. |
| **child_to_parent_handoff** | Instructions for **child agents** when they finish: “Always wait for the tool-call to complete before transferring back to supervisor when task is complete.” So children must complete their work before control returns to the supervisor. |

The prompt is the main routing logic: no separate “intent classifier” tool; the supervisor LLM does intent classification and routing in one step.

### 4.4 resources.executables

List of **executables** the supervisor can invoke. Here all four are **agentic-model** (other Cortex models), not **tool-call** or **model**.

| name | type | description (summary) |
|------|------|------------------------|
| **spesupport-creation-agent** | agentic-model | Creates JIRA tickets (bugs, features, tasks, stories) and ServiceNow incidents. Validates params and prevents duplicates. |
| **spesupport-read-agent** | agentic-model | Read-only: JIRA details, ServiceNow incidents/KB, GitHub releases/tags, Kubernetes resources, docs Q&A (RAG). |
| **spesupport-update-agent** | agentic-model | Modifications: JIRA comments, JIRA status/transitions. Validates IDs and transitions. |
| **spesupportassistant-feedback** | agentic-model | Feedback flow: detect feedback intent, sanitize, post to JIRA feedback ticket (SPE-415). No preview. |

- **type: "agentic-model"** — Each executable is another Cortex model (with its own agent-chain or tools). The supervisor “calls” them by handing off the conversation; that model runs and returns a result back to the supervisor.
- **description** — Used by the supervisor LLM to choose which agent to call. The prompt reinforces these with examples.

There are **no toolkits** or **allowed_tools_list** on this config because the supervisor does not call tools directly; it only delegates to these four child models.

### 4.5 max_history_toolcalls_recovery

- **Value:** `2`
- **Meaning:** Cortex can use limited history of past tool/agent calls (e.g. for retries or context). This caps how many prior tool-call turns are considered for recovery or context.

---

## 5. model_versions

Defines which LLM runs the **supervisor** (and possibly other chains that use a model).

- **model_class:** `"claude"` — Base model family.
- **model_iteration:** `17` — Specific version of that class.
- **priority:** `1` — When multiple model_versions exist, higher priority can be preferred.
- **reasoning_effort**, **enable_thinking**, **advanced_param_overrides** — Not set; use model defaults.

Only the supervisor runs this LLM in this config; the sub-agents use whatever LLM is configured in their own model configs.

---

## 6. prompts

Maps **prompt roles** to **named prompt templates** stored in Cortex (Data/Prompt API). The chain and the LLM use these when needed.

- **no_context**, **with_context**, **with_json_context**, **enhance_query**, **sql** — Used by RAG or other chains; not used by this agent-chain’s supervisor directly.
- **agent_tool**, **cortex_agent_tool_prompt_v2**, **cortex_agent_action**, **cortex_agent_reasoning** — Used by the agent framework when the model calls tools or agents. **cortex_agent_tool_prompt_v2** is overridden to `new_taskbased_ssa_cortex_agent_tool_prompt_v2` (custom for this task-based SSA).
- **table_summary**, **summary**, **entity_extraction**, **rewrite**, **kg_triple_extraction** — Other defaults; may be used by child agents or other flows.

So: the **supervisor’s** behavior is mainly from **chain_params.supervisor.prompt**; the **prompts** object here configures framework prompts (e.g. how to format tool/agent calls and reasoning).

---

## 7. toolkits and allowed_tools_list

- **toolkits:** `[]`
- **allowed_tools_list:** `[]`

This model does **not** attach any toolkit. The supervisor only has **agentic-model** executables (the four sub-agents). Any tools (e.g. JIRA, ServiceNow) are attached to the **child models** (spesupport-creation-agent, spesupport-read-agent, etc.), not to this top-level config.

---

## 8. Other Important Fields

| Field | Value | Meaning |
|-------|--------|--------|
| **agent_tool_max_iterations** | `7` | Max number of tool/agent-call iterations in one user turn (prevents runaway loops). |
| **app_binding** | `"chatbuilder"` | Binds this model to Chat-in-a-Box (CIAB). |
| **multimodal** | `true` | Model can accept multimodal input (e.g. images/files) if the chain and UI support it. |
| **labels** | Various | **chatbuilder: "read only"** — CIAB shows it read-only. **background_job: "true"** — Long runs can use background/SSE. **custom_wait_message**, **download_chat**, **enable_ux_widget**, **render-structures**, **show_message_information**, **debug** — UX and debugging options. |
| **session_config** | moving_window, message_lookback: 3 | Session memory: only last 3 messages (per method_config) are kept in context (moving window). |
| **temperature**, **top_p**, **top_k** | 0, 1, 50 | Sampling settings for deterministic/stable output. |
| **data** | `[]` | No RAG data attached at this level (RAG may be in child models). |
| **k_value**, **doc_relevence_threshold**, **rerank**, **document_limit_to_search** | Set or default | RAG-related; not used by this config’s chain directly. |

---

## 9. End-to-End Flow (Summary)

1. User sends a message to **spesupportassistant-taskbased** (e.g. “Create a JIRA bug in CORTEX for login issue”).
2. Cortex loads this config and runs the **agent-chain** with **model_versions** (Claude, iteration 17) as the supervisor LLM.
3. The **supervisor** reads **chain_params.supervisor.prompt** and the user message (and **session_config** for recent turns). It decides which executable to call (e.g. **spesupport-creation-agent**).
4. Cortex **hands off** the conversation to **spesupport-creation-agent** (execution_type: handoff). That child model runs with its own chain and tools (e.g. JIRA create).
5. When the child finishes, it returns control to the supervisor (**child_to_parent_handoff**). The supervisor may respond to the user or make another turn (within **max_turns** and **agent_tool_max_iterations**).
6. The final reply is shown in CIAB (or returned by `/model/ask/...`).

So this config is a **single top-level agent** (the supervisor) that **only routes** to four **task-based sub-agents**; it does not implement tools itself. All task logic and tools live in those child model configs.
