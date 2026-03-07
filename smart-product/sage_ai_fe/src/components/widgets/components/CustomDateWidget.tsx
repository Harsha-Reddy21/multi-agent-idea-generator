import { LdsDatepicker } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'

import styles from './CustomDateWidget.module.scss'

export const CustomDateWidget: React.FC<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  placeholder,
}) => {
  const handleDateChange = (eventOrValue: unknown) => {
    // LdsDatepicker might pass the value directly as a string or an event
    let dateValue: string | undefined

    if (typeof eventOrValue === 'string') {
      dateValue = eventOrValue
    } else if (eventOrValue && typeof eventOrValue === 'object') {
      const obj = eventOrValue as { target?: { value?: string } }
      if (obj.target?.value !== undefined) {
        dateValue = obj.target.value
      }
    }

    onChange(dateValue || undefined)
  }

  // Ensure value is a string, convert to string if it exists
  const dateValue = value ? String(value) : ''

  return (
    <LdsDatepicker
      className={styles.securityLdsCalendarPopup}
      id={id}
      name={id}
      label=""
      hint={placeholder || 'Format MM/DD/YYYY'}
      dateFormat="MM/DD/YYYY"
      value={dateValue}
      defaultValue={dateValue}
      disabled={disabled || readonly}
      onChange={handleDateChange}
    />
  )
}
