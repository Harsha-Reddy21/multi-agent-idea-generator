import './EnhancedAIRegistryForm.module.scss'

import { LdsModal, useToastContext } from '@elilillyco/ux-lds-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { showToast } from '@/core/utils/toast.utils'

import { AIFeaturesProvider } from '../../contexts/AIFeaturesContext'
import { formsApi } from '../../core/api/forms.api'
import { ButtonActionId, FormDashboardFormType } from '../../core/constants'
import {
  ButtonActionType,
  FooterButtonDescriptor,
} from '../../core/models/buttons.model'
import { EnhancedAIRegistryFormProps } from '../../core/models/enhanced-ai-registry-form.model'
import { FormStatus, FormSubmitRequest } from '../../core/models/form.model'
import enhanceSchema from '../../core/schemas/enhance-AI-Registry-schema.json'
import { validateEntireForm } from '../../core/utils/button.utils'
import { extractFilesFromFormData } from '../../core/utils/file-upload-fields.util'
import { mapFormDataToApiFormat } from '../../core/utils/form-mapper.util'
import { FormContainer } from '../FormContainer/FormContainer'

export const EnhancedAIRegistryForm: React.FC<EnhancedAIRegistryFormProps> = ({
  isOpen,
  onClose,
  submissionId,
  aiRegistryFormId = '',
  onSuccess,
}) => {
  const { addToast } = useToastContext()
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [activePageIndex] = useState(1)

  // Cleanup when modal closes - reset form state
  useEffect(() => {
    if (!isOpen) {
      setFormData({})
    }
  }, [isOpen])

  const saveStateAndReload = useCallback(() => {
    // Find active tab
    const activeTabButton = document.querySelector('[role="tab"][aria-selected="true"]')
    
    if (activeTabButton) {
      // Get all tab buttons and find the index
      const allTabs = Array.from(document.querySelectorAll('[role="tab"]'))
      const tabIndex = allTabs.indexOf(activeTabButton)
      
      if (tabIndex !== -1) {
        const savedTabId = tabIndex + 1 // Convert 0-based to 1-based
        sessionStorage.setItem('dashboardActiveTab', savedTabId.toString())
      }
    }
    
    // Reload the page
    window.location.reload()
  }, [])

  const handleCancel = useCallback(() => {
    setFormData({})
    onClose()
    saveStateAndReload()
  }, [onClose, saveStateAndReload])

  const handleUpdate = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        // Convert RJSF form data to API format
        const formQuestions = mapFormDataToApiFormat(
          data,
          enhanceSchema.schema,
          enhanceSchema.uiSchema
        )

        // Prepare the payload for submission
        const payload: FormSubmitRequest = {
          action: 'submit',
          form_data: {
            form_data: formQuestions,
          },
        }
        console.log(data, enhanceSchema.uiSchema)
        // Extract files using shared utility
        const fileObjects = enhanceSchema?.uiSchema
          ? extractFilesFromFormData(data, enhanceSchema.uiSchema)
          : []
        console.log('fileObjects', fileObjects)
        // Submit form data to backend API with optional files
        await formsApi.submitForm(
          aiRegistryFormId,
          submissionId,
          payload,
          fileObjects
        )

        showToast({
          addToast,
          message: 'AI Registry form updated successfully.',
          variant: 'success',
        })

        setFormData({})

        // Call onSuccess callback which triggers parent refresh
        if (onSuccess) {
          await onSuccess()
        }

        // Close modal and refresh page with state preservation
        onClose()
        saveStateAndReload()
      } catch (error) {
        console.error('Error updating form:', error)
        showToast({
          addToast,
          message: 'Failed to update form. Please try again.',
          variant: 'error',
        })
        throw error
      }
    },
    [aiRegistryFormId, submissionId, onClose, addToast, onSuccess, saveStateAndReload]
  )

  // Button configuration - single page form
  const pageButtonIds: Record<number, FooterButtonDescriptor[]> = useMemo(
    () => ({
      1: [
        { action: ButtonActionId.cancel, type: 'outlined' },
        {
          action: ButtonActionId.update,
          whenDisabled: () =>
            aiRegistryFormId === '' ||
            !validateEntireForm(
              {
                schema: enhanceSchema.schema,
                uiSchema: enhanceSchema.uiSchema,
                tabSchema: [],
              },
              formData
            ),
        },
      ],
    }),
    [formData, aiRegistryFormId]
  )

  // Action handlers for buttons
  const actionHandlerMap: Record<ButtonActionType, () => void | Promise<void>> =
    useMemo(
      () => ({
        [ButtonActionId.cancel]: handleCancel,
        [ButtonActionId.prev]: () => {},
        [ButtonActionId.next]: () => {},
        [ButtonActionId.submit]: () => {},
        [ButtonActionId.skipUpload]: () => {},
        [ButtonActionId.saveDraft]: () => {},
        [ButtonActionId.update]: () => handleUpdate(formData),
      }),
      [formData, handleCancel, handleUpdate]
    )

  const pageDetails = [
    {
      title: 'Update Form',
      pageFieldCount: Object.keys(enhanceSchema.schema.properties || {}).length,
    },
  ]

  if (!isOpen) return null

  return (
    <LdsModal
      open={isOpen}
      modalId="enhanced-ai-registry-form-modal"
      closeModal={() => {
        setFormData({})
        onClose()
        saveStateAndReload()
      }}
      heading={`Update AI Registry Form for ${submissionId}`}
      ariaLabelledBy={`Update AI Registry Form for ${submissionId}`}
      modalSizeClass="col-12"
    >
      <AIFeaturesProvider>
        <FormContainer
          formTitle=""
          formSubtitle=""
          progressEnabled={false}
          breadcrumbs={[]}
          fields={[]}
          pageSize={0}
          activePageIndex={activePageIndex}
          setActivePageIndex={() => {}}
          pageDetails={pageDetails}
          schema={enhanceSchema.schema}
          uiSchema={enhanceSchema.uiSchema}
          formData={formData}
          setFormData={setFormData}
          onFormSubmit={handleUpdate}
          submissionId={submissionId}
          formType={FormDashboardFormType.AiRegistryForm}
          formStatus={FormStatus.InProgress}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={actionHandlerMap}
          sticky={false}
          hideSideImage={true}
        />
      </AIFeaturesProvider>
    </LdsModal>
  )
}

export default EnhancedAIRegistryForm
