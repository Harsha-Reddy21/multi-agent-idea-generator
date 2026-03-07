import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FormHeader } from './FormHeader'
import { FormHeaderProps } from './types'

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsDivider: ({ className, 'aria-hidden': ariaHidden }: any) => (
    <hr
      className={className}
      aria-hidden={ariaHidden}
      data-testid="lds-divider"
    />
  ),
  LdsIcon: ({ name, className }: any) => (
    <span className={className} data-testid="lds-icon" data-icon-name={name} />
  ),
  LdsImage: ({ src, alt, className, 'aria-hidden': ariaHidden }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      aria-hidden={ariaHidden}
      data-testid="lds-image"
    />
  ),
  LdsStepIndicator: ({
    forceCondensedMode,
    activeIndex,
    completeLabel,
    nextLabel,
    ofLabel,
    showStepNumbers,
    stepCompleteLabel,
    stepLabel,
    steps,
  }: any) => (
    <div
      data-testid="lds-step-indicator"
      data-active-index={activeIndex}
      data-force-condensed-mode={forceCondensedMode}
      data-complete-label={completeLabel}
      data-next-label={nextLabel}
      data-of-label={ofLabel}
      data-show-step-numbers={showStepNumbers}
      data-step-complete-label={stepCompleteLabel}
      data-step-label={stepLabel}
      data-steps={JSON.stringify(steps)}
    >
      Step Indicator
    </div>
  ),
  LdsTooltip: Object.assign(
    ({ hideIcon, tooltipMode, children }: any) => (
      <div
        data-testid="lds-tooltip"
        data-hide-icon={hideIcon}
        data-tooltip-mode={tooltipMode}
      >
        {children}
      </div>
    ),
    {
      Text: ({ children }: any) => (
        <div data-testid="lds-tooltip-text">{children}</div>
      ),
      Description: ({ children }: any) => (
        <div data-testid="lds-tooltip-description">{children}</div>
      ),
    }
  ),
}))

// Mock SVG import
vi.mock('../../assets/ai_assist.svg', () => ({
  default: 'mocked-ai-assist-icon.svg',
}))

