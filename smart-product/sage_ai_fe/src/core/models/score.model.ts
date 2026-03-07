/**
 * Request body for calculating score
 */
import { FormQuestion } from './form.model'

export interface ScoreRequestBody {
  submission_id: string
  form_data: FormQuestion[]
  form_type: string
}

/**
 * Response body for score calculation
 */
export interface ScoreResponseBody {
  submission_id: string
  total_score: number
}
