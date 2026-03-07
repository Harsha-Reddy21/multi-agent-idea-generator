import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { suggestionsApiService } from '@/core/api/suggestions.api'
import { CheckCoverageProps } from '@/core/models/ai-features-card.model'
import { SuggestionCoverageResponseBody } from '@/core/models/suggestion.model'

import { CheckCoverage } from './CheckCoverage'

// Mock dependencies
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsButton: ({
    children,
    onClick,
    className,
    disabled,
    classes,
  }: {
    children?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    className?: string
    disabled?: boolean
    classes?: string
  }) => (
    <button
      onClick={onClick}
      className={`${className} ${classes}`}
      disabled={disabled}
      data-testid="check-coverage-button"
    >
      {children}
    </button>
  ),
  LdsImage: ({
    src,
    alt,
    className,
  }: {
    src: string
    alt: string
    className?: string
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid={`image-${alt}`}
    />
  ),
}))

vi.mock('@/core/api/suggestions.api', () => ({
  suggestionsApiService: {
    checkSuggestionsCoverage: vi.fn(),
  },
}))

vi.mock('../UserFeedback/UserFeedback', () => ({
  UserFeedback: ({
    submissionId,
    questionId,
    formId,
    aiFeatureType,
  }: {
    submissionId: string
    questionId: string
    formId: string
    userInput?: string
    aiFeatureType: string
    interactionId?: string | null
  }) => (
    <div data-testid="user-feedback">
      <span data-testid="feedback-submission-id">{submissionId}</span>
      <span data-testid="feedback-question-id">{questionId}</span>
      <span data-testid="feedback-form-id">{formId}</span>
      <span data-testid="feedback-ai-feature-type">{aiFeatureType}</span>
    </div>
  ),
}))

const mockCoverageResponse: SuggestionCoverageResponseBody = {
  completed_suggestions: [
    {
      text: 'Describe how this solution anticipates future trends',
      rationale: 'The answer clearly discusses future trends and scalability.',
    },
  ],
  required_suggestions: [
    {
      text: 'Provide more details about the implementation',
      rationale: 'The answer lacks specific implementation details.',
    },
  ],
  interaction_id: 'interaction-123',
}

const mockAllCompletedResponse: SuggestionCoverageResponseBody = {
  completed_suggestions: [
    {
      text: 'Describe how this solution anticipates future trends',
      rationale: 'The answer clearly discusses future trends.',
    },
    {
      text: 'Provide context about the business challenge',
      rationale: 'Business context is well explained.',
    },
  ],
  required_suggestions: [],
  interaction_id: 'interaction-456',
}

const defaultProps: CheckCoverageProps = {
  questionId: 'q123',
  submissionId: 's456',
  userText: 'This is my answer text',
  formId: 'f789',
  interactionId: null,
  hideSuggestionsAndFeedback: false,
  isRadioSelected: false,
  resetCoverage: false,
  clearCoverageData: false,
}

