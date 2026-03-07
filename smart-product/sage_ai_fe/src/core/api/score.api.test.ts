import { beforeEach, describe, expect, it, vi } from 'vitest'

import { scoreApiService } from './score.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async post<T, D>(_data: D, _url?: string): Promise<T> {
      return {} as T
    }
  },
}))

describe('ScoreApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateScore', () => {
    it('should call post with correct payload and URL', async () => {
      const mockRequest = {
        submission_id: 's123',
        form_type: 'ai-registry',
        form_data: [
          { questionId: 'q1', question: 'Question 1', answer: ['answer1'], type: 'text' },
          { questionId: 'q2', question: 'Question 2', answer: ['answer2'], type: 'text' },
        ],
      }

      const mockResponse = {
        submission_id: 's123',
        total_score: 85,
      }

      const postSpy = vi.spyOn(scoreApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await scoreApiService.calculateScore(mockRequest)

      expect(postSpy).toHaveBeenCalledWith(mockRequest, 'scoring')
      expect(result).toEqual(mockResponse)
    })

    it('should handle zero score', async () => {
      const mockRequest = {
        submission_id: 's1',
        form_type: 'ai-registry',
        form_data: [],
      }

      const mockResponse = {
        submission_id: 's1',
        total_score: 0,
      }

      const postSpy = vi.spyOn(scoreApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await scoreApiService.calculateScore(mockRequest)

      expect(result.total_score).toBe(0)
    })

    it('should handle perfect score', async () => {
      const mockRequest = {
        submission_id: 's1',
        form_type: 'ai-registry',
        form_data: [
          { questionId: 'q1', question: 'Question 1', answer: ['perfect'], type: 'text' },
        ],
      }

      const mockResponse = {
        submission_id: 's1',
        total_score: 100,
      }

      const postSpy = vi.spyOn(scoreApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await scoreApiService.calculateScore(mockRequest)

      expect(result.total_score).toBe(100)
    })

    it('should propagate errors from base API', async () => {
      const mockRequest = {
        submission_id: 's1',
        form_type: 'ai-registry',
        form_data: [],
      }

      const mockError = new Error('Scoring failed')
      const postSpy = vi.spyOn(scoreApiService as any, 'post')
      postSpy.mockRejectedValue(mockError)

      await expect(
        scoreApiService.calculateScore(mockRequest)
      ).rejects.toThrow('Scoring failed')
    })
  })
})
