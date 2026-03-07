export interface EnhanceAnswerRequest {
  question_id: string
  submission_id?: string | null
  user_text: string
  form_id?: string | null
  form_data?: Record<string, unknown>[] | null
}

export interface EnhanceAnswerResponse {
  question_id: string
  original_text: string
  reviewed_text: string | object
  rationale?: string
  interaction_id?: string | null
}

export interface DataExtractsStatusContextType {
  isFileNotFound: boolean
  setIsFileNotFound: (isNotFound: boolean) => void
  resetFileNotFound: () => void
}
