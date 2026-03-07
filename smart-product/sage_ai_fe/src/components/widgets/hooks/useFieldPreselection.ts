import { useEffect, useRef } from 'react'

import { FormStatus } from '@/core/models/form.model'

interface UseFieldPreselectionOptions {
  value: unknown
  selectedValue?: string
  enumValues?: string[]
  formStatus?: FormStatus
  disabled?: boolean
  readonly?: boolean
  onChange: (value: unknown) => void
}

export const useFieldPreselection = ({
  value,
  selectedValue,
  enumValues,
  formStatus,
  disabled,
  readonly,
  onChange,
}: UseFieldPreselectionOptions): void => {
  useEffect(() => {
    const isFormSubmitted = formStatus === FormStatus.Submitted
    const hasNoValue = value === undefined || value === null || value === ''

    // Only preselect if:
    // 1. selectedValue is specified
    // 2. Value is currently empty
    // 3. Form is not submitted
    // 4. Field is not disabled/readonly
    // 5. selectedValue exists in enum options
    if (
      selectedValue &&
      enumValues &&
      enumValues.includes(String(selectedValue)) &&
      hasNoValue &&
      !isFormSubmitted &&
      !disabled &&
      !readonly
    ) {
      // Use a small delay to ensure form data has loaded
      const timeoutId = setTimeout(() => {
        // Double-check value is still empty before preselecting
        if (value === undefined || value === null || value === '') {
          onChange(selectedValue)
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [
    value,
    selectedValue,
    enumValues,
    formStatus,
    disabled,
    readonly,
    onChange,
  ])
}

interface UseCheckboxPreselectionOptions {
  value: unknown[]
  shouldPreselect?: boolean
  preselectedEnumOption?: string
  formStatus?: FormStatus
  disabled?: boolean
  readonly?: boolean
  onChange: (value: unknown[]) => void
}

export const useCheckboxPreselection = ({
  value,
  shouldPreselect,
  preselectedEnumOption,
  formStatus,
  disabled,
  readonly,
  onChange,
}: UseCheckboxPreselectionOptions): void => {
  const hasPreselectedRef = useRef<boolean>(false)

  useEffect(() => {
    // Skip if we've already attempted preselection
    if (hasPreselectedRef.current) return

    const isFormSubmitted = formStatus === FormStatus.Submitted
    const hasNoValue = !value || (Array.isArray(value) && value.length === 0)

    if (
      shouldPreselect &&
      preselectedEnumOption &&
      hasNoValue &&
      !isFormSubmitted &&
      !disabled &&
      !readonly
    ) {
      // Only preselect if no value is currently set (empty array or undefined) and form is not submitted
      hasPreselectedRef.current = true
      onChange([preselectedEnumOption])
    }
  }, [
    value,
    shouldPreselect,
    preselectedEnumOption,
    formStatus,
    disabled,
    readonly,
    onChange,
  ])
}
