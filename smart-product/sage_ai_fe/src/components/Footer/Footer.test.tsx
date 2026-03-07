import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Footer from './Footer'

describe('Footer', () => {
  it('should render footer element', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('should have Footer class', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('Footer')
  })

  it('should render logo image', () => {
    render(<Footer />)

    const logo = screen.getByAltText('Lilly - A Medicine Company')
    expect(logo).toBeInTheDocument()
  })

  it('should have logo inside Footer__inner div', () => {
    const { container } = render(<Footer />)

    const innerDiv = container.querySelector('.Footer__inner')
    expect(innerDiv).toBeInTheDocument()

    const logo = screen.getByAltText('Lilly - A Medicine Company')
    expect(innerDiv).toContainElement(logo)
  })

  it('should render navigation element', () => {
    render(<Footer />)

    const nav = screen.getByRole('navigation', { name: 'Footer navigation' })
    expect(nav).toBeInTheDocument()
  })

  it('should have Footer__links class on navigation', () => {
    render(<Footer />)

    const nav = screen.getByRole('navigation', { name: 'Footer navigation' })
    expect(nav).toHaveClass('Footer__links')
  })

  it('should render "Using AI Responsibly at Lilly" link', () => {
    render(<Footer />)

    const link = screen.getByRole('link', {
      name: 'Using AI Responsibly at Lilly',
    })
    expect(link).toBeInTheDocument()
  })

  it('should have correct href for AI Responsibly link', () => {
    render(<Footer />)

    const link = screen.getByRole('link', {
      name: 'Using AI Responsibly at Lilly',
    })
    expect(link).toHaveAttribute(
      'href',
      'https://now.lilly.com/procedure/global-using-ai-responsibly-at-lilly'
    )
  })

  it('should open AI Responsibly link in new tab', () => {
    render(<Footer />)

    const link = screen.getByRole('link', {
      name: 'Using AI Responsibly at Lilly',
    })
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should have security attributes on external link', () => {
    render(<Footer />)

    const link = screen.getByRole('link', {
      name: 'Using AI Responsibly at Lilly',
    })
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have Footer__link class on link', () => {
    render(<Footer />)

    const link = screen.getByRole('link', {
      name: 'Using AI Responsibly at Lilly',
    })
    expect(link).toHaveClass('Footer__link')
  })

  it('should render only one link', () => {
    render(<Footer />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
  })

  it('should have aria-label on navigation', () => {
    render(<Footer />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Footer navigation')
  })

  it('should render logo with correct src attribute', () => {
    render(<Footer />)

    const logo = screen.getByAltText('Lilly - A Medicine Company')
    expect(logo).toHaveAttribute('src')
    expect(logo.getAttribute('src')).toBeTruthy()
  })
})
