import { LdsRadio, LdsRadioGroup } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'

import { useFieldPreselection } from '../hooks/useFieldPreselection'

export const CustomRadioWidget: React.FC<WidgetProps> = ({
  id,
  options,
  value,
  disabled,
  readonly,
  onChange,
  uiSchema,
  schema,
  formContext,
}) => {
  const { enumOptions } = options

  // Simple preselection: if ui:options.selectedValue exists and value is empty, preselect it
  useFieldPreselection({
    value,
    selectedValue: uiSchema?.['ui:options']?.selectedValue as
      | string
      | undefined,
    enumValues: schema?.enum as string[] | undefined,
    formStatus: formContext?.formStatus,
    disabled,
    readonly,
    onChange,
  })

  return (
    <LdsRadioGroup indent densityClass="medium" label={''}>
      {enumOptions?.map(
        (option: { value: string; label: string }, index: number) => (
          <LdsRadio
            key={`${id}-radio-${option.value}-${index}`}
            id={`${id}-${option.value}`}
            name={id}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            disabled={disabled || readonly}
            onChange={() => onChange(option.value)}
          />
        )
      )}
    </LdsRadioGroup>
  )
}
