import {
  GetDocExtractsRequest,
  GetDocExtractsResponse,
} from '../models/data-extracts.model'
import { BaseApiService } from './base.api'

// Re-export for backward compatibility
export type { GetDocExtractsRequest, GetDocExtractsResponse }

class CortexApiService extends BaseApiService {
  constructor() {
    super('cortex')
  }

  async getDocExtracts(
    submissionId: string,
    formId: string,
    questionId: string
  ): Promise<GetDocExtractsResponse> {
    return this.get<GetDocExtractsResponse>(
      `/get-doc-extracts?submission-id=${submissionId}&form-id=${formId}&question-id=${questionId}`
    )
  }
}

export const cortexApiService = new CortexApiService()
