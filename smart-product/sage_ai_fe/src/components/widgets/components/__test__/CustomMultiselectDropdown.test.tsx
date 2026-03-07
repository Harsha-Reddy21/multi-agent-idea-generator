import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomMultiselectDropdown } from '../CustomMultiselectDropdown'

// Mock LDS Icon component
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsIcon: ({ name, inline, className }: any) => (
    <span
      data-testid={`lds-icon-${name}`}
      data-inline={inline?.toString()}
      className={className}
    >
      {name}
    </span>
  ),
}))

// Mock the SCSS module
vi.mock('../CustomMultiselectDropdown.module.scss', () => ({
  default: {
    multiselectDropdown: 'mocked-multiselect-dropdown',
    multiselectCloseIcon: 'mocked-multiselect-close-icon',
  },
}))

// Mock multiselect-react-dropdown
vi.mock('multiselect-react-dropdown', () => ({
  default: ({
    options,
    selectedValues,
    onSelect,
    onRemove,
    displayValue,
    placeholder,
    disable,
    showCheckbox,
    customCloseIcon,
    hidePlaceholder,
    avoidHighlightFirstOption,
  }: any) => (
    <div data-testid="multiselect-dropdown">
      <div data-testid="multiselect-placeholder">{placeholder}</div>
      <div data-testid="multiselect-display-value">{displayValue}</div>
      <div data-testid="multiselect-disabled">{disable?.toString()}</div>
      <div data-testid="multiselect-show-checkbox">
        {showCheckbox?.toString()}
      </div>
      <div data-testid="multiselect-hide-placeholder">
        {hidePlaceholder?.toString()}
      </div>
      <div data-testid="multiselect-avoid-highlight">
        {avoidHighlightFirstOption?.toString()}
      </div>
      <div data-testid="multiselect-custom-close-icon">{customCloseIcon}</div>
      <div data-testid="multiselect-options-count">{options?.length || 0}</div>
      <div data-testid="multiselect-selected-count">
        {selectedValues?.length || 0}
      </div>

      {/* Render options */}
      <div data-testid="multiselect-options-list">
        {options?.map((option: any) => (
          <div
            key={option.id}
            data-testid={`option-${option.id}`}
            onClick={() => {
              const newSelected = [...selectedValues, option]
              onSelect(newSelected)
            }}
          >
            {option.name}
          </div>
        ))}
      </div>

      {/* Render selected values */}
      <div data-testid="multiselect-selected-list">
        {selectedValues?.map((selected: any) => (
          <div key={selected.id} data-testid={`selected-${selected.id}`}>
            <span>{selected.name}</span>
            <button
              data-testid={`remove-${selected.id}`}
              onClick={() => {
                const newSelected = selectedValues.filter(
                  (s: any) => s.id !== selected.id
                )
                onRemove(newSelected)
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  ),
}))

describe('CustomMultiselectDropdown', () => {
  const defaultProps = {
    id: 'test-multiselect',
    name: 'test-multiselect',
    value: [],
    required: false,
    disabled: false,
    readonly: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onFocus: vi.fn(),
    placeholder: 'Select options',
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
    it('should render with wrapper div having correct class', () => {
      const { container } = render(
        <CustomMultiselectDropdown {...defaultProps} />
      )

      const wrapper = container.querySelector('.mocked-multiselect-dropdown')
      expect(wrapper).toBeInTheDocument()
    })

    it('should render custom placeholder', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          placeholder="Choose items"
        />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'Choose items'
      )
    })

    it('should render default placeholder when not provided', () => {
      render(
        <CustomMultiselectDropdown {...defaultProps} placeholder={undefined} />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'Select...'
      )
    })

    it('should set displayValue to "name"', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      expect(screen.getByTestId('multiselect-display-value')).toHaveTextContent(
        'name'
      )
    })

    it('should enable showCheckbox', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      expect(screen.getByTestId('multiselect-show-checkbox')).toHaveTextContent(
        'true'
      )
    })

    it('should set hidePlaceholder to false', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      expect(
        screen.getByTestId('multiselect-hide-placeholder')
      ).toHaveTextContent('false')
    })

    it('should set avoidHighlightFirstOption to true', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      expect(
        screen.getByTestId('multiselect-avoid-highlight')
      ).toHaveTextContent('true')
    })

    it('should render custom close icon', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      const closeIcon = screen.getByTestId('lds-icon-x')
      expect(closeIcon).toBeInTheDocument()
      expect(closeIcon).toHaveTextContent('x')
      expect(closeIcon).toHaveAttribute('data-inline', 'true')
    })
  })

  describe('Options Transformation', () => {
    it('should transform enumOptions to dropdown format', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '3'
      )
      expect(screen.getByTestId('option-option1')).toHaveTextContent('Option 1')
      expect(screen.getByTestId('option-option2')).toHaveTextContent('Option 2')
      expect(screen.getByTestId('option-option3')).toHaveTextContent('Option 3')
    })

    it('should handle empty enumOptions', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          options={{ enumOptions: [] }}
        />
      )

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '0'
      )
    })

    it('should handle undefined enumOptions', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          options={{ enumOptions: undefined }}
        />
      )

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '0'
      )
    })

    it('should correctly map option labels to names', () => {
      const customOptions = {
        enumOptions: [
          { label: 'First Item', value: 'first' },
          { label: 'Second Item', value: 'second' },
        ],
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={customOptions} />
      )

      expect(screen.getByTestId('option-first')).toHaveTextContent('First Item')
      expect(screen.getByTestId('option-second')).toHaveTextContent(
        'Second Item'
      )
    })

    it('should correctly map option values to ids', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      expect(screen.getByTestId('option-option1')).toBeInTheDocument()
      expect(screen.getByTestId('option-option2')).toBeInTheDocument()
      expect(screen.getByTestId('option-option3')).toBeInTheDocument()
    })
  })

  describe('Selected Values', () => {
    it('should show no selected values when value is empty array', () => {
      render(<CustomMultiselectDropdown {...defaultProps} value={[]} />)

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })

    it('should show selected values when value array is provided', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option3']}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('2')
      expect(screen.getByTestId('selected-option1')).toHaveTextContent(
        'Option 1'
      )
      expect(screen.getByTestId('selected-option3')).toHaveTextContent(
        'Option 3'
      )
    })

    it('should show single selected value', () => {
      render(
        <CustomMultiselectDropdown {...defaultProps} value={['option2']} />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('1')
      expect(screen.getByTestId('selected-option2')).toHaveTextContent(
        'Option 2'
      )
    })

    it('should show all selected values when all are selected', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2', 'option3']}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('3')
      expect(screen.getByTestId('selected-option1')).toBeInTheDocument()
      expect(screen.getByTestId('selected-option2')).toBeInTheDocument()
      expect(screen.getByTestId('selected-option3')).toBeInTheDocument()
    })

    it('should handle non-array value by showing no selections', () => {
      render(
        <CustomMultiselectDropdown {...defaultProps} value="not-an-array" />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })

    it('should handle undefined value', () => {
      render(<CustomMultiselectDropdown {...defaultProps} value={undefined} />)

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })

    it('should handle null value', () => {
      render(<CustomMultiselectDropdown {...defaultProps} value={null} />)

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })

    it('should filter selected values to only show valid options', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'invalid-option', 'option2']}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('2')
      expect(screen.getByTestId('selected-option1')).toBeInTheDocument()
      expect(screen.getByTestId('selected-option2')).toBeInTheDocument()
      expect(
        screen.queryByTestId('selected-invalid-option')
      ).not.toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<CustomMultiselectDropdown {...defaultProps} disabled={true} />)

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })

    it('should be disabled when readonly prop is true', () => {
      render(<CustomMultiselectDropdown {...defaultProps} readonly={true} />)

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })

    it('should be disabled when both disabled and readonly are true', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          disabled={true}
          readonly={true}
        />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })

    it('should not be disabled when both disabled and readonly are false', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          disabled={false}
          readonly={false}
        />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'false'
      )
    })
  })

  describe('handleSelect', () => {
    it('should call onChange with selected ids when option is selected', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      const option = screen.getByTestId('option-option1')
      fireEvent.click(option)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(['option1'])
    })

    it('should call onChange with multiple ids when multiple options are selected', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1']}
          onChange={mockOnChange}
        />
      )

      const option = screen.getByTestId('option-option2')
      fireEvent.click(option)

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2'])
    })

    it('should extract only ids from selected list', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      const option = screen.getByTestId('option-option3')
      fireEvent.click(option)

      // Should call with just the id, not the whole object
      expect(mockOnChange).toHaveBeenCalledWith(['option3'])
    })
  })

  describe('handleRemove', () => {
    it('should call onChange with remaining ids when option is removed', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2']}
          onChange={mockOnChange}
        />
      )

      const removeButton = screen.getByTestId('remove-option1')
      fireEvent.click(removeButton)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(['option2'])
    })

    it('should call onChange with empty array when last option is removed', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1']}
          onChange={mockOnChange}
        />
      )

      const removeButton = screen.getByTestId('remove-option1')
      fireEvent.click(removeButton)

      expect(mockOnChange).toHaveBeenCalledWith([])
    })

    it('should call onChange with correct remaining ids when middle option is removed', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2', 'option3']}
          onChange={mockOnChange}
        />
      )

      const removeButton = screen.getByTestId('remove-option2')
      fireEvent.click(removeButton)

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option3'])
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete selection and removal flow', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      // Select first option
      fireEvent.click(screen.getByTestId('option-option1'))
      expect(mockOnChange).toHaveBeenLastCalledWith(['option1'])

      // Rerender with updated value
      rerender(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1']}
          onChange={mockOnChange}
        />
      )

      // Select second option
      fireEvent.click(screen.getByTestId('option-option2'))
      expect(mockOnChange).toHaveBeenLastCalledWith(['option1', 'option2'])

      // Rerender with updated value
      rerender(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2']}
          onChange={mockOnChange}
        />
      )

      // Remove first option
      fireEvent.click(screen.getByTestId('remove-option1'))
      expect(mockOnChange).toHaveBeenLastCalledWith(['option2'])
    })

    it('should work correctly with all props set', () => {
      const mockOnChange = vi.fn()

      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2']}
          disabled={false}
          readonly={false}
          placeholder="Select multiple items"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'Select multiple items'
      )
      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('2')
      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'false'
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle options with special characters', () => {
      const specialOptions = {
        enumOptions: [
          { label: 'Option with spaces', value: 'option-with-spaces' },
          { label: 'Option-with-dashes', value: 'option-with-dashes' },
          {
            label: 'Option_with_underscores',
            value: 'option_with_underscores',
          },
        ],
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={specialOptions} />
      )

      expect(screen.getByTestId('option-option-with-spaces')).toHaveTextContent(
        'Option with spaces'
      )
      expect(screen.getByTestId('option-option-with-dashes')).toHaveTextContent(
        'Option-with-dashes'
      )
      expect(
        screen.getByTestId('option-option_with_underscores')
      ).toHaveTextContent('Option_with_underscores')
    })

    it('should handle very long option labels', () => {
      const longLabelOptions = {
        enumOptions: [
          {
            label:
              'This is a very long option label that might need to wrap in the UI',
            value: 'long-option',
          },
        ],
      }

      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          options={longLabelOptions}
        />
      )

      expect(screen.getByTestId('option-long-option')).toHaveTextContent(
        'This is a very long option label that might need to wrap in the UI'
      )
    })

    it('should handle duplicate values in selected array', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option1', 'option2']}
        />
      )

      // Should deduplicate and show only unique selections
      const selectedItems = screen.getAllByTestId(/^selected-option/)
      expect(selectedItems.length).toBeLessThanOrEqual(2)
    })

    it('should handle empty string values', () => {
      const emptyStringOptions = {
        enumOptions: [
          { label: 'Empty Value', value: '' },
          { label: 'Normal Value', value: 'normal' },
        ],
      }

      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          options={emptyStringOptions}
        />
      )

      expect(screen.getByTestId('option-')).toHaveTextContent('Empty Value')
      expect(screen.getByTestId('option-normal')).toHaveTextContent(
        'Normal Value'
      )
    })

    it('should handle numeric option values', () => {
      const numericOptions = {
        enumOptions: [
          { label: 'One', value: '1' },
          { label: 'Two', value: '2' },
        ],
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={numericOptions} />
      )

      expect(screen.getByTestId('option-1')).toHaveTextContent('One')
      expect(screen.getByTestId('option-2')).toHaveTextContent('Two')
    })

    it('should maintain selection state across rerenders', () => {
      const { rerender } = render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2']}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('2')

      rerender(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2']}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('2')
    })

    it('should handle dynamic option changes', () => {
      const { rerender } = render(
        <CustomMultiselectDropdown {...defaultProps} />
      )

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '3'
      )

      const newOptions = {
        enumOptions: [
          { label: 'New Option 1', value: 'new1' },
          { label: 'New Option 2', value: 'new2' },
        ],
      }

      rerender(
        <CustomMultiselectDropdown {...defaultProps} options={newOptions} />
      )

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '2'
      )
      expect(screen.getByTestId('option-new1')).toBeInTheDocument()
      expect(screen.getByTestId('option-new2')).toBeInTheDocument()
    })
  })

  describe('Custom Close Icon', () => {
    it('should render close icon with correct props', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      const closeIcon = screen.getByTestId('lds-icon-x')
      expect(closeIcon).toHaveAttribute('data-inline', 'true')
      expect(closeIcon).toHaveClass('mocked-multiselect-close-icon')
    })

    it('should render x icon name', () => {
      render(<CustomMultiselectDropdown {...defaultProps} />)

      const closeIcon = screen.getByTestId('lds-icon-x')
      expect(closeIcon).toHaveTextContent('x')
    })
  })

  describe('Placeholder Behavior', () => {
    it('should use custom placeholder when provided', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          placeholder="Pick your choices"
        />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'Pick your choices'
      )
    })

    it('should use default placeholder when empty string is provided', () => {
      render(<CustomMultiselectDropdown {...defaultProps} placeholder="" />)

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'Select...'
      )
    })

    it('should handle null placeholder', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          placeholder={null as any}
        />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'Select...'
      )
    })

    it('should handle placeholder with special characters', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          placeholder="Select (max 3) items..."
        />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'Select (max 3) items...'
      )
    })

    it('should handle very long placeholder', () => {
      const longPlaceholder =
        'This is a very long placeholder text that should still be displayed correctly'
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          placeholder={longPlaceholder}
        />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        longPlaceholder
      )
    })
  })

  describe('Props Validation', () => {
    it('should handle missing enumOptions gracefully', () => {
      const propsWithoutEnum = {
        ...defaultProps,
        options: {},
      }

      render(<CustomMultiselectDropdown {...propsWithoutEnum} />)

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '0'
      )
    })

    it('should handle options as null', () => {
      const propsWithNullOptions = {
        ...defaultProps,
        options: { enumOptions: null as any },
      }

      render(<CustomMultiselectDropdown {...propsWithNullOptions} />)

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '0'
      )
    })
  })

  describe('Array.isArray Coverage', () => {
    it('should handle string value instead of array', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={'not-an-array' as any}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })

    it('should handle number value instead of array', () => {
      render(<CustomMultiselectDropdown {...defaultProps} value={123 as any} />)

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })

    it('should handle object value instead of array', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={{ key: 'value' } as any}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })

    it('should handle boolean value instead of array', () => {
      render(
        <CustomMultiselectDropdown {...defaultProps} value={true as any} />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })
  })

  describe('Transformation Logic Coverage', () => {
    it('should correctly map all properties in enumOptions', () => {
      const customOptions = {
        enumOptions: [
          { label: 'Label A', value: 'value-a' },
          { label: 'Label B', value: 'value-b' },
          { label: 'Label C', value: 'value-c' },
        ],
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={customOptions} />
      )

      expect(screen.getByTestId('option-value-a')).toHaveTextContent('Label A')
      expect(screen.getByTestId('option-value-b')).toHaveTextContent('Label B')
      expect(screen.getByTestId('option-value-c')).toHaveTextContent('Label C')
    })

    it('should handle single option in enumOptions', () => {
      const singleOption = {
        enumOptions: [{ label: 'Only Option', value: 'only' }],
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={singleOption} />
      )

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '1'
      )
      expect(screen.getByTestId('option-only')).toHaveTextContent('Only Option')
    })

    it('should handle many options in enumOptions', () => {
      const manyOptions = {
        enumOptions: Array.from({ length: 20 }, (_, i) => ({
          label: `Option ${i + 1}`,
          value: `opt${i + 1}`,
        })),
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={manyOptions} />
      )

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '20'
      )
    })
  })

  describe('Filter Logic Coverage', () => {
    it('should filter selectedValues correctly when some values are not in options', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'non-existent', 'option3']}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('2')
      expect(screen.getByTestId('selected-option1')).toBeInTheDocument()
      expect(screen.getByTestId('selected-option3')).toBeInTheDocument()
    })

    it('should show empty selections when value array contains no valid options', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['invalid1', 'invalid2', 'invalid3']}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })

    it('should handle empty array value', () => {
      render(<CustomMultiselectDropdown {...defaultProps} value={[]} />)

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('0')
    })
  })

  describe('Map Function Coverage', () => {
    it('should correctly extract ids from all selected items', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2']}
          onChange={mockOnChange}
        />
      )

      const option = screen.getByTestId('option-option3')
      fireEvent.click(option)

      const callArgs = mockOnChange.mock.calls[0][0]
      expect(callArgs).toEqual(['option1', 'option2', 'option3'])
      expect(callArgs.every((item: any) => typeof item === 'string')).toBe(true)
    })

    it('should extract ids from empty selected list', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      const option = screen.getByTestId('option-option1')
      fireEvent.click(option)

      expect(mockOnChange).toHaveBeenCalledWith(['option1'])
    })

    it('should extract ids when removing from single-item list', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1']}
          onChange={mockOnChange}
        />
      )

      const removeButton = screen.getByTestId('remove-option1')
      fireEvent.click(removeButton)

      expect(mockOnChange).toHaveBeenCalledWith([])
    })

    it('should extract ids when removing from multi-item list', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2', 'option3']}
          onChange={mockOnChange}
        />
      )

      const removeButton = screen.getByTestId('remove-option2')
      fireEvent.click(removeButton)

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option3'])
    })
  })

  describe('Disabled Logic Coverage', () => {
    it('should be disabled only when disabled is true', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          disabled={true}
          readonly={false}
        />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })

    it('should be disabled only when readonly is true', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          disabled={false}
          readonly={true}
        />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })

    it('should not be disabled when both are false', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          disabled={false}
          readonly={false}
        />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'false'
      )
    })

    it('should be disabled with disabled true and readonly undefined', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          disabled={true}
          readonly={undefined}
        />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })

    it('should be disabled with disabled undefined and readonly true', () => {
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          disabled={undefined}
          readonly={true}
        />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })
  })

  describe('Component Re-rendering', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <CustomMultiselectDropdown {...defaultProps} value={['option1']} />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('1')

      rerender(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={['option1', 'option2']}
        />
      )

      expect(
        screen.getByTestId('multiselect-selected-count')
      ).toHaveTextContent('2')
    })

    it('should update when disabled prop changes', () => {
      const { rerender } = render(
        <CustomMultiselectDropdown {...defaultProps} disabled={false} />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'false'
      )

      rerender(<CustomMultiselectDropdown {...defaultProps} disabled={true} />)

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })

    it('should update when readonly prop changes', () => {
      const { rerender } = render(
        <CustomMultiselectDropdown {...defaultProps} readonly={false} />
      )

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'false'
      )

      rerender(<CustomMultiselectDropdown {...defaultProps} readonly={true} />)

      expect(screen.getByTestId('multiselect-disabled')).toHaveTextContent(
        'true'
      )
    })

    it('should update when placeholder changes', () => {
      const { rerender } = render(
        <CustomMultiselectDropdown
          {...defaultProps}
          placeholder="First placeholder"
        />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'First placeholder'
      )

      rerender(
        <CustomMultiselectDropdown
          {...defaultProps}
          placeholder="Second placeholder"
        />
      )

      expect(screen.getByTestId('multiselect-placeholder')).toHaveTextContent(
        'Second placeholder'
      )
    })

    it('should update when options change', () => {
      const firstOptions = {
        enumOptions: [{ label: 'First', value: 'first' }],
      }

      const { rerender } = render(
        <CustomMultiselectDropdown {...defaultProps} options={firstOptions} />
      )

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '1'
      )

      const secondOptions = {
        enumOptions: [
          { label: 'Second 1', value: 'second1' },
          { label: 'Second 2', value: 'second2' },
        ],
      }

      rerender(
        <CustomMultiselectDropdown {...defaultProps} options={secondOptions} />
      )

      expect(screen.getByTestId('multiselect-options-count')).toHaveTextContent(
        '2'
      )
    })
  })

  describe('Event Handler Coverage', () => {
    it('should call onChange with correct parameters', () => {
      const mockOnChange = vi.fn()
      render(
        <CustomMultiselectDropdown
          {...defaultProps}
          value={[]}
          onChange={mockOnChange}
        />
      )

      fireEvent.click(screen.getByTestId('option-option1'))

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange.mock.calls[0][0]).toEqual(['option1'])
    })
  })

  describe('Unicode and Special Characters', () => {
    it('should handle unicode characters in labels', () => {
      const unicodeOptions = {
        enumOptions: [
          { label: '中文选项', value: 'chinese' },
          { label: 'العربية', value: 'arabic' },
          { label: 'Русский', value: 'russian' },
        ],
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={unicodeOptions} />
      )

      expect(screen.getByTestId('option-chinese')).toHaveTextContent('中文选项')
      expect(screen.getByTestId('option-arabic')).toHaveTextContent('العربية')
      expect(screen.getByTestId('option-russian')).toHaveTextContent('Русский')
    })

    it('should handle emoji in labels', () => {
      const emojiOptions = {
        enumOptions: [
          { label: '😀 Happy', value: 'happy' },
          { label: '🎉 Party', value: 'party' },
        ],
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={emojiOptions} />
      )

      expect(screen.getByTestId('option-happy')).toHaveTextContent('😀 Happy')
      expect(screen.getByTestId('option-party')).toHaveTextContent('🎉 Party')
    })

    it('should handle HTML entities in labels', () => {
      const entityOptions = {
        enumOptions: [
          { label: 'Price < $100', value: 'cheap' },
          { label: 'Price > $1000', value: 'expensive' },
        ],
      }

      render(
        <CustomMultiselectDropdown {...defaultProps} options={entityOptions} />
      )

      expect(screen.getByTestId('option-cheap')).toHaveTextContent(
        'Price < $100'
      )
      expect(screen.getByTestId('option-expensive')).toHaveTextContent(
        'Price > $1000'
      )
    })
  })
})
