import {
  SuggestionCoverageRequestBody,
  SuggestionCoverageResponseBody,
  SuggestionsResponse,
} from '../models/suggestion.model'
import { BaseApiService } from './base.api'

class SuggestionsApiService extends BaseApiService {
  constructor() {
    super('')
  }

  /**
   * Get suggestions and coverage for a specific form type.
   *
   * @param formType - The type of form to get suggestions for.
   * @returns A promise resolving to suggestions and coverage data.
   */
  async getSuggestions(formType: string): Promise<SuggestionsResponse> {
    return this.get<SuggestionsResponse>(`suggestions?form_type=${formType}`)
  }

  /**
   * Check suggestions coverage for user input.
   *
   * @param requestBody - The request body containing question_id and user_text.
   * @returns A promise resolving to suggestions coverage data.
   */
  async checkSuggestionsCoverage(
    requestBody: SuggestionCoverageRequestBody
  ): Promise<SuggestionCoverageResponseBody> {
    return this.post<
      SuggestionCoverageResponseBody,
      SuggestionCoverageRequestBody
    >(requestBody, 'check-suggestions-coverage')
  }
}

export const suggestionsApiService = new SuggestionsApiService()
