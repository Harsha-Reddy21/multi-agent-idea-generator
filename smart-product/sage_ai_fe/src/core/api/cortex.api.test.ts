import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cortexApiService } from './cortex.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async get<T>(_url?: string): Promise<T> {
      return {} as T
    }
  },
}))

describe('CortexApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDocExtracts', () => {
    it('should call get with correct URL parameters', async () => {
      const mockResponse = {
        question_id: 'question789',
        submission_id: 'sub123',
        form_id: 'form456',
        extracted_content: {
          confidence: 0.95,
          answer_text: 'Test content',
          extracted_content: [
            {
              text: 'Test provenance text',
              span_id: 1,
              char_end: 100,
              file_name: 'test.pdf',
              block_type: 'paragraph',
              char_start: 0,
              block_index: 0,
              page_or_slide: 1,
            },
          ],
        },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getSpy = vi.spyOn(cortexApiService as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await cortexApiService.getDocExtracts(
        'sub123',
        'form456',
        'question789'
      )

      expect(getSpy).toHaveBeenCalledWith(
        '/get-doc-extracts?submission-id=sub123&form-id=form456&question-id=question789'
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty response', async () => {
      const mockResponse = {
        question_id: 'q1',
        submission_id: 's1',
        form_id: 'f1',
        extracted_content: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getSpy = vi.spyOn(cortexApiService as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await cortexApiService.getDocExtracts('s1', 'f1', 'q1')

      expect(result).toEqual(mockResponse)
      expect(result.extracted_content).toBeNull()
    })

    it('should handle special characters in parameters', async () => {
      const mockResponse = {
        question_id: 'question.789',
        submission_id: 'sub-123-abc',
        form_id: 'form_456',
        extracted_content: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getSpy = vi.spyOn(cortexApiService as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      await cortexApiService.getDocExtracts(
        'sub-123-abc',
        'form_456',
        'question.789'
      )

      expect(getSpy).toHaveBeenCalledWith(
        '/get-doc-extracts?submission-id=sub-123-abc&form-id=form_456&question-id=question.789'
      )
    })

    it('should propagate errors from base API', async () => {
      const mockError = new Error('Network error')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getSpy = vi.spyOn(cortexApiService as any, 'get')
      getSpy.mockRejectedValue(mockError)

      await expect(
        cortexApiService.getDocExtracts('s1', 'f1', 'q1')
      ).rejects.toThrow('Network error')
    })
  })
})
