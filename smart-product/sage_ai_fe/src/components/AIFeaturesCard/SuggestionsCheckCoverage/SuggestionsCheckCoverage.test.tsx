import { LdsToastProvider } from '@elilillyco/ux-lds-react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AIFeaturesProvider } from '../../../contexts/AIFeaturesContext'
import { suggestionsApiService } from '../../../core/api/suggestions.api'
import { SuggestionsCheckCoverage } from './SuggestionsCheckCoverage'

// Mock the suggestions API service
vi.mock('../../../core/api/suggestions.api', () => ({
  suggestionsApiService: {
    checkSuggestionsCoverage: vi.fn(),
  },
}))

// Mock the gibberish validation utility
vi.mock('../../../core/utils/text-validation.util', () => ({
  isGibberish: vi.fn(),
}))

// Mock the assets
vi.mock('../../../assets/success_tick.svg', () => ({
  default: 'success-tick.svg',
}))

vi.mock('../../../assets/XCircleFilled.svg', () => ({
  default: 'x-circle-filled.svg',
}))

const mockIsGibberish = vi.mocked(
  await import('../../../core/utils/text-validation.util')
).isGibberish

describe('SuggestionsCheckCoverage', () => {
  const mockSuggestionsData = {
    form_type: 'test_form',
    data: [
      {
        question_id: 'q1',
        suggestions: [
          'Describe the main purpose of the system',
          'Explain the technical architecture',
          'List the target user groups',
        ],
      },
      {
        question_id: 'q2',
        suggestions: ['Define project scope', 'Identify stakeholders'],
      },
    ],
  }

  const defaultProps = {
    questionId: 'q1',
    inputValue: 'Sample input text that is long enough to pass validation',
    suggestionsData: mockSuggestionsData,
    submissionId: 'submission-123',
    loading: false,
    error: null,
    onInteractionIdUpdate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock behavior - return false (not gibberish) for normal operation
    mockIsGibberish.mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should display loading state when loading is true', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} loading={true} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      expect(screen.getByText('Loading suggestions...')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      const errorMessage = 'Failed to load suggestions'
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} error={errorMessage} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  describe('Suggestions Display', () => {
    it('should display the informational header', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      expect(
        screen.getByText(/Suggestions highlight the top recommendations/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Check Coverage scans your input for missing details/i)
      ).toBeInTheDocument()
    })

    it('should display all suggestions for the given questionId', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      expect(
        screen.getByText('Describe the main purpose of the system')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Explain the technical architecture')
      ).toBeInTheDocument()
      expect(
        screen.getByText('List the target user groups')
      ).toBeInTheDocument()
    })

    it('should display all suggestions when questionId is not provided', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              questionId={undefined}
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      // Should show suggestions from all questions
      expect(
        screen.getByText('Describe the main purpose of the system')
      ).toBeInTheDocument()
      expect(screen.getByText('Define project scope')).toBeInTheDocument()
    })

    it('should handle empty suggestions data', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              suggestionsData={null}
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      // Should not crash and should show check coverage button
      expect(screen.getByText('Check Coverage')).toBeInTheDocument()
    })
  })

  describe('Check Coverage Button', () => {
    it('should be disabled when inputValue is empty', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} inputValue="" />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByRole('button', {
        name: /Check Coverage/i,
      })
      expect(checkButton).toBeDisabled()
      expect(
        screen.getByText('Please enter valid content to enable Check Coverage')
      ).toBeInTheDocument()
    })

    it('should be disabled when inputValue is only whitespace', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} inputValue="   " />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByRole('button', {
        name: /Check Coverage/i,
      })
      expect(checkButton).toBeDisabled()
    })

    it('should be disabled when inputValue is detected as gibberish', () => {
      mockIsGibberish.mockReturnValue(true)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              inputValue="aaa bbb ccc"
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByRole('button', {
        name: /Check Coverage/i,
      })
      expect(checkButton).toBeDisabled()
      expect(
        screen.getByText('Please enter valid content to enable Check Coverage')
      ).toBeInTheDocument()
      expect(mockIsGibberish).toHaveBeenCalledWith('aaa bbb ccc')
    })

    it('should be enabled when inputValue has valid content', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByText('Check Coverage')
      expect(checkButton).not.toBeDisabled()
      expect(mockIsGibberish).toHaveBeenCalledWith(
        'Sample input text that is long enough to pass validation'
      )
    })

    it('should not call API when inputValue is empty', async () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} inputValue="" />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByText('Check Coverage')
      fireEvent.click(checkButton)

      expect(
        suggestionsApiService.checkSuggestionsCoverage
      ).not.toHaveBeenCalled()
    })

    it('should not call API when inputValue is gibberish', async () => {
      mockIsGibberish.mockReturnValue(true)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              inputValue="123 !@# $%^"
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByText('Check Coverage')
      fireEvent.click(checkButton)

      expect(
        suggestionsApiService.checkSuggestionsCoverage
      ).not.toHaveBeenCalled()
      expect(mockIsGibberish).toHaveBeenCalledWith('123 !@# $%^')
    })
  })

  describe('Check Coverage Functionality', () => {
    beforeEach(() => {
      mockIsGibberish.mockReturnValue(false)
    })

    it('should call API with correct parameters', async () => {
      const mockResponse = {
        required_suggestions: [],
        completed_suggestions: [],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByText('Check Coverage')
      fireEvent.click(checkButton)

      await waitFor(() => {
        expect(
          suggestionsApiService.checkSuggestionsCoverage
        ).toHaveBeenCalledWith({
          question_id: 'q1',
          submission_id: 'submission-123',
          user_text: 'Sample input text that is long enough to pass validation',
        })
      })
    })

    it('should show loading state while checking coverage', async () => {
      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByText('Check Coverage')
      fireEvent.click(checkButton)

      await waitFor(() => {
        expect(screen.getByText('Checking...')).toBeInTheDocument()
      })
    })

    it('should update suggestions with coverage results - all completed', async () => {
      const mockResponse = {
        required_suggestions: [],
        completed_suggestions: [
          {
            text: 'Describe the main purpose of the system',
            rationale: 'This has been covered in your response.',
          },
          {
            text: 'Explain the technical architecture',
            rationale: 'Architecture details are included.',
          },
          {
            text: 'List the target user groups',
            rationale: 'Target users are mentioned.',
          },
        ],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByText('Check Coverage')
      fireEvent.click(checkButton)

      await waitFor(() => {
        expect(
          screen.getByText(
            'All the suggestions are covered in the input field!'
          )
        ).toBeInTheDocument()
      })

      // Check button should be disabled after all suggestions are covered
      const buttonAfter = screen.getByRole('button', {
        name: /Check Coverage/i,
      })
      expect(buttonAfter).toBeDisabled()
    })

    it('should update suggestions with coverage results - some required', async () => {
      const mockResponse = {
        required_suggestions: [
          {
            text: 'Describe the main purpose of the system',
            rationale: 'The main purpose is not clearly described.',
          },
        ],
        completed_suggestions: [
          {
            text: 'Explain the technical architecture',
            rationale: 'Architecture details are included.',
          },
          {
            text: 'List the target user groups',
            rationale: 'Target users are mentioned.',
          },
        ],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByText('Check Coverage')
      fireEvent.click(checkButton)

      await waitFor(() => {
        // Wait for the rationale text to appear
        expect(
          screen.getByText('The main purpose is not clearly described.')
        ).toBeInTheDocument()
      })

      // Check for completed suggestions showing the "incorporated" message
      const incorporatedTexts = screen.getAllByText(
        'Suggestion has been incorporated'
      )
      expect(incorporatedTexts.length).toBeGreaterThan(0)
    })

    it('should handle API error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockRejectedValue(new Error('API Error'))

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByText('Check Coverage')
      fireEvent.click(checkButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error checking coverage:',
          expect.any(Error)
        )
      })

      // Button should be re-enabled after error
      expect(checkButton).not.toBeDisabled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Read More/Less Functionality', () => {
    beforeEach(() => {
      mockIsGibberish.mockReturnValue(false)
    })

    it('should show Read More button for long rationales', async () => {
      const longRationale = 'A'.repeat(201) // Long enough to exceed the limit
      const mockResponse = {
        required_suggestions: [
          {
            text: 'Describe the main purpose of the system',
            rationale: longRationale,
          },
        ],
        completed_suggestions: [],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      fireEvent.click(screen.getByText('Check Coverage'))

      await waitFor(() => {
        expect(screen.getByText('Read More')).toBeInTheDocument()
      })
    })

    it('should toggle between Read More and Read Less', async () => {
      const longRationale = 'A'.repeat(201) // Long enough to exceed the limit
      const mockResponse = {
        required_suggestions: [
          {
            text: 'Describe the main purpose of the system',
            rationale: longRationale,
          },
        ],
        completed_suggestions: [],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      fireEvent.click(screen.getByText('Check Coverage'))

      await waitFor(() => {
        expect(screen.getByText('Read More')).toBeInTheDocument()
      })

      const readMoreButton = screen.getByText('Read More')
      fireEvent.click(readMoreButton)

      await waitFor(() => {
        expect(screen.getByText('Read Less')).toBeInTheDocument()
      })

      const readLessButton = screen.getByText('Read Less')
      fireEvent.click(readLessButton)

      await waitFor(() => {
        expect(screen.getByText('Read More')).toBeInTheDocument()
      })
    })

    it('should not show Read More for short rationales', async () => {
      const shortRationale = 'Short text'
      const mockResponse = {
        required_suggestions: [
          {
            text: 'Describe the main purpose of the system',
            rationale: shortRationale,
          },
        ],
        completed_suggestions: [],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      fireEvent.click(screen.getByText('Check Coverage'))

      await waitFor(() => {
        expect(screen.getByText(shortRationale)).toBeInTheDocument()
      })

      expect(screen.queryByText('Read More')).not.toBeInTheDocument()
    })
  })

  describe('State Icons', () => {
    beforeEach(() => {
      mockIsGibberish.mockReturnValue(false)
    })

    it('should show success icon for completed suggestions', async () => {
      const mockResponse = {
        required_suggestions: [],
        completed_suggestions: [
          {
            text: 'Describe the main purpose of the system',
            rationale: 'Completed',
          },
        ],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      fireEvent.click(screen.getByText('Check Coverage'))

      await waitFor(() => {
        // Look for the success icon by its src attribute
        const successIcon = document.querySelector(
          'img[src="success-tick.svg"]'
        )
        expect(successIcon).toBeInTheDocument()
        expect(successIcon).toHaveAttribute('alt', '')
      })
    })

    it('should show cross icon for required suggestions', async () => {
      const mockResponse = {
        required_suggestions: [
          {
            text: 'Describe the main purpose of the system',
            rationale: 'Required',
          },
        ],
        completed_suggestions: [],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      fireEvent.click(screen.getByText('Check Coverage'))

      await waitFor(() => {
        // Look for the cross icon by its alt text and src
        const crossIcon = screen.getByAltText('done')
        expect(crossIcon).toBeInTheDocument()
        expect(crossIcon).toHaveAttribute('src', 'x-circle-filled.svg')
      })
    })
  })

  describe('Gibberish Validation', () => {
    it('should call isGibberish with trimmed input value', () => {
      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              inputValue="  test content  "
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      expect(mockIsGibberish).toHaveBeenCalledWith('test content')
    })

    it('should show help text when input is gibberish', () => {
      mockIsGibberish.mockReturnValue(true)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              inputValue="aaabbbccc"
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      expect(
        screen.getByText('Please enter valid content to enable Check Coverage')
      ).toBeInTheDocument()
    })

    it('should not show help text when input is valid', () => {
      mockIsGibberish.mockReturnValue(false)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              inputValue="This is valid content"
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      expect(
        screen.queryByText(
          'Please enter valid content to enable Check Coverage'
        )
      ).not.toBeInTheDocument()
    })
  })

  describe('Input Value Changes', () => {
    beforeEach(() => {
      mockIsGibberish.mockReturnValue(false)
    })

    it('should reset coverage state when inputValue changes', async () => {
      const mockResponse = {
        required_suggestions: [],
        completed_suggestions: [
          {
            text: 'Describe the main purpose of the system',
            rationale: 'Completed',
          },
        ],
        interaction_id: null,
      }

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      const { rerender } = render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      fireEvent.click(screen.getByText('Check Coverage'))

      await waitFor(() => {
        expect(
          screen.getByText(
            'All the suggestions are covered in the input field!'
          )
        ).toBeInTheDocument()
      })

      // Change input value
      rerender(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              inputValue="New input text that is different"
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      await waitFor(() => {
        expect(
          screen.queryByText(
            'All the suggestions are covered in the input field!'
          )
        ).not.toBeInTheDocument()
      })
    })

    it('should re-enable button when input changes from gibberish to valid', () => {
      mockIsGibberish.mockReturnValue(true)

      const { rerender } = render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} inputValue="123!@#" />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      const checkButton = screen.getByRole('button', {
        name: /Check Coverage/i,
      })
      expect(checkButton).toBeDisabled()

      // Change to valid input
      mockIsGibberish.mockReturnValue(false)
      rerender(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage
              {...defaultProps}
              inputValue="Valid content here that is sufficient"
            />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      expect(checkButton).not.toBeDisabled()
    })
  })

  describe('Score Calculation', () => {
    beforeEach(() => {
      mockIsGibberish.mockReturnValue(false)
    })

    it('should calculate and store coverage score correctly', async () => {
      const mockResponse = {
        required_suggestions: [
          {
            text: 'Suggestion 1',
            rationale: 'Required',
          },
        ],
        completed_suggestions: [
          {
            text: 'Suggestion 2',
            rationale: 'Completed',
          },
          {
            text: 'Suggestion 3',
            rationale: 'Completed',
          },
        ],
        interaction_id: null,
      }

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      fireEvent.click(screen.getByText('Check Coverage'))

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '✅ Coverage Score Stored:',
          expect.objectContaining({
            questionId: 'q1',
            completedCount: 2,
            totalCount: 3,
            score: 0.67,
          })
        )
      })

      consoleWarnSpy.mockRestore()
    })

    it('should use minimum score of 0.01 when score is 0', async () => {
      const mockResponse = {
        required_suggestions: [
          {
            text: 'Suggestion 1',
            rationale: 'Required',
          },
        ],
        completed_suggestions: [],
        interaction_id: null,
      }

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      vi.mocked(
        suggestionsApiService.checkSuggestionsCoverage
      ).mockResolvedValue(mockResponse)

      render(
        <LdsToastProvider>
          <AIFeaturesProvider>
            <SuggestionsCheckCoverage {...defaultProps} />
          </AIFeaturesProvider>
        </LdsToastProvider>
      )

      fireEvent.click(screen.getByText('Check Coverage'))

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '✅ Coverage Score Stored:',
          expect.objectContaining({
            score: 0.01,
          })
        )
      })

      consoleWarnSpy.mockRestore()
    })
  })
})

