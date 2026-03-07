import { CommonFieldResponseQuestionAnswerModal } from './form.model'
import { SuggestionsResponse } from './suggestion.model'

export interface AIFormContextProps {
  submissionId?: string
  formType?: string
  formData?: any
  formStatus?: string
  files?: string[]
}

export interface AIFeaturesCardProps {
  isVisible: boolean
  onClose: () => void
  questionText?: string
  questionId?: string
  submissionId?: string
  formId?: string
  inputValue?: string
  onExtractClick?: (fullAnswer: string) => void
  suggestionsData?: SuggestionsResponse | null
  suggestionsLoading?: boolean
  suggestionsError?: string | null
  dataExtractOnly?: boolean
  commonFields?: CommonFieldResponseQuestionAnswerModal[]
  formContext: AIFormContextProps
}

export interface CheckCoverageProps {
  questionId?: string
  submissionId?: string
  userText?: string
  onLoadComplete?: () => void
  formId?: string
  interactionId?: string | null
  hideSuggestionsAndFeedback?: boolean
  isRadioSelected?: boolean
  resetCoverage?: boolean
  onCheckCoverageClick?: () => void
  clearCoverageData?: boolean
}
