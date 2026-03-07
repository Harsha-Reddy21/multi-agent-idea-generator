import { LdsIcon } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import Multiselect from 'multiselect-react-dropdown'
import React from 'react'

import styles from './CustomMultiselectDropdown.module.scss'

export const CustomMultiselectDropdown: React.FC<WidgetProps> = ({
  options,
  value,
  disabled,
  readonly,
  onChange,
  placeholder,
}) => {
  const { enumOptions } = options

  // Transform enumOptions to the format expected by multiselect-react-dropdown
  const dropdownOptions =
    enumOptions?.map((option: { value: string; label: string }) => ({
      name: option.label,
      id: option.value,
    })) || []

  // Transform selected values to match the dropdown format
  const selectedValues = Array.isArray(value)
    ? dropdownOptions.filter(opt => value.includes(opt.id))
    : []

  const handleSelect = (selectedList: Array<{ name: string; id: string }>) => {
    const selectedIds = selectedList.map(item => item.id)
    onChange(selectedIds)
  }

  const handleRemove = (selectedList: Array<{ name: string; id: string }>) => {
    const selectedIds = selectedList.map(item => item.id)
    onChange(selectedIds)
  }

  return (
    <div
      className={styles.multiselectDropdown}
      data-testid="multiselect-dropdown"
    >
      <Multiselect
        avoidHighlightFirstOption={true}
        options={dropdownOptions}
        selectedValues={selectedValues}
        onSelect={handleSelect}
        onRemove={handleRemove}
        displayValue="name"
        placeholder={placeholder || 'Select...'}
        disable={disabled || readonly}
        showCheckbox={true}
        customCloseIcon={
          <LdsIcon name="x" inline className={styles.multiselectCloseIcon} />
        }
        hidePlaceholder={false}
        style={{
          multiselectContainer: {
            textAlign: 'left',
            direction: 'ltr',
          },
          optionContainer: {
            textAlign: 'left',
            direction: 'ltr',
          },
          option: {
            textAlign: 'left',
            direction: 'ltr',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          },
        }}
      />
    </div>
  )
}
