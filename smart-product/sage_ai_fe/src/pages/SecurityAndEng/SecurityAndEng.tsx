import { LdsImage, useToastContext } from '@elilillyco/ux-lds-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  validateEntireForm,
  validatePageAnswers,
} from '@/core/utils/button.utils'
import { showToast } from '@/core/utils/toast.utils'
import { useScoreResponse } from '@/hooks/scoreResponse'

import aiIcon from '../../assets/ai_suggestion_Icon.svg'
import { FormContainer } from '../../components/FormContainer/FormContainer'
import { FormHeaderProps } from '../../components/FormContainer/types'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { AIFeaturesProvider } from '../../contexts/AIFeaturesContext'
import { formsApi } from '../../core/api/forms.api'
import { suggestionsApiService } from '../../core/api/suggestions.api'
import {
  // APPROVAL_SCORE_PREFIX,
  ButtonActionId,
  ExtendedFormDashboardFormType,
  FormDashboardFormType,
} from '../../core/constants'
import {
  ButtonActionType,
  FooterButtonDescriptor,
} from '../../core/models/buttons.model'
import {
  CommonFieldResponseModal,
  FormSchemaResponse,
  FormStatus,
  FormSubmitRequest,
} from '../../core/models/form.model'
import { SuggestionsResponse } from '../../core/models/suggestion.model'
import { clearHiddenConditionalFields } from '../../core/utils/button.utils'
import { extractFilesFromFormData } from '../../core/utils/file-upload-fields.util'
import {
  isFieldAIEnabled,
  mapApiFormatToFormData,
  mapFormDataToApiFormat,
  mergeCommonFieldsWithFormData,
} from '../../core/utils/form-mapper.util'
import styles from './SecurityAndEng.module.scss'

