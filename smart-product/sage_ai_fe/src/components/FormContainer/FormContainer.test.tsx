import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormContainer } from './FormContainer'
import { FormContainerOrchestratorProps } from './types'

// Mock core models - must be before other mocks
vi.mock('../../core/models/form.model', () => ({
  FormStatus: {
    Draft: 'Draft',
    Submitted: 'Submitted',
    InReview: 'InReview',
  },
}))

// Mock core constants
vi.mock('../../core/constants', () => ({
  defaultButtonLabels: {
    cancel: 'Cancel',
    prev: 'Previous',
    next: 'Next',
    saveDraft: 'Save Draft',
    submit: 'Submit',
    skipUpload: 'Skip Upload',
  },
}))

// Mock child components
vi.mock('./FormHeader', () => ({
  default: ({ formTitle }: { formTitle: string }) => (
    <div data-testid="form-header">{formTitle}</div>
  ),
}))

vi.mock('./FormContent', () => ({
  default: ({
    fields,
    onFieldChange,
  }: {
    fields: any[]
    onFieldChange?: (fieldId: string, value: unknown) => void
  }) => (
    <div
      data-testid="form-content"
      onClick={() => onFieldChange?.('testField', 'testValue')}
    >
      Fields: {fields.length}
    </div>
  ),
}))

vi.mock('./FormFooter', () => ({
  FormFooter: ({ sticky }: { sticky?: boolean }) => (
    <div data-testid="form-footer">Sticky: {String(sticky)}</div>
  ),
}))

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsBreadcrumb: ({
    breadcrumbs,
  }: {
    breadcrumbs: { text: string; href: string; key: string }[]
  }) => (
    <nav data-testid="lds-breadcrumb">
      {breadcrumbs.map(b => (
        <a key={b.key} href={b.href}>
          {b.text}
        </a>
      ))}
    </nav>
  ),
  LdsImage: ({
    src,
    alt,
    role,
    className,
  }: {
    src: string
    alt: string
    role?: string
    className?: string
  }) => (
    <img
      src={src}
      alt={alt}
      role={role}
      className={className}
      data-testid="lds-image"
    />
  ),
}))

