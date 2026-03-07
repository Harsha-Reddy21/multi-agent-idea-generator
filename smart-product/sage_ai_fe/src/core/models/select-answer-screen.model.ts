import { useAiInteraction } from '@/hooks/useAiInteraction'
import { CommonFieldResponseQuestionAnswerModal } from './form.model'

export interface SelectAnswerScreenProps {
  questionText: string
  inputValue?: string
  questionId?: string
  submissionId?: string
  formId?: string
  onNextDisabledChange?: (disabled: boolean) => void
  onAnswerSelect?: (answer: string) => void
  commonFields?: CommonFieldResponseQuestionAnswerModal[]
  dataExtractOnly?: boolean
  aiInteractions?: ReturnType<typeof useAiInteraction>
}