describe('FormHeader', () => {
  const defaultProps: FormHeaderProps = {
    formTitle: 'Test Form Title',
    breadcrumbs: [
      { text: 'Home', href: '/' },
      { text: 'Forms', href: '/forms' },
    ],
  }

  describe('Basic Rendering', () => {
    it('should render header with correct aria-label', () => {
      render(<FormHeader {...defaultProps} />)

      const header = screen.getByTestId('form-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute('aria-label', 'Form Header')
      expect(header.tagName).toBe('HEADER')
    })

    it('should render form title', () => {
      render(<FormHeader {...defaultProps} />)

      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveTextContent('Test Form Title')
    })

    it('should render divider', () => {
      render(<FormHeader {...defaultProps} />)

      const divider = screen.getByTestId('lds-divider')
      expect(divider).toBeInTheDocument()
      expect(divider).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Form Subtitle', () => {
    it('should render subtitle when provided as string', () => {
      render(
        <FormHeader {...defaultProps} formSubtitle="This is a test subtitle" />
      )

      expect(screen.getByText('This is a test subtitle')).toBeInTheDocument()
    })

    it('should render subtitle when provided as ReactNode', () => {
      const subtitle = (
        <div data-testid="custom-subtitle">
          Custom <strong>Subtitle</strong> Content
        </div>
      )
      render(<FormHeader {...defaultProps} formSubtitle={subtitle} />)

      const customSubtitle = screen.getByTestId('custom-subtitle')
      expect(customSubtitle).toBeInTheDocument()
      expect(customSubtitle).toHaveTextContent('Custom Subtitle Content')
      expect(screen.getByText('Subtitle')).toBeInTheDocument()
    })

    it('should not render subtitle when not provided', () => {
      const { container } = render(<FormHeader {...defaultProps} />)

      const subtitleDiv = container.querySelector('.formHeader__subtitle')
      expect(subtitleDiv).not.toBeInTheDocument()
    })

    it('should not render subtitle when undefined', () => {
      render(<FormHeader {...defaultProps} formSubtitle={undefined} />)

      const subtitleDiv = document.querySelector('.formHeader__subtitle')
      expect(subtitleDiv).not.toBeInTheDocument()
    })
  })

  describe('Approval Index Percentage', () => {
    it('should render approval index pill when percentage is provided', () => {
      render(<FormHeader {...defaultProps} approvalIndexPercentage={85} />)

      const pill = screen.getByLabelText('Approval Index: 85%')
      expect(pill).toBeInTheDocument()
      expect(screen.getByText('Approval Index: 85%')).toBeInTheDocument()
    })

    it('should render approval index icon', () => {
      render(<FormHeader {...defaultProps} approvalIndexPercentage={75} />)

      const image = screen.getByAltText('Approval Index Icon')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'mocked-ai-assist-icon.svg')
      expect(image).toHaveAttribute('aria-hidden', 'true')
    })

    it('should render tooltip with info icon', () => {
      render(<FormHeader {...defaultProps} approvalIndexPercentage={90} />)

      const tooltip = screen.getByTestId('lds-tooltip')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveAttribute('data-hide-icon', 'true')
      expect(tooltip).toHaveAttribute('data-tooltip-mode', 'text')

      const icon = screen.getByTestId('lds-icon')
      expect(icon).toHaveAttribute('data-icon-name', 'info inline')
    })

    it('should render tooltip description', () => {
      render(<FormHeader {...defaultProps} approvalIndexPercentage={65} />)

      expect(
        screen.getByText('Likelihood of submission approval')
      ).toBeInTheDocument()
    })

    it('should render approval index with 0 percentage', () => {
      render(<FormHeader {...defaultProps} approvalIndexPercentage={0} />)

      expect(screen.getByText('Approval Index: 0%')).toBeInTheDocument()
    })

    it('should render approval index with 100 percentage', () => {
      render(<FormHeader {...defaultProps} approvalIndexPercentage={100} />)

      expect(screen.getByText('Approval Index: 100%')).toBeInTheDocument()
    })

    it('should not render approval index when percentage is undefined', () => {
      render(
        <FormHeader {...defaultProps} approvalIndexPercentage={undefined} />
      )

      expect(screen.queryByText(/Approval Index:/)).not.toBeInTheDocument()
    })

    it('should not render approval index when percentage is not a number', () => {
      render(<FormHeader {...defaultProps} />)

      expect(screen.queryByText(/Approval Index:/)).not.toBeInTheDocument()
    })
  })

  describe('Progress Indicator', () => {
    const stepsData = ['Step 1', 'Step 2', 'Step 3']

    it('should not render progress when progressEnabled is false', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={false}
          steps={stepsData}
          activePageIndex={1}
        />
      )

      expect(
        screen.queryByTestId('form-header-progress')
      ).not.toBeInTheDocument()
    })

    it('should not render progress when progressEnabled is undefined', () => {
      render(
        <FormHeader {...defaultProps} steps={stepsData} activePageIndex={1} />
      )

      expect(
        screen.queryByTestId('form-header-progress')
      ).not.toBeInTheDocument()
    })

    it('should not render progress when steps is undefined', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          activePageIndex={1}
        />
      )

      expect(
        screen.queryByTestId('form-header-progress')
      ).not.toBeInTheDocument()
    })

    it('should not render progress when steps is empty', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={[]}
          activePageIndex={1}
        />
      )

      expect(
        screen.queryByTestId('form-header-progress')
      ).not.toBeInTheDocument()
    })

    it('should render progress when progressEnabled is true and steps are provided', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={1}
        />
      )

      const progress = screen.getByTestId('form-header-progress')
      expect(progress).toBeInTheDocument()
      expect(progress).toHaveAttribute('aria-label', 'Form Progress')
    })

    it('should render LdsStepIndicator with correct props', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={2}
        />
      )

      const stepIndicator = screen.getByTestId('lds-step-indicator')
      expect(stepIndicator).toBeInTheDocument()
      expect(stepIndicator).toHaveAttribute('data-active-index', '1') // 2 - 1 = 1 (zero-based)
      expect(stepIndicator).toHaveAttribute('data-force-condensed-mode', 'true')
      expect(stepIndicator).toHaveAttribute('data-complete-label', 'Complete!')
      expect(stepIndicator).toHaveAttribute('data-next-label', 'Next')
      expect(stepIndicator).toHaveAttribute('data-of-label', 'of')
      expect(stepIndicator).toHaveAttribute('data-show-step-numbers', 'true')
      expect(stepIndicator).toHaveAttribute(
        'data-step-complete-label',
        'Complete'
      )
      expect(stepIndicator).toHaveAttribute('data-step-label', 'Step')
    })
  })

  describe('Step Labels and Navigation', () => {
    const stepsData = ['Introduction', 'Details', 'Review', 'Submit']

    it('should display current step label for first step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={1}
        />
      )

      const currentLabel = screen.getByLabelText('Current step: Introduction')
      expect(currentLabel).toHaveTextContent('Introduction')
    })

    it('should display current step label for middle step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={2}
        />
      )

      const currentLabel = screen.getByLabelText('Current step: Details')
      expect(currentLabel).toHaveTextContent('Details')
    })

    it('should display next step label when available', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={1}
        />
      )

      const nextLabel = screen.getByLabelText('Next step: Details')
      expect(nextLabel).toHaveTextContent('Next: Details')
    })

    it('should not display next step label on last step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={4}
        />
      )

      expect(screen.queryByText(/Next:/)).not.toBeInTheDocument()
    })

    it('should handle activePageIndex defaulting to 0 when undefined', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={undefined}
        />
      )

      const currentLabel = screen.getByLabelText('Current step: Introduction')
      expect(currentLabel).toHaveTextContent('Introduction')
    })
  })

  describe('Step Count Display', () => {
    const stepsData = ['Step 1', 'Step 2', 'Step 3', 'Step 4']

    it('should display correct step count for first step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={1}
        />
      )

      const stepCount = screen.getByLabelText('Step 1 of 4')
      expect(stepCount).toHaveTextContent('1 of 4')
    })

    it('should display correct step count for middle step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={3}
        />
      )

      const stepCount = screen.getByLabelText('Step 3 of 4')
      expect(stepCount).toHaveTextContent('3 of 4')
    })

    it('should display correct step count for last step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={4}
        />
      )

      const stepCount = screen.getByLabelText('Step 4 of 4')
      expect(stepCount).toHaveTextContent('4 of 4')
    })
  })

  describe('Step Pills', () => {
    const stepsData = ['Step 1', 'Step 2', 'Step 3', 'Step 4']

    it('should render correct number of step pills', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={2}
        />
      )

      const pills = screen.getAllByRole('listitem')
      expect(pills).toHaveLength(4)
    })

    it('should mark completed steps correctly', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={3}
        />
      )

      expect(screen.getByLabelText('Step 1 completed')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 2 completed')).toBeInTheDocument()
    })

    it('should mark active step correctly', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={2}
        />
      )

      expect(screen.getByLabelText('Step 2 active')).toBeInTheDocument()
    })

    it('should mark default (future) steps correctly', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={2}
        />
      )

      expect(screen.getByLabelText('Step 3 default')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 4 default')).toBeInTheDocument()
    })

    it('should render pills container with correct aria attributes', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={1}
        />
      )

      const pillsContainer = screen.getByLabelText('Form steps progress')
      expect(pillsContainer).toHaveAttribute('role', 'list')
    })

    it('should mark all steps as completed when on last step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={4}
        />
      )

      expect(screen.getByLabelText('Step 1 completed')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 2 completed')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 3 completed')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 4 active')).toBeInTheDocument()
    })

    it('should mark only active step when on first step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={stepsData}
          activePageIndex={1}
        />
      )

      expect(screen.getByLabelText('Step 1 active')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 2 default')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 3 default')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 4 default')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={['Only Step']}
          activePageIndex={1}
        />
      )

      expect(screen.getByText('Only Step')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 1 of 1')).toHaveTextContent('1 of 1')
      expect(screen.queryByText(/Next:/)).not.toBeInTheDocument()
    })

    it('should handle two steps', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={['First', 'Second']}
          activePageIndex={1}
        />
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Next: Second')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 1 of 2')).toHaveTextContent('1 of 2')
    })

    it('should handle many steps', () => {
      const manySteps = Array.from({ length: 10 }, (_, i) => `Step ${i + 1}`)
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={manySteps}
          activePageIndex={5}
        />
      )

      const pills = screen.getAllByRole('listitem')
      expect(pills).toHaveLength(10)
      expect(screen.getByLabelText('Step 5 of 10')).toHaveTextContent('5 of 10')
    })

    it('should handle all props together', () => {
      render(
        <FormHeader
          formTitle="Complete Form"
          formSubtitle="With all features enabled"
          progressEnabled={true}
          steps={['Step 1', 'Step 2', 'Step 3']}
          activePageIndex={2}
          approvalIndexPercentage={78}
          breadcrumbs={[
            { text: 'Home', href: '/' },
            { text: 'Forms', href: '/forms' },
          ]}
        />
      )

      expect(screen.getByText('Complete Form')).toBeInTheDocument()
      expect(screen.getByText('With all features enabled')).toBeInTheDocument()
      expect(screen.getByText('Approval Index: 78%')).toBeInTheDocument()
      expect(screen.getByTestId('form-header-progress')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 2 of 3')).toHaveTextContent('2 of 3')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-live on current step label', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={['Step 1', 'Step 2']}
          activePageIndex={1}
        />
      )

      const currentLabel = screen.getByLabelText('Current step: Step 1')
      expect(currentLabel).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper aria-label on next step label', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={['Step 1', 'Step 2', 'Step 3']}
          activePageIndex={1}
        />
      )

      const nextLabel = screen.getByLabelText('Next step: Step 2')
      expect(nextLabel).toBeInTheDocument()
    })

    it('should have aria-label on step pills', () => {
      render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={['A', 'B', 'C']}
          activePageIndex={2}
        />
      )

      expect(screen.getByLabelText('Step 1 completed')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 2 active')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 3 default')).toBeInTheDocument()
    })

    it('should hide native step indicator from accessibility tree', () => {
      const { container } = render(
        <FormHeader
          {...defaultProps}
          progressEnabled={true}
          steps={['Step 1']}
          activePageIndex={1}
        />
      )

      const hiddenNative = container.querySelector(
        '[class*="formHeader__progressHiddenNative"]'
      )
      expect(hiddenNative).toBeInTheDocument()
      expect(hiddenNative).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
