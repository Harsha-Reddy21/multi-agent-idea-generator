import { LdsImage, useToastContext } from '@elilillyco/ux-lds-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { validatePageAnswers } from '@/core/utils/button.utils'
import { showToast } from '@/core/utils/toast.utils'

import aiIcon from '../../assets/ai_suggestion_Icon.svg'
import { FormContainer } from '../../components/FormContainer/FormContainer'
import { FormHeaderProps } from '../../components/FormContainer/types'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { AIFeaturesProvider } from '../../contexts/AIFeaturesContext'
import { formsApi } from '../../core/api/forms.api'
import { suggestionsApiService } from '../../core/api/suggestions.api'
import {
  ButtonActionId,
  ExtendedFormDashboardFormType,
  FormDashboardFormType,
} from '../../core/constants'
import {
  ButtonActionType,
  FooterButtonDescriptor,
} from '../../core/models/buttons.model'
import {
  FormSchemaResponse,
  FormStatus,
  FormSubmitRequest,
} from '../../core/models/form.model'
import { SuggestionsResponse } from '../../core/models/suggestion.model'
import { clearHiddenConditionalFields } from '../../core/utils/button.utils'
import {
  mapApiFormatToFormData,
  mapFormDataToApiFormat,
} from '../../core/utils/form-mapper.util'
import styles from './IdeaSubmissionForm.module.scss'

const IdeaSubmissionFormInner: React.FC = () => {
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
          ExtendedFormDashboardFormType.IdeaSubForm
        )
        setFormSchema(schemaResponse)

        // Step 2: Fetch form data using new API format
        try {
          const response = await formsApi.getFormDetails(formId, submissionId)
          // Set form status for disabling UI when submitted

          setFormStatus(response.data.status)

          // Convert API format (array of FormQuestion) to RJSF format (key-value pairs)
          if (response.data?.form_data?.form_data && schemaResponse.schema) {
            const formData = mapApiFormatToFormData(
              response.data.form_data.form_data,
              schemaResponse.schema
            )
            setInitialFormData(formData)
            setUpdatedFormData(formData)
          }
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

  // Fetch suggestions data
  useEffect(() => {
    const fetchSuggestions = async () => {
      setSuggestionsLoading(true)
      setSuggestionsError(null)
      try {
        const data = await suggestionsApiService.getSuggestions(
          FormDashboardFormType.IdeaSubForm
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activePageIndex])

  const header: FormHeaderProps = {
    formTitle: 'Solution/System Overview',
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
        text: 'Solution/System Overview',
        href: '/idea-submission',
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

      // Submit form data to backend API
      await formsApi.submitForm(formId, submissionId, payload)

      // Show success toast
      showToast({
        addToast,
        message:
          'Your "System / Solution Overview" form has been submitted successfully.',
        variant: 'success',
      })

      // Navigate to dashboard on successful submission
      navigate(`/form-dashboard/${submissionId}`)
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

      // Save form data as draft using new format
      await formsApi.submitForm(formId, submissionId, payload)
      // Navigate to dashboard on successful save
      navigate(`/form-dashboard/${submissionId}`)
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
          action: ButtonActionId.submit,
          whenDisabled: () =>
            !validatePageAnswers(formSchema, 1, updatedFormData),
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

  if (isLoading || !formSchema) {
    return <LoadingSpinner message="Loading form data...." />
  }

  // We pass an empty fields array; FormContent uses schema/uiSchema directly for RJSF fields
  return (
    <main className={styles.mainContainer}>
      <FormContainer
        formTitle={header.formTitle}
        formSubtitle={header.formSubtitle}
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
        formType={FormDashboardFormType.IdeaSubForm}
        formStatus={formStatus}
        pageButtonIds={pageButtonIds}
        actionHandlerMap={actionHandlerMap}
        suggestionsData={suggestionsData}
        suggestionsLoading={suggestionsLoading}
        suggestionsError={suggestionsError}
        progressEnabled={false}
      />
    </main>
  )
}

const IdeaSubmissionForm: React.FC = () => {
  return (
    <AIFeaturesProvider>
      <IdeaSubmissionFormInner />
    </AIFeaturesProvider>
  )
}

export default IdeaSubmissionForm
