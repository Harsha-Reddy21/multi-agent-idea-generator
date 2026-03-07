import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ButtonActionId,
  ExtendedFormDashboardFormType,
  FormDashboardFormType,
} from '@/core/constants'
import { FormStatus } from '@/core/models/form.model'

import IdeaSubmissionForm from '../IdeaSubmissionForm'

// Use vi.hoisted to declare mocks that can be used in vi.mock
const {
  mockNavigate,
  mockUseParams,
  mockAddToast,
  mockShowToast,
  mockGetFormSchema,
  mockGetFormDetails,
  mockSubmitForm,
  mockGetSuggestions,
  mockValidatePageAnswers,
  mockClearHiddenConditionalFields,
  mockMapApiFormatToFormData,
  mockMapFormDataToApiFormat,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseParams: vi.fn(),
  mockAddToast: vi.fn(),
  mockShowToast: vi.fn(),
  mockGetFormSchema: vi.fn(),
  mockGetFormDetails: vi.fn(),
  mockSubmitForm: vi.fn(),
  mockGetSuggestions: vi.fn(),
  mockValidatePageAnswers: vi.fn(),
  mockClearHiddenConditionalFields: vi.fn(),
  mockMapApiFormatToFormData: vi.fn(),
  mockMapFormDataToApiFormat: vi.fn(),
}))

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  }
})

vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsImage: ({ src, alt, className, 'aria-hidden': ariaHidden }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      aria-hidden={ariaHidden}
      data-testid="lds-image"
    />
  ),
  useToastContext: () => ({
    addToast: mockAddToast,
  }),
}))

vi.mock('@/core/utils/toast.utils', () => ({
  showToast: (params: any) => mockShowToast(params),
}))

vi.mock('../../../components/FormContainer/FormContainer', () => ({
  FormContainer: ({
    formTitle,
    formSubtitle,
    breadcrumbs,
    formData,
    setFormData,
    onFormSubmit,
    submissionId,
    formType,
    formStatus,
    actionHandlerMap,
    suggestionsLoading,
    suggestionsError,
    progressEnabled,
    activePageIndex,
  }: any) => (
    <div data-testid="form-container">
      <div data-testid="form-title">{formTitle}</div>
      <div data-testid="form-subtitle">{formSubtitle}</div>
      <div data-testid="breadcrumbs">
        {breadcrumbs?.map((crumb: any, index: number) => (
          <span key={index} data-testid={`breadcrumb-${index}`}>
            {crumb.text}
          </span>
        ))}
      </div>
      <div data-testid="form-data">{JSON.stringify(formData)}</div>
      <div data-testid="submission-id">{submissionId}</div>
      <div data-testid="form-type">{formType}</div>
      <div data-testid="form-status">{formStatus}</div>
      <div data-testid="suggestions-loading">{String(suggestionsLoading)}</div>
      <div data-testid="suggestions-error">{suggestionsError}</div>
      <div data-testid="progress-enabled">{String(progressEnabled)}</div>
      <div data-testid="active-page-index">{activePageIndex}</div>

      {/* Mock form interactions */}
      <button
        data-testid="submit-button"
        onClick={() => onFormSubmit && onFormSubmit(formData)}
      >
        Submit
      </button>
      <button
        data-testid="save-draft-button"
        onClick={() => actionHandlerMap?.[ButtonActionId.saveDraft]?.()}
      >
        Save Draft
      </button>
      <button
        data-testid="cancel-button"
        onClick={() => actionHandlerMap?.[ButtonActionId.cancel]?.()}
      >
        Cancel
      </button>

      {/* Mock form data update */}
      <input
        data-testid="form-input"
        onChange={e =>
          setFormData && setFormData({ testField: e.target.value })
        }
      />
    </div>
  ),
}))

vi.mock('../../../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: any) => (
    <div data-testid="loading-spinner" aria-label={message}>
      {message}
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
    getFormSchema: (...args: any[]) => mockGetFormSchema(...args),
    getFormDetails: (...args: any[]) => mockGetFormDetails(...args),
    submitForm: (...args: any[]) => mockSubmitForm(...args),
  },
}))

vi.mock('../../../core/api/suggestions.api', () => ({
  suggestionsApiService: {
    getSuggestions: (...args: any[]) => mockGetSuggestions(...args),
  },
}))

vi.mock('@/core/utils/button.utils', () => ({
  validatePageAnswers: (...args: any[]) => mockValidatePageAnswers(...args),
  clearHiddenConditionalFields: (...args: any[]) =>
    mockClearHiddenConditionalFields(...args),
}))

