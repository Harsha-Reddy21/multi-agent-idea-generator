import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HelpModal } from './HelpModal'

// Mock the @elilillyco/ux-lds-react components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsButton: ({
    children,
    onClick,
    className,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    classes,
  }: any) => (
    <button
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      data-testid={dataTestId || 'lds-button'}
      data-classes={classes}
    >
      {children}
    </button>
  ),
  LdsDivider: ({ 'aria-hidden': ariaHidden }: any) => (
    <hr aria-hidden={ariaHidden} data-testid="lds-divider" />
  ),
  LdsIcon: ({ name, className }: any) => (
    <span
      data-testid={`lds-icon-${name}`}
      className={className}
      data-icon-name={name}
    >
      {name}
    </span>
  ),
  LdsSwitch: ({ id, label, defaultChecked }: any) => (
    <input
      type="checkbox"
      id={id}
      aria-label={label || 'switch'}
      defaultChecked={defaultChecked}
      data-testid={`lds-switch-${id}`}
    />
  ),
}))

describe('HelpModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the help modal with all main sections', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(screen.getByText('Help')).toBeInTheDocument()
      expect(screen.getByText('AI Response Builder')).toBeInTheDocument()
      expect(screen.getByText('Use AI Data Extract')).toBeInTheDocument()
      expect(screen.getByLabelText('Close help')).toBeInTheDocument()
    })

    it('should render the help modal overlay', () => {
      const { container } = render(<HelpModal onClose={mockOnClose} />)

      const overlay = container.querySelector('[class*="helpModalOverlay"]')
      expect(overlay).toBeInTheDocument()
    })

    it('should render the help modal content area', () => {
      const { container } = render(<HelpModal onClose={mockOnClose} />)

      const content = container.querySelector('[class*="helpContent"]')
      expect(content).toBeInTheDocument()
    })

    it('should render the divider after header', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(screen.getByTestId('lds-divider')).toBeInTheDocument()
    })
  })

  describe('Header Section', () => {
    it('should render back button with arrow-left icon', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const backIcon = screen.getByTestId('lds-icon-arrow-left')
      expect(backIcon).toBeInTheDocument()
      expect(backIcon).toHaveAttribute('data-icon-name', 'arrow-left')
    })

    it('should render help title', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const title = screen.getByText('Help')
      expect(title).toBeInTheDocument()
    })

    it('should render question icon in header', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const questionIcon = screen.getByTestId('lds-icon-question')
      expect(questionIcon).toBeInTheDocument()
      expect(questionIcon).toHaveAttribute('data-icon-name', 'question')
    })

    it('should call onClose when back button is clicked', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const backButton = screen.getByLabelText('Close help')
      fireEvent.click(backButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('AI Response Builder Section', () => {
    it('should render AI Response Builder section with switch', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(screen.getByText('AI Response Builder')).toBeInTheDocument()
      const aiSwitch = screen.getByTestId('lds-switch-ai-switch-help-modal')
      expect(aiSwitch).toBeInTheDocument()
      expect(aiSwitch).toBeChecked()
    })

    it('should render AI Response Builder description', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(
        screen.getByText(
          'This is a one stop shop for all the help to build your answer using integrated AI'
        )
      ).toBeInTheDocument()
    })

    it('should render AI Response Builder "When to use it" section', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const whenToUseHeaders = screen.getAllByText('When to use it:')
      expect(whenToUseHeaders.length).toBeGreaterThan(0)
      expect(
        screen.getByText(/Use this feature when you need to quick brainstorm/)
      ).toBeInTheDocument()
    })
  })

  describe('Use AI Data Extract Section', () => {
    it('should render Use Answer button', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const useButton = screen.getByTestId('use-this-button')
      expect(useButton).toBeInTheDocument()
      expect(useButton).toHaveTextContent('Use Answer')
      expect(useButton).toHaveAttribute('data-classes', 'primary compact')
    })

    it('should render Use AI Data Extract title', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(screen.getByText('Use AI Data Extract')).toBeInTheDocument()
    })

    it('should render Use AI Data Extract description', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(
        screen.getByText(
          /This is a summary to the key information from your uploaded documents/
        )
      ).toBeInTheDocument()
    })

    it('should render Use AI Data Extract "When to use it" section', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const whenToUseTexts = screen.getAllByText('When to use it:')
      expect(whenToUseTexts.length).toBeGreaterThan(0)
      expect(
        screen.getByText(
          /Use this feature when you need to quickly and accurately summarize/
        )
      ).toBeInTheDocument()
    })
  })

  describe('Check Coverage Section', () => {
    it('should render Check Coverage buttons', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const checkCoverageButtons = screen.getAllByText('Check coverage')
      expect(checkCoverageButtons).toHaveLength(1)
    })

    it('should render Check Coverage button with correct styling', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const checkCoverageButton = screen.getByText('Check coverage')
      expect(checkCoverageButton).toHaveAttribute(
        'data-classes',
        'primary outlined'
      )
    })

    it('should render Check Coverage description', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(
        screen.getByText(/Check Coverage reviews your input to spot gaps/)
      ).toBeInTheDocument()
    })

    it('should render Check Coverage "When to use it" section', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(
        screen.getByText(
          /Use this feature when you want to ensure that your responses are thorough/
        )
      ).toBeInTheDocument()
    })
  })

  describe('Edit Section', () => {
    it('should render Edit button', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const editButton = screen.getByText('Edit')
      expect(editButton).toBeInTheDocument()
      expect(editButton).toHaveAttribute('data-classes', 'primary outlined')
    })

    it('should render Edit section description', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(
        screen.getByText(
          'You can make changes to the AI summary and use this as the answer'
        )
      ).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('should render all help sections', () => {
      render(<HelpModal onClose={mockOnClose} />)

      // Verify all 4 main section titles are present
      expect(screen.getByText('AI Response Builder')).toBeInTheDocument()
      expect(screen.getByText('Use AI Data Extract')).toBeInTheDocument()
      expect(screen.getByText('Check coverage')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    it('should render multiple "When to use it" subsections', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const whenToUseHeaders = screen.getAllByText('When to use it:')
      expect(whenToUseHeaders.length).toBe(3) // AI Response Builder, Use AI Data Extract, Check Coverage
    })

    it('should have proper hierarchy of sections', () => {
      const { container } = render(<HelpModal onClose={mockOnClose} />)

      const sectionTitles = container.querySelectorAll(
        '[class*="helpSectionTitle"]'
      )
      expect(sectionTitles.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label for close button', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const closeButton = screen.getByLabelText('Close help')
      expect(closeButton).toBeInTheDocument()
    })

    it('should have aria-hidden on divider', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const divider = screen.getByTestId('lds-divider')
      expect(divider).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have proper switch id for accessibility', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const aiSwitch = screen.getByTestId('lds-switch-ai-switch-help-modal')
      expect(aiSwitch).toHaveAttribute('id', 'ai-switch-help-modal')
    })
  })

  describe('Interactive Elements', () => {
    it('should not trigger onClose when clicking inside modal content', () => {
      const { container } = render(<HelpModal onClose={mockOnClose} />)

      const content = container.querySelector('[class*="helpContent"]')
      if (content) {
        fireEvent.click(content)
      }

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should only call onClose when back button is clicked', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const backButton = screen.getByLabelText('Close help')
      fireEvent.click(backButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Button Variants', () => {
    it('should render Use Answer button as primary compact', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const useButton = screen.getByTestId('use-this-button')
      expect(useButton).toHaveAttribute('data-classes', 'primary compact')
    })

    it('should render Check Coverage button as primary outlined', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const checkCoverageButton = screen.getByText('Check coverage')
      expect(checkCoverageButton).toHaveAttribute(
        'data-classes',
        'primary outlined'
      )
    })

    it('should render Edit button as primary outlined', () => {
      render(<HelpModal onClose={mockOnClose} />)

      const editButton = screen.getByText('Edit')
      expect(editButton).toHaveAttribute('data-classes', 'primary outlined')
    })
  })

  describe('Text Content Verification', () => {
    it('should contain corrected text in description', () => {
      render(<HelpModal onClose={mockOnClose} />)

      // Text has been corrected from "fo" to "to" and "fro" to "from"
      expect(
        screen.getByText(/This is a summary to the key information/)
      ).toBeInTheDocument()
    })

    it('should contain all key phrases in AI Response Builder', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(
        screen.getByText(/one stop shop for all the help/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/quick brainstorm\/enhance\/avoid redundancy/)
      ).toBeInTheDocument()
    })

    it('should contain all key phrases in Check Coverage description', () => {
      render(<HelpModal onClose={mockOnClose} />)

      expect(
        screen.getByText(/reviews your input to spot gaps/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/ensuring every response is complete/)
      ).toBeInTheDocument()
    })
  })
})
