import { BaseApiService } from './base.api'

export type AIFeatureType = 'suggestions' | 'enhance_answer' | 'data_extracts'
export type FeedbackType = 'like' | 'dislike'

export interface CreateAIFeedbackRequest {
  feedback_type: FeedbackType
  feedback_tags?: string[] | null
  is_accepted?: boolean
  interaction_id?: string | null
  user_comment?: string | null
}

export interface AIInteractionResponse {
  id: string
  submission_id: string
  question_id: string
  user_input?: string | null
  ai_feature_type: AIFeatureType
  ai_generated_content: Record<string, unknown>
  created_at: string
}

export interface AIFeedbackResponse {
  id: string
  interaction_id: string
  form_id: string
  feedback_type: FeedbackType
  feedback_tags?: string[] | null
  user_comment?: string | null
  rating?: number | null
  created_at: string
  updated_at: string
}

export interface CreateAIFeedbackResponse {
  interaction: AIInteractionResponse
  feedback: AIFeedbackResponse
}

class UserFeedbackApi extends BaseApiService {
  constructor() {
    super('ai-feedback')
  }

  async submitFeedback(
    payload: CreateAIFeedbackRequest
  ): Promise<CreateAIFeedbackResponse> {
    return this.post<CreateAIFeedbackResponse, CreateAIFeedbackRequest>(
      payload,
      ''
    )
  }
}

export const userFeedbackApi = new UserFeedbackApi()
