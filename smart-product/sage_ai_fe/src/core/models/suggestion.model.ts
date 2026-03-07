interface Suggestion {
  question_id: string
  suggestions: string[]
}

export interface SuggestionsResponse {
  form_type: string
  data: Suggestion[]
}

export interface SuggestionCoverageRequestBody {
  question_id: string
  submission_id: string
  user_text: string
}

interface SuggestionCoverageAnswerState {
  text: string
  rationale: string
}

export interface SuggestionCoverageResponseBody {
  required_suggestions: SuggestionCoverageAnswerState[]
  completed_suggestions: SuggestionCoverageAnswerState[]
  interaction_id: string | null
}
