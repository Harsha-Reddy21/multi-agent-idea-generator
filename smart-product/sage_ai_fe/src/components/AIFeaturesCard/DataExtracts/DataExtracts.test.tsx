import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cortexApiService } from '@/core/api/cortex.api'
import { ExtractedContent } from '@/core/models/data-extracts.model'

import { DataExtractsStatusProvider } from '../../../contexts/DataExtractsStatusContext'
import { DataExtracts, DataExtractsProps } from './DataExtracts'

// Mock the cortex API service
vi.mock('@/core/api/cortex.api', () => ({
  cortexApiService: {
    getDocExtracts: vi.fn(),
  },
}))

// Mock LDS components
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsButton: ({
    children,
    onClick,
    className,
    disabled,
    type,
    'data-testid': dataTestId,
  }: any) => (
    <button
      onClick={onClick}
      className={className}
      disabled={disabled}
      type={type}
      data-testid={dataTestId}
    >
      {children}
    </button>
  ),
  LdsImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="lds-image" />
  ),
}))

// Mock Radix Popover
vi.mock('@radix-ui/react-popover', () => ({
  Root: ({ children, open }: any) => (
    <div data-testid="popover-root" data-open={open ? 'true' : 'false'}>
      {children}
    </div>
  ),
  Trigger: ({ children }: any) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  Portal: ({ children }: any) => (
    <div data-testid="popover-portal">{children}</div>
  ),
  Content: ({ children, className, onMouseEnter, onMouseLeave }: any) => (
    <div
      data-testid="popover-content"
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  ),
}))

// Mock ExtractPreviewCard
vi.mock('./ExtractPreviewCard', () => ({
  default: ({ provenance, documentType }: any) => (
    <div data-testid="extract-preview-card">
      <div data-testid="provenance-text">{provenance.text}</div>
      <div data-testid="provenance-file">{provenance.file_name}</div>
      <div data-testid="document-type">{documentType}</div>
    </div>
  ),
}))

// Helper function to render component with context
const renderWithContext = (props: DataExtractsProps) => {
  return render(
    <DataExtractsStatusProvider>
      <DataExtracts {...props} />
    </DataExtractsStatusProvider>
  )
}

// Helper function to create proper mock API response
const createMockResponse = (
  extractedContent: ExtractedContent | null,
  interactionId: string | null = 'int123'
) => ({
  question_id: 'q1',
  submission_id: 'sub1',
  form_id: 'form1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  extracted_content: extractedContent,
  interaction_id: interactionId,
})

// Helper function to create mock extracted data
const createMockExtractedData = (
  overrides?: Partial<ExtractedContent>
): ExtractedContent => ({
  answer_text: 'This is extracted answer text from the documents.',
  confidence: 0.95,
  provenance: [
    {
      file_name: 'document1.pdf',
      text: 'Sample text from document 1',
      page_or_slide: 1,
      span_id: 1,
      char_start: 0,
      char_end: 100,
      block_type: 'text',
      block_index: 1,
      answer: 'Sample text from document 1',
      question: 'Test question',
      similarity_score: 0.95,
    } as any,
    {
      file_name: 'document2.pdf',
      text: 'Sample text from document 2',
      page_or_slide: 2,
      span_id: 2,
      char_start: 0,
      char_end: 100,
      block_type: 'text',
      block_index: 1,
      answer: 'Sample text from document 2',
      question: 'Test question',
      similarity_score: 0.88,
    } as any,
  ],
  ...overrides,
})

