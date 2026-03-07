import { FormDashboardFormType } from '../constants'
import { FormCompletionStatus } from './form-completion-status.enum'

// Legacy models (keeping for backward compatibility during migration)
export enum FormStatus {
  Submitted = FormCompletionStatus.COMPLETED,
  pending = FormCompletionStatus.PENDING,
  InProgress = FormCompletionStatus.IN_PROGRESS,
}

export interface FormQuestion {
  questionId: string
  question: string
  answer: string[]
  ai_meta_data?: string | null
  type: string
}

export interface FormDataWrapper {
  form_data: FormQuestion[]
}

export interface FormSubmitRequest {
  action: 'save' | 'submit'
  form_data: FormDataWrapper
}

export interface FormSummary {
  id: string
  submission_id: string
  status: string
}

export interface FormSubmitResponse {
  message: string
  data: FormSummary
}

export interface FormSerializer {
  files: Record<string, string[]>
  id: string
  submission_id: string
  form_schema_id: string
  form_type: string
  form_data: FormDataWrapper
  status: string
  submitted_at?: string
  final_score?: number | null
}

export interface FormDetailsResponse {
  message: string
  data: FormSerializer
}

// Legacy models (keeping for backward compatibility during migration)
export interface FormRequestPayload {
  form_schema_id: string
  form_data: string
  description?: string
  status: FormStatus
}
// Legacy models (keeping for backward compatibility during migration)
export interface FormResponsePayload extends FormRequestPayload {
  category_id?: string
  title?: string
  form_type?: string
  is_submit?: boolean
  ai_metadata?: string
}

export interface FormSchemaResponse {
  schema: Record<string, unknown>
  uiSchema: Record<string, unknown>
  tabSchema: Array<{
    id: number
    title: string
    fields: string[]
  }>
}

// Form Dashboard Models
export interface FormDashboardSummary {
  category: string
  'category-id': string
  'form-type': string
  id: string
  status: `${FormCompletionStatus}`
  'submission-id': string
}

export interface FormDashboardListResponse {
  message: string
  data: FormDashboardSummary[]
  'novelty-score': number | null
}

export interface CommonFieldRequestModal {
  form_type: FormDashboardFormType
  submission_id: string
  form_id: string
}

export interface CommonFieldResponseQuestionAnswerModal {
  question_id: string
  answer: string
  multi_source: boolean
}

export interface CommonFieldResponseModal {
  common_fields: CommonFieldResponseQuestionAnswerModal[]
}
