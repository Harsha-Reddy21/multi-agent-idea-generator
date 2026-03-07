import { LdsSelect } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'

export const CustomMultiSelectWidget: React.FC<WidgetProps> = ({
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
  return (
    <LdsSelect
      id={id}
      name={id}
      label=""
      options={selectOptions}
      value={value || ''}
      disabled={disabled || readonly}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value || undefined)
      }
    />
  )
}
