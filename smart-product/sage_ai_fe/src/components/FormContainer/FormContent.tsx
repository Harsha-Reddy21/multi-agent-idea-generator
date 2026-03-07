import { useToastContext } from '@elilillyco/ux-lds-react'
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import React, { useMemo, useRef } from 'react'

import { useAIFeatures } from '../../contexts/AIFeaturesContext'
import { clearHiddenConditionalFields } from '../../core/utils/button.utils'
import AIFeaturesCard from '../AIFeaturesCard/AIFeaturesCard'
import { CustomFieldTemplate } from '../templates'
import { customWidgets } from '../widgets'
import styles from './FormContainer.module.scss'
import { FormContentProps } from './types'

export const FormContent: React.FC<FormContentProps> = ({
  activePageIndex,
  pageFieldCounts,
  pageDetails,
  pageSize,
  schema,
  uiSchema,
  formData,
  setFormData,
  submissionId,
  formType,
  formStatus,
  suggestionsData,
  suggestionsLoading,
  suggestionsError,
  commonFields,
  files,
}) => {
  const formRef = useRef<Form>(null)
  const aiFeatures = useAIFeatures()
  const { addToast } = useToastContext()

  // Get form-id from URL
  const formId = useMemo(() => {
    const urlParts = window.location.pathname.split('/')
    return urlParts[2] || '' // Index 0 is empty, 1 is 'idea-submission', 2 is form-id
  }, [])

  // Update submission info in context when submissionId or formId changes
  React.useEffect(() => {
    if (submissionId && formId) {
      aiFeatures.updateSubmissionInfo(submissionId, formId)
    }
  }, [submissionId, formId, aiFeatures])

  // Close AI Features Card when page changes (tab change)
  React.useEffect(() => {
    if (aiFeatures.isVisible) {
      aiFeatures.hideAIFeatures()
    }
  }, [activePageIndex])

  // Determine ordered field ids from uiSchema
  const orderedFieldIds: string[] =
    (uiSchema as any)['ui:order'] ||
    Object.keys((schema as any).properties || {})

  // Build pages using pageDetails (preferred), fallback to pageFieldCounts, then pageSize
  const pages = useMemo(() => {
    if (Array.isArray(pageDetails) && pageDetails.length > 0) {
      const result: string[][] = []
      let cursor = 0
      pageDetails.forEach(detail => {
        result.push(
          orderedFieldIds.slice(cursor, cursor + detail.pageFieldCount)
        )
        cursor += detail.pageFieldCount
      })
      return result
    }
    if (Array.isArray(pageFieldCounts) && pageFieldCounts.length > 0) {
      const result: string[][] = []
      let cursor = 0
      pageFieldCounts.forEach(count => {
        result.push(orderedFieldIds.slice(cursor, cursor + count))
        cursor += count
      })
      return result
    }
    const size =
      typeof pageSize === 'number' && pageSize > 0
        ? pageSize
        : orderedFieldIds.length
    const result: string[][] = []
    for (let i = 0; i < orderedFieldIds.length; i += size) {
      result.push(orderedFieldIds.slice(i, i + size))
    }
    return result
  }, [pageDetails, pageFieldCounts, pageSize, orderedFieldIds])

  const dynamicUiSchema = useMemo(() => {
    const pageIndex = (activePageIndex || 1) - 1
    const activeFields = pages[pageIndex] || []
    const hidden: Record<string, { 'ui:hidden': boolean }> = {}
    orderedFieldIds.forEach(id => {
      if (!activeFields.includes(id)) hidden[id] = { 'ui:hidden': true }
    })
    return { ...uiSchema, ...hidden }
  }, [activePageIndex, pages, orderedFieldIds, uiSchema])

  const handleExtractClick = (fullAnswer: string) => {
    // Find the field in formData and update it
    const questionKey = aiFeatures.questionId
    if (questionKey && formRef.current) {
      const newFormData = {
        ...formData,
        [questionKey]: fullAnswer,
      }
      setFormData(newFormData)

      // Update enhance button state based on extracted text length
      const trimmedText = fullAnswer.trim()
      const shouldEnableEnhance = trimmedText.length > 25
      aiFeatures.updateEnhanceAnswerEnabledForQuestion(
        questionKey,
        shouldEnableEnhance
      )

      // Update input value in context
      aiFeatures.updateInputValue(fullAnswer)
    }
  }

  return (
    <div
      className={styles.formContent}
      data-testid="form-content"
      aria-label="Form Content"
    >
      <div className={styles.formContent__fieldsWrapper}>
        <Form
          ref={formRef}
          schema={schema as never}
          uiSchema={dynamicUiSchema as never}
          formData={formData}
          validator={validator as never}
          widgets={customWidgets}
          templates={{ FieldTemplate: CustomFieldTemplate }}
          formContext={{
            submissionId,
            formType,
            formData: formData,
            formStatus,
            files: files || [],
          }}
          onChange={e => {
            const newFormData = e.formData || {}
            // Clear hidden conditional fields based on current selections
            const clearedData = clearHiddenConditionalFields(
              { schema, uiSchema, tabSchema: [] },
              newFormData
            )
            setFormData(clearedData)
          }}
          onSubmit={() => {
            addToast({
              toastMessage: 'Form submitted successfully!',
              variant: 'success',
            })
          }}
        >
          <button type="submit" style={{ display: 'none' }} />
        </Form>
      </div>
      {formStatus !== 'completed' && (
        <AIFeaturesCard
          isVisible={aiFeatures.isVisible}
          onClose={() => aiFeatures.hideAIFeatures()}
          questionText={aiFeatures.questionText}
          questionId={aiFeatures.questionId}
          submissionId={aiFeatures.submissionId}
          formId={aiFeatures.formId}
          inputValue={aiFeatures.inputValue}
          suggestionsData={suggestionsData}
          suggestionsLoading={suggestionsLoading}
          suggestionsError={suggestionsError}
          onExtractClick={handleExtractClick}
          dataExtractOnly={aiFeatures.dataExtractOnly}
          commonFields={commonFields}
          formContext={{
            submissionId,
            formType,
            formData: formData,
            formStatus,
            files: files || [],
          }}
        />
      )}
    </div>
  )
}

export default FormContent
