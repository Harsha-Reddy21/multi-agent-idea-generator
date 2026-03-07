import { useToastContext } from '@elilillyco/ux-lds-react'
import { LdsLoadingSpinner } from '@elilillyco/ux-lds-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ButtonActionId, ExtendedFormDashboardFormType } from '@/core/constants'
import {
  clearHiddenConditionalFields,
  validatePageAnswers,
} from '@/core/utils/button.utils'
import { showToast } from '@/core/utils/toast.utils'

import { FormContainer } from '../../components/FormContainer/FormContainer'
import { FormHeaderProps } from '../../components/FormContainer/types'
import { AIFeaturesProvider } from '../../contexts/AIFeaturesContext'
import { formsApi } from '../../core/api/forms.api'
import { uploadService } from '../../core/api/upload.api'
import {
  BeginFormRequestModel,
  BeginFormResponseModel,
} from '../../core/models/begin-form.model'
import {
  ButtonActionType,
  FooterButtonDescriptor,
} from '../../core/models/buttons.model'
import { FormSchemaResponse } from '../../core/models/form.model'
import { mapFormDataToApiFormat } from '../../core/utils/form-mapper.util'
import styles from './BeginSubmission.module.scss'

const BeginSubmission: React.FC = () => {
  const navigate = useNavigate()
  const { addToast } = useToastContext()
  const [activePageIndex, setActivePageIndex] = useState(1)
  const [updatedFormData, setUpdatedFormData] = useState<
    Record<string, unknown>
  >({})
  const [formSchema, setFormSchema] = useState<FormSchemaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([])
  const [lastValidationErrorShown, setLastValidationErrorShown] =
    useState<string>('')

  // Generate pageDetails from schema once loaded
  const pageDetails: { title: string; pageFieldCount: number }[] =
    formSchema?.tabSchema.map(tab => ({
      title: tab.title,
      pageFieldCount: tab.fields.length,
    })) || []

  // Fetch form schema on component mount
  useEffect(() => {
    const fetchFormSchema = async () => {
      try {
        setIsLoading(true)
        // Fetch form schema from API
        const schemaResponse = await formsApi.getFormSchema(
          ExtendedFormDashboardFormType.BeginSubmissionForm
        )
        setFormSchema(schemaResponse)
      } catch (error) {
        console.error('Error fetching form schema:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFormSchema()
  }, [])

  // Validate files whenever form data changes
  useEffect(() => {
    const filesValue = updatedFormData['BS-Q5']
    if (Array.isArray(filesValue) && filesValue.length > 0) {
      let fileObjects: File[] = []
      if (filesValue.every(item => item instanceof File)) {
        fileObjects = filesValue
      }

      if (fileObjects.length > 0) {
        const validation = uploadService.validateMultipleFiles(fileObjects)
        if (!validation.valid) {
          const errorMessages = validation.errors.map(err => err.error)
          setFileValidationErrors(errorMessages)
          // Show a single consolidated toast with all errors, but only if it's different from the last one shown
          const consolidatedError = errorMessages.join('|')
          if (consolidatedError !== lastValidationErrorShown) {
            setLastValidationErrorShown(consolidatedError)
            showToast({
              addToast,
              message: (
                <div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
                  {errorMessages.join('\n')}
                </div>
              ),
              variant: 'error',
              timeout: 8000,
            })
          }
        } else {
          setFileValidationErrors([])
          setLastValidationErrorShown('')
        }
      } else {
        setFileValidationErrors([])
        setLastValidationErrorShown('')
      }
    } else {
      setFileValidationErrors([])
      setLastValidationErrorShown('')
    }
  }, [updatedFormData, addToast, lastValidationErrorShown])

  const header: FormHeaderProps = {
    formTitle: "Let's Get Started",
    progressEnabled: true,
    breadcrumbs: [
      { text: 'Home', href: '/landing' },
      {
        text: 'Begin Submission',
        href: '/begin',
      },
    ],
  }

  // Button configuration logic per page:
  const pageButtonIds: Record<number, FooterButtonDescriptor[]> = useMemo(
    () => ({
      1: [
        { action: ButtonActionId.cancel, type: 'outlined' },
        {
          action: ButtonActionId.next,
          whenDisabled: () =>
            !formSchema || !validatePageAnswers(formSchema, 1, updatedFormData),
        },
      ],
      2: [
        { action: ButtonActionId.prev, type: 'outlined' },
        {
          action: ButtonActionId.skipUpload,
          type: 'outlined',
          // Skip upload button is always enabled (no file required)
          whenDisabled: () => false,
        },
        {
          action: ButtonActionId.submit,
          // Submit button requires at least one file to be uploaded and no validation errors
          whenDisabled: () => {
            const filesValue = updatedFormData['BS-Q5']
            const hasFiles = Array.isArray(filesValue) && filesValue.length > 0
            const hasValidationErrors = fileValidationErrors.length > 0
            return !hasFiles || hasValidationErrors
          },
        },
      ],
    }),
    [formSchema, updatedFormData, fileValidationErrors]
  )

  const handleFormSubmit = async (
    formData: Record<string, unknown>,
    hasFiles: boolean
  ) => {
    if (!formSchema) {
      showToast({
        addToast,
        message: 'Form schema not loaded. Please try again.',
        variant: 'error',
      })
      return
    }
    try {
      setIsUploading(true)
      // Clear hidden conditional fields before submission
      const clearedData = clearHiddenConditionalFields(formSchema, formData)

      const formQuestions = mapFormDataToApiFormat(
        clearedData,
        formSchema.schema,
        formSchema.uiSchema
      )
      let fileObjects: File[] = []
      if (hasFiles) {
        const filesValue = formData['BS-Q5']

        if (Array.isArray(filesValue)) {
          if (filesValue.every(item => item instanceof File)) {
            fileObjects = filesValue
          }
        }
      }

      // Build request payload with formQuestions and files (empty array if no files)
      const beginFormRequest: BeginFormRequestModel = {
        submission_journey: { form_data: formQuestions },
        files: hasFiles ? fileObjects : [], // Will be populated array or empty array
      }

      // Call API with formQuestions and files (or empty array)
      const response: BeginFormResponseModel =
        await uploadService.initialSubmissionBegin(beginFormRequest)
      // Show success message
      if (response.data && response.data.id) {
        // Only start extraction if files were uploaded
        const shouldStartExtraction = fileObjects.length > 0
        navigate(`/form-dashboard/${response.data.id}`, {
          state: { startExtraction: shouldStartExtraction },
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      showToast({
        addToast,
        message: `Failed to submit form: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Button business logic:
  const actionHandlerMap: Record<ButtonActionType, () => void | Promise<void>> =
    useMemo(
      () => ({
        [ButtonActionId.cancel]: () => navigate('/landing'),
        [ButtonActionId.prev]: () =>
          setActivePageIndex(p => Math.max(1, p - 1)),
        [ButtonActionId.next]: () => setActivePageIndex(p => p + 1),
        [ButtonActionId.submit]: () => handleFormSubmit(updatedFormData, true),
        [ButtonActionId.skipUpload]: () =>
          handleFormSubmit(updatedFormData, false),
        [ButtonActionId.saveDraft]: () => Promise.resolve(),
        [ButtonActionId.update]: () => {},
      }),
      [navigate, updatedFormData, formSchema, addToast]
    )

  if (isLoading || !formSchema) {
    return (
      <main className={styles.loadingContainer}>
        <div className={styles.loadingMessage}>Loading form data...</div>
      </main>
    )
  }

  return (
    <AIFeaturesProvider>
      <main className={styles.beginSubmissionPage}>
        <FormContainer
          formTitle={header.formTitle}
          formSubtitle={header.formSubtitle}
          progressEnabled={header.progressEnabled}
          breadcrumbs={header.breadcrumbs}
          fields={[]}
          pageSize={0}
          activePageIndex={activePageIndex}
          setActivePageIndex={setActivePageIndex}
          pageDetails={pageDetails}
          schema={formSchema.schema}
          uiSchema={formSchema.uiSchema}
          formData={updatedFormData}
          setFormData={setUpdatedFormData}
          skipDocumentUpload={true}
          sticky={true}
          pageButtonIds={pageButtonIds}
          actionHandlerMap={actionHandlerMap}
        />
        {isUploading && (
          <div className={styles.uploadingOverlay}>
            <div className={styles.uploadingModal}>
              <div>
                <LdsLoadingSpinner className="primary" />
              </div>
              <h3>Creating submission...</h3>
              <p>Please wait while we create your submission.</p>
            </div>
          </div>
        )}
      </main>
    </AIFeaturesProvider>
  )
}

export default BeginSubmission
