import React from 'react'

export interface InfoTourModalProps {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Callback when modal should be closed */
  onClose: () => void
  /** Optional: Callback when Next button is clicked (for multi-step tours) */
  onNext?: () => void
  /** The message to display in the modal. Use \n for line breaks. */
  message: string
  /** Optional: Custom button text (defaults to "Okay") */
  buttonText?: string
  /** Optional: Custom width for the modal (defaults to auto-calculated based on content) */
  width?: number
  /** Optional: Position relative to target element */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Optional: Target element to position relative to */
  targetRef?: React.RefObject<any>
  /** Optional: Show skip button */
  skipButton?: boolean
  /** Optional: Arrow alignment ('center' | 'left' | 'right') */
  arrowAlign?: 'center' | 'left' | 'right'
  // /** Optional: Left margin adjustment for positioning */
  // leftMargin?: number
}
