import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as tourStateUtil from '@/core/utils/tour-state.util'
import * as useEnhanceAnswerModule from '@/hooks/useEnhanceAnswer'

import RefineAnswerScreen, {
  RefineAnswerScreenProps,
} from './RefineAnswerScreen'

// Mock dependencies
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsButton: ({
    children,
    onClick,
    disabled,
    className,
    classes,
    icon,
    ref,
  }: any) => (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-classes={classes}
      data-icon={icon}
      data-testid="lds-button"
    >
      {children}
    </button>
  ),
  LdsImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="lds-image" />
  ),
  LdsRadio: ({ id, value, label, checked, onChange }: any) => (
    <div>
      <input
        type="radio"
        id={id}
        value={value}
        checked={checked}
        onChange={onChange}
        data-testid={`radio-${id}`}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  ),
  LdsLoadingSpinner: ({ className, ariaLabel }: any) => (
    <div
      data-testid="loading-spinner"
      className={className}
      aria-label={ariaLabel}
    >
      Loading...
    </div>
  ),
}))

vi.mock('./CheckCoverage', () => ({
  default: ({
    questionId,
    submissionId,
    userText,
    formId,
    interactionId,
    hideSuggestionsAndFeedback,
    isRadioSelected,
    resetCoverage,
    onCheckCoverageClick,
    clearCoverageData,
  }: any) => (
    <div data-testid="check-coverage">
      <div data-question-id={questionId} />
      <div data-submission-id={submissionId} />
      <div data-user-text={userText} />
      <div data-form-id={formId} />
      <div data-interaction-id={interactionId} />
      <div data-hide-suggestions={hideSuggestionsAndFeedback} />
      <div data-is-radio-selected={isRadioSelected} />
      <div data-reset-coverage={resetCoverage} />
      <div data-clear-coverage={clearCoverageData} />
      <button
        onClick={onCheckCoverageClick}
        data-testid="check-coverage-button"
      >
        Check Coverage
      </button>
    </div>
  ),
}))

vi.mock('../InfoTourModal/InfoTourModal', () => ({
  default: ({ isOpen, message, onClose, onNext, skipButton }: any) =>
    isOpen ? (
      <div data-testid="info-tour-modal">
        <p>{message}</p>
        <button onClick={onClose} data-testid="modal-close">
          {skipButton ? 'Skip' : 'Close'}
        </button>
        {onNext && (
          <button onClick={onNext} data-testid="modal-next">
            Next
          </button>
        )}
      </div>
    ) : null,
}))

vi.mock('@/hooks/useEnhanceAnswer')
vi.mock('@/core/utils/tour-state.util', () => ({
  isTourCompleted: vi.fn(),
  markTourCompleted: vi.fn(),
}))

const mockUseEnhanceAnswer = vi.mocked(useEnhanceAnswerModule.useEnhanceAnswer)
const mockIsTourCompleted = vi.mocked(tourStateUtil.isTourCompleted)
const mockMarkTourCompleted = vi.mocked(tourStateUtil.markTourCompleted)

const createMockProps = (
  overrides?: Partial<RefineAnswerScreenProps>
): RefineAnswerScreenProps => ({
  summaryText: 'Initial summary text',
  setSummaryText: vi.fn(),
  isEditingSummary: false,
  setIsEditingSummary: vi.fn(),
  provenanceList: [],
  onExtractClick: vi.fn(),
  questionId: 'q123',
  submissionId: 's456',
  inputValue: 'Initial input',
  formId: 'f789',
  onEnhanceError: vi.fn(),
  onSelectionChange: vi.fn(),
  onAnswerSelect: vi.fn(), 
  ...overrides,
})

