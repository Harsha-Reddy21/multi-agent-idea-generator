import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoadingSpinner } from './LoadingSpinner'

// Mock the LDS component
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsLoadingSpinner: vi.fn(({ className, ariaLabel, svgTitle, ...props }) => (
    <div
      data-testid="lds-loading-spinner"
      className={className}
      aria-label={ariaLabel}
      title={svgTitle}
      {...props}
    >
      Loading Spinner Mock
    </div>
  )),
}))

// Mock the CSS module
vi.mock('./LoadingSpinner.module.scss', () => ({
  default: {
    loadingContainer: 'loadingContainer-mock',
    loadingWrapper: 'loadingWrapper-mock',
  },
}))

describe('LoadingSpinner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<LoadingSpinner />)

      expect(screen.getByTestId('lds-loading-spinner')).toBeInTheDocument()
    })

    it('should render with correct structure', () => {
      render(<LoadingSpinner />)

      const mainElement = screen.getByRole('main')
      expect(mainElement).toBeInTheDocument()
      expect(mainElement).toHaveClass('loadingContainer-mock')

      const wrapperDiv = mainElement.firstChild as HTMLElement
      expect(wrapperDiv).toHaveClass('loadingWrapper-mock')

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should render LdsLoadingSpinner component', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('should use default message when no message prop is provided', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', 'Loading form data')
      expect(spinner).toHaveAttribute('title', 'Loading form data')
    })

    it('should use custom message when message prop is provided', () => {
      const customMessage = 'Loading user data'
      render(<LoadingSpinner message={customMessage} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', customMessage)
      expect(spinner).toHaveAttribute('title', customMessage)
    })

    it('should handle empty string message', () => {
      render(<LoadingSpinner message="" />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', '')
      expect(spinner).toHaveAttribute('title', '')
    })

    it('should handle undefined message prop', () => {
      render(<LoadingSpinner message={undefined} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', 'Loading form data')
      expect(spinner).toHaveAttribute('title', 'Loading form data')
    })
  })

  describe('LdsLoadingSpinner Props', () => {
    it('should pass correct className to LdsLoadingSpinner', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveClass('primary')
    })

    it('should pass ariaLabel prop to LdsLoadingSpinner', () => {
      const message = 'Loading content'
      render(<LoadingSpinner message={message} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', message)
    })

    it('should pass svgTitle prop to LdsLoadingSpinner', () => {
      const message = 'Loading content'
      render(<LoadingSpinner message={message} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('title', message)
    })

    it('should ensure ariaLabel and svgTitle have the same value', () => {
      const message = 'Custom loading message'
      render(<LoadingSpinner message={message} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      const ariaLabel = spinner.getAttribute('aria-label')
      const title = spinner.getAttribute('title')

      expect(ariaLabel).toBe(title)
      expect(ariaLabel).toBe(message)
    })
  })

  describe('CSS Classes', () => {
    it('should apply loadingContainer class to main element', () => {
      render(<LoadingSpinner />)

      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('loadingContainer-mock')
    })

    it('should apply loadingWrapper class to wrapper div', () => {
      render(<LoadingSpinner />)

      const mainElement = screen.getByRole('main')
      const wrapperDiv = mainElement.firstChild as HTMLElement
      expect(wrapperDiv).toHaveClass('loadingWrapper-mock')
    })

    it('should maintain CSS class structure integrity', () => {
      render(<LoadingSpinner />)

      const mainElement = screen.getByRole('main')
      const wrapperDiv = mainElement.firstChild as HTMLElement
      const spinner = screen.getByTestId('lds-loading-spinner')

      expect(mainElement.children).toHaveLength(1)
      expect(wrapperDiv.children).toHaveLength(1)
      expect(wrapperDiv.firstChild).toBe(spinner)
    })
  })

  describe('Accessibility', () => {
    it('should have proper main landmark', () => {
      render(<LoadingSpinner />)

      const mainElement = screen.getByRole('main')
      expect(mainElement).toBeInTheDocument()
    })

    it('should provide accessible label for screen readers', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label')
      expect(spinner.getAttribute('aria-label')).toBeTruthy()
    })

    it('should provide title attribute for tooltips', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('title')
      expect(spinner.getAttribute('title')).toBeTruthy()
    })

    it('should have consistent accessibility attributes', () => {
      const message = 'Accessible loading message'
      render(<LoadingSpinner message={message} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', message)
      expect(spinner).toHaveAttribute('title', message)
    })
  })

  describe('Component Interface', () => {
    it('should export LoadingSpinner as named export', () => {
      expect(LoadingSpinner).toBeDefined()
      expect(typeof LoadingSpinner).toBe('function')
    })

    it('should export LoadingSpinner as default export', async () => {
      // Test that the component can be used as default import
      const module = await import('./LoadingSpinner')
      expect(module.default).toBeDefined()
      expect(typeof module.default).toBe('function')
      expect(module.default).toBe(LoadingSpinner)
    })

    it('should be a React functional component', () => {
      expect(LoadingSpinner.prototype).toBeUndefined()
      expect(typeof LoadingSpinner).toBe('function')
    })
  })

  describe('Props Interface', () => {
    it('should accept LoadingSpinnerProps interface', () => {
      // Test different prop combinations
      const validProps = [
        {},
        { message: 'Loading...' },
        { message: '' },
        { message: undefined },
      ]

      validProps.forEach(props => {
        expect(() => render(<LoadingSpinner {...props} />)).not.toThrow()
      })
    })

    it('should handle optional message prop correctly', () => {
      // Without message prop
      const { rerender } = render(<LoadingSpinner />)
      expect(screen.getByTestId('lds-loading-spinner')).toHaveAttribute(
        'aria-label',
        'Loading form data'
      )

      // With message prop
      rerender(<LoadingSpinner message="New message" />)
      expect(screen.getByTestId('lds-loading-spinner')).toHaveAttribute(
        'aria-label',
        'New message'
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000)
      render(<LoadingSpinner message={longMessage} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', longMessage)
      expect(spinner).toHaveAttribute('title', longMessage)
    })

    it('should handle special characters in message', () => {
      const specialMessage = 'Loading... 100% complete! @#$%^&*()'
      render(<LoadingSpinner message={specialMessage} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', specialMessage)
      expect(spinner).toHaveAttribute('title', specialMessage)
    })

    it('should handle unicode characters in message', () => {
      const unicodeMessage = '正在加载数据... 📊 🔄'
      render(<LoadingSpinner message={unicodeMessage} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', unicodeMessage)
      expect(spinner).toHaveAttribute('title', unicodeMessage)
    })

    it('should handle null message gracefully', () => {
      // @ts-expect-error Testing runtime behavior with null
      render(<LoadingSpinner message={null} />)

      const spinner = screen.getByTestId('lds-loading-spinner')
      // null results in no attribute being set
      expect(spinner).not.toHaveAttribute('aria-label')
      expect(spinner).not.toHaveAttribute('title')
    })
  })

  describe('Re-rendering', () => {
    it('should update message when prop changes', () => {
      const { rerender } = render(<LoadingSpinner message="Initial message" />)

      let spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', 'Initial message')

      rerender(<LoadingSpinner message="Updated message" />)

      spinner = screen.getByTestId('lds-loading-spinner')
      expect(spinner).toHaveAttribute('aria-label', 'Updated message')
    })

    it('should maintain component structure on re-render', () => {
      const { rerender } = render(<LoadingSpinner />)

      rerender(<LoadingSpinner message="Different message" />)

      const updatedMainElement = screen.getByRole('main')
      // Structure should be the same, only content should change
      expect(updatedMainElement.children).toHaveLength(1)
      expect(updatedMainElement.firstChild).toHaveClass('loadingWrapper-mock')
    })
  })

  describe('Performance', () => {
    it('should render consistently with same props', () => {
      const message = 'Consistent message'
      const { container: container1 } = render(
        <LoadingSpinner message={message} />
      )
      const { container: container2 } = render(
        <LoadingSpinner message={message} />
      )

      // Both should have the same structure
      expect(container1.innerHTML).toBe(container2.innerHTML)
    })

    it('should handle multiple instances', () => {
      render(
        <div>
          <LoadingSpinner message="First spinner" />
          <LoadingSpinner message="Second spinner" />
          <LoadingSpinner />
        </div>
      )

      const spinners = screen.getAllByTestId('lds-loading-spinner')
      expect(spinners).toHaveLength(3)

      expect(spinners[0]).toHaveAttribute('aria-label', 'First spinner')
      expect(spinners[1]).toHaveAttribute('aria-label', 'Second spinner')
      expect(spinners[2]).toHaveAttribute('aria-label', 'Loading form data')
    })
  })

  describe('Integration', () => {
    it('should work within other components', () => {
      const WrapperComponent = () => (
        <div>
          <h1>My App</h1>
          <LoadingSpinner message="Loading app data" />
        </div>
      )

      render(<WrapperComponent />)

      expect(
        screen.getByRole('heading', { name: 'My App' })
      ).toBeInTheDocument()
      expect(screen.getByTestId('lds-loading-spinner')).toBeInTheDocument()
      expect(screen.getByTestId('lds-loading-spinner')).toHaveAttribute(
        'aria-label',
        'Loading app data'
      )
    })

    it('should maintain independence when used multiple times', () => {
      const MultiSpinnerComponent = () => (
        <div>
          <LoadingSpinner message="Loading users" />
          <LoadingSpinner message="Loading posts" />
        </div>
      )

      render(<MultiSpinnerComponent />)

      const spinners = screen.getAllByTestId('lds-loading-spinner')
      expect(spinners[0]).toHaveAttribute('aria-label', 'Loading users')
      expect(spinners[1]).toHaveAttribute('aria-label', 'Loading posts')
    })
  })
})