vi.mock('../../../core/utils/form-mapper.util', () => ({
  mapApiFormatToFormData: (...args: any[]) =>
    mockMapApiFormatToFormData(...args),
  mapFormDataToApiFormat: (...args: any[]) =>
    mockMapFormDataToApiFormat(...args),
}))

// Mock assets
vi.mock('../../../assets/ai_suggestion_Icon.svg', () => ({
  default: 'ai_suggestion_Icon.svg',
}))

describe('IdeaSubmissionForm', () => {
  const mockFormId = 'form-123'
  const mockSubmissionId = 'submission-456'

  const mockFormSchema = {
    schema: {
      type: 'object',
      properties: {
        testField: {
          type: 'string',
          title: 'Test Field',
        },
      },
    },
    uiSchema: {
      testField: {
        'ui:widget': 'textarea',
      },
    },
    tabSchema: [
      {
        title: 'Page 1',
        fields: ['testField'],
      },
    ],
  }

  const mockFormDetails = {
    data: {
      status: FormStatus.pending,
      form_data: {
        form_data: [
          {
            question_id: 'testField',
            answer: 'Test Answer',
          },
        ],
      },
    },
  }

  const mockSuggestionsData = {
    suggestions: [
      {
        id: 'suggestion-1',
        text: 'Test suggestion',
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseParams.mockReturnValue({
      formId: mockFormId,
      submissionId: mockSubmissionId,
    })

    mockGetFormSchema.mockResolvedValue(mockFormSchema)
    mockGetFormDetails.mockResolvedValue(mockFormDetails)
    mockGetSuggestions.mockResolvedValue(mockSuggestionsData)
    mockValidatePageAnswers.mockReturnValue(true)
    mockClearHiddenConditionalFields.mockImplementation(data => data)
    mockMapApiFormatToFormData.mockReturnValue({ testField: 'Test Answer' })
    mockMapFormDataToApiFormat.mockReturnValue([
      {
        questionId: 'testField',
        question: 'Test Field',
        answer: ['Test Answer'],
        type: 'string',
      },
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render loading spinner initially', async () => {
      render(<IdeaSubmissionForm />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading form data....')).toBeInTheDocument()
    })

    it('should render AI features provider wrapper', () => {
      render(<IdeaSubmissionForm />)

      expect(screen.getByTestId('ai-features-provider')).toBeInTheDocument()
    })

    it('should render form container after loading', async () => {
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    it('should render correct form title and subtitle', async () => {
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-title')).toHaveTextContent(
          'Solution/System Overview'
        )
      })

      expect(screen.getByTestId('form-subtitle')).toBeInTheDocument()
      expect(screen.getByTestId('lds-image')).toBeInTheDocument()
    })

    it('should render breadcrumbs correctly', async () => {
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Home')
        expect(screen.getByTestId('breadcrumb-1')).toHaveTextContent(
          'Form Dashboard'
        )
        expect(screen.getByTestId('breadcrumb-2')).toHaveTextContent(
          'Solution/System Overview'
        )
      })
    })
  })

  describe('Data Loading', () => {
    it('should fetch form schema on mount', async () => {
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(mockGetFormSchema).toHaveBeenCalledWith(
          ExtendedFormDashboardFormType.IdeaSubForm
        )
      })
    })

    it('should fetch form details on mount', async () => {
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(mockGetFormDetails).toHaveBeenCalledWith(
          mockFormId,
          mockSubmissionId
        )
      })
    })

    it('should fetch suggestions data on mount', async () => {
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(mockGetSuggestions).toHaveBeenCalledWith(
          FormDashboardFormType.IdeaSubForm
        )
      })
    })

    it('should handle form details fetch error gracefully', async () => {
      mockGetFormDetails.mockRejectedValue(new Error('API Error'))

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Should continue with empty form data
      expect(screen.getByTestId('form-data')).toHaveTextContent('{}')
    })

    it('should handle suggestions fetch error', async () => {
      mockGetSuggestions.mockRejectedValue(new Error('Suggestions API Error'))

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-error')).toHaveTextContent(
          'Cortex failed to load suggestions'
        )
      })
    })
  })

  describe('Form Data Management', () => {
    it('should initialize form data correctly', async () => {
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(mockMapApiFormatToFormData).toHaveBeenCalledWith(
          mockFormDetails.data.form_data.form_data,
          mockFormSchema.schema
        )
      })

      expect(screen.getByTestId('form-data')).toHaveTextContent(
        '{"testField":"Test Answer"}'
      )
    })

    it('should update form data when user inputs change', async () => {
      const user = userEvent.setup()
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const input = screen.getByTestId('form-input')
      await user.type(input, 'New Value')

      expect(screen.getByTestId('form-data')).toHaveTextContent(
        '{"testField":"New Value"}'
      )
    })

    it('should pass correct props to FormContainer', async () => {
      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('submission-id')).toHaveTextContent(
          mockSubmissionId
        )
        expect(screen.getByTestId('form-type')).toHaveTextContent(
          FormDashboardFormType.IdeaSubForm
        )
        expect(screen.getByTestId('form-status')).toHaveTextContent(
          FormStatus.pending
        )
        expect(screen.getByTestId('progress-enabled')).toHaveTextContent(
          'false'
        )
        expect(screen.getByTestId('active-page-index')).toHaveTextContent('1')
      })
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission successfully', async () => {
      const user = userEvent.setup()
      mockSubmitForm.mockResolvedValue({})

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockClearHiddenConditionalFields).toHaveBeenCalled()
        expect(mockMapFormDataToApiFormat).toHaveBeenCalled()
        expect(mockSubmitForm).toHaveBeenCalledWith(
          mockFormId,
          mockSubmissionId,
          expect.objectContaining({
            action: 'submit',
            form_data: {
              form_data: expect.any(Array),
            },
          })
        )
      })

      expect(mockShowToast).toHaveBeenCalledWith({
        addToast: mockAddToast,
        message:
          'Your "System / Solution Overview" form has been submitted successfully.',
        variant: 'success',
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        `/form-dashboard/${mockSubmissionId}`
      )
    })

    it('should handle form submission error', async () => {
      const user = userEvent.setup()
      mockSubmitForm.mockRejectedValue(new Error('Submission failed'))

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          addToast: mockAddToast,
          message: 'Failed to submit form. Please try again.',
          variant: 'error',
        })
      })
    })

    it('should not submit when form schema is not loaded', async () => {
      mockGetFormSchema.mockResolvedValue(null)

      render(<IdeaSubmissionForm />)

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(screen.queryByTestId('loading-spinner')).toBeInTheDocument()
        },
        { timeout: 1000 }
      )
    })
  })

  describe('Save Draft Functionality', () => {
    it('should handle save draft successfully', async () => {
      const user = userEvent.setup()
      mockSubmitForm.mockResolvedValue({})

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const saveDraftButton = screen.getByTestId('save-draft-button')
      await user.click(saveDraftButton)

      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalledWith(
          mockFormId,
          mockSubmissionId,
          expect.objectContaining({
            action: 'save',
            form_data: {
              form_data: expect.any(Array),
            },
          })
        )
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        `/form-dashboard/${mockSubmissionId}`
      )
    })

    it('should handle save draft error gracefully', async () => {
      const user = userEvent.setup()
      mockSubmitForm.mockRejectedValue(new Error('Save failed'))

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const saveDraftButton = screen.getByTestId('save-draft-button')
      await user.click(saveDraftButton)

      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalled()
      })

      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Navigation and Actions', () => {
    it('should handle cancel action', async () => {
      const user = userEvent.setup()

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      const cancelButton = screen.getByTestId('cancel-button')
      await user.click(cancelButton)

      expect(mockNavigate).toHaveBeenCalledWith(
        `/form-dashboard/${mockSubmissionId}`
      )
    })
  })

  describe('Suggestions Integration', () => {
    it('should display suggestions loading state', async () => {
      mockGetSuggestions.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      expect(screen.getByTestId('suggestions-loading')).toHaveTextContent(
        'true'
      )
    })

    it('should display suggestions error state', async () => {
      mockGetSuggestions.mockRejectedValue(new Error('API Error'))

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-error')).toHaveTextContent(
          'Cortex failed to load suggestions'
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing route parameters', async () => {
      mockUseParams.mockReturnValue({})

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(mockGetFormDetails).toHaveBeenCalledWith('', '')
      })
    })

    it('should handle empty form data from API', async () => {
      mockGetFormDetails.mockResolvedValue({
        data: {
          status: FormStatus.pending,
          form_data: null,
        },
      })

      render(<IdeaSubmissionForm />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      expect(screen.getByTestId('form-data')).toHaveTextContent('{}')
    })

    it('should handle form schema fetch error', async () => {
      mockGetFormSchema.mockRejectedValue(new Error('Schema fetch failed'))

      render(<IdeaSubmissionForm />)

      // Should show loading spinner when schema is null
      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      })

      // Should not render form container when schema fails to load
      expect(screen.queryByTestId('form-container')).not.toBeInTheDocument()
    })
  })
})
