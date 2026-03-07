# Sage AI Backend (BE) - Technical Documentation

> Last Updated: December 19, 2025  
> Status: ✅ Production Ready  
> Version: 1.0

---

## Table of Contents

1. Overview
2. Architecture
3. API Endpoints
4. Processing Flows
5. Data Models
6. Configuration
7. Backend Services & Utilities
8. FAISS & Embeddings
9. Database Schema
10. Deployment & Running Locally
11. Observability (Tracing & Metrics)
12. Troubleshooting

---

## 1. Overview

### Purpose

The Sage AI Backend is a FastAPI application that powers idea submission, document extraction, AI-assisted form completion, scoring, suggestions, ServiceNow ticketing, and search. It exposes REST and SSE endpoints used by the frontend and background workers.

### What It Does

- Receives idea submissions and uploads documents to S3
- Extracts text and answers using AI (Cortex and/or LLM Gateway)
- Serves real-time progress via Server-Sent Events (SSE)
- Provides scoring, suggestions, and enhancement APIs
- Integrates with ServiceNow for ticket creation
- Supports semantic search using FAISS + sentence embeddings
- Emits Prometheus metrics and OpenTelemetry traces

### Short Summary

- Backend: FastAPI with modular routes, services, and clients
- Core domains: Submissions, Forms, AI Interactions, Suggestions, Scoring
- Integrations: Cortex/LLM Gateway (AI), S3 (files), ServiceNow (tickets)
- Infra: PostgreSQL (SQLAlchemy/Alembic), FAISS (semantic search)
- Ops: Prometheus metrics, OpenTelemetry tracing, CORS, SSE progress

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────┐      ┌─────────────────────────────┐
│ Frontend (FE)       │◀────▶│ Sage AI Backend (FastAPI)   │
│ - Forms UI          │      │ - REST + SSE routes         │
│ - AI sidebar        │      │ - Services + clients        │
└─────────────────────┘      └─────────────────────────────┘
                               │
                               ▼
