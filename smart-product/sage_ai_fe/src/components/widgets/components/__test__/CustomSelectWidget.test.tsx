import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomSelectWidget } from '../CustomSelectWidget'

// Mock LDS Select component
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsSelect: ({ id, name, label, options, value, disabled, onChange }: any) => (
    <div data-testid="lds-select">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        data-testid={`select-${id}`}
      >
        {options.map((option: any, index: number) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}))

describe('CustomSelectWidget', () => {
  const defaultProps = {
    id: 'test-select',
    name: 'test-select',
    value: '',
    required: false,
    disabled: false,
    readonly: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onFocus: vi.fn(),
    placeholder: 'Choose an option',
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
    it('should render the select component', () => {
      render(<CustomSelectWidget {...defaultProps} />)

      expect(screen.getByTestId('lds-select')).toBeInTheDocument()
    })

    it('should render with correct id', () => {
      render(<CustomSelectWidget {...defaultProps} id="custom-select-id" />)

      const select = screen.getByTestId('select-custom-select-id')
      expect(select).toBeInTheDocument()
      expect(select).toHaveAttribute('id', 'custom-select-id')
    })

    it('should render with correct name attribute', () => {
      render(<CustomSelectWidget {...defaultProps} id="test-name" />)

      const select = screen.getByTestId('select-test-name')
      expect(select).toHaveAttribute('name', 'test-name')
    })

    it('should render placeholder option as first option', () => {
      render(
        <CustomSelectWidget {...defaultProps} placeholder="Choose an option" />
      )

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      const firstOption = select.querySelector('option:first-child')
      expect(firstOption).toHaveTextContent('Choose an option')
      expect(firstOption).toHaveValue('')
    })

    it('should render default placeholder when placeholder is not provided', () => {
      render(<CustomSelectWidget {...defaultProps} placeholder={undefined} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      const firstOption = select.querySelector('option:first-child')
      expect(firstOption).toHaveTextContent('Select...')
    })

    it('should render all enum options', () => {
      render(<CustomSelectWidget {...defaultProps} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      const options = select.querySelectorAll('option')

      // Should have placeholder + 3 options
      expect(options).toHaveLength(4)
      expect(options[1]).toHaveTextContent('Option 1')
      expect(options[1]).toHaveValue('option1')
      expect(options[2]).toHaveTextContent('Option 2')
      expect(options[2]).toHaveValue('option2')
      expect(options[3]).toHaveTextContent('Option 3')
      expect(options[3]).toHaveValue('option3')
    })

    it('should render only placeholder when enumOptions is empty', () => {
      render(
        <CustomSelectWidget {...defaultProps} options={{ enumOptions: [] }} />
      )

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      const options = select.querySelectorAll('option')
      expect(options).toHaveLength(1)
    })

    it('should render only placeholder when enumOptions is undefined', () => {
      render(
        <CustomSelectWidget
          {...defaultProps}
          options={{ enumOptions: undefined }}
        />
      )

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      const options = select.querySelectorAll('option')
      expect(options).toHaveLength(1)
    })
  })

  describe('Value Handling', () => {
    it('should display the selected value', () => {
      render(<CustomSelectWidget {...defaultProps} value="option2" />)

      const select = screen.getByTestId(
        `select-${defaultProps.id}`
      ) as HTMLSelectElement
      expect(select.value).toBe('option2')
    })

    it('should display empty string when value is undefined', () => {
      render(<CustomSelectWidget {...defaultProps} value={undefined} />)

      const select = screen.getByTestId(
        `select-${defaultProps.id}`
      ) as HTMLSelectElement
      expect(select.value).toBe('')
    })

    it('should display empty string when value is null', () => {
      render(<CustomSelectWidget {...defaultProps} value={null} />)

      const select = screen.getByTestId(
        `select-${defaultProps.id}`
      ) as HTMLSelectElement
      expect(select.value).toBe('')
    })

    it('should display empty string when value is empty string', () => {
      render(<CustomSelectWidget {...defaultProps} value="" />)

      const select = screen.getByTestId(
        `select-${defaultProps.id}`
      ) as HTMLSelectElement
      expect(select.value).toBe('')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<CustomSelectWidget {...defaultProps} disabled={true} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      expect(select).toBeDisabled()
    })

    it('should be disabled when readonly prop is true', () => {
      render(<CustomSelectWidget {...defaultProps} readonly={true} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      expect(select).toBeDisabled()
    })

    it('should be disabled when both disabled and readonly are true', () => {
      render(
        <CustomSelectWidget {...defaultProps} disabled={true} readonly={true} />
      )

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      expect(select).toBeDisabled()
    })

    it('should not be disabled when both disabled and readonly are false', () => {
      render(
        <CustomSelectWidget
          {...defaultProps}
          disabled={false}
          readonly={false}
        />
      )

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      expect(select).not.toBeDisabled()
    })

    it('should handle undefined disabled and readonly props', () => {
      render(
        <CustomSelectWidget
          {...defaultProps}
          disabled={undefined}
          readonly={undefined}
        />
      )

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      expect(select).not.toBeDisabled()
    })
  })

  describe('onChange Handler - String Value', () => {
    it('should call onChange with selected value when option is selected', () => {
      const mockOnChange = vi.fn()
      render(<CustomSelectWidget {...defaultProps} onChange={mockOnChange} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      fireEvent.change(select, { target: { value: 'option2' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith('option2')
    })

    it('should call onChange with undefined when placeholder is selected', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomSelectWidget
          {...defaultProps}
          value="option1"
          onChange={mockOnChange}
        />
      )

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      fireEvent.change(select, { target: { value: '' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(undefined)
    })

    it('should handle multiple onChange events', () => {
      const mockOnChange = vi.fn()
      render(<CustomSelectWidget {...defaultProps} onChange={mockOnChange} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)

      fireEvent.change(select, { target: { value: 'option1' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 'option1')

      fireEvent.change(select, { target: { value: 'option2' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'option2')

      fireEvent.change(select, { target: { value: 'option3' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'option3')

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })
  })

  describe('onChange Handler - Different Value Types', () => {
    it('should handle direct string value', () => {
      const mockOnChange = vi.fn()
      render(<CustomSelectWidget {...defaultProps} onChange={mockOnChange} />)

      // Simulate LdsSelect passing string directly via change event
      const select = screen.getByTestId(`select-${defaultProps.id}`)
      fireEvent.change(select, { target: { value: 'option1' } })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })

    it('should handle event object with target.value', () => {
      const mockOnChange = vi.fn()
      render(<CustomSelectWidget {...defaultProps} onChange={mockOnChange} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      fireEvent.change(select, { target: { value: 'option3' } })

      expect(mockOnChange).toHaveBeenCalledWith('option3')
    })

    it('should convert empty string to undefined', () => {
      const mockOnChange = vi.fn()
      render(<CustomSelectWidget {...defaultProps} onChange={mockOnChange} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      fireEvent.change(select, { target: { value: '' } })

      expect(mockOnChange).toHaveBeenCalledWith(undefined)
    })
  })

  describe('Integration Tests', () => {
    it('should work correctly with all props set', () => {
      const mockOnChange = vi.fn()

      render(
        <CustomSelectWidget
          {...defaultProps}
          id="full-test"
          value="option2"
          disabled={false}
          readonly={false}
          placeholder="Select your option"
          onChange={mockOnChange}
        />
      )

      const select = screen.getByTestId('select-full-test') as HTMLSelectElement

      expect(select).toBeInTheDocument()
      expect(select.value).toBe('option2')
      expect(select).not.toBeDisabled()

      const options = select.querySelectorAll('option')
      expect(options[0]).toHaveTextContent('Select your option')

      fireEvent.change(select, { target: { value: 'option3' } })
      expect(mockOnChange).toHaveBeenCalledWith('option3')
    })

    it('should update value through multiple interactions', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomSelectWidget
          {...defaultProps}
          value=""
          onChange={mockOnChange}
        />
      )

      const select = screen.getByTestId(`select-${defaultProps.id}`)

      fireEvent.change(select, { target: { value: 'option1' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('option1')

      rerender(
        <CustomSelectWidget
          {...defaultProps}
          value="option1"
          onChange={mockOnChange}
        />
      )

      fireEvent.change(select, { target: { value: 'option2' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('option2')
    })

    it('should handle dynamic option changes', () => {
      const { rerender } = render(<CustomSelectWidget {...defaultProps} />)

      let select = screen.getByTestId(`select-${defaultProps.id}`)
      let options = select.querySelectorAll('option')
      expect(options).toHaveLength(4) // placeholder + 3 options

      const newOptions = {
        enumOptions: [
          { label: 'New Option 1', value: 'new1' },
          { label: 'New Option 2', value: 'new2' },
        ],
      }

      rerender(<CustomSelectWidget {...defaultProps} options={newOptions} />)

      select = screen.getByTestId(`select-${defaultProps.id}`)
      options = select.querySelectorAll('option')
      expect(options).toHaveLength(3) // placeholder + 2 options
      expect(options[1]).toHaveTextContent('New Option 1')
      expect(options[2]).toHaveTextContent('New Option 2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as id', () => {
      render(<CustomSelectWidget {...defaultProps} id="" />)

      const select = screen.getByTestId('select-')
      expect(select).toBeInTheDocument()
    })

    it('should handle special characters in id', () => {
      const specialId = 'test-select-123_$'
      render(<CustomSelectWidget {...defaultProps} id={specialId} />)

      const select = screen.getByTestId(`select-${specialId}`)
      expect(select).toBeInTheDocument()
    })

    it('should handle options with special characters in values', () => {
      const specialOptions = {
        enumOptions: [
          { label: 'Option with spaces', value: 'option with spaces' },
          { label: 'Option-with-dashes', value: 'option-with-dashes' },
          {
            label: 'Option_with_underscores',
            value: 'option_with_underscores',
          },
        ],
      }

      render(<CustomSelectWidget {...defaultProps} options={specialOptions} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      const options = select.querySelectorAll('option')
      expect(options[1]).toHaveValue('option with spaces')
      expect(options[2]).toHaveValue('option-with-dashes')
      expect(options[3]).toHaveValue('option_with_underscores')
    })

    it('should handle very long option labels', () => {
      const longLabelOptions = {
        enumOptions: [
          {
            label: 'This is a very long option label that might wrap in the UI',
            value: 'long-option',
          },
        ],
      }

      render(
        <CustomSelectWidget {...defaultProps} options={longLabelOptions} />
      )

      const option = screen.getByText(
        'This is a very long option label that might wrap in the UI'
      )
      expect(option).toBeInTheDocument()
    })

    it('should maintain value across rerenders', () => {
      const { rerender } = render(
        <CustomSelectWidget {...defaultProps} value="option2" />
      )

      let select = screen.getByTestId(
        `select-${defaultProps.id}`
      ) as HTMLSelectElement
      expect(select.value).toBe('option2')

      rerender(<CustomSelectWidget {...defaultProps} value="option2" />)

      select = screen.getByTestId(
        `select-${defaultProps.id}`
      ) as HTMLSelectElement
      expect(select.value).toBe('option2')
    })

    it('should handle numeric option values as strings', () => {
      const numericOptions = {
        enumOptions: [
          { label: 'One', value: '1' },
          { label: 'Two', value: '2' },
          { label: 'Three', value: '3' },
        ],
      }

      render(<CustomSelectWidget {...defaultProps} options={numericOptions} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      const options = select.querySelectorAll('option')
      expect(options[1]).toHaveValue('1')
      expect(options[2]).toHaveValue('2')
      expect(options[3]).toHaveValue('3')
    })
  })

  describe('Options Mapping', () => {
    it('should correctly map enumOptions to select options', () => {
      const customOptions = {
        enumOptions: [
          { label: 'First', value: 'first' },
          { label: 'Second', value: 'second' },
        ],
      }

      render(<CustomSelectWidget {...defaultProps} options={customOptions} />)

      const select = screen.getByTestId(`select-${defaultProps.id}`)
      const options = select.querySelectorAll('option')

      expect(options).toHaveLength(3) // placeholder + 2
      expect(options[1]).toHaveTextContent('First')
      expect(options[1]).toHaveValue('first')
      expect(options[2]).toHaveTextContent('Second')
      expect(options[2]).toHaveValue('second')
    })

    it('should handle options with same labels but different values', () => {
      const duplicateLabelOptions = {
        enumOptions: [
          { label: 'Option', value: 'value1' },
          { label: 'Option', value: 'value2' },
        ],
      }

      render(
        <CustomSelectWidget {...defaultProps} options={duplicateLabelOptions} />
      )

      const options = screen
        .getByTestId(`select-${defaultProps.id}`)
        .querySelectorAll('option')

      expect(options[1]).toHaveValue('value1')
      expect(options[2]).toHaveValue('value2')
    })
  })
})
