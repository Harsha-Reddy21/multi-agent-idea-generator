import { LdsCheckbox } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'

import { useCheckboxPreselection } from '../hooks/useFieldPreselection'
import styles from './CustomCheckboxWidget.module.scss'

export const CustomCheckboxWidget: React.FC<WidgetProps> = ({
  id,
  options,
  value,
  disabled,
  readonly,
  onChange,
  uiSchema,
  formContext,
}) => {
  const { enumOptions } = options
  const selectedValues = value || []
  const shouldPreselect = Boolean(uiSchema?.['ui:options']?.selectedValue)
  const preselectedEnumOption = uiSchema?.['ui:options']?.selectedValue as
    | string
    | undefined

  // Use extracted preselection hook
  useCheckboxPreselection({
    value,
    shouldPreselect,
    preselectedEnumOption,
    formStatus: formContext?.formStatus,
    disabled,
    readonly,
    onChange: (val: unknown[]) => onChange(val),
  })

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v: string) => v !== optionValue)
    onChange(newValues)
  }

  return (
    <div className={styles.checkboxContainer}>
      {enumOptions?.map(
        (option: { value: string; label: string }, index: number) => (
          <LdsCheckbox
            key={`${id}-checkbox-${option.value}-${index}`}
            id={`${id}-${option.value}`}
            name={id}
            label={option.label}
            value={option.value}
            checked={selectedValues.includes(option.value)}
            disabled={disabled || readonly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleCheckboxChange(option.value, e.target.checked)
            }
          />
        )
      )}
    </div>
  )
}
