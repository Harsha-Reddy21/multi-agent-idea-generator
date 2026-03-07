# SAGE AI Frontend - API Documentation

> **Last Updated:** December 16, 2025  
> **Base URL:** `/api` (Proxied to backend via Vite)  
> **Backend URL:** `http://localhost:8080` (Development)  
> **Production URL:** `https://lilly-sage-ai.dev.bu.lilly.com/api`  
> **Timeout:** 300,000ms (5 minutes / 300 seconds)

This document provides comprehensive documentation for all API services used in the SAGE AI Frontend application.

## API Configuration

All API services extend the `BaseApiService` class which configures:

- **Base URL Pattern:** `/api/{endpoint}`
- **Headers:** `Content-Type: application/json` (default)
- **Timeout:** 300 seconds to prevent browser timeout
- **Proxy:** Development server proxies `/api/*` requests to `http://localhost:8080`

---

## Table of Contents

1. [Base API Service](#base-api-service)
2. [User API](#user-api)
3. [Forms API](#forms-api)
4. [Upload API](#upload-api)
5. [Dashboard API](#dashboard-api)
6. [Form Dashboard API](#form-dashboard-api)
7. [Cortex API](#cortex-api)
8. [Enhance Answer API](#enhance-answer-api)
9. [Review Answer API](#review-answer-api)
10. [Suggestions API](#suggestions-api)
11. [Novelty Score API](#novelty-score-api)
12. [Score API](#score-api)
13. [User Feedback API](#user-feedback-api)
14. [ServiceNow API](#servicenow-api)

---

## Base API Service

**File:** `src/core/api/base.api.ts`

The `BaseApiService` is an abstract base class that provides common HTTP methods and error handling for all API services.

### Features

- **Axios Integration**: Built on top of Axios for HTTP requests
- **Centralized Error Handling**: Consistent error formatting across all APIs
- **Request/Response Interceptors**: Automatically processes requests and responses
- **Type Safety**: Full TypeScript support with generics

### HTTP Methods

#### GET Request

```typescript
protected async get<T>(url?: string, config?: AxiosRequestConfig): Promise<T>
```

#### POST Request

```typescript
protected async post<T, D = unknown>(data: D, url?: string, config?: AxiosRequestConfig): Promise<T>
```

#### PUT Request

```typescript
protected async put<T, D = unknown>(data: D, url?: string, config?: AxiosRequestConfig): Promise<T>
```

#### PATCH Request

```typescript
protected async patch<T, D = unknown>(data: D, url?: string, config?: AxiosRequestConfig): Promise<T>
```

#### DELETE Request

```typescript
protected async delete<T>(url?: string, config?: AxiosRequestConfig): Promise<T>
```

### Error Handling

All errors are formatted as `ApiError` with the following structure:

```typescript
interface ApiError {
  status?: number
  message: string
  data?: unknown
  isAxiosError: boolean
  original: unknown
}
```

---

## User API

**File:** `src/core/api/user.api.ts`  
**Base Endpoint:** `/api/users`

Handles user profile and authentication-related operations.

### Methods

#### Get User Info

Retrieves the current user's profile information.

**Endpoint:** `GET /api/users/user_info`

```typescript
async getUserInfo(): Promise<UserProfile>
```

**Response:**

```typescript
interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  anyIdeasSubmitted: string
  department: string
  title: string
}
```

**Example:**

```typescript
import { userApi } from '@/core/api/user.api'

const fetchUserProfile = async () => {
  try {
    const profile = await userApi.getUserInfo()
    console.log('User:', profile.name)
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  }
}
```

---

## Forms API

**File:** `src/core/api/forms.api.ts`  
**Base Endpoint:** `/api/forms`

Manages form schemas, form data retrieval, submission, and related operations.

### Methods

#### Get Form Schema

Retrieves the JSON schema for a specific form type.

**Method:** `async getFormSchema(formSchema: ExtendedFormDashboardFormType, delay?: number): Promise<FormSchemaResponse>`

**Parameters:**

- `formSchema`: Form type (AiRegistryForm, BeginSubmissionForm, IdeaSubForm, etc.)
- `delay`: Optional delay in milliseconds (default: 0)

**Response:**

```typescript
interface FormSchemaResponse {
  schema: JSONSchema7
  uiSchema: UiSchema
  tabSchema: TabSchema[]
}
```

**Supported Form Types:**

- `AiRegistryForm` - AI Registry submission form
- `BeginSubmissionForm` - Initial submission form with file upload
- `IdeaSubForm` - Idea submission form
- `SecurityArchForm` - Security & Engineering Architecture form
- `DloForm` - Digital Legal Office form
- `GcoRiskRegistryForm` - GCO Digital Risk Registry form
- `WwtpForm` - Working With Third Party form
- `WnvVendorEngagementForm` - WNV Vendor Engagement form

**Example:**

```typescript
import { formsApi } from '@/core/api/forms.api'
import { ExtendedFormDashboardFormType } from '@/core/constants'

const loadFormSchema = async () => {
  try {
    const schema = await formsApi.getFormSchema(
      ExtendedFormDashboardFormType.BeginSubmissionForm
    )
    console.log('Schema loaded:', schema.tabSchema)
  } catch (error) {
    console.error('Failed to load schema:', error)
  }
}
```

---

#### Get Form Data

Retrieves existing form data for a specific form schema.

**Endpoint:** `GET /api/forms?form_schema_id={formSchemaId}`

```typescript
async getFormData(formSchemaId: string): Promise<FormResponsePayload>
```

**Parameters:**

- `formSchemaId`: Unique identifier for the form schema

**Response:**

```typescript
interface FormResponsePayload {
  form_data: string // JSON stringified form data
  // ... other properties
}
```

**Example:**

```typescript
const loadFormData = async (schemaId: string) => {
  try {
    const data = await formsApi.getFormData(schemaId)
    const parsedData = JSON.parse(data.form_data)
    console.log('Form data:', parsedData)
  } catch (error) {
    console.error('Failed to load form data:', error)
  }
}
```

---

#### Submit Form Data (Legacy)

Submits form data (legacy endpoint - will be deprecated).

**Endpoint:** `POST /api/forms`

```typescript
async submitFormData(payload: FormRequestPayload): Promise<FormResponsePayload>
```

**Example:**

```typescript
const saveForm = async (formData: FormRequestPayload) => {
  try {
    const response = await formsApi.submitFormData(formData)
    console.log('Form saved:', response)
  } catch (error) {
    console.error('Failed to save form:', error)
  }
}
```

---

#### Get Form Details

Retrieves detailed information about a specific form.

**Endpoint:** `GET /api/forms/get-form-details?form-id={formId}&submission-id={submissionId}`

```typescript
async getFormDetails(formId: string, submissionId: string): Promise<FormDetailsResponse>
```

**Parameters:**

- `formId`: Form identifier
- `submissionId`: Submission identifier

**Example:**

```typescript
const fetchFormDetails = async (formId: string, submissionId: string) => {
  try {
    const details = await formsApi.getFormDetails(formId, submissionId)
    console.log('Form details:', details)
  } catch (error) {
    console.error('Failed to fetch form details:', error)
  }
}
```

---

#### Submit Form

Submits a complete form with optional file attachments.

**Endpoint:** `PUT /api/forms/submit-form?form-id={formId}&submission-id={submissionId}`  
**Content-Type:** `multipart/form-data`

```typescript
async submitForm(
  formId: string,
  submissionId: string,
  payload: FormSubmitRequest,
  files?: File[]
): Promise<FormSubmitResponse>
```

**Parameters:**

- `formId`: Form identifier
- `submissionId`: Submission identifier
- `payload`: Form submission data
  ```typescript
  interface FormSubmitRequest {
    form_data: Record<string, unknown>
    action: string
  }
  ```
- `files`: Optional array of File objects

**Response:**

```typescript
interface FormSubmitResponse {
  success: boolean
  message: string
  data?: unknown
}
```

**Example:**

```typescript
const submitCompleteForm = async (
  formId: string,
  submissionId: string,
  formData: Record<string, unknown>,
  files: File[]
) => {
  try {
    const response = await formsApi.submitForm(
      formId,
      submissionId,
      { form_data: formData, action: 'submit' },
      files
    )
    console.log('Form submitted:', response.message)
  } catch (error) {
    console.error('Form submission failed:', error)
  }
}
```

---

#### Get Review Answer

Retrieves AI-generated review/validation for form answers.

**Endpoint:** `POST /api/forms/review-answers`

```typescript
async getReviewAnswer(request: GetReviewAnswerRequest): Promise<GetReviewAnswerResponse>
```

**Request:**

```typescript
interface GetReviewAnswerRequest {
  question_id: string
  user_text: string
  submission_id?: string
  form_id?: string
}
```

**Response:**

```typescript
interface GetReviewAnswerResponse {
  review: string
  suggestions?: string[]
  score?: number
}
```

**Example:**

```typescript
const reviewUserAnswer = async (questionId: string, userText: string) => {
  try {
    const review = await formsApi.getReviewAnswer({
      question_id: questionId,
      user_text: userText,
    })
    console.log('AI Review:', review.review)
  } catch (error) {
    console.error('Review failed:', error)
  }
}
```

---

#### Get Common Fields

Auto-populates common fields across forms.

**Endpoint:** `POST /api/forms/auto-populate/common-fields`

```typescript
async getCommonFields(payload: CommonFieldRequestModal): Promise<CommonFieldResponseModal>
```

**Example:**

```typescript
const autoPopulateFields = async (payload: CommonFieldRequestModal) => {
  try {
    const commonFields = await formsApi.getCommonFields(payload)
    console.log('Common fields:', commonFields)
  } catch (error) {
    console.error('Auto-populate failed:', error)
  }
}
```

---

## Upload API

**File:** `src/core/api/upload.api.ts`  
**Base Endpoint:** `/api/forms`

Handles file upload and validation operations.

### Methods

#### Initial Submission Begin

Initiates a new submission with file uploads.

**Endpoint:** `POST /api/forms/submit-idea`  
**Content-Type:** `multipart/form-data`

```typescript
async initialSubmissionBegin(formData: BeginFormRequestModel): Promise<BeginFormResponseModel>
```

**Request:**

```typescript
interface BeginFormRequestModel {
  submission_journey: Record<string, unknown>
  files: File[]
}
```

**Response:**

```typescript
interface BeginFormResponseModel {
  message: string
  data: {
    id: string // Submission ID
    categoryId: string // Category ID for the submission
  }
}
```

**File Upload Configuration:**

- **Max Total Size:** 10MB (configurable)
- **Allowed Types:** PDF, DOC, DOCX, PPT, PPTX
- **Validation:** Automatic file type and size validation
- **Storage:** Files uploaded to backend storage

**Example:**

```typescript
import { uploadService } from '@/core/api/upload.api'

const startSubmission = async (
  journeyData: Record<string, unknown>,
  files: File[]
) => {
  try {
    const response = await uploadService.initialSubmissionBegin({
      submission_journey: journeyData,
      files: files,
    })
    console.log('Submission ID:', response.data.id)
    console.log('Category ID:', response.data.categoryId)
  } catch (error) {
    console.error('Submission failed:', error)
  }
}
```

---

#### Validate Multiple Files

Validates multiple files for size and type constraints.

```typescript
validateMultipleFiles(
  files: File[],
  maxTotalSizeInMB?: number    // default: 10
): { valid: boolean; errors: { error: string }[] }
```

**Allowed File Types:**

- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- `application/vnd.ms-powerpoint`
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)

**Validation Rules:**

1. Total size of all files must not exceed `maxTotalSizeInMB` (default: 10MB)
2. File type must be in the allowed types list

**Example:**

```typescript
import { uploadService } from '@/core/api/upload.api'

const validateFiles = (files: File[]) => {
  const validation = uploadService.validateMultipleFiles(files, 10)

  if (!validation.valid) {
    validation.errors.forEach(error => {
      console.error('Validation error:', error.error)
    })
    return false
  }

  console.log('All files are valid!')
  return true
}

// Usage example
const files = [
  new File(['content'], 'document.pdf', { type: 'application/pdf' }),
  new File(['slides'], 'presentation.pptx', {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  }),
]

validateFiles(files)
```

**Error Examples:**

```typescript
// File too large
{
  valid: false,
  errors: [
    { error: 'File "large-doc.pdf" exceeds 5MB limit (7.25MB)' }
  ]
}

// Invalid file type
{
  valid: false,
  errors: [
    { error: 'File type image/jpeg is not allowed' }
  ]
}

// Total size exceeded
{
  valid: false,
  errors: [
    { error: 'Total file size exceeds 10MB limit (12.50MB)' }
  ]
}
```

---

## Dashboard API

**File:** `src/core/api/dashboard.api.ts`  
**Base Endpoint:** `/api/get-user-submissions`

Manages user submissions and their statuses.

### Methods

#### Get User Submissions

Retrieves all submissions for the current user.

**Endpoint:** `GET /api/get-user-submissions`

```typescript
async getUserSubmissions(): Promise<UserIdeaSubmissionsResponse>
```

**Response:**

```typescript
interface UserIdeaSubmissionsResponse {
  message: string
  data: UserIdeaSubmission[]
}

interface UserIdeaSubmission {
  id: string // Submission ID
  category_id: string // Category ID
  category_name: string // Category name
  status: 'submitted' | 'completed' // Submission status
  submitted_at: string // ISO date string
  title: string // Submission title
  ai_registry_form_status: string // Form status
  ai_registry_update_form_id: string | null
}
```

**Example:**

```typescript
import { dashboardApi } from '@/core/api/dashboard.api'

const loadUserSubmissions = async () => {
  try {
    const response = await dashboardApi.getUserSubmissions()
    console.log(response.message)
    console.log(`Total submissions: ${response.data.length}`)
    response.data.forEach(sub => {
      console.log(`${sub.title} (${sub.id}): ${sub.status}`)
      console.log(`  Category: ${sub.category_name}`)
      console.log(`  Submitted: ${sub.submitted_at}`)
    })
  } catch (error) {
    console.error('Failed to load submissions:', error)
  }
}
```

---

#### Get Submission Status

Retrieves the current status of a specific submission.

**Endpoint:** `GET /api/submission-status?submission-id={submissionId}`

```typescript
async getSubmissionStatus(submissionId: string): Promise<SubmissionStatusResponse>
```

**Response:**

```typescript
interface SubmissionStatusResponse {
  submission_id: string
  status: ExtractionStatus // 'idle' | 'loading' | 'success' | 'error'
  message: string
  created_at: string // ISO date string
  updated_at: string // ISO date string
}

enum ExtractionStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
```

**Example:**

```typescript
const checkSubmissionStatus = async (submissionId: string) => {
  try {
    const status = await dashboardApi.getSubmissionStatus(submissionId)
    console.log('Status:', status.status)
    console.log('Last updated:', status.updated_at)
  } catch (error) {
    console.error('Failed to fetch status:', error)
  }
}
```

---

## Form Dashboard API

**File:** `src/core/api/form-dashboard.api.ts`  
**Base Endpoint:** `/api/form-dashboard`

Retrieves form dashboard information for submissions.

### Methods

#### Get Form Dashboard

Retrieves form dashboard data for a specific submission.

**Endpoint:** `GET /api/form-dashboard?submission-id={submissionId}`

```typescript
async getFormDashboard(submissionId: string): Promise<FormDashboardListResponse>
```

**Response:**

```typescript
interface FormDashboardListResponse {
  forms: FormDashboardItem[]
  submission_id: string
}
```

**Example:**

```typescript
import { formDashboardApi } from '@/core/api/form-dashboard.api'

const loadFormDashboard = async (submissionId: string) => {
  try {
    const dashboard = await formDashboardApi.getFormDashboard(submissionId)
    console.log('Forms for submission:', dashboard.forms)
  } catch (error) {
    console.error('Failed to load form dashboard:', error)
  }
}
```

---

## Cortex API

**File:** `src/core/api/cortex.api.ts`  
**Base Endpoint:** `/api/cortex`

Interacts with the Cortex service for document extraction.

### Methods

#### Get Document Extracts

Retrieves AI-extracted data from uploaded documents.

**Endpoint:** `GET /api/cortex/get-doc-extracts?submission-id={submissionId}&form-id={formId}&question-id={questionId}`

```typescript
async getDocExtracts(
  submissionId: string,
  formId: string,
  questionId: string
): Promise<GetDocExtractsResponse>
```

**Request:**

```typescript
interface GetDocExtractsRequest {
  submissionId: string
  formId: string
  questionId: string
}
```

**Response:**

```typescript
interface GetDocExtractsResponse {
  question_id: string
  extracted_content: ExtractedContent | null
  submission_id: string
  form_id: string
  created_at: string
  updated_at: string
  interaction_id: string | null
}

interface ExtractedContent {
  confidence: number // Confidence score (0-1)
  provenance: Provenance[] // Source references
  answer_text: string // Extracted answer
}

interface Provenance {
  text: string // Extracted text snippet
  span_id: number // Span identifier
  char_end: number // End character position
  file_name: string // Source file name
  block_type: string // Block type (paragraph, table, etc.)
  char_start: number // Start character position
  block_index: number // Block index in document
  page_or_slide: number // Page/slide number
  answer: string // Answer text
  question: string // Original question
}
```

**Example:**

```typescript
import { cortexApiService } from '@/core/api/cortex.api'

const fetchDocumentExtracts = async (
  submissionId: string,
  formId: string,
  questionId: string
) => {
  try {
    const extracts = await cortexApiService.getDocExtracts(
      submissionId,
      formId,
      questionId
    )

    if (extracts.extracted_content) {
      console.log('Answer:', extracts.extracted_content.answer_text)
      console.log('Confidence:', extracts.extracted_content.confidence)

      console.log('\nSources:')
      extracts.extracted_content.provenance.forEach(prov => {
        console.log(`- ${prov.file_name} (Page ${prov.page_or_slide})`)
        console.log(`  "${prov.text}"`)
      })
    }
  } catch (error) {
    console.error('Failed to fetch extracts:', error)
  }
}
```

---

## Enhance Answer API

**File:** `src/core/api/enhance-answer.api.ts`  
**Base Endpoint:** `/api/enhance-answer`

Provides AI-powered answer enhancement capabilities.

### Methods

#### Enhance Answer

Enhances user-provided answers using AI.

**Endpoint:** `POST /api/enhance-answer`

```typescript
async enhanceAnswer(
  answerText: string,
  questionId: string,
  submissionId?: string,
  formData?: Record<string, unknown>,
  formId?: string
): Promise<EnhanceAnswerResponse>
```

**Request:**

```typescript
interface EnhanceAnswerRequest {
  question_id: string // Question identifier
  user_text: string // Original user text
  submission_id?: string | null // Optional submission ID
  form_id?: string | null // Optional form ID
  form_data?: Record<string, unknown> | null // Optional form context
}
```

**Response:**

```typescript
interface EnhanceAnswerResponse {
  question_id: string // Question identifier
  original_text: string // Original user text
  reviewed_text: string | object // Enhanced/reviewed text
  rationale?: string // Explanation for changes
  interaction_id?: string | null // Interaction tracking ID
}
```

**Example:**

```typescript
import { enhanceAnswerApi } from '@/core/api/enhance-answer.api'

const enhanceUserAnswer = async (
  questionId: string,
  userText: string,
  submissionId?: string
) => {
  try {
    const enhanced = await enhanceAnswerApi.enhanceAnswer(
      userText,
      questionId,
      submissionId
    )

    console.log('Original:', userText)
    console.log('Enhanced:', enhanced.enhanced_text)
    console.log('Confidence:', enhanced.confidence_score)
  } catch (error) {
    console.error('Enhancement failed:', error)
  }
}

// Usage
enhanceUserAnswer('Q-123', 'This is my initial answer', 'submission-456')
```

---

## Review Answer API

**File:** `src/core/api/review-answer.api.ts`  
**Base Endpoint:** `/api/review-answers`

Provides AI-powered answer review and validation.

### Methods

#### Get Review Answer

Reviews and validates user answers.

**Endpoint:** `POST /api/review-answers`

```typescript
async getReviewAnswer(request: GetReviewAnswerRequest): Promise<GetReviewAnswerResponse>
```

**Request:**

```typescript
interface GetReviewAnswerRequest {
  question_id: string
  user_text: string
  submission_id?: string
  form_id?: string
}
```

**Response:**

```typescript
interface GetReviewAnswerResponse {
  review: string
  suggestions?: string[]
  score?: number
  areas_of_improvement?: string[]
}
```

**Example:**

```typescript
import { reviewAnswerApiService } from '@/core/api/review-answer.api'

const reviewAnswer = async (questionId: string, userText: string) => {
  try {
    const review = await reviewAnswerApiService.getReviewAnswer({
      question_id: questionId,
      user_text: userText,
    })

    console.log('Review:', review.review)
    console.log('Score:', review.score)

    if (review.suggestions) {
      console.log('Suggestions:')
      review.suggestions.forEach(suggestion => {
        console.log(`- ${suggestion}`)
      })
    }
  } catch (error) {
    console.error('Review failed:', error)
  }
}
```

---

## Suggestions API

**File:** `src/core/api/suggestions.api.ts`  
**Base Endpoint:** `/api`

Provides AI-generated suggestions for form completion.

### Methods

#### Get Suggestions

Retrieves suggestions for a specific form type.

**Endpoint:** `GET /api/suggestions?form_type={formType}`

```typescript
async getSuggestions(formType: string): Promise<SuggestionsResponse>
```

**Response:**

```typescript
interface SuggestionsResponse {
  suggestions: Suggestion[]
  coverage?: number
}

interface Suggestion {
  id: string
  text: string
  category?: string
  relevance_score?: number
}
```

**Example:**

```typescript
import { suggestionsApiService } from '@/core/api/suggestions.api'

const loadSuggestions = async (formType: string) => {
  try {
    const data = await suggestionsApiService.getSuggestions(formType)

    console.log(`Coverage: ${data.coverage}%`)
    data.suggestions.forEach(suggestion => {
      console.log(`- ${suggestion.text} (score: ${suggestion.relevance_score})`)
    })
  } catch (error) {
    console.error('Failed to load suggestions:', error)
  }
}

// Usage
loadSuggestions('idea-submission')
```

---

#### Check Suggestions Coverage

Checks how well user input aligns with available suggestions.

**Endpoint:** `POST /api/check-suggestions-coverage`

```typescript
async checkSuggestionsCoverage(
  requestBody: SuggestionCoverageRequestBody
): Promise<SuggestionCoverageResponseBody>
```

**Request:**

```typescript
interface SuggestionCoverageRequestBody {
  question_id: string
  user_text: string
}
```

**Response:**

```typescript
interface SuggestionCoverageResponseBody {
  coverage_percentage: number
  matched_suggestions: string[]
  unmatched_areas: string[]
}
```

**Example:**

```typescript
const checkCoverage = async (questionId: string, userText: string) => {
  try {
    const coverage = await suggestionsApiService.checkSuggestionsCoverage({
      question_id: questionId,
      user_text: userText,
    })

    console.log(`Coverage: ${coverage.coverage_percentage}%`)
    console.log('Matched suggestions:', coverage.matched_suggestions)
    console.log('Areas to improve:', coverage.unmatched_areas)
  } catch (error) {
    console.error('Coverage check failed:', error)
  }
}
```

---

## Novelty Score API

**File:** `src/core/api/novelty-score.api.ts`  
**Base Endpoint:** `/api/faiss`

Calculates novelty scores using FAISS (Facebook AI Similarity Search).

### Methods

#### Get Novelty Score

Calculates how novel/unique an idea is compared to existing submissions.

**Endpoint:** `POST /api/faiss/search`

```typescript
async getNoveltyScore(request: GetNoveltyScoreRequest): Promise<GetNoveltyScoreResponse>
```

**Request:**

```typescript
interface GetNoveltyScoreRequest {
  text: string
  submission_id?: string
  top_k?: number // Number of similar results to return
}
```

**Response:**

```typescript
interface GetNoveltyScoreResponse {
  novelty_score: number // 0-100, higher = more novel
  similar_submissions: SimilarSubmission[]
}

interface SimilarSubmission {
  id: string
  title: string
  similarity_score: number
  snippet?: string
}
```

**Example:**

```typescript
import { noveltyScoreApiService } from '@/core/api/novelty-score.api'

const calculateNovelty = async (ideaDescription: string) => {
  try {
    const result = await noveltyScoreApiService.getNoveltyScore({
      text: ideaDescription,
      top_k: 5,
    })

    console.log(`Novelty Score: ${result.novelty_score}/100`)

    if (result.similar_submissions.length > 0) {
      console.log('Similar existing submissions:')
      result.similar_submissions.forEach(sub => {
        console.log(`- ${sub.title} (${sub.similarity_score}% similar)`)
      })
    } else {
      console.log('No similar submissions found - this idea is highly novel!')
    }
  } catch (error) {
    console.error('Novelty calculation failed:', error)
  }
}
```

---

## Score API

**File:** `src/core/api/score.api.ts`  
**Base Endpoint:** `/api/score`

Calculates scoring metrics for submissions.

### Methods

#### Calculate Score

Calculates various scoring metrics for a submission.

**Endpoint:** `POST /api/score/scoring`

```typescript
async calculateScore(requestBody: ScoreRequestBody): Promise<ScoreResponseBody>
```

**Request:**

```typescript
interface ScoreRequestBody {
  submission_id: string
  form_data?: Record<string, unknown>
  criteria?: string[]
}
```

**Response:**

```typescript
interface ScoreResponseBody {
  total_score: number
  breakdown: ScoreBreakdown
}

interface ScoreBreakdown {
  innovation?: number
  feasibility?: number
  impact?: number
  clarity?: number
}
```

**Example:**

```typescript
import { scoreApiService } from '@/core/api/score.api'

const calculateSubmissionScore = async (submissionId: string) => {
  try {
    const scores = await scoreApiService.calculateScore({
      submission_id: submissionId,
      criteria: ['innovation', 'feasibility', 'impact', 'clarity'],
    })

    console.log(`Total Score: ${scores.total_score}/100`)
    console.log('Breakdown:')
    console.log(`- Innovation: ${scores.breakdown.innovation}`)
    console.log(`- Feasibility: ${scores.breakdown.feasibility}`)
    console.log(`- Impact: ${scores.breakdown.impact}`)
    console.log(`- Clarity: ${scores.breakdown.clarity}`)
  } catch (error) {
    console.error('Score calculation failed:', error)
  }
}
```

---

## User Feedback API

**File:** `src/core/api/user-feedback.api.ts`  
**Base Endpoint:** `/api/ai-feedback`

Manages user feedback for AI-generated features.

### Methods

#### Submit Feedback

Submits user feedback for AI interactions.

**Endpoint:** `POST /api/ai-feedback`

```typescript
async submitFeedback(payload: CreateAIFeedbackRequest): Promise<CreateAIFeedbackResponse>
```

**Request:**

```typescript
interface CreateAIFeedbackRequest {
  feedback_type: 'like' | 'dislike'
  feedback_tags?: string[] | null
  is_accepted?: boolean
  interaction_id?: string | null
  user_comment?: string | null
}
```

**Response:**

```typescript
interface CreateAIFeedbackResponse {
  interaction: AIInteractionResponse
  feedback: AIFeedbackResponse
}

interface AIInteractionResponse {
  id: string
  submission_id: string
  question_id: string
  user_input?: string | null
  ai_feature_type: 'suggestions' | 'enhance_answer' | 'data_extracts'
  ai_generated_content: Record<string, unknown>
  created_at: string
}

interface AIFeedbackResponse {
  id: string
  interaction_id: string
  form_id: string
  feedback_type: 'like' | 'dislike'
  feedback_tags?: string[] | null
  user_comment?: string | null
  rating?: number | null
  created_at: string
  updated_at: string
}
```

**Example:**

```typescript
import { userFeedbackApi } from '@/core/api/user-feedback.api'

// Positive feedback
const submitPositiveFeedback = async (interactionId: string) => {
  try {
    const response = await userFeedbackApi.submitFeedback({
      feedback_type: 'like',
      interaction_id: interactionId,
      is_accepted: true,
      user_comment: 'This suggestion was very helpful!',
    })

    console.log('Feedback submitted:', response.feedback.id)
  } catch (error) {
    console.error('Failed to submit feedback:', error)
  }
}

// Negative feedback with tags
const submitNegativeFeedback = async (interactionId: string) => {
  try {
    const response = await userFeedbackApi.submitFeedback({
      feedback_type: 'dislike',
      interaction_id: interactionId,
      feedback_tags: ['inaccurate', 'not-relevant'],
      is_accepted: false,
      user_comment: 'The suggestion did not match my context.',
    })

    console.log('Feedback submitted:', response.feedback.id)
  } catch (error) {
    console.error('Failed to submit feedback:', error)
  }
}
```

**Common Feedback Tags:**

- `helpful`
- `accurate`
- `relevant`
- `inaccurate`
- `not-relevant`
- `too-generic`
- `confusing`
- `incomplete`

---

## ServiceNow API

**File:** `src/core/api/service-now.api.ts`  
**Base Endpoint:** `/api/service-now`

Integrates with ServiceNow for approved ideas dashboard.

### Methods

#### Get Approved Ideas Dashboard

Retrieves dashboard data for approved ideas from ServiceNow.

**Endpoint:** `GET /api/service-now/approved-ideas-dashboard?days={days}&limit={limit}`

```typescript
async getApprovedIdeasDashboard(
  days?: number,  // default: 30
  limit?: number  // default: 2
): Promise<DashboardLatestIdeasResponse>
```

**Parameters:**

- `days`: Number of days to look back for approved ideas (default: 30)
- `limit`: Maximum number of top ideas to return (default: 2)

**Response:**

```typescript
interface DashboardLatestIdeasResponse {
  approved_count: number
  top_ideas: ApprovedIdea[]
  period_days: number
}

interface ApprovedIdea {
  id: string
  title: string
  description: string
  approved_date: string
  impact_score?: number
}
```

**Example:**

```typescript
import { serviceNowApi } from '@/core/api/service-now.api'

// Get approved ideas from last 30 days, top 2
const loadApprovedIdeas = async () => {
  try {
    const dashboard = await serviceNowApi.getApprovedIdeasDashboard()

    console.log(
      `Total approved in last ${dashboard.period_days} days: ${dashboard.approved_count}`
    )
    console.log('\nTop Ideas:')

    dashboard.top_ideas.forEach((idea, index) => {
      console.log(`${index + 1}. ${idea.title}`)
      console.log(`   Approved: ${idea.approved_date}`)
      console.log(`   Impact: ${idea.impact_score}`)
    })
  } catch (error) {
    console.error('Failed to load approved ideas:', error)
  }
}

// Get approved ideas from last 60 days, top 5
const loadExtendedDashboard = async () => {
  try {
    const dashboard = await serviceNowApi.getApprovedIdeasDashboard(60, 5)
    console.log('Extended dashboard data:', dashboard)
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
}
```

---

## Common Patterns & Best Practices

### Error Handling

All API calls should be wrapped in try-catch blocks:

```typescript
try {
  const result = await apiService.someMethod(params)
  // Handle success
} catch (error) {
  if (error.isAxiosError) {
    console.error(`API Error [${error.status}]:`, error.message)
    // Handle specific error codes
    if (error.status === 404) {
      // Handle not found
    } else if (error.status === 401) {
      // Handle unauthorized
    }
  } else {
    console.error('Unexpected error:', error)
  }
}
```

### Loading States

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  setLoading(true)
  setError(null)

  try {
    const result = await apiService.getData()
    // Process result
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

### File Upload Progress

```typescript
const uploadWithProgress = async (files: File[]) => {
  try {
    const validation = uploadService.validateMultipleFiles(files)

    if (!validation.valid) {
      // Show validation errors
      validation.errors.forEach(error => {
        showToast(error.error, 'error')
      })
      return
    }

    // Proceed with upload
    const response = await uploadService.initialSubmissionBegin({
      submission_journey: formData,
      files: files,
    })

    showToast('Upload successful!', 'success')
  } catch (error) {
    showToast('Upload failed', 'error')
  }
}
```

### Type Safety

Always use TypeScript interfaces for type safety:

```typescript
import { FormsApi } from '@/core/api/forms.api'
import { FormSchemaResponse } from '@/core/models/form.model'

const schema: FormSchemaResponse = await formsApi.getFormSchema(formType)
```

---

## Environment Configuration

The base URL is currently hardcoded but should be moved to environment variables:

```typescript
// Current (in base.api.ts)
const url = baseURL || 'https://lilly-sage-ai.dev.bu.lilly.com'

// Recommended
const url = baseURL || import.meta.env.VITE_LILY_BACKEND_URL
```

**Environment Variables:**

```env
# .env.development
VITE_LILY_BACKEND_URL=https://lilly-sage-ai.dev.bu.lilly.com

# .env.production
VITE_LILY_BACKEND_URL=https://lilly-sage-ai.bu.lilly.com
```

---

## API Testing

All API services have corresponding test files (`*.api.test.ts`) using Vitest:

```typescript
// Example test structure
describe('FormApi', () => {
  it('should fetch form schema', async () => {
    const schema = await formsApi.getFormSchema(
      ExtendedFormDashboardFormType.BeginSubmissionForm
    )
    expect(schema).toBeDefined()
    expect(schema.schema).toBeDefined()
    expect(schema.uiSchema).toBeDefined()
  })
})
```

Run tests:

```bash
npm test
# or
npm run test:coverage
```

---

## Migration Notes

### Deprecated Endpoints

The following methods are marked for deprecation:

1. **`formsApi.getFormData()`** - Use `formsApi.getFormDetails()` instead
2. **`formsApi.submitFormData()`** - Use `formsApi.submitForm()` instead

### New API Pattern

New forms should use the updated API pattern:

```typescript
// Old pattern (deprecated)
const data = await formsApi.getFormData(formSchemaId)
await formsApi.submitFormData(payload)

// New pattern
const details = await formsApi.getFormDetails(formId, submissionId)
await formsApi.submitForm(formId, submissionId, payload, files)
```

---

## API Response Codes

| Status Code | Meaning      | Action                        |
| ----------- | ------------ | ----------------------------- |
| 200         | Success      | Process response data         |
| 201         | Created      | Resource created successfully |
| 400         | Bad Request  | Validate input data           |
| 401         | Unauthorized | Redirect to login             |
| 403         | Forbidden    | Show permission error         |
| 404         | Not Found    | Show not found message        |
| 500         | Server Error | Show error message, retry     |

---

## Support & Troubleshooting

### Common Issues

1. **Timeout Errors**: The default timeout is 5 minutes (300 seconds). For long-running operations, this is appropriate.

2. **CORS Errors**: Ensure the backend has proper CORS configuration.

3. **File Upload Failures**: Check file size and type constraints using `validateMultipleFiles()` before upload.

4. **Authentication Issues**: Verify user session and tokens are valid.

### Debug Mode

Enable axios debugging:

```typescript
this.api.interceptors.request.use(config => {
  console.log('Request:', config)
  return config
})
```

---

## Version History

| Version | Date       | Changes                   |
| ------- | ---------- | ------------------------- |
| 1.0.0   | 2024-12-05 | Initial API documentation |

---

**End of Documentation**
