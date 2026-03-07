import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomBooleanCheckboxWidget } from '../CustomBooleanCheckboxWidget'

// Mock LDS Checkbox component
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsCheckbox: ({
    id,
    label,
    name,
    value,
    checked,
    required,
    disabled,
    onChange,
  }: any) => (
    <div data-testid="lds-checkbox">
      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={checked}
        required={required}
        disabled={disabled}
        onChange={onChange}
        data-testid={`checkbox-${id}`}
      />
      <label htmlFor={id} data-testid={`label-${id}`}>
        {label}
      </label>
    </div>
  ),
}))

describe('CustomBooleanCheckboxWidget', () => {
  const defaultProps = {
    id: 'test-checkbox',
    name: 'test-checkbox',
    value: false,
    required: false,
    disabled: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onFocus: vi.fn(),
    schema: {},
    formData: undefined,
    uiSchema: {},
    idSchema: {},
    errorSchema: {},
    formContext: {},
    autofocus: false,
    readonly: false,
    rawErrors: [],
    options: {},
    registry: {} as any,
    label: 'Test Label',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the checkbox component', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} />)

      expect(screen.getByTestId('lds-checkbox')).toBeInTheDocument()
    })

    it('should render with correct id', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} id="custom-id" />)

      const checkbox = screen.getByTestId('checkbox-custom-id')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('id', 'custom-id')
    })

    it('should render with correct label text', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} />)

      const label = screen.getByTestId(`label-${defaultProps.id}`)
      expect(label).toHaveTextContent(
        'By submitting this form, you acknowledge your responsibility to provide accurate and comprehensive information to facilitate a thorough assessment.'
      )
    })

    it('should render with correct name attribute', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} id="test-name" />)

      const checkbox = screen.getByTestId('checkbox-test-name')
      expect(checkbox).toHaveAttribute('name', 'test-name')
    })

    it('should render with value="true"', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} />)

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      expect(checkbox).toHaveAttribute('value', 'true')
    })
  })

  describe('Checked State', () => {
    it('should be unchecked when value is false', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} value={false} />)

      const checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('should be checked when value is true', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} value={true} />)

      const checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('should be unchecked when value is undefined', () => {
      render(
        <CustomBooleanCheckboxWidget {...defaultProps} value={undefined} />
      )

      const checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('should be unchecked when value is null', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} value={null} />)

      const checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('should be unchecked when value is a string', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} value="true" />)

      const checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('should be unchecked when value is 0', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} value={0} />)

      const checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('should be unchecked when value is 1', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} value={1} />)

      const checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })
  })

  describe('Required Property', () => {
    it('should have required attribute when required is true', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} required={true} />)

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      expect(checkbox).toHaveAttribute('required')
    })

    it('should not have required attribute when required is false', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} required={false} />)

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      expect(checkbox).not.toHaveAttribute('required')
    })

    it('should handle required as undefined', () => {
      render(
        <CustomBooleanCheckboxWidget {...defaultProps} required={undefined} />
      )

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      expect(checkbox).not.toHaveAttribute('required')
    })
  })

  describe('Disabled Property', () => {
    it('should be disabled when disabled is true', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} disabled={true} />)

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      expect(checkbox).toBeDisabled()
    })

    it('should not be disabled when disabled is false', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} disabled={false} />)

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      expect(checkbox).not.toBeDisabled()
    })

    it('should handle disabled as undefined', () => {
      render(
        <CustomBooleanCheckboxWidget {...defaultProps} disabled={undefined} />
      )

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      expect(checkbox).not.toBeDisabled()
    })
  })

  describe('onChange Handler', () => {
    it('should call onChange with true when checkbox is checked', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomBooleanCheckboxWidget
          {...defaultProps}
          value={false}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      fireEvent.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should call onChange with false when checkbox is unchecked', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomBooleanCheckboxWidget
          {...defaultProps}
          value={true}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)
      fireEvent.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Integration Tests', () => {
    it('should render correctly with all props set', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomBooleanCheckboxWidget
          {...defaultProps}
          id="full-test"
          value={true}
          required={true}
          disabled={false}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(
        'checkbox-full-test'
      ) as HTMLInputElement
      expect(checkbox).toBeInTheDocument()
      expect(checkbox.checked).toBe(true)
      expect(checkbox).toHaveAttribute('required')
      expect(checkbox).not.toBeDisabled()
    })

    it('should toggle state correctly when clicked multiple times', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomBooleanCheckboxWidget
          {...defaultProps}
          value={false}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)

      // Click to check
      fireEvent.click(checkbox)
      expect(mockOnChange).toHaveBeenLastCalledWith(true)

      // Rerender with updated value
      rerender(
        <CustomBooleanCheckboxWidget
          {...defaultProps}
          value={true}
          onChange={mockOnChange}
        />
      )

      // Click to uncheck
      fireEvent.click(checkbox)
      expect(mockOnChange).toHaveBeenLastCalledWith(false)
    })

    it('should work with different id values', () => {
      const ids = ['id-1', 'id-2', 'checkbox-test', 'form-acknowledgment']

      ids.forEach(id => {
        const { unmount } = render(
          <CustomBooleanCheckboxWidget {...defaultProps} id={id} />
        )

        const checkbox = screen.getByTestId(`checkbox-${id}`)
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).toHaveAttribute('id', id)

        unmount()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as id', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} id="" />)

      const checkbox = screen.getByTestId('checkbox-')
      expect(checkbox).toBeInTheDocument()
    })

    it('should handle special characters in id', () => {
      const specialId = 'test-checkbox-123_$'
      render(<CustomBooleanCheckboxWidget {...defaultProps} id={specialId} />)

      const checkbox = screen.getByTestId(`checkbox-${specialId}`)
      expect(checkbox).toBeInTheDocument()
    })

    it('should maintain checked state across rerenders', () => {
      const { rerender } = render(
        <CustomBooleanCheckboxWidget {...defaultProps} value={true} />
      )

      let checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      rerender(<CustomBooleanCheckboxWidget {...defaultProps} value={true} />)

      checkbox = screen.getByTestId(
        `checkbox-${defaultProps.id}`
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('should handle rapid state changes', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomBooleanCheckboxWidget
          {...defaultProps}
          value={false}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(`checkbox-${defaultProps.id}`)

      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(checkbox)
      }

      expect(mockOnChange).toHaveBeenCalledTimes(5)
    })
  })

  describe('Accessibility', () => {
    it('should associate label with checkbox via id', () => {
      render(
        <CustomBooleanCheckboxWidget
          {...defaultProps}
          id="accessible-checkbox"
        />
      )

      const label = screen.getByTestId('label-accessible-checkbox')
      expect(label).toHaveAttribute('for', 'accessible-checkbox')
    })

    it('should have proper label text for screen readers', () => {
      render(<CustomBooleanCheckboxWidget {...defaultProps} />)

      const label = screen.getByTestId(`label-${defaultProps.id}`)
      const labelText = label.textContent

      expect(labelText).toBeTruthy()
      expect(labelText?.length).toBeGreaterThan(10)
    })
  })
})
