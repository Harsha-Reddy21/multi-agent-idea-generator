import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type AIFeedbackResponse,
  type AIInteractionResponse,
  type CreateAIFeedbackResponse,
  userFeedbackApi,
} from '../../core/api/user-feedback.api'
import UserFeedback from './UserFeedback'

// Mock the API
vi.mock('../../core/api/user-feedback.api', () => ({
  userFeedbackApi: {
    submitFeedback: vi.fn(),
  },
  AIFeatureType: {},
}))

// Mock successful API response
const mockSuccessResponse: CreateAIFeedbackResponse = {
  interaction: {
    id: 'test-interaction-id',
    submission_id: 's123',
    question_id: 'q456',
    user_input: 'Test user input',
    ai_feature_type: 'enhance_answer',
    ai_generated_content: {},
    created_at: new Date().toISOString(),
  } as AIInteractionResponse,
  feedback: {
    id: 'test-feedback-id',
    interaction_id: 'test-interaction-id',
    form_id: 'f789',
    feedback_type: 'like',
    feedback_tags: null,
    user_comment: null,
    rating: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as AIFeedbackResponse,
}

describe('UserFeedback', () => {
  const defaultProps = {
    submissionId: 's123',
    questionId: 'q456',
    formId: 'f789',
    userInput: 'Test user input',
    aiFeatureType: 'enhance_answer' as const,
    interactionId: 'test-interaction-123',
    label: 'Rate suggestion:',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render rating buttons on initial load', () => {
      render(<UserFeedback {...defaultProps} />)

      expect(screen.getByText('Rate suggestion:')).toBeInTheDocument()
      expect(screen.getByTestId('like-button')).toBeInTheDocument()
      expect(screen.getByTestId('dislike-button')).toBeInTheDocument()
    })

    it('should not show feedback form initially', () => {
      render(<UserFeedback {...defaultProps} />)

      expect(
        screen.queryByText(/Tell us what can be improved/)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText('Optional Description')
      ).not.toBeInTheDocument()
    })

    it('should not show "Thanks for your feedback!" initially', () => {
      render(<UserFeedback {...defaultProps} />)

      expect(
        screen.queryByText('Thanks for your feedback!')
      ).not.toBeInTheDocument()
    })
  })

  describe('Positive Feedback (Like)', () => {
    it('should submit positive feedback immediately when like button is clicked', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledTimes(1)
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith({
          feedback_type: 'like',
          feedback_tags: null,
          user_comment: null,
          is_accepted: false,
          interaction_id: 'test-interaction-123',
        })
      })
    })

    it('should show success message after positive feedback is submitted', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(
          screen.getByText('Thanks for your feedback!')
        ).toBeInTheDocument()
      })
    })

    it('should highlight like button after clicking', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      const likeButton = screen.getByTestId('like-button')
      await user.click(likeButton)

      await waitFor(() => {
        expect(likeButton.className).toContain('ratingButtonPositive')
      })
    })

    it('should not show feedback form for positive feedback', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(
          screen.queryByText(/Tell us what can be improved/)
        ).not.toBeInTheDocument()
      })
    })

    it('should use interaction_id from props', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            interaction_id: 'test-interaction-123',
          })
        )
      })
    })
  })

  describe('Negative Feedback (Dislike)', () => {
    it('should show feedback form when dislike button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      expect(
        screen.getByText(/Tell us what can be improved/)
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Optional Description')
      ).toBeInTheDocument()
      expect(screen.getByTestId('submit-feedback-button')).toBeInTheDocument()
    })

    it('should display feedback context in heading', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} feedbackContext="data extracts" />)

      await user.click(screen.getByTestId('dislike-button'))

      expect(
        screen.getByText('Tell us what can be improved for data extracts')
      ).toBeInTheDocument()
    })

    it('should use default feedback context when not provided', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      expect(
        screen.getByText('Tell us what can be improved for this feature')
      ).toBeInTheDocument()
    })

    it('should highlight dislike button after clicking', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      const dislikeButton = screen.getByTestId('dislike-button')
      await user.click(dislikeButton)

      expect(dislikeButton.className).toContain('ratingButtonNegative')
    })

    it('should display default negative feedback chips', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      // Default chips from NEGATIVE_FEEDBACK_CHIPS constant
      expect(screen.getByText('Not Relevant')).toBeInTheDocument()
      expect(screen.getByText('Inaccurate information')).toBeInTheDocument()
      expect(screen.getByText('Confusing')).toBeInTheDocument()
      expect(screen.getByText('Other')).toBeInTheDocument()
    })

    it('should display custom negative feedback chips when provided', async () => {
      const customChips = ['Custom Chip 1', 'Custom Chip 2', 'Custom Chip 3']
      const user = userEvent.setup()
      render(
        <UserFeedback {...defaultProps} negativeFeedbackChips={customChips} />
      )

      await user.click(screen.getByTestId('dislike-button'))

      expect(screen.getByText('Custom Chip 1')).toBeInTheDocument()
      expect(screen.getByText('Custom Chip 2')).toBeInTheDocument()
      expect(screen.getByText('Custom Chip 3')).toBeInTheDocument()
    })

    it('should allow selecting and deselecting chips', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      const chip = screen.getByText('Not Relevant')

      // Select chip
      await user.click(chip)
      expect(chip.className).toContain('chipSelected')

      // Deselect chip
      await user.click(chip)
      expect(chip.className).not.toContain('chipSelected')
    })

    it('should allow selecting multiple chips', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      const chip1 = screen.getByText('Not Relevant')
      const chip2 = screen.getByText('Confusing')

      await user.click(chip1)
      await user.click(chip2)

      expect(chip1.className).toContain('chipSelected')
      expect(chip2.className).toContain('chipSelected')
    })

    it('should update comment textarea value', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      const textarea = screen.getByPlaceholderText('Optional Description')
      await user.type(textarea, 'This is my feedback comment')

      expect(textarea).toHaveValue('This is my feedback comment')
    })

    it('should show character count for textarea', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      const textarea = screen.getByPlaceholderText('Optional Description')
      await user.type(textarea, 'Hello')

      expect(screen.getByText('5/500')).toBeInTheDocument()
    })

    it('should limit textarea to 500 characters', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      const textarea = screen.getByPlaceholderText(
        'Optional Description'
      ) as HTMLTextAreaElement
      const longText = 'a'.repeat(600)

      // Use paste instead of type for better performance
      await user.click(textarea)
      await user.paste(longText)

      expect(textarea.value).toHaveLength(500)
      expect(screen.getByText('500/500')).toBeInTheDocument()
    })

    it('should disable submit button when no chips are selected', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      const submitButton = screen.getByTestId('submit-feedback-button')
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when at least one chip is selected', async () => {
      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      const chip = screen.getByText('Not Relevant')
      await user.click(chip)

      const submitButton = screen.getByTestId('submit-feedback-button')
      expect(submitButton).not.toBeDisabled()
    })

    it('should submit negative feedback with selected chips and comment', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      // Select chips
      await user.click(screen.getByText('Not Relevant'))
      await user.click(screen.getByText('Confusing'))

      // Add comment
      const textarea = screen.getByPlaceholderText(
        'Optional Description'
      ) as HTMLTextAreaElement
      await user.click(textarea)
      await user.paste('This needs improvement')

      // Submit
      await user.click(screen.getByTestId('submit-feedback-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith({
          feedback_type: 'dislike',
          feedback_tags: ['Not Relevant', 'Confusing'],
          user_comment: 'This needs improvement',
          is_accepted: false,
          interaction_id: 'test-interaction-123',
        })
      })
    })

    it('should submit negative feedback with chips only (no comment)', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      await user.click(screen.getByText('Confusing'))
      await user.click(screen.getByTestId('submit-feedback-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            feedback_tags: ['Confusing'],
            user_comment: null,
          })
        )
      })
    })

    it('should trim whitespace from comment before submitting', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      await user.click(screen.getByText('Not Relevant'))
      const textarea = screen.getByPlaceholderText(
        'Optional Description'
      ) as HTMLTextAreaElement
      await user.click(textarea)
      await user.paste('   Comment with spaces   ')

      await user.click(screen.getByTestId('submit-feedback-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            user_comment: 'Comment with spaces',
          })
        )
      })
    })

    it('should use null for empty comment', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      await user.click(screen.getByText('Not Relevant'))
      await user.click(screen.getByTestId('submit-feedback-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            user_comment: null,
          })
        )
      })
    })

    it('should use null for whitespace-only comment', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))

      await user.click(screen.getByText('Not Relevant'))
      const textarea = screen.getByPlaceholderText('Optional Description')
      await user.type(textarea, '     ')

      await user.click(screen.getByTestId('submit-feedback-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            user_comment: null,
          })
        )
      })
    })

    it('should hide form after successful submission', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))
      await user.click(screen.getByText('Inaccurate information'))
      await user.click(screen.getByTestId('submit-feedback-button'))

      await waitFor(() => {
        expect(
          screen.queryByText(/Tell us what can be improved/)
        ).not.toBeInTheDocument()
      })
    })

    it('should show success message after negative feedback submission', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))
      await user.click(screen.getByText('Inaccurate information'))
      await user.click(screen.getByTestId('submit-feedback-button'))

      await waitFor(() => {
        expect(
          screen.getByText('Thanks for your feedback!')
        ).toBeInTheDocument()
      })
    })

    it('should show "Submitting..." text while submitting', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))
      await user.click(screen.getByText('Not Relevant'))
      await user.click(screen.getByTestId('submit-feedback-button'))

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })

    it('should disable submit button while submitting', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))
      await user.click(screen.getByText('Not Relevant'))

      const submitButton = screen.getByTestId('submit-feedback-button')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
    })

    it('should handle API error gracefully for negative feedback', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(vi.fn())
      vi.mocked(userFeedbackApi.submitFeedback).mockRejectedValue(
        new Error('Network error')
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      await user.click(screen.getByTestId('dislike-button'))
      await user.click(screen.getByText('Inaccurate information'))
      await user.click(screen.getByTestId('submit-feedback-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledTimes(1)
      })

      // Form should still be visible after error (component doesn't hide form on error)
      expect(
        screen.getByText(/Tell us what can be improved/)
      ).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('State Reset on InteractionId Change', () => {
    it('should reset state when interactionId changes', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      const { rerender } = render(<UserFeedback {...defaultProps} />)

      // Submit positive feedback
      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(
          screen.getByText('Thanks for your feedback!')
        ).toBeInTheDocument()
      })

      // Change interactionId (switching to a different AI feature)
      rerender(
        <UserFeedback {...defaultProps} interactionId="new-interaction-456" />
      )

      // State should be reset - no more success message
      expect(
        screen.queryByText('Thanks for your feedback!')
      ).not.toBeInTheDocument()

      // Buttons should be enabled again
      expect(screen.getByTestId('like-button')).not.toBeDisabled()
      expect(screen.getByTestId('dislike-button')).not.toBeDisabled()
    })

    it('should reset negative feedback form when interactionId changes', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<UserFeedback {...defaultProps} />)

      // Click dislike and select chip
      await user.click(screen.getByTestId('dislike-button'))
      await user.click(screen.getByText('Not Relevant'))

      // Verify form is visible
      expect(
        screen.getByText(/Tell us what can be improved/)
      ).toBeInTheDocument()

      // Change interactionId (switching to a different AI feature)
      rerender(
        <UserFeedback {...defaultProps} interactionId="new-interaction-789" />
      )

      // Form should be hidden and state reset
      expect(
        screen.queryByText(/Tell us what can be improved/)
      ).not.toBeInTheDocument()

      // Rating should be reset
      const dislikeButton = screen.getByTestId('dislike-button')
      expect(dislikeButton.className).not.toContain('ratingButtonNegative')
    })

    it('should allow submitting feedback after interactionId changes', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      const { rerender } = render(<UserFeedback {...defaultProps} />)

      // Submit positive feedback for first interaction
      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            interaction_id: 'test-interaction-123',
          })
        )
      })

      // Change interactionId (switching to a different AI feature)
      rerender(
        <UserFeedback {...defaultProps} interactionId="new-interaction-999" />
      )

      // Should be able to submit feedback again for the new interaction
      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            interaction_id: 'new-interaction-999',
          })
        )
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Interaction ID Handling', () => {
    it('should disable buttons when interactionId is null', async () => {
      render(<UserFeedback {...defaultProps} interactionId={null} />)

      expect(screen.getByTestId('like-button')).toBeDisabled()
      expect(screen.getByTestId('dislike-button')).toBeDisabled()
    })

    it('should use null for interaction_id when not provided', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { interactionId, ...propsWithoutInteractionId } = defaultProps
      render(<UserFeedback {...propsWithoutInteractionId} />)

      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            interaction_id: null,
          })
        )
      })
    })
  })

  describe('Switching Between Like and Dislike', () => {
    it('should allow switching from negative to positive feedback', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      // Click dislike first
      await user.click(screen.getByTestId('dislike-button'))

      expect(
        screen.getByText(/Tell us what can be improved/)
      ).toBeInTheDocument()

      // Click like
      await user.click(screen.getByTestId('like-button'))

      // Form should be hidden and API called
      await waitFor(() => {
        expect(
          screen.queryByText(/Tell us what can be improved/)
        ).not.toBeInTheDocument()
        expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            feedback_type: 'like',
          })
        )
      })
    })

    it('should not allow switching after positive feedback is submitted', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      // Click like first
      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(
          screen.getByText('Thanks for your feedback!')
        ).toBeInTheDocument()
      })

      // Buttons should be disabled after submission
      expect(screen.getByTestId('like-button')).toBeDisabled()
      expect(screen.getByTestId('dislike-button')).toBeDisabled()

      // Try to click dislike - should not work
      await user.click(screen.getByTestId('dislike-button'))

      // Form should NOT appear because feedbackSubmitted is true
      expect(
        screen.queryByText(/Tell us what can be improved/)
      ).not.toBeInTheDocument()

      // API should only have been called once (for the like)
      expect(userFeedbackApi.submitFeedback).toHaveBeenCalledTimes(1)
    })

    it('should not allow switching from positive to negative feedback before submission', async () => {
      vi.mocked(userFeedbackApi.submitFeedback).mockResolvedValue(
        mockSuccessResponse
      )

      const user = userEvent.setup()
      render(<UserFeedback {...defaultProps} />)

      // Click like first (this triggers immediate submission)
      await user.click(screen.getByTestId('like-button'))

      await waitFor(() => {
        expect(
          screen.getByText('Thanks for your feedback!')
        ).toBeInTheDocument()
      })

      // After submission, buttons should be disabled
      expect(screen.getByTestId('like-button')).toBeDisabled()
      expect(screen.getByTestId('dislike-button')).toBeDisabled()

      // Try to click dislike - should not work since button is disabled
      await user.click(screen.getByTestId('dislike-button'))

      // Form should NOT appear because feedbackSubmitted is true
      expect(
        screen.queryByText(/Tell us what can be improved/)
      ).not.toBeInTheDocument()

      // API should only have been called once (for the like)
      expect(userFeedbackApi.submitFeedback).toHaveBeenCalledTimes(1)
    })
  })
})