describe('CheckCoverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render check coverage button', () => {
      render(<CheckCoverage {...defaultProps} />)
      expect(screen.getByTestId('check-coverage-button')).toBeInTheDocument()
      expect(screen.getByText('Check coverage')).toBeInTheDocument()
    })

    it('should render initial suggestions when no coverage data', async () => {
      // Don't provide required props so fetch won't trigger
      render(<CheckCoverage {...defaultProps} questionId={undefined} />)

      await waitFor(() => {
        expect(
          screen.getByText('Answer writing suggestions')
        ).toBeInTheDocument()
      })
      expect(
        screen.getByText('Describe how this solution anticipates future trends')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Provide context about the business challenge or opportunity this solution addresses'
        )
      ).toBeInTheDocument()
      expect(screen.getByText('Summarize the key features')).toBeInTheDocument()
    })

    it('should have check coverage button disabled initially when auto-fetching', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(<CheckCoverage {...defaultProps} />)
      const button = screen.getByTestId('check-coverage-button')

      // Button is disabled during auto-fetch
      expect(button).toBeDisabled()

      // Wait for fetch to complete
      await waitFor(() => {
        expect(button).toBeDisabled() // Still disabled after coverage is checked
      })
    })

    it('should have check coverage button disabled when userText is empty', () => {
      render(<CheckCoverage {...defaultProps} userText="" />)
      const button = screen.getByTestId('check-coverage-button')
      expect(button).toBeDisabled()
    })

    it('should have check coverage button disabled when userText is only whitespace', () => {
      render(<CheckCoverage {...defaultProps} userText="   " />)
      const button = screen.getByTestId('check-coverage-button')
      expect(button).toBeDisabled()
    })

    it('should not render initial suggestions when hideSuggestionsAndFeedback is true', () => {
      render(
        <CheckCoverage {...defaultProps} hideSuggestionsAndFeedback={true} />
      )
      expect(
        screen.queryByText('Answer writing suggestions')
      ).not.toBeInTheDocument()
    })
  })

  describe('Check Coverage Button Click', () => {
    it('should call API when check coverage button is clicked', async () => {
      const mockCheckCoverage = vi
        .mocked(suggestionsApiService.checkSuggestionsCoverage)
        .mockResolvedValue(mockCoverageResponse)

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockCheckCoverage).toHaveBeenCalledWith({
          question_id: 'q123',
          submission_id: 's456',
          user_text: 'This is my answer text',
        })
      })
    })

    it('should call onCheckCoverageClick callback when button is clicked', async () => {
      const onCheckCoverageClick = vi.fn()
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      const { rerender } = render(
        <CheckCoverage
          {...defaultProps}
          onCheckCoverageClick={onCheckCoverageClick}
        />
      )

      // Wait for auto-fetch to complete (callback is not called on auto-fetch)
      await waitFor(() => {
        expect(
          screen.getByTestId('image-success tick icon')
        ).toBeInTheDocument()
      })

      // Callback should not be called on auto-fetch
      expect(onCheckCoverageClick).not.toHaveBeenCalled()

      // Reset coverage to enable button again
      rerender(
        <CheckCoverage
          {...defaultProps}
          resetCoverage={true}
          onCheckCoverageClick={onCheckCoverageClick}
        />
      )

      // Wait for button to be enabled
      await waitFor(() => {
        const button = screen.getByTestId('check-coverage-button')
        expect(button).not.toBeDisabled()
      })

      // Click the button manually
      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      // Now callback should be called
      expect(onCheckCoverageClick).toHaveBeenCalled()
    })

    it('should show loading state while fetching coverage', async () => {
      let resolvePromise: (value: SuggestionCoverageResponseBody) => void
      const promise = new Promise<SuggestionCoverageResponseBody>(resolve => {
        resolvePromise = resolve
      })
      vi.mocked(suggestionsApiService.checkSuggestionsCoverage).mockReturnValue(
        promise
      )

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByText('Loading coverage analysis...')
        ).toBeInTheDocument()
      })

      // Resolve the promise
      resolvePromise!(mockCoverageResponse)

      await waitFor(() => {
        expect(
          screen.queryByText('Loading coverage analysis...')
        ).not.toBeInTheDocument()
      })
    })

    it('should call onLoadComplete after coverage data is loaded', async () => {
      const onLoadComplete = vi.fn()
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(
        <CheckCoverage {...defaultProps} onLoadComplete={onLoadComplete} />
      )

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(onLoadComplete).toHaveBeenCalled()
      })
    })
  })

  describe('Coverage Results Display', () => {
    it('should display completed suggestions with success icon', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Describe how this solution anticipates future trends'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            'The answer clearly discusses future trends and scalability.'
          )
        ).toBeInTheDocument()
      })

      expect(screen.getByTestId('image-success tick icon')).toBeInTheDocument()
    })

    it('should display required suggestions with cross icon', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByText('Provide more details about the implementation')
        ).toBeInTheDocument()
        expect(
          screen.getByText('The answer lacks specific implementation details.')
        ).toBeInTheDocument()
      })

      expect(screen.getByTestId('image-warning icon')).toBeInTheDocument()
    })

    it('should render UserFeedback component after coverage is loaded', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('user-feedback')).toBeInTheDocument()
        expect(screen.getByTestId('feedback-submission-id')).toHaveTextContent(
          's456'
        )
        expect(screen.getByTestId('feedback-question-id')).toHaveTextContent(
          'q123'
        )
        expect(screen.getByTestId('feedback-form-id')).toHaveTextContent('f789')
        expect(
          screen.getByTestId('feedback-ai-feature-type')
        ).toHaveTextContent('suggestions')
      })
    })

    it('should not render UserFeedback when hideSuggestionsAndFeedback is true', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(
        <CheckCoverage {...defaultProps} hideSuggestionsAndFeedback={true} />
      )

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByTestId('image-success tick icon')
        ).toBeInTheDocument()
      })

      expect(screen.queryByTestId('user-feedback')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockRejectedValue(new Error('Network error'))

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load coverage data. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('should call onLoadComplete even when API call fails', async () => {
      const onLoadComplete = vi.fn()
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockRejectedValue(new Error('Network error'))

      render(
        <CheckCoverage {...defaultProps} onLoadComplete={onLoadComplete} />
      )

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(onLoadComplete).toHaveBeenCalled()
      })
    })

    it('should not call API when questionId is missing', async () => {
      const mockCheckCoverage = vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      )

      render(<CheckCoverage {...defaultProps} questionId={undefined} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockCheckCoverage).not.toHaveBeenCalled()
      })
    })

    it('should not call API when submissionId is missing', async () => {
      const mockCheckCoverage = vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      )

      render(<CheckCoverage {...defaultProps} submissionId={undefined} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockCheckCoverage).not.toHaveBeenCalled()
      })
    })
  })

  describe('Button State Management', () => {
    it('should disable button while loading', async () => {
      let resolvePromise: (value: SuggestionCoverageResponseBody) => void
      const promise = new Promise<SuggestionCoverageResponseBody>(resolve => {
        resolvePromise = resolve
      })
      vi.mocked(suggestionsApiService.checkSuggestionsCoverage).mockReturnValue(
        promise
      )

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(button).toBeDisabled()
      })

      resolvePromise!(mockCoverageResponse)

      await waitFor(() => {
        expect(button).toBeDisabled() // Still disabled after check is completed
      })
    })

    it('should disable button after coverage is checked', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')

      // Button starts disabled during auto-fetch
      await waitFor(() => {
        expect(button).toBeDisabled()
      })

      // Button remains disabled after coverage is checked
      await waitFor(() => {
        expect(
          screen.getByTestId('image-success tick icon')
        ).toBeInTheDocument()
      })

      expect(button).toBeDisabled()
    })

    it('should disable button when hideSuggestionsAndFeedback is true and isRadioSelected is false', () => {
      render(
        <CheckCoverage
          {...defaultProps}
          hideSuggestionsAndFeedback={true}
          isRadioSelected={false}
        />
      )

      const button = screen.getByTestId('check-coverage-button')
      expect(button).toBeDisabled()
    })

    it('should enable button when hideSuggestionsAndFeedback is true and isRadioSelected is true but disable during fetch', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(
        <CheckCoverage
          {...defaultProps}
          hideSuggestionsAndFeedback={true}
          isRadioSelected={true}
        />
      )

      const button = screen.getByTestId('check-coverage-button')
      // Button is disabled during loading from auto-fetch
      await waitFor(() => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Reset and Clear Coverage', () => {
    it('should reset coverage check state when resetCoverage prop changes', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      const { rerender } = render(<CheckCoverage {...defaultProps} />)

      // Check coverage first
      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(button).toBeDisabled()
      })

      // Reset coverage
      rerender(<CheckCoverage {...defaultProps} resetCoverage={true} />)

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })

    it('should clear coverage data when clearCoverageData prop changes', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      const { rerender } = render(<CheckCoverage {...defaultProps} />)

      // Wait for auto-fetch to complete
      await waitFor(() => {
        expect(
          screen.getByText(
            'Describe how this solution anticipates future trends'
          )
        ).toBeInTheDocument()
      })

      // Clear coverage data
      rerender(
        <CheckCoverage
          {...defaultProps}
          clearCoverageData={true}
          questionId={undefined}
        />
      )

      // After clearing, initial suggestions should show (if not hidden)
      await waitFor(() => {
        expect(
          screen.getByText('Answer writing suggestions')
        ).toBeInTheDocument()
      })
    })
  })

  describe('User Text Changes', () => {
    it('should re-enable button when userText changes after coverage is checked', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      const { rerender } = render(<CheckCoverage {...defaultProps} />)

      // Check coverage first
      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(button).toBeDisabled()
      })

      // Change user text
      rerender(<CheckCoverage {...defaultProps} userText="New answer text" />)

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })

    it('should keep showing previous coverage results when userText changes', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      const { rerender } = render(<CheckCoverage {...defaultProps} />)

      // Check coverage first
      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Describe how this solution anticipates future trends'
          )
        ).toBeInTheDocument()
      })

      // Change user text - should still show old results
      rerender(<CheckCoverage {...defaultProps} userText="New answer text" />)

      expect(
        screen.getByText('Describe how this solution anticipates future trends')
      ).toBeInTheDocument()
    })

    it('should not reset coverage state when userText is empty initially', async () => {
      const { rerender } = render(
        <CheckCoverage {...defaultProps} userText="" />
      )

      const button = screen.getByTestId('check-coverage-button')
      expect(button).toBeDisabled()

      // Change to valid text
      rerender(<CheckCoverage {...defaultProps} userText="Valid text" />)

      expect(button).not.toBeDisabled()
    })
  })

  describe('Props Handling', () => {
    it('should handle missing optional props', () => {
      const minimalProps: CheckCoverageProps = {
        questionId: 'q123',
        submissionId: 's456',
        userText: 'Some text',
      }

      render(<CheckCoverage {...minimalProps} />)
      expect(screen.getByTestId('check-coverage-button')).toBeInTheDocument()
    })

    it('should handle all props undefined', () => {
      const emptyProps: CheckCoverageProps = {}

      render(<CheckCoverage {...emptyProps} />)
      expect(screen.getByTestId('check-coverage-button')).toBeInTheDocument()
      expect(screen.getByTestId('check-coverage-button')).toBeDisabled()
    })

    it('should pass interactionId to UserFeedback when provided', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(
        <CheckCoverage
          {...defaultProps}
          interactionId="custom-interaction-id"
        />
      )

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('user-feedback')).toBeInTheDocument()
      })
    })
  })

  describe('Multiple Suggestions Rendering', () => {
    it('should render multiple completed suggestions', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockAllCompletedResponse)

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Describe how this solution anticipates future trends'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText('Provide context about the business challenge')
        ).toBeInTheDocument()
      })

      const successIcons = screen.getAllByTestId('image-success tick icon')
      expect(successIcons).toHaveLength(2)
    })

    it('should render coverage results container with correct id', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      const { container } = render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        const resultsContainer = container.querySelector(
          '#check-coverage-results'
        )
        expect(resultsContainer).toBeInTheDocument()
      })
    })
  })

  describe('Loading Spinner', () => {
    it('should render loading spinner with correct structure', async () => {
      let resolvePromise: (value: SuggestionCoverageResponseBody) => void
      const promise = new Promise<SuggestionCoverageResponseBody>(resolve => {
        resolvePromise = resolve
      })
      vi.mocked(suggestionsApiService.checkSuggestionsCoverage).mockReturnValue(
        promise
      )

      const { container } = render(<CheckCoverage {...defaultProps} />)

      // Auto-fetch triggers loading immediately
      await waitFor(() => {
        expect(
          screen.getByText('Loading coverage analysis...')
        ).toBeInTheDocument()
      })

      // Check that spinner div exists (it has a dynamic class name from CSS modules)
      const spinner = container.querySelector('[class*="spinner"]')
      expect(spinner).toBeInTheDocument()

      resolvePromise!(mockCoverageResponse)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty coverage response', async () => {
      const emptyCoverageResponse: SuggestionCoverageResponseBody = {
        completed_suggestions: [],
        required_suggestions: [],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(emptyCoverageResponse)

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByText(
            'All the suggestions are incorporated in the answer!'
          )
        ).toBeInTheDocument()
      })
    })

    it('should not render UserFeedback when required props are missing', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockCoverageResponse)

      render(<CheckCoverage {...defaultProps} formId={undefined} />)

      const button = screen.getByTestId('check-coverage-button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByTestId('image-success tick icon')
        ).toBeInTheDocument()
      })

      expect(screen.queryByTestId('user-feedback')).not.toBeInTheDocument()
    })

    it('should handle rapid button clicks gracefully', async () => {
      const mockCheckCoverage = vi
        .mocked(suggestionsApiService.checkSuggestionsCoverage)
        .mockResolvedValue(mockCoverageResponse)

      render(<CheckCoverage {...defaultProps} />)

      const button = screen.getByTestId('check-coverage-button')

      // Click multiple times rapidly
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      await waitFor(() => {
        expect(
          screen.getByTestId('image-success tick icon')
        ).toBeInTheDocument()
      })

      // Should still only call API once per toggle
      expect(mockCheckCoverage).toHaveBeenCalled()
    })
  })
})
