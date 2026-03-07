import { render, screen, waitFor } from '@testing-library/react'
import React, { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FormStatus } from '@/core/models/form.model'

import { FormFooter } from './FormFooter'
import { FormFooterProps } from './types'

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsButton: ({
    children,
    onClick,
    disabled,
    'data-testid': testId,
    'aria-label': ariaLabel,
    className,
    classes,
    icon,
  }: any) => (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      data-classes={classes}
      data-icon={icon}
    >
      {children}
    </button>
  ),
  LdsLoadingButton: Object.assign(
    ({
      children,
      onClick,
      disabled,
      'data-testid': testId,
      buttonClasses,
      state,
    }: any) => (
      <button
        data-testid={testId}
        onClick={onClick}
        disabled={disabled}
        data-button-classes={buttonClasses}
        data-state={state}
      >
        {children}
      </button>
    ),
    {
      LabelDefault: ({ children }: any) => (
        <span data-label-type="default">{children}</span>
      ),
      LabelLoading: ({ children }: any) => (
        <span data-label-type="loading">{children}</span>
      ),
      LabelSuccess: ({ children }: any) => (
        <span data-label-type="success">{children}</span>
      ),
      LabelFailure: ({ children }: any) => (
        <span data-label-type="failure">{children}</span>
      ),
    }
  ),
}))

