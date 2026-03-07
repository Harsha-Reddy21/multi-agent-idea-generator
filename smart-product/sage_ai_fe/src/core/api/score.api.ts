import { ScoreRequestBody, ScoreResponseBody } from '../models/score.model'
import { BaseApiService } from './base.api'

class ScoreApiService extends BaseApiService {
  constructor() {
    super('score')
  }

  async calculateScore(
    requestBody: ScoreRequestBody
  ): Promise<ScoreResponseBody> {
    return this.post<ScoreResponseBody, ScoreRequestBody>(
      requestBody,
      'scoring'
    )
  }
}

export const scoreApiService = new ScoreApiService()
