import { LdsButton } from '@elilillyco/ux-lds-react'
import React from 'react'
import { createPortal } from 'react-dom'

import { InfoTourModalProps } from './info-tour-modal.model'
import styles from './InfoTourModal.module.scss'

/**
 * InfoTourModal - A generic reusable modal component for displaying
 * informational messages with a backdrop and dismissal button.
 *
 * Features:
 * - Always visible when isOpen is true (not hover-based)
 * - Backdrop with click-to-close functionality
 * - Customizable message and button text
 * - Uses React Portal to render at document root (avoids z-index/overflow issues)
 * - Can be positioned relative to a target element
 * - Supports line breaks with \n in message text
 */
export const InfoTourModal: React.FC<InfoTourModalProps> = ({
  isOpen,
  onClose,
  onNext,
  message,
  buttonText = 'Okay',
  width,
  position = 'bottom',
  targetRef,
  skipButton = false,
  arrowAlign = 'center',
  // leftMargin = 0,
}) => {
  const [modalPosition, setModalPosition] = React.useState<{
    top: number
    left: number
  } | null>(null)
  const [isPositioned, setIsPositioned] = React.useState(false)
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Calculate width based on message length if not provided
  const calculateWidth = () => {
    if (width) return width

    // Use auto width - let content determine the width
    return undefined
  }

  const modalWidth = calculateWidth()

  React.useEffect(() => {
    if (isOpen && targetRef?.current) {
      setIsPositioned(false) // Reset positioning flag

      const updatePosition = () => {
        const rect = targetRef.current!.getBoundingClientRect()
        const modalHeight = modalRef.current?.offsetHeight || 0
        const modalWidthMeasured = modalRef.current?.offsetWidth || 0

        // Use the width prop for initial calculation if modal not yet measured
        const effectiveModalWidth = modalWidthMeasured || width || 0

        let top = 0
        let left = 0

        switch (position) {
          case 'bottom':
            top = rect.bottom + 10
            left = rect.left - 100
            break
          case 'top':
            top = rect.top - modalHeight - 20
            // Align modal to the left edge of the target element, with leftMargin offset
            left = rect.left - 150

            // Prevent modal from going off the right edge of the screen
            const rightEdge = left + effectiveModalWidth
            const viewportWidth = window.innerWidth
            if (rightEdge > viewportWidth - 20) {
              // 20px padding from edge
              left = viewportWidth - effectiveModalWidth - 20
            }

            // Prevent modal from going off the left edge of the screen
            if (left < 20) {
              // 20px padding from edge
              left = 20
            }
            break
          case 'left':
            const leftModalHeight = modalRef.current?.offsetHeight || 0
            top = rect.top + rect.height / 2 - leftModalHeight / 2
            left = rect.left - effectiveModalWidth
            break
          case 'right':
            const rightModalHeight = modalRef.current?.offsetHeight || 0
            top = rect.top + rect.height / 2 - rightModalHeight / 2
            left = rect.right + 10
            break
        }

        setModalPosition({ top, left })
      }

      // Wait longer before showing the modal to avoid flashing
      const showTimeout = setTimeout(() => {
        setIsPositioned(true)
      }, 200)

      // Initial position calculation with multiple retries
      const timeouts: NodeJS.Timeout[] = []
      timeouts.push(setTimeout(updatePosition, 10))
      timeouts.push(setTimeout(updatePosition, 50))
      timeouts.push(setTimeout(updatePosition, 100))
      timeouts.push(setTimeout(updatePosition, 150))
      timeouts.push(setTimeout(updatePosition, 200))

      // Find all scrollable parent elements
      const scrollableParents: HTMLElement[] = []
      let element = targetRef.current.parentElement
      while (element) {
        const overflow = window.getComputedStyle(element).overflow
        const overflowY = window.getComputedStyle(element).overflowY
        const overflowX = window.getComputedStyle(element).overflowX

        if (
          overflow === 'auto' ||
          overflow === 'scroll' ||
          overflowY === 'auto' ||
          overflowY === 'scroll' ||
          overflowX === 'auto' ||
          overflowX === 'scroll'
        ) {
          scrollableParents.push(element)
        }
        element = element.parentElement
      }

      // Add scroll listeners to all scrollable parents
      scrollableParents.forEach(parent => {
        parent.addEventListener('scroll', updatePosition)
      })

      // Also listen to window scroll and resize
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        clearTimeout(showTimeout)
        timeouts.forEach(timeout => clearTimeout(timeout))
        scrollableParents.forEach(parent => {
          parent.removeEventListener('scroll', updatePosition)
        })
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, targetRef, position, modalWidth, width])

  if (!isOpen) return null

  const handleMainButtonClick = () => {
    if (onNext) {
      onNext()
    } else {
      onClose()
    }
  }

  // Split message by \n, trim each line, and render with line breaks
  const renderMessage = () => {
    const normalizedMessage = message.replace(/\\n/g, '\n')
    return normalizedMessage
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index, array) => (
        <React.Fragment key={index}>
          {line.split(/(\*\*.*?\*\*)/).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const text = part.slice(2, -2)
              return (
                <strong key={i}>
                  <em>{text}</em>
                </strong>
              )
            }
            return part
          })}
          {index < array.length - 1 && <br />}
        </React.Fragment>
      ))
  }

  const modalContent = (
    <>
      {/* Backdrop to close modal on outside click */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        data-testid="info-tour-modal-backdrop"
      />
      <div
        ref={modalRef}
        className={`${styles.modal} ${styles[`modal--${position}`]}`}
        data-arrow-align={arrowAlign}
        style={{
          ...(modalWidth && { width: `${modalWidth}px` }),
          minWidth: '250px',
          maxWidth: modalWidth ? `${modalWidth}px` : '600px',
          whiteSpace: 'pre-wrap',
          position: 'fixed',
          opacity: isPositioned ? 1 : 0,
          transition: 'opacity 0.1s ease-in',
          ...(modalPosition && {
            top: `${modalPosition.top}px`,
            left: `${modalPosition.left}px`,
          }),
        }}
        data-testid="info-tour-modal"
      >
        <p className={styles.message}>{renderMessage()}</p>
        {skipButton && (
          <LdsButton
            onClick={onClose}
            className={styles.skipButton}
            data-testid="info-tour-modal-skip-button"
            type="button"
          >
            Skip
          </LdsButton>
        )}
        <LdsButton
          onClick={handleMainButtonClick}
          className={styles.nextButton}
          data-testid="info-tour-modal-button"
        >
          {buttonText}
        </LdsButton>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}

export default InfoTourModal
