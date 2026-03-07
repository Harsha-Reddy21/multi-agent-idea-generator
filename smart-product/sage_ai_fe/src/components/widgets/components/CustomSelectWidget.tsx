import { LdsSelect } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'

export const CustomSelectWidget: React.FC<WidgetProps> = ({
  id,
  options,
  value,
  disabled,
  readonly,
  onChange,
  placeholder,
}) => {
  const { enumOptions } = options
  const selectOptions = [
    { label: placeholder || 'Select...', value: '' },
    ...(enumOptions?.map((option: { value: string; label: string }) => ({
      label: option.label,
      value: option.value,
    })) || []),
  ]

  const handleSelectChange = (eventOrValue: unknown) => {
    // LdsSelect might pass the value directly as a string, an event, or an option object
    let selectedValue: string | undefined

    if (typeof eventOrValue === 'string') {
      // Direct value passed
      selectedValue = eventOrValue
    } else if (eventOrValue && typeof eventOrValue === 'object') {
      // Check if it's an option object with a value property (LdsSelect behavior)
      const obj = eventOrValue as {
        value?: string
        target?: { value?: string }
      }
      if ('value' in obj && obj.value !== undefined) {
        // Option object from LdsSelect
        selectedValue = obj.value
      } else if (obj.target?.value !== undefined) {
        // Standard event object
        selectedValue = obj.target.value
      }
    }

    // Send the value, but convert empty string to undefined
    onChange(selectedValue === '' ? undefined : selectedValue)
  }

  return (
    <LdsSelect
      id={id}
      name={id}
      label=""
      options={selectOptions}
      value={value || ''}
      disabled={disabled || readonly}
      onChange={handleSelectChange}
    />
  )
}
