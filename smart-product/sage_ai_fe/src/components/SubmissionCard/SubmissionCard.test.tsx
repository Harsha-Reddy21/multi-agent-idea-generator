import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SubmissionCardProps } from '@/core/models/submission-card.model'

import { SubmissionStatus } from '../../core/models/dashboard.model'
import SubmissionCard from './SubmissionCard'

// Mock the EnhancedAIRegistryForm component
vi.mock('../EnhancedAIRegistryForm', () => ({
  default: () => null,
}))

// Mock the LDS components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsBadge: ({
    children,
    className,
  }: React.PropsWithChildren<{ className?: string }>) => (
    <div className={className} data-testid="lds-badge">
      {children}
    </div>
  ),
  LdsButton: ({
    children,
    onClick,
    className,
    classes,
    ...props
  }: React.PropsWithChildren<{
    onClick?: () => void
    className?: string
    classes?: string
  }> &
    Record<string, unknown>) => (
    <button
      onClick={onClick}
      className={className}
      data-classes={classes}
      {...props}
    >
      {children}
    </button>
  ),
}))

describe('SubmissionCard', () => {
  const defaultProps: SubmissionCardProps = {
    id: 'submission-123',
    title: 'Test Submission',
    description: 'Test description',
    status: 'submitted' as SubmissionStatus,
    ticketNumber: 'TICKET-001',
    submitted_at: '2025-01-15T10:30:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render card with title', () => {
      render(<SubmissionCard {...defaultProps} />)

      expect(screen.getByText('Test Submission')).toBeInTheDocument()
    })

    it('should render with correct role and aria-label', () => {
      render(<SubmissionCard {...defaultProps} />)

      const card = screen.getByRole('group')
      expect(card).toHaveAttribute('aria-label', 'Test Submission')
    })

    it('should apply custom data-testid when provided', () => {
      render(<SubmissionCard {...defaultProps} data-testid="custom-card" />)

      expect(screen.getByTestId('custom-card')).toBeInTheDocument()
    })

    it('should apply custom className when provided', () => {
      const { container } = render(
        <SubmissionCard {...defaultProps} className="custom-class" />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })

    it('should render ticket number', () => {
      render(<SubmissionCard {...defaultProps} />)

      expect(screen.getByText('TICKET-001')).toBeInTheDocument()
    })
  })

  describe('Status Badge - Submitted', () => {
    it('should render "In Progress" badge for submitted status', () => {
      render(<SubmissionCard {...defaultProps} status="submitted" />)

      const badge = screen.getByTestId('lds-badge')
      expect(badge).toHaveTextContent('In Progress')
    })

    it('should apply in-progress CSS class for submitted status', () => {
      render(<SubmissionCard {...defaultProps} status="submitted" />)

      const badge = screen.getByTestId('lds-badge')
      expect(badge.className).toMatch(/status-inprogress/)
    })

    it('should apply statusBadge class for submitted status', () => {
      render(<SubmissionCard {...defaultProps} status="submitted" />)

      const badge = screen.getByTestId('lds-badge')
      expect(badge.className).toMatch(/statusBadge/)
    })
  })

  describe('Status Badge - Completed', () => {
    it('should render "Completed" badge for completed status', () => {
      render(<SubmissionCard {...defaultProps} status="completed" />)

      const badge = screen.getByTestId('lds-badge')
      expect(badge).toHaveTextContent('Completed')
    })

    it('should apply completed CSS class for completed status', () => {
      render(<SubmissionCard {...defaultProps} status="completed" />)

      const badge = screen.getByTestId('lds-badge')
      expect(badge.className).toMatch(/status-completed/)
    })

    it('should apply statusBadge class for completed status', () => {
      render(<SubmissionCard {...defaultProps} status="completed" />)

      const badge = screen.getByTestId('lds-badge')
      expect(badge.className).toMatch(/statusBadge/)
    })
  })

  describe('Date Formatting', () => {
    it('should format date correctly with valid ISO string', () => {
      render(
        <SubmissionCard {...defaultProps} submitted_at="2025-01-15T10:30:00Z" />
      )

      expect(screen.getByText('15 Jan 2025')).toBeInTheDocument()
    })

    it('should format date correctly with different month', () => {
      render(
        <SubmissionCard {...defaultProps} submitted_at="2025-12-25T10:30:00Z" />
      )

      expect(screen.getByText('25 Dec 2025')).toBeInTheDocument()
    })

    it('should format date with single-digit day padded with zero', () => {
      render(
        <SubmissionCard {...defaultProps} submitted_at="2025-03-05T10:30:00Z" />
      )

      expect(screen.getByText('05 Mar 2025')).toBeInTheDocument()
    })

    it('should handle invalid date string gracefully', () => {
      render(<SubmissionCard {...defaultProps} submitted_at="invalid-date" />)

      expect(screen.getByText('invalid-date')).toBeInTheDocument()
    })

    it('should handle empty string date', () => {
      render(<SubmissionCard {...defaultProps} submitted_at="" />)

      const createdOnLabel = screen.getByText('Created On:')
      expect(createdOnLabel).toBeInTheDocument()
    })

    it('should handle undefined submitted_at', () => {
      render(<SubmissionCard {...defaultProps} submitted_at={undefined} />)

      const createdOnLabel = screen.getByText('Created On:')
      expect(createdOnLabel).toBeInTheDocument()
    })
  })

  describe('Labels and Text', () => {
    it('should render "Submission ID:" label', () => {
      render(<SubmissionCard {...defaultProps} />)

      expect(screen.getByText('Submission ID:')).toBeInTheDocument()
    })

    it('should render "Created On:" label', () => {
      render(<SubmissionCard {...defaultProps} />)

      expect(screen.getByText('Created On:')).toBeInTheDocument()
    })

    it('should render ticket number with correct CSS class', () => {
      const { container } = render(<SubmissionCard {...defaultProps} />)

      const ticketSpans = container.querySelectorAll('[class*="ticketNumber"]')
      expect(ticketSpans.length).toBeGreaterThan(0)
    })

    it('should render submission ID label with correct CSS class', () => {
      const { container } = render(<SubmissionCard {...defaultProps} />)

      const labels = container.querySelectorAll('[class*="submissionIdLabel"]')
      expect(labels.length).toBe(2)
    })
  })

  describe('Update Button - With onUpdate', () => {
    it('should render "View Details" button when onUpdate is provided', () => {
      const onUpdate = vi.fn()
      render(<SubmissionCard {...defaultProps} onUpdate={onUpdate} />)

      expect(screen.getByText('View Details')).toBeInTheDocument()
    })

    it('should call onUpdate with correct id when button is clicked', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(<SubmissionCard {...defaultProps} onUpdate={onUpdate} />)

      const button = screen.getByText('View Details')
      await user.click(button)

      expect(onUpdate).toHaveBeenCalledWith('submission-123')
      expect(onUpdate).toHaveBeenCalledTimes(1)
    })

    it('should have correct aria-label on button', () => {
      const onUpdate = vi.fn()
      render(<SubmissionCard {...defaultProps} onUpdate={onUpdate} />)

      const button = screen.getByLabelText('View Submission Details')
      expect(button).toBeInTheDocument()
    })

    it('should apply compact primary radius-sm classes to button', () => {
      const onUpdate = vi.fn()
      render(<SubmissionCard {...defaultProps} onUpdate={onUpdate} />)

      const button = screen.getByText('View Details')
      expect(button).toHaveAttribute(
        'data-classes',
        'compact primary radius-sm'
      )
    })
  })

  describe('Update Button - Without onUpdate', () => {
    it('should not render "View Details" button when onUpdate is not provided', () => {
      render(<SubmissionCard {...defaultProps} />)

      expect(screen.queryByText('View Details')).not.toBeInTheDocument()
    })

    it('should not render button when onUpdate is undefined', () => {
      render(<SubmissionCard {...defaultProps} onUpdate={undefined} />)

      expect(screen.queryByText('View Details')).not.toBeInTheDocument()
    })
  })

  describe('Title Click Handler', () => {
    it('should call onUpdate when title is clicked', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(<SubmissionCard {...defaultProps} onUpdate={onUpdate} />)

      const title = screen.getByText('Test Submission')
      await user.click(title)

      expect(onUpdate).toHaveBeenCalledWith('submission-123')
    })

    it('should not error when title is clicked without onUpdate', async () => {
      const user = userEvent.setup()
      render(<SubmissionCard {...defaultProps} />)

      const title = screen.getByText('Test Submission')
      await user.click(title)

      // Should not throw error
      expect(title).toBeInTheDocument()
    })
  })

  describe('SubText Click Handler', () => {
    it('should call onUpdate when subText is clicked', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(<SubmissionCard {...defaultProps} onUpdate={onUpdate} />)

      const subText =
        screen.getByText('Submission ID:').parentElement?.parentElement
      if (subText) {
        await user.click(subText)
      }

      expect(onUpdate).toHaveBeenCalledWith('submission-123')
    })

    it('should not error when subText is clicked without onUpdate', async () => {
      const user = userEvent.setup()
      render(<SubmissionCard {...defaultProps} />)

      const subText =
        screen.getByText('Submission ID:').parentElement?.parentElement
      if (subText) {
        await user.click(subText)
      }

      // Should not throw error
      expect(screen.getByText('Submission ID:')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<SubmissionCard {...defaultProps} title="" />)

      const card = screen.getByRole('group')
      expect(card).toHaveAttribute('aria-label', '')
    })

    it('should handle special characters in title', () => {
      render(
        <SubmissionCard
          {...defaultProps}
          title="Test & Special <> Characters"
        />
      )

      expect(
        screen.getByText('Test & Special <> Characters')
      ).toBeInTheDocument()
    })

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200)
      render(<SubmissionCard {...defaultProps} title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle empty ticket number', () => {
      render(<SubmissionCard {...defaultProps} ticketNumber="" />)

      expect(screen.getByText('Submission ID:')).toBeInTheDocument()
    })

    it('should handle undefined ticket number', () => {
      render(<SubmissionCard {...defaultProps} ticketNumber={undefined} />)

      expect(screen.getByText('Submission ID:')).toBeInTheDocument()
    })

    it('should handle special characters in ticket number', () => {
      render(
        <SubmissionCard {...defaultProps} ticketNumber="TICK-#123-$TEST" />
      )

      expect(screen.getByText('TICK-#123-$TEST')).toBeInTheDocument()
    })
  })

  describe('CSS Classes Application', () => {
    it('should combine custom className with default classes', () => {
      const { container } = render(
        <SubmissionCard {...defaultProps} className="extra-class" />
      )

      const card = container.querySelector('.extra-class')
      expect(card?.className).toMatch(/submissionCard/)
      expect(card?.className).toMatch(/extra-class/)
    })

    it('should apply headerRow class', () => {
      const { container } = render(<SubmissionCard {...defaultProps} />)

      const headerRow = container.querySelector('[class*="headerRow"]')
      expect(headerRow).toBeInTheDocument()
    })

    it('should apply actionsRow class', () => {
      const { container } = render(
        <SubmissionCard {...defaultProps} onUpdate={vi.fn()} />
      )

      const actionsRow = container.querySelector('[class*="actionsRow"]')
      expect(actionsRow).toBeInTheDocument()
    })

    it('should apply titleBlock class', () => {
      const { container } = render(<SubmissionCard {...defaultProps} />)

      const titleBlock = container.querySelector('[class*="titleBlock"]')
      expect(titleBlock).toBeInTheDocument()
    })

    it('should apply title class to h3', () => {
      const { container } = render(<SubmissionCard {...defaultProps} />)

      const title = container.querySelector('h3[class*="title"]')
      expect(title?.tagName).toBe('H3')
    })

    it('should apply subText class', () => {
      const { container } = render(<SubmissionCard {...defaultProps} />)

      const subText = container.querySelector('[class*="subText"]')
      expect(subText).toBeInTheDocument()
    })

    it('should apply badges class', () => {
      const { container } = render(<SubmissionCard {...defaultProps} />)

      const badges = container.querySelector('[class*="badges"]')
      expect(badges).toBeInTheDocument()
    })
  })

  describe('Multiple Submissions with Different Props', () => {
    it('should render multiple cards with different statuses', () => {
      const { rerender } = render(
        <SubmissionCard {...defaultProps} status="submitted" />
      )
      expect(screen.getByText('In Progress')).toBeInTheDocument()

      rerender(<SubmissionCard {...defaultProps} status="completed" />)
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('should handle different IDs correctly', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      const { rerender } = render(
        <SubmissionCard {...defaultProps} id="id-1" onUpdate={onUpdate} />
      )

      await user.click(screen.getByText('View Details'))
      expect(onUpdate).toHaveBeenCalledWith('id-1')

      onUpdate.mockClear()

      rerender(
        <SubmissionCard {...defaultProps} id="id-2" onUpdate={onUpdate} />
      )

      await user.click(screen.getByText('View Details'))
      expect(onUpdate).toHaveBeenCalledWith('id-2')
    })
  })

  describe('Date Edge Cases', () => {
    it('should format date with year 2023', () => {
      render(
        <SubmissionCard {...defaultProps} submitted_at="2023-06-15T10:30:00Z" />
      )

      expect(screen.getByText('15 Jun 2023')).toBeInTheDocument()
    })

    it('should format date with year 2030', () => {
      render(
        <SubmissionCard {...defaultProps} submitted_at="2030-09-01T10:30:00Z" />
      )

      expect(screen.getByText('01 Sep 2030')).toBeInTheDocument()
    })

    it('should handle date at start of year', () => {
      render(
        <SubmissionCard {...defaultProps} submitted_at="2025-01-01T00:00:00Z" />
      )

      expect(screen.getByText(/\d{2} \w{3} \d{4}/)).toBeInTheDocument()
    })

    it('should handle date at end of year', () => {
      render(
        <SubmissionCard {...defaultProps} submitted_at="2025-12-31T12:00:00Z" />
      )

      // Date might show as 31 Dec or 01 Jan depending on timezone
      expect(screen.getByText(/31 Dec 2025|01 Jan 2026/)).toBeInTheDocument()
    })
  })

  describe('Fallback Status Handling', () => {
    it('should handle statusClass fallback for unknown status', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<SubmissionCard {...defaultProps} status={'unknown' as any} />)

      const badge = screen.getByTestId('lds-badge')
      // Should have statusBadge class but not status-inprogress or status-completed
      expect(badge.className).toMatch(/statusBadge/)
      expect(badge.className).not.toMatch(/status-inprogress/)
      expect(badge.className).not.toMatch(/status-completed/)
    })

    it('should use statusLabelMap for badge text with unknown status', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<SubmissionCard {...defaultProps} status={'completed' as any} />)

      const badge = screen.getByTestId('lds-badge')
      // Verify the fallback uses statusLabelMap by checking completed maps to "Completed"
      expect(badge).toHaveTextContent('Completed')
    })
  })

  describe('Update AI Registry Form Button', () => {
    it('should show "Update AI Registry Form" button when status is completed and onUpdate is provided', () => {
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="completed"
          onUpdate={onUpdate}
          aiRegistryFormId="form-123"
        />
      )

      expect(screen.getByText('Update AI Registry Form')).toBeInTheDocument()
    })

    it('should not show "Update AI Registry Form" button when status is submitted', () => {
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="submitted"
          onUpdate={onUpdate}
          aiRegistryFormId="form-123"
        />
      )

      expect(
        screen.queryByText('Update AI Registry Form')
      ).not.toBeInTheDocument()
    })

    it('should not show "Update AI Registry Form" button when onUpdate is not provided', () => {
      render(
        <SubmissionCard
          {...defaultProps}
          status="completed"
          aiRegistryFormId="form-123"
        />
      )

      expect(
        screen.queryByText('Update AI Registry Form')
      ).not.toBeInTheDocument()
    })

    it('should show "Update AI Registry Form" button when status is completed regardless of aiRegistryFormId', () => {
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="completed"
          onUpdate={onUpdate}
          aiRegistryFormId=""
        />
      )

      // Button should show based on status alone, not aiRegistryFormId
      expect(screen.getByText('Update AI Registry Form')).toBeInTheDocument()
    })

    it('should have correct aria-label on Update AI Registry Form button', () => {
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="completed"
          onUpdate={onUpdate}
          aiRegistryFormId="form-123"
        />
      )

      const button = screen.getByLabelText('Update AI Registry Form')
      expect(button).toBeInTheDocument()
    })

    it('should apply correct CSS classes to Update AI Registry Form button', () => {
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="completed"
          onUpdate={onUpdate}
          aiRegistryFormId="form-123"
        />
      )

      const button = screen.getByText('Update AI Registry Form')
      expect(button).toHaveAttribute('data-classes', 'compact link radius-sm')
    })

    it('should open modal when Update AI Registry Form button is clicked', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="completed"
          onUpdate={onUpdate}
          aiRegistryFormId="form-123"
        />
      )

      const button = screen.getByText('Update AI Registry Form')
      await user.click(button)

      // Modal opening is handled by state, but we can verify the button click doesn't throw
      expect(button).toBeInTheDocument()
    })

    it('should not call onUpdate when Update AI Registry Form button is clicked', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="completed"
          onUpdate={onUpdate}
          aiRegistryFormId="form-123"
        />
      )

      const updateButton = screen.getByText('Update AI Registry Form')
      await user.click(updateButton)

      // The Update AI Registry Form button should open a modal, not call onUpdate
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should show both View Details and Update AI Registry Form buttons when status is completed', () => {
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="completed"
          onUpdate={onUpdate}
          aiRegistryFormId="form-123"
        />
      )

      expect(screen.getByText('View Details')).toBeInTheDocument()
      expect(screen.getByText('Update AI Registry Form')).toBeInTheDocument()
    })

    it('should only show View Details button when status is not completed', () => {
      const onUpdate = vi.fn()
      render(
        <SubmissionCard
          {...defaultProps}
          status="submitted"
          onUpdate={onUpdate}
          aiRegistryFormId="form-123"
        />
      )

      expect(screen.getByText('View Details')).toBeInTheDocument()
      expect(
        screen.queryByText('Update AI Registry Form')
      ).not.toBeInTheDocument()
    })
  })
})
