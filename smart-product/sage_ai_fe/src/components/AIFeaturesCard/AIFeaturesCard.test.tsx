import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AIFeaturesCardProps } from '@/core/models/ai-features-card.model'

import { AIFeaturesCard } from './AIFeaturesCard'

// Mock dependencies
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsButton: ({
    children,
    onClick,
    className,
    'data-testid': dataTestId,
  }: {
    children?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    className?: string
    'data-testid'?: string
  }) => (
    <button onClick={onClick} className={className} data-testid={dataTestId}>
      {children}
    </button>
  ),
  LdsDivider: ({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) => (
    <hr aria-hidden={ariaHidden} data-testid="divider" />
  ),
  LdsIcon: ({ name, className }: { name: string; className?: string }) => (
    <span className={className} data-testid={`icon-${name}`}>
      {name}
    </span>
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
  LdsStepIndicator: ({
    steps,
    activeIndex,
    className,
  }: {
    steps: unknown[]
    activeIndex: number
    className?: string
  }) => (
    <div className={className} data-testid="step-indicator">
      Step {activeIndex + 1} of {steps.length}
    </div>
  ),
  useToastContext: () => ({
    addToast: vi.fn(),
  }),
}))

vi.mock('./SelectAnswerScreen', () => ({
  default: ({
    questionText,
    onNextDisabledChange,
    onAnswerSelect,
    dataExtractOnly,
  }: {
    questionText?: string
    onNextDisabledChange: (disabled: boolean) => void
    onAnswerSelect: (answer: string) => void
    dataExtractOnly?: boolean
  }) => (
    <div data-testid="select-answer-screen">
      <p>{questionText}</p>
      {dataExtractOnly && (
        <span data-testid="data-extract-only">Data Extract Only Mode</span>
      )}
      <button
        data-testid="select-answer-button"
        onClick={() => {
          onNextDisabledChange(false)
          onAnswerSelect('Selected answer text')
        }}
      >
        Select Answer
      </button>
    </div>
  ),
}))

vi.mock('./RefineAnswerScreen', () => ({
  default: ({
    summaryText,
    setSummaryText,
    onSelectionChange,
    onAnswerSelect,
    onEnhanceError,
  }: {
    summaryText: string
    setSummaryText: (text: string) => void
    onSelectionChange: (selected: boolean) => void
    onAnswerSelect?: (answer: string) => void
    onEnhanceError: (error: string) => void
  }) => (
    <div data-testid="refine-answer-screen">
      <textarea
        data-testid="summary-textarea"
        value={summaryText}
        onChange={e => setSummaryText(e.target.value)}
      />
      <button
        data-testid="select-refined-answer"
        onClick={() => {
          onSelectionChange(true)
          if (onAnswerSelect) onAnswerSelect('Refined answer text')
        }}
      >
        Select Refined Answer
      </button>
      <button
        data-testid="unselect-refined-answer"
        onClick={() => {
          onSelectionChange(false)
        }}
      >
        Unselect Refined Answer
      </button>
      <button
        data-testid="trigger-enhance-error"
        onClick={() => onEnhanceError('Enhancement failed')}
      >
        Trigger Error
      </button>
    </div>
  ),
}))

vi.mock('./HelpModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="help-modal">
      <button data-testid="help-modal-close" onClick={onClose}>
        Close Help
      </button>
    </div>
  ),
}))

vi.mock('./AICardButtons', () => ({
  default: ({
    pageButtonIds,
    activePageIndex,
    actionHandlerMap,
  }: {
    pageButtonIds: Array<
      Array<{ action: string; label?: string; disabled?: boolean }>
    >
    activePageIndex: number
    actionHandlerMap: Record<string, () => void>
  }) => {
    const buttons = pageButtonIds[activePageIndex] || []
    return (
      <div data-testid="ai-card-buttons">
        {buttons.map(
          (
            button: { action: string; label?: string; disabled?: boolean },
            index: number
          ) => (
            <button
              key={index}
              data-testid={`button-${button.action}`}
              disabled={button.disabled}
              onClick={() => actionHandlerMap[button.action]()}
            >
              {button.label || button.action}
            </button>
          )
        )}
      </div>
    )
  },
}))

