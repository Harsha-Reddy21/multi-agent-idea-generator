import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomTextWidget } from '../CustomTextWidget'

// Mock LDS TextField component
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsTextField: ({
    id,
    name,
    label,
    value,
    disabled,
    placeholder,
    onChange,
    onFocus,
    state,
    stateMessage,
  }: any) => (
    <div data-testid="lds-textfield">
      <label htmlFor={id}>{label}</label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onFocus}
        data-testid={`textfield-${id}`}
        aria-invalid={state === 'error'}
      />
      {state === 'error' && stateMessage && (
        <div data-testid="error-message" className="lds-validation-message--error">
          {stateMessage}
        </div>
      )}
    </div>
  ),
}))

describe('CustomTextWidget', () => {
  const defaultProps = {
    id: 'test-textfield',
    name: 'test-textfield',
    value: '',
    required: false,
    disabled: false,
    readonly: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onFocus: vi.fn(),
    placeholder: 'Enter text',
    schema: {},
    formData: undefined,
    uiSchema: {},
    idSchema: {},
    errorSchema: {},
    formContext: {},
    autofocus: false,
    rawErrors: [],
    options: {},
    registry: {} as any,
    label: 'Test Label',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the text field component', () => {
      render(<CustomTextWidget {...defaultProps} />)

      expect(screen.getByTestId('lds-textfield')).toBeInTheDocument()
    })

    it('should render with correct id', () => {
      render(<CustomTextWidget {...defaultProps} id="custom-text-id" />)

      const textfield = screen.getByTestId('textfield-custom-text-id')
      expect(textfield).toBeInTheDocument()
      expect(textfield).toHaveAttribute('id', 'custom-text-id')
    })

    it('should render with correct name attribute', () => {
      render(<CustomTextWidget {...defaultProps} id="test-name" />)

      const textfield = screen.getByTestId('textfield-test-name')
      expect(textfield).toHaveAttribute('name', 'test-name')
    })

    it('should render with placeholder text', () => {
      render(
        <CustomTextWidget {...defaultProps} placeholder="Enter your name" />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      expect(textfield).toHaveAttribute('placeholder', 'Enter your name')
    })
  })

  describe('Value Handling', () => {
    it('should display the provided value', () => {
      render(<CustomTextWidget {...defaultProps} value="Test Value" />)

      const textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe('Test Value')
    })

    it('should display empty string when value is undefined', () => {
      render(<CustomTextWidget {...defaultProps} value={undefined} />)

      const textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe('')
    })

    it('should display empty string when value is null', () => {
      render(<CustomTextWidget {...defaultProps} value={null} />)

      const textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe('')
    })

    it('should display empty string when value is empty string', () => {
      render(<CustomTextWidget {...defaultProps} value="" />)

      const textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe('')
    })

    it('should handle numeric values', () => {
      render(<CustomTextWidget {...defaultProps} value={123} />)

      const textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe('123')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<CustomTextWidget {...defaultProps} disabled={true} />)

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      expect(textfield).toBeDisabled()
    })

    it('should be disabled when readonly prop is true', () => {
      render(<CustomTextWidget {...defaultProps} readonly={true} />)

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      expect(textfield).toBeDisabled()
    })

    it('should be disabled when both disabled and readonly are true', () => {
      render(
        <CustomTextWidget {...defaultProps} disabled={true} readonly={true} />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      expect(textfield).toBeDisabled()
    })

    it('should not be disabled when both disabled and readonly are false', () => {
      render(
        <CustomTextWidget {...defaultProps} disabled={false} readonly={false} />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      expect(textfield).not.toBeDisabled()
    })

    it('should handle undefined disabled and readonly props', () => {
      render(
        <CustomTextWidget
          {...defaultProps}
          disabled={undefined}
          readonly={undefined}
        />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      expect(textfield).not.toBeDisabled()
    })
  })

  describe('onChange Handler', () => {
    it('should call onChange with new value when text is entered', () => {
      const mockOnChange = vi.fn()
      render(<CustomTextWidget {...defaultProps} onChange={mockOnChange} />)

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.change(textfield, { target: { value: 'New Value' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith('New Value')
    })

    it('should call onChange with empty string when text is cleared', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomTextWidget
          {...defaultProps}
          value="Old Value"
          onChange={mockOnChange}
        />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.change(textfield, { target: { value: '' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith('')
    })

    it('should handle multiple onChange events', () => {
      const mockOnChange = vi.fn()
      render(<CustomTextWidget {...defaultProps} onChange={mockOnChange} />)

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)

      fireEvent.change(textfield, { target: { value: 'First' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 'First')

      fireEvent.change(textfield, { target: { value: 'Second' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'Second')

      fireEvent.change(textfield, { target: { value: 'Third' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'Third')

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })

    it('should handle special characters in onChange', () => {
      const mockOnChange = vi.fn()
      render(<CustomTextWidget {...defaultProps} onChange={mockOnChange} />)

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.change(textfield, { target: { value: '!@#$%^&*()' } })

      expect(mockOnChange).toHaveBeenCalledWith('!@#$%^&*()')
    })
  })

  describe('onFocus Handler', () => {
    it('should call onFocus with id and value when field is focused', () => {
      const mockOnFocus = vi.fn()
      render(
        <CustomTextWidget
          {...defaultProps}
          value="Test Value"
          onFocus={mockOnFocus}
        />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.focus(textfield)

      expect(mockOnFocus).toHaveBeenCalledTimes(1)
      expect(mockOnFocus).toHaveBeenCalledWith(defaultProps.id, 'Test Value')
    })

    it('should call onFocus with id and undefined when value is undefined', () => {
      const mockOnFocus = vi.fn()
      render(
        <CustomTextWidget
          {...defaultProps}
          value={undefined}
          onFocus={mockOnFocus}
        />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.focus(textfield)

      expect(mockOnFocus).toHaveBeenCalledTimes(1)
      expect(mockOnFocus).toHaveBeenCalledWith(defaultProps.id, undefined)
    })

    it('should handle onFocus when it is a valid function', () => {
      const mockOnFocus = vi.fn()
      render(<CustomTextWidget {...defaultProps} onFocus={mockOnFocus} />)

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.focus(textfield)

      expect(mockOnFocus).toHaveBeenCalled()
    })

    it('should handle multiple focus events', () => {
      const mockOnFocus = vi.fn()
      render(
        <CustomTextWidget
          {...defaultProps}
          value="Test"
          onFocus={mockOnFocus}
        />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)

      fireEvent.focus(textfield)
      fireEvent.blur(textfield)
      fireEvent.focus(textfield)

      expect(mockOnFocus).toHaveBeenCalledTimes(2)
    })
  })

  describe('Telephone Field Validation', () => {
    const telephoneSchema = {
      title: 'Telephone Number',
      pattern: '^[0-9]{10}$',
      maxLength: 10,
      errorMessage: 'Please enter a valid 10 digit telephone number.',
    }

    it('should strip non-numeric characters from telephone field', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          onChange={mockOnChange}
        />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.change(textfield, { target: { value: '123abc456' } })

      expect(mockOnChange).toHaveBeenCalledWith('123456')
    })

    it('should enforce maxLength for telephone field', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          onChange={mockOnChange}
        />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.change(textfield, { target: { value: '12345678901' } })

      expect(mockOnChange).toHaveBeenCalledWith('1234567890')
    })

    it('should show error for incomplete telephone number', async () => {
      const { rerender } = render(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          value=""
        />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          value="12345"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent(
          'Please enter a valid 10 digit telephone number.'
        )
      })
    })

    it('should not show error for valid 10-digit telephone number', async () => {
      const { rerender } = render(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          value=""
        />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          value="1234567890"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).not.toBeInTheDocument()
      })
    })

    it('should clear error when field is empty', async () => {
      const { rerender } = render(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          value="12345"
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          value=""
        />
      )

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
      })
    })
  })

  describe('Email Field Validation', () => {
    const emailSchema = {
      title: 'Email',
      format: 'email',
      errorMessage: 'Please enter a valid email address.',
    }

    it('should show error for invalid email format', async () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} schema={emailSchema} value="" />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={emailSchema}
          value="invalid-email"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent(
          'Please enter a valid email address.'
        )
      })
    })

    it('should not show error for valid email format', async () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} schema={emailSchema} value="" />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={emailSchema}
          value="test@example.com"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).not.toBeInTheDocument()
      })
    })

    it('should validate email with title containing email', async () => {
      const emailTitleSchema = {
        title: 'Email Address',
        errorMessage: 'Please enter a valid email address.',
      }

      const { rerender } = render(
        <CustomTextWidget
          {...defaultProps}
          schema={emailTitleSchema}
          value=""
        />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={emailTitleSchema}
          value="bad-email"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })

  describe('Name Field Validation', () => {
    const firstNameSchema = {
      title: 'First Name',
      pattern: '^[A-Za-z\\s]+$',
      errorMessage: 'Please enter only alphabet in this text field.',
    }

    const lastNameSchema = {
      title: 'Last Name',
      pattern: '^[A-Za-z\\s]+$',
      errorMessage: 'Please enter only alphabet in this text field.',
    }

    it('should show error for numbers in first name', async () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} schema={firstNameSchema} value="" />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={firstNameSchema}
          value="John123"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent(
          'Please enter only alphabet in this text field.'
        )
      })
    })

    it('should show error for special characters in first name', async () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} schema={firstNameSchema} value="" />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={firstNameSchema}
          value="John@Doe"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
      })
    })

    it('should not show error for valid first name', async () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} schema={firstNameSchema} value="" />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={firstNameSchema}
          value="John Doe"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).not.toBeInTheDocument()
      })
    })

    it('should show error for numbers in last name', async () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} schema={lastNameSchema} value="" />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={lastNameSchema}
          value="Smith99"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
      })
    })

    it('should not show error for valid last name', async () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} schema={lastNameSchema} value="" />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={lastNameSchema}
          value="Smith"
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).not.toBeInTheDocument()
      })
    })

    it('should allow user to type numbers but show error', async () => {
      const mockOnChange = vi.fn()
      render(
        <CustomTextWidget
          {...defaultProps}
          schema={firstNameSchema}
          onChange={mockOnChange}
        />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)
      fireEvent.change(textfield, { target: { value: 'John123' } })

      // onChange should be called with the value including numbers
      expect(mockOnChange).toHaveBeenCalledWith('John123')
    })
  })

  describe('Error Message Display', () => {
    it('should display error from rawErrors prop', async () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} rawErrors={[]} />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          rawErrors={['This field is required']}
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent('This field is required')
      })
    })

    it('should prioritize local validation error over rawErrors', async () => {
      const telephoneSchema = {
        title: 'Telephone Number',
        pattern: '^[0-9]{10}$',
        maxLength: 10,
        errorMessage: 'Please enter a valid 10 digit telephone number.',
      }

      const { rerender } = render(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          value=""
          rawErrors={['Generic error']}
        />
      )

      rerender(
        <CustomTextWidget
          {...defaultProps}
          schema={telephoneSchema}
          value="12345"
          rawErrors={['Generic error']}
        />
      )

      await waitFor(() => {
        const errorMessage = screen.queryByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent(
          'Please enter a valid 10 digit telephone number.'
        )
      })
    })
  })

  describe('Integration Tests', () => {
    it('should work correctly with all props set', () => {
      const mockOnChange = vi.fn()
      const mockOnFocus = vi.fn()

      render(
        <CustomTextWidget
          {...defaultProps}
          id="full-test"
          value="Initial Value"
          disabled={false}
          readonly={false}
          placeholder="Enter text here"
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      )

      const textfield = screen.getByTestId(
        'textfield-full-test'
      ) as HTMLInputElement

      expect(textfield).toBeInTheDocument()
      expect(textfield.value).toBe('Initial Value')
      expect(textfield).not.toBeDisabled()
      expect(textfield).toHaveAttribute('placeholder', 'Enter text here')

      fireEvent.focus(textfield)
      expect(mockOnFocus).toHaveBeenCalledWith('full-test', 'Initial Value')

      fireEvent.change(textfield, { target: { value: 'Updated Value' } })
      expect(mockOnChange).toHaveBeenCalledWith('Updated Value')
    })

    it('should update value through multiple interactions', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} value="" onChange={mockOnChange} />
      )

      const textfield = screen.getByTestId(`textfield-${defaultProps.id}`)

      fireEvent.change(textfield, { target: { value: 'First' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('First')

      rerender(
        <CustomTextWidget
          {...defaultProps}
          value="First"
          onChange={mockOnChange}
        />
      )

      fireEvent.change(textfield, { target: { value: 'First Update' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('First Update')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as id', () => {
      render(<CustomTextWidget {...defaultProps} id="" />)

      const textfield = screen.getByTestId('textfield-')
      expect(textfield).toBeInTheDocument()
    })

    it('should handle special characters in id', () => {
      const specialId = 'test-field-123_$'
      render(<CustomTextWidget {...defaultProps} id={specialId} />)

      const textfield = screen.getByTestId(`textfield-${specialId}`)
      expect(textfield).toBeInTheDocument()
    })

    it('should handle very long text values', () => {
      const longValue = 'a'.repeat(1000)
      render(<CustomTextWidget {...defaultProps} value={longValue} />)

      const textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe(longValue)
    })

    it('should handle whitespace values', () => {
      render(<CustomTextWidget {...defaultProps} value="   " />)

      const textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe('   ')
    })

    it('should maintain value across rerenders', () => {
      const { rerender } = render(
        <CustomTextWidget {...defaultProps} value="Persistent Value" />
      )

      let textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe('Persistent Value')

      rerender(<CustomTextWidget {...defaultProps} value="Persistent Value" />)

      textfield = screen.getByTestId(
        `textfield-${defaultProps.id}`
      ) as HTMLInputElement
      expect(textfield.value).toBe('Persistent Value')
    })
  })
})
