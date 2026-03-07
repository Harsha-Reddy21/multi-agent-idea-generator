import { LdsIcon, LdsTooltip } from '@elilillyco/ux-lds-react'
import { FieldTemplateProps } from '@rjsf/utils'

// Custom Field Template for spacing
export const CustomFieldTemplate = (props: FieldTemplateProps) => {
  const {
    id,
    classNames,
    label,
    help,
    required,
    description,
    errors,
    children,
    schema,
    uiSchema,
  } = props

  // Don't render label for object types (like the root form)
  const shouldShowLabel = schema.type !== 'object'

  // Hide field if ui:hidden is set
  if (uiSchema?.['ui:hidden']) {
    return null
  }

  // Check if label should be hidden via ui:options
  const hideLabel = uiSchema?.['ui:options']?.label === false

  // Extract tooltip text from help if it starts with "Tooltip:"
  const helpText = typeof help === 'string' ? help : ''
  const isTooltip = helpText.startsWith('Tooltip:')
  const tooltipContent = isTooltip
    ? helpText.replace('Tooltip:', '').trim()
    : ''

  return (
    <div className={classNames} style={{ marginBottom: '1.5rem' }}>
      {shouldShowLabel && label && !hideLabel && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <label
            htmlFor={id}
            style={{
              fontWeight: '500',
            }}
          >
            {label}
            {required && <span style={{ color: '#d31710' }}> *</span>}
          </label>
          {isTooltip && tooltipContent && (
            <LdsTooltip
              data-testid={`tooltip-${id}`}
              content={tooltipContent}
              position="top"
            >
              <LdsIcon name="info-fill" size={16} />
            </LdsTooltip>
          )}
        </div>
      )}
      {description && !isTooltip && description}
      {children}
      {errors}
      {!isTooltip && help}
    </div>
  )
}
