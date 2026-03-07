# SAGE AI Technical Documentation

---

# Document Extraction Feature - Technical Documentation

> **Last Updated:** December 18, 2025  
> **Status:** ✅ Production Ready  
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Document Processing Flow](#document-processing-flow)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Configuration](#configuration)
7. [Backend Services](#backend-services)
8. [Supported File Types](#supported-file-types)

---

## 1. Overview

### Purpose

The Document Extraction feature extracts structured data from uploaded documents (PDF, DOCX, TXT, PPTX) and uses AI to answer predefined form questions based on the document content. This assists users in filling out forms by pre-populating answers from their uploaded documents.

### What It Does

- **Extracts text content** from documents using MarkItDown library
- **Processes documents in the background** with real-time progress tracking via Server-Sent Events (SSE)
- **Uses AI (Cortex API or LLM Gateway)** to analyze documents and answer form-specific questions
- **Stores extracted answers** in database (JSONB format) for retrieval
- **Displays AI switch buttons** on form fields that have extracted data available
- **Provides provenance tracking** to show which document and page the answer came from

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────┐
│   User Uploads  │
│   Documents     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  POST /api/forms/submit-idea                            │
│  - Receives files + form metadata                       │
│  - Uploads files to S3                                  │
│  - Creates SubmissionProcessingStatus (PENDING)         │
│  - Queues background extraction task                    │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Background Document Processor                          │
│  - Updates status to PROCESSING                         │
│  - Extracts text blocks from documents (MarkItDown)     │
│  - Performs hybrid retrieval (BM25 + Dense Embeddings)  │
│  - Sends top-k blocks + questions to AI                 │
│  - Stores results in FormExtractions table (JSONB)      │
│  - Updates status to COMPLETED                          │
│  - Sends SSE progress updates                           │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  GET /api/cortex/get-doc-extracts                       │
│  - Frontend checks if question has extracted data       │
│  - Returns extracted answer + provenance                │
│  - Displayed in AI features sidebar                     │
└─────────────────────────────────────────────────────────┘
```

### Service Layers

```
┌──────────────────────────────────────────────────────────┐
│  Routes Layer (FastAPI)                                  │
│  - /api/forms/submit-idea                                │
│  - /api/cortex/get-doc-extracts                          │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│  Service Layer                                           │
│  - SubmissionService: Handles file uploads & queuing     │
│  - DocumentExtractionService: Extracts answers from      │
│    blocks, retrieves data                                │
│  - BackgroundDocumentProcessor: Orchestrates extraction  │
│  - ParallelExtractionService: Processes multiple files   │
│  - HybridRetriever: Performs hybrid retrieval (BM25 +    │
│    dense embeddings) to find relevant blocks             │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│  Utility Layer                                           │
│  - DocumentExtractor: Text extraction (MarkItDown)       │
│  - SSEProgressTracker: Real-time progress updates        │
│  - ProcessingStatusUtils: Database status management     │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│  External Integration Layer                              │
│  - CortexClient: AI model for document analysis          │
│  - LLMGatewayClient: Alternative AI model                │
│  - S3Client: Document storage                            │
└──────────────────────────────────────────────────────────┘
```

### Core Components

#### Backend Components

| Component                     | Purpose                                                          | Location                                                |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| `SubmissionService`           | Handles submission creation and queues extraction                | `data_service/service/idea_submission.py`               |
| `BackgroundDocumentProcessor` | Orchestrates background extraction workflow                      | `data_service/service/background_document_processor.py` |
| `ParallelExtractionService`   | Processes multiple documents in parallel                         | `data_service/service/parallel_extraction_service.py`   |
| `DocumentExtractionService`   | Extracts answers from blocks, retrieves data                     | `data_service/service/doc_extract_service.py`           |
| `DocumentExtractor`           | Splits documents into Block objects (paragraphs, headings, etc.) | `data_service/utils/document_extractor.py`              |
| `HybridRetriever`             | Combines BM25 + dense embeddings for semantic block search       | `data_service/service/hybrid_retriever.py`              |
| `SSEProgressTracker`          | Sends real-time progress via Server-Sent Events                  | `data_service/utils/sse_progress_tracker.py`            |

### Database Schema

#### FormExtractions Table

Stores extracted answers for each form.

| Column           | Type      | Description                     |
| ---------------- | --------- | ------------------------------- |
| `id`             | UUID      | Primary key                     |
| `submission_id`  | UUID      | Foreign key to submissions      |
| `form_id`        | UUID      | Foreign key to submission_forms |
| `extracted_data` | JSONB     | Question answers and metadata   |
| `created_at`     | TIMESTAMP | Creation timestamp              |
| `updated_at`     | TIMESTAMP | Last update timestamp           |

**JSONB Structure (`extracted_data`):**

```json
{
  "D-Q01": {
    "answer_text": "Healthcare AI Platform",
    "provenance": [
      {
        "file_name": "proposal.pdf",
        "page_number": 1,
        "excerpt": "...Healthcare AI Platform for clinical decision support..."
      }
    ],
    "confidence": 0.95
  },
  "AI-Q6": {
    "answer_text": "Clinical decision support, diagnostics assistance",
    "provenance": [
      {
        "file_name": "technical_spec.docx",
        "page_number": 3,
        "excerpt": "...The platform provides clinical decision support..."
      }
    ],
    "confidence": 0.88
  }
}
```

#### SubmissionProcessingStatus Table

Tracks the processing status of document extraction.

| Column          | Type      | Description                            |
| --------------- | --------- | -------------------------------------- |
| `id`            | UUID      | Primary key                            |
| `submission_id` | UUID      | Foreign key to submissions (unique)    |
| `status`        | VARCHAR   | PENDING, PROCESSING, COMPLETED, FAILED |
| `message`       | TEXT      | Status message for UI display          |
| `created_at`    | TIMESTAMP | Creation timestamp                     |
| `updated_at`    | TIMESTAMP | Last update timestamp                  |

---

## 3. Document Processing Flow

### Flow 1: Document Upload and Extraction Initiation

```
User submits idea with documents
         ↓
POST /api/forms/submit-idea
         ↓
┌────────────────────────────────────────┐
│ SubmissionService.create_idea_submission│
│ 1. Parse form data                     │
│ 2. Create submission record            │
│ 3. Upload files to S3                  │
│ 4. Create UploadedDocuments records    │
│ 5. Queue background extraction         │
│ 6. Create SubmissionProcessingStatus   │
│    (status=PENDING)                    │
└────────────────────────────────────────┘
         ↓
asyncio.create_task() launches background processor
         ↓
Response returned to user immediately
(User can navigate to forms, extraction runs in background)
```

### Flow 2: Background Extraction Processing

```
Background task starts
         ↓
┌────────────────────────────────────────────────┐
│ BackgroundDocumentProcessor                    │
│ 1. Update status → PROCESSING                  │
│ 2. Send SSE: "Starting extraction"             │
│ 3. Convert files to in-memory format           │
│ 4. Call ParallelExtractionService              │
└────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ ParallelExtractionService                      │
│ 1. Fetch questions from database               │
│ 2. Extract text blocks from documents          │
│ 3. Initialize HybridRetriever                  │
│ 4. For each question:                          │
│    a. Retrieve top-k relevant blocks           │
│    b. Send blocks + question to AI             │
│    c. Parse Answer with provenance             │
│ 5. Group answers by form type                  │
└────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ Store Results                                  │
│ 1. Create/update FormExtractions records       │
│ 2. Store JSONB data (question → answer map)    │
│ 3. Update status → COMPLETED                   │
│ 4. Send SSE: "Extraction complete"             │
└────────────────────────────────────────────────┘
```

### Flow 3: Retrieving Extracted Data (Frontend)

```
User navigates to form
         ↓
┌────────────────────────────────────────────────┐
│ FieldWrapper component renders                 │
│ 1. Checks if form is idea-sub-form             │
│ 2. Checks extraction status (context)          │
│ 3. For each field with AI features enabled:    │
│    - Call GET /api/cortex/get-doc-extracts     │
│    - Check if question has extracted data      │
│    - Show AI switch button if data exists      │
└────────────────────────────────────────────────┘
         ↓
GET /api/cortex/get-doc-extracts?
  submission-id={id}&form-id={id}&question-id=D-Q01
         ↓
┌────────────────────────────────────────────────┐
│ DocumentExtractionService                      │
│ 1. Validate submission ownership               │
│ 2. Check processing status (must be COMPLETED) │
│ 3. Query FormExtractions table                 │
│ 4. Extract answer for specific question_id     │
│ 5. Return extracted_content + provenance       │
└────────────────────────────────────────────────┘
         ↓
Frontend receives data
         ↓
┌────────────────────────────────────────────────┐
│ FieldWrapper displays AI switch                │
│ - User clicks AI switch button                 │
│ - AIFeaturesContext opens sidebar              │
│ - Sidebar shows extracted answer + provenance  │
│ - User can copy answer to field                │
└────────────────────────────────────────────────┘
```

---

## 4. API Endpoints

### 4.1 Retrieve Extracted Data

**Endpoint:** `GET /api/cortex/get-doc-extracts`

**Description:** Retrieves extracted answer for a specific question from a specific form.

**Query Parameters:**

| Parameter       | Type   | Required | Description                          |
| --------------- | ------ | -------- | ------------------------------------ |
| `submission-id` | UUID   | ✅       | Submission UUID                      |
| `form-id`       | UUID   | ✅       | Form UUID (SubmissionForms.id)       |
| `question-id`   | string | ✅       | Question ID (e.g., "D-Q01", "AI-Q6") |

**Headers:**

| Header            | Required | Description                     |
| ----------------- | -------- | ------------------------------- |
| `X-WEBAUTH-EMAIL` | ✅       | User's email for authentication |

**Response Status Codes:**

| Code  | Description                             |
| ----- | --------------------------------------- |
| `200` | Success - extracted data returned       |
| `202` | Accepted - processing still in progress |
| `400` | Bad request - invalid parameters        |
| `404` | Not found - no data for this question   |
| `500` | Internal server error                   |

**Success Response (200):**

```json
{
  "question_id": "D-Q01",
  "extracted_content": {
    "answer_text": "Healthcare AI Platform for clinical decision support",
    "provenance": [
      {
        "file_name": "proposal.pdf",
        "page_number": 1,
        "excerpt": "Our Healthcare AI Platform provides clinical decision support..."
      }
    ],
    "confidence": 0.95
  },
  "submission_id": "123e4567-e89b-12d3-a456-426614174000",
  "form_id": "987fcdeb-51a2-43f7-9876-543210fedcba",
  "created_at": "2025-12-18T10:30:00Z",
  "updated_at": "2025-12-18T10:32:00Z",
  "interaction_id": "abc123-def456-ghi789"
}
```

**Processing Response (202):**

```json
{
  "error": "Processing In Progress",
  "message": "Your documents are currently being processed. Please wait a moment."
}
```

**Not Found Response (404):**

```json
{
  "error": "Not Found",
  "message": "No extracted data found for this question. Please fill it out manually."
}
```

**Example cURL:**

```bash
curl -X GET "http://localhost:8080/api/cortex/get-doc-extracts?submission-id=123e4567-e89b-12d3-a456-426614174000&form-id=987fcdeb-51a2-43f7-9876-543210fedcba&question-id=D-Q01" \
  -H "X-WEBAUTH-EMAIL: user@example.com"
```

### 4.2 Submit Idea with Documents

**Endpoint:** `POST /api/forms/submit-idea`

**Description:** Creates a new submission and queues document extraction.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field                | Type          | Required | Description                 |
| -------------------- | ------------- | -------- | --------------------------- |
| `submission_journey` | string (JSON) | ✅       | Form data as JSON string    |
| `files`              | File[]        | ❌       | Array of uploaded documents |

**Headers:**

| Header          | Required | Description |
| --------------- | -------- | ----------- |
| `Authorization` | ✅       | JWT token   |

**Success Response (201):**

```json
{
  "message": "Submission created",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "category-id": "987fcdeb-51a2-43f7-9876-543210fedcba"
  }
}
```

**Example cURL:**

```bash
curl -X POST "http://localhost:8080/api/forms/submit-idea" \
  -H "Authorization: Bearer <token>" \
  -F 'submission_journey={"form_data":[{"questionId":"D-Q01","question":"What is your idea?","answer":["My idea description"]}]}' \
  -F "files=@proposal.pdf" \
  -F "files=@technical_spec.docx"
```

---

## 5. Data Models

### ExtractedContent Model (Frontend)

```typescript
export interface ExtractedContent {
  answer_text: string;
  provenance: Provenance[];
  confidence: number;
}

export interface Provenance {
  file_name: string;
  page_number: number;
  excerpt: string;
}

export interface GetDocExtractsResponse {
  question_id: string;
  extracted_content: ExtractedContent | null;
  submission_id: string;
  form_id: string;
  created_at: string;
  updated_at: string;
  interaction_id: string | null;
}
```

### DocumentExtractionResponse Model (Backend)

```python
class DocumentExtractionResponse(BaseModel):
    question_id: str
    extracted_content: Optional[Dict[str, Any]]
    submission_id: str
    form_id: str
    created_at: str
    updated_at: str
    interaction_id: Optional[str] = None
```

### ProcessingStatus Enum

```python
class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
```

---

## 6. Configuration

### Environment Variables (Backend)

```bash
# Document extraction model (Cortex or LLM Gateway)
document_analysis_model=sageai-doc-extract-model-v3
DOC_EXTRACT_LLM_GATEWAY_MODEL=gpt-5-2025-08-07

# Toggle between Cortex API and LLM Gateway
use_llm_gateway=false

# Extraction concurrency settings
max_concurrent_llm_calls=5

# Page estimation for text documents
chars_per_page=3000
```

**Location:** `data_service/configurations/settings.py`

### Question Filtering Configuration

Located in: `data_service/constants/extraction_mapping.py`

```python
# Forms to exclude from extraction
EXCLUDED_EXTRACTION_FORMS = [FormType.GCO_RISK_REGISTRY]

# Specific questions to include (empty = all questions)
INCLUDED_QUESTION_IDS = [
    "D-Q01",  # Idea Submission - Title
    "D-Q02",  # Idea Submission - Description
    "AI-Q6",  # AI Registry - Intended Use
    "AI-Q7",  # AI Registry - Scope
]
```

### Supported Question Types

Only TEXT-type questions are processed:

- `"Text"`
- `"Text (Long Text)"`
- `"Long Text"`

---

## 7. Backend Services

### DocumentExtractor (Text Extraction)

**Purpose:** Extracts text content from documents using MarkItDown library.

**Supported Formats:**

- PDF (`.pdf`)
- Word Documents (`.docx`)
- Text Files (`.txt`)
- PowerPoint (`.pptx`)

**Key Methods:**

```python
def extract_content(
    file_content: bytes,
    filename: str,
    content_type: str
) -> Dict[str, Any]:
    """
    Extract text from document

    Returns:
        {
            "success": True,
            "text": "Extracted text content...",
            "page_count": 5,
            "char_count": 12345,
            "word_count": 2000,
            "file_type": "pdf"
        }
    """
```

### ParallelExtractionService

**Purpose:** Processes multiple documents in parallel with semaphore-based concurrency control.

**Key Features:**

- Parallel file text extraction
- Semaphore-limited concurrent AI calls
- Question filtering based on configuration
- Results grouped by form type

**Flow:**

1. Fetch text-type questions from database
2. Apply exclusion/inclusion filters
3. Extract text from each document in parallel
4. Send document text + questions to AI
5. Parse and validate JSON responses
6. Group answers by form prefix (D-Q → idea-sub-form, AI-Q → ai-registry-form)

### BackgroundDocumentProcessor

**Purpose:** Orchestrates the entire background extraction workflow.

**Responsibilities:**

- Status tracking (PENDING → PROCESSING → COMPLETED/FAILED)
- SSE progress updates
- Error handling and rollback
- Database transaction management
- Result storage

---

## 9. Supported File Types

| File Type  | Extensions | MIME Types                                                                                      |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------- |
| PDF        | `.pdf`     | `application/pdf`                                                                               |
| Word       | `.docx`    | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword` |
| Text       | `.txt`     | `text/plain`                                                                                    |
| PowerPoint | `.pptx`    | `application/vnd.openxmlformats-officedocument.presentationml.presentation`                     |

### Limitations

❌ **Not Supported:**

- Image files (`.jpg`, `.png`, `.gif`)
- Scanned PDFs (no OCR)
- Excel files (`.xlsx`)
- Zip archives
- Audio/Video files

---

## 9.1 Block Extraction & Hybrid Retrieval

### What Are Blocks?

**Blocks** are semantic chunks of text extracted from documents. Each block represents a logical unit like a paragraph, heading, table, or list item.

**Block Data Model:**

```python
@dataclass
class Block:
    span_id: int              # Unique identifier
    file_id: str              # Source file ID
    file_name: str            # Original filename
    page_or_slide: int        # Page/slide number
    block_index: int          # Sequential index within page
    text: str                 # Actual text content
    char_start: int           # Character position start
    char_end: int             # Character position end
    block_type: str           # Type: paragraph, heading, table, list
```

### Block Extraction Process

**Step 1: Extract Text with MarkItDown**

```python
# For PDFs: Use pdfminer directly
text_content = extract_pdf_with_pdfminer(file_bytes)
# Result: "--- Page 1 ---\nContent...\n\n--- Page 2 ---\nMore content..."

# For DOCX/PPTX: Use MarkItDown library
result = markitdown.convert_stream(file_obj, file_extension=".docx")
text_content = result.text_content
```

**Step 2: Parse Page/Slide Markers**

- **PDF**: Split by `--- Page N ---` markers
- **PPTX**: Split by `<!-- Slide number: N -->` markers
- **DOCX**: Estimate pages using `char_offset / chars_per_page`

**Step 3: Split into Sections**

```python
# Split by double newlines (\n\n)
sections = page_content.split("\n\n")

for section in sections:
    # Classify block type
    if section.startswith("#"):
        block_type = "heading"
    elif "|" in section and section.count("|") > 2:
        block_type = "table"
    elif section.startswith("-") or section.startswith("*"):
        block_type = "list"
    else:
        block_type = "paragraph"

    # Create Block object
    blocks.append(Block(
        span_id=len(blocks),
        file_name="document.pdf",
        page_or_slide=page_num,
        text=section,
        block_type=block_type,
        ...
    ))
```

**Example Blocks from a Document:**

```python
[
    Block(
        span_id=0,
        file_name="proposal.pdf",
        page_or_slide=1,
        text="Healthcare AI Platform - Executive Summary",
        block_type="heading"
    ),
    Block(
        span_id=1,
        file_name="proposal.pdf",
        page_or_slide=1,
        text="Our platform provides clinical decision support for healthcare providers using advanced machine learning algorithms.",
        block_type="paragraph"
    ),
    Block(
        span_id=2,
        file_name="proposal.pdf",
        page_or_slide=2,
        text="Key features include: automated diagnosis assistance, treatment recommendations, and patient risk stratification.",
        block_type="list"
    )
]
```

### Hybrid Retrieval Mechanism

**Purpose:** Given a question, find the most relevant blocks from all extracted blocks using both keyword matching (BM25) and semantic similarity (dense embeddings).

**Architecture:**

```
┌──────────────────────────────────────────────────┐
│  Question: "What is the intended use of the AI?" │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│  HybridRetriever (alpha=0.7)                     │
│                                                  │
│  ┌─────────────────┐    ┌─────────────────────┐ │
│  │  BM25 Scoring   │    │  Dense Embeddings   │ │
│  │  (Keyword)      │    │  (Semantic)         │ │
│  │                 │    │                     │ │
│  │  Tokenize query │    │  Encode query       │ │
│  │  Match keywords │    │  Compute cosine     │ │
│  │  Get BM25 scores│    │  similarity         │ │
│  └────────┬────────┘    └──────────┬──────────┘ │
│           │                        │            │
│           ▼                        ▼            │
│  ┌────────────────────────────────────────────┐ │
│  │  Combine Scores (Weighted Average)         │ │
│  │                                            │ │
│  │  hybrid_score = alpha * dense_score +     │ │
│  │                 (1 - alpha) * bm25_score  │ │
│  └────────────────┬───────────────────────────┘ │
└───────────────────┼─────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  Top-K Blocks (Ranked by Hybrid Score)           │
│                                                  │
│  1. Block(span_id=42, score=0.89, ...)          │
│  2. Block(span_id=15, score=0.85, ...)          │
│  3. Block(span_id=71, score=0.81, ...)          │
│  ...                                             │
│  10. Block(span_id=33, score=0.72, ...)         │
└──────────────────────────────────────────────────┘
```

**Step-by-Step Process:**

1. **Initialization (One-Time Per Document Set)**

```python
retriever = HybridRetriever(
    blocks=all_blocks,  # All blocks from all documents
    embedding_model=SentenceTransformer('all-MiniLM-L6-v2'),
    alpha=0.7,  # Weight: 70% dense, 30% BM25
    batch_size=32
)

# Internally:
# - Creates BM25 index from block texts
# - Generates dense embeddings for all blocks
# - Stores embeddings in numpy array
```

2. **Query Processing (Per Question)**

```python
relevant_blocks = retriever.retrieve(
    query="What is the intended use of the AI?",
    top_k=10
)
```

3. **BM25 Scoring (Keyword Matching)**

```python
# Tokenize query
tokens = ["what", "is", "the", "intended", "use", "of", "the", "ai"]

# BM25 scores for each block
bm25_scores = bm25.get_scores(tokens)
# Example: [0.0, 2.5, 0.8, 5.2, 1.1, ...]

# Normalize to [0, 1]
bm25_scores_norm = bm25_scores / max(bm25_scores)
# Example: [0.0, 0.48, 0.15, 1.0, 0.21, ...]
```

4. **Dense Embedding Scoring (Semantic Similarity)**

```python
# Encode query
query_embedding = model.encode([query])
# Result: [0.12, -0.45, 0.78, ...] (384 dimensions)

# Compute cosine similarity with all block embeddings
dense_scores = np.dot(block_embeddings, query_embedding)
# Result: [-0.2, 0.6, 0.3, 0.9, 0.1, ...]

# Normalize to [0, 1]
dense_scores = (dense_scores + 1) / 2
# Result: [0.4, 0.8, 0.65, 0.95, 0.55, ...]
```

5. **Hybrid Score Calculation**

```python
alpha = 0.7  # Favor dense embeddings

hybrid_scores = alpha * dense_scores + (1 - alpha) * bm25_scores_norm

# Example calculation for Block 3:
# hybrid_score = 0.7 * 0.95 + 0.3 * 1.0 = 0.665 + 0.3 = 0.965
```

6. **Top-K Selection**

```python
# Get indices of top-k scores
top_indices = np.argsort(hybrid_scores)[::-1][:top_k]

# Return corresponding blocks
top_blocks = [blocks[i] for i in top_indices]
```

**Alpha Parameter Effect:**

| Alpha | Emphasis            | Use Case                         |
| ----- | ------------------- | -------------------------------- |
| 0.0   | 100% BM25           | Exact keyword matching           |
| 0.3   | 30% Dense, 70% BM25 | Balance toward keywords          |
| 0.5   | Equal               | Balanced hybrid                  |
| 0.7   | 70% Dense, 30% BM25 | Favor semantic meaning (default) |
| 1.0   | 100% Dense          | Pure semantic search             |

### LLM Prompt Construction

**After retrieving top-k blocks, construct prompt:**

```python
context_parts = []
for block in top_blocks:
    context_parts.append(f"[SPAN_{block.span_id}] {block.text}")

context = "\n\n".join(context_parts)

prompt = f"""
Answer the following question based on the document context:

Question: {question['question']}

Context:
{context}

Provide your answer in JSON format:
{{
    "question_id": "{question['id']}",
    "answer": "Your answer here",
    "span_ids": [list of relevant SPAN_IDs],
    "confidence": 0.0-1.0
}}
"""
```

**Example Prompt:**

```
Question: What is the intended use of the AI system?

Context:
[SPAN_1] Our Healthcare AI Platform provides clinical decision support for healthcare providers using advanced machine learning algorithms.

[SPAN_15] The platform is designed for use in hospital settings to assist physicians in diagnosing complex medical conditions.

[SPAN_42] Intended use includes automated diagnosis assistance, treatment recommendations, and patient risk stratification.

Provide your answer in JSON format...
```

**LLM Response:**

```json
{
  "question_id": "AI-Q6",
  "answer": "Clinical decision support for healthcare providers, including automated diagnosis assistance, treatment recommendations, and patient risk stratification in hospital settings.",
  "span_ids": [1, 15, 42],
  "confidence": 0.92
}
```

### Provenance Generation

Using `span_ids` from LLM response, construct provenance:

```python
block_lookup = {block.span_id: block for block in all_blocks}

provenance = []
for span_id in answer.span_ids:
    block = block_lookup[span_id]
    provenance.append({
        "file_name": block.file_name,
        "page_number": block.page_or_slide,
        "excerpt": block.text[:200],  # Truncate for display
        "span_id": span_id
    })

answer.provenance = provenance
```

**Final Answer Object:**

```python
Answer(
    question_id="AI-Q6",
    answer_text="Clinical decision support for healthcare providers...",
    span_ids=[1, 15, 42],
    confidence=0.92,
    provenance=[
        {
            "file_name": "proposal.pdf",
            "page_number": 1,
            "excerpt": "Our Healthcare AI Platform provides clinical...",
            "span_id": 1
        },
        {
            "file_name": "proposal.pdf",
            "page_number": 2,
            "excerpt": "The platform is designed for use in hospital...",
            "span_id": 15
        },
        {
            "file_name": "technical_spec.docx",
            "page_number": 5,
            "excerpt": "Intended use includes automated diagnosis...",
            "span_id": 42
        }
    ]
)
```

### Configuration Options

**Configurable (settings.py):**

```python
chars_per_page = 3000  # For estimating pages in DOCX
embedding_seed = 42  # For deterministic embeddings
max_concurrent_llm_calls = 5  # Semaphore limit for concurrent LLM calls
```

**parallel_extraction_service.py:**

```python
top_k = 10  # Number of blocks to retrieve per question
alpha = 0.7  # Hybrid retrieval weight (70% dense, 30% BM25)
embedding_model = "all-MiniLM-L6-v2"  # SentenceTransformer model
```

---

## 10. Work in Progress (WIP)

### `refactoring/ai-services`

- **Description**: This branch focuses on refactoring the codebase to move all AI-related features, including Document Extraction, into a dedicated `ai_service` directory. This will improve modularity and separation of concerns.

### `fix/doc-extract-prompt`

- **Description**: In this branch, the prompt sent to the AI model is being modified. The goal is to prevent the model from providing a "running commentary" when it encounters contradictory information within the source documents, leading to cleaner and more direct answers.

---

# ENHANCE ANSWER FEATURE DOCUMENTATION

## 1. Feature Overview

### 1.1 Purpose

The Enhance Answer feature uses AI to improve user-provided text responses by:

- Analyzing the original answer against question requirements
- Incorporating relevant suggestions from the knowledge base
- Leveraging extracted document content for context
- Considering related form data for comprehensive enhancement
- Providing detailed rationale for improvements

### 1.2 Key Capabilities

- Context-Aware Enhancement: Uses multiple data sources for intelligent text improvement
- Suggestion Integration: Automatically incorporates relevant suggestions
- Document Analysis: Extracts and uses relevant information from uploaded documents
- Multi-Model Support: Works with both Cortex and LLM Gateway
- Audit Trail: Records all AI interactions for compliance and feedback

---

## 2. Architecture & Components

### 2.1 Service Architecture

```
+----------------------+    +-----------------------------+
|    Input Validator   |    |  Question Context Builder   |
+----------------------+    +-----------------------------+

+----------------------+    +-----------------------------+
|   Document Builder   |    | Form Data Context Builder   |
+----------------------+    +-----------------------------+

+----------------------+    +-----------------------------+
|     LLM Response     |    |   AI Interaction Logger     |
+----------------------+    +-----------------------------+
```

### 2.2 Key Components

**EnhanceAnswerService (enhance_answer.py)**
Main orchestrator that coordinates the enhancement process.
Responsibilities:

- Input validation
- Context building
- LLM invocation
- Response parsing
- AI interaction logging

**a. QuestionContextBuilder (enhance_ans_context_builders.py)**
Fetches question details and related suggestions.
Methods:

- `build(question_id)`: Returns question text and suggestions

**b. DocumentContextBuilder (enhance_ans_context_builders.py)**
Extracts relevant document content for the question.
Methods:

- `build(submission_id, form_id, question_id, db)`: Returns extracted document content

**c. FormDataContextBuilder (enhance_ans_context_builders.py)**
Formats related form data for context.
Methods:

- `build(form_data)`: Returns formatted form entries

**d. LLMResponseParser (llm_response_parser_enhance_ans.py)**
Parses and validates LLM responses.
Methods:

- `parse(llm_response)`: Extracts `enhanced_answer` and `rationale`

---

## 3. API Dependencies

### 3.1 Internal API Dependencies

| Dependency                  | Purpose                               | Module                                     | Key Methods                       |
| --------------------------- | ------------------------------------- | ------------------------------------------ | --------------------------------- |
| Document Extraction Service | Extract content from documents        | `data_service.service.doc_extract_service` | `get_question_extraction()`       |
| Cache Manager               | Retrieve cached questions/suggestions | `data_service.utils.cache_manager`         | `get_question_with_suggestions()` |
| AI Interaction Utils        | Log AI interactions                   | `data_service.utils.ai_interaction_utils`  | `create_ai_interaction()`         |
| Database Session            | Database operations                   | `data_service.db_connection.db`            | `get_db()`                        |

### 3.2 External API Dependencies

| API         | Purpose                       | Configuration                                   | Fallback   |
| ----------- | ----------------------------- | ----------------------------------------------- | ---------- |
| LLM Gateway | Primary AI model provider     | `LLM_GATEWAY_URL`, `LLM_GATEWAY_KEY`            | Cortex API |
| Cortex API  | Alternative AI model provider | `CORTEX_BASE_URL`, `CLIENT_ID`, `CLIENT_SECRET` | N/A        |

### 3.3 API Call Flow

```
+----------------+
| Client Request |
+----------------+
        |
        v
+-----------------------------+
| Enhance Answer              |
|   API Endpoint              |
+-----------------------------+
        |
        v
+-------------------------------------------------------------+
|   Internal API Calls (Sequential)                           |
|   1. Cache Manager (get_question_with_suggestions)          |
|   2. Document Extraction Service (get_question_extraction)  |
|   3. LLM Gateway / Cortex (ask_model / invoke_ask)          |
|   4. AI Interaction Logger (create_ai_interaction)          |
+-------------------------------------------------------------+
        |
        v
+-------------------+
| Enhance Response  |
+-------------------+
```

---

## 4. API Request & Response

### 4.1 Endpoint Details

- **Endpoint:** `POST /api/enhance-answer`
- **Authentication:** Required (Bearer Token)
- **Content-Type:** `application/json`

### 4.2 Request Schema

```json
{
  "question_id": "string",
  "user_text": "string (optional)",
  "submission_id": "uuid",
  "form_id": "string",
  "form_data": [
    {
      "questionId": "string",
      "question": "string",
      "answer": ["string"]
    }
  ]
}
```

### 4.3 Request Example

```json
{
  "question_id": "AI-Q1",
  "user_text": "We use machine learning for predictions",
  "submission_id": "123e4567-e89b-12d3-a456-426614174000",
  "form_id": "1567-e89b-12d3-a456-42661417400073462",
  "form_data": [
    {
      "questionId": "AI-Q2",
      "question": "What type of AI is used?",
      "answer": ["Supervised Learning"]
    },
    {
      "questionId": "AI-Q3",
      "question": "Data sources",
      "answer": ["Customer Database", "Sales Records"]
    }
  ]
}
```

### 4.4 Response Schema

```json
{
  "question_id": "string",
  "original_text": "string",
  "reviewed_text": "string",
  "rationale": "string",
  "interaction_id": "uuid (optional)"
}
```

### 4.5 Success Response Example

```json
{
  "question_id": "AI-Q1",
  "original_text": "We use machine learning for predictions",
  "reviewed_text": "Our AI system employs supervised machine learning algorithms to generate predictive insights from historical customer and sales data. The model utilizes features extracted from the Customer Database and Sales Records to forecast business outcomes with high accuracy.",
  "rationale": "Enhanced the answer by: 1) Specifying the ML type (supervised learning) based on form context, 2) Added details about data sources mentioned in related questions, 3) Clarified the prediction capability with technical accuracy, 4) Improved professional tone and completeness",
  "interaction_id": "456e7890-e89b-12d3-a456-426614174111"
}
```

### 4.6 Error Response Examples

**Validation Error (400)**

```json
{
  "error": "Validation Error",
  "message": "question_id must be a non-empty string",
  "status_code": 400
}
```

**Not Found Error (404)**

```json
{
  "error": "Not Found",
  "message": "Question with ID 'AI-Q99' not found",
  "status_code": 404
}
```

**Gateway Timeout (504)**

```json
{
  "error": "Gateway Timeout",
  "message": "Text enhancement timed out for question_id=AI-Q1",
  "status_code": 504
}
```

**Internal Server Error (500)**

```json
{
  "error": "Internal Server Error",
  "message": "Enhancement failed: LLM response parsing error",
  "status_code": 500
}
```

---

# Score Feature Technical Documentation

## Description

Calculate a weighted mean confidence score for the entire submission.

This considers fields with AI features enabled.

## Request

- `submission_id`
- `lambda_strict`
- `missing_policy`
- `form_data`
- `form_type`

## Responses

- `submission_id`
- `total_score`

## Front End

- ‘Confidence Score’ button on XX submission page.

## Back End DB

- `sage_ai_question_scoring_config`
- `sage_ai_suggestion_coverage_score`

## Response Payload

- 200 OK
- 400 Bad Request
- 500 Server Error

## AI API link

[https://lilly-sage-ai.dev.bu.lilly.com/api/docs#/Confidence Score/score_form_api_score_scoring_post](https://lilly-sage-ai.dev.bu.lilly.com/api/docs#/Confidence%20Score/score_form_api_score_scoring_post)

## Github script

Links to:

- `routes/score.py`
- `serializer/score.py`
- `service/scoring_service.py`

## Reference

[https://lilly-confluence.atlassian.net/wiki/x/xwIcnQ](https://lilly-confluence.atlassian.net/wiki/x/xwIcnQ)

## Developers

- Aaran
- Qi
- Ajay
- Parag

## Approval

- Kuntal
- Manoj
