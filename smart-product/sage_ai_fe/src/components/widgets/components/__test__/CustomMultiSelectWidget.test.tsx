import { WidgetProps } from '@rjsf/utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomMultiSelectWidget } from '../CustomMultiSelectWidget'

// Mock LdsSelect component
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsSelect: ({
    id,
    name,
    label,
    options,
    value,
    disabled,
    onChange,
  }: {
    id: string
    name: string
    label: string
    options: { label: string; value: string }[]
    value: string
    disabled: boolean
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  }) => (
    <div data-testid="lds-select-wrapper">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        data-testid="lds-select"
      >
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}))

describe('CustomMultiSelectWidget', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()
  const mockOnFocus = vi.fn()

  const defaultProps: WidgetProps = {
    id: 'test-multiselect',
    schema: {},
    value: '',
    onChange: mockOnChange,
    onBlur: mockOnBlur,
    onFocus: mockOnFocus,
    options: {
      enumOptions: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    disabled: false,
    readonly: false,
    placeholder: 'Choose an option',
    label: '',
    name: 'test-multiselect',
    formContext: {},
    registry: {} as any,
    required: false,
    uiSchema: {},
    rawErrors: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render LdsSelect with correct props', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      expect(select).toBeDefined()
      expect(select.id).toBe('test-multiselect')
      expect(select.getAttribute('name')).toBe('test-multiselect')
    })

    it('should render with empty label', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const wrapper = screen.getByTestId('lds-select-wrapper')
      const label = wrapper.querySelector('label')
      expect(label?.textContent).toBe('')
    })

    it('should render select element', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      expect(select).toBeDefined()
      expect(select.tagName).toBe('SELECT')
    })

    it('should render with correct id attribute', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      expect(select.id).toBe('test-multiselect')
    })

    it('should render with correct name attribute', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      expect(select.getAttribute('name')).toBe('test-multiselect')
    })

    it('should render with different id values', () => {
      const { rerender } = render(<CustomMultiSelectWidget {...defaultProps} />)

      let select = screen.getByTestId('lds-select')
      expect(select.id).toBe('test-multiselect')

      rerender(
        <CustomMultiSelectWidget {...defaultProps} id="another-select" />
      )
      select = screen.getByTestId('lds-select')
      expect(select.id).toBe('another-select')
    })
  })

  describe('Options Rendering', () => {
    it('should render placeholder as first option', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[0].value).toBe('')
      expect(options[0].textContent).toBe('Choose an option')
    })

    it('should render default placeholder when not provided', () => {
      const props = { ...defaultProps }
      delete props.placeholder

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[0].value).toBe('')
      expect(options[0].textContent).toBe('Select...')
    })

    it('should render all enumOptions', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      // 1 placeholder + 3 options
      expect(options.length).toBe(4)
      expect(options[1].value).toBe('option1')
      expect(options[1].textContent).toBe('Option 1')
      expect(options[2].value).toBe('option2')
      expect(options[2].textContent).toBe('Option 2')
      expect(options[3].value).toBe('option3')
      expect(options[3].textContent).toBe('Option 3')
    })

    it('should handle empty enumOptions', () => {
      const props = {
        ...defaultProps,
        options: { enumOptions: [] },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      // Only placeholder
      expect(options.length).toBe(1)
      expect(options[0].value).toBe('')
    })

    it('should handle undefined enumOptions', () => {
      const props = {
        ...defaultProps,
        options: { enumOptions: undefined },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      // Only placeholder
      expect(options.length).toBe(1)
      expect(options[0].value).toBe('')
    })

    it('should render options with special characters in labels', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'opt1', label: 'Option & <Special>' },
            { value: 'opt2', label: 'Option "Quoted"' },
            { value: 'opt3', label: "Option 'Single'" },
          ],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[1].textContent).toBe('Option & <Special>')
      expect(options[2].textContent).toBe('Option "Quoted"')
      expect(options[3].textContent).toBe("Option 'Single'")
    })

    it('should render options with special characters in values', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'value-with-dash', label: 'Dashed' },
            { value: 'value_with_underscore', label: 'Underscored' },
            { value: 'value.with.dots', label: 'Dotted' },
          ],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[1].value).toBe('value-with-dash')
      expect(options[2].value).toBe('value_with_underscore')
      expect(options[3].value).toBe('value.with.dots')
    })

    it('should render options with numeric values as strings', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: '1', label: 'One' },
            { value: '2', label: 'Two' },
            { value: '100', label: 'Hundred' },
          ],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[1].value).toBe('1')
      expect(options[2].value).toBe('2')
      expect(options[3].value).toBe('100')
    })

    it('should render options with very long labels', () => {
      const longLabel = 'A'.repeat(200)
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [{ value: 'long', label: longLabel }],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[1].textContent).toBe(longLabel)
    })

    it('should handle dynamic option changes', () => {
      const { rerender } = render(<CustomMultiSelectWidget {...defaultProps} />)

      let select = screen.getByTestId('lds-select')
      let options = Array.from(select.querySelectorAll('option'))
      expect(options.length).toBe(4) // 1 placeholder + 3 options

      const newProps = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'new1', label: 'New Option 1' },
            { value: 'new2', label: 'New Option 2' },
          ],
        },
      }

      rerender(<CustomMultiSelectWidget {...newProps} />)

      select = screen.getByTestId('lds-select')
      options = Array.from(select.querySelectorAll('option'))
      expect(options.length).toBe(3) // 1 placeholder + 2 options
      expect(options[1].value).toBe('new1')
      expect(options[2].value).toBe('new2')
    })
  })

  describe('Value Handling', () => {
    it('should render with provided value', () => {
      const props = { ...defaultProps, value: 'option2' }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('option2')
    })

    it('should convert undefined value to empty string', () => {
      const props = { ...defaultProps, value: undefined }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('')
    })

    it('should convert null value to empty string', () => {
      const props = { ...defaultProps, value: null }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('')
    })

    it('should handle empty string value', () => {
      const props = { ...defaultProps, value: '' }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('')
    })

    it('should handle numeric string values', () => {
      const props = {
        ...defaultProps,
        value: '123',
        options: {
          enumOptions: [{ value: '123', label: 'One Two Three' }],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('123')
    })

    it('should handle value changes', () => {
      const { rerender } = render(
        <CustomMultiSelectWidget {...defaultProps} value="option1" />
      )

      let select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('option1')

      rerender(<CustomMultiSelectWidget {...defaultProps} value="option3" />)

      select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('option3')
    })

    it('should handle value change from empty to selected', () => {
      const { rerender } = render(
        <CustomMultiSelectWidget {...defaultProps} value="" />
      )

      let select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('')

      rerender(<CustomMultiSelectWidget {...defaultProps} value="option2" />)

      select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('option2')
    })

    it('should handle value change from selected to empty', () => {
      const { rerender } = render(
        <CustomMultiSelectWidget {...defaultProps} value="option2" />
      )

      let select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('option2')

      rerender(<CustomMultiSelectWidget {...defaultProps} value="" />)

      select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      const props = { ...defaultProps, disabled: true }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(true)
    })

    it('should be disabled when readonly prop is true', () => {
      const props = { ...defaultProps, readonly: true }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(true)
    })

    it('should be disabled when both disabled and readonly are true', () => {
      const props = { ...defaultProps, disabled: true, readonly: true }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(true)
    })

    it('should not be disabled when both disabled and readonly are false', () => {
      const props = { ...defaultProps, disabled: false, readonly: false }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(false)
    })

    it('should toggle disabled state dynamically', () => {
      const { rerender } = render(
        <CustomMultiSelectWidget {...defaultProps} disabled={false} />
      )

      let select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(false)

      rerender(<CustomMultiSelectWidget {...defaultProps} disabled={true} />)

      select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(true)
    })

    it('should toggle readonly state dynamically', () => {
      const { rerender } = render(
        <CustomMultiSelectWidget {...defaultProps} readonly={false} />
      )

      let select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(false)

      rerender(<CustomMultiSelectWidget {...defaultProps} readonly={true} />)

      select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(true)
    })
  })

  describe('onChange Handler', () => {
    it('should call onChange with selected value when option is selected', async () => {
      const user = userEvent.setup()
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      await user.selectOptions(select, 'option2')

      expect(mockOnChange).toHaveBeenCalledWith('option2')
    })

    it('should call onChange with undefined when empty option is selected', async () => {
      const user = userEvent.setup()
      render(<CustomMultiSelectWidget {...defaultProps} value="option1" />)

      const select = screen.getByTestId('lds-select')
      await user.selectOptions(select, '')

      expect(mockOnChange).toHaveBeenCalledWith(undefined)
    })

    it('should call onChange multiple times for multiple selections', async () => {
      const user = userEvent.setup()
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')

      await user.selectOptions(select, 'option1')
      expect(mockOnChange).toHaveBeenCalledWith('option1')

      await user.selectOptions(select, 'option2')
      expect(mockOnChange).toHaveBeenCalledWith('option2')

      await user.selectOptions(select, 'option3')
      expect(mockOnChange).toHaveBeenCalledWith('option3')

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })

    it('should call onChange with numeric string value', async () => {
      const user = userEvent.setup()
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: '1', label: 'One' },
            { value: '2', label: 'Two' },
          ],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      await user.selectOptions(select, '2')

      expect(mockOnChange).toHaveBeenCalledWith('2')
    })

    it('should call onChange with special character value', async () => {
      const user = userEvent.setup()
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [{ value: 'value-with-dash', label: 'Dashed Value' }],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      await user.selectOptions(select, 'value-with-dash')

      expect(mockOnChange).toHaveBeenCalledWith('value-with-dash')
    })

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup()
      render(<CustomMultiSelectWidget {...defaultProps} disabled={true} />)

      const select = screen.getByTestId('lds-select')

      // Attempting to interact with disabled select should not trigger onChange
      try {
        await user.selectOptions(select, 'option1')
      } catch {
        // Expected to fail with disabled select
      }

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not call onChange when readonly', async () => {
      const user = userEvent.setup()
      render(<CustomMultiSelectWidget {...defaultProps} readonly={true} />)

      const select = screen.getByTestId('lds-select')

      // Attempting to interact with readonly (disabled) select should not trigger onChange
      try {
        await user.selectOptions(select, 'option1')
      } catch {
        // Expected to fail with disabled select
      }

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('should work with all props provided', async () => {
      const user = userEvent.setup()
      const props = {
        ...defaultProps,
        id: 'full-test-select',
        value: 'option1',
        disabled: false,
        readonly: false,
        placeholder: 'Custom placeholder',
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement

      expect(select.id).toBe('full-test-select')
      expect(select.value).toBe('option1')
      expect(select.disabled).toBe(false)

      const options = Array.from(select.querySelectorAll('option'))
      expect(options[0].textContent).toBe('Custom placeholder')

      await user.selectOptions(select, 'option3')
      expect(mockOnChange).toHaveBeenCalledWith('option3')
    })

    it('should maintain option structure when value changes', () => {
      const { rerender } = render(
        <CustomMultiSelectWidget {...defaultProps} value="" />
      )

      let select = screen.getByTestId('lds-select')
      let options = Array.from(select.querySelectorAll('option'))
      const initialOptionsCount = options.length

      rerender(<CustomMultiSelectWidget {...defaultProps} value="option2" />)

      select = screen.getByTestId('lds-select')
      options = Array.from(select.querySelectorAll('option'))

      expect(options.length).toBe(initialOptionsCount)
      expect(options[1].value).toBe('option1')
      expect(options[2].value).toBe('option2')
      expect(options[3].value).toBe('option3')
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(
        <CustomMultiSelectWidget {...defaultProps} value="option1" />
      )

      rerender(<CustomMultiSelectWidget {...defaultProps} value="option2" />)
      rerender(<CustomMultiSelectWidget {...defaultProps} value="option3" />)
      rerender(<CustomMultiSelectWidget {...defaultProps} value="" />)
      rerender(<CustomMultiSelectWidget {...defaultProps} value="option1" />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.value).toBe('option1')
    })
  })

  describe('Edge Cases', () => {
    it('should handle options with duplicate labels', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'val1', label: 'Same Label' },
            { value: 'val2', label: 'Same Label' },
            { value: 'val3', label: 'Same Label' },
          ],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options.length).toBe(4) // placeholder + 3 options
      expect(options[1].value).toBe('val1')
      expect(options[2].value).toBe('val2')
      expect(options[3].value).toBe('val3')
      expect(options[1].textContent).toBe('Same Label')
      expect(options[2].textContent).toBe('Same Label')
      expect(options[3].textContent).toBe('Same Label')
    })

    it('should handle options with empty labels', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'val1', label: '' },
            { value: 'val2', label: '' },
          ],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[1].textContent).toBe('')
      expect(options[2].textContent).toBe('')
    })

    it('should handle options with whitespace labels', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'val1', label: '   ' },
            { value: 'val2', label: '\t\n' },
          ],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[1].textContent).toBe('   ')
      expect(options[2].textContent).toBe('\t\n')
    })

    it('should handle very long placeholder text', () => {
      const longPlaceholder = 'A'.repeat(500)
      const props = { ...defaultProps, placeholder: longPlaceholder }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[0].textContent).toBe(longPlaceholder)
    })

    it('should handle single option in enumOptions', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [{ value: 'only', label: 'Only Option' }],
        },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options.length).toBe(2) // placeholder + 1 option
      expect(options[1].value).toBe('only')
      expect(options[1].textContent).toBe('Only Option')
    })

    it('should handle large number of options', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }))

      const props = {
        ...defaultProps,
        options: { enumOptions: manyOptions },
      }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options.length).toBe(101) // placeholder + 100 options
    })
  })

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      const props = { ...defaultProps, placeholder: 'Pick one' }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[0].textContent).toBe('Pick one')
    })

    it('should use undefined placeholder (default "Select...")', () => {
      const props = { ...defaultProps, placeholder: undefined }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[0].textContent).toBe('Select...')
    })

    it('should handle placeholder with special characters', () => {
      const props = { ...defaultProps, placeholder: 'Select & Choose <Option>' }

      render(<CustomMultiSelectWidget {...props} />)

      const select = screen.getByTestId('lds-select')
      const options = Array.from(select.querySelectorAll('option'))

      expect(options[0].textContent).toBe('Select & Choose <Option>')
    })
  })

  describe('Accessibility', () => {
    it('should have correct id for label association', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      const wrapper = screen.getByTestId('lds-select-wrapper')
      const label = wrapper.querySelector('label')

      expect(label?.getAttribute('for')).toBe('test-multiselect')
      expect(select.id).toBe('test-multiselect')
    })

    it('should have correct name attribute for form submission', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select')
      expect(select.getAttribute('name')).toBe('test-multiselect')
    })

    it('should be keyboard navigable when not disabled', () => {
      render(<CustomMultiSelectWidget {...defaultProps} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(false)
      expect(select.tagName).toBe('SELECT')
    })

    it('should not be keyboard navigable when disabled', () => {
      render(<CustomMultiSelectWidget {...defaultProps} disabled={true} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(true)
    })

    it('should not be keyboard navigable when readonly', () => {
      render(<CustomMultiSelectWidget {...defaultProps} readonly={true} />)

      const select = screen.getByTestId('lds-select') as HTMLSelectElement
      expect(select.disabled).toBe(true)
    })
  })
})