describe('Additional Edge Cases', () => {
  beforeEach(() => {
    mockIsGibberish.mockReturnValue(false)
  })

  const defaultProps = {
    questionId: 'q1',
    inputValue: 'Sample input text that is long enough to pass validation',
    suggestionsData: {
      form_type: 'test_form',
      data: [
        {
          question_id: 'q1',
          suggestions: ['Test suggestion'],
        },
      ],
    },
    submissionId: 'submission-123',
    loading: false,
    error: null,
    onInteractionIdUpdate: vi.fn(),
  }

  it('should not call API when questionId is missing', async () => {
    render(
      <LdsToastProvider>
        <AIFeaturesProvider>
          <SuggestionsCheckCoverage {...defaultProps} questionId={undefined} />
        </AIFeaturesProvider>
      </LdsToastProvider>
    )

    const checkButton = screen.getByText('Check Coverage')
    fireEvent.click(checkButton)

    expect(
      suggestionsApiService.checkSuggestionsCoverage
    ).not.toHaveBeenCalled()
  })

  it('should not call API when submissionId is missing', async () => {
    render(
      <LdsToastProvider>
        <AIFeaturesProvider>
          <SuggestionsCheckCoverage
            {...defaultProps}
            submissionId={undefined}
          />
        </AIFeaturesProvider>
      </LdsToastProvider>
    )

    const checkButton = screen.getByText('Check Coverage')
    fireEvent.click(checkButton)

    expect(
      suggestionsApiService.checkSuggestionsCoverage
    ).not.toHaveBeenCalled()
  })

  it('should handle zero score calculation correctly', async () => {
    const mockResponse = {
      required_suggestions: [
        {
          text: 'Suggestion 1',
          rationale: 'Required',
        },
      ],
      completed_suggestions: [],
      interaction_id: null,
    }

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {})

    vi.mocked(suggestionsApiService.checkSuggestionsCoverage).mockResolvedValue(
      mockResponse
    )

    render(
      <LdsToastProvider>
        <AIFeaturesProvider>
          <SuggestionsCheckCoverage {...defaultProps} />
        </AIFeaturesProvider>
      </LdsToastProvider>
    )

    fireEvent.click(screen.getByText('Check Coverage'))

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '✅ Coverage Score Stored:',
        expect.objectContaining({
          score: 0.01,
        })
      )
    })

    consoleWarnSpy.mockRestore()
  })
})
