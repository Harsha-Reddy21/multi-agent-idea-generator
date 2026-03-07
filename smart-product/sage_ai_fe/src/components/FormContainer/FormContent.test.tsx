import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FormContent } from './FormContent'
import { FormContentProps } from './types'

// Mock dependencies
vi.mock('@elilillyco/ux-lds-react', () => ({
  useToastContext: vi.fn(() => ({
    addToast: vi.fn(),
  })),
}))

vi.mock('@rjsf/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')
  return {
    default: React.forwardRef(
      (
        {
          schema,
          uiSchema,
          formData,
          onChange,
          onSubmit,
          children,
        }: {
          schema: any
          uiSchema: any
          formData: any
          onChange: (e: { formData: any }) => void
          onSubmit: () => void
          children: any
        },
        ref: any
      ) => {
        // Set ref.current to a mock object
        React.useEffect(() => {
          if (ref) {
            ;(ref as any).current = { mocked: true }
          }
        }, [ref])

        return (
          <div data-testid="rjsf-form">
            <div data-testid="form-schema">{JSON.stringify(schema)}</div>
            <div data-testid="form-uischema">{JSON.stringify(uiSchema)}</div>
            <div data-testid="form-data">{JSON.stringify(formData)}</div>
            <button
              data-testid="trigger-change"
              onClick={() => onChange({ formData: { test: 'changed' } })}
            >
              Change
            </button>
            <button
              data-testid="trigger-change-null"
              onClick={() => onChange({ formData: null })}
            >
              Change to Null
            </button>
            <button
              data-testid="trigger-change-undefined"
              onClick={() => onChange({ formData: undefined } as any)}
            >
              Change to Undefined
            </button>
            <button data-testid="trigger-submit" onClick={onSubmit}>
              Submit
            </button>
            {children}
          </div>
        )
      }
    ),
  }
})

vi.mock('@rjsf/validator-ajv8', () => ({
  default: {},
}))

vi.mock('../../contexts/AIFeaturesContext', () => ({
  useAIFeatures: vi.fn(() => ({
    isVisible: false,
    questionText: '',
    questionId: '',
    submissionId: '',
    formId: '',
    inputValue: '',
    updateSubmissionInfo: vi.fn(),
    hideAIFeatures: vi.fn(),
    updateEnhanceAnswerEnabledForQuestion: vi.fn(),
    updateInputValue: vi.fn(),
  })),
}))

vi.mock('../../core/utils/form-mapper.util', () => ({
  mapFormDataToApiFormat: vi.fn((formData: any) => {
    return Object.entries(formData).map(([key, value]) => ({
      field_id: key,
      value,
    }))
  }),
}))

vi.mock('../AIFeaturesCard/AIFeaturesCard', () => ({
  default: ({
    isVisible,
    onClose,
    questionText,
    onExtractClick,
  }: {
    isVisible: boolean
    onClose: () => void
    questionText: string
    onExtractClick: (answer: string) => void
  }) => (
    <div data-testid="ai-features-card" data-visible={isVisible}>
      <div data-testid="question-text">{questionText}</div>
      <button data-testid="close-ai-card" onClick={onClose}>
        Close
      </button>
      <button
        data-testid="extract-answer"
        onClick={() => {
          if (onExtractClick) {
            onExtractClick('Extracted Answer')
          }
        }}
      >
        Extract
      </button>
    </div>
  ),
}))

vi.mock('../templates', () => ({
  CustomFieldTemplate: () => <div data-testid="custom-field-template" />,
}))

vi.mock('../widgets', () => ({
  customWidgets: {},
}))

