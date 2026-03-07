import { BaseApiService } from './base.api'

export type AiInteractionAcceptanceRequest = {
  interactions: Record<string, boolean>
}

export type AiInteractionAcceptanceResponse = {
  updated_count: number
  message: string
}

class AiInteractionApiService extends BaseApiService {
  constructor() {
    super('ai-interaction')
  }

  async updateAcceptance(
    payload: AiInteractionAcceptanceRequest
  ): Promise<AiInteractionAcceptanceResponse> {
    return this.patch<
      AiInteractionAcceptanceResponse,
      AiInteractionAcceptanceRequest
    >(payload, '/update-acceptance')
  }
}

export const aiInteractionApiService = new AiInteractionApiService()
