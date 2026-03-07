import { WidgetProps } from '@rjsf/utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomRadioWidget } from '../CustomRadioWidget'

// Mock LDS Radio components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsRadioGroup: ({
    children,
    indent,
    densityClass,
    label,
  }: {
    children: React.ReactNode
    indent: boolean
    densityClass: string
    label: string
  }) => (
    <div
      data-testid="lds-radio-group"
      data-indent={indent}
      data-density-class={densityClass}
      role="radiogroup"
      aria-label={label}
    >
      {children}
    </div>
  ),
  LdsRadio: ({
    id,
    name,
    value,
    label,
    checked,
    disabled,
    onChange,
  }: {
    id: string
    name: string
    value: string
    label: string
    checked: boolean
    disabled: boolean
    onChange: () => void
  }) => (
    <label data-testid={`radio-${value}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        data-testid={`radio-input-${value}`}
      />
      <span>{label}</span>
    </label>
  ),
}))

// Mock useFieldPreselection hook
vi.mock('../../hooks/useFieldPreselection', () => ({
  useFieldPreselection: vi.fn(),
}))

import { useFieldPreselection } from '../../hooks/useFieldPreselection'

const mockUseFieldPreselection = vi.mocked(useFieldPreselection)

describe('CustomRadioWidget', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()
  const mockOnFocus = vi.fn()

  const defaultProps: WidgetProps = {
    id: 'test-radio',
    schema: { enum: ['option1', 'option2', 'option3'] },
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
    label: '',
    name: 'test-radio',
    formContext: { formStatus: 'draft' },
    registry: {} as any,
    required: false,
    uiSchema: {},
    rawErrors: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render LdsRadioGroup with correct props', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup).toBeDefined()
      expect(radioGroup.getAttribute('data-indent')).toBe('true')
      expect(radioGroup.getAttribute('data-density-class')).toBe('medium')
      expect(radioGroup.getAttribute('aria-label')).toBe('')
    })

    it('should render all radio options from enumOptions', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const radio1 = screen.getByTestId('radio-option1')
      const radio2 = screen.getByTestId('radio-option2')
      const radio3 = screen.getByTestId('radio-option3')

      expect(radio1).toBeDefined()
      expect(radio2).toBeDefined()
      expect(radio3).toBeDefined()
    })

    it('should render radio options with correct labels', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const radio1 = screen.getByTestId('radio-option1')
      const radio2 = screen.getByTestId('radio-option2')
      const radio3 = screen.getByTestId('radio-option3')

      expect(radio1.textContent).toBe('Option 1')
      expect(radio2.textContent).toBe('Option 2')
      expect(radio3.textContent).toBe('Option 3')
    })

    it('should render radio inputs with correct id format', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.id).toBe('test-radio-option1')
      expect(input2.id).toBe('test-radio-option2')
      expect(input3.id).toBe('test-radio-option3')
    })

    it('should render radio inputs with correct name attribute', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.name).toBe('test-radio')
      expect(input2.name).toBe('test-radio')
      expect(input3.name).toBe('test-radio')
    })

    it('should render radio inputs with correct values', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.value).toBe('option1')
      expect(input2.value).toBe('option2')
      expect(input3.value).toBe('option3')
    })

    it('should render with different id values', () => {
      const { rerender } = render(<CustomRadioWidget {...defaultProps} />)

      let input1 = screen.getByTestId('radio-input-option1') as HTMLInputElement
      expect(input1.id).toBe('test-radio-option1')

      rerender(<CustomRadioWidget {...defaultProps} id="another-radio" />)

      input1 = screen.getByTestId('radio-input-option1') as HTMLInputElement
      expect(input1.id).toBe('another-radio-option1')
    })

    it('should render empty radio group when enumOptions is undefined', () => {
      const props = {
        ...defaultProps,
        options: { enumOptions: undefined },
      }

      render(<CustomRadioWidget {...props} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup).toBeDefined()
      expect(radioGroup.children.length).toBe(0)
    })

    it('should render empty radio group when enumOptions is empty array', () => {
      const props = {
        ...defaultProps,
        options: { enumOptions: [] },
      }

      render(<CustomRadioWidget {...props} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup).toBeDefined()
      expect(radioGroup.children.length).toBe(0)
    })
  })

  describe('Checked State', () => {
    it('should check the radio button matching the value', () => {
      const props = { ...defaultProps, value: 'option2' }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.checked).toBe(false)
      expect(input2.checked).toBe(true)
      expect(input3.checked).toBe(false)
    })

    it('should not check any radio button when value is empty', () => {
      const props = { ...defaultProps, value: '' }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.checked).toBe(false)
      expect(input2.checked).toBe(false)
      expect(input3.checked).toBe(false)
    })

    it('should not check any radio button when value is undefined', () => {
      const props = { ...defaultProps, value: undefined }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.checked).toBe(false)
      expect(input2.checked).toBe(false)
      expect(input3.checked).toBe(false)
    })

    it('should not check any radio button when value is null', () => {
      const props = { ...defaultProps, value: null }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.checked).toBe(false)
      expect(input2.checked).toBe(false)
      expect(input3.checked).toBe(false)
    })

    it('should update checked state when value changes', () => {
      const { rerender } = render(
        <CustomRadioWidget {...defaultProps} value="option1" />
      )

      let input1 = screen.getByTestId('radio-input-option1') as HTMLInputElement
      let input2 = screen.getByTestId('radio-input-option2') as HTMLInputElement

      expect(input1.checked).toBe(true)
      expect(input2.checked).toBe(false)

      rerender(<CustomRadioWidget {...defaultProps} value="option2" />)

      input1 = screen.getByTestId('radio-input-option1') as HTMLInputElement
      input2 = screen.getByTestId('radio-input-option2') as HTMLInputElement

      expect(input1.checked).toBe(false)
      expect(input2.checked).toBe(true)
    })

    it('should handle value that does not match any option', () => {
      const props = { ...defaultProps, value: 'nonexistent' }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.checked).toBe(false)
      expect(input2.checked).toBe(false)
      expect(input3.checked).toBe(false)
    })

    it('should check first option when value matches', () => {
      const props = { ...defaultProps, value: 'option1' }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      expect(input1.checked).toBe(true)
    })

    it('should check last option when value matches', () => {
      const props = { ...defaultProps, value: 'option3' }

      render(<CustomRadioWidget {...props} />)

      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement
      expect(input3.checked).toBe(true)
    })
  })

  describe('Disabled State', () => {
    it('should disable all radio buttons when disabled is true', () => {
      const props = { ...defaultProps, disabled: true }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.disabled).toBe(true)
      expect(input2.disabled).toBe(true)
      expect(input3.disabled).toBe(true)
    })

    it('should disable all radio buttons when readonly is true', () => {
      const props = { ...defaultProps, readonly: true }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.disabled).toBe(true)
      expect(input2.disabled).toBe(true)
      expect(input3.disabled).toBe(true)
    })

    it('should disable all radio buttons when both disabled and readonly are true', () => {
      const props = { ...defaultProps, disabled: true, readonly: true }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.disabled).toBe(true)
      expect(input2.disabled).toBe(true)
      expect(input3.disabled).toBe(true)
    })

    it('should not disable radio buttons when both disabled and readonly are false', () => {
      const props = { ...defaultProps, disabled: false, readonly: false }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.disabled).toBe(false)
      expect(input2.disabled).toBe(false)
      expect(input3.disabled).toBe(false)
    })

    it('should toggle disabled state dynamically', () => {
      const { rerender } = render(
        <CustomRadioWidget {...defaultProps} disabled={false} />
      )

      let input1 = screen.getByTestId('radio-input-option1') as HTMLInputElement
      expect(input1.disabled).toBe(false)

      rerender(<CustomRadioWidget {...defaultProps} disabled={true} />)

      input1 = screen.getByTestId('radio-input-option1') as HTMLInputElement
      expect(input1.disabled).toBe(true)
    })

    it('should toggle readonly state dynamically', () => {
      const { rerender } = render(
        <CustomRadioWidget {...defaultProps} readonly={false} />
      )

      let input1 = screen.getByTestId('radio-input-option1') as HTMLInputElement
      expect(input1.disabled).toBe(false)

      rerender(<CustomRadioWidget {...defaultProps} readonly={true} />)

      input1 = screen.getByTestId('radio-input-option1') as HTMLInputElement
      expect(input1.disabled).toBe(true)
    })
  })

  describe('onChange Handler', () => {
    it('should call onChange with selected value when radio is clicked', async () => {
      const user = userEvent.setup()
      render(<CustomRadioWidget {...defaultProps} />)

      const input2 = screen.getByTestId('radio-input-option2')
      await user.click(input2)

      expect(mockOnChange).toHaveBeenCalledWith('option2')
    })

    it('should call onChange with correct value for each radio option', async () => {
      const user = userEvent.setup()
      render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId('radio-input-option1')
      await user.click(input1)
      expect(mockOnChange).toHaveBeenCalledWith('option1')

      const input2 = screen.getByTestId('radio-input-option2')
      await user.click(input2)
      expect(mockOnChange).toHaveBeenCalledWith('option2')

      const input3 = screen.getByTestId('radio-input-option3')
      await user.click(input3)
      expect(mockOnChange).toHaveBeenCalledWith('option3')

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })

    it('should call onChange when switching between options', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <CustomRadioWidget {...defaultProps} value="option1" />
      )

      const input2 = screen.getByTestId('radio-input-option2')
      await user.click(input2)

      expect(mockOnChange).toHaveBeenCalledWith('option2')

      rerender(<CustomRadioWidget {...defaultProps} value="option2" />)

      const input3 = screen.getByTestId('radio-input-option3')
      await user.click(input3)

      expect(mockOnChange).toHaveBeenCalledWith('option3')
      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })

    it('should not call onChange when disabled radio is clicked', async () => {
      const user = userEvent.setup()
      render(<CustomRadioWidget {...defaultProps} disabled={true} />)

      const input1 = screen.getByTestId('radio-input-option1')

      try {
        await user.click(input1)
      } catch {
        // Expected to fail with disabled input
      }

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not call onChange when readonly radio is clicked', async () => {
      const user = userEvent.setup()
      render(<CustomRadioWidget {...defaultProps} readonly={true} />)

      const input1 = screen.getByTestId('radio-input-option1')

      try {
        await user.click(input1)
      } catch {
        // Expected to fail with disabled input
      }

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should call onChange when clicking unselected radio', async () => {
      const user = userEvent.setup()
      render(<CustomRadioWidget {...defaultProps} value="option1" />)

      const input2 = screen.getByTestId('radio-input-option2')
      await user.click(input2)

      expect(mockOnChange).toHaveBeenCalledWith('option2')
    })

    it('should handle onChange with special character values', async () => {
      const user = userEvent.setup()
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'value-with-dash', label: 'Dashed' },
            { value: 'value_with_underscore', label: 'Underscored' },
          ],
        },
      }

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId('radio-input-value-with-dash')
      await user.click(input1)
      expect(mockOnChange).toHaveBeenCalledWith('value-with-dash')

      const input2 = screen.getByTestId('radio-input-value_with_underscore')
      await user.click(input2)
      expect(mockOnChange).toHaveBeenCalledWith('value_with_underscore')
    })

    it('should handle onChange with numeric string values', async () => {
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

      render(<CustomRadioWidget {...props} />)

      const input1 = screen.getByTestId('radio-input-1')
      await user.click(input1)
      expect(mockOnChange).toHaveBeenCalledWith('1')
    })
  })

  describe('useFieldPreselection Hook Integration', () => {
    it('should call useFieldPreselection with correct parameters', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith({
        value: '',
        selectedValue: undefined,
        enumValues: ['option1', 'option2', 'option3'],
        formStatus: 'draft',
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      })
    })

    it('should call useFieldPreselection with selectedValue from uiSchema', () => {
      const props = {
        ...defaultProps,
        uiSchema: {
          'ui:options': {
            selectedValue: 'option2',
          },
        },
      }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith({
        value: '',
        selectedValue: 'option2',
        enumValues: ['option1', 'option2', 'option3'],
        formStatus: 'draft',
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      })
    })

    it('should call useFieldPreselection with current value', () => {
      const props = { ...defaultProps, value: 'option1' }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith({
        value: 'option1',
        selectedValue: undefined,
        enumValues: ['option1', 'option2', 'option3'],
        formStatus: 'draft',
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      })
    })

    it('should call useFieldPreselection with enumValues from schema', () => {
      const props = {
        ...defaultProps,
        schema: { enum: ['val1', 'val2'] },
      }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith({
        value: '',
        selectedValue: undefined,
        enumValues: ['val1', 'val2'],
        formStatus: 'draft',
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      })
    })

    it('should call useFieldPreselection with formStatus from formContext', () => {
      const props = {
        ...defaultProps,
        formContext: { formStatus: 'submitted' },
      }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith(
        expect.objectContaining({
          formStatus: 'submitted',
        })
      )
    })

    it('should call useFieldPreselection with disabled state', () => {
      const props = { ...defaultProps, disabled: true }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
        })
      )
    })

    it('should call useFieldPreselection with readonly state', () => {
      const props = { ...defaultProps, readonly: true }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith(
        expect.objectContaining({
          readonly: true,
        })
      )
    })

    it('should call useFieldPreselection when value changes', () => {
      const { rerender } = render(
        <CustomRadioWidget {...defaultProps} value="" />
      )

      expect(mockUseFieldPreselection).toHaveBeenCalledWith(
        expect.objectContaining({
          value: '',
        })
      )

      rerender(<CustomRadioWidget {...defaultProps} value="option2" />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'option2',
        })
      )
    })

    it('should handle undefined uiSchema gracefully', () => {
      const props = {
        ...defaultProps,
        uiSchema: undefined,
      }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedValue: undefined,
        })
      )
    })

    it('should handle undefined schema.enum gracefully', () => {
      const props = {
        ...defaultProps,
        schema: {},
      }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith(
        expect.objectContaining({
          enumValues: undefined,
        })
      )
    })

    it('should handle undefined formContext gracefully', () => {
      const props = {
        ...defaultProps,
        formContext: undefined,
      }

      render(<CustomRadioWidget {...props} />)

      expect(mockUseFieldPreselection).toHaveBeenCalledWith(
        expect.objectContaining({
          formStatus: undefined,
        })
      )
    })
  })

  describe('Key Generation', () => {
    it('should generate unique keys for each radio option', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      const radios = Array.from(
        radioGroup.querySelectorAll('label[data-testid^="radio-"]')
      )

      expect(radios.length).toBe(3)
      expect(radios[0].getAttribute('data-testid')).toBe('radio-option1')
      expect(radios[1].getAttribute('data-testid')).toBe('radio-option2')
      expect(radios[2].getAttribute('data-testid')).toBe('radio-option3')
    })

    it('should include index in key generation', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'same', label: 'First' },
            { value: 'same', label: 'Second' },
          ],
        },
      }

      render(<CustomRadioWidget {...props} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup.children.length).toBe(2)
    })
  })

  describe('Integration Tests', () => {
    it('should work with complete workflow - select and update', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId('radio-input-option1')
      await user.click(input1)
      expect(mockOnChange).toHaveBeenCalledWith('option1')

      rerender(<CustomRadioWidget {...defaultProps} value="option1" />)

      let checkedInput = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      expect(checkedInput.checked).toBe(true)

      const input2 = screen.getByTestId('radio-input-option2')
      await user.click(input2)
      expect(mockOnChange).toHaveBeenCalledWith('option2')

      rerender(<CustomRadioWidget {...defaultProps} value="option2" />)

      checkedInput = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      expect(checkedInput.checked).toBe(true)
    })

    it('should maintain radio group structure with all props', () => {
      const props = {
        ...defaultProps,
        id: 'custom-radio',
        value: 'option2',
        disabled: false,
        uiSchema: { 'ui:options': { selectedValue: 'option1' } },
        formContext: { formStatus: 'draft' },
      }

      render(<CustomRadioWidget {...props} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup).toBeDefined()

      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      expect(input2.checked).toBe(true)
      expect(input2.id).toBe('custom-radio-option2')
      expect(input2.name).toBe('custom-radio')
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(
        <CustomRadioWidget {...defaultProps} value="option1" />
      )

      rerender(<CustomRadioWidget {...defaultProps} value="option2" />)
      rerender(<CustomRadioWidget {...defaultProps} value="option3" />)
      rerender(<CustomRadioWidget {...defaultProps} value="option1" />)
      rerender(<CustomRadioWidget {...defaultProps} value="" />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.checked).toBe(false)
      expect(input2.checked).toBe(false)
      expect(input3.checked).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle options with special characters in labels', () => {
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

      render(<CustomRadioWidget {...props} />)

      const radio1 = screen.getByTestId('radio-opt1')
      const radio2 = screen.getByTestId('radio-opt2')
      const radio3 = screen.getByTestId('radio-opt3')

      expect(radio1.textContent).toBe('Option & <Special>')
      expect(radio2.textContent).toBe('Option "Quoted"')
      expect(radio3.textContent).toBe("Option 'Single'")
    })

    it('should handle options with very long labels', () => {
      const longLabel = 'A'.repeat(500)
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [{ value: 'long', label: longLabel }],
        },
      }

      render(<CustomRadioWidget {...props} />)

      const radio = screen.getByTestId('radio-long')
      expect(radio.textContent).toBe(longLabel)
    })

    it('should handle single option in enumOptions', () => {
      const props = {
        ...defaultProps,
        options: {
          enumOptions: [{ value: 'only', label: 'Only Option' }],
        },
      }

      render(<CustomRadioWidget {...props} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup.children.length).toBe(1)

      const radio = screen.getByTestId('radio-only')
      expect(radio).toBeDefined()
    })

    it('should handle large number of options', () => {
      const manyOptions = Array.from({ length: 50 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }))

      const props = {
        ...defaultProps,
        options: { enumOptions: manyOptions },
      }

      render(<CustomRadioWidget {...props} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup.children.length).toBe(50)
    })

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

      render(<CustomRadioWidget {...props} />)

      const radio1 = screen.getByTestId('radio-val1')
      const radio2 = screen.getByTestId('radio-val2')
      const radio3 = screen.getByTestId('radio-val3')

      expect(radio1.textContent).toBe('Same Label')
      expect(radio2.textContent).toBe('Same Label')
      expect(radio3.textContent).toBe('Same Label')

      const input1 = screen.getByTestId('radio-input-val1') as HTMLInputElement
      const input2 = screen.getByTestId('radio-input-val2') as HTMLInputElement

      expect(input1.value).toBe('val1')
      expect(input2.value).toBe('val2')
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

      render(<CustomRadioWidget {...props} />)

      const radio1 = screen.getByTestId('radio-val1')
      const radio2 = screen.getByTestId('radio-val2')

      expect(radio1.textContent).toBe('')
      expect(radio2.textContent).toBe('')
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

      render(<CustomRadioWidget {...props} />)

      const radio1 = screen.getByTestId('radio-val1')
      const radio2 = screen.getByTestId('radio-val2')

      expect(radio1.textContent).toBe('   ')
      expect(radio2.textContent).toBe('\t\n')
    })

    it('should handle dynamic option changes', () => {
      const { rerender } = render(<CustomRadioWidget {...defaultProps} />)

      let radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup.children.length).toBe(3)

      const newProps = {
        ...defaultProps,
        options: {
          enumOptions: [
            { value: 'new1', label: 'New Option 1' },
            { value: 'new2', label: 'New Option 2' },
          ],
        },
      }

      rerender(<CustomRadioWidget {...newProps} />)

      radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup.children.length).toBe(2)

      const radio1 = screen.getByTestId('radio-new1')
      const radio2 = screen.getByTestId('radio-new2')

      expect(radio1).toBeDefined()
      expect(radio2).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('should have radiogroup role on LdsRadioGroup', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const radioGroup = screen.getByTestId('lds-radio-group')
      expect(radioGroup.getAttribute('role')).toBe('radiogroup')
    })

    it('should have radio type for all inputs', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.type).toBe('radio')
      expect(input2.type).toBe('radio')
      expect(input3.type).toBe('radio')
    })

    it('should group radios with same name attribute', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      expect(input1.name).toBe('test-radio')
      expect(input2.name).toBe('test-radio')
      expect(input3.name).toBe('test-radio')
    })

    it('should have unique ids for each radio input', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      const input2 = screen.getByTestId(
        'radio-input-option2'
      ) as HTMLInputElement
      const input3 = screen.getByTestId(
        'radio-input-option3'
      ) as HTMLInputElement

      const ids = [input1.id, input2.id, input3.id]
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(3)
    })

    it('should be keyboard navigable when not disabled', () => {
      render(<CustomRadioWidget {...defaultProps} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      expect(input1.disabled).toBe(false)
      expect(input1.type).toBe('radio')
    })

    it('should not be keyboard navigable when disabled', () => {
      render(<CustomRadioWidget {...defaultProps} disabled={true} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      expect(input1.disabled).toBe(true)
    })

    it('should not be keyboard navigable when readonly', () => {
      render(<CustomRadioWidget {...defaultProps} readonly={true} />)

      const input1 = screen.getByTestId(
        'radio-input-option1'
      ) as HTMLInputElement
      expect(input1.disabled).toBe(true)
    })
  })
})
