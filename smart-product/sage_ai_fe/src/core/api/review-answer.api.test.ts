import { beforeEach, describe, expect, it, vi } from 'vitest'

import { reviewAnswerApiService } from './review-answer.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async post<T, D>(_data: D, _url?: string): Promise<T> {
      return {} as T
    }
  },
}))

describe('ReviewAnswerApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReviewAnswer', () => {
    it('should call post with correct payload and URL', async () => {
      const mockRequest = {
        question_id: 'q1',
        submission_id: 's1',
        form_type: 'ai-registry',
        form_data: [],
      }

      const mockResponse = {
        question_id: 'q1',
        required_suggestions: [{ text: 'Suggestion 1', rationale: 'Rationale 1' }],
        completed_suggestions: [{ text: 'Completed 1', rationale: 'Rationale 2' }],
      }

      const postSpy = vi.spyOn(reviewAnswerApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await reviewAnswerApiService.getReviewAnswer(mockRequest)

      expect(postSpy).toHaveBeenCalledWith(mockRequest, 'review-answers')
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty suggestions', async () => {
      const mockRequest = {
        question_id: 'q1',
        submission_id: 's1',
        form_type: 'ai-registry',
        form_data: [],
      }

      const mockResponse = {
        question_id: 'q1',
        required_suggestions: [],
        completed_suggestions: [],
      }

      const postSpy = vi.spyOn(reviewAnswerApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await reviewAnswerApiService.getReviewAnswer(mockRequest)

      expect(result.required_suggestions).toHaveLength(0)
      expect(result.completed_suggestions).toHaveLength(0)
    })

    it('should propagate errors from base API', async () => {
      const mockRequest = {
        question_id: 'q1',
        submission_id: 's123',
        form_type: 'ai-registry',
        form_data: [],
      }

      const mockError = new Error('Review answer failed')
      const postSpy = vi.spyOn(reviewAnswerApiService as any, 'post')
      postSpy.mockRejectedValue(mockError)

      await expect(
        reviewAnswerApiService.getReviewAnswer(mockRequest)
      ).rejects.toThrow('Review answer failed')
    })
  })
})
