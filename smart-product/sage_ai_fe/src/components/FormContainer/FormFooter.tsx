import { LdsButton, LdsLoadingButton } from '@elilillyco/ux-lds-react'
import React, { useMemo, useRef, useState } from 'react'

import { FormStatus } from '@/core/models/form.model'

import { ButtonActionId, defaultButtonLabels } from '../../core/constants'
import { FooterButtonDescriptor } from '../../core/models/buttons.model'
import styles from './FormContainer.module.scss'
import { FooterButtonConfig, FormFooterProps } from './types'

/**
 * Calculates the total file size in bytes from all file fields in formData
 * @param formData - The form data object containing file uploads
 * @returns Total file size in bytes
 */
const calculateTotalFileSize = (
  formData: Record<string, unknown> | undefined
): number => {
  if (!formData) return 0

  let totalSize = 0

  for (const value of Object.values(formData)) {
    if (value instanceof File) {
      // Single file
      totalSize += value.size
    } else if (Array.isArray(value)) {
      // Array of files
      for (const item of value) {
        if (item instanceof File) {
          totalSize += item.size
        }
      }
    }
  }

  return totalSize
}

export const FormFooter: React.FC<FormFooterProps> = ({
  footerButtons,
  pageButtonIds,
  activePageIndex = 1,
  setActivePageIndex,
  formData,
  sticky = false,
  actionHandlerMap,
  formStatus,
}) => {
  // Use ref to always have the latest formData without causing re-renders
  const formDataRef = useRef(formData)
  formDataRef.current = formData
  const [saveDraftButtonState, setSaveDraftButtonState] = useState('ready')
  const [submitButtonState, setSubmitButtonState] = useState('ready')
  const [skipUploadButtonState, setSkipUploadButtonState] = useState('ready')

  const handleAsyncButtonAction = (
    action: string,
    parentHandler: (() => void | Promise<void>) | undefined
  ) => {
    if (!parentHandler) return
    let setStateFn: React.Dispatch<React.SetStateAction<string>> | null = null
    if (action === ButtonActionId.saveDraft)
      setStateFn = setSaveDraftButtonState
    else if (action === ButtonActionId.submit) setStateFn = setSubmitButtonState
    else if (action === ButtonActionId.skipUpload)
      setStateFn = setSkipUploadButtonState
    if (setStateFn) {
      setStateFn('loading')
      Promise.resolve(parentHandler())
        .then(() => setStateFn && setStateFn('success'))
        .catch(() => setStateFn && setStateFn('failure'))
        .finally(() => {
          setTimeout(() => setStateFn && setStateFn('ready'), 2000)
        })
    } else {
      parentHandler()
    }
  }

  const currentFooterButtons: FooterButtonConfig[] = useMemo(() => {
    // Calculate total file size to check if submit should be disabled
    const totalFileSize = calculateTotalFileSize(formData)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
    const isFileSizeExceeded = totalFileSize > MAX_FILE_SIZE

    // If explicit FooterButtonConfig[] still passed, honor it (backwards compatibility)
    if (footerButtons && footerButtons.length > 0) {
      // Apply file size check to submit buttons in explicit footerButtons
      return footerButtons.map(btn => {
        // Check if this is a submit button by label
        const isSubmitButton = btn.label === defaultButtonLabels.submit
        if (isSubmitButton) {
          return {
            ...btn,
            disabled: btn.disabled || isFileSizeExceeded, // Preserve existing disabled state and add file size check
          }
        }
        return btn
      })
    }

    // If pageButtonIds provided, map descriptors for current page
    if (pageButtonIds && setActivePageIndex) {
      const descriptors: FooterButtonDescriptor[] =
        pageButtonIds[activePageIndex] || []

      // Filter out submit and saveDraft actions when form is completed, but keep navigation buttons (next, prev, cancel)
      const filteredDescriptors =
        formStatus === FormStatus.Submitted
          ? descriptors.filter(
              d =>
                d.action !== ButtonActionId.submit &&
                d.action !== ButtonActionId.saveDraft &&
                d.action !== ButtonActionId.skipUpload
            )
          : descriptors

      return filteredDescriptors.map(d => {
        const parentHandler = actionHandlerMap?.[d.action]
        const wrapped = () => handleAsyncButtonAction(d.action, parentHandler)

        // Check if button should be disabled
        let isDisabled = d.whenDisabled ? d.whenDisabled() : false

        // Disable submit button if total file size exceeds 10MB
        if (d.action === ButtonActionId.submit && isFileSizeExceeded) {
          isDisabled = true
        }

        return {
          label: d.label || defaultButtonLabels[d.action],
          onClick: wrapped,
          disabled: isDisabled,
          type: d.type,
          className: d.className,
        }
      })
    }
    return []
  }, [
    footerButtons,
    pageButtonIds,
    activePageIndex,
    setActivePageIndex,
    actionHandlerMap,
    formStatus,
    formData, // Add formData to dependencies to re-evaluate button states when form data changes
  ])

  const footerClass = `${styles.formFooter} ${
    sticky ? styles['formFooter--sticky'] : ''
  }`.trim()

  return (
    <footer
      className={footerClass}
      data-testid="form-footer"
      aria-label="Form Footer"
    >
      {currentFooterButtons.map((btn, idx) => {
        if (btn.label === defaultButtonLabels.saveDraft) {
          return (
            <LdsLoadingButton
              buttonClasses={btn.type}
              key={idx}
              data-testid={`form-footer-btn-${idx}`}
              onClick={btn.onClick}
              state={saveDraftButtonState}
              disabled={btn.disabled}
            >
              <LdsLoadingButton.LabelDefault>
                {btn.label}
              </LdsLoadingButton.LabelDefault>
              <LdsLoadingButton.LabelLoading>
                Saving...
              </LdsLoadingButton.LabelLoading>
              <LdsLoadingButton.LabelSuccess>
                Saved
              </LdsLoadingButton.LabelSuccess>
              <LdsLoadingButton.LabelFailure>
                Failed
              </LdsLoadingButton.LabelFailure>
            </LdsLoadingButton>
          )
        }

        if (btn.label === defaultButtonLabels.skipUpload) {
          return (
            <LdsLoadingButton
              buttonClasses={btn.type}
              key={idx}
              data-testid={`form-footer-btn-${idx}`}
              onClick={btn.onClick}
              state={skipUploadButtonState}
              disabled={btn.disabled}
            >
              <LdsLoadingButton.LabelDefault>
                {btn.label}
              </LdsLoadingButton.LabelDefault>
              <LdsLoadingButton.LabelLoading>
                Submitting...
              </LdsLoadingButton.LabelLoading>
              <LdsLoadingButton.LabelSuccess>
                Submitted
              </LdsLoadingButton.LabelSuccess>
              <LdsLoadingButton.LabelFailure>
                Failed
              </LdsLoadingButton.LabelFailure>
            </LdsLoadingButton>
          )
        }

        if (btn.label === defaultButtonLabels.submit) {
          return (
            <LdsLoadingButton
              buttonClasses={btn.type}
              key={idx}
              data-testid={`form-footer-btn-${idx}`}
              onClick={btn.onClick}
              state={submitButtonState}
              disabled={btn.disabled}
            >
              <LdsLoadingButton.LabelDefault>
                {btn.label}
              </LdsLoadingButton.LabelDefault>
              <LdsLoadingButton.LabelLoading>
                Submitting...
              </LdsLoadingButton.LabelLoading>
              <LdsLoadingButton.LabelSuccess>
                Submitted
              </LdsLoadingButton.LabelSuccess>
              <LdsLoadingButton.LabelFailure>
                Failed
              </LdsLoadingButton.LabelFailure>
            </LdsLoadingButton>
          )
        }

        // Render regular LdsButton for other buttons
        return (
          <LdsButton
            key={idx}
            data-testid={`form-footer-btn-${idx}`}
            disabled={btn.disabled}
            aria-label={btn.label}
            onClick={btn.onClick}
            className={`formFooter__button`}
            classes={btn.type}
            icon={
              btn.label === defaultButtonLabels.next ? 'arrow-right' : undefined
            }
          >
            {btn.label}
          </LdsButton>
        )
      })}
    </footer>
  )
}
