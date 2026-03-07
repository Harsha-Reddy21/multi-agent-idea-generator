import { FetchStatus } from '../constants'

export interface Provenance {
  text: string
  span_id: number
  char_end: number
  file_name: string
  block_type: string
  char_start: number
  block_index: number
  page_or_slide: number
  answer: string
  question: string
}

export interface ExtractedContent {
  confidence: number
  provenance: Provenance[]
  answer_text: string
}

export interface GetDocExtractsRequest {
  submissionId: string
  formId: string
  questionId: string
}

export interface GetDocExtractsResponse {
  question_id: string
  extracted_content: ExtractedContent | null
  submission_id: string
  form_id: string
  created_at: string
  updated_at: string
  interaction_id: string | null
}

export interface DataExtractsCardProps {
  fetchStatus: FetchStatus
  extractedData: ExtractedContent | null
  errorMessage?: string
  onExtractClick?: (fullAnswer: string) => void
}

export interface UseDataExtractsParams {
  questionId?: string
  submissionId?: string
  formId?: string
}

export interface UseDataExtractsResult {
  fetchStatus: FetchStatus
  errorMessage?: string
  extractedData: ExtractedContent | null
  provenanceList: ExtractedContent['provenance'] | null
  answerText: string
  interactionId: string | null
  retry: () => void
}
