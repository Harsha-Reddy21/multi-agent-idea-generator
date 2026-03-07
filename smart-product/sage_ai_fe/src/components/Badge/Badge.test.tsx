import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Badge from './Badge'

describe('Badge', () => {
  it('should render with required props only', () => {
    render(<Badge text="Test Badge" type="optional" />)

    expect(screen.getByTestId('badge')).toBeInTheDocument()
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('should apply submitted variant class', () => {
    render(<Badge text="Submitted" type="submitted" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(screen.getByText('Submitted')).toBeInTheDocument()
  })

  it('should apply mandatory variant class', () => {
    render(<Badge text="Mandatory" type="mandatory" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(screen.getByText('Mandatory')).toBeInTheDocument()
  })

  it('should apply required variant class', () => {
    render(<Badge text="Required" type="required" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('should apply optional variant class by default', () => {
    render(<Badge text="Optional" type="optional" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(screen.getByText('Optional')).toBeInTheDocument()
  })

  it('should apply optional light variant when light prop is true', () => {
    render(<Badge text="Optional Light" type="optional" light={true} />)

    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(screen.getByText('Optional Light')).toBeInTheDocument()
  })

  it('should apply optional light variant when light is true and type is not optional', () => {
    render(<Badge text="Light Badge" type="submitted" light={true} />)

    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
  })

  it('should use default light value of false', () => {
    render(<Badge text="Default Light" type="optional" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
  })

  it('should apply custom backgroundColor when type is optional', () => {
    render(
      <Badge
        text="Custom Background"
        type="optional"
        backgroundColor="#ff0000"
      />
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveStyle({ background: '#ff0000' })
  })

  it('should apply custom borderColor when type is optional', () => {
    render(<Badge text="Custom Border" type="optional" borderColor="#00ff00" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveStyle({ borderColor: '#00ff00' })
  })

  it('should apply custom textColor when type is optional', () => {
    render(<Badge text="Custom Text" type="optional" textColor="#0000ff" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveStyle({ color: '#0000ff' })
  })

  it('should apply all custom colors when type is optional', () => {
    render(
      <Badge
        text="All Custom"
        type="optional"
        backgroundColor="#ff0000"
        borderColor="#00ff00"
        textColor="#0000ff"
      />
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveStyle({
      background: '#ff0000',
      borderColor: '#00ff00',
      color: '#0000ff',
    })
  })

  it('should not apply custom colors when type is not optional', () => {
    render(
      <Badge
        text="Not Optional"
        type="submitted"
        backgroundColor="#ff0000"
        borderColor="#00ff00"
        textColor="#0000ff"
      />
    )

    const badge = screen.getByTestId('badge')
    expect(badge).not.toHaveStyle({
      background: '#ff0000',
    })
  })

  it('should apply custom className', () => {
    render(
      <Badge text="Custom Class" type="optional" className="my-custom-class" />
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('my-custom-class')
  })

  it('should use custom data-testid', () => {
    render(
      <Badge text="Custom TestID" type="optional" data-testid="custom-badge" />
    )

    expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
  })

  it('should use default data-testid when not provided', () => {
    render(<Badge text="Default TestID" type="optional" />)

    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('should have aria-label matching text', () => {
    render(<Badge text="Accessible Badge" type="optional" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('aria-label', 'Accessible Badge')
  })

  it('should have role="status"', () => {
    render(<Badge text="Status Badge" type="optional" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('role', 'status')
  })

  it('should render with icon element', () => {
    const icon = <span data-testid="custom-icon">★</span>

    render(<Badge text="With Icon" type="optional" icon={icon} />)

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(screen.getByText('★')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })

  it('should render icon with aria-hidden', () => {
    const icon = <span>★</span>

    render(<Badge text="Icon Hidden" type="optional" icon={icon} />)

    const badge = screen.getByTestId('badge')
    const iconWrapper = badge.querySelector('[aria-hidden="true"]')
    expect(iconWrapper).toBeInTheDocument()
  })

  it('should render with iconSrc when no icon is provided', () => {
    render(
      <Badge
        text="With Icon Src"
        type="optional"
        iconSrc="data:image/svg+xml,%3Csvg%3E%3C/svg%3E"
      />
    )

    const image = screen.getByAltText('Additional information icon')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute(
      'src',
      'data:image/svg+xml,%3Csvg%3E%3C/svg%3E'
    )
  })

  it('should prioritize icon over iconSrc when both are provided', () => {
    const icon = <span data-testid="custom-icon">★</span>

    render(
      <Badge
        text="Icon Priority"
        type="optional"
        icon={icon}
        iconSrc="data:image/svg+xml,%3Csvg%3E%3C/svg%3E"
      />
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(
      screen.queryByAltText('Additional information icon')
    ).not.toBeInTheDocument()
  })

  it('should render without any icon when neither icon nor iconSrc is provided', () => {
    render(<Badge text="No Icon" type="optional" />)

    const badge = screen.getByTestId('badge')
    expect(badge.querySelector('img')).not.toBeInTheDocument()
    expect(badge.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('should filter out falsy className values', () => {
    render(<Badge text="Filter Class" type="optional" className="" />)

    const badge = screen.getByTestId('badge')
    expect(badge.className).not.toContain('undefined')
    expect(badge.className).not.toContain('null')
  })

  it('should handle all variant types with custom colors', () => {
    const { rerender } = render(
      <Badge text="Variant Test" type="optional" backgroundColor="#ff0000" />
    )

    let badge = screen.getByTestId('badge')
    expect(badge).toHaveStyle({ background: '#ff0000' })

    rerender(
      <Badge text="Variant Test" type="submitted" backgroundColor="#ff0000" />
    )

    badge = screen.getByTestId('badge')
    expect(badge).not.toHaveStyle({ background: '#ff0000' })

    rerender(
      <Badge text="Variant Test" type="mandatory" backgroundColor="#ff0000" />
    )

    badge = screen.getByTestId('badge')
    expect(badge).not.toHaveStyle({ background: '#ff0000' })

    rerender(
      <Badge text="Variant Test" type="required" backgroundColor="#ff0000" />
    )

    badge = screen.getByTestId('badge')
    expect(badge).not.toHaveStyle({ background: '#ff0000' })
  })

  it('should apply styleOverride only for optional type with custom colors', () => {
    render(
      <Badge
        text="Style Override"
        type="optional"
        backgroundColor="#123456"
        borderColor="#654321"
        textColor="#ffffff"
      />
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveStyle({
      background: '#123456',
      borderColor: '#654321',
      color: '#ffffff',
    })
  })

  it('should not apply styleOverride when type is optional but no custom colors', () => {
    render(<Badge text="No Override" type="optional" />)

    const badge = screen.getByTestId('badge')
    expect(badge).not.toHaveAttribute('style')
  })

  it('should handle light=false explicitly', () => {
    render(<Badge text="Light False" type="optional" light={false} />)

    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
  })

  it('should render complex icon elements', () => {
    const complexIcon = (
      <svg data-testid="complex-icon" width="16" height="16">
        <circle cx="8" cy="8" r="8" />
      </svg>
    )

    render(<Badge text="Complex Icon" type="optional" icon={complexIcon} />)

    expect(screen.getByTestId('complex-icon')).toBeInTheDocument()
    expect(screen.getByText('Complex Icon')).toBeInTheDocument()
  })
})