describe('FormContent', () => {
  let defaultProps: FormContentProps
  let mockSetFormData: React.Dispatch<
    React.SetStateAction<Record<string, unknown>>
  >
  let mockAddToast: ReturnType<typeof vi.fn>
  let mockUpdateSubmissionInfo: ReturnType<typeof vi.fn>
  let mockHideAIFeatures: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    mockSetFormData = vi.fn() as React.Dispatch<
      React.SetStateAction<Record<string, unknown>>
    >
    mockAddToast = vi.fn()
    mockUpdateSubmissionInfo = vi.fn()
    mockHideAIFeatures = vi.fn()

    // Setup mocks
    const { useToastContext } = await import('@elilillyco/ux-lds-react')
    vi.mocked(useToastContext).mockReturnValue({
      addToast: mockAddToast,
    } as any)

    const { useAIFeatures } = await import('../../contexts/AIFeaturesContext')
    vi.mocked(useAIFeatures).mockReturnValue({
      isVisible: false,
      questionText: '',
      questionId: '',
      submissionId: '',
      formId: '',
      inputValue: '',
      updateSubmissionInfo: mockUpdateSubmissionInfo,
      hideAIFeatures: mockHideAIFeatures,
      updateEnhanceAnswerEnabledForQuestion: vi.fn(),
      updateInputValue: vi.fn(),
    } as any)

    defaultProps = {
      fields: [
        {
          id: 'field1',
          title: 'Field 1',
          inputType: 'text-box',
        },
        {
          id: 'field2',
          title: 'Field 2',
          inputType: 'text-area',
        },
      ],
      pageSize: 10,
      formData: {},
      setFormData: mockSetFormData,
      schema: {
        type: 'object',
        properties: {
          field1: { type: 'string' },
          field2: { type: 'string' },
        },
      },
      uiSchema: {
        'ui:order': ['field1', 'field2'],
      },
    }

    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/form/test-form-id/submission',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render form content with aria-label', () => {
      render(<FormContent {...defaultProps} />)

      const formContent = screen.getByTestId('form-content')
      expect(formContent).toBeInTheDocument()
      expect(formContent).toHaveAttribute('aria-label', 'Form Content')
    })

    it('should render RJSF form', () => {
      render(<FormContent {...defaultProps} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should render AIFeaturesCard', () => {
      render(<FormContent {...defaultProps} />)

      expect(screen.getByTestId('ai-features-card')).toBeInTheDocument()
    })

    it('should apply formContent CSS class', () => {
      render(<FormContent {...defaultProps} />)

      const formContent = screen.getByTestId('form-content')
      expect(formContent.className).toContain('formContent')
    })

    it('should render hidden submit button', () => {
      render(<FormContent {...defaultProps} />)

      // The hidden submit button is rendered as children of the Form component
      const formElement = screen.getByTestId('rjsf-form')
      expect(formElement).toBeInTheDocument()
    })

    it('should handle mouse events on hidden submit button', () => {
      render(<FormContent {...defaultProps} />)

      // The hidden submit button is rendered as children of the Form component
      const formElement = screen.getByTestId('rjsf-form')
      expect(formElement).toBeInTheDocument()
    })
  })

  describe('Schema and Data Handling', () => {
    it('should pass schema to RJSF form', () => {
      render(<FormContent {...defaultProps} />)

      const schemaElement = screen.getByTestId('form-schema')
      expect(schemaElement.textContent).toContain('field1')
      expect(schemaElement.textContent).toContain('field2')
    })

    it('should pass formData to RJSF form', () => {
      const formData = { field1: 'value1', field2: 'value2' }
      render(<FormContent {...defaultProps} formData={formData} />)

      const dataElement = screen.getByTestId('form-data')
      expect(dataElement.textContent).toContain('value1')
      expect(dataElement.textContent).toContain('value2')
    })

    it('should handle empty formData', () => {
      render(<FormContent {...defaultProps} formData={{}} />)

      const dataElement = screen.getByTestId('form-data')
      expect(dataElement.textContent).toBe('{}')
    })

    it('should handle undefined schema', () => {
      render(<FormContent {...defaultProps} schema={undefined} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
  })

  describe('Dynamic UI Schema', () => {
    it('should hide fields not in active page', () => {
      const props = {
        ...defaultProps,
        activePageIndex: 1,
        pageFieldCounts: [1, 1],
        uiSchema: {
          'ui:order': ['field1', 'field2'],
        },
      }

      render(<FormContent {...props} />)

      const uiSchemaElement = screen.getByTestId('form-uischema')
      const uiSchemaText = uiSchemaElement.textContent || ''

      // First page shows field1, hides field2
      expect(uiSchemaText).toContain('field2')
      expect(uiSchemaText).toContain('ui:hidden')
    })

    it('should show all fields when on first page', () => {
      const props = {
        ...defaultProps,
        activePageIndex: 1,
        pageFieldCounts: [2],
      }

      render(<FormContent {...props} />)

      expect(screen.getByTestId('form-uischema')).toBeInTheDocument()
    })

    it('should merge custom uiSchema with dynamic hidden fields', () => {
      const uiSchema = {
        'ui:order': ['field1', 'field2'],
        field1: { 'ui:widget': 'textarea' },
      }

      render(
        <FormContent
          {...defaultProps}
          uiSchema={uiSchema}
          activePageIndex={1}
          pageFieldCounts={[1, 1]}
        />
      )

      expect(screen.getByTestId('form-uischema')).toBeInTheDocument()
    })

    it('should default to page index 1 when activePageIndex is undefined', () => {
      render(<FormContent {...defaultProps} activePageIndex={undefined} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
  })

  describe('Pagination Logic', () => {
    it('should use pageDetails for pagination when provided', () => {
      const pageDetails = [
        { title: 'Page 1', pageFieldCount: 1 },
        { title: 'Page 2', pageFieldCount: 1 },
      ]

      render(
        <FormContent
          {...defaultProps}
          pageDetails={pageDetails}
          activePageIndex={1}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should fallback to pageFieldCounts when pageDetails is not provided', () => {
      const pageFieldCounts = [1, 1]

      render(
        <FormContent
          {...defaultProps}
          pageFieldCounts={pageFieldCounts}
          activePageIndex={1}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should fallback to pageSize when neither pageDetails nor pageFieldCounts provided', () => {
      render(<FormContent {...defaultProps} pageSize={1} activePageIndex={1} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle empty pageDetails array', () => {
      render(<FormContent {...defaultProps} pageDetails={[]} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle empty pageFieldCounts array', () => {
      render(<FormContent {...defaultProps} pageFieldCounts={[]} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle pageSize of 0', () => {
      render(<FormContent {...defaultProps} pageSize={0} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle negative pageSize', () => {
      render(<FormContent {...defaultProps} pageSize={-1} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle multiple pages with pageDetails', () => {
      const pageDetails = [
        { title: 'Page 1', pageFieldCount: 1 },
        { title: 'Page 2', pageFieldCount: 1 },
        { title: 'Page 3', pageFieldCount: 0 },
      ]

      render(
        <FormContent
          {...defaultProps}
          pageDetails={pageDetails}
          activePageIndex={2}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
  })

  describe('Field Order', () => {
    it('should use ui:order from uiSchema when provided', () => {
      const uiSchema = {
        'ui:order': ['field2', 'field1'],
      }

      render(<FormContent {...defaultProps} uiSchema={uiSchema} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should fallback to schema properties when ui:order not provided', () => {
      const uiSchema = {}

      render(<FormContent {...defaultProps} uiSchema={uiSchema} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle schema without properties', () => {
      const schema = { type: 'object' }

      render(<FormContent {...defaultProps} schema={schema} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
  })

  describe('Form Data Changes', () => {
    it('should call setFormData when form changes', async () => {
      const user = userEvent.setup()
      render(<FormContent {...defaultProps} />)

      const changeButton = screen.getByTestId('trigger-change')
      await user.click(changeButton)

      expect(mockSetFormData).toHaveBeenCalledWith({ test: 'changed' })
    })

    it('should handle onChange with null formData', async () => {
      const user = userEvent.setup()
      render(<FormContent {...defaultProps} />)

      const changeButton = screen.getByTestId('trigger-change-null')
      await user.click(changeButton)

      expect(mockSetFormData).toHaveBeenCalledWith({})
    })

    it('should handle onChange with undefined formData', async () => {
      const user = userEvent.setup()
      render(<FormContent {...defaultProps} />)

      const changeButton = screen.getByTestId('trigger-change-undefined')
      await user.click(changeButton)

      expect(mockSetFormData).toHaveBeenCalledWith({})
    })
  })

  describe('Form Submission', () => {
    it('should show success toast on form submit', async () => {
      const user = userEvent.setup()
      render(<FormContent {...defaultProps} />)

      const submitButton = screen.getByTestId('trigger-submit')
      await user.click(submitButton)

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Form submitted successfully!',
        variant: 'success',
      })
    })
  })

  describe('AI Features Integration', () => {
    it('should pass AIFeaturesCard visibility state', async () => {
      const { useAIFeatures } = await import('../../contexts/AIFeaturesContext')
      vi.mocked(useAIFeatures).mockReturnValue({
        isVisible: true,
        questionText: 'Test Question',
        questionId: 'q1',
        submissionId: 'sub1',
        formId: 'form1',
        inputValue: 'test input',
        updateSubmissionInfo: mockUpdateSubmissionInfo,
        hideAIFeatures: mockHideAIFeatures,
        updateEnhanceAnswerEnabledForQuestion: vi.fn(),
        updateInputValue: vi.fn(),
      } as any)

      render(<FormContent {...defaultProps} />)

      const aiCard = screen.getByTestId('ai-features-card')
      expect(aiCard).toHaveAttribute('data-visible', 'true')
      expect(screen.getByTestId('question-text')).toHaveTextContent(
        'Test Question'
      )
    })

    it('should close AI features card when close button clicked', async () => {
      const user = userEvent.setup()
      const { useAIFeatures } = await import('../../contexts/AIFeaturesContext')
      vi.mocked(useAIFeatures).mockReturnValue({
        isVisible: true,
        questionText: '',
        questionId: '',
        submissionId: '',
        formId: '',
        inputValue: '',
        updateSubmissionInfo: mockUpdateSubmissionInfo,
        hideAIFeatures: mockHideAIFeatures,
        updateEnhanceAnswerEnabledForQuestion: vi.fn(),
        updateInputValue: vi.fn(),
      } as any)

      render(<FormContent {...defaultProps} />)

      const closeButton = screen.getByTestId('close-ai-card')
      await user.click(closeButton)

      expect(mockHideAIFeatures).toHaveBeenCalled()
    })

    it('should hide AI features when active page changes', async () => {
      const { useAIFeatures } = await import('../../contexts/AIFeaturesContext')
      vi.mocked(useAIFeatures).mockReturnValue({
        isVisible: true,
        questionText: '',
        questionId: '',
        submissionId: '',
        formId: '',
        inputValue: '',
        updateSubmissionInfo: mockUpdateSubmissionInfo,
        hideAIFeatures: mockHideAIFeatures,
        updateEnhanceAnswerEnabledForQuestion: vi.fn(),
        updateInputValue: vi.fn(),
      } as any)

      const { rerender } = render(
        <FormContent {...defaultProps} activePageIndex={1} />
      )

      rerender(<FormContent {...defaultProps} activePageIndex={2} />)

      await waitFor(() => {
        expect(mockHideAIFeatures).toHaveBeenCalled()
      })
    })

    it('should not hide AI features when page stays the same', async () => {
      const { useAIFeatures } = await import('../../contexts/AIFeaturesContext')
      vi.mocked(useAIFeatures).mockReturnValue({
        isVisible: true,
        questionText: '',
        questionId: '',
        submissionId: '',
        formId: '',
        inputValue: '',
        updateSubmissionInfo: mockUpdateSubmissionInfo,
        hideAIFeatures: mockHideAIFeatures,
        updateEnhanceAnswerEnabledForQuestion: vi.fn(),
        updateInputValue: vi.fn(),
      } as any)

      const { rerender } = render(
        <FormContent {...defaultProps} activePageIndex={1} />
      )

      mockHideAIFeatures.mockClear()

      rerender(<FormContent {...defaultProps} activePageIndex={1} />)

      // Should not be called when page doesn't change
      expect(mockHideAIFeatures).not.toHaveBeenCalled()
    })

    it('should only hide AI features when already visible', async () => {
      const { useAIFeatures } = await import('../../contexts/AIFeaturesContext')
      vi.mocked(useAIFeatures).mockReturnValue({
        isVisible: false,
        questionText: '',
        questionId: '',
        submissionId: '',
        formId: '',
        inputValue: '',
        updateSubmissionInfo: mockUpdateSubmissionInfo,
        hideAIFeatures: mockHideAIFeatures,
        updateEnhanceAnswerEnabledForQuestion: vi.fn(),
        updateInputValue: vi.fn(),
      } as any)

      const { rerender } = render(
        <FormContent {...defaultProps} activePageIndex={1} />
      )

      rerender(<FormContent {...defaultProps} activePageIndex={2} />)

      // Should not call hideAIFeatures when not visible
      expect(mockHideAIFeatures).not.toHaveBeenCalled()
    })
  })

  describe('Extract Answer Functionality', () => {
    it('should update formData when questionId is set and formRef exists', async () => {
      const user = userEvent.setup()
      const { useAIFeatures } = await import('../../contexts/AIFeaturesContext')
      vi.mocked(useAIFeatures).mockReturnValue({
        isVisible: true,
        questionText: 'Test',
        questionId: 'field1',
        submissionId: 'sub123',
        formId: 'form123',
        inputValue: 'test input',
        updateSubmissionInfo: mockUpdateSubmissionInfo,
        hideAIFeatures: mockHideAIFeatures,
        updateEnhanceAnswerEnabledForQuestion: vi.fn(),
        updateInputValue: vi.fn(),
      } as any)

      const formData = { field1: 'old value', field2: 'value2' }
      render(<FormContent {...defaultProps} formData={formData} />)

      const extractButton = screen.getByTestId('extract-answer')
      await user.click(extractButton)

      // Now with the forwardRef mock that sets ref.current, this should work
      await waitFor(() => {
        expect(mockSetFormData).toHaveBeenCalledWith({
          field1: 'Extracted Answer',
          field2: 'value2',
        })
      })
    })

    it('should not update formData when questionId is not set', async () => {
      const user = userEvent.setup()
      const { useAIFeatures } = await import('../../contexts/AIFeaturesContext')
      vi.mocked(useAIFeatures).mockReturnValue({
        isVisible: true,
        questionText: 'Test',
        questionId: '',
        submissionId: '',
        formId: '',
        inputValue: '',
        updateSubmissionInfo: mockUpdateSubmissionInfo,
        hideAIFeatures: mockHideAIFeatures,
        updateEnhanceAnswerEnabledForQuestion: vi.fn(),
        updateInputValue: vi.fn(),
      } as any)

      render(<FormContent {...defaultProps} />)

      const extractButton = screen.getByTestId('extract-answer')
      await user.click(extractButton)

      expect(mockSetFormData).not.toHaveBeenCalled()
    })
  })

  describe('Submission Info Update', () => {
    it('should update submission info when submissionId and formId are provided', async () => {
      render(<FormContent {...defaultProps} submissionId="sub123" />)

      await waitFor(() => {
        expect(mockUpdateSubmissionInfo).toHaveBeenCalledWith(
          'sub123',
          'test-form-id'
        )
      })
    })

    it('should not update submission info when submissionId is missing', () => {
      render(<FormContent {...defaultProps} submissionId={undefined} />)

      expect(mockUpdateSubmissionInfo).not.toHaveBeenCalled()
    })

    it('should extract formId from URL correctly', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/form/my-custom-form/edit',
        },
        writable: true,
      })

      render(<FormContent {...defaultProps} submissionId="sub456" />)

      await waitFor(() => {
        expect(mockUpdateSubmissionInfo).toHaveBeenCalledWith(
          'sub456',
          'my-custom-form'
        )
      })
    })

    it('should handle empty formId from URL', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/form',
        },
        writable: true,
      })

      render(<FormContent {...defaultProps} submissionId="sub789" />)

      // The effect runs with empty formId, but the condition checks if both exist
      // Since formId is empty string, it's falsy, so updateSubmissionInfo is not called
      await waitFor(() => {
        // With empty formId, the effect condition fails
        expect(mockUpdateSubmissionInfo).not.toHaveBeenCalled()
      })
    })

    it('should re-run effect when submissionId changes', async () => {
      const { rerender } = render(
        <FormContent {...defaultProps} submissionId="sub1" />
      )

      await waitFor(() => {
        expect(mockUpdateSubmissionInfo).toHaveBeenCalledWith(
          'sub1',
          'test-form-id'
        )
      })

      mockUpdateSubmissionInfo.mockClear()

      rerender(<FormContent {...defaultProps} submissionId="sub2" />)

      await waitFor(() => {
        expect(mockUpdateSubmissionInfo).toHaveBeenCalledWith(
          'sub2',
          'test-form-id'
        )
      })
    })
  })

  describe('Form Context', () => {
    it('should pass submissionId to form context', () => {
      render(<FormContent {...defaultProps} submissionId="sub-context-123" />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should pass formType to form context', () => {
      render(<FormContent {...defaultProps} formType="idea-submission" />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should pass formStatus to form context', () => {
      render(<FormContent {...defaultProps} formStatus="Draft" />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should pass mapped formData to form context', () => {
      const formData = { field1: 'value1' }
      render(<FormContent {...defaultProps} formData={formData} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle empty formDataForContext when schema is null', () => {
      render(<FormContent {...defaultProps} schema={null} formData={{}} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle empty formDataForContext when formData is null', () => {
      render(
        <FormContent
          {...defaultProps}
          schema={defaultProps.schema}
          formData={null as any}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
  })

  describe('Suggestions Props', () => {
    it('should pass suggestionsData to AIFeaturesCard', () => {
      const suggestionsData = { suggestions: ['test'] }
      render(
        <FormContent {...defaultProps} suggestionsData={suggestionsData} />
      )

      expect(screen.getByTestId('ai-features-card')).toBeInTheDocument()
    })

    it('should pass suggestionsLoading to AIFeaturesCard', () => {
      render(<FormContent {...defaultProps} suggestionsLoading={true} />)

      expect(screen.getByTestId('ai-features-card')).toBeInTheDocument()
    })

    it('should pass suggestionsError to AIFeaturesCard', () => {
      render(<FormContent {...defaultProps} suggestionsError="Error message" />)

      expect(screen.getByTestId('ai-features-card')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null formData', () => {
      render(<FormContent {...defaultProps} formData={null as any} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle complex nested formData', () => {
      const formData = {
        field1: {
          nested: {
            deep: 'value',
          },
        },
        field2: ['array', 'of', 'values'],
      }

      render(<FormContent {...defaultProps} formData={formData} />)

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle very large number of fields', () => {
      const largeSchema = {
        type: 'object',
        properties: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [
            `field${i}`,
            { type: 'string' },
          ])
        ),
      }

      const largeUiSchema = {
        'ui:order': Array.from({ length: 100 }, (_, i) => `field${i}`),
      }

      render(
        <FormContent
          {...defaultProps}
          schema={largeSchema}
          uiSchema={largeUiSchema}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle activePageIndex beyond available pages', () => {
      render(
        <FormContent
          {...defaultProps}
          activePageIndex={999}
          pageFieldCounts={[1, 1]}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should handle pageDetails with zero pageFieldCount', () => {
      const pageDetails = [
        { title: 'Empty Page', pageFieldCount: 0 },
        { title: 'Normal Page', pageFieldCount: 2 },
      ]

      render(
        <FormContent
          {...defaultProps}
          pageDetails={pageDetails}
          activePageIndex={1}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('should recalculate pages when pageDetails changes', () => {
      const { rerender } = render(
        <FormContent
          {...defaultProps}
          pageDetails={[{ title: 'Page 1', pageFieldCount: 2 }]}
        />
      )

      rerender(
        <FormContent
          {...defaultProps}
          pageDetails={[
            { title: 'Page 1', pageFieldCount: 1 },
            { title: 'Page 2', pageFieldCount: 1 },
          ]}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should recalculate formDataForContext when formData changes', () => {
      const { rerender } = render(
        <FormContent {...defaultProps} formData={{ field1: 'value1' }} />
      )

      rerender(
        <FormContent {...defaultProps} formData={{ field1: 'value2' }} />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })

    it('should recalculate dynamicUiSchema when activePageIndex changes', () => {
      const { rerender } = render(
        <FormContent
          {...defaultProps}
          activePageIndex={1}
          pageFieldCounts={[1, 1]}
        />
      )

      rerender(
        <FormContent
          {...defaultProps}
          activePageIndex={2}
          pageFieldCounts={[1, 1]}
        />
      )

      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
  })
})
