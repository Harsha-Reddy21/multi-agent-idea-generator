import { AIFormContextProps } from './ai-features-card.model'

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface EnhanceAnswerCardProps {
  userInput: string
  questionId: string
  submissionId?: string
  isVisible: boolean
  onUseThis?: (enhancedText: string) => void
  onKeepOriginal?: (originalText: string) => void
  onClose?: () => void
  formContext?: AIFormContextProps
}
