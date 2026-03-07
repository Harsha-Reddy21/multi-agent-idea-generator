import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomCheckboxWidget } from '../CustomCheckboxWidget'

// Mock LDS Checkbox component
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsCheckbox: ({
    id,
    name,
    label,
    value,
    checked,
    disabled,
    onChange,
  }: any) => (
    <div data-testid={`checkbox-wrapper-${id}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={checked}
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

// Mock the SCSS module
vi.mock('./CustomCheckboxWidget.module.scss', () => ({
  default: {
    checkboxContainer: 'mocked-checkbox-container',
  },
}))

// Mock the useCheckboxPreselection hook
vi.mock('../hooks/useFieldPreselection', () => ({
  useCheckboxPreselection: vi.fn(),
}))

describe('CustomCheckboxWidget', () => {
  const defaultProps = {
    id: 'test-checkbox-group',
    name: 'test-checkbox-group',
    value: [],
    required: false,
    disabled: false,
    readonly: false,
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
    rawErrors: [],
    options: {
      enumOptions: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ],
    },
    registry: {} as any,
    label: 'Test Label',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all checkbox options', () => {
      render(<CustomCheckboxWidget {...defaultProps} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toBeInTheDocument()
    })

    it('should render checkboxes with correct labels', () => {
      render(<CustomCheckboxWidget {...defaultProps} />)

      expect(
        screen.getByTestId('label-test-checkbox-group-option1')
      ).toHaveTextContent('Option 1')
      expect(
        screen.getByTestId('label-test-checkbox-group-option2')
      ).toHaveTextContent('Option 2')
      expect(
        screen.getByTestId('label-test-checkbox-group-option3')
      ).toHaveTextContent('Option 3')
    })

    it('should render checkboxes with correct ids', () => {
      render(<CustomCheckboxWidget {...defaultProps} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toHaveAttribute('id', 'test-checkbox-group-option1')
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toHaveAttribute('id', 'test-checkbox-group-option2')
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toHaveAttribute('id', 'test-checkbox-group-option3')
    })

    it('should render checkboxes with correct name attribute', () => {
      render(<CustomCheckboxWidget {...defaultProps} id="custom-name" />)

      expect(
        screen.getByTestId('checkbox-custom-name-option1')
      ).toHaveAttribute('name', 'custom-name')
      expect(
        screen.getByTestId('checkbox-custom-name-option2')
      ).toHaveAttribute('name', 'custom-name')
      expect(
        screen.getByTestId('checkbox-custom-name-option3')
      ).toHaveAttribute('name', 'custom-name')
    })

    it('should render checkboxes with correct values', () => {
      render(<CustomCheckboxWidget {...defaultProps} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toHaveAttribute('value', 'option1')
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toHaveAttribute('value', 'option2')
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toHaveAttribute('value', 'option3')
    })

    it('should render no checkboxes when enumOptions is empty', () => {
      render(
        <CustomCheckboxWidget {...defaultProps} options={{ enumOptions: [] }} />
      )

      expect(
        screen.queryByTestId('checkbox-test-checkbox-group-option1')
      ).not.toBeInTheDocument()
    })

    it('should render no checkboxes when enumOptions is undefined', () => {
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          options={{ enumOptions: undefined }}
        />
      )

      expect(
        screen.queryByTestId('checkbox-test-checkbox-group-option1')
      ).not.toBeInTheDocument()
    })
  })

  describe('Checked State', () => {
    it('should render all checkboxes unchecked when value is empty array', () => {
      render(<CustomCheckboxWidget {...defaultProps} value={[]} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).not.toBeChecked()
    })

    it('should render all checkboxes unchecked when value is undefined', () => {
      render(<CustomCheckboxWidget {...defaultProps} value={undefined} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).not.toBeChecked()
    })

    it('should render all checkboxes unchecked when value is null', () => {
      render(<CustomCheckboxWidget {...defaultProps} value={null} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).not.toBeChecked()
    })

    it('should render selected checkboxes as checked', () => {
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1', 'option3']}
        />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toBeChecked()
    })

    it('should render single selected checkbox as checked', () => {
      render(<CustomCheckboxWidget {...defaultProps} value={['option2']} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).not.toBeChecked()
    })

    it('should render all checkboxes as checked when all values are selected', () => {
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1', 'option2', 'option3']}
        />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toBeChecked()
    })
  })

  describe('Disabled State', () => {
    it('should disable all checkboxes when disabled is true', () => {
      render(<CustomCheckboxWidget {...defaultProps} disabled={true} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeDisabled()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeDisabled()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toBeDisabled()
    })

    it('should disable all checkboxes when readonly is true', () => {
      render(<CustomCheckboxWidget {...defaultProps} readonly={true} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeDisabled()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeDisabled()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toBeDisabled()
    })

    it('should disable all checkboxes when both disabled and readonly are true', () => {
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          disabled={true}
          readonly={true}
        />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeDisabled()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeDisabled()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toBeDisabled()
    })

    it('should not disable checkboxes when both disabled and readonly are false', () => {
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          disabled={false}
          readonly={false}
        />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).not.toBeDisabled()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).not.toBeDisabled()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).not.toBeDisabled()
    })
  })

  describe('onChange Handler - Checking Checkboxes', () => {
    it('should call onChange with new value when checkbox is checked', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(
        'checkbox-test-checkbox-group-option1'
      )
      fireEvent.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(['option1'])
    })

    it('should add value to existing selections when checking a checkbox', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1']}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(
        'checkbox-test-checkbox-group-option2'
      )
      fireEvent.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2'])
    })

    it('should handle multiple checkboxes being checked sequentially', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      fireEvent.click(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      )
      expect(mockOnChange).toHaveBeenNthCalledWith(1, ['option1'])

      fireEvent.click(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      )
      expect(mockOnChange).toHaveBeenNthCalledWith(2, ['option3'])

      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('onChange Handler - Unchecking Checkboxes', () => {
    it('should call onChange with empty array when unchecking the only checked checkbox', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option2']}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(
        'checkbox-test-checkbox-group-option2'
      )
      fireEvent.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith([])
    })

    it('should remove value from selections when unchecking a checkbox', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1', 'option2', 'option3']}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(
        'checkbox-test-checkbox-group-option2'
      )
      fireEvent.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option3'])
    })

    it('should handle checking and unchecking the same checkbox', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      const checkbox = screen.getByTestId(
        'checkbox-test-checkbox-group-option1'
      )

      // Check
      fireEvent.click(checkbox)
      expect(mockOnChange).toHaveBeenLastCalledWith(['option1'])

      // Rerender with new value
      rerender(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1']}
          onChange={mockOnChange}
        />
      )

      // Uncheck
      fireEvent.click(checkbox)
      expect(mockOnChange).toHaveBeenLastCalledWith([])
    })
  })

  describe('Integration Tests', () => {
    it('should work correctly with all props set', () => {
      const mockOnChange = vi.fn()

      render(
        <CustomCheckboxWidget
          {...defaultProps}
          id="full-test"
          value={['option1', 'option3']}
          disabled={false}
          readonly={false}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('checkbox-full-test-option1')).toBeChecked()
      expect(screen.getByTestId('checkbox-full-test-option2')).not.toBeChecked()
      expect(screen.getByTestId('checkbox-full-test-option3')).toBeChecked()

      fireEvent.click(screen.getByTestId('checkbox-full-test-option2'))
      expect(mockOnChange).toHaveBeenCalledWith([
        'option1',
        'option3',
        'option2',
      ])
    })

    it('should handle complex selection changes', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      // Check first
      fireEvent.click(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      )
      expect(mockOnChange).toHaveBeenLastCalledWith(['option1'])

      rerender(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1']}
          onChange={mockOnChange}
        />
      )

      // Check second
      fireEvent.click(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      )
      expect(mockOnChange).toHaveBeenLastCalledWith(['option1', 'option2'])

      rerender(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1', 'option2']}
          onChange={mockOnChange}
        />
      )

      // Uncheck first
      fireEvent.click(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      )
      expect(mockOnChange).toHaveBeenLastCalledWith(['option2'])
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as id', () => {
      render(<CustomCheckboxWidget {...defaultProps} id="" />)

      expect(screen.getByTestId('checkbox--option1')).toBeInTheDocument()
    })

    it('should handle special characters in id', () => {
      const specialId = 'test-checkbox-123_$'
      render(<CustomCheckboxWidget {...defaultProps} id={specialId} />)

      expect(
        screen.getByTestId(`checkbox-${specialId}-option1`)
      ).toBeInTheDocument()
    })

    it('should handle options with special characters in values', () => {
      const specialOptions = {
        enumOptions: [
          { label: 'Option with spaces', value: 'option with spaces' },
          { label: 'Option-with-dashes', value: 'option-with-dashes' },
        ],
      }

      render(
        <CustomCheckboxWidget {...defaultProps} options={specialOptions} />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option with spaces')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option-with-dashes')
      ).toBeInTheDocument()
    })

    it('should handle very long option labels', () => {
      const longLabelOptions = {
        enumOptions: [
          {
            label:
              'This is a very long checkbox label that might wrap in the UI',
            value: 'long-option',
          },
        ],
      }

      render(
        <CustomCheckboxWidget {...defaultProps} options={longLabelOptions} />
      )

      expect(
        screen.getByText(
          'This is a very long checkbox label that might wrap in the UI'
        )
      ).toBeInTheDocument()
    })

    it('should maintain selection state across rerenders', () => {
      const { rerender } = render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1', 'option2']}
        />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeChecked()

      rerender(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1', 'option2']}
        />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeChecked()
    })

    it('should handle duplicate values in selected array', () => {
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1', 'option1', 'option2']}
        />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeChecked()
    })

    it('should handle invalid values in selected array', () => {
      render(
        <CustomCheckboxWidget
          {...defaultProps}
          value={['option1', 'invalid', 'option3']}
        />
      )

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).not.toBeChecked()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toBeChecked()
    })

    it('should handle changing enumOptions dynamically', () => {
      const { rerender } = render(<CustomCheckboxWidget {...defaultProps} />)

      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option1')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option2')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-option3')
      ).toBeInTheDocument()

      const newOptions = {
        enumOptions: [
          { label: 'New Option 1', value: 'new1' },
          { label: 'New Option 2', value: 'new2' },
        ],
      }

      rerender(<CustomCheckboxWidget {...defaultProps} options={newOptions} />)

      expect(
        screen.queryByTestId('checkbox-test-checkbox-group-option1')
      ).not.toBeInTheDocument()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-new1')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('checkbox-test-checkbox-group-new2')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should associate labels with checkboxes via htmlFor', () => {
      render(<CustomCheckboxWidget {...defaultProps} />)

      const label = screen.getByTestId('label-test-checkbox-group-option1')
      expect(label).toHaveAttribute('for', 'test-checkbox-group-option1')
    })

    it('should have proper checkbox attributes for screen readers', () => {
      render(<CustomCheckboxWidget {...defaultProps} value={['option1']} />)

      const checkbox = screen.getByTestId(
        'checkbox-test-checkbox-group-option1'
      )
      expect(checkbox).toHaveAttribute('type', 'checkbox')
      expect(checkbox).toHaveAttribute('id', 'test-checkbox-group-option1')
    })

    it('should maintain checkbox group name for form submission', () => {
      render(<CustomCheckboxWidget {...defaultProps} id="form-field" />)

      expect(screen.getByTestId('checkbox-form-field-option1')).toHaveAttribute(
        'name',
        'form-field'
      )
      expect(screen.getByTestId('checkbox-form-field-option2')).toHaveAttribute(
        'name',
        'form-field'
      )
      expect(screen.getByTestId('checkbox-form-field-option3')).toHaveAttribute(
        'name',
        'form-field'
      )
    })
  })

  describe('Key Generation', () => {
    it('should generate unique keys for each checkbox', () => {
      const { container } = render(<CustomCheckboxWidget {...defaultProps} />)

      const checkboxWrappers = container.querySelectorAll(
        '[data-testid^="checkbox-wrapper-"]'
      )
      expect(checkboxWrappers).toHaveLength(3)
    })

    it('should handle duplicate option values with unique keys', () => {
      const duplicateOptions = {
        enumOptions: [
          { label: 'Option A', value: 'option1' },
          { label: 'Option B', value: 'option1' }, // Duplicate value
        ],
      }

      render(
        <CustomCheckboxWidget {...defaultProps} options={duplicateOptions} />
      )

      const checkboxes = screen.getAllByTestId(
        'checkbox-test-checkbox-group-option1'
      )
      expect(checkboxes).toHaveLength(2)
    })
  })
})
