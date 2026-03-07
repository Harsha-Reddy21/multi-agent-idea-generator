import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Provenance } from '@/core/models/data-extracts.model'
import { SelectAnswerScreenProps } from '@/core/models/select-answer-screen.model'
import * as tourStateUtil from '@/core/utils/tour-state.util'
import * as useDataExtractsModule from '@/hooks/useDataExtracts'

import SelectAnswerScreen from './SelectAnswerScreen'

// Mock dependencies
vi.mock('@elilillyco/ux-lds-react', () => ({
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
  LdsTextField: ({ id, value, onChange, placeholder, className }: any) => (
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid={`textfield-${id}`}
    />
  ),
  LdsButton: ({
    children,
    onClick,
    disabled,
    className,
    iconPosition,
    ...props
  }: any) => (
    <button
      className={`lds-button ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'lds-button'}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock('@radix-ui/react-popover', () => ({
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children }: any) => <div>{children}</div>,
  Portal: ({ children }: any) => <div>{children}</div>,
  Content: ({ children, className }: any) => (
    <div className={className} data-testid="popover-content">
      {children}
    </div>
  ),
}))

vi.mock('@/hooks/useDataExtracts')
vi.mock('./DataExtracts/ExtractPreviewCard', () => ({
  default: ({ provenance, documentType }: any) => (
    <div data-testid={`extract-preview-${documentType}`}>
      {provenance.file_name || provenance.question_id}
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

vi.mock('@/core/utils/tour-state.util', () => ({
  isTourCompleted: vi.fn(),
  markTourCompleted: vi.fn(),
}))

vi.mock('./CheckCoverage', () => ({
  default: () => (
    <div data-testid="check-coverage">Mocked CheckCoverage Component</div>
  ),
}))

const mockUseDataExtracts = vi.mocked(useDataExtractsModule.useDataExtracts)
const mockIsTourCompleted = vi.mocked(tourStateUtil.isTourCompleted)
const mockMarkTourCompleted = vi.mocked(tourStateUtil.markTourCompleted)

// Helper function to create mock Provenance data
const createMockProvenance = (overrides?: Partial<Provenance>): Provenance => ({
  text: 'Sample extracted text',
  span_id: 1,
  char_end: 100,
  file_name: 'test.pdf',
  block_type: 'text',
  char_start: 0,
  block_index: 0,
  page_or_slide: 1,
  answer: 'Sample answer',
  question: 'Sample question',
  ...overrides,
})

const createMockProps = (
  overrides?: Partial<SelectAnswerScreenProps>
): SelectAnswerScreenProps => ({
  questionText: 'What is your solution?',
  inputValue: 'Initial input value',
  questionId: 'q123',
  submissionId: 's456',
  formId: 'f789',
  onNextDisabledChange: vi.fn(),
  onAnswerSelect: vi.fn(),
  commonFields: [],
  dataExtractOnly: false,
  ...overrides,
})

describe('SelectAnswerScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDataExtracts.mockReturnValue({
      provenanceList: [],
      answerText: '',
      fetchStatus: 'idle' as any,
      errorMessage: undefined,
      retry: vi.fn(),
      interactionId: null,
      extractedData: null,
    })
    mockIsTourCompleted.mockReturnValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with question text as heading', () => {
      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByText('What is your solution?')).toBeInTheDocument()
    })

    it('renders overview subtext', () => {
      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      expect(
        screen.getByText('This text field is going to be editable for you!')
      ).toBeInTheDocument()
    })

    it('renders three radio options (option1, option2, option3 when commonFields provided)', () => {
      // Mock useDataExtracts to return data so option2 is visible
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common field answer',
            source_fields: [],
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByTestId('radio-option1')).toBeInTheDocument()
      expect(screen.getByTestId('radio-option2')).toBeInTheDocument()
      expect(screen.getByTestId('radio-option3')).toBeInTheDocument()
    })

    it('renders only two radio options when no commonFields', () => {
      // Mock useDataExtracts to return data so option2 is visible
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps({ commonFields: [] })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByTestId('radio-option1')).toBeInTheDocument()
      expect(screen.getByTestId('radio-option2')).toBeInTheDocument()
      expect(screen.queryByTestId('radio-option3')).not.toBeInTheDocument()
    })

    it('renders Data Extracts section', () => {
      // Mock useDataExtracts to return data so Data Extracts section is visible
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByText('Data Extracts')).toBeInTheDocument()
      expect(
        screen.getByText('This is the extracts from the documents you uploaded')
      ).toBeInTheDocument()
    })

    it('renders Insights from past responses section when commonFields exist', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common answer',
            source_fields: [],
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(
        screen.getByText('Insights from past responses')
      ).toBeInTheDocument()
    })
  })

  describe('Input Handling', () => {
    it('initializes option1 text with inputValue prop', () => {
      const props = createMockProps({ inputValue: 'Test input' })
      render(<SelectAnswerScreen {...props} />)

      const textfield = screen.getByTestId('textfield-option1-text')
      expect(textfield).toHaveValue('Test input')
    })

    it('updates option1 text when user types', () => {
      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      const textfield = screen.getByTestId('textfield-option1-text')
      fireEvent.change(textfield, { target: { value: 'New value' } })

      expect(textfield).toHaveValue('New value')
    })

    it('updates option2 text when user types in textarea', () => {
      // Mock useDataExtracts to return data so option2 is visible
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Initial answer',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      const textarea = screen.getByPlaceholderText('Data from documents')
      fireEvent.change(textarea, { target: { value: 'New data extract' } })

      expect(textarea).toHaveValue('New data extract')
    })

    it('updates option3 text when user types', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common answer',
            source_fields: [],
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      const textfield = screen.getByTestId('textfield-option3-text')
      fireEvent.change(textfield, { target: { value: 'Modified answer' } })

      expect(textfield).toHaveValue('Modified answer')
    })
  })

  describe('Radio Selection', () => {
    it('selects option1 when radio is clicked', () => {
      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      const radio1 = screen.getByTestId('radio-option1')
      fireEvent.click(radio1)

      expect(radio1).toBeChecked()
    })

    it('selects option2 when radio is clicked', () => {
      // Mock useDataExtracts to return data so option2 is visible
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      const radio2 = screen.getByTestId('radio-option2')
      fireEvent.click(radio2)

      expect(radio2).toBeChecked()
    })

    it('only one radio can be selected at a time', () => {
      // Mock useDataExtracts to return data so option2 is visible
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      const radio1 = screen.getByTestId('radio-option1')
      const radio2 = screen.getByTestId('radio-option2')

      fireEvent.click(radio1)
      expect(radio1).toBeChecked()
      expect(radio2).not.toBeChecked()

      fireEvent.click(radio2)
      expect(radio1).not.toBeChecked()
      expect(radio2).toBeChecked()
    })
  })

  describe('Next Button State Management', () => {
    it('calls onNextDisabledChange with true when no option selected', () => {
      const onNextDisabledChange = vi.fn()
      const props = createMockProps({ onNextDisabledChange })
      render(<SelectAnswerScreen {...props} />)

      expect(onNextDisabledChange).toHaveBeenCalledWith(true)
    })

    it('calls onNextDisabledChange with false when option1 selected with text', () => {
      const onNextDisabledChange = vi.fn()
      const props = createMockProps({
        onNextDisabledChange,
        inputValue: 'Some text',
      })
      render(<SelectAnswerScreen {...props} />)

      const radio1 = screen.getByTestId('radio-option1')
      fireEvent.click(radio1)

      expect(onNextDisabledChange).toHaveBeenCalledWith(false)
    })

    it('calls onNextDisabledChange with true when option1 selected with empty text', () => {
      const onNextDisabledChange = vi.fn()
      const props = createMockProps({
        onNextDisabledChange,
        inputValue: '',
      })
      render(<SelectAnswerScreen {...props} />)

      const radio1 = screen.getByTestId('radio-option1')
      fireEvent.click(radio1)

      expect(onNextDisabledChange).toHaveBeenCalledWith(true)
    })

    it('calls onAnswerSelect with selected answer text', () => {
      const onAnswerSelect = vi.fn()
      const props = createMockProps({
        onAnswerSelect,
        inputValue: 'My answer',
      })
      render(<SelectAnswerScreen {...props} />)

      const radio1 = screen.getByTestId('radio-option1')
      fireEvent.click(radio1)

      expect(onAnswerSelect).toHaveBeenCalledWith('My answer')
    })
  })

  describe('Data Extracts - grouping and citation numbers', () => {
    it('groups provenance by file_name and renders citation numbers [n]', () => {
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [
          createMockProvenance({
            file_name: 'Digital Legal Office',
            citationNumber: 1,
          } as any),
          createMockProvenance({
            file_name: 'Digital Legal Office',
            citationNumber: 2,
          } as any),
          createMockProvenance({
            file_name: 'Security Architecture & Engineering Form',
            citationNumber: 3,
          } as any),
        ],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      // one row per unique file_name (appears in grid and in preview, so use getAllByText)
      expect(
        screen.getAllByText('Digital Legal Office').length
      ).toBeGreaterThan(0)
      expect(
        screen.getAllByText('Security Architecture & Engineering Form').length
      ).toBeGreaterThan(0)

      // citations rendered
      expect(screen.getByText('[1]')).toBeInTheDocument()
      expect(screen.getByText('[2]')).toBeInTheDocument()
      expect(screen.getByText('[3]')).toBeInTheDocument()
    })
  })

  describe('Source Fields - grouping and citation numbers', () => {
    it('groups sourceFields by form_type and renders citation numbers [n]', () => {
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common field answer',
            source_fields: [
              { form_type: 'dlo-form', citationNumber: 1, question_id: 'qa' },
              { form_type: 'dlo-form', citationNumber: 2, question_id: 'qb' },
              {
                form_type: 'security-arch-form',
                citationNumber: 3,
                question_id: 'qc',
              },
            ],
          } as any,
        ],
      })

      render(<SelectAnswerScreen {...props} />)

      // mapped labels
      expect(
        screen.getAllByText('Digital Legal Office Form').length
      ).toBeGreaterThan(0)
      expect(
        screen.getAllByText('Security Architecture & Engineering Form').length
      ).toBeGreaterThan(0)

      // citations may appear multiple times; verify presence
      expect(screen.getAllByText('[1]').length).toBeGreaterThan(0)
      expect(screen.getAllByText('[2]').length).toBeGreaterThan(0)
      expect(screen.getAllByText('[3]').length).toBeGreaterThan(0)
    })
  })

  describe('Common Fields Integration', () => {
    it('populates option3 with common field answer', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Pre-filled common answer',
            source_fields: [],
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      const textfield = screen.getByTestId('textfield-option3-text')
      expect(textfield).toHaveValue('Pre-filled common answer')
    })
  })

  describe('Info Tour Modals', () => {
    it('shows Data Extracts modal when tour not completed', () => {
      // Mock tour as not completed
      mockIsTourCompleted.mockImplementation((key: string) => {
        return key !== 'data_extracts'
      })

      // Mock useDataExtracts to return data so showDataExtracts is true
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
    })

    it('does not show Data Extracts modal when tour completed', () => {
      mockIsTourCompleted.mockReturnValue(true)

      // Mock useDataExtracts to return data
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      expect(screen.queryByTestId('info-tour-modal')).not.toBeInTheDocument()
    })

    it('marks tour completed when modal is closed', () => {
      mockIsTourCompleted.mockReturnValue(false)

      // Mock useDataExtracts to return data so showDataExtracts is true
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      const closeButton = screen.getByTestId('modal-close')
      fireEvent.click(closeButton)

      expect(mockMarkTourCompleted).toHaveBeenCalledWith('data_extracts')
    })

    it('shows leverage answers modal after data extracts modal on Next click', async () => {
      mockIsTourCompleted.mockImplementation((key: string) => {
        return key !== 'data_extracts' && key !== 'leverage_answers'
      })

      // Mock useDataExtracts to return data so showDataExtracts is true
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Extracted answer text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      const nextButton = screen.getByTestId('modal-next')
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(mockMarkTourCompleted).toHaveBeenCalledWith('data_extracts')
      })
    })
  })

  describe('Textarea Auto-resize', () => {
    it('adjusts textarea height based on content', () => {
      // Mock useDataExtracts to return data so textarea is visible
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Initial answer',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      const textarea = screen.getByPlaceholderText(
        'Data from documents'
      ) as HTMLTextAreaElement

      fireEvent.change(textarea, {
        target: { value: 'Line 1\nLine 2\nLine 3\nLine 4' },
      })

      // Textarea should auto-adjust height (style manipulation happens in effect)
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3\nLine 4')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined inputValue gracefully', () => {
      const props = createMockProps({ inputValue: undefined })
      render(<SelectAnswerScreen {...props} />)

      const textfield = screen.getByTestId('textfield-option1-text')
      expect(textfield).toHaveValue('')
    })

    it('trims whitespace when checking if answer is empty', () => {
      const onNextDisabledChange = vi.fn()
      const props = createMockProps({
        onNextDisabledChange,
        inputValue: '   ',
      })
      render(<SelectAnswerScreen {...props} />)

      const radio1 = screen.getByTestId('radio-option1')
      fireEvent.click(radio1)

      expect(onNextDisabledChange).toHaveBeenCalledWith(true)
    })
  })

  describe('DataExtractOnly Mode', () => {
    it('renders with question text regardless of dataExtractOnly flag', () => {
      const props = createMockProps({
        dataExtractOnly: true,
        questionText: 'Custom question for data extract',
      })
      render(<SelectAnswerScreen {...props} />)

      expect(
        screen.getByText('Custom question for data extract')
      ).toBeInTheDocument()
    })
  })

  describe('Provenance Grid and Popover', () => {
    it('renders provenance items for each document', () => {
      const mockDoc1 = createMockProvenance({ file_name: 'document1.pdf' })
      const mockDoc2 = createMockProvenance({ file_name: 'document2.pdf' })

      mockUseDataExtracts.mockReturnValue({
        provenanceList: [mockDoc1, mockDoc2],
        answerText: 'Extracted text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      // Files appear in both grid and popover
      const doc1Elements = screen.getAllByText('document1.pdf')
      const doc2Elements = screen.getAllByText('document2.pdf')

      expect(doc1Elements.length).toBeGreaterThan(0)
      expect(doc2Elements.length).toBeGreaterThan(0)
    })

    it('shows popover preview card when hovering over document', () => {
      const mockDoc = createMockProvenance({ file_name: 'test.pdf' })

      mockUseDataExtracts.mockReturnValue({
        provenanceList: [mockDoc],
        answerText: 'Extracted text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      // File appears in both grid and popover, get the first one (in grid)
      const fileNameElements = screen.getAllByText('test.pdf')
      fireEvent.mouseEnter(fileNameElements[0].parentElement!)

      expect(
        screen.getByTestId('extract-preview-uploadedDocument')
      ).toBeInTheDocument()
    })

    it('hides popover when mouse leaves document', () => {
      const mockDoc = createMockProvenance({ file_name: 'test.pdf' })

      mockUseDataExtracts.mockReturnValue({
        provenanceList: [mockDoc],
        answerText: 'Extracted text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      // File appears in both grid and popover, get the first one (in grid)
      const fileNameElements = screen.getAllByText('test.pdf')
      const extractSource = fileNameElements[0].parentElement!

      fireEvent.mouseEnter(extractSource)
      expect(
        screen.getByTestId('extract-preview-uploadedDocument')
      ).toBeInTheDocument()

      fireEvent.mouseLeave(extractSource)
      // Popover should still exist but hover state should change
      expect(
        screen.getByTestId('extract-preview-uploadedDocument')
      ).toBeInTheDocument()
    })
  })

  describe('Common Fields Source Fields', () => {
    it('renders source fields for common field option', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common answer',
            source_fields: [
              { form_type: 'ai-registry-form', question_id: 'q1' },
              { form_type: 'idea-sub-form', question_id: 'q2' },
            ],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByText('AI Registry Form')).toBeInTheDocument()
      expect(
        screen.getByText('Solution/System Overview Form')
      ).toBeInTheDocument()
    })

    it('shows popover for common field source on hover', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common answer',
            source_fields: [{ form_type: 'dlo-form', question_id: 'q1' }],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      const formName = screen.getByText('Digital Legal Office Form')
      fireEvent.mouseEnter(formName.parentElement!)

      expect(
        screen.getByTestId('extract-preview-commonField')
      ).toBeInTheDocument()
    })

    it('hides common field popover when mouse leaves', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common answer',
            source_fields: [{ form_type: 'wwtp-form', question_id: 'q1' }],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      const formName = screen.getByText('Working with Third Parties Form')
      const extractSource = formName.parentElement!

      fireEvent.mouseEnter(extractSource)
      expect(
        screen.getByTestId('extract-preview-commonField')
      ).toBeInTheDocument()

      fireEvent.mouseLeave(extractSource)
      expect(
        screen.getByTestId('extract-preview-commonField')
      ).toBeInTheDocument()
    })
  })

  describe('mapFormTypeToName function', () => {
    it('maps ai-registry-form correctly', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer',
            source_fields: [
              { form_type: 'ai-registry-form', question_id: 'q1' },
            ],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByText('AI Registry Form')).toBeInTheDocument()
    })

    it('maps idea-sub-form correctly', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer',
            source_fields: [{ form_type: 'idea-sub-form', question_id: 'q1' }],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(
        screen.getByText('Solution/System Overview Form')
      ).toBeInTheDocument()
    })

    it('maps dlo-form correctly', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer',
            source_fields: [{ form_type: 'dlo-form', question_id: 'q1' }],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByText('Digital Legal Office Form')).toBeInTheDocument()
    })

    it('maps wwtp-form correctly', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer',
            source_fields: [{ form_type: 'wwtp-form', question_id: 'q1' }],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(
        screen.getByText('Working with Third Parties Form')
      ).toBeInTheDocument()
    })

    it('maps wwtp-new-vendor-form correctly', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer',
            source_fields: [
              { form_type: 'wwtp-new-vendor-form', question_id: 'q1' },
            ],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(
        screen.getByText('Working with Third Parties Form')
      ).toBeInTheDocument()
    })

    it('maps begin-submission-form correctly', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer',
            source_fields: [
              { form_type: 'begin-submission-form', question_id: 'q1' },
            ],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByText('Initial Submission Form')).toBeInTheDocument()
    })

    it('maps security-arch-form correctly', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer',
            source_fields: [
              { form_type: 'security-arch-form', question_id: 'q1' },
            ],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(
        screen.getByText('Security Architecture & Engineering Form')
      ).toBeInTheDocument()
    })

    it('returns default for unknown form type', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer',
            source_fields: [
              { form_type: 'unknown_form_type', question_id: 'q1' },
            ],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByText('Document Extract')).toBeInTheDocument()
    })
  })

  describe('Multiple Provenances', () => {
    it('renders multiple provenance items in grid', () => {
      const mockDocs = [
        createMockProvenance({ file_name: 'doc1.pdf' }),
        createMockProvenance({ file_name: 'doc2.pdf' }),
        createMockProvenance({ file_name: 'doc3.pdf' }),
      ]

      mockUseDataExtracts.mockReturnValue({
        provenanceList: mockDocs,
        answerText: 'Extracted text',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      // Files appear in both grid and popover, so use getAllByText
      const doc1Elements = screen.getAllByText('doc1.pdf')
      const doc2Elements = screen.getAllByText('doc2.pdf')
      const doc3Elements = screen.getAllByText('doc3.pdf')

      expect(doc1Elements.length).toBeGreaterThan(0)
      expect(doc2Elements.length).toBeGreaterThan(0)
      expect(doc3Elements.length).toBeGreaterThan(0)
    })

    it('handles multiple source fields for common fields', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common answer',
            source_fields: [
              { form_type: 'ai-registry-form', question_id: 'q1' },
              { form_type: 'dlo-form', question_id: 'q2' },
              { form_type: 'security-arch-form', question_id: 'q3' },
            ],
            multi_source: true,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.getByText('AI Registry Form')).toBeInTheDocument()
      expect(screen.getByText('Digital Legal Office Form')).toBeInTheDocument()
      expect(
        screen.getByText('Security Architecture & Engineering Form')
      ).toBeInTheDocument()
    })
  })

  describe('Answer Selection with Different Options', () => {
    it('selects option3 when radio is clicked', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common answer',
            source_fields: [],
            multi_source: false,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      const radio3 = screen.getByTestId('radio-option3')
      fireEvent.click(radio3)

      expect(radio3).toBeChecked()
    })

    it('calls onAnswerSelect with option2 answer when selected', () => {
      const onAnswerSelect = vi.fn()

      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'Data extract answer',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps({ onAnswerSelect })
      render(<SelectAnswerScreen {...props} />)

      const radio2 = screen.getByTestId('radio-option2')
      fireEvent.click(radio2)

      expect(onAnswerSelect).toHaveBeenCalledWith('Data extract answer')
    })

    it('calls onAnswerSelect with option3 answer when selected', () => {
      const onAnswerSelect = vi.fn()
      const props = createMockProps({
        onAnswerSelect,
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Common field answer',
            source_fields: [],
            multi_source: false,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      const radio3 = screen.getByTestId('radio-option3')
      fireEvent.click(radio3)

      expect(onAnswerSelect).toHaveBeenCalledWith('Common field answer')
    })
  })

  describe('Dynamic Updates', () => {
    it('updates option2 text when answerText from hook changes', () => {
      const { rerender } = render(<SelectAnswerScreen {...createMockProps()} />)

      // Initially no data
      expect(
        screen.queryByPlaceholderText('Data from documents')
      ).not.toBeInTheDocument()

      // Update to have data
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: 'New extracted answer',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      rerender(<SelectAnswerScreen {...createMockProps()} />)

      const textarea = screen.getByPlaceholderText('Data from documents')
      expect(textarea).toHaveValue('New extracted answer')
    })

    it('updates option1 text when inputValue prop changes', () => {
      const props = createMockProps({ inputValue: 'Initial value' })
      const { rerender } = render(<SelectAnswerScreen {...props} />)

      let textfield = screen.getByTestId('textfield-option1-text')
      expect(textfield).toHaveValue('Initial value')

      // Update inputValue
      rerender(
        <SelectAnswerScreen
          {...createMockProps({ inputValue: 'Updated value' })}
        />
      )

      textfield = screen.getByTestId('textfield-option1-text')
      expect(textfield).toHaveValue('Updated value')
    })

    it('updates option3 text when commonFieldMatch changes', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Initial common answer',
            source_fields: [],
            multi_source: false,
          } as any,
        ],
      })
      const { rerender } = render(<SelectAnswerScreen {...props} />)

      let textfield = screen.getByTestId('textfield-option3-text')
      expect(textfield).toHaveValue('Initial common answer')

      // Update common fields
      rerender(
        <SelectAnswerScreen
          {...createMockProps({
            commonFields: [
              {
                question_id: 'q123',
                answer: 'Updated common answer',
                source_fields: [],
                multi_source: false,
              } as any,
            ],
          })}
        />
      )

      textfield = screen.getByTestId('textfield-option3-text')
      expect(textfield).toHaveValue('Updated common answer')
    })
  })

  describe('Conditional Rendering Logic', () => {
    it('does not show Data Extracts section when answerText is empty', () => {
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [createMockProvenance()],
        answerText: '',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: null,
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      expect(screen.queryByText('Data Extracts')).not.toBeInTheDocument()
    })

    it('does not show Data Extracts section when provenanceList is empty', () => {
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [],
        answerText: 'Some answer',
        fetchStatus: 'success' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: 'int123',
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      expect(screen.queryByText('Data Extracts')).not.toBeInTheDocument()
    })

    it('does not show option3 when no matching commonField', () => {
      const props = createMockProps({
        questionId: 'q999',
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Different question answer',
            source_fields: [],
            multi_source: false,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      expect(screen.queryByTestId('radio-option3')).not.toBeInTheDocument()
    })
  })

  describe('Empty State Handling', () => {
    it('handles empty provenanceList array', () => {
      mockUseDataExtracts.mockReturnValue({
        provenanceList: [],
        answerText: '',
        fetchStatus: 'idle' as any,
        errorMessage: undefined,
        retry: vi.fn(),
        interactionId: null,
        extractedData: null,
      })

      const props = createMockProps()
      render(<SelectAnswerScreen {...props} />)

      expect(screen.queryByText('Data Extracts')).not.toBeInTheDocument()
    })

    it('handles empty source_fields array in commonFields', () => {
      const props = createMockProps({
        commonFields: [
          {
            question_id: 'q123',
            answer: 'Answer with no sources',
            source_fields: [],
            multi_source: false,
          } as any,
        ],
      })
      render(<SelectAnswerScreen {...props} />)

      // Should still show option3 but no source field items
      expect(screen.getByTestId('radio-option3')).toBeInTheDocument()
      expect(screen.queryByText('AI Registry Form')).not.toBeInTheDocument()
    })
  })
})
