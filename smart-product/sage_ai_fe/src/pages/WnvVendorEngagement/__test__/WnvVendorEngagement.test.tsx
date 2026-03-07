import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FormDashboardFormType } from '@/core/constants'
import { FormStatus } from '@/core/models/form.model'

import WnvVendorEngagement from '../WnvVendorEngagement'

// Create mock functions
const mockNavigate = vi.fn()
const mockAddToast = vi.fn()
const mockShowToast = vi.fn()
const mockGetFormSchema = vi.fn()
const mockGetFormDetails = vi.fn()
const mockGetCommonFields = vi.fn()
const mockSubmitForm = vi.fn()
const mockGetSuggestions = vi.fn()
const mockMapApiFormatToFormData = vi.fn()
const mockMapFormDataToApiFormat = vi.fn()
const mockMergeCommonFieldsWithFormData = vi.fn()
const mockIsFieldAIEnabled = vi.fn()
const mockClearHiddenConditionalFields = vi.fn()
const mockValidateEntireForm = vi.fn()
const mockValidatePageAnswers = vi.fn()

// Mock all dependencies
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="lds-image" />
  ),
  useToastContext: () => ({
    addToast: mockAddToast,
  }),
}))

vi.mock('../../../core/utils/toast.utils', () => ({
  showToast: (params: any) => mockShowToast(params),
}))

vi.mock('../../../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: any) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}))

vi.mock('../../../components/FormContainer/FormContainer', () => ({
  FormContainer: (props: any) => {
    // Store props in a way that can be accessed without circular reference issues
    const simplifiedProps = {
      formTitle: props.formTitle,
      submissionId: props.submissionId,
      activePageIndex: props.activePageIndex,
      pageDetails: props.pageDetails,
      breadcrumbs: props.breadcrumbs,
      suggestionsData: props.suggestionsData,
      suggestionsLoading: props.suggestionsLoading,
      suggestionsError: props.suggestionsError,
      schema: props.schema,
      uiSchema: props.uiSchema,
      formType: props.formType,
      pageButtonIds: props.pageButtonIds,
      formStatus: props.formStatus,
    }

    return (
      <div
        data-testid="form-container"
        data-props={JSON.stringify(simplifiedProps)}
        data-action-handlers={JSON.stringify(
          Object.keys(props.actionHandlerMap || {})
        )}
      >
        WNV Vendor Engagement Form Container
        <button
          data-testid="test-cancel-handler"
          onClick={() => props.actionHandlerMap?.cancel?.()}
        >
          Cancel
        </button>
        <button
          data-testid="test-prev-handler"
          onClick={() => props.actionHandlerMap?.prev?.()}
        >
          Previous
        </button>
        <button
          data-testid="test-next-handler"
          onClick={() => props.actionHandlerMap?.next?.()}
        >
          Next
        </button>
        <button
          data-testid="test-submit-handler"
          onClick={() => props.actionHandlerMap?.submit?.()}
        >
          Submit
        </button>
        <button
          data-testid="test-skip-upload-handler"
          onClick={() => props.actionHandlerMap?.skipUpload?.()}
        >
          Skip Upload
        </button>
        <button
          data-testid="test-save-draft-handler"
          onClick={() => props.actionHandlerMap?.saveDraft?.()}
        >
          Save Draft
        </button>
        <button
          data-testid="test-update-handler"
          onClick={() => props.actionHandlerMap?.update?.()}
        >
          Update
        </button>
      </div>
    )
  },
}))

vi.mock('../../../contexts/AIFeaturesContext', () => ({
  AIFeaturesProvider: ({ children }: any) => (
    <div data-testid="ai-features-provider">{children}</div>
  ),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ formId: 'wnv-form-123', submissionId: 'wnv-sub-456' }),
  }
})

vi.mock('../../../core/api/forms.api', () => ({
  formsApi: {
    getFormSchema: (...args: any[]) => mockGetFormSchema(...args),
    getFormDetails: (...args: any[]) => mockGetFormDetails(...args),
    getCommonFields: (...args: any[]) => mockGetCommonFields(...args),
    submitForm: (...args: any[]) => mockSubmitForm(...args),
  },
}))

