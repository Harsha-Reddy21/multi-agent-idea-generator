import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExtendedFormDashboardFormType } from '../constants'
import { FormStatus } from '../models/form.model'
import { formsApi } from './forms.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async get<T>(_url?: string, _config?: any): Promise<T> {
      return {} as T
    }
    protected async post<T, D>(_data: D, _url?: string, _config?: any): Promise<T> {
      return {} as T
    }
    protected async put<T, D>(_data: D, _url?: string, _config?: any): Promise<T> {
      return {} as T
    }
  },
}))

describe('FormApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFormSchema', () => {
    it('should return AI Registry schema', async () => {
      const result = await formsApi.getFormSchema(
        ExtendedFormDashboardFormType.AiRegistryForm
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('schema')
    })

    it('should return Begin Submission schema', async () => {
      const result = await formsApi.getFormSchema(
        ExtendedFormDashboardFormType.BeginSubmissionForm
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('schema')
    })

    it('should return Idea Submission schema', async () => {
      const result = await formsApi.getFormSchema(
        ExtendedFormDashboardFormType.IdeaSubForm
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('schema')
    })

    it('should return Security Arch schema', async () => {
      const result = await formsApi.getFormSchema(
        ExtendedFormDashboardFormType.SecurityArchForm
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('schema')
    })

    it('should return DLO schema', async () => {
      const result = await formsApi.getFormSchema(
        ExtendedFormDashboardFormType.DloForm
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('schema')
    })

    it('should return GCO Risk Registry schema', async () => {
      const result = await formsApi.getFormSchema(
        ExtendedFormDashboardFormType.GcoRiskRegistryForm
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('schema')
    })

    it('should return WWTP schema', async () => {
      const result = await formsApi.getFormSchema(
        ExtendedFormDashboardFormType.WwtpForm
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('schema')
    })

    it('should reject with unknown schema type', async () => {
      await expect(
        formsApi.getFormSchema('unknown-schema' as any)
      ).rejects.toThrow('Unknown form schema type')
    })

    it('should respect delay parameter', async () => {
      const startTime = Date.now()
      await formsApi.getFormSchema(
        ExtendedFormDashboardFormType.AiRegistryForm,
        100
      )
      const endTime = Date.now()

      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })
  })

  describe('getFormData', () => {
    it('should call get with form_schema_id parameter', async () => {
      const mockResponse = {
        form_id: 'f1',
        data: [],
      }

      const getSpy = vi.spyOn(formsApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await formsApi.getFormData('schema123')

      expect(getSpy).toHaveBeenCalledWith('', {
        params: {
          form_schema_id: 'schema123',
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should propagate errors from base API', async () => {
      const mockError = new Error('Failed to fetch form data')
      const getSpy = vi.spyOn(formsApi as any, 'get')
      getSpy.mockRejectedValue(mockError)

      await expect(formsApi.getFormData('schema1')).rejects.toThrow(
        'Failed to fetch form data'
      )
    })
  })

  describe('submitFormData', () => {
    it('should call post with payload', async () => {
      const payload = {
        form_schema_id: 's1',
        form_data: JSON.stringify([{ question_id: 'q1', answer: 'a1' }]),
        status: FormStatus.pending,
      }

      const mockResponse = {
        form_schema_id: 's1',
        form_data: '',
        status: FormStatus.pending,
      }

      const postSpy = vi.spyOn(formsApi as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await formsApi.submitFormData(payload)

      expect(postSpy).toHaveBeenCalledWith(payload)
      expect(result).toEqual(mockResponse)
    })

    it('should propagate errors from base API', async () => {
      const payload = {
        form_schema_id: 's1',
        form_data: '[]',
        status: FormStatus.pending,
      }

      const mockError = new Error('Submit failed')
      const postSpy = vi.spyOn(formsApi as any, 'post')
      postSpy.mockRejectedValue(mockError)

      await expect(formsApi.submitFormData(payload)).rejects.toThrow(
        'Submit failed'
      )
    })
  })

   describe('getFormDetails', () => {
    it('should call get with form-id and submission-id params', async () => {
      const mockResponse = {
        form_id: 'f1',
        submission_id: 's1',
        details: {},
      }

      const getSpy = vi.spyOn(formsApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await formsApi.getFormDetails('form123', 'sub456')

      expect(getSpy).toHaveBeenCalledWith('/get-form-details', {
        params: {
          'form-id': 'form123',
          'submission-id': 'sub456',
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should propagate errors from base API', async () => {
      const mockError = new Error('Details fetch failed')
      const getSpy = vi.spyOn(formsApi as any, 'get')
      getSpy.mockRejectedValue(mockError)

      await expect(formsApi.getFormDetails('f1', 's1')).rejects.toThrow(
        'Details fetch failed'
      )
    })
  })

  describe('submitForm', () => {
    it('should call put with payload and params', async () => {
      const payload = {
        action: 'submit' as const,
        form_data: {
          form_data: [
            { questionId: 'q1', question: 'Question 1', answer: ['a1'], type: 'text' },
          ],
        },
      }

      const mockResponse = {
        submission_id: 's1',
        status: 'submitted',
      }

      const putSpy = vi.spyOn(formsApi as any, 'put')
      putSpy.mockResolvedValue(mockResponse)

      const result = await formsApi.submitForm('f123', 's456', payload)

      expect(putSpy).toHaveBeenCalledWith(
        expect.any(FormData),
        '/submit-form',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
          }),
          params: {
            'form-id': 'f123',
            'submission-id': 's456',
          },
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getReviewAnswer', () => {
    it('should call post with review answer request', async () => {
      const request = {
        submission_id: 's1',
        form_type: 'ai-registry',
        question_id: 'q1',
        form_data: [],
      }

      const mockResponse = {
        question_id: 'q1',
        required_suggestions: [],
        completed_suggestions: [],
      }

      const postSpy = vi.spyOn(formsApi as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await formsApi.getReviewAnswer(request)

      expect(postSpy).toHaveBeenCalledWith(request, '/review-answers')
      expect(result).toEqual(mockResponse)
    })

    it('should propagate errors from base API', async () => {
      const request = {
        submission_id: 's1',
        form_type: 'ai-registry',
        question_id: 'q1',
        form_data: [],
      }

      const mockError = new Error('Review failed')
      const postSpy = vi.spyOn(formsApi as any, 'post')
      postSpy.mockRejectedValue(mockError)

      await expect(formsApi.getReviewAnswer(request)).rejects.toThrow(
        'Review failed'
      )
    })
  })

  describe('getCommonFields', () => {
    it('should call post with common fields request', async () => {
      const payload = {
        form_type: 'ai-registry' as any,
        submission_id: 's1',
        form_id: 'f1',
      }

      const mockResponse = {
        common_fields: [
          { question_id: 'q1', answer: 'a1' },
          { question_id: 'q2', answer: 'a2' },
        ],
      }

      const postSpy = vi.spyOn(formsApi as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await formsApi.getCommonFields(payload)

      expect(postSpy).toHaveBeenCalledWith(
        payload,
        '/auto-populate/common-fields'
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty common fields', async () => {
      const payload = {
        form_type: 'test' as any,
        submission_id: 's1',
        form_id: 'f1',
      }

      const mockResponse = {
        common_fields: [],
      }

      const postSpy = vi.spyOn(formsApi as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await formsApi.getCommonFields(payload)

      expect(result.common_fields).toHaveLength(0)
    })

    it('should propagate errors from base API', async () => {
      const payload = {
        form_type: 'test' as any,
        submission_id: 's1',
        form_id: 'f1',
      }

      const mockError = new Error('Common fields fetch failed')
      const postSpy = vi.spyOn(formsApi as any, 'post')
      postSpy.mockRejectedValue(mockError)

      await expect(formsApi.getCommonFields(payload)).rejects.toThrow(
        'Common fields fetch failed'
      )
    })
  })
})
