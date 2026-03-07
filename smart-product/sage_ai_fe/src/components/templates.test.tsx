import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CustomFieldTemplate } from './templates'

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsIcon: ({ name, size, ...props }: any) => (
    <span data-testid="lds-icon" data-name={name} data-size={size} {...props}>
      Icon
    </span>
  ),
  LdsTooltip: ({ children, content, position, ...props }: any) => (
    <div
      data-testid="lds-tooltip"
      data-content={content}
      data-position={position}
      {...props}
    >
      {children}
    </div>
  ),
}))

describe('CustomFieldTemplate', () => {
  const baseProps: any = {
    id: 'test-field',
    classNames: 'test-class',
    label: 'Test Label',
    help: undefined,
    required: false,
    description: undefined,
    errors: undefined,
    children: <input type="text" data-testid="test-input" />,
    schema: { type: 'string' },
    uiSchema: {},
    disabled: false,
    readonly: false,
    displayLabel: true,
    hideError: false,
    onDropPropertyClick: vi.fn(),
    onKeyChange: vi.fn(),
    onChange: vi.fn(),
    registry: {} as any,
    rawErrors: [],
  }

  describe('Basic Rendering', () => {
    it('should render the field template with label and children', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })

    it('should apply classNames prop to container', () => {
      const { container } = render(<CustomFieldTemplate {...baseProps} />)

      const wrapper = container.querySelector('.test-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('should apply marginBottom style to container', () => {
      const { container } = render(<CustomFieldTemplate {...baseProps} />)

      const wrapper = container.querySelector('.test-class')
      expect(wrapper).toHaveStyle({ marginBottom: '1.5rem' })
    })

    it('should render children', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })
  })

  describe('Label Rendering', () => {
    it('should render label for non-object types', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should not render label for object types', () => {
      const objectProps = {
        ...baseProps,
        schema: { type: 'object' },
      }
      render(<CustomFieldTemplate {...objectProps} />)

      expect(screen.queryByText('Test Label')).not.toBeInTheDocument()
    })

    it('should render label with htmlFor attribute matching id', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      const label = screen.getByText('Test Label')
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveAttribute('for', 'test-field')
    })

    it('should apply fontWeight style to label', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      const label = screen.getByText('Test Label')
      expect(label).toHaveStyle({ fontWeight: '500' })
    })

    it('should render label inside flex container', () => {
      const { container } = render(<CustomFieldTemplate {...baseProps} />)

      const labelContainer = container.querySelector(
        'div[style*="display: flex"]'
      )
      expect(labelContainer).toBeInTheDocument()
      expect(labelContainer).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
      })
    })
  })

  describe('Required Field Indicator', () => {
    it('should not show asterisk when field is not required', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })

    it('should render asterisk in span element', () => {
      const requiredProps = {
        ...baseProps,
        required: true,
      }
      const { container } = render(<CustomFieldTemplate {...requiredProps} />)

      const asterisk = container.querySelector('span[style*="color"]')
      expect(asterisk).toBeInTheDocument()
      expect(asterisk).toHaveTextContent('*')
    })
  })

  describe('Hidden Field Functionality', () => {
    it('should return null when ui:hidden is true', () => {
      const hiddenProps = {
        ...baseProps,
        uiSchema: {
          'ui:hidden': true,
        },
      }
      const { container } = render(<CustomFieldTemplate {...hiddenProps} />)

      expect(container.firstChild).toBeNull()
    })

    it('should render normally when ui:hidden is false', () => {
      const visibleProps = {
        ...baseProps,
        uiSchema: {
          'ui:hidden': false,
        },
      }
      render(<CustomFieldTemplate {...visibleProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should render normally when ui:hidden is undefined', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })
  })

  describe('Hide Label Functionality', () => {
    it('should hide label when ui:options label is false', () => {
      const hideLabelProps = {
        ...baseProps,
        uiSchema: {
          'ui:options': {
            label: false,
          },
        },
      }
      render(<CustomFieldTemplate {...hideLabelProps} />)

      expect(screen.queryByText('Test Label')).not.toBeInTheDocument()
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })

    it('should show label when ui:options label is true', () => {
      const showLabelProps = {
        ...baseProps,
        uiSchema: {
          'ui:options': {
            label: true,
          },
        },
      }
      render(<CustomFieldTemplate {...showLabelProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should show label when ui:options is undefined', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should show label when ui:options exists but label is not set', () => {
      const propsWithOptions = {
        ...baseProps,
        uiSchema: {
          'ui:options': {
            someOtherOption: true,
          },
        },
      }
      render(<CustomFieldTemplate {...propsWithOptions} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })
  })

  describe('Tooltip Functionality', () => {
    it('should render tooltip when help starts with "Tooltip:"', () => {
      const tooltipProps = {
        ...baseProps,
        help: 'Tooltip: This is helpful information',
      }
      render(<CustomFieldTemplate {...tooltipProps} />)

      const tooltip = screen.getByTestId('tooltip-test-field')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveAttribute(
        'data-content',
        'This is helpful information'
      )
    })

    it('should render tooltip with correct position', () => {
      const tooltipProps = {
        ...baseProps,
        help: 'Tooltip: Help text',
      }
      render(<CustomFieldTemplate {...tooltipProps} />)

      const tooltip = screen.getByTestId('tooltip-test-field')
      expect(tooltip).toHaveAttribute('data-position', 'top')
    })

    it('should render info icon inside tooltip', () => {
      const tooltipProps = {
        ...baseProps,
        help: 'Tooltip: Info',
      }
      render(<CustomFieldTemplate {...tooltipProps} />)

      const icon = screen.getByTestId('lds-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('data-name', 'info-fill')
      expect(icon).toHaveAttribute('data-size', '16')
    })

    it('should have correct testid for tooltip', () => {
      const tooltipProps = {
        ...baseProps,
        id: 'my-field',
        help: 'Tooltip: Test',
      }
      render(<CustomFieldTemplate {...tooltipProps} />)

      const tooltip = screen.getByTestId('tooltip-my-field')
      expect(tooltip).toBeInTheDocument()
    })

    it('should trim tooltip content', () => {
      const tooltipProps = {
        ...baseProps,
        help: 'Tooltip:   Trimmed content   ',
      }
      render(<CustomFieldTemplate {...tooltipProps} />)

      const tooltip = screen.getByTestId('tooltip-test-field')
      expect(tooltip).toHaveAttribute('data-content', 'Trimmed content')
    })

    it('should not render tooltip when help does not start with "Tooltip:"', () => {
      const regularHelpProps = {
        ...baseProps,
        help: 'Regular help text',
      }
      render(<CustomFieldTemplate {...regularHelpProps} />)

      expect(screen.queryByTestId('lds-tooltip')).not.toBeInTheDocument()
    })

    it('should handle empty tooltip content', () => {
      const emptyTooltipProps = {
        ...baseProps,
        help: 'Tooltip:',
      }
      render(<CustomFieldTemplate {...emptyTooltipProps} />)

      // Empty tooltip should not render
      expect(screen.queryByTestId('lds-tooltip')).not.toBeInTheDocument()
    })

    it('should handle empty tooltip content after trimming', () => {
      const spaceTooltipProps = {
        ...baseProps,
        help: 'Tooltip:   ',
      }
      render(<CustomFieldTemplate {...spaceTooltipProps} />)

      // Empty tooltip should not render
      expect(screen.queryByTestId('lds-tooltip')).not.toBeInTheDocument()
    })
  })

  describe('Help Text Rendering', () => {
    it('should render help text when not a tooltip', () => {
      const helpProps = {
        ...baseProps,
        help: <div data-testid="help-text">Help information</div>,
      }
      render(<CustomFieldTemplate {...helpProps} />)

      expect(screen.getByTestId('help-text')).toBeInTheDocument()
    })

    it('should render string help text when not a tooltip', () => {
      const helpProps = {
        ...baseProps,
        help: 'Regular help text',
      }
      render(<CustomFieldTemplate {...helpProps} />)

      expect(screen.getByText('Regular help text')).toBeInTheDocument()
    })

    it('should not render help text when it is a tooltip', () => {
      const tooltipProps = {
        ...baseProps,
        help: 'Tooltip: This should not appear as text',
      }
      render(<CustomFieldTemplate {...tooltipProps} />)

      expect(
        screen.queryByText('Tooltip: This should not appear as text')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('This should not appear as text')
      ).not.toBeInTheDocument()
    })

    it('should handle undefined help', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      // Should render without errors
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })

    it('should handle null help', () => {
      const nullHelpProps = {
        ...baseProps,
        help: null,
      }
      render(<CustomFieldTemplate {...nullHelpProps} />)

      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })
  })

  describe('Description Rendering', () => {
    it('should render description when provided', () => {
      const descProps = {
        ...baseProps,
        description: <div data-testid="description">Field description</div>,
      }
      render(<CustomFieldTemplate {...descProps} />)

      expect(screen.getByTestId('description')).toBeInTheDocument()
    })

    it('should render string description', () => {
      const descProps = {
        ...baseProps,
        description: 'This is a description',
      }
      render(<CustomFieldTemplate {...descProps} />)

      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('should not render description when help is a tooltip', () => {
      const tooltipDescProps = {
        ...baseProps,
        description: <div data-testid="description">Description text</div>,
        help: 'Tooltip: Tooltip text',
      }
      render(<CustomFieldTemplate {...tooltipDescProps} />)

      expect(screen.queryByTestId('description')).not.toBeInTheDocument()
    })

    it('should render description when help is not a tooltip', () => {
      const descProps = {
        ...baseProps,
        description: <div data-testid="description">Description text</div>,
        help: 'Regular help',
      }
      render(<CustomFieldTemplate {...descProps} />)

      expect(screen.getByTestId('description')).toBeInTheDocument()
    })

    it('should handle undefined description', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })
  })

  describe('Errors Rendering', () => {
    it('should render errors when provided', () => {
      const errorProps = {
        ...baseProps,
        errors: <div data-testid="error-message">Error occurred</div>,
      }
      render(<CustomFieldTemplate {...errorProps} />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    it('should handle undefined errors', () => {
      render(<CustomFieldTemplate {...baseProps} />)

      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })
  })

  describe('Schema Type Handling', () => {
    it('should show label for string type', () => {
      const stringProps = {
        ...baseProps,
        schema: { type: 'string' },
      }
      render(<CustomFieldTemplate {...stringProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should show label for number type', () => {
      const numberProps = {
        ...baseProps,
        schema: { type: 'number' },
      }
      render(<CustomFieldTemplate {...numberProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should show label for boolean type', () => {
      const booleanProps = {
        ...baseProps,
        schema: { type: 'boolean' },
      }
      render(<CustomFieldTemplate {...booleanProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should show label for array type', () => {
      const arrayProps = {
        ...baseProps,
        schema: { type: 'array' },
      }
      render(<CustomFieldTemplate {...arrayProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should not show label for object type', () => {
      const objectProps = {
        ...baseProps,
        schema: { type: 'object' },
      }
      render(<CustomFieldTemplate {...objectProps} />)

      expect(screen.queryByText('Test Label')).not.toBeInTheDocument()
    })
  })

  describe('Complex Scenarios', () => {
    it('should render required field with tooltip', () => {
      const complexProps = {
        ...baseProps,
        required: true,
        help: 'Tooltip: Important information',
      }
      render(<CustomFieldTemplate {...complexProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-test-field')).toBeInTheDocument()
    })

    it('should render all elements when provided', () => {
      const allPropsSet = {
        ...baseProps,
        required: true,
        description: 'Field description',
        errors: <div data-testid="errors">Error message</div>,
        help: 'Regular help text',
      }
      render(<CustomFieldTemplate {...allPropsSet} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
      expect(
        screen.getByText('Field description', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByTestId('errors')).toBeInTheDocument()
      expect(
        screen.getByText('Regular help text', { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })

    it('should handle label being empty string', () => {
      const emptyLabelProps = {
        ...baseProps,
        label: '',
      }
      render(<CustomFieldTemplate {...emptyLabelProps} />)

      // Should still render input
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })

    it('should handle object type with hidden label option', () => {
      const objectHiddenProps = {
        ...baseProps,
        schema: { type: 'object' },
        uiSchema: {
          'ui:options': {
            label: false,
          },
        },
      }
      render(<CustomFieldTemplate {...objectHiddenProps} />)

      expect(screen.queryByText('Test Label')).not.toBeInTheDocument()
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })

    it('should render both description and help when help is not a tooltip', () => {
      const bothProps = {
        ...baseProps,
        description: 'Description text',
        help: 'Help text',
      }
      render(<CustomFieldTemplate {...bothProps} />)

      expect(
        screen.getByText('Description text', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Help text', { exact: false })
      ).toBeInTheDocument()
    })

    it('should render ReactNode children correctly', () => {
      const reactNodeChild = {
        ...baseProps,
        children: (
          <div>
            <input data-testid="input-1" />
            <input data-testid="input-2" />
          </div>
        ),
      }
      render(<CustomFieldTemplate {...reactNodeChild} />)

      expect(screen.getByTestId('input-1')).toBeInTheDocument()
      expect(screen.getByTestId('input-2')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle uiSchema being undefined', () => {
      const noUiSchemaProps = {
        ...baseProps,
        uiSchema: undefined,
      }
      render(<CustomFieldTemplate {...noUiSchemaProps} />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should handle help as ReactElement', () => {
      const reactHelpProps = {
        ...baseProps,
        help: <span data-testid="react-help">React help element</span>,
      }
      render(<CustomFieldTemplate {...reactHelpProps} />)

      expect(screen.getByTestId('react-help')).toBeInTheDocument()
    })

    it('should handle case-sensitive tooltip prefix', () => {
      const lowercaseProps = {
        ...baseProps,
        help: 'tooltip: Should not be treated as tooltip',
      }
      render(<CustomFieldTemplate {...lowercaseProps} />)

      expect(screen.queryByTestId('lds-tooltip')).not.toBeInTheDocument()
      expect(
        screen.getByText('tooltip: Should not be treated as tooltip')
      ).toBeInTheDocument()
    })

    it('should handle tooltip in middle of help text', () => {
      const middleTooltipProps = {
        ...baseProps,
        help: 'Some text Tooltip: in the middle',
      }
      render(<CustomFieldTemplate {...middleTooltipProps} />)

      expect(screen.queryByTestId('lds-tooltip')).not.toBeInTheDocument()
      expect(
        screen.getByText('Some text Tooltip: in the middle')
      ).toBeInTheDocument()
    })

    it('should handle multiple colons in help text', () => {
      const multiColonProps = {
        ...baseProps,
        help: 'Tooltip: Text with: multiple: colons',
      }
      render(<CustomFieldTemplate {...multiColonProps} />)

      const tooltip = screen.getByTestId('tooltip-test-field')
      expect(tooltip).toHaveAttribute(
        'data-content',
        'Text with: multiple: colons'
      )
    })
  })

  describe('Label and Tooltip Combination', () => {
    it('should render label and tooltip in same flex container', () => {
      const props = {
        ...baseProps,
        help: 'Tooltip: Info',
      }
      const { container } = render(<CustomFieldTemplate {...props} />)

      const flexContainer = container.querySelector(
        'div[style*="display: flex"]'
      )
      expect(flexContainer).toBeInTheDocument()

      const label = flexContainer?.querySelector('label')
      const tooltip = flexContainer?.querySelector(
        '[data-testid="tooltip-test-field"]'
      )

      expect(label).toBeInTheDocument()
      expect(tooltip).toBeInTheDocument()
    })

    it('should not render label container when label is hidden and no tooltip', () => {
      const props = {
        ...baseProps,
        uiSchema: {
          'ui:options': {
            label: false,
          },
        },
      }
      const { container } = render(<CustomFieldTemplate {...props} />)

      const flexContainer = container.querySelector(
        'div[style*="display: flex"]'
      )
      expect(flexContainer).not.toBeInTheDocument()
    })
  })
})