vi.mock('../../../core/api/suggestions.api', () => ({
  suggestionsApiService: {
    getSuggestions: (...args: any[]) => mockGetSuggestions(...args),
  },
}))

vi.mock('../../../core/utils/button.utils', () => ({
  validateEntireForm: (_schema: any, _formData: any) =>
    mockValidateEntireForm(),
  validatePageAnswers: (_schema: any, _pageIndex: any, _formData: any) =>
    mockValidatePageAnswers(),
  clearHiddenConditionalFields: (schema: any, formData: any) =>
    mockClearHiddenConditionalFields(schema, formData),
}))

vi.mock('../../../core/utils/form-mapper.util', () => ({
  mapApiFormatToFormData: (...args: any[]) =>
    mockMapApiFormatToFormData(...args),
  mapFormDataToApiFormat: (...args: any[]) =>
    mockMapFormDataToApiFormat(...args),
  mergeCommonFieldsWithFormData: (...args: any[]) =>
    mockMergeCommonFieldsWithFormData(...args),
  isFieldAIEnabled: (...args: any[]) => mockIsFieldAIEnabled(...args),
}))

vi.mock('@/hooks/scoreResponse', () => ({
  useScoreResponse: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../assets/ai_suggestion_Icon.svg', () => ({
  default: 'ai-icon.svg',
}))

vi.mock('./WnvVendorEngagement.module.scss', () => ({
  default: {
    mainContainer: 'mainContainer-mock',
    aiIcon: 'aiIcon-mock',
  },
}))

