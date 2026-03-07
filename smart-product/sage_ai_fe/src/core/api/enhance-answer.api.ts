import {
  EnhanceAnswerRequest,
  EnhanceAnswerResponse,
} from '../models/enhance-answer.model'
import { BaseApiService } from './base.api'

class EnhanceAnswerApi extends BaseApiService {
  constructor() {
    super('enhance-answer')
  }

  async enhanceAnswer(
    answerText: string,
    questionId: string,
    submissionId?: string,
    formId?: string,
    formData?: Record<string, any>[]
  ): Promise<EnhanceAnswerResponse> {
    const payload: EnhanceAnswerRequest = {
      question_id: questionId,
      user_text: answerText,
      submission_id: submissionId || null,
      form_id: formId || null,
      form_data: formData || null,
    }
    return this.post<EnhanceAnswerResponse, EnhanceAnswerRequest>(payload, '')
  }
}

export const enhanceAnswerApi = new EnhanceAnswerApi()
export type {
  EnhanceAnswerRequest,
  EnhanceAnswerResponse,
} from '../models/enhance-answer.model'
