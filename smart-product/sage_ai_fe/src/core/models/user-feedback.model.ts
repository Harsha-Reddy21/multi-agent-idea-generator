export const FEEDBACK_TYPE = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
} as const

export type FeedbackType = (typeof FEEDBACK_TYPE)[keyof typeof FEEDBACK_TYPE]

export interface UserFeedbackProps {
  feedbackType?: FeedbackType | null
  initialSelections?: string[]
  onSelectionsChange?: (selections: string[]) => void
  onTextChange?: (text: string) => void
  maxChars?: number
  placeholder?: string
  className?: string
  onClose?: () => void
  onSubmit?: () => void
  showRatingButtons?: boolean
}