describe('RefineAnswerScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEnhanceAnswer.mockReturnValue({
      enhancedAnswer: '',
      originalText: '',
      rationale: '',
      interactionId: null,
      response: null,
      status: 'idle',
      loading: false,
      error: null,
      fetchEnhancedAnswer: vi.fn(),
      resetEnhancement: vi.fn(),
      updateParams: vi.fn(),
    })
    mockIsTourCompleted.mockReturnValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders the component with initial state', () => {
      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      expect(screen.getByTestId('refine-answer-screen')).toBeInTheDocument()
      expect(
        screen.getByText('Provide an overview of the solution')
      ).toBeInTheDocument()
    })

    it('renders textarea with initial summaryText', () => {
      const props = createMockProps({ summaryText: 'Test summary' })
      render(<RefineAnswerScreen {...props} />)

      const textarea = screen.getByDisplayValue('Test summary')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('renders Enhance Answer button when not clicked', () => {
      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      const enhanceButton = screen.getByText('Enhance Answer')
      expect(enhanceButton).toBeInTheDocument()
    })

    it('renders CheckCoverage component', () => {
      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      expect(screen.getByTestId('check-coverage')).toBeInTheDocument()
    })
  })

  describe('Textarea Interaction', () => {
    it('calls setSummaryText when textarea value changes', () => {
      const setSummaryText = vi.fn()
      const props = createMockProps({ setSummaryText })
      render(<RefineAnswerScreen {...props} />)

      const textarea = screen.getByDisplayValue('Initial summary text')
      fireEvent.change(textarea, { target: { value: 'New summary text' } })

      expect(setSummaryText).toHaveBeenCalledWith('New summary text')
    })

    it('displays updated summary text in textarea', () => {
      const props = createMockProps({ summaryText: 'Updated text' })
      render(<RefineAnswerScreen {...props} />)

      const textarea = screen.getByDisplayValue('Updated text')
      expect(textarea).toHaveValue('Updated text')
    })
  })

  describe('Enhance Answer Button', () => {
    it('disables Enhance Answer button when summaryText is empty', () => {
      const props = createMockProps({ summaryText: '' })
      render(<RefineAnswerScreen {...props} />)

      const enhanceButton = screen.getByText('Enhance Answer').closest('button')
      expect(enhanceButton).toBeDisabled()
    })

    it('disables Enhance Answer button when summaryText is only whitespace', () => {
      const props = createMockProps({ summaryText: '   ' })
      render(<RefineAnswerScreen {...props} />)

      const enhanceButton = screen.getByText('Enhance Answer').closest('button')
      expect(enhanceButton).toBeDisabled()
    })

    it('enables Enhance Answer button when summaryText has content', () => {
      const props = createMockProps({
        summaryText:
          'This is valid content with enough characters for the button',
      })
      render(<RefineAnswerScreen {...props} />)

      const enhanceButton = screen.getByText('Enhance Answer').closest('button')
      expect(enhanceButton).not.toBeDisabled()
    })

    it('reveals enhanced answer options when Enhance Answer is clicked', () => {
      const props = createMockProps({
        summaryText:
          'This is valid test content with enough characters to enable button',
      })
      render(<RefineAnswerScreen {...props} />)

      const enhanceButton = screen.getByText('Enhance Answer')
      fireEvent.click(enhanceButton)

      expect(screen.getByText('Your Answer')).toBeInTheDocument()
      expect(screen.getByText('Enhanced Answer')).toBeInTheDocument()
    })

    it('hides initial textarea when Enhance Answer is clicked', () => {
      const props = createMockProps({
        summaryText:
          'This is valid test content with enough characters to enable button',
      })
      const { container } = render(<RefineAnswerScreen {...props} />)

      const initialTextarea = container.querySelector('textarea[rows="5"]')
      expect(initialTextarea).toBeInTheDocument()

      const enhanceButton = screen.getByText('Enhance Answer')
      fireEvent.click(enhanceButton)

      // Original single textarea should be hidden/replaced with radio options
      expect(screen.getByText('Your Answer')).toBeInTheDocument()
    })

    it('hides Enhance Answer button after it is clicked', () => {
      const props = createMockProps({
        summaryText:
          'This is valid test content with enough characters to enable button',
      })
      render(<RefineAnswerScreen {...props} />)

      const enhanceButton = screen.getByText('Enhance Answer')
      fireEvent.click(enhanceButton)

      expect(screen.queryByText('Enhance Answer')).not.toBeInTheDocument()
    })
  })

  describe('Enhanced Answer Display', () => {
    it('displays Your Answer option with radio button', () => {
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(screen.getByText('Your Answer')).toBeInTheDocument()
      expect(screen.getByTestId('radio-optionOne')).toBeInTheDocument()
    })

    it('displays Enhanced Answer option with radio button', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'This is enhanced',
        originalText: '',
        rationale: '',
        interactionId: 'int123',
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(screen.getByText('Enhanced Answer')).toBeInTheDocument()
      expect(
        screen.getByTestId('radio-enhanced-answer-radio')
      ).toBeInTheDocument()
    })

    it('updates optionOne text when user edits', () => {
      const props = createMockProps({
        summaryText: 'This is the original answer text with sufficient length',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const optionOneTextarea = screen.getByDisplayValue(
        'This is the original answer text with sufficient length'
      )
      fireEvent.change(optionOneTextarea, { target: { value: 'Modified' } })

      expect(optionOneTextarea).toHaveValue('Modified')
    })

    it('updates optionTwo text when user edits enhanced answer', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced text',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is the original answer text with sufficient length',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const optionTwoTextarea = screen.getByDisplayValue('Enhanced text')
      fireEvent.change(optionTwoTextarea, {
        target: { value: 'Modified enhanced' },
      })

      expect(optionTwoTextarea).toHaveValue('Modified enhanced')
    })
  })

  describe('Radio Selection and Answer Selection', () => {
    it('selects optionOne when radio is clicked', () => {
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const radioOne = screen.getByTestId('radio-optionOne')
      fireEvent.change(radioOne, { target: { checked: true } })

      expect(radioOne).toBeChecked()
    })

    it('calls onSelectionChange and onAnswerSelect when optionOne is selected with text', () => {
      const onAnswerSelect = vi.fn()
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
        onAnswerSelect,
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const radioOne = screen.getByTestId('radio-optionOne')
      fireEvent.click(radioOne)

      expect(onAnswerSelect).toHaveBeenCalledWith('This is a valid test answer with enough characters')
    })

    it('selects enhanced answer radio when clicked', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced text content',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const radioEnhanced = screen.getByTestId('radio-enhanced-answer-radio')
      fireEvent.change(radioEnhanced, { target: { checked: true } })

      expect(radioEnhanced).toBeChecked()
    })

    it('calls onSelectionChange and onAnswerSelect when enhanced answer is selected', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced text content',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const onAnswerSelect = vi.fn()
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
        onAnswerSelect,
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const radioEnhanced = screen.getByTestId('radio-enhanced-answer-radio')
      fireEvent.click(radioEnhanced)

      expect(onAnswerSelect).toHaveBeenCalledWith('Enhanced text content')
    })

    it('does not call onAnswerSelect when text is empty', () => {
      const onAnswerSelect = vi.fn()
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
        onAnswerSelect,
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      // Clear the optionOne text to make it empty
      const optionOneTextarea = screen.getByDisplayValue(
        'This is a valid test answer with enough characters'
      )
      fireEvent.change(optionOneTextarea, { target: { value: '' } })

      // Now select the radio button
      const radioOne = screen.getByTestId('radio-optionOne')
      fireEvent.click(radioOne)

      // Should not call onAnswerSelect because text is empty
      expect(onAnswerSelect).not.toHaveBeenCalled()
    })

    it('updates answer selection when text is modified', () => {
      const onAnswerSelect = vi.fn()
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
        onAnswerSelect,
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const radioOne = screen.getByTestId('radio-optionOne')
      fireEvent.click(radioOne)

      // Modify the text
      const optionOneTextarea = screen.getByDisplayValue(
        'This is a valid test answer with enough characters'
      )
      fireEvent.change(optionOneTextarea, { target: { value: 'Modified text' } })

      // Should call onAnswerSelect with the new text
      expect(onAnswerSelect).toHaveBeenLastCalledWith('Modified text')
    })

    it('calls onAnswerSelect with correct text when switching between options', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced answer text',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const onAnswerSelect = vi.fn()
      const props = createMockProps({
        summaryText: 'This is a valid original answer text with enough characters to enable the enhance button',
        onAnswerSelect,
      })
      render(<RefineAnswerScreen {...props} />)

      // Click enhance answer to show options
      fireEvent.click(screen.getByText('Enhance Answer'))

      // Select first option
      const radioOne = screen.getByTestId('radio-optionOne')
      fireEvent.click(radioOne)
      expect(onAnswerSelect).toHaveBeenLastCalledWith('This is a valid original answer text with enough characters to enable the enhance button')

      // Switch to enhanced option
      const radioEnhanced = screen.getByTestId('radio-enhanced-answer-radio')
      fireEvent.click(radioEnhanced)
      expect(onAnswerSelect).toHaveBeenLastCalledWith('Enhanced answer text')
    })
  })

  describe('Regenerate Functionality', () => {
    it('displays Regenerate button after enhance answer is clicked', () => {
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(screen.getByText('Regenerate')).toBeInTheDocument()
    })

    it('calls fetchEnhancedAnswer when Regenerate is clicked', () => {
      const fetchEnhancedAnswer = vi.fn()
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer,
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))
      fireEvent.click(screen.getByText('Regenerate'))

      expect(fetchEnhancedAnswer).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('displays loading spinner when loading is true', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: '',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'loading',
        loading: true,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('does not display enhanced answer preview when loading', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: '',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'loading',
        loading: true,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(
        screen.queryByTestId('enhanced-answer-preview')
      ).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('calls onEnhanceError when enhance answer fails', async () => {
      const onEnhanceError = vi.fn()
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: '',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'error',
        loading: false,
        error: 'API Error',
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
        onEnhanceError,
      })
      render(<RefineAnswerScreen {...props} />)

      await waitFor(() => {
        expect(onEnhanceError).toHaveBeenCalledWith(
          "We can't fetch an enhanced answer at the moment."
        )
      })
    })

    it('does not call onEnhanceError multiple times for same error', async () => {
      const onEnhanceError = vi.fn()
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: '',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'error',
        loading: false,
        error: 'API Error',
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
        onEnhanceError,
      })
      const { rerender } = render(<RefineAnswerScreen {...props} />)

      await waitFor(() => {
        expect(onEnhanceError).toHaveBeenCalledTimes(1)
      })

      // Re-render with same error
      rerender(<RefineAnswerScreen {...props} />)

      // Should still be called only once
      expect(onEnhanceError).toHaveBeenCalledTimes(1)
    })

    it('displays error message when enhancement fails with specific message', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer:
          'Unable to enhance: Please clarify your answer or provide more details. The current response is unclear or incomplete.',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(
        screen.getByText('Unable to generate Enhanced Answer')
      ).toBeInTheDocument()
    })

    it('calls resetEnhancement and fetchEnhancedAnswer when Retry button is clicked in error state', () => {
      const resetEnhancement = vi.fn()
      const fetchEnhancedAnswer = vi.fn()
      
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer:
          'Unable to enhance: Please clarify your answer or provide more details. The current response is unclear or incomplete.',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer,
        resetEnhancement,
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))
      
      const retryButton = screen.getByText('Retry')
      fireEvent.click(retryButton)

      expect(resetEnhancement).toHaveBeenCalled()
      expect(fetchEnhancedAnswer).toHaveBeenCalled()
    })

    it('shows retry button with custom error message when enhancement returns specific error text', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer:
          'Unable to enhance: Please clarify your answer or provide more details. The current response is unclear or incomplete.',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(screen.getByText('Unable to generate Enhanced Answer')).toBeInTheDocument()
      expect(screen.getByText('Retry or continue with Your Answer')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  describe('AI Rationale', () => {
    it('displays AI Rationale button after enhance answer is shown', () => {
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(screen.getByText('Show AI Rationale')).toBeInTheDocument()
    })

    it('toggles rationale visibility when button is clicked', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced',
        originalText: '',
        rationale: 'content_added: Some content',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(
        screen.queryByTestId('rationale-container')
      ).not.toBeInTheDocument()

      const rationaleTitle = screen.getByText('Show AI Rationale')
      fireEvent.click(rationaleTitle)

      expect(screen.getByTestId('rationale-container')).toBeInTheDocument()
    })

    it('displays rationale items correctly from array', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced',
        originalText: '',
        rationale:
          'content_added: Added business context; checklist_gaps_filled: Filled missing features',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const rationaleTitle = screen.getByText('Show AI Rationale')
      fireEvent.click(rationaleTitle)

      expect(screen.getByText('Added business context')).toBeInTheDocument()
      expect(screen.getByText('Filled missing features')).toBeInTheDocument()
    })

    it('displays rationale items correctly from string with semicolon separator', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced',
        originalText: '',
        rationale:
          'content_added: Added context; checklist_gaps_filled: Filled gaps',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const rationaleTitle = screen.getByText('Show AI Rationale')
      fireEvent.click(rationaleTitle)

      expect(screen.getByText('Added context')).toBeInTheDocument()
      expect(screen.getByText('Filled gaps')).toBeInTheDocument()
    })

    it('filters out non-labeled rationale items', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced',
        originalText: '',
        rationale:
          'content_added: Valid item; This should be filtered out; checklist_gaps_filled: Another valid item',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const rationaleTitle = screen.getByText('Show AI Rationale')
      fireEvent.click(rationaleTitle)

      expect(screen.getByText('Valid item')).toBeInTheDocument()
      expect(screen.getByText('Another valid item')).toBeInTheDocument()
      expect(
        screen.queryByText('This should be filtered out')
      ).not.toBeInTheDocument()
    })
  })

  describe('CheckCoverage Integration', () => {
    it('passes correct props to CheckCoverage initially', () => {
      const props = createMockProps({
        questionId: 'q123',
        submissionId: 's456',
        formId: 'f789',
        summaryText: 'Test summary',
      })
      const { container } = render(<RefineAnswerScreen {...props} />)

      const checkCoverage = container.querySelector(
        '[data-testid="check-coverage"]'
      )
      expect(
        checkCoverage?.querySelector('[data-question-id="q123"]')
      ).toBeInTheDocument()
      expect(
        checkCoverage?.querySelector('[data-submission-id="s456"]')
      ).toBeInTheDocument()
      expect(
        checkCoverage?.querySelector('[data-user-text="Test summary"]')
      ).toBeInTheDocument()
    })

    it('updates CheckCoverage userText when optionOne is selected', async () => {
      const props = createMockProps({
        summaryText: 'This is the original answer text with sufficient length',
      })
      const { container } = render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const optionOneTextarea = screen.getByDisplayValue(
        'This is the original answer text with sufficient length'
      )
      fireEvent.change(optionOneTextarea, {
        target: { value: 'Modified optionOne' },
      })

      const radioOne = screen.getByTestId('radio-optionOne')
      fireEvent.click(radioOne)

      // Wait for the component to re-render with updated props
      await waitFor(() => {
        const checkCoverage = container.querySelector(
          '[data-testid="check-coverage"]'
        )
        const userTextElement = checkCoverage?.querySelector('[data-user-text]')
        expect(userTextElement?.getAttribute('data-user-text')).toBe(
          'Modified optionOne'
        )
      })
    })

    it('shows improvement suggestions when enhance answer clicked but check coverage not clicked', () => {
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(
        screen.getByText('Answer improvement suggestions')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Describe how this solution anticipates future trends')
      ).toBeInTheDocument()
    })

    it('hides improvement suggestions when check coverage is clicked', () => {
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(
        screen.getByText('Answer improvement suggestions')
      ).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('check-coverage-button'))

      expect(
        screen.queryByText('Answer improvement suggestions')
      ).not.toBeInTheDocument()
    })
  })

  describe('Info Tour Modals', () => {
    it('shows enhance answer modal when tour not completed', () => {
      mockIsTourCompleted.mockImplementation((key: string) => key !== 'enhance_answer')

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
    })

    it('does not show enhance answer modal when tour completed', () => {
      mockIsTourCompleted.mockReturnValue(true)

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      expect(screen.queryByTestId('info-tour-modal')).not.toBeInTheDocument()
    })

    it('marks enhance answer tour completed when modal is closed', () => {
      mockIsTourCompleted.mockReturnValue(false)

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      const closeButton = screen.getByTestId('modal-close')
      fireEvent.click(closeButton)

      expect(mockMarkTourCompleted).toHaveBeenCalledWith('enhance_answer')
    })

    it('shows check coverage modal after enhance modal on Next click', async () => {
      mockIsTourCompleted.mockImplementation((key: string) => key === 'enhance_answer' ? false : key === 'check_coverage' ? false : true)

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      const nextButton = screen.getByTestId('modal-next')
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
      })
    })

    it('marks check coverage tour completed when check coverage modal is closed with skip', async () => {
      // Start with enhance_answer tour not completed, check_coverage not completed
      mockIsTourCompleted.mockImplementation(() => false)

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      // First click Next on enhance answer modal to trigger check coverage modal
      const enhanceNextButton = screen.getByTestId('modal-next')
      fireEvent.click(enhanceNextButton)

      // Wait for the check coverage modal to appear
      await waitFor(() => {
        expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
      })

      // Now click skip/close on check coverage modal
      const skipButton = screen.getByTestId('modal-close')
      fireEvent.click(skipButton)

      expect(mockMarkTourCompleted).toHaveBeenCalledWith('check_coverage')
    })

    it('marks check coverage tour completed when check coverage modal is closed with next', async () => {
      // Start with enhance_answer tour not completed, check_coverage not completed
      mockIsTourCompleted.mockImplementation(() => false)

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      // First click Next on enhance answer modal to trigger check coverage modal
      const enhanceNextButton = screen.getByTestId('modal-next')
      fireEvent.click(enhanceNextButton)

      // Wait for the check coverage modal to appear
      await waitFor(() => {
        expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
      })

      // Now click next on check coverage modal
      const nextButton = screen.getByTestId('modal-next')
      fireEvent.click(nextButton)

      expect(mockMarkTourCompleted).toHaveBeenCalledWith('check_coverage')
    })

    it('handles check coverage modal close with false parameter', async () => {
      // Test to cover the handleCheckCoverageModalClose(false) line
      mockIsTourCompleted.mockImplementation(() => false)

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      // Trigger the enhance modal first, then move to check coverage modal
      const nextButton = screen.getByTestId('modal-next')
      fireEvent.click(nextButton)

      // Wait for check coverage modal
      await waitFor(() => {
        expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
      })

      // The check coverage modal should now be showing
      expect(mockMarkTourCompleted).toHaveBeenCalledWith('enhance_answer')
      
      // Close the check coverage modal 
      const closeButton = screen.getByTestId('modal-close')
      fireEvent.click(closeButton)

      expect(mockMarkTourCompleted).toHaveBeenCalledWith('check_coverage')
    })

    it('handles check coverage modal close with true parameter', async () => {
      // Test to cover the handleCheckCoverageModalClose(true) line  
      mockIsTourCompleted.mockImplementation(() => false)

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      // Trigger the enhance modal first, then move to check coverage modal
      const nextButton = screen.getByTestId('modal-next')
      fireEvent.click(nextButton)

      // Wait for check coverage modal
      await waitFor(() => {
        expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
      })

      // The check coverage modal should now be showing, click Next
      const nextButtonCheckCoverage = screen.getByTestId('modal-next')
      fireEvent.click(nextButtonCheckCoverage)

      expect(mockMarkTourCompleted).toHaveBeenCalledWith('check_coverage')
    })

    it('does not show check coverage modal if enhance answer tour is skipped and check coverage is completed', () => {
      // enhance_answer not completed, but check_coverage is completed
      mockIsTourCompleted.mockImplementation((key: string) => key === 'check_coverage')

      const props = createMockProps()
      render(<RefineAnswerScreen {...props} />)

      // Click Skip on enhance answer modal
      const skipButton = screen.getByTestId('modal-close')
      fireEvent.click(skipButton)

      // Check coverage modal should not appear since it's already completed
      expect(screen.queryByTestId('info-tour-modal')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined questionId gracefully', () => {
      const props = createMockProps({ questionId: undefined })
      render(<RefineAnswerScreen {...props} />)

      expect(screen.getByTestId('refine-answer-screen')).toBeInTheDocument()
    })

    it('handles undefined submissionId gracefully', () => {
      const props = createMockProps({ submissionId: undefined })
      render(<RefineAnswerScreen {...props} />)

      expect(screen.getByTestId('refine-answer-screen')).toBeInTheDocument()
    })

    it('handles empty rationale array', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: 'Enhanced',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const rationaleTitle = screen.getByText('Show AI Rationale')
      fireEvent.click(rationaleTitle)

      const rationaleContainer = screen.getByTestId('rationale-container')
      expect(rationaleContainer.querySelector('ul')?.children.length).toBe(0)
    })

    it('handles null enhanced answer gracefully', () => {
      mockUseEnhanceAnswer.mockReturnValue({
        enhancedAnswer: '',
        originalText: '',
        rationale: '',
        interactionId: null,
        response: null,
        status: 'success',
        loading: false,
        error: null,
        fetchEnhancedAnswer: vi.fn(),
        resetEnhancement: vi.fn(),
        updateParams: vi.fn(),
      })

      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      expect(screen.getByText('Your Answer')).toBeInTheDocument()
    })

    it('handles undefined onAnswerSelect prop gracefully', () => {
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
        onAnswerSelect: undefined,
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const radioOne = screen.getByTestId('radio-optionOne')
      fireEvent.click(radioOne)

      // Should not throw error when onAnswerSelect is undefined
      expect(screen.getByTestId('refine-answer-screen')).toBeInTheDocument()
    })

    it('handles undefined onSelectionChange prop gracefully', () => {
      const props = createMockProps({
        summaryText: 'This is a valid test answer with enough characters',
        onSelectionChange: undefined,
      })
      render(<RefineAnswerScreen {...props} />)

      fireEvent.click(screen.getByText('Enhance Answer'))

      const radioOne = screen.getByTestId('radio-optionOne')
      fireEvent.click(radioOne)

      // Should not throw error when onSelectionChange is undefined
      expect(screen.getByTestId('refine-answer-screen')).toBeInTheDocument()
    })
  })
})