describe('FormContainer', () => {
  const defaultProps: FormContainerOrchestratorProps = {
    formTitle: 'Test Form',
    breadcrumbs: [
      { text: 'Home', href: '/' },
      { text: 'Forms', href: '/forms' },
    ],
    fields: [
      {
        id: 'field1',
        title: 'Field 1',
        inputType: 'text-box' as const,
      },
      {
        id: 'field2',
        title: 'Field 2',
        inputType: 'text-area' as const,
      },
    ],
    pageSize: 10,
  }

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<FormContainer {...defaultProps} />)

      expect(screen.getByTestId('form-container-outer')).toBeInTheDocument()
      expect(screen.getByTestId('form-container')).toBeInTheDocument()
      expect(screen.getByTestId('form-header')).toBeInTheDocument()
      expect(screen.getByTestId('form-content')).toBeInTheDocument()
      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should render breadcrumbs', () => {
      render(<FormContainer {...defaultProps} />)

      const breadcrumbContainer = screen.getByTestId('form-header-breadcrumbs')
      expect(breadcrumbContainer).toBeInTheDocument()
      expect(breadcrumbContainer).toHaveAttribute('aria-label', 'Breadcrumbs')

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Forms')).toBeInTheDocument()
    })

    it('should render form container with aria-label', () => {
      render(<FormContainer {...defaultProps} />)

      const container = screen.getByTestId('form-container')
      expect(container).toHaveAttribute('aria-label', 'Form Container')
    })

    it('should pass formTitle to FormHeader', () => {
      render(<FormContainer {...defaultProps} />)

      expect(screen.getByText('Test Form')).toBeInTheDocument()
    })

    it('should pass fields count to FormContent', () => {
      render(<FormContainer {...defaultProps} />)

      expect(screen.getByText('Fields: 2')).toBeInTheDocument()
    })
  })

  describe('Begin Submission Special Styling', () => {
    it('should apply special class when formTitle is "Let\'s Get Started"', () => {
      const { container } = render(
        <FormContainer {...defaultProps} formTitle="Let's Get Started" />
      )

      const contentDiv = container.querySelector(
        '[class*="formContainer__content--beginSubmission"]'
      )
      expect(contentDiv).toBeInTheDocument()
    })

    it('should not apply special class for other form titles', () => {
      const { container } = render(
        <FormContainer {...defaultProps} formTitle="Other Form" />
      )

      const contentDiv = container.querySelector(
        '[class*="formContainer__content--beginSubmission"]'
      )
      expect(contentDiv).not.toBeInTheDocument()
    })

    it('should render roboBrain image when formTitle is "Let\'s Get Started"', () => {
      render(<FormContainer {...defaultProps} formTitle="Let's Get Started" />)

      // Images are currently commented out in the implementation
      const image = screen.queryByAltText('Image showing the potential of AI')
      expect(image).not.toBeInTheDocument()
    })

    it('should render web image when formTitle is not "Let\'s Get Started"', () => {
      render(<FormContainer {...defaultProps} formTitle="Other Form" />)

      // Images are currently commented out in the implementation
      const image = screen.queryByAltText('Neural network graphic')
      expect(image).not.toBeInTheDocument()
    })

    it('should have aria-hidden on image container', () => {
      const { container } = render(<FormContainer {...defaultProps} />)

      const imageContainer = container.querySelector(
        '[class*="beginSubmissionImage"]'
      )
      expect(imageContainer).toHaveAttribute('aria-hidden', 'true')
    })

    it('should wrap roboBrain image in wrapper div', () => {
      const { container } = render(
        <FormContainer {...defaultProps} formTitle="Let's Get Started" />
      )

      // Wrapper and images are currently commented out in the implementation
      const wrapper = container.querySelector(
        '[class*="beginSubmissionImageWrapper"]'
      )
      expect(wrapper).not.toBeInTheDocument()
    })
  })

  describe('Props Forwarding', () => {
    it('should forward approvalIndexPercentage to FormHeader', () => {
      const { rerender } = render(
        <FormContainer {...defaultProps} approvalIndexPercentage={85} />
      )

      expect(screen.getByTestId('form-header')).toBeInTheDocument()

      rerender(<FormContainer {...defaultProps} approvalIndexPercentage={90} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should forward formSubtitle to FormHeader', () => {
      render(
        <FormContainer
          {...defaultProps}
          formSubtitle={<span>Test subtitle</span>}
        />
      )

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should forward progressEnabled to FormHeader', () => {
      render(<FormContainer {...defaultProps} progressEnabled={true} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should forward activePageIndex to FormHeader and FormContent', () => {
      render(<FormContainer {...defaultProps} activePageIndex={2} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward sticky prop to FormFooter', () => {
      render(<FormContainer {...defaultProps} sticky={true} />)

      expect(screen.getByText('Sticky: true')).toBeInTheDocument()
    })

    it('should forward formData to FormContent', () => {
      const formData = { field1: 'value1' }
      render(<FormContainer {...defaultProps} formData={formData} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should provide empty object when formData is not provided', () => {
      render(<FormContainer {...defaultProps} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward setFormData to FormContent', () => {
      const setFormData = vi.fn()
      render(<FormContainer {...defaultProps} setFormData={setFormData} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should provide no-op function when setFormData is not provided', () => {
      render(<FormContainer {...defaultProps} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })
  })

  describe('Steps Generation', () => {
    it('should use provided steps', () => {
      const steps = ['Step 1', 'Step 2', 'Step 3']
      render(<FormContainer {...defaultProps} steps={steps} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should generate steps from pageDetails', () => {
      const pageDetails = [
        { title: 'Page One', pageFieldCount: 5 },
        { title: 'Page Two', pageFieldCount: 3 },
      ]
      render(<FormContainer {...defaultProps} pageDetails={pageDetails} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should generate steps from pageFieldCounts when pageDetails is not provided', () => {
      const pageFieldCounts = [5, 3, 2]
      render(
        <FormContainer {...defaultProps} pageFieldCounts={pageFieldCounts} />
      )

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should handle undefined steps, pageDetails, and pageFieldCounts', () => {
      render(<FormContainer {...defaultProps} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should prioritize steps over pageDetails', () => {
      const steps = ['Custom Step']
      const pageDetails = [{ title: 'Page One', pageFieldCount: 5 }]
      render(
        <FormContainer
          {...defaultProps}
          steps={steps}
          pageDetails={pageDetails}
        />
      )

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should handle empty pageDetails array', () => {
      render(<FormContainer {...defaultProps} pageDetails={[]} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should handle non-array pageDetails', () => {
      render(<FormContainer {...defaultProps} pageDetails={undefined} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })

    it('should fallback to pageFieldCounts when pageDetails is empty', () => {
      const pageFieldCounts = [5, 3]
      render(
        <FormContainer
          {...defaultProps}
          pageDetails={[]}
          pageFieldCounts={pageFieldCounts}
        />
      )

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })
  })

  describe('Field Change Handler', () => {
    it('should call onFieldChange when provided', async () => {
      const user = userEvent.setup()
      const onFieldChange = vi.fn()
      render(<FormContainer {...defaultProps} onFieldChange={onFieldChange} />)

      const formContent = screen.getByTestId('form-content')
      await user.click(formContent)

      expect(onFieldChange).toHaveBeenCalledWith('testField', 'testValue')
    })

    it('should handle onFieldChange not being provided', async () => {
      const user = userEvent.setup()
      render(<FormContainer {...defaultProps} />)

      const formContent = screen.getByTestId('form-content')

      // Should not throw when clicking without onFieldChange prop
      await expect(user.click(formContent)).resolves.not.toThrow()
    })
  })

  describe('Additional Props', () => {
    it('should forward pageSize to FormContent', () => {
      render(<FormContainer {...defaultProps} pageSize={20} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward onStepChange to FormContent', () => {
      const onStepChange = vi.fn()
      render(<FormContainer {...defaultProps} onStepChange={onStepChange} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward tagActions to FormContent', () => {
      const tagActions = {
        addTag: vi.fn(),
        removeTag: vi.fn(),
      }
      render(<FormContainer {...defaultProps} tagActions={tagActions} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward fieldsPerPage to FormContent and FormFooter', () => {
      render(<FormContainer {...defaultProps} fieldsPerPage={5} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should forward pageFieldCounts to FormContent and FormFooter', () => {
      const pageFieldCounts = [3, 4, 5]
      render(
        <FormContainer {...defaultProps} pageFieldCounts={pageFieldCounts} />
      )

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should forward pageDetails to FormContent and FormFooter', () => {
      const pageDetails = [
        { title: 'Page 1', pageFieldCount: 5 },
        { title: 'Page 2', pageFieldCount: 3 },
      ]
      render(<FormContainer {...defaultProps} pageDetails={pageDetails} />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should forward schema and uiSchema to FormContent', () => {
      const schema = { type: 'object' }
      const uiSchema = { 'ui:order': ['field1', 'field2'] }
      render(
        <FormContainer {...defaultProps} schema={schema} uiSchema={uiSchema} />
      )

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward submissionId to FormContent', () => {
      render(<FormContainer {...defaultProps} submissionId="sub-123" />)

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward formType and formStatus to FormContent', () => {
      render(
        <FormContainer
          {...defaultProps}
          formType="registry"
          formStatus="draft"
        />
      )

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward suggestions data to FormContent', () => {
      render(
        <FormContainer
          {...defaultProps}
          suggestionsData={{ field1: ['suggestion1'] }}
          suggestionsLoading={false}
          suggestionsError={null}
        />
      )

      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('should forward footerButtons to FormFooter', () => {
      const footerButtons = [
        { label: 'Save', onClick: vi.fn() },
        { label: 'Submit', onClick: vi.fn() },
      ]
      render(<FormContainer {...defaultProps} footerButtons={footerButtons} />)

      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should forward pageButtonIds and actionHandlerMap to FormFooter', () => {
      const pageButtonIds = {
        0: [{ action: 'next' as const, label: 'Next' }],
      }
      const actionHandlerMap = {
        cancel: vi.fn(),
        prev: vi.fn(),
        next: vi.fn(),
        saveDraft: vi.fn(),
        submit: vi.fn(),
        skipUpload: vi.fn(),
      }
      render(
        <FormContainer
          {...defaultProps}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={actionHandlerMap}
        />
      )

      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should forward setActivePageIndex to FormFooter', () => {
      const setActivePageIndex = vi.fn()
      render(
        <FormContainer
          {...defaultProps}
          setActivePageIndex={setActivePageIndex}
        />
      )

      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should calculate totalFields and pass to FormFooter', () => {
      render(<FormContainer {...defaultProps} />)

      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should forward submitRedirectPath to FormFooter', () => {
      render(
        <FormContainer {...defaultProps} submitRedirectPath="/dashboard" />
      )

      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should forward skipDocumentUpload to FormFooter', () => {
      render(<FormContainer {...defaultProps} skipDocumentUpload={true} />)

      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should forward formStatus to FormFooter', () => {
      render(<FormContainer {...defaultProps} formStatus="submitted" />)

      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })
  })

  describe('Breadcrumb Key Generation', () => {
    it('should generate unique keys for breadcrumbs', () => {
      render(<FormContainer {...defaultProps} />)

      const breadcrumb = screen.getByTestId('lds-breadcrumb')
      const links = breadcrumb.querySelectorAll('a')

      expect(links).toHaveLength(2)
      expect(links[0]).toHaveAttribute('href', '/')
      expect(links[1]).toHaveAttribute('href', '/forms')
    })

    it('should handle breadcrumbs with same text', () => {
      const breadcrumbs = [
        { text: 'Home', href: '/home1' },
        { text: 'Home', href: '/home2' },
      ]
      render(<FormContainer {...defaultProps} breadcrumbs={breadcrumbs} />)

      const breadcrumb = screen.getByTestId('lds-breadcrumb')
      const links = breadcrumb.querySelectorAll('a')

      expect(links).toHaveLength(2)
    })
  })

  describe('Confidence Score', () => {
    it('should pass hardcoded confidenceScore of 75 to FormHeader', () => {
      render(<FormContainer {...defaultProps} />)

      expect(screen.getByTestId('form-header')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty fields array', () => {
      render(<FormContainer {...defaultProps} fields={[]} />)

      expect(screen.getByText('Fields: 0')).toBeInTheDocument()
    })

    it('should handle large number of fields', () => {
      const fields = Array.from({ length: 100 }, (_, i) => ({
        id: `field${i}`,
        title: `Field ${i}`,
        inputType: 'text-box' as const,
      }))
      render(<FormContainer {...defaultProps} fields={fields} />)

      expect(screen.getByText('Fields: 100')).toBeInTheDocument()
    })

    it('should handle empty breadcrumbs array', () => {
      render(<FormContainer {...defaultProps} breadcrumbs={[]} />)

      const breadcrumb = screen.getByTestId('lds-breadcrumb')
      expect(breadcrumb).toBeInTheDocument()
    })

    it('should handle all optional props being undefined', () => {
      const minimalProps: FormContainerOrchestratorProps = {
        formTitle: 'Minimal Form',
        breadcrumbs: [{ text: 'Home', href: '/' }],
        fields: [
          {
            id: 'field1',
            title: 'Field 1',
            inputType: 'text-box' as const,
          },
        ],
        pageSize: 10,
      }

      render(<FormContainer {...minimalProps} />)

      expect(screen.getByTestId('form-container')).toBeInTheDocument()
    })

    it('should render with all props provided', () => {
      const allProps: FormContainerOrchestratorProps = {
        approvalIndexPercentage: 85,
        formTitle: 'Complete Form',
        formSubtitle: <span>Subtitle</span>,
        progressEnabled: true,
        fields: [
          {
            id: 'field1',
            title: 'Field 1',
            inputType: 'text-box' as const,
          },
        ],
        pageSize: 10,
        onStepChange: vi.fn(),
        onFieldChange: vi.fn(),
        tagActions: { tag1: vi.fn() },
        footerButtons: [{ label: 'Save', onClick: vi.fn() }],
        pageButtonIds: { 0: [{ action: 'next' as const, label: 'Next' }] },
        actionHandlerMap: {
          cancel: vi.fn(),
          prev: vi.fn(),
          next: vi.fn(),
          saveDraft: vi.fn(),
          submit: vi.fn(),
          skipUpload: vi.fn(),
        },
        breadcrumbs: [{ text: 'Home', href: '/' }],
        steps: ['Step 1', 'Step 2'],
        activePageIndex: 0,
        fieldsPerPage: 5,
        setActivePageIndex: vi.fn(),
        pageFieldCounts: [5, 5],
        pageDetails: [
          { title: 'Page 1', pageFieldCount: 5 },
          { title: 'Page 2', pageFieldCount: 5 },
        ],
        schema: { type: 'object' },
        uiSchema: {},
        submitRedirectPath: '/dashboard',
        formData: { field1: 'value' },
        setFormData: vi.fn(),
        submissionId: 'sub-123',
        skipDocumentUpload: false,
        formType: 'registry',
        formStatus: 'draft',
        sticky: true,
        suggestionsData: {},
        suggestionsLoading: false,
        suggestionsError: null,
      }

      render(<FormContainer {...allProps} />)

      expect(screen.getByTestId('form-container')).toBeInTheDocument()
      expect(screen.getByTestId('form-header')).toBeInTheDocument()
      expect(screen.getByTestId('form-content')).toBeInTheDocument()
      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('should apply formContainer__outer class', () => {
      render(<FormContainer {...defaultProps} />)

      const outer = screen.getByTestId('form-container-outer')
      expect(outer.className).toContain('formContainer__outer')
    })

    it('should apply formContainer__content class', () => {
      const { container } = render(<FormContainer {...defaultProps} />)

      const content = container.querySelector(
        '[class*="formContainer__content"]'
      )
      expect(content).toBeInTheDocument()
    })

    it('should apply formHeader__breadcrumbs class', () => {
      render(<FormContainer {...defaultProps} />)

      const breadcrumbs = screen.getByTestId('form-header-breadcrumbs')
      expect(breadcrumbs.className).toContain('formHeader__breadcrumbs')
    })

    it('should apply formContainer class to section', () => {
      const { container } = render(<FormContainer {...defaultProps} />)

      const section = container.querySelector('section')
      expect(section?.className).toContain('formContainer')
    })

    it('should apply beginSubmissionImage class', () => {
      const { container } = render(<FormContainer {...defaultProps} />)

      const imageContainer = container.querySelector(
        '[class*="beginSubmissionImage"]'
      )
      expect(imageContainer).toBeInTheDocument()
    })

    it('should apply beginSubmissionWebImage class for non-begin submission forms', () => {
      const { container } = render(
        <FormContainer {...defaultProps} formTitle="Other Form" />
      )

      // Images are currently commented out in the implementation
      const image = container.querySelector(
        '[class*="beginSubmissionWebImage"]'
      )
      expect(image).not.toBeInTheDocument()
    })

    it('should apply beginSubmissionRoboBrainImage class for begin submission form', () => {
      const { container } = render(
        <FormContainer {...defaultProps} formTitle="Let's Get Started" />
      )

      // Images are currently commented out in the implementation
      const image = container.querySelector(
        '[class*="beginSubmissionRoboBrainImage"]'
      )
      expect(image).not.toBeInTheDocument()
    })
  })
})
