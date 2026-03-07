import {
  GetReviewAnswerRequest,
  GetReviewAnswerResponse,
} from '../models/review-answer.model'
import { BaseApiService } from './base.api'

class ReviewAnswerApiService extends BaseApiService {
  constructor() {
    super('')
  }

  async getReviewAnswer(
    request: GetReviewAnswerRequest
  ): Promise<GetReviewAnswerResponse> {
    return this.post<GetReviewAnswerResponse, GetReviewAnswerRequest>(
      request,
      'review-answers'
    )
  }
}

export const reviewAnswerApiService = new ReviewAnswerApiService()
