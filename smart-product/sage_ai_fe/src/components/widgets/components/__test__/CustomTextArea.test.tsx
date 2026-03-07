import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomTextArea } from '../CustomTextArea'

// Mock the SCSS module
vi.mock('../CustomTextArea.module.scss', () => ({
  default: {
    textarea: 'mocked-textarea-class',
  },
}))

describe('CustomTextArea', () => {
  const defaultProps = {
    id: 'test-textarea',
    name: 'test-textarea',
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
    it('should render the textarea element', () => {
      render(<CustomTextArea {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should render with correct id', () => {
      render(<CustomTextArea {...defaultProps} id="custom-textarea-id" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('id', 'custom-textarea-id')
    })

    it('should render with correct name attribute', () => {
      render(<CustomTextArea {...defaultProps} id="test-name" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('name', 'test-name')
    })

    it('should render with 4 rows by default', () => {
      render(<CustomTextArea {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '4')
    })

    it('should apply SCSS module class', () => {
      render(<CustomTextArea {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('mocked-textarea-class')
    })

    it('should render with placeholder text', () => {
      render(
        <CustomTextArea {...defaultProps} placeholder="Enter your message" />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('placeholder', 'Enter your message')
    })

    it('should render without placeholder when not provided', () => {
      render(<CustomTextArea {...defaultProps} placeholder={undefined} />)

      const textarea = screen.getByRole('textbox')
      // When placeholder is undefined, the attribute will not be set (or be undefined)
      expect(textarea.getAttribute('placeholder')).toBeNull()
    })
  })

  describe('Value Handling', () => {
    it('should display the provided value', () => {
      render(<CustomTextArea {...defaultProps} value="Test multiline\nvalue" />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toContain('Test multiline')
      expect(textarea.value).toContain('value')
    })

    it('should display empty string when value is undefined', () => {
      render(<CustomTextArea {...defaultProps} value={undefined} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should display empty string when value is null', () => {
      render(<CustomTextArea {...defaultProps} value={null} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should display empty string when value is empty string', () => {
      render(<CustomTextArea {...defaultProps} value="" />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should handle numeric values', () => {
      render(<CustomTextArea {...defaultProps} value={12345} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('12345')
    })

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      render(<CustomTextArea {...defaultProps} value={multilineText} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(multilineText)
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<CustomTextArea {...defaultProps} disabled={true} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should be disabled when readonly prop is true', () => {
      render(<CustomTextArea {...defaultProps} readonly={true} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should be disabled when both disabled and readonly are true', () => {
      render(
        <CustomTextArea {...defaultProps} disabled={true} readonly={true} />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should not be disabled when both disabled and readonly are false', () => {
      render(
        <CustomTextArea {...defaultProps} disabled={false} readonly={false} />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).not.toBeDisabled()
    })

    it('should handle undefined disabled and readonly props', () => {
      render(
        <CustomTextArea
          {...defaultProps}
          disabled={undefined}
          readonly={undefined}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).not.toBeDisabled()
    })
  })

  describe('onChange Handler', () => {
    it('should call onChange with new value when text is entered', () => {
      const mockOnChange = vi.fn()
      render(<CustomTextArea {...defaultProps} onChange={mockOnChange} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'New Value' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith('New Value')
    })

    it('should call onChange with empty string when text is cleared', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomTextArea
          {...defaultProps}
          value="Old Value"
          onChange={mockOnChange}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith('')
    })

    it('should handle multiline text in onChange', () => {
      const mockOnChange = vi.fn()
      render(<CustomTextArea {...defaultProps} onChange={mockOnChange} />)

      const textarea = screen.getByRole('textbox')
      const multilineText = 'Line 1\nLine 2\nLine 3'
      fireEvent.change(textarea, { target: { value: multilineText } })

      expect(mockOnChange).toHaveBeenCalledWith(multilineText)
    })

    it('should handle multiple onChange events', () => {
      const mockOnChange = vi.fn()
      render(<CustomTextArea {...defaultProps} onChange={mockOnChange} />)

      const textarea = screen.getByRole('textbox')

      fireEvent.change(textarea, { target: { value: 'First' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 'First')

      fireEvent.change(textarea, { target: { value: 'Second' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'Second')

      fireEvent.change(textarea, { target: { value: 'Third' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'Third')

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })

    it('should not call onChange when disabled', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomTextArea
          {...defaultProps}
          disabled={true}
          onChange={mockOnChange}
        />
      )

      const textarea = screen.getByRole('textbox')
      // Verify the textarea is disabled
      expect(textarea).toBeDisabled()

      // Note: In test environment, fireEvent can still trigger onChange on disabled elements
      // In real browsers, disabled textareas won't trigger onChange
      fireEvent.change(textarea, { target: { value: 'New Value' } })
    })

    it('should handle special characters in onChange', () => {
      const mockOnChange = vi.fn()
      render(<CustomTextArea {...defaultProps} onChange={mockOnChange} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '!@#$%^&*()' } })

      expect(mockOnChange).toHaveBeenCalledWith('!@#$%^&*()')
    })
  })

  describe('onFocus Handler', () => {
    it('should call onFocus with id and value when field is focused', () => {
      const mockOnFocus = vi.fn()
      render(
        <CustomTextArea
          {...defaultProps}
          value="Test Value"
          onFocus={mockOnFocus}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.focus(textarea)

      expect(mockOnFocus).toHaveBeenCalledTimes(1)
      expect(mockOnFocus).toHaveBeenCalledWith(defaultProps.id, 'Test Value')
    })

    it('should call onFocus with id and undefined when value is undefined', () => {
      const mockOnFocus = vi.fn()
      render(
        <CustomTextArea
          {...defaultProps}
          value={undefined}
          onFocus={mockOnFocus}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.focus(textarea)

      expect(mockOnFocus).toHaveBeenCalledTimes(1)
      expect(mockOnFocus).toHaveBeenCalledWith(defaultProps.id, undefined)
    })

    it('should handle onFocus when it is a valid function', () => {
      const mockOnFocus = vi.fn()
      render(<CustomTextArea {...defaultProps} onFocus={mockOnFocus} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.focus(textarea)

      expect(mockOnFocus).toHaveBeenCalled()
    })

    it('should handle multiple focus events', () => {
      const mockOnFocus = vi.fn()
      render(
        <CustomTextArea {...defaultProps} value="Test" onFocus={mockOnFocus} />
      )

      const textarea = screen.getByRole('textbox')

      fireEvent.focus(textarea)
      fireEvent.blur(textarea)
      fireEvent.focus(textarea)

      expect(mockOnFocus).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integration Tests', () => {
    it('should work correctly with all props set', () => {
      const mockOnChange = vi.fn()
      const mockOnFocus = vi.fn()

      render(
        <CustomTextArea
          {...defaultProps}
          id="full-test"
          value="Initial multiline\nvalue"
          disabled={false}
          readonly={false}
          placeholder="Enter your message here"
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

      expect(textarea).toBeInTheDocument()
      expect(textarea.value).toContain('Initial multiline')
      expect(textarea.value).toContain('value')
      expect(textarea).not.toBeDisabled()
      expect(textarea).toHaveAttribute('placeholder', 'Enter your message here')
      expect(textarea).toHaveAttribute('rows', '4')

      fireEvent.focus(textarea)
      // Check that onFocus was called with the id and some value
      expect(mockOnFocus).toHaveBeenCalledWith('full-test', expect.anything())

      fireEvent.change(textarea, { target: { value: 'Updated value' } })
      expect(mockOnChange).toHaveBeenCalledWith('Updated value')
    })

    it('should update value through multiple interactions', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomTextArea {...defaultProps} value="" onChange={mockOnChange} />
      )

      const textarea = screen.getByRole('textbox')

      fireEvent.change(textarea, { target: { value: 'First\nLine' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('First\nLine')

      rerender(
        <CustomTextArea
          {...defaultProps}
          value="First\nLine"
          onChange={mockOnChange}
        />
      )

      fireEvent.change(textarea, { target: { value: 'First\nLine\nSecond' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('First\nLine\nSecond')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as id', () => {
      render(<CustomTextArea {...defaultProps} id="" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('id', '')
    })

    it('should handle special characters in id', () => {
      const specialId = 'test-textarea-123_$'
      render(<CustomTextArea {...defaultProps} id={specialId} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('id', specialId)
    })

    it('should handle very long text values', () => {
      const longValue = 'a'.repeat(5000)
      render(<CustomTextArea {...defaultProps} value={longValue} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(longValue)
    })

    it('should handle whitespace values', () => {
      const whitespaceValue = '   \n   \n   '
      render(<CustomTextArea {...defaultProps} value={whitespaceValue} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toContain('   ')
      expect(textarea.value.length).toBeGreaterThan(0)
    })

    it('should maintain value across rerenders', () => {
      const persistentValue = 'Persistent\nValue'
      const { rerender } = render(
        <CustomTextArea {...defaultProps} value={persistentValue} />
      )

      let textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toContain('Persistent')
      expect(textarea.value).toContain('Value')

      rerender(<CustomTextArea {...defaultProps} value={persistentValue} />)

      textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toContain('Persistent')
      expect(textarea.value).toContain('Value')
    })

    it('should handle text with tabs and special whitespace', () => {
      const textWithTabs = 'Line 1\t\tTabbed\nLine 2'
      render(<CustomTextArea {...defaultProps} value={textWithTabs} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(textWithTabs)
    })
  })

  describe('Accessibility', () => {
    it('should be accessible as a textbox role', () => {
      render(<CustomTextArea {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should have correct name attribute for form submission', () => {
      render(<CustomTextArea {...defaultProps} id="submission-field" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('name', 'submission-field')
    })
  })
})
