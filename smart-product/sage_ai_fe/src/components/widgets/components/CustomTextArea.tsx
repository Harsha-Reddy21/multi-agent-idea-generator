import { WidgetProps } from '@rjsf/utils'
import React from 'react'

import styles from './CustomTextArea.module.scss'

export const CustomTextArea: React.FC<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  placeholder,
  onFocus,
}) => {
  const textareaProps = {
    id,
    name: id,
    value: value || '',
    disabled: disabled || readonly,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onFocus: () => onFocus && onFocus(id, value),
    rows: 4,
    className: styles.textarea,
  }
  return <textarea {...textareaProps} />
}
