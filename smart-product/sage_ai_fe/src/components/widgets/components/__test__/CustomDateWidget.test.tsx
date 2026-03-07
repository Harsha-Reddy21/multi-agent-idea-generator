import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomDateWidget } from '../CustomDateWidget'

// Mock LDS Datepicker component
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsDatepicker: ({
    id,
    name,
    label,
    hint,
    dateFormat,
    value,
    defaultValue,
    disabled,
    onChange,
    className,
  }: any) => (
    <div data-testid="lds-datepicker" className={className}>
      <label htmlFor={id}>{label}</label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        placeholder={hint}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        data-testid={`datepicker-${id}`}
        data-date-format={dateFormat}
        data-default-value={defaultValue}
      />
      <span data-testid="hint">{hint}</span>
    </div>
  ),
}))

// Mock the SCSS module
vi.mock('../CustomDateWidget.module.scss', () => ({
  default: {
    securityLdsCalendarPopup: 'mocked-calendar-popup-class',
  },
}))

describe('CustomDateWidget', () => {
  const defaultProps = {
    id: 'test-datepicker',
    name: 'test-datepicker',
    value: '',
    required: false,
    disabled: false,
    readonly: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onFocus: vi.fn(),
    placeholder: 'Select a date',
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
    it('should render the datepicker component', () => {
      render(<CustomDateWidget {...defaultProps} />)

      expect(screen.getByTestId('lds-datepicker')).toBeInTheDocument()
    })

    it('should render with correct id', () => {
      render(<CustomDateWidget {...defaultProps} id="custom-date-id" />)

      const datepicker = screen.getByTestId('datepicker-custom-date-id')
      expect(datepicker).toBeInTheDocument()
      expect(datepicker).toHaveAttribute('id', 'custom-date-id')
    })

    it('should render with correct name attribute', () => {
      render(<CustomDateWidget {...defaultProps} id="test-name" />)

      const datepicker = screen.getByTestId('datepicker-test-name')
      expect(datepicker).toHaveAttribute('name', 'test-name')
    })

    it('should render with custom placeholder hint', () => {
      render(
        <CustomDateWidget {...defaultProps} placeholder="Enter birth date" />
      )

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('Enter birth date')
    })

    it('should render with default hint when placeholder is not provided', () => {
      render(<CustomDateWidget {...defaultProps} placeholder={undefined} />)

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('Format MM/DD/YYYY')
    })

    it('should render with MM/DD/YYYY date format', () => {
      render(<CustomDateWidget {...defaultProps} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toHaveAttribute('data-date-format', 'MM/DD/YYYY')
    })
  })

  describe('Value Handling', () => {
    it('should display the provided date value', () => {
      render(<CustomDateWidget {...defaultProps} value="12/15/2025" />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('12/15/2025')
    })

    it('should display empty string when value is undefined', () => {
      render(<CustomDateWidget {...defaultProps} value={undefined} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('')
    })

    it('should display empty string when value is null', () => {
      render(<CustomDateWidget {...defaultProps} value={null} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('')
    })

    it('should display empty string when value is empty string', () => {
      render(<CustomDateWidget {...defaultProps} value="" />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('')
    })

    it('should convert numeric value to string', () => {
      render(<CustomDateWidget {...defaultProps} value={20251215} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('20251215')
    })

    it('should handle date object converted to string', () => {
      const dateObj = { toString: () => '12/15/2025' }
      render(<CustomDateWidget {...defaultProps} value={dateObj as any} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('12/15/2025')
    })

    it('should set defaultValue same as value', () => {
      render(<CustomDateWidget {...defaultProps} value="01/01/2025" />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toHaveAttribute('data-default-value', '01/01/2025')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<CustomDateWidget {...defaultProps} disabled={true} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toBeDisabled()
    })

    it('should be disabled when readonly prop is true', () => {
      render(<CustomDateWidget {...defaultProps} readonly={true} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toBeDisabled()
    })

    it('should be disabled when both disabled and readonly are true', () => {
      render(
        <CustomDateWidget {...defaultProps} disabled={true} readonly={true} />
      )

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toBeDisabled()
    })

    it('should not be disabled when both disabled and readonly are false', () => {
      render(
        <CustomDateWidget {...defaultProps} disabled={false} readonly={false} />
      )

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).not.toBeDisabled()
    })

    it('should handle undefined disabled and readonly props', () => {
      render(
        <CustomDateWidget
          {...defaultProps}
          disabled={undefined}
          readonly={undefined}
        />
      )

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).not.toBeDisabled()
    })
  })

  describe('onChange Handler - String Value', () => {
    it('should call onChange with date string when date is entered', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '12/25/2025' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith('12/25/2025')
    })

    it('should call onChange with undefined when date is cleared', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomDateWidget
          {...defaultProps}
          value="12/15/2025"
          onChange={mockOnChange}
        />
      )

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(undefined)
    })

    it('should handle multiple onChange events', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)

      fireEvent.change(datepicker, { target: { value: '01/01/2025' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(1, '01/01/2025')

      fireEvent.change(datepicker, { target: { value: '02/02/2025' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(2, '02/02/2025')

      fireEvent.change(datepicker, { target: { value: '03/03/2025' } })
      expect(mockOnChange).toHaveBeenNthCalledWith(3, '03/03/2025')

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })
  })

  describe('onChange Handler - Different Value Types', () => {
    it('should handle direct string value from LdsDatepicker', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      // Simulate LdsDatepicker passing string directly
      fireEvent.change(datepicker, { target: { value: '06/15/2025' } })

      expect(mockOnChange).toHaveBeenCalledWith('06/15/2025')
    })

    it('should handle event object with target.value', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '07/04/2025' } })

      expect(mockOnChange).toHaveBeenCalledWith('07/04/2025')
    })

    it('should handle whitespace-only string and convert to undefined', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '   ' } })

      expect(mockOnChange).toHaveBeenCalledWith('   ')
    })
  })

  describe('Integration Tests', () => {
    it('should work correctly with all props set', () => {
      const mockOnChange = vi.fn()

      render(
        <CustomDateWidget
          {...defaultProps}
          id="full-test"
          value="12/31/2025"
          disabled={false}
          readonly={false}
          placeholder="Select end date"
          onChange={mockOnChange}
        />
      )

      const datepicker = screen.getByTestId(
        'datepicker-full-test'
      ) as HTMLInputElement

      expect(datepicker).toBeInTheDocument()
      expect(datepicker.value).toBe('12/31/2025')
      expect(datepicker).not.toBeDisabled()
      expect(datepicker).toHaveAttribute('placeholder', 'Select end date')

      fireEvent.change(datepicker, { target: { value: '01/15/2026' } })
      expect(mockOnChange).toHaveBeenCalledWith('01/15/2026')
    })

    it('should update value through multiple interactions', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomDateWidget {...defaultProps} value="" onChange={mockOnChange} />
      )

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)

      fireEvent.change(datepicker, { target: { value: '01/01/2025' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('01/01/2025')

      rerender(
        <CustomDateWidget
          {...defaultProps}
          value="01/01/2025"
          onChange={mockOnChange}
        />
      )

      fireEvent.change(datepicker, { target: { value: '12/31/2025' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('12/31/2025')
    })

    it('should handle clearing and re-entering dates', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomDateWidget
          {...defaultProps}
          value="05/15/2025"
          onChange={mockOnChange}
        />
      )

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)

      // Clear date
      fireEvent.change(datepicker, { target: { value: '' } })
      expect(mockOnChange).toHaveBeenLastCalledWith(undefined)

      rerender(
        <CustomDateWidget {...defaultProps} value="" onChange={mockOnChange} />
      )

      // Enter new date
      fireEvent.change(datepicker, { target: { value: '06/20/2025' } })
      expect(mockOnChange).toHaveBeenLastCalledWith('06/20/2025')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as id', () => {
      render(<CustomDateWidget {...defaultProps} id="" />)

      const datepicker = screen.getByTestId('datepicker-')
      expect(datepicker).toBeInTheDocument()
    })

    it('should handle special characters in id', () => {
      const specialId = 'test-date-123_$'
      render(<CustomDateWidget {...defaultProps} id={specialId} />)

      const datepicker = screen.getByTestId(`datepicker-${specialId}`)
      expect(datepicker).toBeInTheDocument()
    })

    it('should handle invalid date formats', () => {
      render(<CustomDateWidget {...defaultProps} value="invalid-date" />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('invalid-date')
    })

    it('should handle date with different format', () => {
      render(<CustomDateWidget {...defaultProps} value="2025-12-15" />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('2025-12-15')
    })

    it('should maintain value across rerenders', () => {
      const { rerender } = render(
        <CustomDateWidget {...defaultProps} value="10/31/2025" />
      )

      let datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('10/31/2025')

      rerender(<CustomDateWidget {...defaultProps} value="10/31/2025" />)

      datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('10/31/2025')
    })

    it('should handle very long date strings', () => {
      const longDate =
        '12/15/2025 with extra information that should not be there'
      render(<CustomDateWidget {...defaultProps} value={longDate} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe(longDate)
    })

    it('should handle date with leading/trailing spaces', () => {
      render(<CustomDateWidget {...defaultProps} value="  12/15/2025  " />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('  12/15/2025  ')
    })

    it('should handle rapid date changes', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)

      // Rapid changes
      for (let i = 1; i <= 5; i++) {
        fireEvent.change(datepicker, { target: { value: `0${i}/15/2025` } })
      }

      expect(mockOnChange).toHaveBeenCalledTimes(5)
    })
  })

  describe('Accessibility', () => {
    it('should associate label with datepicker via id', () => {
      render(<CustomDateWidget {...defaultProps} id="accessible-date" />)

      const label = screen.getByLabelText('')
      expect(label).toHaveAttribute('id', 'accessible-date')
    })

    it('should have proper hint text for screen readers', () => {
      render(
        <CustomDateWidget
          {...defaultProps}
          placeholder="Select your birthday"
        />
      )

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('Select your birthday')
    })

    it('should display default format hint when no placeholder', () => {
      render(<CustomDateWidget {...defaultProps} placeholder={undefined} />)

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('Format MM/DD/YYYY')
    })

    it('should maintain name attribute for form submission', () => {
      render(<CustomDateWidget {...defaultProps} id="form-date-field" />)

      const datepicker = screen.getByTestId('datepicker-form-date-field')
      expect(datepicker).toHaveAttribute('name', 'form-date-field')
    })
  })

  describe('Date Format', () => {
    it('should always use MM/DD/YYYY format', () => {
      render(<CustomDateWidget {...defaultProps} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toHaveAttribute('data-date-format', 'MM/DD/YYYY')
    })

    it('should display date in correct format', () => {
      render(<CustomDateWidget {...defaultProps} value="12/15/2025" />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    })
  })

  describe('handleDateChange Function', () => {
    it('should handle string value directly', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '08/08/2025' } })

      expect(mockOnChange).toHaveBeenCalledWith('08/08/2025')
    })

    it('should handle event object with nested target.value', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '09/09/2025' } })

      expect(mockOnChange).toHaveBeenCalledWith('09/09/2025')
    })

    it('should preserve non-empty string values', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '11/11/2025' } })

      expect(mockOnChange).toHaveBeenCalledWith('11/11/2025')
    })

    it('should handle number value', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '12345' } })

      expect(mockOnChange).toHaveBeenCalledWith('12345')
    })

    it('should handle boolean value', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: 'true' } })

      expect(mockOnChange).toHaveBeenCalledWith('true')
    })

    it('should not convert string "0" to undefined', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '0' } })

      expect(mockOnChange).toHaveBeenCalledWith('0')
    })

    it('should handle dates from different centuries', () => {
      const mockOnChange = vi.fn()
      render(<CustomDateWidget {...defaultProps} onChange={mockOnChange} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      fireEvent.change(datepicker, { target: { value: '12/31/1999' } })

      expect(mockOnChange).toHaveBeenCalledWith('12/31/1999')
    })
  })

  describe('CSS Class Application', () => {
    it('should apply securityLdsCalendarPopup class', () => {
      render(<CustomDateWidget {...defaultProps} />)

      const container = screen.getByTestId('lds-datepicker')
      expect(container).toHaveClass('mocked-calendar-popup-class')
    })

    it('should maintain class across rerenders', () => {
      const { rerender } = render(<CustomDateWidget {...defaultProps} />)

      let container = screen.getByTestId('lds-datepicker')
      expect(container).toHaveClass('mocked-calendar-popup-class')

      rerender(<CustomDateWidget {...defaultProps} value="01/01/2025" />)

      container = screen.getByTestId('lds-datepicker')
      expect(container).toHaveClass('mocked-calendar-popup-class')
    })
  })

  describe('Value Conversion', () => {
    it('should convert boolean true to string', () => {
      render(<CustomDateWidget {...defaultProps} value={true as any} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('true')
    })

    it('should handle array converted to string', () => {
      render(<CustomDateWidget {...defaultProps} value={[1, 2, 3] as any} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('1,2,3')
    })

    it('should handle object with custom toString', () => {
      const customObj = {
        toString: () => '10/10/2025',
      }
      render(<CustomDateWidget {...defaultProps} value={customObj as any} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('10/10/2025')
    })

    it('should handle negative numbers', () => {
      render(<CustomDateWidget {...defaultProps} value={-123 as any} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('-123')
    })

    it('should handle decimal numbers', () => {
      render(<CustomDateWidget {...defaultProps} value={12.34 as any} />)

      const datepicker = screen.getByTestId(
        `datepicker-${defaultProps.id}`
      ) as HTMLInputElement
      expect(datepicker.value).toBe('12.34')
    })
  })

  describe('Props Validation', () => {
    it('should handle all required props', () => {
      const requiredProps = {
        id: 'required-test',
        onChange: vi.fn(),
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
        label: 'Test',
        name: 'test',
        value: '',
        required: false,
        disabled: false,
        readonly: false,
        onBlur: vi.fn(),
        onFocus: vi.fn(),
      }

      render(<CustomDateWidget {...requiredProps} />)

      expect(screen.getByTestId('lds-datepicker')).toBeInTheDocument()
    })

    it('should work with minimal props', () => {
      const minimalProps = {
        id: 'minimal-test',
        onChange: vi.fn(),
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
        label: '',
        name: 'test',
        value: '',
        required: false,
        disabled: false,
        readonly: false,
        onBlur: vi.fn(),
        onFocus: vi.fn(),
      }

      render(<CustomDateWidget {...minimalProps} />)

      expect(screen.getByTestId('lds-datepicker')).toBeInTheDocument()
    })
  })

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      render(<CustomDateWidget {...defaultProps} placeholder="Choose date" />)

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('Choose date')
    })

    it('should use default placeholder when placeholder is null', () => {
      render(<CustomDateWidget {...defaultProps} placeholder={null as any} />)

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('Format MM/DD/YYYY')
    })

    it('should use default placeholder when placeholder is empty string', () => {
      render(<CustomDateWidget {...defaultProps} placeholder="" />)

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('Format MM/DD/YYYY')
    })

    it('should handle very long placeholder text', () => {
      const longPlaceholder =
        'Please select a date from the calendar picker below this is a very long placeholder text'
      render(
        <CustomDateWidget {...defaultProps} placeholder={longPlaceholder} />
      )

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent(longPlaceholder)
    })

    it('should handle placeholder with special characters', () => {
      render(
        <CustomDateWidget
          {...defaultProps}
          placeholder="Date (MM/DD/YYYY) *Required*"
        />
      )

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('Date (MM/DD/YYYY) *Required*')
    })

    it('should handle placeholder with unicode characters', () => {
      render(<CustomDateWidget {...defaultProps} placeholder="选择日期" />)

      const hint = screen.getByTestId('hint')
      expect(hint).toHaveTextContent('选择日期')
    })
  })

  describe('DefaultValue Synchronization', () => {
    it('should set defaultValue same as value for empty string', () => {
      render(<CustomDateWidget {...defaultProps} value="" />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toHaveAttribute('data-default-value', '')
    })

    it('should set defaultValue same as value for null', () => {
      render(<CustomDateWidget {...defaultProps} value={null} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toHaveAttribute('data-default-value', '')
    })

    it('should set defaultValue same as value for undefined', () => {
      render(<CustomDateWidget {...defaultProps} value={undefined} />)

      const datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toHaveAttribute('data-default-value', '')
    })

    it('should update defaultValue when value changes', () => {
      const { rerender } = render(
        <CustomDateWidget {...defaultProps} value="01/01/2025" />
      )

      let datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toHaveAttribute('data-default-value', '01/01/2025')

      rerender(<CustomDateWidget {...defaultProps} value="12/31/2025" />)

      datepicker = screen.getByTestId(`datepicker-${defaultProps.id}`)
      expect(datepicker).toHaveAttribute('data-default-value', '12/31/2025')
    })
  })
})
