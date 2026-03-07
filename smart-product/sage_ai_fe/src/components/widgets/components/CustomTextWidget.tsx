import React from 'react'
import { LdsTextField } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import { 
  identifyFieldType, 
  validateField, 
  sanitizeTelephoneInput 
} from '../../../core/utils/field-validation.util'
import { TELEPHONE_VALIDATION } from '../../../core/constants'

import './CustomTextWidget.module.scss'

export const CustomTextWidget: React.FC<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  placeholder,
  onFocus,
  schema,
  rawErrors,
}) => {
  const fieldType = identifyFieldType(schema)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    // Sanitize input for telephone fields
    if (fieldType.isTelephoneField) {
      newValue = sanitizeTelephoneInput(newValue, TELEPHONE_VALIDATION.MAX_LENGTH)
    }
    
    onChange(newValue)
  }

  // Validate and get error message
  const schemaErrorMessage = schema?.errorMessage as string | undefined
  const validationResult = value && typeof value === 'string' && value.trim() !== ''
    ? validateField(value, fieldType, schemaErrorMessage)
    : { isValid: true, errorMessage: '' }
  
  // Prioritize custom validation error over rawErrors
  const errorMessage = validationResult.errorMessage || rawErrors?.[0] || ''
  const hasError = Boolean(errorMessage)

  return (
    <LdsTextField
      id={id}
      name={id}
      label=""
      value={value || ''}
      disabled={disabled || readonly}
      placeholder={placeholder}
      onChange={handleChange}
      onFocus={() => onFocus && onFocus(id, value)}
      state={hasError ? 'error' : ''}
      stateMessage={errorMessage}
    />
  )
}
