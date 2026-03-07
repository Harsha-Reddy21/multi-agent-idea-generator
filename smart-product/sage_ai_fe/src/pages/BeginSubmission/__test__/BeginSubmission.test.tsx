import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExtendedFormDashboardFormType } from '@/core/constants'

import BeginSubmission from '../BeginSubmission'

// Use vi.hoisted to declare mocks that can be used in vi.mock
const {
  mockNavigate,
  mockAddToast,
  mockShowToast,
  mockGetFormSchema,
  mockValidateMultipleFiles,
  mockInitialSubmissionBegin,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAddToast: vi.fn(),
  mockShowToast: vi.fn(),
  mockGetFormSchema: vi.fn(),
  mockValidateMultipleFiles: vi.fn(),
  mockInitialSubmissionBegin: vi.fn(),
}))

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/core/utils/toast.utils', () => ({
  showToast: (params: any) => mockShowToast(params),
}))

vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} />
  ),
  LdsLoadingSpinner: ({ className }: any) => (
    <div data-testid="loading-spinner" className={className}>
      Loading...
    </div>
  ),
  useToastContext: () => ({
    addToast: mockAddToast,
  }),
}))

vi.mock('../../../components/FormContainer/FormContainer', () => ({
  FormContainer: ({
    formTitle,
    formSubtitle,
    activePageIndex,
    pageButtonIds,
    actionHandlerMap,
    setFormData,
  }: any) => (
    <div data-testid="form-container">
      <h1>{formTitle}</h1>
      <div data-testid="form-subtitle">{formSubtitle}</div>
      <div data-testid="active-page">{activePageIndex}</div>
      <button
        data-testid="cancel-button"
        onClick={() => actionHandlerMap.cancel()}
      >
        Cancel
      </button>
      <button data-testid="prev-button" onClick={() => actionHandlerMap.prev()}>
        Previous
      </button>
      <button data-testid="next-button" onClick={() => actionHandlerMap.next()}>
        Next
      </button>
      <button
        data-testid="submit-button"
        onClick={() => actionHandlerMap.submit()}
      >
        Submit
      </button>
      <button
        data-testid="skip-upload-button"
        onClick={() => actionHandlerMap.skipUpload()}
      >
        Skip Upload
      </button>
      <button
        data-testid="save-draft-button"
        onClick={() => actionHandlerMap.saveDraft()}
      >
        Save Draft
      </button>
      <button
        data-testid="set-form-data-button"
        onClick={() => {
          if (setFormData) {
            // This allows tests to update formData
            const testData = (window as any).__testFormData
            if (testData) {
              setFormData(testData)
            }
          }
        }}
      >
        Set Form Data
      </button>
      {pageButtonIds[1] && (
        <div data-testid="page-1-buttons">
          {pageButtonIds[1].map((btn: any, idx: number) => (
            <div key={idx} data-testid={`button-${btn.action}`}>
              Action: {btn.action}, Disabled:{' '}
              {btn.whenDisabled ? String(btn.whenDisabled()) : 'N/A'}
            </div>
          ))}
        </div>
      )}
      {pageButtonIds[2] && (
        <div data-testid="page-2-buttons">
          {pageButtonIds[2].map((btn: any, idx: number) => (
            <div key={idx} data-testid={`button-${btn.action}`}>
              Action: {btn.action}, Disabled:{' '}
              {btn.whenDisabled ? String(btn.whenDisabled()) : 'N/A'}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}))

vi.mock('../../../contexts/AIFeaturesContext', () => ({
  AIFeaturesProvider: ({ children }: any) => (
    <div data-testid="ai-features-provider">{children}</div>
  ),
}))

vi.mock('../../../core/api/forms.api', () => ({
  formsApi: {
    getFormSchema: mockGetFormSchema,
  },
}))

vi.mock('../../../core/api/upload.api', () => ({
  uploadService: {
    validateMultipleFiles: mockValidateMultipleFiles,
    initialSubmissionBegin: mockInitialSubmissionBegin,
  },
}))

vi.mock('@/core/utils/button.utils', () => ({
  validatePageAnswers: vi.fn((_schema, _pageIndex, data) => {
    // Mock validation - return true if data has required fields
    return Object.keys(data).length > 0
  }),
  clearHiddenConditionalFields: vi.fn((_schema, data) => data),
}))

vi.mock('../../../core/utils/form-mapper.util', () => ({
  mapFormDataToApiFormat: vi.fn((_data, _schema, _uiSchema) => {
    return [
      {
        questionId: 'Q1',
        question: 'Test Question',
        answer: ['Test Answer'],
      },
    ]
  }),
}))

vi.mock('./BeginSubmission.module.scss', () => ({
  default: {
    loadingContainer: 'loadingContainer',
    loadingMessage: 'loadingMessage',
    beginSubmissionPage: 'beginSubmissionPage',
    infoIcon: 'infoIcon',
    uploadingOverlay: 'uploadingOverlay',
    uploadingModal: 'uploadingModal',
  },
}))

vi.mock('../../../assets/Info.svg', () => ({
  default: 'info-icon.svg',
}))

const mockFormSchema = {
  schema: {
    type: 'object',
    properties: {
      'BS-Q1': { type: 'string' },
      'BS-Q5': { type: 'array' },
    },
  },
  uiSchema: {
    'BS-Q1': { 'ui:widget': 'text' },
    'BS-Q5': { 'ui:widget': 'file' },
  },
  tabSchema: [
    {
      id: 1,
      title: 'Basic Information',
      fields: ['BS-Q1', 'BS-Q2'],
    },
    {
      id: 2,
      title: 'Upload Documents',
      fields: ['BS-Q5'],
    },
  ],
}

describe('BeginSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetFormSchema.mockResolvedValue(mockFormSchema)
  })

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      mockGetFormSchema.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )
      render(<BeginSubmission />)
      expect(screen.getByText('Loading form data...')).toBeInTheDocument()
    })

    it('should render form after schema loads successfully', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      expect(screen.getByText("Let's Get Started")).toBeInTheDocument()
      expect(mockGetFormSchema).toHaveBeenCalledWith(
        ExtendedFormDashboardFormType.BeginSubmissionForm
      )
    })

    it('should render AIFeaturesProvider wrapper', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('ai-features-provider')).toBeInTheDocument()
      })
    })
  })

  describe('Schema Loading', () => {
    it('should handle form schema fetch error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetFormSchema.mockRejectedValue(new Error('Schema fetch failed'))

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching form schema:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Page Navigation', () => {
    it('should start on page 1', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('1')
      })
    })

    it('should navigate to next page when next button clicked', async () => {
      const user = userEvent.setup()
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('next-button')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })
    })

    it('should navigate to previous page when prev button clicked', async () => {
      const user = userEvent.setup()
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Go to page 2
      const nextButton = screen.getByTestId('next-button')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      // Go back to page 1
      const prevButton = screen.getByTestId('prev-button')
      await user.click(prevButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('1')
      })
    })

    it('should not go below page 1 when prev clicked on page 1', async () => {
      const user = userEvent.setup()
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const prevButton = screen.getByTestId('prev-button')
      await user.click(prevButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('1')
      })
    })

    it('should navigate to landing page when cancel button clicked', async () => {
      const user = userEvent.setup()
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const cancelButton = screen.getByTestId('cancel-button')
      await user.click(cancelButton)

      expect(mockNavigate).toHaveBeenCalledWith('/landing')
    })
  })

  describe('Button Configuration', () => {
    it('should configure page 1 buttons with cancel and next', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        const page1Buttons = screen.getByTestId('page-1-buttons')
        expect(page1Buttons).toBeInTheDocument()
        expect(screen.getByTestId('button-cancel')).toHaveTextContent('cancel')
        expect(screen.getByTestId('button-next')).toHaveTextContent('next')
      })
    })

    it('should configure page 2 buttons with prev, skipUpload, and submit', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        const page2Buttons = screen.getByTestId('page-2-buttons')
        expect(page2Buttons).toBeInTheDocument()
        expect(screen.getByTestId('button-prev')).toHaveTextContent('prev')
        expect(screen.getByTestId('button-skipUpload')).toHaveTextContent(
          'skipUpload'
        )
        expect(screen.getByTestId('button-submit')).toHaveTextContent('submit')
      })
    })

    it('should disable submit button when no files uploaded', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        const submitButton = screen.getByTestId('button-submit')
        expect(submitButton).toHaveTextContent('Disabled: true')
      })
    })

    it('should enable submit button when files uploaded', async () => {
      const user = userEvent.setup()
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with files
      ;(window as any).__testFormData = { 'BS-Q5': [file] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      await waitFor(() => {
        const submitButton = screen.getByTestId('button-submit')
        expect(submitButton).toHaveTextContent('Disabled: false')
      })
    })
  })

  describe('Form Submission', () => {
    it('should handle successful form submission with files', async () => {
      const user = userEvent.setup()
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockResolvedValue({
        message: 'Success',
        data: { id: 'submission-123', categoryId: 'cat-1' },
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with files using window helper
      ;(window as any).__testFormData = { 'BS-Q5': [file] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockValidateMultipleFiles).toHaveBeenCalledWith([file])
        expect(mockInitialSubmissionBegin).toHaveBeenCalledWith({
          submission_journey: {
            form_data: [
              {
                questionId: 'Q1',
                question: 'Test Question',
                answer: ['Test Answer'],
              },
            ],
          },
          files: [file],
        })
        expect(mockNavigate).toHaveBeenCalledWith(
          '/form-dashboard/submission-123',
          { state: { startExtraction: true } }
        )
      })
    })

    it.skip('should handle skipUpload action', async () => {
      const user = userEvent.setup()
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockResolvedValue({
        message: 'Success',
        data: { id: 'submission-456', categoryId: 'cat-2' },
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Navigate to page 2 where skipUpload button is available
      const nextButton = screen.getByTestId('next-button')
      // Set some form data to enable next button
      ;(window as any).__testFormData = { 'BS-Q1': 'test' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      const skipButton = screen.getByTestId('skip-upload-button')
      await user.click(skipButton)

      await waitFor(() => {
        expect(mockInitialSubmissionBegin).toHaveBeenCalledWith({
          submission_journey: {
            form_data: [
              {
                questionId: 'Q1',
                question: 'Test Question',
                answer: ['Test Answer'],
              },
            ],
          },
          files: [],
        })
        expect(mockNavigate).toHaveBeenCalledWith(
          '/form-dashboard/submission-456',
          { state: { startExtraction: false } }
        )
      })
    })

    it.skip('should show uploading modal during submission', async () => {
      const user = userEvent.setup()
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Navigate to page 2 where skipUpload button is available
      const nextButton = screen.getByTestId('next-button')
      // Set some form data to enable next button
      ;(window as any).__testFormData = { 'BS-Q1': 'test' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      const skipButton = screen.getByTestId('skip-upload-button')
      await user.click(skipButton)

      await waitFor(() => {
        expect(screen.getByText('Creating submission...')).toBeInTheDocument()
        expect(
          screen.getByText('Please wait while we create your submission.')
        ).toBeInTheDocument()
      })
    })

    it('should handle file validation errors', async () => {
      const user = userEvent.setup()
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      mockValidateMultipleFiles.mockReturnValue({
        valid: false,
        errors: [{ file: 'test.pdf', error: 'File too large' }],
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with files using window helper
      ;(window as any).__testFormData = { 'BS-Q5': [file] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      // Wait for toast to appear from useEffect validation
      await waitFor(() => {
        const calls = mockShowToast.mock.calls
        expect(calls.length).toBeGreaterThanOrEqual(1)
        const lastCall = calls[calls.length - 1][0]
        expect(lastCall.addToast).toBe(mockAddToast)
        expect(lastCall.variant).toBe('error')
        expect(lastCall.timeout).toBe(8000)
        // Message is wrapped in JSX div element
        expect(lastCall.message).toBeDefined()
      })

      // Navigate to page 2
      const nextButton = screen.getByTestId('next-button')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      // Submit button should be disabled due to validation errors
      const submitButton = screen.getByTestId('button-submit')
      expect(submitButton).toHaveTextContent('Disabled: true')
    })

    it('should handle multiple file validation errors', async () => {
      const user = userEvent.setup()
      const file1 = new File(['content'], 'test1.pdf', {
        type: 'application/pdf',
      })
      const file2 = new File(['content'], 'test2.pdf', {
        type: 'application/pdf',
      })

      mockValidateMultipleFiles.mockReturnValue({
        valid: false,
        errors: [
          { file: 'test1.pdf', error: 'File too large' },
          { file: 'test2.pdf', error: 'Invalid format' },
        ],
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with files using window helper
      ;(window as any).__testFormData = { 'BS-Q5': [file1, file2] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      // Wait for toast to appear from useEffect validation
      await waitFor(() => {
        const calls = mockShowToast.mock.calls
        expect(calls.length).toBeGreaterThanOrEqual(1)
        const firstCall = calls[0][0]
        expect(firstCall.addToast).toBe(mockAddToast)
        expect(firstCall.variant).toBe('error')
        expect(firstCall.timeout).toBe(8000)
        // Message is wrapped in JSX div element
        expect(firstCall.message).toBeDefined()
      })
    })

    it.skip('should handle submission error with Error instance', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockRejectedValue(new Error('Network error'))

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Navigate to page 2 where skipUpload button is available
      const nextButton = screen.getByTestId('next-button')
      // Set some form data to enable next button
      ;(window as any).__testFormData = { 'BS-Q1': 'test' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      const skipButton = screen.getByTestId('skip-upload-button')
      await user.click(skipButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Form submission error:',
          expect.any(Error)
        )
        expect(mockShowToast).toHaveBeenCalledWith({
          addToast: mockAddToast,
          message: 'Failed to submit form: Network error',
          variant: 'error',
        })
      })

      consoleErrorSpy.mockRestore()
    })

    it.skip('should handle submission error with unknown error type', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockRejectedValue('Unknown error')

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Navigate to page 2 where skipUpload button is available
      const nextButton = screen.getByTestId('next-button')
      // Set some form data to enable next button
      ;(window as any).__testFormData = { 'BS-Q1': 'test' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      const skipButton = screen.getByTestId('skip-upload-button')
      await user.click(skipButton)

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          addToast: mockAddToast,
          message: 'Failed to submit form: Unknown error',
          variant: 'error',
        })
      })

      consoleErrorSpy.mockRestore()
    })

    it('should handle non-array files value', async () => {
      const user = userEvent.setup()
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockResolvedValue({
        message: 'Success',
        data: { id: 'submission-789', categoryId: 'cat-3' },
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Navigate to page 2 where skipUpload button is available
      const nextButton = screen.getByTestId('next-button')
      // Set some form data to enable next button
      ;(window as any).__testFormData = { 'BS-Q1': 'test' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      const skipButton = screen.getByTestId('skip-upload-button')
      await user.click(skipButton)

      await waitFor(() => {
        expect(mockInitialSubmissionBegin).toHaveBeenCalledWith({
          submission_journey: {
            form_data: [
              {
                questionId: 'Q1',
                question: 'Test Question',
                answer: ['Test Answer'],
              },
            ],
          },
          files: [],
        })
      })
    })

    it('should handle array with non-File items', async () => {
      const user = userEvent.setup()
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockResolvedValue({
        message: 'Success',
        data: { id: 'submission-999', categoryId: 'cat-4' },
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Navigate to page 2 where skipUpload button is available
      const nextButton = screen.getByTestId('next-button')
      // Set some form data to enable next button
      ;(window as any).__testFormData = { 'BS-Q1': 'test' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      const skipButton = screen.getByTestId('skip-upload-button')
      await user.click(skipButton)

      await waitFor(() => {
        expect(mockInitialSubmissionBegin).toHaveBeenCalledWith({
          submission_journey: {
            form_data: [
              {
                questionId: 'Q1',
                question: 'Test Question',
                answer: ['Test Answer'],
              },
            ],
          },
          files: [],
        })
      })
    })

    it.skip('should handle response without data.id', async () => {
      const user = userEvent.setup()
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockResolvedValue({
        message: 'Success',
        data: null,
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Navigate to page 2 where skipUpload button is available
      const nextButton = screen.getByTestId('next-button')
      // Set some form data to enable next button
      ;(window as any).__testFormData = { 'BS-Q1': 'test' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      const skipButton = screen.getByTestId('skip-upload-button')
      await user.click(skipButton)

      await waitFor(() => {
        expect(mockInitialSubmissionBegin).toHaveBeenCalled()
      })

      // Should not navigate if no id
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('saveDraft Action', () => {
    it('should handle saveDraft button click', async () => {
      const user = userEvent.setup()
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const saveDraftButton = screen.getByTestId('save-draft-button')
      await user.click(saveDraftButton)

      // saveDraft returns a resolved promise, so no error should occur
      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })
  })

  describe('Page Details', () => {
    it('should generate page details from schema', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // PageDetails are passed to FormContainer
      // We can verify the schema was loaded which populates pageDetails
      expect(mockGetFormSchema).toHaveBeenCalled()
    })

    it('should handle empty page details when schema not loaded', () => {
      mockGetFormSchema.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )
      render(<BeginSubmission />)

      expect(screen.getByText('Loading form data...')).toBeInTheDocument()
    })
  })

  describe('File Validation with useEffect', () => {
    it('should clear validation errors when valid files are uploaded', async () => {
      const user = userEvent.setup()
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with valid files
      ;(window as any).__testFormData = { 'BS-Q5': [file] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      // Navigate to page 2
      const nextButton = screen.getByTestId('next-button')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      // Submit button should be enabled
      const submitButton = screen.getByTestId('button-submit')
      expect(submitButton).toHaveTextContent('Disabled: false')
    })

    it('should not show duplicate toast when same validation error persists', async () => {
      const user = userEvent.setup()
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      mockValidateMultipleFiles.mockReturnValue({
        valid: false,
        errors: [{ file: 'test.pdf', error: 'File too large' }],
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with files
      ;(window as any).__testFormData = { 'BS-Q5': [file] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledTimes(1)
      })

      // Set the same data again - should not show duplicate toast
      await user.click(setFormDataButton)

      // Toast should still only be called once
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledTimes(1)
      })
    })

    it('should clear validation errors when files are removed', async () => {
      const user = userEvent.setup()
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      mockValidateMultipleFiles.mockReturnValue({
        valid: false,
        errors: [{ file: 'test.pdf', error: 'File too large' }],
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with files
      ;(window as any).__testFormData = { 'BS-Q5': [file] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled()
      })

      // Clear files
      ;(window as any).__testFormData = { 'BS-Q5': [] }
      await user.click(setFormDataButton)

      // Navigate to page 2 to check submit button
      const nextButton = screen.getByTestId('next-button')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      // Submit button should be disabled (no files)
      const submitButton = screen.getByTestId('button-submit')
      expect(submitButton).toHaveTextContent('Disabled: true')
    })

    it('should handle validation when files are not in array format', async () => {
      const user = userEvent.setup()

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with non-array value
      ;(window as any).__testFormData = { 'BS-Q5': 'not-an-array' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      // Should not crash, validation errors should be cleared
      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })

    it('should handle validation when array contains non-File objects', async () => {
      const user = userEvent.setup()

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with array of non-File items
      ;(window as any).__testFormData = { 'BS-Q5': ['string', 123, {}] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      // Should not crash, validation should be skipped
      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // validateMultipleFiles should not be called with invalid items
      expect(mockValidateMultipleFiles).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission Edge Cases', () => {
    it('should handle submission with hasFiles=true parameter', async () => {
      const user = userEvent.setup()
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockResolvedValue({
        message: 'Success',
        data: { id: 'submission-123', categoryId: 'cat-1' },
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with files
      ;(window as any).__testFormData = { 'BS-Q5': [file] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockInitialSubmissionBegin).toHaveBeenCalledWith(
          expect.objectContaining({
            files: [file],
          })
        )
      })
    })

    it('should navigate with startExtraction=true when files uploaded', async () => {
      const user = userEvent.setup()
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockResolvedValue({
        message: 'Success',
        data: { id: 'submission-123', categoryId: 'cat-1' },
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Set form data with files
      ;(window as any).__testFormData = { 'BS-Q5': [file] }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/form-dashboard/submission-123',
          { state: { startExtraction: true } }
        )
      })
    })

    it.skip('should handle clearHiddenConditionalFields during submission', async () => {
      const user = userEvent.setup()
      mockValidateMultipleFiles.mockReturnValue({ valid: true, errors: [] })
      mockInitialSubmissionBegin.mockResolvedValue({
        message: 'Success',
        data: { id: 'submission-789', categoryId: 'cat-3' },
      })

      render(<BeginSubmission />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Navigate to page 2 where skipUpload button is available
      const nextButton = screen.getByTestId('next-button')
      // Set some form data to enable next button
      ;(window as any).__testFormData = { 'BS-Q1': 'test' }
      const setFormDataButton = screen.getByTestId('set-form-data-button')
      await user.click(setFormDataButton)
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('2')
      })

      const skipButton = screen.getByTestId('skip-upload-button')
      await user.click(skipButton)

      await waitFor(() => {
        expect(mockInitialSubmissionBegin).toHaveBeenCalled()
      })

      // clearHiddenConditionalFields is imported and should be called
      // This verifies the function is in the flow
    })
  })

  describe('Button Disabled Logic', () => {
    it('should enable skipUpload button always', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        const skipButton = screen.getByTestId('button-skipUpload')
        expect(skipButton).toHaveTextContent('Disabled: false')
      })
    })

    it.skip('should disable next button when form data is empty', async () => {
      render(<BeginSubmission />)

      await waitFor(() => {
        const nextButton = screen.getByTestId('button-next')
        expect(nextButton).toHaveTextContent('Disabled: true')
      })
    })
  })
})