┌───────────────────┐   ┌───────────────────────┐   ┌──────────────────────┐
│ Postgres (DB)     │   │ S3 (uploads/extracts) │   │ External APIs         │
│ - submissions     │   │ - documents           │   │ - Cortex / LLM GW     │
│ - extractions     │   │ - FAISS cache (opt.)  │   │ - ServiceNow          │
└───────────────────┘   └───────────────────────┘   └──────────────────────┘
```

### Service Layers

```
Entry: main.py (FastAPI app + lifespan)
Routes: data_service/routes/*
Services: data_service/service/*
Clients: data_service/clients/*
Models: data_service/models/* (SQLAlchemy)
Serializers: data_service/serializers/* (Pydantic)
Utils: data_service/utils/*
Config: data_service/configurations/settings.py
```

### Architecture Diagram

![System Integration Architecture](images/system_integration_arch.png)

#### Architecture Summary
- FE calls FastAPI routes for submissions, forms, search, and AI features.
- Services orchestrate DB ops, S3 uploads, FAISS search, and external clients.
- External clients integrate with Cortex/LLM Gateway (AI) and ServiceNow.
- Background tasks handle document extraction; SSE pushes progress to FE.
- Observability via Prometheus metrics and OpenTelemetry tracing.

---

## 3. API Endpoints

Key routers (prefixed with `/api` unless noted):

- Health: `GET /health` (root level)
- Forms & Submissions:
  - `POST /api/forms/submit-idea` — create submission + queue extraction
  - `GET /api/user-submissions` — list user submissions
  - `GET /api/forms/dashboard` — form dashboard data
- Document Extraction:
  - `GET /api/cortex/get-doc-extracts` — retrieve extracted answer + provenance
  - SSE progress: `GET /api/progress/stream` — server-sent events
- AI Interaction & Enhancement:
  - `POST /api/ai-interaction` — interaction logging
  - `POST /api/enhance-answer` — field-level answer enhancement
- Scoring & Suggestions:
  - `POST /api/score` — compute suggestion coverage & scores
  - `POST /api/suggestions` — generate AI suggestions for fields
  - `POST /api/suggestions/coverage` — coverage analysis
- Search:
  - `GET /api/faiss/search` — semantic document search
- ServiceNow:
  - `POST /api/service-now/create-ticket` — create SNOW ticket
- Users:
  - `GET /api/users/me` — current user (via headers)

Note: exact endpoints are defined in `data_service/routes/*.py`.

### Endpoint Details

- `GET /health`
  - Purpose: Basic health check; returns service status and optionally version.
  - Response: `200 OK` with JSON `{ "status": "ok" }` (shape defined in `routes/health.py`).

- `GET /health/db`
  - Purpose: Database connectivity check.
  - Response: `200 OK` `{ "status": "Database connection successful" }` or error message if failed.

- `POST /api/forms/submit-idea`
  - Purpose: Creates a submission, uploads files to S3, queues background extraction.
  - Auth: `Authorization: Bearer <token>` (if enabled).
  - Content-Type: `multipart/form-data`.
  - Form fields:
    - `submission_journey`: stringified JSON of form data (required).
    - `files`: array of documents (`.pdf`, `.docx`, `.txt`, `.pptx`) (optional).
  - Responses:
    - `201 Created`: submission created and processing queued.
    - `400/401/500`: validation/auth/server errors.
  - Notes: Mirrors the Document Extraction doc’s request/response behavior.

- `GET /api/forms/get-form-details`
  - Purpose: Fetch form data for a specific `submission-id` + `form-id`.
  - Headers: optional `X-WEBAUTH-EMAIL`.
  - Query: `form-id`, `submission-id`.
  - Response: `200 OK` with `FormResponse`; errors include `400/401/500/503/504`.

- `POST /api/forms/auto-populate/common-fields`
  - Purpose: Returns common fields to pre-fill (question_id + answer) for a form.
  - Headers: `X-WEBAUTH-EMAIL` required.
  - Body: `CommonFieldsRequest { form_type, submission_id, form_id }`.
  - Response: `200 OK` with `CommonFieldsResponse`; errors `400/401/500/503`.

- `PUT /api/forms/submit-form`
  - Purpose: Update form data and status; `action=save|submit`. If submit completes all forms, marks submission completed; triggers RPA for specific types.
  - Headers: optional `X-WEBAUTH-EMAIL`.
  - Query: `form-id`, `submission-id`.
  - Content-Type: `multipart/form-data` with `form_data` (JSON string), `action`, optional `files[]`.
  - Response: `200 OK` with `SubmitFormResponse`; errors `400/401/500/503`.

- `GET /api/cortex/get-doc-extracts`
  - Purpose: Returns extracted answer + provenance for a specific question.
  - Headers: `X-WEBAUTH-EMAIL` (user identity).
  - Query params: `submission-id` (UUID), `form-id` (UUID), `question-id` (string).
  - Responses:
    - `200 OK`: `{ question_id, extracted_content, provenance, interaction_id }`.
    - `202 Accepted`: processing still in progress.
    - `404 Not Found`: no data for this question.

- `GET /api/cortex/model-classes`
  - Purpose: List available Cortex model classes; optional `is_admin` query.
  - Responses: `200 OK` or mapped HTTP errors based on Cortex client error content.

- `GET /api/progress/stream`
  - Purpose: SSE endpoint for real-time extraction progress.
  - Returns: `text/event-stream` with events like `status`, `progress`, `message`.
  - Usage: FE subscribes to stream and updates UI accordingly.
  - Path/Query: `/api/progress/stream/{submission_id}?email=<user@lilly.com>`
  - Headers set for SSE: `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`.

- `POST /api/enhance-answer`
  - Purpose: Enhances a field’s answer using AI (clarify/expand while preserving meaning).
  - Typical body fields: `submission_id`, `form_id`, `question_id`, `user_text` (exact schema in router).
  - Responses: `200 OK` with enhanced text and metadata; `4xx/5xx` on errors.

- `POST /api/ai-interaction`
  - Purpose: Logs user-AI interactions (e.g., enhancement actions, feedback) for analytics.
  - Notes: Request/response schema defined in `routes/ai_interaction.py`.
  - Specific route: `PATCH /api/ai-interaction/update-acceptance`
  - Body: `UpdateInteractionRequest { interactions: { interaction_id: boolean } }`.
  - Response: `200 OK` `UpdateInteractionResponse { updated_count, message }`; errors `400/404/500`.

- `POST /api/score`
  - Purpose: Computes suggestion coverage and scoring metrics for a submission.
  - Output: Coverage score, penalties (mandatory failures), per-question weights/confidence.
  - Responses: `200 OK` JSON with scoring details; `4xx/5xx` on errors.
  - Specific route: `POST /api/score/scoring` with `ScoreRequest` body; returns `ScoreResponse`.

- `POST /api/suggestions`
  - Purpose: Generates AI suggestions for specified fields/questions.
  - Output: List of suggestions with confidence and rationale (schema defined in router).
  - Specific route: `GET /api/suggestions?form_type=...`; returns `FormTypeSuggestionsResponse`.

- `POST /api/suggestions/coverage`
  - Purpose: Performs coverage analysis across suggestions.
  - Output: Coverage metrics (max lengths, thresholds per `settings`).
  - Specific route: `POST /api/check-suggestions-coverage` with `CheckSuggestionsCoverageRequest` body.
  - Response: `CheckSuggestionsCoverageResponse { required_suggestions[], completed_suggestions[], interaction_id }`.

- `GET /api/faiss/search`
  - Purpose: Semantic search over indexed corpus using embeddings + FAISS.
  - Query params: Usually `q`/`query` and optional `top_k`; exact names in router.
  - Response: Top matches with similarity and metadata.
  - Specific route: `POST /api/faiss/search` with `SearchRequest { form_data[], submission_id?, top_k?, threshold? }`.
  - Response: `SearchResult { air_number, title, similarity_score } | null`.

- `POST /api/service-now/create-ticket`
  - Purpose: Creates a ServiceNow ticket for a submission.
  - Auth: Typically `Authorization` header; ServiceNow credentials from `settings`.
  - Response: Ticket identifier and status from ServiceNow.
  - Additional route: `GET /api/service-now/approved-ideas-dashboard?days=30&limit=2` for dashboard data.
  - Response: `ApprovedIdeasDashboardResponse { count, top_items[] }`.

- `GET /api/users/me`
  - Purpose: Resolves current user details from request context/headers.
  - Headers: `X-WEBAUTH-EMAIL`.
  - Response: Basic user profile information.
  - Specific route: `GET /api/users/user_info` reads headers `X-WEBAUTH-EMAIL`, optional `X-USER-NAME`, `X-USER-DEPARTMENT`, `X-USER-TITLE`; returns `UserInfoResponse`.

- `POST /api/ai-feedback`
  - Purpose: Create feedback for an AI interaction (acceptance, tags, comments).
  - Auth: `X-WEBAUTH-EMAIL` via `get_current_user`.
  - Body: `CreateAIFeedbackRequest { interaction_id, is_accepted?, feedback_type?, feedback_tags?, user_comment? }`.
  - Response: `201 Created` `CreateAIFeedbackResponse { message, data: { feedback_id } }`; errors include `400/401/404/409/500`.

- `GET /api/user-submissions/get-user-submissions`
  - Purpose: List submissions for the logged-in user.
  - Headers: `X-WEBAUTH-EMAIL` required.
  - Response: `SubmissionsListResponse` or empty data list.

- `GET /api/user-submissions/submission-status?submission-id=...`
  - Purpose: Poll current document extraction status for a submission.
  - Headers: `X-WEBAUTH-EMAIL` required.
  - Response: `SubmissionStatusResponse { submission_id, status, message, created_at, updated_at }`.

- `GET /api/form-dashboard?submission-id=...`
  - Purpose: Return all forms and statuses for dashboard view.
  - Headers: optional `X-WEBAUTH-EMAIL`.
  - Response: `FormDashboardList`.

---

## 4. Processing Flows

### Flow A: Idea Submission & Document Upload

```
User submits form (multipart)
         ↓
POST /api/forms/submit-idea
         ↓
- Validate form & user
- Upload files to S3
- Create submission + uploaded_documents
- Create SubmissionProcessingStatus = PENDING
- Launch background extraction task
- Return 201 to client
```

### Flow B: Background Document Extraction

```
Background task
         ↓
- Update status → PROCESSING
- Extract blocks (MarkItDown/pdfminer)
- Hybrid retrieval (BM25 + dense embeddings)
- Ask AI (Cortex or LLM Gateway)
- Persist FormExtractions JSONB (answers + provenance)
- Update status → COMPLETED/FAILED
- Send SSE updates during processing
```

### Flow C: Frontend Retrieval of Extracted Data

```
FE checks if extraction completed
         ↓
GET /api/cortex/get-doc-extracts?submission-id=...&form-id=...&question-id=...
         ↓
- Validate ownership
- Read FormExtractions JSONB
- Return extracted_content + provenance
```

### Flow D: Scoring & Suggestions

```
POST /api/score
POST /api/suggestions
POST /api/suggestions/coverage
         ↓
- Analyze field content & suggestions
- Compute coverage, weights, confidence
- Return structured JSON for UI
```

---

## 5. Data Models

Representative tables (see `data_service/models/*`):

- `submissions` — top-level submission info (user, timestamps)
- `submission_forms` — submitted form data (JSON)
- `uploaded_documents` — files uploaded (S3 keys, metadata)
- `form_extractions` — extracted answers (JSONB per form)
- `document_extract` — raw text blocks & metadata (optional)
- `sage_ai_rpa_status` — RPA queue status (shared with RPA service)
- `users` — user accounts

JSONB structure examples are detailed in the Document Extraction technical doc.

---

## 6. Configuration

Environment variables defined in `data_service/configurations/settings.py`:

```env
# Azure AD / MSAL
client_id=...
client_secret=...
tenant_id=...

# Database
DB_NAME=sage
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=60

# S3
s3_bucket=your-bucket
s3_prefix=your/prefix
upload_s3_prefix=uploads/

# LLM Gateway
llm_gateway_url=https://llm-gateway...
llm_gateway_key=...
use_llm_gateway=true
DOC_EXTRACT_LLM_GATEWAY_MODEL=gpt-5-2025-08-07

# Cortex
cortex_base_url=https://cortex...
cortex_scope=api://Cortex.lilly.com/.default

# Document extraction
chars_per_page=3000
max_concurrent_llm_calls=5

# FAISS
faiss_enabled=true
faiss_use_s3=true
faiss_index_path=faiss_cache/test_index.index
faiss_metadata_path=faiss_cache/faiss_metadata.parquet
faiss_s3_index_key=...
faiss_s3_metadata_key=...

# CORS
cors_allowed_origins=https://lilly-sage-ai.dev.bu.lilly.com, http://localhost:5173
cors_allow_credentials=true
cors_allowed_methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
cors_allowed_headers=Content-Type,Authorization,X-Trace-Id,X-WEBAUTH-EMAIL
cors_expose_headers=X-Trace-Id
```

Windows PowerShell tip:

```powershell
# Activate venv and run
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -e .
```

---

## 7. Backend Services & Utilities

Key components:

- Services: `data_service/service/*` (e.g., `faiss_service`, extraction services)
- Clients: `data_service/clients/*` (`cortex_client`, `llm_gateway_client`, `s3_client`, `service_now_client`)
- Routes: `data_service/routes/*` (FastAPI routers)
- Utils: `data_service/utils/*` (`logger`, `embedding_model`, progress SSE)
- Exception handlers: `data_service/handlers/exception_handlers.py`

---

## 8. FAISS & Embeddings

- Embedding model loaded at startup (`lifespan`) via `embedding_model.py`
- FAISS initialized from S3 or local files (`faiss_service.initialize_faiss_service`)
- Controlled by `settings.faiss_enabled`, `faiss_use_s3`, and paths/keys

---

## 9. Database Schema

Alembic migrations manage schema evolution. Representative entities:

- `form_extractions` (JSONB per form)
- `submission_processing_status` (PENDING/PROCESSING/COMPLETED/FAILED)
- `uploaded_documents`
- `submissions`, `users`, `questions`, `form_schemas`, etc.

Run migrations:

```bash
poetry run alembic revision --autogenerate -m "Change description"
poetry run alembic upgrade head
```

### Data Model Diagram

![Data Model](images/models.png)

#### Data Model Summary
- Submissions link to Users and Categories; each has many SubmissionForms.
- UploadedDocuments and FormExtractions attach per submission/form.
- AIInteractions and AIFeedback track AI usage and user feedback per question.
- Scoring tables (QuestionScoringConfig, SuggestionCoverageScore) store weights/coverage.
- RPA and ServiceNow tables track automation/run status and ticket linkage.

---

## 10. Deployment & Running Locally

### Run Backend

```bash
poetry run uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### Local Postgres (Podman)

```bash
podman pull postgres:15
podman run --name sage_postgres -e POSTGRES_DB=DB_NAME -e POSTGRES_USER=DB_USER -e POSTGRES_PASSWORD=DB_PASSWORD -p 5432:5432 -d postgres:15
```

### Docker

```bash
# Build
podman build -t sage-ai-be:latest -f .Dockerfile .

# Run
podman run --env-file .env -p 8080:8080 sage-ai-be:latest
```

---

## 11. Observability (Tracing & Metrics)

- OpenTelemetry tracing configured in `main.py` via `configure_tracing()`
  - OTLP exporter endpoint from `TELEMETRY_CONFIG` env JSON
  - SQLAlchemy and `requests` instrumented
  - Adds `X-Trace-Id` to responses via middleware
- Prometheus metrics exposed via `Instrumentator().instrument(app).expose(app)`
  - Default `/metrics` endpoint

Example `TELEMETRY_CONFIG`:

```json
{
  "applicationName": "sage-ai-backend",
  "tracerProvider": { "type": "jaeger", "url": "http://jaeger-collector:4317" }
}
```

---

## 12. Troubleshooting

- 401/403 Authentication:
  - Verify `X-WEBAUTH-EMAIL` or Authorization headers
  - Check Azure AD/MSAL configuration
- Extraction not starting:
  - Confirm background task creation and SSE progress
  - Validate S3 credentials and uploads
- FAISS errors:
  - Ensure index/metadata files exist (local or S3)
  - Check embedding model availability
- Database connection:
  - Validate `.env` values and network reachability
- CORS issues:
  - Check allowed origins/methods/headers in settings
