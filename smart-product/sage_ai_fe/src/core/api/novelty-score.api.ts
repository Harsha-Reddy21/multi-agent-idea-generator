import {
  GetNoveltyScoreRequest,
  GetNoveltyScoreResponse,
} from '../models/novelty-score.model'
import { BaseApiService } from './base.api'

class NoveltyScoreApiService extends BaseApiService {
  constructor() {
    super('')
  }

  async getNoveltyScore(
    request: GetNoveltyScoreRequest
  ): Promise<GetNoveltyScoreResponse> {
    return this.post<GetNoveltyScoreResponse, GetNoveltyScoreRequest>(
      request,
      'faiss/search'
    )
  }
}

export const noveltyScoreApiService = new NoveltyScoreApiService()