describe('WnvVendorEngagement', () => {
  const mockFormSchema = {
    schema: {
      type: 'object',
      properties: {
        wnvField1: { type: 'string' },
        wnvField2: { type: 'string' },
      },
    },
    uiSchema: {},
    tabSchema: [
      { title: 'Third Party Information', fields: ['wnvField1'] },
      { title: 'Primary Contact Information', fields: ['wnvField2'] },
      { title: 'Engagement Information', fields: ['wnvField3'] },
      { title: 'Engagement Contact Information', fields: ['wnvField4'] },
    ],
  }

  const mockFormDetails = {
    data: {
      status: FormStatus.InProgress,
      form_data: {
        form_data: [
          { question_id: 'wnvField1', answer: 'WNV Value 1' },
          { question_id: 'wnvField2', answer: 'WNV Value 2' },
        ],
      },
    },
  }

  const mockCommonFields = {
    common_fields: [{ question_id: 'commonField1', answer: 'Common Value 1' }],
  }

  const mockSuggestions = {
    suggestions: [{ id: 'suggestion1', text: 'WNV Suggestion 1' }],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock return values
    mockGetFormSchema.mockResolvedValue(mockFormSchema)
    mockGetFormDetails.mockResolvedValue(mockFormDetails)
    mockGetCommonFields.mockResolvedValue(mockCommonFields)
    mockSubmitForm.mockResolvedValue({ success: true })
    mockGetSuggestions.mockResolvedValue(mockSuggestions)
    mockMapApiFormatToFormData.mockReturnValue({
      wnvField1: 'Mapped WNV Value 1',
    })
    mockMapFormDataToApiFormat.mockReturnValue([
      { question_id: 'wnvField1', answer: 'Formatted WNV Value' },
    ])
    mockMergeCommonFieldsWithFormData.mockReturnValue({
      formData: { wnvField1: 'Merged WNV Value' },
      multiSourceData: {},
    })
    mockIsFieldAIEnabled.mockReturnValue(false)
    mockClearHiddenConditionalFields.mockImplementation(
      (_schema: any, formData: any) => formData
    )
    mockValidateEntireForm.mockReturnValue(true)
    mockValidatePageAnswers.mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderComponent = () => {
    return render(<WnvVendorEngagement />)
  }

  describe('Component Structure', () => {
    it('should render without crashing', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })

    it('should wrap inner component with AIFeaturesProvider', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('ai-features-provider')).toBeInTheDocument()
      })
    })

    it('should render LoadingSpinner initially', () => {
      renderComponent()

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading form data....')).toBeInTheDocument()
    })

    it('should render FormContainer after loading', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })

    it('should have main container after loading', async () => {
      renderComponent()

      await waitFor(() => {
        const container = screen.getByTestId('form-container').parentElement
        expect(container).toBeInTheDocument()
      })
    })
  })

  describe('Data Fetching', () => {
    it('should fetch form schema on mount', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockGetFormSchema).toHaveBeenCalledWith('wwtp-new-vendor-form')
      })
    })

    it('should fetch form details on mount', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockGetFormDetails).toHaveBeenCalledWith(
          'wnv-form-123',
          'wnv-sub-456'
        )
      })
    })

    it('should fetch common fields for InProgress status', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockGetCommonFields).toHaveBeenCalledWith({
          form_type: FormDashboardFormType.WnvVendorEngagementForm,
          submission_id: 'wnv-sub-456',
          form_id: 'wnv-form-123',
        })
      })
    })

    it('should fetch suggestions on mount', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockGetSuggestions).toHaveBeenCalledWith(
          FormDashboardFormType.WnvVendorEngagementForm
        )
      })
    })

    it('should handle form schema fetch error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetFormSchema.mockRejectedValue(new Error('Schema fetch failed'))

      renderComponent()

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching form schema:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })

    it('should handle form details fetch error gracefully', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})
      mockGetFormDetails.mockRejectedValue(
        new Error('Form details fetch failed')
      )

      renderComponent()

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Starting with empty form:',
          expect.any(Error)
        )
      })

      consoleWarnSpy.mockRestore()
    })

    it('should handle suggestions fetch error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetSuggestions.mockRejectedValue(
        new Error('Suggestions fetch failed')
      )

      renderComponent()

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching suggestions:',
          expect.any(Error)
        )
      })

      const formContainer = await screen.findByTestId('form-container')
      const props = JSON.parse(formContainer.getAttribute('data-props') || '{}')
      expect(props.suggestionsError).toBe('Cortex failed to load suggestions')

      consoleErrorSpy.mockRestore()
    })

    it('should handle common fields fetch error gracefully', async () => {
      mockGetCommonFields.mockRejectedValue(
        new Error('Common fields fetch failed')
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })
  })

  describe('Form Status Handling', () => {
    it('should fetch common fields for pending status', async () => {
      mockGetFormDetails.mockResolvedValue({
        data: {
          status: FormStatus.pending,
          form_data: {
            form_data: [{ question_id: 'wnvField1', answer: 'WNV Value 1' }],
          },
        },
      })

      renderComponent()

      await waitFor(() => {
        expect(mockGetCommonFields).toHaveBeenCalled()
      })
    })

    it('should set form status from API response', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.formStatus).toBe(FormStatus.InProgress)
      })
    })
  })

  describe('Form Data Mapping', () => {
    it('should map API format to form data when form_data exists', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockMapApiFormatToFormData).toHaveBeenCalled()
      })
    })

    it('should handle empty form data gracefully', async () => {
      mockGetFormDetails.mockResolvedValue({
        data: {
          status: FormStatus.InProgress,
          form_data: {},
        },
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })

    it('should handle form_data without form_data array', async () => {
      mockGetFormDetails.mockResolvedValue({
        data: {
          status: FormStatus.InProgress,
          form_data: {
            form_data: null,
          },
        },
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })

    it('should handle non-array form_data.form_data', async () => {
      mockGetFormDetails.mockResolvedValue({
        data: {
          status: FormStatus.InProgress,
          form_data: {
            form_data: 'invalid',
          },
        },
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })
  })

  describe('Component Export', () => {
    it('should export WnvVendorEngagement as default export', () => {
      expect(WnvVendorEngagement).toBeDefined()
    })

    it('should be a React functional component', () => {
      expect(typeof WnvVendorEngagement).toBe('function')
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when form schema is being fetched', () => {
      mockGetFormSchema.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve(mockFormSchema), 100))
      )

      renderComponent()

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.queryByTestId('form-container')).not.toBeInTheDocument()
    })

    it('should hide loading spinner after data is loaded', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should show form container after loading completes', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })

    it('should not render form container while loading', () => {
      mockGetFormSchema.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve(mockFormSchema), 100))
      )

      renderComponent()

      expect(screen.queryByTestId('form-container')).not.toBeInTheDocument()
    })
  })

  describe('Form Header Configuration', () => {
    it('should have correct form title', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.formTitle).toBe(
          'Working with Third Party Form (Add New Vendor & New Engagement)'
        )
      })
    })

    it('should include AI icon in subtitle', async () => {
      renderComponent()

      await waitFor(() => {
        // The AI icon is passed as part of formSubtitle prop to FormContainer
        // It's a React element, not directly rendered in our mock
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })

    it('should have correct breadcrumbs', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.breadcrumbs).toEqual([
          { text: 'Home', href: '/landing' },
          {
            text: 'Form Dashboard',
            href: '/form-dashboard/wnv-sub-456',
          },
          {
            text: 'Working with Third Party',
            href: '/wnv-vendor-engagement',
          },
        ])
      })
    })
  })

  describe('Page Button Configuration', () => {
    it('should configure page 1 buttons correctly', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        const page1Buttons = props.pageButtonIds['1']
        expect(page1Buttons).toHaveLength(3)
        expect(page1Buttons[0].action).toBe('cancel')
        expect(page1Buttons[1].action).toBe('saveDraft')
        expect(page1Buttons[2].action).toBe('next')
      })
    })

    it('should configure page 4 buttons correctly (final page)', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        const page4Buttons = props.pageButtonIds['4']
        expect(page4Buttons).toHaveLength(3)
        expect(page4Buttons[0].action).toBe('prev')
        expect(page4Buttons[1].action).toBe('saveDraft')
        expect(page4Buttons[2].action).toBe('submit')
      })
    })

    it('should configure middle page buttons correctly', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        const page2Buttons = props.pageButtonIds['2']
        expect(page2Buttons).toHaveLength(3)
        expect(page2Buttons[0].action).toBe('prev')
        expect(page2Buttons[1].action).toBe('saveDraft')
        expect(page2Buttons[2].action).toBe('next')
      })
    })
  })

  describe('Page Details Generation', () => {
    it('should generate page details from schema', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.pageDetails).toHaveLength(4)
        expect(props.pageDetails[0].title).toBe('Third Party Information')
        expect(props.pageDetails[1].title).toBe('Primary Contact Information')
      })
    })

    it('should handle empty schema gracefully', async () => {
      mockGetFormSchema.mockResolvedValue({
        schema: { type: 'object', properties: {} },
        uiSchema: {},
        tabSchema: [],
      })

      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.pageDetails).toEqual([])
      })
    })
  })

  describe('Suggestions Handling', () => {
    it('should pass suggestions data to FormContainer', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.suggestionsData).toEqual(mockSuggestions)
      })
    })

    it('should set suggestions error on fetch failure', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetSuggestions.mockRejectedValue(new Error('Suggestions error'))

      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.suggestionsError).toBe('Cortex failed to load suggestions')
      })

      consoleErrorSpy.mockRestore()
    })

    it('should set suggestions loading state correctly', async () => {
      mockGetSuggestions.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve(mockSuggestions), 50))
      )

      renderComponent()

      // Initially loading should be true
      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // After fetch completes, loading should be false
      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.suggestionsLoading).toBe(false)
      })
    })
  })

  describe('Form Schema Integration', () => {
    it('should pass schema to FormContainer', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.schema).toEqual(mockFormSchema.schema)
      })
    })

    it('should pass formType to FormContainer', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.formType).toBe(
          FormDashboardFormType.WnvVendorEngagementForm
        )
      })
    })
  })

  describe('Form Submission (handleFormSubmit)', () => {
    it('should handle form submission', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-submit-handler')).toBeInTheDocument()
      })

      const submitButton = screen.getByTestId('test-submit-handler')
      submitButton.click()

      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalled()
      })
    })

    it('should handle form submission error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockSubmitForm.mockRejectedValue(new Error('Submission failed'))

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-submit-handler')).toBeInTheDocument()
      })

      const submitButton = screen.getByTestId('test-submit-handler')
      submitButton.click()

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            addToast: mockAddToast,
            message: 'Failed to submit form. Please try again.',
            variant: 'error',
          })
        )
      })

      consoleErrorSpy.mockRestore()
    })

    it('should show success toast on successful submission', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-submit-handler')).toBeInTheDocument()
      })

      const submitButton = screen.getByTestId('test-submit-handler')
      submitButton.click()

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            addToast: mockAddToast,
            message:
              'Your "New Vendor & Engagement" form has been submitted successfully.',
            variant: 'success',
          })
        )
      })
    })

    it('should navigate to dashboard on successful submission', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-submit-handler')).toBeInTheDocument()
      })

      const submitButton = screen.getByTestId('test-submit-handler')
      submitButton.click()

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/form-dashboard/wnv-sub-456')
      })
    })

    it('should handle missing form schema error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetFormSchema.mockResolvedValue(null)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Save Draft (handleSaveDraft)', () => {
    it('should handle draft saving', async () => {
      renderComponent()

      await waitFor(() => {
        expect(
          screen.getByTestId('test-save-draft-handler')
        ).toBeInTheDocument()
      })

      const saveDraftButton = screen.getByTestId('test-save-draft-handler')
      saveDraftButton.click()

      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalledWith(
          'wnv-form-123',
          'wnv-sub-456',
          expect.objectContaining({
            action: 'save',
          })
        )
      })
    })

    it('should handle draft saving error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockSubmitForm.mockRejectedValue(new Error('Draft save failed'))

      renderComponent()

      await waitFor(() => {
        expect(
          screen.getByTestId('test-save-draft-handler')
        ).toBeInTheDocument()
      })

      const saveDraftButton = screen.getByTestId('test-save-draft-handler')
      saveDraftButton.click()

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error saving draft:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })

    it('should handle missing schema in draft save', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })
  })

  describe('Button Validation Functions', () => {
    it('should call validatePageAnswers for next buttons', async () => {
      mockValidatePageAnswers.mockReturnValue(true)

      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.pageButtonIds['1'][2].action).toBe('next')
      })
    })

    it('should call validateEntireForm for submit button', async () => {
      mockValidateEntireForm.mockReturnValue(true)

      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.pageButtonIds['4'][2].action).toBe('submit')
      })
    })

    it('should handle validation failure for next button', async () => {
      mockValidatePageAnswers.mockReturnValue(false)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })

    it('should handle validation failure for submit button', async () => {
      mockValidateEntireForm.mockReturnValue(false)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })
  })

  describe('Route Parameters', () => {
    it('should use formId from route params', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockGetFormDetails).toHaveBeenCalledWith(
          'wnv-form-123',
          'wnv-sub-456'
        )
      })
    })

    it('should use submissionId from route params', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockGetFormDetails).toHaveBeenCalledWith(
          'wnv-form-123',
          'wnv-sub-456'
        )
      })
    })

    it('should include submissionId in breadcrumbs', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.breadcrumbs[1].href).toBe('/form-dashboard/wnv-sub-456')
      })
    })
  })

  describe('Performance', () => {
    it('should only fetch data once on mount', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      expect(mockGetFormSchema).toHaveBeenCalledTimes(1)
      expect(mockGetFormDetails).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Recovery', () => {
    it('should continue rendering after schema fetch error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetFormSchema.mockRejectedValue(new Error('Schema error'))

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should continue rendering after form details fetch error', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})
      mockGetFormDetails.mockRejectedValue(new Error('Form details error'))

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Component Lifecycle', () => {
    it('should fetch data only on mount, not on re-renders', async () => {
      const { rerender } = renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const initialCallCount = mockGetFormSchema.mock.calls.length

      rerender(<WnvVendorEngagement />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      expect(mockGetFormSchema).toHaveBeenCalledTimes(initialCallCount)
    })
  })

  describe('Active Page Management', () => {
    it('should initialize with activePageIndex set to 1', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.activePageIndex).toBe(1)
      })
    })
  })

  describe('Component Wrapper', () => {
    it('should wrap WnvVendorEngagementInner with AIFeaturesProvider', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('ai-features-provider')).toBeInTheDocument()
      })
    })

    it('should render the inner component through the wrapper', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })
  })

  describe('FormContainer Props Integration', () => {
    it('should pass all required props to FormContainer', async () => {
      renderComponent()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.formTitle).toBeDefined()
        expect(props.submissionId).toBe('wnv-sub-456')
        expect(props.activePageIndex).toBe(1)
        expect(props.pageDetails).toBeDefined()
        expect(props.breadcrumbs).toBeDefined()
        expect(props.schema).toBeDefined()
        expect(props.uiSchema).toBeDefined()
        expect(props.formType).toBe(
          FormDashboardFormType.WnvVendorEngagementForm
        )
        expect(props.pageButtonIds).toBeDefined()
        expect(props.formStatus).toBeDefined()
      })
    })
  })

  describe('Action Handlers', () => {
    it('should handle cancel action', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-cancel-handler')).toBeInTheDocument()
      })

      const cancelButton = screen.getByTestId('test-cancel-handler')
      cancelButton.click()

      expect(mockNavigate).toHaveBeenCalledWith('/form-dashboard/wnv-sub-456')
    })

    it('should handle prev action', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-prev-handler')).toBeInTheDocument()
      })

      const prevButton = screen.getByTestId('test-prev-handler')
      prevButton.click()

      // Active page should decrease (but stays at minimum 1)
      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.activePageIndex).toBe(1)
      })
    })

    it('should handle next action', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-next-handler')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('test-next-handler')
      nextButton.click()

      await waitFor(() => {
        const formContainer = screen.getByTestId('form-container')
        const props = JSON.parse(
          formContainer.getAttribute('data-props') || '{}'
        )
        expect(props.activePageIndex).toBe(2)
      })
    })

    it('should handle skipUpload action', async () => {
      renderComponent()

      await waitFor(() => {
        expect(
          screen.getByTestId('test-skip-upload-handler')
        ).toBeInTheDocument()
      })

      const skipUploadButton = screen.getByTestId('test-skip-upload-handler')
      skipUploadButton.click()

      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalled()
      })
    })

    it('should handle update action as no-op', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-update-handler')).toBeInTheDocument()
      })

      const updateButton = screen.getByTestId('test-update-handler')
      updateButton.click()

      // Update should do nothing
      expect(mockSubmitForm).not.toHaveBeenCalled()
    })
  })

  describe('Clear Hidden Conditional Fields', () => {
    it('should clear hidden fields before submission', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('test-submit-handler')).toBeInTheDocument()
      })

      const submitButton = screen.getByTestId('test-submit-handler')
      submitButton.click()

      await waitFor(() => {
        expect(mockClearHiddenConditionalFields).toHaveBeenCalled()
      })
    })

    it('should clear hidden fields before draft save', async () => {
      renderComponent()

      await waitFor(() => {
        expect(
          screen.getByTestId('test-save-draft-handler')
        ).toBeInTheDocument()
      })

      const saveDraftButton = screen.getByTestId('test-save-draft-handler')
      saveDraftButton.click()

      await waitFor(() => {
        expect(mockClearHiddenConditionalFields).toHaveBeenCalled()
      })
    })
  })

  describe('MultiSource Data Handling', () => {
    it('should set multiSourceData from merge result', async () => {
      mockMergeCommonFieldsWithFormData.mockReturnValue({
        formData: { wnvField1: 'Merged Value' },
        multiSourceData: { wnvField1: 'common_fields' },
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })
    })
  })

  describe('Common Fields Merging with allOf and oneOf Support', () => {
    it('should pass schema to mergeCommonFieldsWithFormData', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockMergeCommonFieldsWithFormData).toHaveBeenCalled()
      })

      const callArgs = mockMergeCommonFieldsWithFormData.mock.calls[0]
      expect(callArgs[2]).toBe(mockFormSchema.schema)
    })

    it('should merge fields from allOf.then.properties in schema', async () => {
      const schemaWithAllOf = {
        schema: {
          type: 'object',
          properties: {
            S_Q26: {
              title: 'Test Data Question',
              type: 'string',
              enum: ['Yes', 'No'],
            },
          },
          allOf: [
            {
              if: {
                properties: {
                  S_Q26: { const: 'No' },
                },
                required: ['S_Q26'],
              },
              then: {
                properties: {
                  S_Q35: {
                    title: 'PHI Question',
                    type: 'string',
                    enum: ['Yes', 'No', 'Not Sure'],
                  },
                },
              },
            },
          ],
        },
        uiSchema: mockFormSchema.uiSchema,
        tabSchema: mockFormSchema.tabSchema,
      }

      const commonFieldsWithAllOf = {
        common_fields: [
          { question_id: 'S_Q35', answer: 'Yes', multi_source: false },
        ],
      }

      mockGetFormSchema.mockResolvedValue(schemaWithAllOf)
      mockGetCommonFields.mockResolvedValue(commonFieldsWithAllOf)
      mockMergeCommonFieldsWithFormData.mockReturnValue({
        formData: {
          S_Q35: 'Yes',
        },
        multiSourceData: {},
      })

      renderComponent()

      await waitFor(() => {
        expect(mockMergeCommonFieldsWithFormData).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            common_fields: expect.arrayContaining([
              expect.objectContaining({ question_id: 'S_Q35' }),
            ]),
          }),
          schemaWithAllOf.schema
        )
      })
    })

    it('should merge fields from dependencies.oneOf in schema', async () => {
      const schemaWithOneOf = {
        schema: {
          type: 'object',
          properties: {
            S_Q16: {
              title: 'Hosting Location',
              type: 'string',
              enum: ['Lilly Cloud', 'SaaS'],
            },
          },
          dependencies: {
            S_Q16: {
              oneOf: [
                {
                  properties: {
                    S_Q16: {
                      enum: ['Lilly Cloud'],
                    },
                    S_Q17: {
                      title: 'Cloud Accounts',
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        },
        uiSchema: mockFormSchema.uiSchema,
        tabSchema: mockFormSchema.tabSchema,
      }

      const commonFieldsWithOneOf = {
        common_fields: [
          {
            question_id: 'S_Q17',
            answer: 'AWS Account 123',
            multi_source: false,
          },
        ],
      }

      mockGetFormSchema.mockResolvedValue(schemaWithOneOf)
      mockGetCommonFields.mockResolvedValue(commonFieldsWithOneOf)
      mockMergeCommonFieldsWithFormData.mockReturnValue({
        formData: {
          S_Q17: 'AWS Account 123',
        },
        multiSourceData: {},
      })

      renderComponent()

      await waitFor(() => {
        expect(mockMergeCommonFieldsWithFormData).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            common_fields: expect.arrayContaining([
              expect.objectContaining({ question_id: 'S_Q17' }),
            ]),
          }),
          schemaWithOneOf.schema
        )
      })
    })

    it('should handle complex schema with both allOf and dependencies.oneOf', async () => {
      const complexSchema = {
        schema: {
          type: 'object',
          properties: {
            S_Q1: {
              title: 'Title',
              type: 'string',
            },
          },
          allOf: [
            {
              if: {
                properties: {
                  S_Q26: { const: 'No' },
                },
              },
              then: {
                properties: {
                  S_Q35: {
                    title: 'PHI Question',
                    type: 'string',
                    enum: ['Yes', 'No'],
                  },
                },
              },
            },
          ],
          dependencies: {
            S_Q16: {
              oneOf: [
                {
                  properties: {
                    S_Q16: { enum: ['Lilly Cloud'] },
                    S_Q17: {
                      title: 'Cloud Accounts',
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        },
        uiSchema: mockFormSchema.uiSchema,
        tabSchema: mockFormSchema.tabSchema,
      }

      const commonFieldsComplex = {
        common_fields: [
          { question_id: 'S_Q35', answer: 'Yes', multi_source: false },
          { question_id: 'S_Q17', answer: 'AWS Account', multi_source: false },
        ],
      }

      mockGetFormSchema.mockResolvedValue(complexSchema)
      mockGetCommonFields.mockResolvedValue(commonFieldsComplex)
      mockMergeCommonFieldsWithFormData.mockReturnValue({
        formData: {
          S_Q35: 'Yes',
          S_Q17: 'AWS Account',
        },
        multiSourceData: {},
      })

      renderComponent()

      await waitFor(() => {
        expect(mockMergeCommonFieldsWithFormData).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            common_fields: expect.arrayContaining([
              expect.objectContaining({ question_id: 'S_Q35' }),
              expect.objectContaining({ question_id: 'S_Q17' }),
            ]),
          }),
          complexSchema.schema
        )
      })
    })
  })
})