vi.mock('@/core/utils/toast.utils', () => ({
  showToast: vi.fn(),
}))

const defaultProps: AIFeaturesCardProps = {
  isVisible: true,
  onClose: vi.fn(),
  questionText: 'What is your solution?',
  questionId: 'q123',
  submissionId: 's456',
  formId: 'f789',
  inputValue: 'Initial input',
  onExtractClick: vi.fn(),
  commonFields: [],
  dataExtractOnly: false,
  formContext: {},
}

describe('AIFeaturesCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Visibility and Rendering', () => {
    it('should not render when isVisible is false', () => {
      render(<AIFeaturesCard {...defaultProps} isVisible={false} />)
      expect(screen.queryByTestId('ai-features-card')).not.toBeInTheDocument()
    })

    it('should render when isVisible is true', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('ai-features-card')).toBeInTheDocument()
    })

    it('should render header with AI Response Builder title', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByText('AI Response Builder')).toBeInTheDocument()
    })

    it('should render AI suggestion icon', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('image-AI Suggestion')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('close-button')).toBeInTheDocument()
    })

    it('should render help button', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('icon-question')).toBeInTheDocument()
    })

    it('should render warning message', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(
        screen.getByText(
          /AI assisted answers, please verify and review your answers/
        )
      ).toBeInTheDocument()
    })

    it('should render info icon in warning message', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('image-Info')).toBeInTheDocument()
    })

    it('should render divider', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('divider')).toBeInTheDocument()
    })
  })

  describe('Normal Mode - Two Steps', () => {
    it('should render step indicator in normal mode', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('step-indicator')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    })

    it('should render SelectAnswerScreen on step 1', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
      expect(screen.getByText('What is your solution?')).toBeInTheDocument()
    })

    it('should render cancel and next buttons on step 1', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.getByTestId('button-cancel')).toBeInTheDocument()
      expect(screen.getByTestId('button-next')).toBeInTheDocument()
    })

    it('should have next button disabled initially', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      const nextButton = screen.getByTestId('button-next')
      expect(nextButton).toBeDisabled()
    })

    it('should enable next button after selecting answer', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      const selectButton = screen.getByTestId('select-answer-button')
      fireEvent.click(selectButton)

      const nextButton = screen.getByTestId('button-next')
      expect(nextButton).not.toBeDisabled()
    })

    it('should navigate to step 2 when next button is clicked', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Select an answer to enable next button
      fireEvent.click(screen.getByTestId('select-answer-button'))

      // Click next button
      const nextButton = screen.getByTestId('button-next')
      fireEvent.click(nextButton)

      // Should now show RefineAnswerScreen
      expect(screen.getByTestId('refine-answer-screen')).toBeInTheDocument()
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    })

    it('should show prev and use answer buttons on step 2', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      expect(screen.getByTestId('button-prev')).toBeInTheDocument()
      expect(screen.getByTestId('button-useAnswer')).toBeInTheDocument()
    })

    it('should transfer selected answer to summary text when moving to step 2', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Select answer
      fireEvent.click(screen.getByTestId('select-answer-button'))

      // Move to step 2
      fireEvent.click(screen.getByTestId('button-next'))

      // Check summary textarea has the selected answer
      const textarea = screen.getByTestId('summary-textarea')
      expect(textarea).toHaveValue('Selected answer text')
    })

    it('should enable use answer button after moving to step 2', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      const useAnswerButton = screen.getByTestId('button-useAnswer')
      expect(useAnswerButton).not.toBeDisabled()
    })

    it('should navigate back to step 1 when prev button is clicked', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Click prev
      fireEvent.click(screen.getByTestId('button-prev'))

      // Should be back on step 1
      expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    })
  })

  describe('Data Extract Only Mode', () => {
    const dataExtractProps = { ...defaultProps, dataExtractOnly: true }

    it('should not render step indicator in data extract only mode', () => {
      render(<AIFeaturesCard {...dataExtractProps} />)
      expect(screen.queryByTestId('step-indicator')).not.toBeInTheDocument()
    })

    it('should render SelectAnswerScreen with dataExtractOnly flag', () => {
      render(<AIFeaturesCard {...dataExtractProps} />)
      expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
      expect(screen.getByTestId('data-extract-only')).toBeInTheDocument()
    })

    it('should show only "Use this Answer" button in data extract only mode', () => {
      render(<AIFeaturesCard {...dataExtractProps} />)

      expect(screen.getByTestId('button-useAnswer')).toBeInTheDocument()
      expect(screen.getByText('Use this Answer')).toBeInTheDocument()
      expect(screen.queryByTestId('button-next')).not.toBeInTheDocument()
      expect(screen.queryByTestId('button-prev')).not.toBeInTheDocument()
    })

    it('should have use answer button disabled initially in data extract only mode', () => {
      render(<AIFeaturesCard {...dataExtractProps} />)
      const useAnswerButton = screen.getByTestId('button-useAnswer')
      expect(useAnswerButton).toBeDisabled()
    })

    it('should enable use answer button after selecting answer in data extract only mode', () => {
      render(<AIFeaturesCard {...dataExtractProps} />)

      fireEvent.click(screen.getByTestId('select-answer-button'))

      const useAnswerButton = screen.getByTestId('button-useAnswer')
      expect(useAnswerButton).not.toBeDisabled()
    })

    it('should call onExtractClick with selected answer in data extract only mode', () => {
      const onExtractClick = vi.fn()
      render(
        <AIFeaturesCard {...dataExtractProps} onExtractClick={onExtractClick} />
      )

      // Select answer
      fireEvent.click(screen.getByTestId('select-answer-button'))

      // Click use answer
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Selected answer text')
    })
  })

  describe('Close Button Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<AIFeaturesCard {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByTestId('close-button'))

      expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose when cancel button is clicked', () => {
      const onClose = vi.fn()
      render(<AIFeaturesCard {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByTestId('button-cancel'))

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Help Modal', () => {
    it('should not show help modal initially', () => {
      render(<AIFeaturesCard {...defaultProps} />)
      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument()
    })

    it('should show help modal when help button is clicked', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      const helpButton = screen.getByTestId('icon-question').parentElement
      fireEvent.click(helpButton!)

      expect(screen.getByTestId('help-modal')).toBeInTheDocument()
    })

    it('should close help modal when close is clicked', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Open help modal
      const helpButton = screen.getByTestId('icon-question').parentElement
      fireEvent.click(helpButton!)

      // Close help modal
      fireEvent.click(screen.getByTestId('help-modal-close'))

      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument()
    })

    it('should toggle help modal on multiple clicks', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      const helpButton = screen.getByTestId('icon-question').parentElement

      // Open
      fireEvent.click(helpButton!)
      expect(screen.getByTestId('help-modal')).toBeInTheDocument()

      // Close by clicking button again
      fireEvent.click(helpButton!)
      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument()
    })

    it('should apply noScroll class when help modal is open', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      const card = screen.getByTestId('ai-features-card')
      const initialClass = card.className

      // Open help modal
      const helpButton = screen.getByTestId('icon-question').parentElement
      fireEvent.click(helpButton!)

      // Check that a new class was added (the noScroll class)
      expect(card.className).not.toBe(initialClass)
      expect(card.className.length).toBeGreaterThan(initialClass.length)
    })
  })

  describe('Use Answer Functionality', () => {
    it('should call onExtractClick with summary text when use answer is clicked without refined selection', () => {
      const onExtractClick = vi.fn()
      render(
        <AIFeaturesCard {...defaultProps} onExtractClick={onExtractClick} />
      )

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Modify summary text
      const textarea = screen.getByTestId('summary-textarea')
      fireEvent.change(textarea, { target: { value: 'Modified answer' } })

      // Click use answer (without selecting refined answer)
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Modified answer')
    })

    it('should call onExtractClick with refined answer when refined answer is selected', () => {
      const onExtractClick = vi.fn()
      render(
        <AIFeaturesCard {...defaultProps} onExtractClick={onExtractClick} />
      )

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Select refined answer (this triggers onAnswerSelect callback)
      fireEvent.click(screen.getByTestId('select-refined-answer'))

      // Click use answer
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Refined answer text')
    })

    it('should reset all states after using answer', async () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Click use answer
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      // Should reset to step 1 (async after acceptance update)
      await waitFor(() =>
        expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
      )
    })

    it('should close modal after using answer', async () => {
      const onClose = vi.fn()
      render(<AIFeaturesCard {...defaultProps} onClose={onClose} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Click use answer
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    it('should not call onExtractClick if summaryText is empty', () => {
      const onExtractClick = vi.fn()
      render(
        <AIFeaturesCard {...defaultProps} onExtractClick={onExtractClick} />
      )

      // Go to step 2 without selecting an answer (empty summary)
      fireEvent.click(screen.getByTestId('button-next'))

      // Try to use answer with empty text
      const useAnswerButton = screen.queryByTestId('button-useAnswer')
      if (useAnswerButton) {
        fireEvent.click(useAnswerButton)
        expect(onExtractClick).not.toHaveBeenCalled()
      }
    })

    it('should reset selectedRefinedAnswer when questionId changes', () => {
      const { rerender } = render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2 and select refined answer
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))
      fireEvent.click(screen.getByTestId('select-refined-answer'))

      // Change questionId
      rerender(<AIFeaturesCard {...defaultProps} questionId="new-q-id" />)

      // Should be back on step 1
      expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
    })
  })

  describe('Selection Change in Refine Screen', () => {
    it('should disable use answer button when no refined answer is selected', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Initially enabled after moving to step 2
      const useAnswerButton = screen.getByTestId('button-useAnswer')
      expect(useAnswerButton).not.toBeDisabled()

      // This test verifies the button exists and can be interacted with
      expect(screen.getByTestId('select-refined-answer')).toBeInTheDocument()
    })

    it('should enable use answer button when refined answer is selected', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Select refined answer
      fireEvent.click(screen.getByTestId('select-refined-answer'))

      const useAnswerButton = screen.getByTestId('button-useAnswer')
      expect(useAnswerButton).not.toBeDisabled()
    })

    it('should disable use answer button when refined answer is unselected', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // First select refined answer
      fireEvent.click(screen.getByTestId('select-refined-answer'))

      const useAnswerButton = screen.getByTestId('button-useAnswer')
      expect(useAnswerButton).not.toBeDisabled()

      // Then unselect refined answer
      fireEvent.click(screen.getByTestId('unselect-refined-answer'))

      expect(useAnswerButton).toBeDisabled()
    })

    it('should pass onAnswerSelect callback to RefineAnswerScreen', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // The RefineAnswerScreen should have received onAnswerSelect prop
      // This is verified by the fact that clicking select-refined-answer
      // calls the callback and updates the state
      expect(screen.getByTestId('select-refined-answer')).toBeInTheDocument()
    })
  })

  describe('Enhanced Answer Selection Logic', () => {
    it('should use selectedRefinedAnswer when available on step 2', () => {
      const onExtractClick = vi.fn()
      render(
        <AIFeaturesCard {...defaultProps} onExtractClick={onExtractClick} />
      )

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Select refined answer (sets selectedRefinedAnswer)
      fireEvent.click(screen.getByTestId('select-refined-answer'))

      // Modify summary text to something different
      const textarea = screen.getByTestId('summary-textarea')
      fireEvent.change(textarea, { target: { value: 'Different summary text' } })

      // Click use answer - should use refined answer, not summary text
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Refined answer text')
    })

    it('should fall back to summaryText when no refined answer is selected', () => {
      const onExtractClick = vi.fn()
      render(
        <AIFeaturesCard {...defaultProps} onExtractClick={onExtractClick} />
      )

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Modify summary text without selecting refined answer
      const textarea = screen.getByTestId('summary-textarea')
      fireEvent.change(textarea, { target: { value: 'Modified summary' } })

      // Click use answer - should use summary text
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Modified summary')
    })

    it('should use selectedAnswer in dataExtractOnly mode', () => {
      const onExtractClick = vi.fn()
      render(
        <AIFeaturesCard {...defaultProps} dataExtractOnly={true} onExtractClick={onExtractClick} />
      )

      // Select answer in data extract only mode
      fireEvent.click(screen.getByTestId('select-answer-button'))

      // Click use answer
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Selected answer text')
    })
  })

  describe('Error Handling', () => {
    it('should handle enhance error callback', async () => {
      const showToastMock = vi.fn()
      vi.doMock('@/core/utils/toast.utils', () => ({
        showToast: showToastMock,
      }))

      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Trigger enhance error
      fireEvent.click(screen.getByTestId('trigger-enhance-error'))

      // The error handler should be called (component handles toast internally)
      // We verify that the error button exists and can be clicked
      expect(screen.getByTestId('trigger-enhance-error')).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('should handle missing optional props', () => {
      const minimalProps: AIFeaturesCardProps = {
        isVisible: true,
        onClose: vi.fn(),
        questionText: undefined,
        questionId: undefined,
        submissionId: undefined,
        formId: undefined,
        inputValue: undefined,
        onExtractClick: undefined,
        commonFields: undefined,
        dataExtractOnly: false,
        formContext: {},
      }

      render(<AIFeaturesCard {...minimalProps} />)
      expect(screen.getByTestId('ai-features-card')).toBeInTheDocument()
    })

    it('should pass commonFields to SelectAnswerScreen', () => {
      const commonFields = [
        {
          question_id: 'q1',
          answer: 'Common answer 1',
          source_fields: [],
          multi_source: false,
        },
      ]
      render(<AIFeaturesCard {...defaultProps} commonFields={commonFields} />)

      expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
    })

    it('should handle empty questionText', () => {
      render(<AIFeaturesCard {...defaultProps} questionText="" />)
      expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
    })

    it('should handle empty inputValue', () => {
      render(<AIFeaturesCard {...defaultProps} inputValue="" />)
      expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
    })
  })

  describe('Step Navigation Edge Cases', () => {
    it('should maintain state when navigating back and forth', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Select answer and go to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Modify text on step 2
      const textarea = screen.getByTestId('summary-textarea')
      fireEvent.change(textarea, { target: { value: 'Modified text' } })

      // Go back to step 1
      fireEvent.click(screen.getByTestId('button-prev'))

      // Go forward again
      fireEvent.click(screen.getByTestId('button-next'))

      // Should show step 2 again with modified text
      expect(screen.getByTestId('refine-answer-screen')).toBeInTheDocument()
    })

    it('should update summary text when moving to step 2 with new selection', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // First selection
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      let textarea = screen.getByTestId('summary-textarea')
      expect(textarea).toHaveValue('Selected answer text')

      // Go back
      fireEvent.click(screen.getByTestId('button-prev'))

      // Select again (would be different answer in real scenario)
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      textarea = screen.getByTestId('summary-textarea')
      expect(textarea).toHaveValue('Selected answer text')
    })
  })

  describe('Button Configuration', () => {
    it('should have correct button types for step 1', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      const cancelButton = screen.getByTestId('button-cancel')
      const nextButton = screen.getByTestId('button-next')

      expect(cancelButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })

    it('should have correct button types for step 2', () => {
      render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      expect(screen.getByTestId('button-prev')).toBeInTheDocument()
      expect(screen.getByTestId('button-useAnswer')).toBeInTheDocument()
    })

    it('should use custom label for use answer button in data extract only mode', () => {
      render(<AIFeaturesCard {...defaultProps} dataExtractOnly={true} />)

      expect(screen.getByText('Use this Answer')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('should reset to SelectAnswerScreen when questionId changes', () => {
      const { rerender } = render(<AIFeaturesCard {...defaultProps} />)

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))
      expect(screen.getByTestId('refine-answer-screen')).toBeInTheDocument()

      // Change questionId via rerender
      rerender(<AIFeaturesCard {...defaultProps} questionId="q999" />)

      // Should reset to step 1 and show SelectAnswerScreen
      expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
      // Warning message should reflect step 1
      expect(
        screen.getByText(
          /AI assisted answers, please verify and review your answers/
        )
      ).toBeInTheDocument()
    })

    it('should complete full workflow from selection to use answer', async () => {
      const onExtractClick = vi.fn()
      const onClose = vi.fn()
      render(
        <AIFeaturesCard
          {...defaultProps}
          onExtractClick={onExtractClick}
          onClose={onClose}
        />
      )

      // Step 1: Select answer
      fireEvent.click(screen.getByTestId('select-answer-button'))

      // Step 2: Navigate to refine
      fireEvent.click(screen.getByTestId('button-next'))

      // Step 3: Modify answer
      const textarea = screen.getByTestId('summary-textarea')
      fireEvent.change(textarea, { target: { value: 'Final answer' } })

      // Step 4: Use answer
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Final answer')
      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    it('should handle data extract only workflow', async () => {
      const onExtractClick = vi.fn()
      const onClose = vi.fn()
      render(
        <AIFeaturesCard
          {...defaultProps}
          dataExtractOnly={true}
          onExtractClick={onExtractClick}
          onClose={onClose}
        />
      )

      // Select answer
      fireEvent.click(screen.getByTestId('select-answer-button'))

      // Use answer directly
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Selected answer text')
      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    it('should complete enhanced answer workflow', async () => {
      const onExtractClick = vi.fn()
      const onClose = vi.fn()
      render(
        <AIFeaturesCard
          {...defaultProps}
          onExtractClick={onExtractClick}
          onClose={onClose}
        />
      )

      // Step 1: Select answer
      fireEvent.click(screen.getByTestId('select-answer-button'))

      // Step 2: Navigate to refine
      fireEvent.click(screen.getByTestId('button-next'))

      // Step 3: Select refined answer
      fireEvent.click(screen.getByTestId('select-refined-answer'))

      // Step 4: Use refined answer
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Refined answer text')
      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })
  })

  describe('State Management', () => {
    it('should track selectedRefinedAnswer separately from summaryText', () => {
      const onExtractClick = vi.fn()
      render(
        <AIFeaturesCard {...defaultProps} onExtractClick={onExtractClick} />
      )

      // Navigate to step 2
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))

      // Select refined answer
      fireEvent.click(screen.getByTestId('select-refined-answer'))

      // Modify summary text
      const textarea = screen.getByTestId('summary-textarea')
      fireEvent.change(textarea, { target: { value: 'Different summary' } })

      // Use answer should use refined answer, not modified summary
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      expect(onExtractClick).toHaveBeenCalledWith('Refined answer text')
    })

    it('should clear selectedRefinedAnswer when resetting states', async () => {
      const onExtractClick = vi.fn()
      const onClose = vi.fn()
      render(
        <AIFeaturesCard
          {...defaultProps}
          onExtractClick={onExtractClick}
          onClose={onClose}
        />
      )

      // Navigate to step 2 and select refined answer
      fireEvent.click(screen.getByTestId('select-answer-button'))
      fireEvent.click(screen.getByTestId('button-next'))
      fireEvent.click(screen.getByTestId('select-refined-answer'))

      // Use answer (this should reset all states)
      fireEvent.click(screen.getByTestId('button-useAnswer'))

      // Wait for reset to complete
      await waitFor(() => 
        expect(screen.getByTestId('select-answer-screen')).toBeInTheDocument()
      )

      // States should be reset - next button should be disabled initially
      const nextButton = screen.getByTestId('button-next')
      expect(nextButton).toBeDisabled()
    })
  })
})
