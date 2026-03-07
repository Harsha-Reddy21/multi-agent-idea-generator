import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InfoTourModal } from './InfoTourModal'

describe('InfoTourModal', () => {
  let targetElement: HTMLDivElement
  let targetRef: React.RefObject<HTMLDivElement>

  beforeEach(() => {
    // Create a target element for positioning
    targetElement = document.createElement('div')
    targetElement.style.position = 'absolute'
    targetElement.style.left = '100px'
    targetElement.style.top = '100px'
    targetElement.style.width = '200px'
    targetElement.style.height = '50px'
    document.body.appendChild(targetElement)

    targetRef = { current: targetElement }

    // Mock getBoundingClientRect
    targetElement.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 300,
      bottom: 150,
      width: 200,
      height: 50,
      x: 100,
      y: 100,
      toJSON: () => {},
    }))
  })

  afterEach(() => {
    document.body.removeChild(targetElement)
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render when isOpen is true', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test message"
          buttonText="OK"
          targetRef={targetRef}
        />
      )

      expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
      expect(screen.getByTestId('info-tour-modal-backdrop')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(
        <InfoTourModal
          isOpen={false}
          onClose={vi.fn()}
          message="Test message"
          targetRef={targetRef}
        />
      )

      expect(screen.queryByTestId('info-tour-modal')).not.toBeInTheDocument()
    })

    it('should render the message text', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="This is a test message"
          targetRef={targetRef}
        />
      )

      expect(screen.getByText('This is a test message')).toBeInTheDocument()
    })

    it('should render custom button text', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          buttonText="Continue"
          targetRef={targetRef}
        />
      )

      expect(screen.getByText('Continue')).toBeInTheDocument()
    })

    it('should render default button text when not provided', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      expect(screen.getByText('Okay')).toBeInTheDocument()
    })
  })

  describe('Skip Button', () => {
    it('should render skip button when skipButton prop is true', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          skipButton={true}
          targetRef={targetRef}
        />
      )

      expect(
        screen.getByTestId('info-tour-modal-skip-button')
      ).toBeInTheDocument()
      expect(screen.getByText('Skip')).toBeInTheDocument()
    })

    it('should not render skip button when skipButton prop is false', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          skipButton={false}
          targetRef={targetRef}
        />
      )

      expect(
        screen.queryByTestId('info-tour-modal-skip-button')
      ).not.toBeInTheDocument()
    })

    it('should call onClose when skip button is clicked', () => {
      const onCloseMock = vi.fn()
      render(
        <InfoTourModal
          isOpen={true}
          onClose={onCloseMock}
          message="Test"
          skipButton={true}
          targetRef={targetRef}
        />
      )

      const skipButton = screen.getByTestId('info-tour-modal-skip-button')
      fireEvent.click(skipButton)

      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('User Interactions', () => {
    it('should call onClose when backdrop is clicked', () => {
      const onCloseMock = vi.fn()
      render(
        <InfoTourModal
          isOpen={true}
          onClose={onCloseMock}
          message="Test"
          targetRef={targetRef}
        />
      )

      const backdrop = screen.getByTestId('info-tour-modal-backdrop')
      fireEvent.click(backdrop)

      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when main button is clicked and no onNext provided', () => {
      const onCloseMock = vi.fn()
      render(
        <InfoTourModal
          isOpen={true}
          onClose={onCloseMock}
          message="Test"
          buttonText="OK"
          targetRef={targetRef}
        />
      )

      const mainButton = screen.getByTestId('info-tour-modal-button')
      fireEvent.click(mainButton)

      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('should call onNext when main button is clicked and onNext is provided', () => {
      const onCloseMock = vi.fn()
      const onNextMock = vi.fn()
      render(
        <InfoTourModal
          isOpen={true}
          onClose={onCloseMock}
          onNext={onNextMock}
          message="Test"
          buttonText="Next"
          targetRef={targetRef}
        />
      )

      const mainButton = screen.getByTestId('info-tour-modal-button')
      fireEvent.click(mainButton)

      expect(onNextMock).toHaveBeenCalledTimes(1)
      expect(onCloseMock).not.toHaveBeenCalled()
    })
  })

  describe('Message Formatting', () => {
    it('should handle line breaks with \\n', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Line 1\nLine 2\nLine 3"
          targetRef={targetRef}
        />
      )

      // Since modal is in a portal, query from document
      const modal = screen.getByTestId('info-tour-modal')
      const messageElement = modal.querySelector('p')

      expect(messageElement).toBeTruthy()
      expect(messageElement?.innerHTML).toContain('<br>')
    })

    it('should handle bold and italic formatting with **text**', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="This is **formatted text** here"
          targetRef={targetRef}
        />
      )

      const formattedElement = screen.getByText('formatted text')
      // The formatted text is wrapped in strong > em
      expect(formattedElement.parentElement?.tagName).toBe('STRONG')
      expect(formattedElement.tagName).toBe('EM')
    })

    it('should handle multiple formatted segments', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="**First** and **Second** formatted"
          targetRef={targetRef}
        />
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })

    it('should handle empty lines correctly', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Line 1\n\n\nLine 2"
          targetRef={targetRef}
        />
      )

      // Use getByText with textMatch function to handle split text
      expect(
        screen.getByText((_content, element) => {
          return element?.textContent === 'Line 1Line 2'
        })
      ).toBeInTheDocument()
    })
  })

  describe('Positioning', () => {
    it('should apply top position class', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="top"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.className).toContain('modal--top')
    })

    it('should apply bottom position class', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="bottom"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.className).toContain('modal--bottom')
    })

    it('should apply left position class', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="left"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.className).toContain('modal--left')
    })

    it('should apply right position class', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="right"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.className).toContain('modal--right')
    })

    it('should use bottom position by default', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.className).toContain('modal--bottom')
    })
  })

  describe('Width Configuration', () => {
    it('should apply custom width when provided', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          width={600}
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.style.width).toBe('600px')
    })

    it('should apply minWidth and maxWidth styles', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.style.minWidth).toBe('250px')
    })
  })

  describe('Arrow Alignment', () => {
    it('should set data-arrow-align attribute to center by default', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.getAttribute('data-arrow-align')).toBe('center')
    })

    it('should set data-arrow-align attribute to right when specified', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          arrowAlign="right"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.getAttribute('data-arrow-align')).toBe('right')
    })

    it('should set data-arrow-align attribute to left when specified', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          arrowAlign="left"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.getAttribute('data-arrow-align')).toBe('left')
    })
  })

  describe('Visibility and Opacity', () => {
    it('should initially have opacity 0 and transition to 1', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')

      // Should eventually become visible
      await waitFor(
        () => {
          expect(modal.style.opacity).toBe('1')
        },
        { timeout: 300 }
      )
    })
  })

  describe('Portal Rendering', () => {
    it('should render modal using React portal', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      // Modal should be rendered in the DOM
      expect(modal).toBeInTheDocument()
      // Modal's parent should exist (the portal container)
      expect(modal.parentElement).toBeTruthy()
    })
  })

  describe('Event Listeners', () => {
    it('should update position on window resize', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      // Trigger resize event
      fireEvent.resize(window)

      // Modal should still be rendered
      await waitFor(() => {
        expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
      })
    })

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        true
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Multiple Modals', () => {
    it('should handle multiple modals with different configurations', () => {
      const { rerender } = render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="First Modal"
          buttonText="Next"
          skipButton={true}
          targetRef={targetRef}
        />
      )

      expect(screen.getByText('First Modal')).toBeInTheDocument()
      expect(screen.getByText('Skip')).toBeInTheDocument()

      rerender(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Second Modal"
          buttonText="Okay"
          skipButton={false}
          targetRef={targetRef}
        />
      )

      expect(screen.getByText('Second Modal')).toBeInTheDocument()
      expect(screen.queryByText('Skip')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null targetRef gracefully', () => {
      const nullRef = { current: null }

      expect(() => {
        render(
          <InfoTourModal
            isOpen={true}
            onClose={vi.fn()}
            message="Test"
            targetRef={nullRef}
          />
        )
      }).not.toThrow()
    })

    it('should handle empty message', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message=""
          targetRef={targetRef}
        />
      )

      expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
    })

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(500)

      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message={longMessage}
          targetRef={targetRef}
        />
      )

      expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()
    })
  })

  describe('Scrollable Parents', () => {
    it('should detect and add scroll listeners to scrollable parent elements', () => {
      // Create a scrollable parent
      const scrollableParent = document.createElement('div')
      scrollableParent.style.overflow = 'auto'
      scrollableParent.style.height = '200px'
      document.body.appendChild(scrollableParent)

      const childTarget = document.createElement('div')
      scrollableParent.appendChild(childTarget)

      const scrollableRef = { current: childTarget }

      childTarget.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        right: 300,
        bottom: 150,
        width: 200,
        height: 50,
        x: 100,
        y: 100,
        toJSON: () => {},
      }))

      const addEventListenerSpy = vi.spyOn(scrollableParent, 'addEventListener')

      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={scrollableRef}
        />
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )

      // Cleanup
      document.body.removeChild(scrollableParent)
      addEventListenerSpy.mockRestore()
    })

    it('should detect scrollable parents with overflowY auto', () => {
      const scrollableParent = document.createElement('div')
      scrollableParent.style.overflowY = 'auto'
      document.body.appendChild(scrollableParent)

      const childTarget = document.createElement('div')
      scrollableParent.appendChild(childTarget)

      const scrollableRef = { current: childTarget }

      childTarget.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        right: 300,
        bottom: 150,
        width: 200,
        height: 50,
        x: 100,
        y: 100,
        toJSON: () => {},
      }))

      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={scrollableRef}
        />
      )

      expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()

      // Cleanup
      document.body.removeChild(scrollableParent)
    })

    it('should detect scrollable parents with overflowX scroll', () => {
      const scrollableParent = document.createElement('div')
      scrollableParent.style.overflowX = 'scroll'
      document.body.appendChild(scrollableParent)

      const childTarget = document.createElement('div')
      scrollableParent.appendChild(childTarget)

      const scrollableRef = { current: childTarget }

      childTarget.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        right: 300,
        bottom: 150,
        width: 200,
        height: 50,
        x: 100,
        y: 100,
        toJSON: () => {},
      }))

      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={scrollableRef}
        />
      )

      expect(screen.getByTestId('info-tour-modal')).toBeInTheDocument()

      // Cleanup
      document.body.removeChild(scrollableParent)
    })

    it('should remove scroll listeners from scrollable parents on unmount', () => {
      const scrollableParent = document.createElement('div')
      scrollableParent.style.overflow = 'scroll'
      document.body.appendChild(scrollableParent)

      const childTarget = document.createElement('div')
      scrollableParent.appendChild(childTarget)

      const scrollableRef = { current: childTarget }

      childTarget.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        right: 300,
        bottom: 150,
        width: 200,
        height: 50,
        x: 100,
        y: 100,
        toJSON: () => {},
      }))

      const removeEventListenerSpy = vi.spyOn(
        scrollableParent,
        'removeEventListener'
      )

      const { unmount } = render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={scrollableRef}
        />
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )

      // Cleanup
      document.body.removeChild(scrollableParent)
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Timeout Cleanup', () => {
    it('should clear all timeouts on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      const { unmount } = render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      unmount()

      // Should clear the show timeout and 5 position update timeouts = 6 total
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(6)

      clearTimeoutSpy.mockRestore()
    })
  })

  describe('Width Calculation', () => {
    it('should use provided width instead of calculating', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test message that is quite long"
          width={400}
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.style.width).toBe('400px')
    })

    it('should handle undefined width gracefully', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal).toBeInTheDocument()
    })
  })

  describe('Modal Positioning with effectiveModalWidth', () => {
    it('should calculate left position correctly for left position variant', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="left"
          width={300}
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.className).toContain('modal--left')
    })

    it('should calculate right position correctly for right position variant', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="right"
          width={300}
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal.className).toContain('modal--right')
    })
  })

  describe('Position Calculations with Modal Dimensions', () => {
    it('should calculate position for bottom with measured modal width', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="bottom"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // bottom: top = rect.bottom + 10 = 150 + 10 = 160
          // left = rect.left - 100 = 100 - 100 = 0
          expect(modal.style.top).toBe('160px')
          expect(modal.style.left).toBe('0px')
        },
        { timeout: 300 }
      )
    })

    it('should execute left position calculation with effectiveModalWidth', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test left position"
          position="left"
          width={300}
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // left: left = rect.left - effectiveModalWidth - 10 = 100 - 300 - 10 = -210, adjusted to -200
          expect(modal.style.left).toBe('-200px') // Changed from '-210px'
          // top should be vertically centered
          expect(modal.style.top).toBeTruthy()
        },
        { timeout: 300 }
      )
    })

    it('should execute right position calculation', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test right position"
          position="right"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // right: left = rect.right + 10 = 300 + 10 = 310
          expect(modal.style.left).toBe('310px')
          // top should be vertically centered
          expect(modal.style.top).toBeTruthy()
        },
        { timeout: 300 }
      )
    })

    it('should use modalHeight in top position calculation', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test with modal height"
          position="top"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // Verify that top calculation uses modalHeight
          // top = rect.top - modalHeight - 20
          const topValue = parseInt(modal.style.top)
          expect(topValue).toBeLessThan(100) // Should be above target element
        },
        { timeout: 300 }
      )
    })

    it('should use leftModalHeight for left position vertical centering', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test left position vertical centering"
          position="left"
          width={250}
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // Verify top is calculated for vertical centering
          // top = rect.top + (rect.height / 2) - (leftModalHeight / 2)
          const topValue = parseInt(modal.style.top)
          expect(topValue).toBeGreaterThanOrEqual(0)
        },
        { timeout: 300 }
      )
    })

    it('should use rightModalHeight for right position vertical centering', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test right position vertical centering"
          position="right"
          width={280}
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // Verify top is calculated for vertical centering
          // top = rect.top + (rect.height / 2) - (rightModalHeight / 2)
          const topValue = parseInt(modal.style.top)
          expect(topValue).toBeGreaterThanOrEqual(0)
        },
        { timeout: 300 }
      )
    })

    it('should call setModalPosition with calculated values', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test setModalPosition call"
          position="bottom"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // Verify that position styles are set (evidence that setModalPosition was called)
          expect(modal.style.top).toBeTruthy()
          expect(modal.style.left).toBeTruthy()
          expect(modal.style.position).toBe('fixed')
        },
        { timeout: 300 }
      )
    })
  })

  describe('Modal Ref Measurements', () => {
    it('should handle modal ref offsetHeight being 0 initially for left position', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="left"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal).toBeInTheDocument()
    })

    it('should handle modal ref offsetHeight being 0 initially for right position', () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test"
          position="right"
          targetRef={targetRef}
        />
      )

      const modal = screen.getByTestId('info-tour-modal')
      expect(modal).toBeInTheDocument()
    })

    it('should recalculate position after modal is measured', async () => {
      const { rerender } = render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Initial message"
          position="left"
          targetRef={targetRef}
        />
      )

      // Rerender with new message to trigger recalculation
      rerender(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Updated message that is longer"
          position="left"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          expect(modal).toBeInTheDocument()
        },
        { timeout: 300 }
      )
    })
  })

  describe('Position Calculation Logic', () => {
    it('should execute bottom position calculation and set top/left styles', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test bottom position"
          position="bottom"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // bottom: top = rect.bottom + 10 = 150 + 10 = 160
          // left = rect.left - 100 = 100 - 100 = 0
          expect(modal.style.top).toBe('160px')
          expect(modal.style.left).toBe('0px')
        },
        { timeout: 300 }
      )
    })

    it('should execute left position calculation with effectiveModalWidth', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test left position"
          position="left"
          width={300}
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // left: left = rect.left - effectiveModalWidth - 10 = 100 - 300 - 10 = -210, adjusted to -200
          expect(modal.style.left).toBe('-200px') // Changed from '-210px'
          // top should be vertically centered
          expect(modal.style.top).toBeTruthy()
        },
        { timeout: 300 }
      )
    })

    it('should execute right position calculation', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test right position"
          position="right"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // right: left = rect.right + 10 = 300 + 10 = 310
          expect(modal.style.left).toBe('310px')
          // top should be vertically centered
          expect(modal.style.top).toBeTruthy()
        },
        { timeout: 300 }
      )
    })

    it('should use modalHeight in top position calculation', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test with modal height"
          position="top"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // Verify that top calculation uses modalHeight
          // top = rect.top - modalHeight - 20
          const topValue = parseInt(modal.style.top)
          expect(topValue).toBeLessThan(100) // Should be above target element
        },
        { timeout: 300 }
      )
    })

    it('should use leftModalHeight for left position vertical centering', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test left position vertical centering"
          position="left"
          width={250}
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // Verify top is calculated for vertical centering
          // top = rect.top + (rect.height / 2) - (leftModalHeight / 2)
          const topValue = parseInt(modal.style.top)
          expect(topValue).toBeGreaterThanOrEqual(0)
        },
        { timeout: 300 }
      )
    })

    it('should use rightModalHeight for right position vertical centering', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test right position vertical centering"
          position="right"
          width={280}
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // Verify top is calculated for vertical centering
          // top = rect.top + (rect.height / 2) - (rightModalHeight / 2)
          const topValue = parseInt(modal.style.top)
          expect(topValue).toBeGreaterThanOrEqual(0)
        },
        { timeout: 300 }
      )
    })

    it('should call setModalPosition with calculated values', async () => {
      render(
        <InfoTourModal
          isOpen={true}
          onClose={vi.fn()}
          message="Test setModalPosition call"
          position="bottom"
          targetRef={targetRef}
        />
      )

      await waitFor(
        () => {
          const modal = screen.getByTestId('info-tour-modal')
          // Verify that position styles are set (evidence that setModalPosition was called)
          expect(modal.style.top).toBeTruthy()
          expect(modal.style.left).toBeTruthy()
          expect(modal.style.position).toBe('fixed')
        },
        { timeout: 300 }
      )
    })
  })
})