const SecurityAndEngInner: React.FC = () => {
  const navigate = useNavigate()
  const { addToast } = useToastContext()
  const { formId = '', submissionId = '' } = useParams<{
    formId: string
    submissionId: string
  }>()
  const [activePageIndex, setActivePageIndex] = useState(1)
  const [, setInitialFormData] = useState<Record<string, unknown>>({})
  const [updatedFormData, setUpdatedFormData] = useState<
    Record<string, unknown>
  >({})
  const [formSchema, setFormSchema] = useState<FormSchemaResponse | null>(null)
  const [formStatus, setFormStatus] = useState<string>(FormStatus.pending)
  const [isLoading, setIsLoading] = useState(true)
  const [suggestionsData, setSuggestionsData] =
    useState<SuggestionsResponse | null>(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const [commonFields, setCommonFields] = useState<
    CommonFieldResponseModal['common_fields'] | null
  >(null)
  const [files, setFiles] = useState<string[]>([])
  // Track if common fields have been merged to prevent duplicate merges
  const hasMergedCommonFields = useRef(false)
  // const approvalIndex =
  //   typeof localStorage !== 'undefined' &&
  //   typeof localStorage.getItem === 'function'
  //     ? localStorage.getItem(
  //         `${APPROVAL_SCORE_PREFIX}-${FormDashboardFormType.SecurityArchForm}-${submissionId}`
  //       )
  //     : null

  // Generate pageDetails from schema once loaded
  const pageDetails: { title: string; pageFieldCount: number }[] =
    formSchema?.tabSchema.map(tab => ({
      title: tab.title,
      pageFieldCount: tab.fields.length,
    })) || []

  // Fetch form schema first, then form data on component mount
  useEffect(() => {
    const fetchFormSchemaAndData = async () => {
      try {
        setIsLoading(true)

        // Step 1: Fetch form schema from mock API
        const schemaResponse = await formsApi.getFormSchema(
          ExtendedFormDashboardFormType.SecurityArchForm
        )
        setFormSchema(schemaResponse)

        // Step 2: Fetch form data using new API format
        try {
          const formDetailsResponse = await formsApi.getFormDetails(
            formId,
            submissionId
          )
          const response = formDetailsResponse.data

          // Set form status for disabling UI when submitted
          setFormStatus(response.status)

          // Extract files array from response - use archetype if present, otherwise empty array
          const extractedFiles =
            response?.files?.archetype &&
            Array.isArray(response.files.archetype)
              ? response.files.archetype
              : []
          setFiles(extractedFiles)

          // Convert API format (array of FormQuestion) to RJSF format (key-value pairs)
          let formData: Record<string, unknown> = {}

          if (
            response?.form_data?.form_data &&
            Array.isArray(response.form_data.form_data)
          ) {
            formData = mapApiFormatToFormData(
              response.form_data.form_data,
              schemaResponse.schema
            )
          }
          setInitialFormData(formData)
          setUpdatedFormData(formData)
        } catch (error) {
          // If form doesn't exist yet or error fetching, start with empty form
          console.warn('Starting with empty form:', error)
          setInitialFormData({})
          setUpdatedFormData({})
        }
      } catch (error) {
        console.error('Error fetching form schema:', error)
        // On error, continue with empty form
        setInitialFormData({})
        setUpdatedFormData({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchFormSchemaAndData()
  }, [])

  // Fetch common fields separately
  useEffect(() => {
    const fetchCommonFields = async () => {
      try {
        const commonFieldsResponse: CommonFieldResponseModal =
          await formsApi.getCommonFields({
            form_type: FormDashboardFormType.SecurityArchForm,
            submission_id: submissionId,
            form_id: formId,
          })
        setCommonFields(commonFieldsResponse?.common_fields)
      } catch (commonFieldsError) {
        console.warn('Failed to fetch common fields:', commonFieldsError)
      }
    }

    if (formId && submissionId && formSchema) {
      fetchCommonFields()
    }
  }, [formId, submissionId, formSchema])

  useEffect(() => {
    if (
      !hasMergedCommonFields.current &&
      !isLoading &&
      formStatus !== FormStatus.Submitted &&
      formSchema?.schema &&
      formSchema?.uiSchema &&
      commonFields &&
      commonFields.length > 0
    ) {
      console.log(formSchema, 'Form Schema')
      // Use functional update to get the latest formData
      setUpdatedFormData(currentFormData => {
        // Filter out AI-enabled fields from common fields before merging
        const filteredCommonFields: CommonFieldResponseModal = {
          common_fields: commonFields.filter(field => {
            // Only include fields that are NOT AI enabled
            return !isFieldAIEnabled(field.question_id, formSchema.uiSchema)
          }),
        }

        const mergedResult = mergeCommonFieldsWithFormData(
          currentFormData,
          filteredCommonFields,
          formSchema.schema
        )

        // Mark as merged to prevent duplicate merges
        hasMergedCommonFields.current = true

        // Return merged form data
        return mergedResult.formData || currentFormData
      })
    }
  }, [formSchema, formStatus, commonFields, isLoading])

  // Fetch suggestions data
  useEffect(() => {
    const fetchSuggestions = async () => {
      setSuggestionsLoading(true)
      setSuggestionsError(null)
      try {
        const data = await suggestionsApiService.getSuggestions(
          FormDashboardFormType.SecurityArchForm
        )
        setSuggestionsData(data)
      } catch (err) {
        setSuggestionsError('Cortex failed to load suggestions')
        console.error('Error fetching suggestions:', err)
      } finally {
        setSuggestionsLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  const header: FormHeaderProps = {
    formTitle: 'Security Architecture & Engineering',
    formSubtitle: (
      <>
        Click on the input fields with{' '}
        <LdsImage
          src={aiIcon}
          alt="AI Features Icon"
          aria-hidden="true"
          className={styles.aiIcon}
        />
        icon to explore AI features
      </>
    ),
    progressEnabled: true,
    breadcrumbs: [
      { text: 'Home', href: '/landing' },
      {
        text: 'Form Dashboard',
        href: `/form-dashboard/${submissionId}`,
      },
      {
        text: 'Security Architecture & Engineering',
        href: '/security-and-engineering',
      },
    ],
  }

  const handleFormSubmit = async (e: Record<string, unknown>) => {
    try {
      if (!formSchema) {
        console.error('Form schema not loaded')
        return
      }

      // Clear hidden conditional fields before submission
      const clearedData = clearHiddenConditionalFields(formSchema, e)

      // Convert RJSF form data to API format
      const formQuestions = mapFormDataToApiFormat(
        clearedData,
        formSchema.schema,
        formSchema.uiSchema
      )

      // Prepare the payload for submission
      const payload: FormSubmitRequest = {
        action: 'submit',
        form_data: {
          form_data: formQuestions,
        },
      }

      // Extract files using shared utility
      const fileObjects = formSchema?.uiSchema
        ? extractFilesFromFormData(e, formSchema.uiSchema)
        : []

      // Submit form data to backend API with optional files
      await formsApi.submitForm(formId, submissionId, payload, fileObjects)

      // Show success toast immediately; scoring happens in the background
      showToast({
        addToast,
        message:
          'Your "Security Architecture & Engineering" form has been submitted successfully.',
        variant: 'success',
      })

      // Navigate to dashboard on successful submission
      navigate(`/form-dashboard/${submissionId}`)

      // Kick off scoring in background; don't block navigation or toast
      void useScoreResponse(
        submissionId,
        FormDashboardFormType.SecurityArchForm,
        formQuestions
      )
    } catch (error) {
      console.error('Error submitting form:', error)
      showToast({
        addToast,
        message: 'Failed to submit form. Please try again.',
        variant: 'error',
      })
    }
  }

  const handleSaveDraft = async (e: Record<string, unknown>) => {
    try {
      if (!formSchema?.schema) {
        console.error('Form schema not loaded')
        return
      }

      // Clear hidden conditional fields before saving
      const clearedData = clearHiddenConditionalFields(formSchema, e)

      // Convert RJSF form data to API format
      const formQuestions = mapFormDataToApiFormat(
        clearedData,
        formSchema.schema,
        formSchema.uiSchema
      )

      // Prepare the payload for saving as draft
      const payload: FormSubmitRequest = {
        action: 'save',
        form_data: {
          form_data: formQuestions,
        },
      }

      // Extract files using shared utility
      const fileObjects = formSchema?.uiSchema
        ? extractFilesFromFormData(e, formSchema.uiSchema)
        : []

      // Save form data as draft with optional files
      await formsApi.submitForm(formId, submissionId, payload, fileObjects)
      // Navigate to dashboard on successful save
      navigate(`/form-dashboard/${submissionId}`)
      // Kick off scoring in background; don't block navigation
      void useScoreResponse(
        submissionId,
        FormDashboardFormType.SecurityArchForm,
        formQuestions
      )
    } catch (error) {
      console.error('Error saving draft:', error)
      // You can add error notification here
    }
  }

  const pageButtonIds: Record<number, FooterButtonDescriptor[]> = useMemo(
    () => ({
      1: [
        { action: ButtonActionId.cancel, type: 'outlined' },
        { action: ButtonActionId.saveDraft, type: 'outlined' },
        {
          action: ButtonActionId.next,
          whenDisabled: () =>
            !validatePageAnswers(formSchema, 1, updatedFormData),
        },
      ],
      2: [
        { action: ButtonActionId.prev, type: 'outlined' },
        { action: ButtonActionId.saveDraft, type: 'outlined' },
        {
          action: ButtonActionId.next,
          whenDisabled: () =>
            !validatePageAnswers(formSchema, 2, updatedFormData),
        },
      ],
      3: [
        { action: ButtonActionId.prev, type: 'outlined' },
        { action: ButtonActionId.saveDraft, type: 'outlined' },
        {
          action: ButtonActionId.next,
          whenDisabled: () =>
            !validatePageAnswers(formSchema, 3, updatedFormData),
        },
      ],
      4: [
        { action: ButtonActionId.prev, type: 'outlined' },
        { action: ButtonActionId.saveDraft, type: 'outlined' },
        {
          action: ButtonActionId.next,
          whenDisabled: () =>
            !validatePageAnswers(formSchema, 4, updatedFormData),
        },
      ],
      5: [
        { action: ButtonActionId.prev, type: 'outlined' },
        { action: ButtonActionId.saveDraft, type: 'outlined' },
        {
          action: ButtonActionId.next,
          whenDisabled: () =>
            !validatePageAnswers(formSchema, 5, updatedFormData),
        },
      ],
      6: [
        { action: ButtonActionId.prev, type: 'outlined' },
        { action: ButtonActionId.saveDraft, type: 'outlined' },
        {
          action: ButtonActionId.submit,
          whenDisabled: () => !validateEntireForm(formSchema, updatedFormData),
        },
      ],
    }),
    [formSchema, updatedFormData]
  )

  const actionHandlerMap: Record<ButtonActionType, () => void | Promise<void>> =
    useMemo(
      () => ({
        [ButtonActionId.cancel]: () =>
          navigate(`/form-dashboard/${submissionId}`),
        [ButtonActionId.prev]: () =>
          setActivePageIndex(p => Math.max(1, p - 1)),
        [ButtonActionId.next]: () => setActivePageIndex(p => p + 1),
        [ButtonActionId.submit]: () => handleFormSubmit(updatedFormData),
        [ButtonActionId.skipUpload]: () => handleFormSubmit(updatedFormData),
        [ButtonActionId.saveDraft]: () => handleSaveDraft(updatedFormData),
        [ButtonActionId.update]: () => {},
      }),
      [navigate, submissionId, updatedFormData]
    )

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activePageIndex])

  if (isLoading || !formSchema) {
    return <LoadingSpinner message="Loading form data...." />
  }

  // We pass an empty fields array; FormContent uses schema/uiSchema directly for RJSF fields
  return (
    <main className={styles.mainContainer}>
      <FormContainer
        formTitle={header.formTitle}
        formSubtitle={header.formSubtitle}
        progressEnabled={header.progressEnabled}
        // For now this feature is only for AI Registry. Temporarily disabled for other forms.
        // approvalIndexPercentage={
        //   approvalIndex ? Number(approvalIndex) : undefined
        // }
        breadcrumbs={header.breadcrumbs}
        fields={[]} // not used by RJSF pagination variant
        pageSize={0}
        activePageIndex={activePageIndex}
        setActivePageIndex={setActivePageIndex}
        pageDetails={pageDetails}
        schema={formSchema.schema}
        uiSchema={formSchema.uiSchema}
        formData={updatedFormData}
        setFormData={setUpdatedFormData}
        onFormSubmit={e => handleFormSubmit(e)}
        submissionId={submissionId}
        formType={FormDashboardFormType.SecurityArchForm}
        formStatus={formStatus}
        pageButtonIds={pageButtonIds}
        actionHandlerMap={actionHandlerMap}
        suggestionsData={suggestionsData}
        suggestionsLoading={suggestionsLoading}
        suggestionsError={suggestionsError}
        commonFields={commonFields}
        files={files}
      />
    </main>
  )
}

const SecurityAndEng: React.FC = () => {
  return (
    <AIFeaturesProvider>
      <SecurityAndEngInner />
    </AIFeaturesProvider>
  )
}

export default SecurityAndEng
