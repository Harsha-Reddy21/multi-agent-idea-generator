import { FormQuestion } from './form.model'

export interface ReviewAnswerItem {
  text: string
  rationale: string
}

export interface GetReviewAnswerRequest {
  submission_id: string
  form_type: string
  question_id: string
  form_data: FormQuestion[]
}

export interface GetReviewAnswerResponse {
  question_id: string
  required_suggestions: ReviewAnswerItem[]
  completed_suggestions: ReviewAnswerItem[]
}
