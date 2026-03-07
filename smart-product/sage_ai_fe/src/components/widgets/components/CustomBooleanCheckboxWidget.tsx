import { LdsCheckbox } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'

export const CustomBooleanCheckboxWidget: React.FC<WidgetProps> = props => {
  const { id, value, required, disabled, onChange } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  return (
    <LdsCheckbox
      id={id}
      label={
        'By submitting this form, you acknowledge your responsibility to provide accurate and comprehensive information to facilitate a thorough assessment.'
      }
      name={id}
      value="true"
      checked={value === true}
      required={required}
      disabled={disabled}
      onChange={handleChange}
    />
  )
}
