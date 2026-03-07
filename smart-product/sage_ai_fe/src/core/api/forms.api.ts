import { ExtendedFormDashboardFormType } from '../constants'
import {
  CommonFieldRequestModal,
  CommonFieldResponseModal,
  FormDetailsResponse,
  FormRequestPayload,
  FormResponsePayload,
  FormSchemaResponse,
  FormSubmitRequest,
  FormSubmitResponse,
} from '../models/form.model'
import {
  GetReviewAnswerRequest,
  GetReviewAnswerResponse,
} from '../models/review-answer.model'
import aiRegistrySchema from '../schemas/ai-registry-schema.json'
import beginSubmissionSchema from '../schemas/begin-submission-schema.json'
import digitalLegalOfficeSchema from '../schemas/digital-legal-office-schema.json'
import gcoDigitalRiskRegistrySchema from '../schemas/gco-digital-risk-registry-schema.json'
import ideaSubmissionSchema from '../schemas/idea-sub-schema.json'
import securityAndEngSchema from '../schemas/security-and-eng-schema.json'
import wnvVendorEngagementSchema from '../schemas/wnv-vendor-engagement.json'
import WORKING_WITH_THIRD_PARTY_SCHEMA from '../schemas/working-withtthird-party-schema.json'
import { BaseApiService } from './base.api'

class FormApi extends BaseApiService {
  constructor() {
    super('forms')
  }

  //TODO: REPLACE with actual API call
  async getFormSchema(
    formSchema:
      | ExtendedFormDashboardFormType.AiRegistryForm
      | ExtendedFormDashboardFormType.BeginSubmissionForm
      | ExtendedFormDashboardFormType.IdeaSubForm
      | ExtendedFormDashboardFormType.SecurityArchForm
      | ExtendedFormDashboardFormType.DloForm
      | ExtendedFormDashboardFormType.GcoRiskRegistryForm
      | ExtendedFormDashboardFormType.WwtpForm
      | ExtendedFormDashboardFormType.WnvVendorEngagementForm,
    delay: number = 0
  ): Promise<FormSchemaResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Select the appropriate schema based on the formSchema parameter
          let schemaData: FormSchemaResponse

          switch (formSchema) {
            case ExtendedFormDashboardFormType.AiRegistryForm:
              schemaData = aiRegistrySchema as FormSchemaResponse
              break
            case ExtendedFormDashboardFormType.BeginSubmissionForm:
              schemaData = beginSubmissionSchema as FormSchemaResponse
              break
            case ExtendedFormDashboardFormType.IdeaSubForm:
              schemaData = ideaSubmissionSchema as FormSchemaResponse
              break
            case ExtendedFormDashboardFormType.SecurityArchForm:
              schemaData = securityAndEngSchema as FormSchemaResponse
              break
            case ExtendedFormDashboardFormType.DloForm:
              // For now, reuse one of the existing schemas as a placeholder
              schemaData = digitalLegalOfficeSchema as FormSchemaResponse
              break
            case ExtendedFormDashboardFormType.GcoRiskRegistryForm:
              schemaData = gcoDigitalRiskRegistrySchema as FormSchemaResponse
              break
            case ExtendedFormDashboardFormType.WwtpForm:
              schemaData = WORKING_WITH_THIRD_PARTY_SCHEMA as FormSchemaResponse
              break
            case ExtendedFormDashboardFormType.WnvVendorEngagementForm:
              schemaData = wnvVendorEngagementSchema as FormSchemaResponse
              break
            default:
              reject(new Error(`Unknown form schema type: ${formSchema}`))
              return
          }

          resolve(schemaData)
        } catch {
          reject(new Error('Failed to fetch form schema'))
        }
      }, delay + 1) // +1 to account for setTimeout inaccuracies in unit testing
    })
  }

  //TODO: REMOVE when all forms use new API
  async getFormData(formSchemaId: string): Promise<FormResponsePayload> {
    return this.get('', {
      params: {
        form_schema_id: formSchemaId,
      },
    })
  }

  //TODO: REMOVE when all forms use new API
  async submitFormData(
    payload: FormRequestPayload
  ): Promise<FormResponsePayload> {
    return this.post(payload)
  }

  async getFormDetails(
    formId: string,
    submissionId: string
  ): Promise<FormDetailsResponse> {
    return this.get('/get-form-details', {
      params: {
        'form-id': formId,
        'submission-id': submissionId,
      },
    })
  }

  async submitForm(
    formId: string,
    submissionId: string,
    payload: FormSubmitRequest,
    files?: File[]
  ): Promise<FormSubmitResponse> {
    // Create FormData for multipart/form-data request
    const formData = new FormData()

    // Add form_data as JSON string
    formData.append('form_data', JSON.stringify(payload.form_data))

    // Add action
    formData.append('action', payload.action)

    // Add files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file)
      })
    }

    return this.put<FormSubmitResponse, FormData>(formData, '/submit-form', {
      params: {
        'form-id': formId,
        'submission-id': submissionId,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async getReviewAnswer(
    request: GetReviewAnswerRequest
  ): Promise<GetReviewAnswerResponse> {
    return this.post<GetReviewAnswerResponse, GetReviewAnswerRequest>(
      request,
      '/review-answers'
    )
  }

  async getCommonFields(
    payload: CommonFieldRequestModal
  ): Promise<CommonFieldResponseModal> {
    return this.post<CommonFieldResponseModal, CommonFieldRequestModal>(
      payload,
      '/auto-populate/common-fields'
    )
  }
}

export const formsApi = new FormApi()
