import {
  BeginFormRequestModel,
  BeginFormResponseModel,
} from '../models/begin-form.model'
import { BaseApiService } from './base.api'

export class UploadService extends BaseApiService {
  constructor() {
    super('forms')
  }

  async initialSubmissionBegin(
    formData: BeginFormRequestModel
  ): Promise<BeginFormResponseModel> {
    try {
      // Create FormData object for multipart/form-data
      const formDataPayload = new FormData()

      // Append submission_journey as JSON string
      formDataPayload.append(
        'submission_journey',
        JSON.stringify(formData.submission_journey)
      )

      // Append each file
      formData.files.forEach(file => {
        formDataPayload.append('files', file)
      })

      const response = await this.api.post<BeginFormResponseModel>(
        'submit-idea',
        formDataPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error('Failed submitting initial form data.')
    }
  }

  validateMultipleFiles(
    files: File[],
    maxTotalSizeInMB: number = 10
  ): { valid: boolean; errors: { error: string }[] } {
    const errors: { error: string }[] = []
    const maxTotalSizeInBytes = maxTotalSizeInMB * 1024 * 1024
    const allowedTypes: string[] = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    let totalFileSize = 0
    for (const file of files) {
      totalFileSize += file.size

      // Check file type against allowed types
      if (!allowedTypes.includes(file.type)) {
        errors.push({
          error: `${file.name} not allowed, Only .docx/.doc/.pdf/.pptx files are allowed.`,
        })
      }
    }

    // Check total file size
    if (totalFileSize > maxTotalSizeInBytes) {
      errors.push({
        error: `Total file size exceeds ${maxTotalSizeInMB}MB limit (${(totalFileSize / (1024 * 1024)).toFixed(2)}MB)`,
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

export const uploadService = new UploadService()
export default uploadService