describe('DataExtracts', () => {
  const mockOnExtractClick = vi.fn()
  const mockOnInteractionIdUpdate = vi.fn()

  const defaultProps: DataExtractsProps = {
    questionId: 'q123',
    submissionId: 'sub456',
    formId: 'form789',
    onExtractClick: mockOnExtractClick,
    onInteractionIdUpdate: mockOnInteractionIdUpdate,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders loading state initially when props are provided', async () => {
      const mockResponse = createMockResponse(
        createMockExtractedData(),
        'int123'
      )

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      expect(screen.getByText('Loading data extracts...')).toBeInTheDocument()

      await waitFor(() => {
        expect(cortexApiService.getDocExtracts).toHaveBeenCalledWith(
          'sub456',
          'form789',
          'q123'
        )
      })
    })

    it('does not fetch when required props are missing', () => {
      renderWithContext({
        questionId: undefined,
        submissionId: 'sub456',
        formId: 'form789',
      })

      expect(cortexApiService.getDocExtracts).not.toHaveBeenCalled()
    })
  })

  describe('Successful Data Fetch', () => {
    it('displays extracted data after successful fetch', async () => {
      const mockData = createMockExtractedData()
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText(/Data Extracts seamlessly capture key information/)
        ).toBeInTheDocument()
      })

      expect(screen.getByText(mockData.answer_text)).toBeInTheDocument()
    })

    it('calls onInteractionIdUpdate with interaction ID on success', async () => {
      const mockResponse = createMockResponse(
        createMockExtractedData(),
        'int123'
      )

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(mockOnInteractionIdUpdate).toHaveBeenCalledWith('int123')
      })
    })

    it('displays provenance list with correct count', async () => {
      const mockData = createMockExtractedData()
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText('2 relevant resources found')
        ).toBeInTheDocument()
      })
    })

    it('displays file names in provenance list', async () => {
      const mockData = createMockExtractedData()
      const mockResponse = createMockResponse(mockData, null)

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        const file1Elements = screen.getAllByText('document1.pdf')
        const file2Elements = screen.getAllByText('document2.pdf')
        expect(file1Elements.length).toBeGreaterThan(0)
        expect(file2Elements.length).toBeGreaterThan(0)
      })
    })

    it('shows "no data extracts" message when extracted_content is null', async () => {
      const mockResponse = createMockResponse(null, null)

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText('No data extracts available for this question.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when fetch fails', async () => {
      vi.mocked(cortexApiService.getDocExtracts).mockRejectedValue(
        new Error('Network error')
      )

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText('Cortex Failed to Extract Data')
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /We couldn't fetch data extracts right now. Please try again later./
          )
        ).toBeInTheDocument()
      })
    })

    it('displays retry button on error', async () => {
      vi.mocked(cortexApiService.getDocExtracts).mockRejectedValue(
        new Error('Network error')
      )

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByTestId('retry-data-extracts-button')
        ).toBeInTheDocument()
      })
    })

    it('displays error icon when fetch fails', async () => {
      vi.mocked(cortexApiService.getDocExtracts).mockRejectedValue(
        new Error('Network error')
      )

      renderWithContext(defaultProps)

      await waitFor(() => {
        const errorIcon = screen.getByAltText('Error')
        expect(errorIcon).toBeInTheDocument()
      })
    })
  })

  describe('Retry Functionality', () => {
    it('retries fetching data when retry button is clicked', async () => {
      vi.mocked(cortexApiService.getDocExtracts)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(
          createMockResponse(createMockExtractedData(), 'int456')
        )

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText('Cortex Failed to Extract Data')
        ).toBeInTheDocument()
      })

      const retryButton = screen.getByTestId('retry-data-extracts-button')
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Loading data extracts...')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(
          screen.getByText(/Data Extracts seamlessly capture key information/)
        ).toBeInTheDocument()
      })

      expect(cortexApiService.getDocExtracts).toHaveBeenCalledTimes(2)
    })

    it('calls onInteractionIdUpdate with new interaction ID on retry success', async () => {
      vi.mocked(cortexApiService.getDocExtracts)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(
          createMockResponse(createMockExtractedData(), 'int789')
        )

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByTestId('retry-data-extracts-button')
        ).toBeInTheDocument()
      })

      const retryButton = screen.getByTestId('retry-data-extracts-button')
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(mockOnInteractionIdUpdate).toHaveBeenCalledWith('int789')
      })
    })

    it('does not retry if required props are missing', async () => {
      vi.mocked(cortexApiService.getDocExtracts).mockRejectedValue(
        new Error('Network error')
      )

      const propsWithoutQuestionId = {
        ...defaultProps,
        questionId: undefined,
      }

      renderWithContext(propsWithoutQuestionId)

      // Should not show error state since fetch never happened
      expect(
        screen.queryByTestId('retry-data-extracts-button')
      ).not.toBeInTheDocument()
    })
  })

  describe('Use Extract Button', () => {
    it('displays "Use this Extract" button when data is loaded', async () => {
      const mockResponse = createMockResponse(
        createMockExtractedData(),
        'int123'
      )

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('Use this Extract')).toBeInTheDocument()
      })
    })

    it('calls onExtractClick when "Use this Extract" button is clicked', async () => {
      const mockData = createMockExtractedData()
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('Use this Extract')).toBeInTheDocument()
      })

      const useButton = screen.getByText('Use this Extract')
      fireEvent.click(useButton)

      expect(mockOnExtractClick).toHaveBeenCalledWith(mockData.answer_text)
    })

    it('shows "Data extract used" after clicking "Use this Extract"', async () => {
      const mockResponse = createMockResponse(
        createMockExtractedData(),
        'int123'
      )

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('Use this Extract')).toBeInTheDocument()
      })

      const useButton = screen.getByText('Use this Extract')
      fireEvent.click(useButton)

      await waitFor(() => {
        expect(screen.getByText('Data extract used')).toBeInTheDocument()
      })
    })

    it('disables "Use this Extract" button when answer text is empty', async () => {
      const mockData = createMockExtractedData({ answer_text: '' })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        const useButton = screen.getByText('Use this Extract')
        expect(useButton).toBeDisabled()
      })
    })

    it('disables "Use this Extract" button when answer text is only whitespace', async () => {
      const mockData = createMockExtractedData({ answer_text: '   ' })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        const useButton = screen.getByText('Use this Extract')
        expect(useButton).toBeDisabled()
      })
    })

    it('resets "isUsed" state when questionId changes', async () => {
      const mockResponse = createMockResponse(
        createMockExtractedData(),
        'int123'
      )

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      const { rerender } = renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('Use this Extract')).toBeInTheDocument()
      })

      // Click the button
      const useButton = screen.getByText('Use this Extract')
      fireEvent.click(useButton)

      await waitFor(() => {
        expect(screen.getByText('Data extract used')).toBeInTheDocument()
      })

      // Change questionId
      const newProps = { ...defaultProps, questionId: 'q456' }

      rerender(
        <DataExtractsStatusProvider>
          <DataExtracts {...newProps} />
        </DataExtractsStatusProvider>
      )

      // Wait for new data to load - button should be back to "Use this Extract"
      await waitFor(() => {
        expect(screen.getByText('Use this Extract')).toBeInTheDocument()
      })
    })
  })

  describe('Read More/Less Functionality', () => {
    it('displays "Read More" button when text exceeds limit', async () => {
      const longText = 'A'.repeat(1000) // Exceeds EXTRACT_DATA_READ_MORE_LIMIT
      const mockData = createMockExtractedData({ answer_text: longText })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('Read More')).toBeInTheDocument()
      })
    })

    it('does not display "Read More" button when text is short', async () => {
      const shortText = 'Short answer text'
      const mockData = createMockExtractedData({ answer_text: shortText })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText(shortText)).toBeInTheDocument()
      })

      expect(screen.queryByText('Read More')).not.toBeInTheDocument()
    })

    it('expands text when "Read More" is clicked', async () => {
      const longText = 'A'.repeat(1000)
      const mockData = createMockExtractedData({ answer_text: longText })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('Read More')).toBeInTheDocument()
      })

      const readMoreButton = screen.getByText('Read More')
      fireEvent.click(readMoreButton)

      await waitFor(() => {
        expect(screen.getByText('Read Less')).toBeInTheDocument()
      })

      // Full text should be visible
      expect(screen.getByText(new RegExp(longText))).toBeInTheDocument()
    })

    it('collapses text when "Read Less" is clicked', async () => {
      const longText = 'A'.repeat(1000)
      const mockData = createMockExtractedData({ answer_text: longText })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('Read More')).toBeInTheDocument()
      })

      // Expand
      const readMoreButton = screen.getByText('Read More')
      fireEvent.click(readMoreButton)

      await waitFor(() => {
        expect(screen.getByText('Read Less')).toBeInTheDocument()
      })

      // Collapse
      const readLessButton = screen.getByText('Read Less')
      fireEvent.click(readLessButton)

      await waitFor(() => {
        expect(screen.getByText('Read More')).toBeInTheDocument()
      })
    })
  })

  describe('Provenance Hover and Popover', () => {
    it('renders popover for each provenance item', async () => {
      const mockData = createMockExtractedData()
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        const popovers = screen.getAllByTestId('popover-root')
        expect(popovers).toHaveLength(2)
      })
    })

    it('shows popover on mouse enter', async () => {
      const mockData = createMockExtractedData()
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      const { container } = renderWithContext(defaultProps)

      await waitFor(() => {
        const fileElements = screen.getAllByText('document1.pdf')
        expect(fileElements.length).toBeGreaterThan(0)
      })

      // Find the extractSource div that has the onMouseEnter handler
      const extractSourceDiv = container.querySelector('._extractSource_a6434a')
      expect(extractSourceDiv).not.toBeNull()

      fireEvent.mouseEnter(extractSourceDiv!)

      await waitFor(() => {
        const popovers = screen.getAllByTestId('popover-root')
        expect(popovers[0]).toHaveAttribute('data-open', 'true')
      })
    })

    it('hides popover on mouse leave', async () => {
      const mockData = createMockExtractedData()
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      const { container } = renderWithContext(defaultProps)

      await waitFor(() => {
        const fileElements = screen.getAllByText('document1.pdf')
        expect(fileElements.length).toBeGreaterThan(0)
      })

      // Find the extractSource div that has the onMouseEnter handler
      const extractSourceDiv = container.querySelector('._extractSource_a6434a')
      expect(extractSourceDiv).not.toBeNull()

      fireEvent.mouseEnter(extractSourceDiv!)
      await waitFor(() => {
        const popovers = screen.getAllByTestId('popover-root')
        expect(popovers[0]).toHaveAttribute('data-open', 'true')
      })

      fireEvent.mouseLeave(extractSourceDiv!)
      await waitFor(() => {
        const popovers = screen.getAllByTestId('popover-root')
        expect(popovers[0]).toHaveAttribute('data-open', 'false')
      })
    })

    it('renders ExtractPreviewCard with correct props', async () => {
      const mockData = createMockExtractedData()
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        const previewCards = screen.getAllByTestId('extract-preview-card')
        expect(previewCards).toHaveLength(2)
      })

      // Check first preview card has correct content
      const provenanceTexts = screen.getAllByTestId('provenance-text')
      expect(provenanceTexts[0]).toHaveTextContent(
        'Sample text from document 1'
      )

      const provenanceFiles = screen.getAllByTestId('provenance-file')
      expect(provenanceFiles[0]).toHaveTextContent('document1.pdf')

      const documentTypes = screen.getAllByTestId('document-type')
      expect(documentTypes[0]).toHaveTextContent('uploadedDocument')
    })
  })

  describe('Empty Provenance Handling', () => {
    it('displays 0 resources when provenance list is empty', async () => {
      const mockData = createMockExtractedData({ provenance: [] })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText('0 relevant resources found')
        ).toBeInTheDocument()
      })
    })

    it('handles null provenance list gracefully', async () => {
      const mockData = createMockExtractedData({ provenance: undefined as any })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText('0 relevant resources found')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles missing onExtractClick callback gracefully', async () => {
      const mockResponse = createMockResponse(
        createMockExtractedData(),
        'int123'
      )

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      const propsWithoutCallback = {
        ...defaultProps,
        onExtractClick: undefined,
      }

      renderWithContext(propsWithoutCallback)

      await waitFor(() => {
        expect(screen.getByText('Use this Extract')).toBeInTheDocument()
      })

      const useButton = screen.getByText('Use this Extract')

      // Should not throw error
      expect(() => fireEvent.click(useButton)).not.toThrow()
    })

    it('handles missing onInteractionIdUpdate callback gracefully', async () => {
      const mockResponse = createMockResponse(
        createMockExtractedData(),
        'int123'
      )

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      const propsWithoutCallback = {
        ...defaultProps,
        onInteractionIdUpdate: undefined,
      }

      renderWithContext(propsWithoutCallback)

      await waitFor(() => {
        expect(
          screen.getByText(/Data Extracts seamlessly capture key information/)
        ).toBeInTheDocument()
      })

      // Should not throw error when callback is missing
      expect(cortexApiService.getDocExtracts).toHaveBeenCalled()
    })

    it('handles API response with null interaction_id', async () => {
      const mockResponse = createMockResponse(createMockExtractedData(), null)

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(mockOnInteractionIdUpdate).toHaveBeenCalledWith(null)
      })
    })

    it('handles error with 404 status code', async () => {
      const error = new Error('Not found')
      ;(error as any).status = 404

      vi.mocked(cortexApiService.getDocExtracts).mockRejectedValue(error)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText('Cortex Failed to Extract Data')
        ).toBeInTheDocument()
      })
    })

    it('handles error with status_code property', async () => {
      const error = new Error('Server error')
      ;(error as any).status_code = 500

      vi.mocked(cortexApiService.getDocExtracts).mockRejectedValue(error)

      renderWithContext(defaultProps)

      await waitFor(() => {
        expect(
          screen.getByText('Cortex Failed to Extract Data')
        ).toBeInTheDocument()
      })
    })

    it('does not show extract title when answer is empty', async () => {
      const mockData = createMockExtractedData({ answer_text: '' })
      const mockResponse = createMockResponse(mockData, 'int123')

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      renderWithContext(defaultProps)

      await waitFor(() => {
        // Should still show provenance count since mock data has 2 provenance items
        expect(
          screen.getByText('2 relevant resources found')
        ).toBeInTheDocument()
      })

      // Should not show the extract title when answer is empty
      expect(
        screen.queryByText('This is a suitable extract for the input field')
      ).not.toBeInTheDocument()
    })
  })

  describe('Re-fetching on Props Change', () => {
    it('refetches data when questionId changes', async () => {
      const mockResponse1 = createMockResponse(
        createMockExtractedData({
          answer_text: 'First answer',
        }),
        'int123'
      )

      const mockResponse2 = createMockResponse(
        createMockExtractedData({
          answer_text: 'Second answer',
        }),
        'int456'
      )

      vi.mocked(cortexApiService.getDocExtracts)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)

      const { rerender } = renderWithContext(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('First answer')).toBeInTheDocument()
      })

      expect(cortexApiService.getDocExtracts).toHaveBeenCalledTimes(1)

      // Change questionId
      const newProps = { ...defaultProps, questionId: 'q456' }

      rerender(
        <DataExtractsStatusProvider>
          <DataExtracts {...newProps} />
        </DataExtractsStatusProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Second answer')).toBeInTheDocument()
      })

      expect(cortexApiService.getDocExtracts).toHaveBeenCalledTimes(2)
      expect(cortexApiService.getDocExtracts).toHaveBeenLastCalledWith(
        'sub456',
        'form789',
        'q456'
      )
    })

    it('refetches data when submissionId changes', async () => {
      const mockResponse = createMockResponse(
        createMockExtractedData(),
        'int123'
      )

      vi.mocked(cortexApiService.getDocExtracts).mockResolvedValue(mockResponse)

      const { rerender } = renderWithContext(defaultProps)

      await waitFor(() => {
        expect(cortexApiService.getDocExtracts).toHaveBeenCalledWith(
          'sub456',
          'form789',
          'q123'
        )
      })

      // Change submissionId
      const newProps = { ...defaultProps, submissionId: 'sub999' }

      rerender(
        <DataExtractsStatusProvider>
          <DataExtracts {...newProps} />
        </DataExtractsStatusProvider>
      )

      await waitFor(() => {
        expect(cortexApiService.getDocExtracts).toHaveBeenCalledWith(
          'sub999',
          'form789',
          'q123'
        )
      })

      expect(cortexApiService.getDocExtracts).toHaveBeenCalledTimes(2)
    })
  })
})
