import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormCard, FormCardProps } from './FormCard'

// Mock the Badge component
vi.mock('../Badge/Badge', () => ({
  Badge: ({ text, type }: { text: string; type: string }) => (
    <span data-testid={`badge-${type}`}>{text}</span>
  ),
}))

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', () => {
  const LdsTooltipMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="lds-tooltip">{children}</div>
  )

  LdsTooltipMock.Text = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-text">{children}</div>
  )

  LdsTooltipMock.Description = ({
    children,
  }: {
    children: React.ReactNode
  }) => <div data-testid="tooltip-description">{children}</div>

  return {
    LdsIcon: ({ name, className }: { name: string; className?: string }) => (
      <span data-testid="lds-icon" className={className}>
        {name}
      </span>
    ),
    LdsImage: ({ src, alt }: { src: string; alt: string }) => (
      <img src={src} alt={alt} data-testid="lds-image" />
    ),
    LdsTooltip: LdsTooltipMock,
  }
})

describe('FormCard', () => {
  const defaultProps: FormCardProps = {
    title: 'Test Form',
    text: 'This is a test form description',
  }

  describe('Basic Rendering', () => {
    it('should render with required props only', () => {
      render(<FormCard {...defaultProps} />)

      expect(screen.getByText('Test Form')).toBeInTheDocument()
      expect(
        screen.getByText('This is a test form description')
      ).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      render(<FormCard {...defaultProps} className="custom-class" />)

      const card = screen.getByTestId('form-card')
      expect(card).toHaveClass('custom-class')
    })

    it('should render with custom data-testid', () => {
      render(<FormCard {...defaultProps} data-testid="custom-card" />)

      expect(screen.getByTestId('custom-card')).toBeInTheDocument()
    })

    it('should render title icon when provided', () => {
      const icon = <span data-testid="custom-icon">★</span>
      render(<FormCard {...defaultProps} titleIcon={icon} />)

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
      expect(screen.getByText('★')).toBeInTheDocument()
    })

    it('should have aria-hidden on title icon', () => {
      const icon = <span>★</span>
      const { container } = render(
        <FormCard {...defaultProps} titleIcon={icon} />
      )

      const titleIconSpan = container.querySelector('[aria-hidden="true"]')
      expect(titleIconSpan).toBeInTheDocument()
      expect(titleIconSpan).toHaveTextContent('★')
    })
  })

  describe('Badge Display', () => {
    it('should render Mandatory badge when badgeType is Mandatory', () => {
      render(<FormCard {...defaultProps} badgeType="Mandatory" />)

      const badge = screen.getByTestId('badge-mandatory')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Mandatory')
    })

    it('should render Required badge when badgeType is Required', () => {
      render(<FormCard {...defaultProps} badgeType="Required" />)

      const badge = screen.getByTestId('badge-required')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Required')
    })

    it('should render Optional badge when badgeType is Optional', () => {
      render(<FormCard {...defaultProps} badgeType="Optional" />)

      const badge = screen.getByTestId('badge-optional')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Optional')
    })

    it('should render Submitted badge when completed is true', () => {
      render(
        <FormCard {...defaultProps} completed={true} badgeType="Mandatory" />
      )

      const badge = screen.getByTestId('badge-submitted')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Submitted')
    })

    it('should not render badge when badgeType is not provided and not completed', () => {
      render(<FormCard {...defaultProps} />)

      expect(screen.queryByTestId(/^badge-/)).not.toBeInTheDocument()
    })

    it('should have status badges aria-label', () => {
      render(<FormCard {...defaultProps} badgeType="Mandatory" />)

      const badgesContainer = screen.getByLabelText('status badges')
      expect(badgesContainer).toBeInTheDocument()
    })
  })

  describe('Approval Index', () => {
    it('should render approval index when aiFieldPercentage is provided and non-zero', () => {
      render(<FormCard {...defaultProps} aiFieldPercentage={75} />)

      expect(screen.getByLabelText('approval index')).toBeInTheDocument()
      expect(screen.getByText(/Approval Index:/)).toBeInTheDocument()
      expect(screen.getByText(/75%/)).toBeInTheDocument()
    })

    it('should not render approval index when aiFieldPercentage is 0', () => {
      render(<FormCard {...defaultProps} aiFieldPercentage={0} />)

      expect(screen.queryByLabelText('approval index')).not.toBeInTheDocument()
    })

    it('should not render approval index when aiFieldPercentage is undefined', () => {
      render(<FormCard {...defaultProps} />)

      expect(screen.queryByLabelText('approval index')).not.toBeInTheDocument()
    })

    it('should render tooltip with approval index description', () => {
      render(<FormCard {...defaultProps} aiFieldPercentage={50} />)

      expect(screen.getByTestId('lds-tooltip')).toBeInTheDocument()
      expect(
        screen.getByText(
          /The Approval Index reflects the likelihood of this form being approved/
        )
      ).toBeInTheDocument()
    })

    it('should render icon with aria-hidden in approval index', () => {
      const { container } = render(
        <FormCard {...defaultProps} aiFieldPercentage={50} />
      )

      const iconSpan = container.querySelector('[aria-hidden="true"]')
      expect(iconSpan).toBeInTheDocument()
    })

    it('should render — when aiFieldPercentage is not a number', () => {
      render(
        <FormCard {...defaultProps} aiFieldPercentage={'invalid' as any} />
      )

      expect(screen.getByText(/—/)).toBeInTheDocument()
    })
  })

  describe('Meta Row', () => {
    it('should render duration when provided', () => {
      render(<FormCard {...defaultProps} duration="15 min" />)

      expect(screen.getByText('15 min')).toBeInTheDocument()
      expect(screen.getByAltText('Estimated Time')).toBeInTheDocument()
    })

    it('should render step count when provided', () => {
      render(<FormCard {...defaultProps} stepCount={5} />)

      expect(screen.getByText('5 steps')).toBeInTheDocument()
    })

    it('should render both duration and step count with separator', () => {
      render(<FormCard {...defaultProps} duration="10 min" stepCount={3} />)

      expect(screen.getByText('10 min')).toBeInTheDocument()
      expect(screen.getByText('|')).toBeInTheDocument()
      expect(screen.getByText('3 steps')).toBeInTheDocument()
    })

    it('should not render meta row when completed is true', () => {
      render(
        <FormCard
          {...defaultProps}
          completed={true}
          duration="10 min"
          stepCount={5}
        />
      )

      expect(screen.queryByText('10 min')).not.toBeInTheDocument()
      expect(screen.queryByText('5 steps')).not.toBeInTheDocument()
    })

    it('should not render meta row when showMetaRow is false', () => {
      render(
        <FormCard
          {...defaultProps}
          showMetaRow={false}
          duration="10 min"
          stepCount={5}
        />
      )

      expect(screen.queryByText('10 min')).not.toBeInTheDocument()
      expect(screen.queryByText('5 steps')).not.toBeInTheDocument()
    })

    it('should render meta row when showMetaRow is true (default)', () => {
      render(<FormCard {...defaultProps} duration="10 min" />)

      expect(screen.getByText('10 min')).toBeInTheDocument()
    })

    it('should not render step count when stepCount is 0', () => {
      render(<FormCard {...defaultProps} stepCount={0} />)

      expect(screen.queryByText(/steps/)).not.toBeInTheDocument()
    })

    it('should have aria-label on meta row', () => {
      render(<FormCard {...defaultProps} duration="10 min" />)

      expect(screen.getByLabelText('form metadata')).toBeInTheDocument()
    })

    it('should have aria-hidden on separator', () => {
      render(<FormCard {...defaultProps} duration="10 min" stepCount={3} />)

      const separator = screen.getByText('|')
      expect(separator).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Interactive States', () => {
    it('should render as button role when onAction is provided', () => {
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button', { name: 'Test Form' })
      expect(card).toBeInTheDocument()
    })

    it('should render as group role when onAction is not provided', () => {
      render(<FormCard {...defaultProps} />)

      const card = screen.getByRole('group', { name: 'Test Form' })
      expect(card).toBeInTheDocument()
    })

    it('should call onAction when clicked', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      await user.click(card)

      expect(onAction).toHaveBeenCalledTimes(1)
    })

    it('should not call onAction when locked is true', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} locked={true} onAction={onAction} />)

      const card = screen.getByRole('group')
      await user.click(card)

      expect(onAction).not.toHaveBeenCalled()
    })

    it('should not call onAction when disabled is true', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} disabled={true} onAction={onAction} />)

      const card = screen.getByRole('group')
      await user.click(card)

      expect(onAction).not.toHaveBeenCalled()
    })

    it('should call onAction when Enter key is pressed', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      card.focus()
      await user.keyboard('{Enter}')

      expect(onAction).toHaveBeenCalledTimes(1)
    })

    it('should call onAction when Space key is pressed', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      card.focus()
      await user.keyboard(' ')

      expect(onAction).toHaveBeenCalledTimes(1)
    })

    it('should not call onAction when other keys are pressed', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      card.focus()
      await user.keyboard('a')

      expect(onAction).not.toHaveBeenCalled()
    })

    it('should not call onAction on keypress when locked', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} locked={true} onAction={onAction} />)

      const card = screen.getByRole('group')
      card.focus()
      await user.keyboard('{Enter}')

      expect(onAction).not.toHaveBeenCalled()
    })

    it('should have tabIndex 0 when interactive', () => {
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      expect(card).toHaveAttribute('tabIndex', '0')
    })

    it('should have tabIndex -1 when not interactive', () => {
      render(<FormCard {...defaultProps} />)

      const card = screen.getByRole('group')
      expect(card).toHaveAttribute('tabIndex', '-1')
    })

    it('should have aria-disabled false when interactive', () => {
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      expect(card).toHaveAttribute('aria-disabled', 'false')
    })

    it('should have aria-disabled true when not interactive', () => {
      render(<FormCard {...defaultProps} />)

      const card = screen.getByRole('group')
      expect(card).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('CSS Classes', () => {
    it('should apply clickable class when interactive', () => {
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      expect(card.className).toContain('clickable')
    })

    it('should not apply clickable class when not interactive', () => {
      render(<FormCard {...defaultProps} />)

      const card = screen.getByRole('group')
      expect(card.className).not.toContain('clickable')
    })

    it('should apply locked class when locked is true', () => {
      render(<FormCard {...defaultProps} locked={true} />)

      const card = screen.getByRole('group')
      expect(card.className).toContain('locked')
    })

    it('should apply completed class when completed is true and not locked', () => {
      render(<FormCard {...defaultProps} completed={true} />)

      const card = screen.getByRole('group')
      expect(card.className).toContain('completed')
    })

    it('should not apply completed class when locked is true even if completed', () => {
      render(<FormCard {...defaultProps} completed={true} locked={true} />)

      const card = screen.getByRole('group')
      expect(card.className).not.toContain('completed')
    })

    it('should apply noMetaRow class when showMetaRow is false', () => {
      render(<FormCard {...defaultProps} showMetaRow={false} />)

      const card = screen.getByRole('group')
      expect(card.className).toContain('noMetaRow')
    })

    it('should apply optional class when badgeType is Optional and not completed or locked', () => {
      render(<FormCard {...defaultProps} badgeType="Optional" />)

      const card = screen.getByRole('group')
      expect(card.className).toContain('optional')
    })

    it('should not apply optional class when completed', () => {
      render(
        <FormCard {...defaultProps} badgeType="Optional" completed={true} />
      )

      const card = screen.getByRole('group')
      expect(card.className).not.toContain('optional')
    })

    it('should not apply optional class when locked', () => {
      render(<FormCard {...defaultProps} badgeType="Optional" locked={true} />)

      const card = screen.getByRole('group')
      expect(card.className).not.toContain('optional')
    })

    it('should not apply optional class when badgeType is not Optional', () => {
      render(<FormCard {...defaultProps} badgeType="Mandatory" />)

      const card = screen.getByRole('group')
      expect(card.className).not.toContain('optional')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing duration gracefully', () => {
      render(<FormCard {...defaultProps} stepCount={3} />)

      expect(screen.queryByAltText('Estimated Time')).not.toBeInTheDocument()
      expect(screen.getByText('3 steps')).toBeInTheDocument()
    })

    it('should handle negative stepCount', () => {
      render(<FormCard {...defaultProps} stepCount={-1} />)

      expect(screen.queryByText(/steps/)).not.toBeInTheDocument()
    })

    it('should not call onAction when card is clicked without onAction prop', async () => {
      const user = userEvent.setup()
      render(<FormCard {...defaultProps} />)

      const card = screen.getByRole('group')
      await user.click(card)

      // No error should be thrown
      expect(card).toBeInTheDocument()
    })

    it('should handle both locked and disabled states simultaneously', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(
        <FormCard
          {...defaultProps}
          locked={true}
          disabled={true}
          onAction={onAction}
        />
      )

      const card = screen.getByRole('group')
      await user.click(card)

      expect(onAction).not.toHaveBeenCalled()
    })

    it('should render with all optional props provided', () => {
      const onAction = vi.fn()
      const icon = <span>★</span>

      render(
        <FormCard
          {...defaultProps}
          disabled={false}
          required={true}
          completed={false}
          locked={false}
          duration="20 min"
          stepCount={7}
          aiFieldPercentage={85}
          className="custom"
          data-testid="full-card"
          actionLabel="Start"
          onAction={onAction}
          showActionButton={true}
          actionVariant="primary"
          titleIcon={icon}
          approvalIndex={90}
          badgeType="Mandatory"
          secondaryBadgeLabel="New"
          showMetaRow={true}
        />
      )

      expect(screen.getByTestId('full-card')).toBeInTheDocument()
      expect(screen.getByText('Test Form')).toBeInTheDocument()
    })

    it('should prevent default on Space key press', async () => {
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      card.focus()

      // Simulate space key with preventDefault tracking
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      card.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should prevent default on Enter key press', async () => {
      const onAction = vi.fn()
      render(<FormCard {...defaultProps} onAction={onAction} />)

      const card = screen.getByRole('button')
      card.focus()

      // Simulate Enter key with preventDefault tracking
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      card.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label matching title', () => {
      render(<FormCard {...defaultProps} />)

      const card = screen.getByLabelText('Test Form')
      expect(card).toBeInTheDocument()
    })

    it('should have proper role based on interactivity', () => {
      const { rerender } = render(<FormCard {...defaultProps} />)

      expect(screen.getByRole('group')).toBeInTheDocument()

      rerender(<FormCard {...defaultProps} onAction={vi.fn()} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should have proper tabIndex for keyboard navigation', () => {
      const { rerender } = render(<FormCard {...defaultProps} />)

      let card = screen.getByRole('group')
      expect(card).toHaveAttribute('tabIndex', '-1')

      rerender(<FormCard {...defaultProps} onAction={vi.fn()} />)

      card = screen.getByRole('button')
      expect(card).toHaveAttribute('tabIndex', '0')
    })
  })
})
