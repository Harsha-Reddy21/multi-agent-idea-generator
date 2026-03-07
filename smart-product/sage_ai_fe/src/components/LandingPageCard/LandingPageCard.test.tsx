import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import LandingPageCard from './LandingPageCard'

describe('LandingPageCard', () => {
  describe('Basic Rendering', () => {
    it('should render card with title', () => {
      render(<LandingPageCard title="Test Card Title" />)

      const card = screen.getByTestId('landing-page-card')
      expect(card).toBeInTheDocument()

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('Test Card Title')
    })

    it('should apply correct CSS class to card', () => {
      render(<LandingPageCard title="Test" />)

      const card = screen.getByTestId('landing-page-card')
      expect(card.className).toContain('card')
    })

    it('should apply correct CSS class to title', () => {
      const { container } = render(<LandingPageCard title="Test Title" />)

      const title = container.querySelector('h3')
      expect(title?.className).toContain('title')
    })
  })

  describe('Aria Label', () => {
    it('should use title as aria-label when ariaLabel is not provided', () => {
      render(<LandingPageCard title="My Card Title" />)

      const card = screen.getByTestId('landing-page-card')
      expect(card).toHaveAttribute('aria-label', 'My Card Title')
    })

    it('should use custom ariaLabel when provided', () => {
      render(
        <LandingPageCard
          title="Card Title"
          ariaLabel="Custom Accessible Label"
        />
      )

      const card = screen.getByTestId('landing-page-card')
      expect(card).toHaveAttribute('aria-label', 'Custom Accessible Label')
    })

    it('should prioritize ariaLabel over title', () => {
      render(
        <LandingPageCard title="Visual Title" ariaLabel="Screen Reader Label" />
      )

      const card = screen.getByTestId('landing-page-card')
      expect(card).toHaveAttribute('aria-label', 'Screen Reader Label')
      expect(card).not.toHaveAttribute('aria-label', 'Visual Title')
    })
  })

  describe('Description', () => {
    it('should render description when provided as string', () => {
      render(
        <LandingPageCard
          title="Test"
          description="This is a test description"
        />
      )

      expect(screen.getByText('This is a test description')).toBeInTheDocument()
    })

    it('should render description when provided as ReactNode', () => {
      const description = (
        <div data-testid="custom-description">
          <strong>Bold text</strong> and regular text
        </div>
      )
      render(<LandingPageCard title="Test" description={description} />)

      expect(screen.getByTestId('custom-description')).toBeInTheDocument()
      expect(screen.getByText('Bold text')).toBeInTheDocument()
    })

    it('should not render description wrapper when description is not provided', () => {
      const { container } = render(<LandingPageCard title="Test" />)

      const descriptionWrapper = container.querySelector(
        '[class*="descriptionWrapper"]'
      )
      expect(descriptionWrapper).not.toBeInTheDocument()
    })

    it('should apply correct CSS class to description', () => {
      render(<LandingPageCard title="Test" description="Test description" />)

      const description = screen.getByText('Test description')
      expect(description.className).toContain('description')
    })
  })

  describe('Description Emphasis', () => {
    it('should render descriptionEmphasis when provided', () => {
      render(
        <LandingPageCard
          title="Test"
          descriptionEmphasis="3 Active Submissions"
        />
      )

      expect(screen.getByText('3 Active Submissions')).toBeInTheDocument()
    })

    it('should render descriptionEmphasis as ReactNode', () => {
      const emphasis = (
        <span data-testid="emphasis-node">
          <strong>5</strong> submissions
        </span>
      )
      render(<LandingPageCard title="Test" descriptionEmphasis={emphasis} />)

      expect(screen.getByTestId('emphasis-node')).toBeInTheDocument()
    })

    it('should apply emphasis CSS classes', () => {
      render(
        <LandingPageCard title="Test" descriptionEmphasis="Emphasized text" />
      )

      const emphasis = screen.getByText('Emphasized text')
      expect(emphasis.className).toContain('description')
      expect(emphasis.className).toContain('descriptionEmphasis')
    })

    it('should render both descriptionEmphasis and description', () => {
      render(
        <LandingPageCard
          title="Test"
          descriptionEmphasis="Emphasis line"
          description="Regular description"
        />
      )

      expect(screen.getByText('Emphasis line')).toBeInTheDocument()
      expect(screen.getByText('Regular description')).toBeInTheDocument()
    })

    it('should render description wrapper when only descriptionEmphasis is provided', () => {
      const { container } = render(
        <LandingPageCard
          title="Test Card"
          descriptionEmphasis="Only emphasis"
        />
      )

      const descriptionWrapper = container.querySelector(
        '[class*="descriptionWrapper"]'
      )
      expect(descriptionWrapper).toBeInTheDocument()
      expect(screen.getByText('Only emphasis')).toBeInTheDocument()
    })

    it('should render description wrapper when only description is provided', () => {
      const { container } = render(
        <LandingPageCard title="Test Card" description="Only description" />
      )

      const descriptionWrapper = container.querySelector(
        '[class*="descriptionWrapper"]'
      )
      expect(descriptionWrapper).toBeInTheDocument()
      expect(screen.getByText('Only description')).toBeInTheDocument()
    })

    it('should not render descriptionEmphasis span when descriptionEmphasis is undefined', () => {
      const { container } = render(
        <LandingPageCard
          title="Test"
          description="Has description"
          descriptionEmphasis={undefined}
        />
      )

      const emphasisSpan = container.querySelector(
        '[class*="descriptionEmphasis"]'
      )
      expect(emphasisSpan).not.toBeInTheDocument()
    })

    it('should not render description span when description is undefined', () => {
      const { container } = render(
        <LandingPageCard
          title="Test"
          descriptionEmphasis="Has emphasis"
          description={undefined}
        />
      )

      // Only one span should exist (the emphasis one)
      const spans = container.querySelectorAll('span[class*="description"]')
      expect(spans.length).toBe(1)
      expect(spans[0]).toHaveTextContent('Has emphasis')
    })
  })

  describe('Children (Body Content)', () => {
    it('should render children when provided', () => {
      render(
        <LandingPageCard title="Test">
          <div data-testid="custom-content">Custom body content</div>
        </LandingPageCard>
      )

      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByText('Custom body content')).toBeInTheDocument()
    })

    it('should not render body wrapper when children is not provided', () => {
      const { container } = render(<LandingPageCard title="Test" />)

      const body = container.querySelector('[class*="body"]')
      expect(body).not.toBeInTheDocument()
    })

    it('should apply correct CSS class to body', () => {
      render(
        <LandingPageCard title="Test Card">
          <div>Body content</div>
        </LandingPageCard>
      )

      const body = screen.getByText('Body content').parentElement
      expect(body?.className).toMatch(/body/)
    })

    it('should render multiple children elements', () => {
      render(
        <LandingPageCard title="Test">
          <button data-testid="btn-1">Button 1</button>
          <button data-testid="btn-2">Button 2</button>
          <p data-testid="paragraph">Paragraph</p>
        </LandingPageCard>
      )

      expect(screen.getByTestId('btn-1')).toBeInTheDocument()
      expect(screen.getByTestId('btn-2')).toBeInTheDocument()
      expect(screen.getByTestId('paragraph')).toBeInTheDocument()
    })

    it('should render complex nested children', () => {
      render(
        <LandingPageCard title="Test">
          <div>
            <video data-testid="video-element" />
            <div data-testid="actions">
              <button>Start</button>
              <button>Cancel</button>
            </div>
          </div>
        </LandingPageCard>
      )

      expect(screen.getByTestId('video-element')).toBeInTheDocument()
      expect(screen.getByTestId('actions')).toBeInTheDocument()
    })
  })

  describe('Preserve Whitespace', () => {
    it('should apply pre-line style when preserveWhitespace is true (default)', () => {
      render(
        <LandingPageCard title="Test" description="Line 1\nLine 2\nLine 3" />
      )

      const description = screen.getByText(/Line 1/)
      expect(description).toHaveStyle({ whiteSpace: 'pre-line' })
    })

    it('should apply pre-line style when preserveWhitespace is explicitly true', () => {
      render(
        <LandingPageCard
          title="Test"
          description="Multi\nline\ntext"
          preserveWhitespace={true}
        />
      )

      const description = screen.getByText(/Multi/)
      expect(description).toHaveStyle({ whiteSpace: 'pre-line' })
    })

    it('should not apply pre-line style when preserveWhitespace is false', () => {
      render(
        <LandingPageCard
          title="Test"
          description="Single line"
          preserveWhitespace={false}
        />
      )

      const description = screen.getByText('Single line')
      expect(description).not.toHaveStyle({ whiteSpace: 'pre-line' })
    })

    it('should handle undefined style when preserveWhitespace is false', () => {
      render(
        <LandingPageCard
          title="Test"
          description="No whitespace preservation"
          preserveWhitespace={false}
        />
      )

      const description = screen.getByText('No whitespace preservation')
      const hasPreLine = description.style.whiteSpace === 'pre-line'
      expect(hasPreLine).toBe(false)
    })
  })

  describe('Complete Card Combinations', () => {
    it('should render all props together', () => {
      render(
        <LandingPageCard
          title="Complete Card"
          description="Full description text"
          descriptionEmphasis="5 items"
          ariaLabel="Accessible complete card"
          preserveWhitespace={true}
        >
          <button>Action Button</button>
        </LandingPageCard>
      )

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Complete Card'
      )
      expect(screen.getByText('Full description text')).toBeInTheDocument()
      expect(screen.getByText('5 items')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Action Button' })
      ).toBeInTheDocument()

      const card = screen.getByTestId('landing-page-card')
      expect(card).toHaveAttribute('aria-label', 'Accessible complete card')
    })

    it('should render minimal card with only title', () => {
      render(<LandingPageCard title="Minimal Card" />)

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Minimal Card'
      )
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
    })

    it('should render card with title and children only', () => {
      render(
        <LandingPageCard title="Card with Body">
          <div data-testid="body-only">Body content only</div>
        </LandingPageCard>
      )

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Card with Body'
      )
      expect(screen.getByTestId('body-only')).toBeInTheDocument()
    })

    it('should render card with title and description only', () => {
      render(
        <LandingPageCard
          title="Card with Description"
          description="Description text only"
        />
      )

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Card with Description'
      )
      expect(screen.getByText('Description text only')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string title', () => {
      render(<LandingPageCard title="" />)

      const card = screen.getByTestId('landing-page-card')
      expect(card).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      render(<LandingPageCard title="Test & Special <Characters>" />)

      expect(
        screen.getByText('Test & Special <Characters>')
      ).toBeInTheDocument()
    })

    it('should handle long text content', () => {
      const longText = 'Lorem ipsum '.repeat(50)
      render(<LandingPageCard title="Long Content" description={longText} />)

      expect(screen.getByText(longText.trim())).toBeInTheDocument()
    })

    it('should handle undefined description with preserveWhitespace true', () => {
      render(<LandingPageCard title="Test" preserveWhitespace={true} />)

      const card = screen.getByTestId('landing-page-card')
      expect(card).toBeInTheDocument()
    })

    it('should handle null children gracefully', () => {
      const { container } = render(
        // eslint-disable-next-line react/no-children-prop
        <LandingPageCard title="Test" children={null} />
      )

      const body = container.querySelector('[class*="body"]')
      expect(body).not.toBeInTheDocument()
    })

    it('should handle undefined children gracefully', () => {
      const { container } = render(
        // eslint-disable-next-line react/no-children-prop
        <LandingPageCard title="Test" children={undefined} />
      )

      const body = container.querySelector('[class*="body"]')
      expect(body).not.toBeInTheDocument()
    })

    it('should handle empty string ariaLabel', () => {
      render(<LandingPageCard title="Title" ariaLabel="" />)

      const card = screen.getByTestId('landing-page-card')
      // Empty string is falsy, so it should fall back to title
      expect(card).toHaveAttribute('aria-label', 'Title')
    })

    it('should not render description wrapper when both description and descriptionEmphasis are undefined', () => {
      const { container } = render(
        <LandingPageCard
          title="Test"
          description={undefined}
          descriptionEmphasis={undefined}
        />
      )

      const descriptionWrapper = container.querySelector(
        '[class*="descriptionWrapper"]'
      )
      expect(descriptionWrapper).not.toBeInTheDocument()
    })

    it('should apply style undefined when preserveWhitespace is false', () => {
      render(
        <LandingPageCard
          title="Test"
          description="Text"
          preserveWhitespace={false}
        />
      )

      const description = screen.getByText('Text')
      expect(description.getAttribute('style')).toBe(null)
    })

    it('should render with all optional props as undefined', () => {
      const { container } = render(
        <LandingPageCard
          title="Only Title"
          description={undefined}
          descriptionEmphasis={undefined}
          ariaLabel={undefined}
          // eslint-disable-next-line react/no-children-prop
          children={undefined}
        />
      )

      const card = screen.getByTestId('landing-page-card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('aria-label', 'Only Title')

      const descriptionWrapper = container.querySelector(
        '[class*="descriptionWrapper"]'
      )
      const body = container.querySelector('[class*="body"]')
      expect(descriptionWrapper).not.toBeInTheDocument()
      expect(body).not.toBeInTheDocument()
    })
  })
})