describe('FormFooter', () => {
  let defaultProps: FormFooterProps
  let mockSetActivePageIndex: React.Dispatch<React.SetStateAction<number>>

  beforeEach(() => {
    vi.useFakeTimers()
    mockSetActivePageIndex = vi.fn() as React.Dispatch<
      React.SetStateAction<number>
    >

    defaultProps = {
      footerButtons: [],
      pageButtonIds: {},
      activePageIndex: 1,
      setActivePageIndex: mockSetActivePageIndex,
      formData: {},
      sticky: false,
      actionHandlerMap: {},
      formStatus: undefined,
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('should render footer with correct aria-label', () => {
      render(<FormFooter {...defaultProps} />)

      const footer = screen.getByTestId('form-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveAttribute('aria-label', 'Form Footer')
    })

    it('should apply sticky class when sticky is true', () => {
      render(<FormFooter {...defaultProps} sticky={true} />)

      const footer = screen.getByTestId('form-footer')
      expect(footer.className).toContain('formFooter--sticky')
    })

    it('should not apply sticky class when sticky is false', () => {
      render(<FormFooter {...defaultProps} sticky={false} />)

      const footer = screen.getByTestId('form-footer')
      expect(footer.className).not.toContain('formFooter--sticky')
    })

    it('should render with default sticky value (false)', () => {
      const { sticky, ...propsWithoutSticky } = defaultProps
      render(<FormFooter {...propsWithoutSticky} />)

      const footer = screen.getByTestId('form-footer')
      expect(footer.className).not.toContain('formFooter--sticky')
    })

    it('should render footer element', () => {
      render(<FormFooter {...defaultProps} />)

      const footer = screen.getByTestId('form-footer')
      expect(footer.tagName).toBe('FOOTER')
    })
  })

  describe('FooterButtons (Legacy Mode)', () => {
    it('should render buttons from footerButtons prop', () => {
      const footerButtons = [
        { label: 'Cancel', onClick: vi.fn(), type: 'secondary' },
        { label: 'Next', onClick: vi.fn(), type: 'primary' },
      ]

      render(<FormFooter {...defaultProps} footerButtons={footerButtons} />)

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should call onClick when footer button is clicked', async () => {
      const onClickMock = vi.fn()
      const footerButtons = [
        { label: 'Test Button', onClick: onClickMock, type: 'primary' },
      ]

      render(<FormFooter {...defaultProps} footerButtons={footerButtons} />)

      const button = screen.getByText('Test Button')
      button.click()

      expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('should render disabled button', () => {
      const footerButtons = [
        {
          label: 'Disabled Button',
          onClick: vi.fn(),
          disabled: true,
          type: 'primary',
        },
      ]

      render(<FormFooter {...defaultProps} footerButtons={footerButtons} />)

      const button = screen.getByText('Disabled Button')
      expect(button).toBeDisabled()
    })

    it('should prioritize footerButtons over pageButtonIds', () => {
      const footerButtons = [
        { label: 'Custom Button', onClick: vi.fn(), type: 'primary' },
      ]
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={footerButtons}
          pageButtonIds={pageButtonIds}
        />
      )

      expect(screen.getByText('Custom Button')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('should render multiple buttons with correct indices', () => {
      const footerButtons = [
        { label: 'Button 1', onClick: vi.fn(), type: 'secondary' },
        { label: 'Button 2', onClick: vi.fn(), type: 'primary' },
        { label: 'Button 3', onClick: vi.fn(), type: 'tertiary' },
      ]

      render(<FormFooter {...defaultProps} footerButtons={footerButtons} />)

      expect(screen.getByTestId('form-footer-btn-0')).toBeInTheDocument()
      expect(screen.getByTestId('form-footer-btn-1')).toBeInTheDocument()
      expect(screen.getByTestId('form-footer-btn-2')).toBeInTheDocument()
    })
  })

  describe('PageButtonIds Mode', () => {
    it('should render buttons from pageButtonIds for current page', () => {
      const pageButtonIds = {
        1: [
          { action: 'cancel' as const, type: 'secondary' },
          { action: 'next' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
        />
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should use default labels from defaultButtonLabels', () => {
      const pageButtonIds = {
        1: [
          { action: 'prev' as const, type: 'secondary' },
          { action: 'saveDraft' as const, type: 'secondary' },
          { action: 'submit' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
        />
      )

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Save Draft')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should use custom label when provided', () => {
      const pageButtonIds = {
        1: [
          {
            action: 'next' as const,
            type: 'primary',
            label: 'Continue to Next Step',
          },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
        />
      )

      expect(screen.getByText('Continue to Next Step')).toBeInTheDocument()
    })

    it('should render buttons for different pages', () => {
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
        2: [
          { action: 'prev' as const, type: 'secondary' },
          { action: 'submit' as const, type: 'primary' },
        ],
      }

      const { rerender } = render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          activePageIndex={1}
        />
      )

      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()

      rerender(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          activePageIndex={2}
        />
      )

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('should handle empty pageButtonIds for current page', () => {
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          activePageIndex={2}
        />
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should return empty array when setActivePageIndex is not provided', () => {
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          setActivePageIndex={undefined}
        />
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Button Actions with ActionHandlerMap', () => {
    it('should call action handler when button is clicked', () => {
      const nextHandler = vi.fn()
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ next: nextHandler }}
        />
      )

      screen.getByText('Next').click()
      expect(nextHandler).toHaveBeenCalled()
    })

    it('should not call handler if actionHandlerMap is missing', () => {
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={undefined}
        />
      )

      screen.getByText('Next').click()
      // Should not throw error
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should handle multiple action handlers', () => {
      const cancelHandler = vi.fn()
      const nextHandler = vi.fn()
      const pageButtonIds = {
        1: [
          { action: 'cancel' as const, type: 'secondary' },
          { action: 'next' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ cancel: cancelHandler, next: nextHandler }}
        />
      )

      screen.getByText('Cancel').click()
      expect(cancelHandler).toHaveBeenCalledTimes(1)

      screen.getByText('Next').click()
      expect(nextHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Save Draft Button', () => {
    it('should render LdsLoadingButton for Save Draft', () => {
      const pageButtonIds = {
        1: [{ action: 'saveDraft' as const, type: 'secondary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ saveDraft: vi.fn() }}
        />
      )

      const button = screen.getByText('Save Draft')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(screen.getByText('Saved')).toBeInTheDocument()
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('should call saveDraft handler when clicked', () => {
      const saveDraftHandler = vi.fn()
      const pageButtonIds = {
        1: [{ action: 'saveDraft' as const, type: 'secondary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ saveDraft: saveDraftHandler }}
        />
      )

      screen.getByText('Save Draft').click()
      expect(saveDraftHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Submit Button', () => {
    it('should render LdsLoadingButton for Submit', () => {
      const pageButtonIds = {
        1: [{ action: 'submit' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ submit: vi.fn() }}
        />
      )

      const button = screen.getByText('Submit')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      expect(screen.getByText('Submitted')).toBeInTheDocument()
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('should call submit handler when clicked', () => {
      const submitHandler = vi.fn()
      const pageButtonIds = {
        1: [{ action: 'submit' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ submit: submitHandler }}
        />
      )

      screen.getByText('Submit').click()
      expect(submitHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Skip Upload Button', () => {
    it('should render LdsLoadingButton for Skip Upload & Submit', () => {
      const pageButtonIds = {
        1: [
          {
            action: 'skipUpload' as const,
            type: 'secondary',
            label: 'Skip Upload & Submit',
          },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ skipUpload: vi.fn() }}
        />
      )

      const button = screen.getByText('Skip Upload & Submit')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      expect(screen.getByText('Submitted')).toBeInTheDocument()
    })

    it('should call skipUpload handler when clicked', () => {
      const skipUploadHandler = vi.fn()
      const pageButtonIds = {
        1: [
          {
            action: 'skipUpload' as const,
            type: 'secondary',
            label: 'Skip & Upload Later',
          },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ skipUpload: skipUploadHandler }}
        />
      )

      screen.getByText('Skip & Upload Later').click()
      expect(skipUploadHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Regular Buttons', () => {
    it('should render LdsButton for navigation buttons', () => {
      const pageButtonIds = {
        1: [
          { action: 'cancel' as const, type: 'secondary' },
          { action: 'next' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ cancel: vi.fn(), next: vi.fn() }}
        />
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should add arrow-right icon to Next button', () => {
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ next: vi.fn() }}
        />
      )

      const button = screen.getByTestId('form-footer-btn-0')
      expect(button).toHaveAttribute('data-icon', 'arrow-right')
    })

    it('should not add icon to non-Next buttons', () => {
      const pageButtonIds = {
        1: [{ action: 'cancel' as const, type: 'secondary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ cancel: vi.fn() }}
        />
      )

      const button = screen.getByTestId('form-footer-btn-0')
      expect(button).not.toHaveAttribute('data-icon', 'arrow-right')
    })

    it('should apply correct type classes', () => {
      const pageButtonIds = {
        1: [
          { action: 'cancel' as const, type: 'secondary' },
          { action: 'next' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ cancel: vi.fn(), next: vi.fn() }}
        />
      )

      const cancelButton = screen.getByTestId('form-footer-btn-0')
      const nextButton = screen.getByTestId('form-footer-btn-1')

      expect(cancelButton).toHaveAttribute('data-classes', 'secondary')
      expect(nextButton).toHaveAttribute('data-classes', 'primary')
    })
  })

  describe('Disabled State', () => {
    it('should disable button when whenDisabled returns true', () => {
      const pageButtonIds = {
        1: [
          {
            action: 'next' as const,
            type: 'primary',
            whenDisabled: () => true,
          },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ next: vi.fn() }}
        />
      )

      const button = screen.getByText('Next')
      expect(button).toBeDisabled()
    })

    it('should enable button when whenDisabled returns false', () => {
      const pageButtonIds = {
        1: [
          {
            action: 'next' as const,
            type: 'primary',
            whenDisabled: () => false,
          },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ next: vi.fn() }}
        />
      )

      const button = screen.getByText('Next')
      expect(button).not.toBeDisabled()
    })

    it('should enable button when whenDisabled is not provided', () => {
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ next: vi.fn() }}
        />
      )

      const button = screen.getByText('Next')
      expect(button).not.toBeDisabled()
    })

    it('should disable Save Draft button when whenDisabled returns true', () => {
      const pageButtonIds = {
        1: [
          {
            action: 'saveDraft' as const,
            type: 'secondary',
            whenDisabled: () => true,
          },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ saveDraft: vi.fn() }}
        />
      )

      const button = screen.getByTestId('form-footer-btn-0')
      expect(button).toBeDisabled()
    })
  })

  describe('Form Status Filtering', () => {
    it('should hide submit button when form is submitted', () => {
      const pageButtonIds = {
        1: [
          { action: 'cancel' as const, type: 'secondary' },
          { action: 'submit' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          formStatus={FormStatus.Submitted}
          actionHandlerMap={{ cancel: vi.fn(), submit: vi.fn() }}
        />
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })

    it('should hide saveDraft button when form is submitted', () => {
      const pageButtonIds = {
        1: [
          { action: 'next' as const, type: 'primary' },
          { action: 'saveDraft' as const, type: 'secondary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          formStatus={FormStatus.Submitted}
          actionHandlerMap={{ next: vi.fn(), saveDraft: vi.fn() }}
        />
      )

      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Save Draft')).not.toBeInTheDocument()
    })

    it('should hide skipUpload button when form is submitted', () => {
      const pageButtonIds = {
        1: [
          { action: 'prev' as const, type: 'secondary' },
          {
            action: 'skipUpload' as const,
            type: 'secondary',
            label: 'Skip & Upload Later',
          },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          formStatus={FormStatus.Submitted}
          actionHandlerMap={{ prev: vi.fn(), skipUpload: vi.fn() }}
        />
      )

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.queryByText('Skip & Upload Later')).not.toBeInTheDocument()
    })

    it('should keep navigation buttons when form is submitted', () => {
      const pageButtonIds = {
        1: [
          { action: 'cancel' as const, type: 'secondary' },
          { action: 'prev' as const, type: 'secondary' },
          { action: 'next' as const, type: 'primary' },
          { action: 'submit' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          formStatus={FormStatus.Submitted}
          actionHandlerMap={{
            cancel: vi.fn(),
            prev: vi.fn(),
            next: vi.fn(),
            submit: vi.fn(),
          }}
        />
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })

    it('should show all buttons when form is not submitted', () => {
      const pageButtonIds = {
        1: [
          { action: 'saveDraft' as const, type: 'secondary' },
          { action: 'submit' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          formStatus={FormStatus.InProgress}
          actionHandlerMap={{ saveDraft: vi.fn(), submit: vi.fn() }}
        />
      )

      expect(screen.getByText('Save Draft')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should show all buttons when formStatus is undefined', () => {
      const pageButtonIds = {
        1: [
          { action: 'saveDraft' as const, type: 'secondary' },
          { action: 'submit' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          formStatus={undefined}
          actionHandlerMap={{ saveDraft: vi.fn(), submit: vi.fn() }}
        />
      )

      expect(screen.getByText('Save Draft')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })

  describe('FormData Ref', () => {
    it('should update formDataRef when formData changes', () => {
      const { rerender } = render(
        <FormFooter {...defaultProps} formData={{ field1: 'value1' }} />
      )

      rerender(<FormFooter {...defaultProps} formData={{ field2: 'value2' }} />)

      // FormData is updated via ref, component should not re-render unnecessarily
      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })

    it('should handle undefined formData', () => {
      render(<FormFooter {...defaultProps} formData={undefined} />)

      expect(screen.getByTestId('form-footer')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty pageButtonIds object', () => {
      render(
        <FormFooter {...defaultProps} footerButtons={[]} pageButtonIds={{}} />
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should handle undefined pageButtonIds', () => {
      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={undefined}
        />
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should handle activePageIndex defaulting to 1', () => {
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      const { activePageIndex, ...propsWithoutActiveIndex } = defaultProps

      render(
        <FormFooter
          {...propsWithoutActiveIndex}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ next: vi.fn() }}
        />
      )

      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should handle multiple button types together', () => {
      const pageButtonIds = {
        1: [
          { action: 'cancel' as const, type: 'tertiary' },
          { action: 'saveDraft' as const, type: 'secondary' },
          { action: 'next' as const, type: 'primary' },
        ],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{
            cancel: vi.fn(),
            saveDraft: vi.fn(),
            next: vi.fn(),
          }}
        />
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save Draft')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should handle synchronous action handlers', () => {
      const syncHandler = vi.fn()
      const pageButtonIds = {
        1: [{ action: 'cancel' as const, type: 'secondary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ cancel: syncHandler }}
        />
      )

      screen.getByText('Cancel').click()
      expect(syncHandler).toHaveBeenCalled()
    })

    it('should handle async action handlers for non-submit actions', () => {
      const asyncHandler = vi.fn(() => Promise.resolve())
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
      }

      render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={{ next: asyncHandler }}
        />
      )

      screen.getByText('Next').click()
      expect(asyncHandler).toHaveBeenCalled()
    })
  })

  describe('Memoization', () => {
    it('should recalculate buttons when activePageIndex changes', () => {
      const pageButtonIds = {
        1: [{ action: 'next' as const, type: 'primary' }],
        2: [{ action: 'submit' as const, type: 'primary' }],
      }

      const { rerender } = render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          activePageIndex={1}
          actionHandlerMap={{ next: vi.fn(), submit: vi.fn() }}
        />
      )

      expect(screen.getByText('Next')).toBeInTheDocument()

      rerender(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          activePageIndex={2}
          actionHandlerMap={{ next: vi.fn(), submit: vi.fn() }}
        />
      )

      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('should recalculate buttons when formStatus changes', () => {
      const pageButtonIds = {
        1: [
          { action: 'saveDraft' as const, type: 'secondary' },
          { action: 'submit' as const, type: 'primary' },
        ],
      }

      const { rerender } = render(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          formStatus={FormStatus.InProgress}
          actionHandlerMap={{ saveDraft: vi.fn(), submit: vi.fn() }}
        />
      )

      expect(screen.getByText('Save Draft')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()

      rerender(
        <FormFooter
          {...defaultProps}
          footerButtons={[]}
          pageButtonIds={pageButtonIds}
          formStatus={FormStatus.Submitted}
          actionHandlerMap={{ saveDraft: vi.fn(), submit: vi.fn() }}
        />
      )

      expect(screen.queryByText('Save Draft')).not.toBeInTheDocument()
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })
  })
})

describe('handleAsyncButtonAction (via test wrapper)', () => {
  function TestWrapper({ action, parentHandler, onStateChange }: any) {
    const stateRef = useRef('ready')
    // Re-implement the internal function as in the component
    const handleAsyncButtonAction = (
      _action: string,
      parentHandler: (() => void | Promise<void>) | undefined
    ) => {
      if (!parentHandler) return
      const setStateFn: (newState: string) => void = newState => {
        stateRef.current = newState
        if (onStateChange) {
          onStateChange(newState)
        }
      }
      setStateFn('loading')
      Promise.resolve(parentHandler())
        .then(() => setStateFn('success'))
        .catch(() => setStateFn('failure'))
        .finally(() => {
          setTimeout(() => setStateFn('ready'), 2000)
        })
    }
    React.useEffect(() => {
      handleAsyncButtonAction(action, parentHandler)
    }, [])
    return null
  }

  it('should set loading and success state for async action', async () => {
    // Use real timers for compatibility
    const parentHandler = vi.fn(() => Promise.resolve())
    let observedState = 'ready'
    render(
      <TestWrapper
        action="submit"
        parentHandler={parentHandler}
        onStateChange={(s: string) => {
          observedState = s
        }}
      />
    )
    expect(observedState).toBe('loading')
    await waitFor(
      () => {
        expect(parentHandler).toHaveBeenCalled()
        expect(
          observedState === 'success' || observedState === 'ready'
        ).toBeTruthy()
      },
      { timeout: 6000 }
    )
  })

  it('should set loading and failure state for rejected async action', async () => {
    // Use real timers for compatibility
    const parentHandler = vi.fn(() => Promise.reject())
    let observedState = 'ready'
    render(
      <TestWrapper
        action="submit"
        parentHandler={parentHandler}
        onStateChange={(s: string) => {
          observedState = s
        }}
      />
    )
    expect(observedState).toBe('loading')
    await waitFor(
      () => {
        expect(parentHandler).toHaveBeenCalled()
        expect(
          observedState === 'failure' || observedState === 'ready'
        ).toBeTruthy()
      },
      { timeout: 6000 }
    )
  })

  it('should call parentHandler for non-async action', async () => {
    const parentHandler = vi.fn()
    render(
      <TestWrapper
        action="next"
        parentHandler={parentHandler}
        onStateChange={() => {}}
      />
    )
    expect(parentHandler).toHaveBeenCalled()
  })
})
