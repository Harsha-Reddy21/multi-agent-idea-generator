import { beforeEach, describe, expect, it, vi } from 'vitest'

import { noveltyScoreApiService } from './novelty-score.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async post<T, D>(_data: D, _url?: string): Promise<T> {
      return {} as T
    }
  },
}))

describe('NoveltyScoreApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNoveltyScore', () => {
    it('should call post with correct payload and URL', async () => {
      const mockRequest = {
        'form-data': [
          {
            questionId: 'q1',
            question: 'What is the innovation?',
            answer: 'AI-powered diagnostic tool',
          },
          {
            questionId: 'q2',
            question: 'What problem does it solve?',
            answer: 'Faster disease detection',
          },
        ],
        'submission-id': 'sub123',
        'form-id': 'form456',
      }

      const mockResponse = {
        air_number: 'AIR-2025-001',
        title: 'Similar AI Innovation',
        similarity_score: 0.85,
      }

      const postSpy = vi.spyOn(noveltyScoreApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await noveltyScoreApiService.getNoveltyScore(mockRequest)

      expect(postSpy).toHaveBeenCalledWith(mockRequest, 'faiss/search')
      expect(result).toEqual(mockResponse)
    })

    it('should handle high similarity score', async () => {
      const mockRequest = {
        'form-data': [
          {
            questionId: 'q1',
            question: 'Innovation description',
            answer: 'Machine learning model',
          },
        ],
        'submission-id': 'sub789',
        'form-id': 'form123',
      }

      const mockResponse = {
        air_number: 'AIR-2025-002',
        title: 'Very Similar Innovation',
        similarity_score: 0.95,
      }

      const postSpy = vi.spyOn(noveltyScoreApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await noveltyScoreApiService.getNoveltyScore(mockRequest)

      expect(result.similarity_score).toBe(0.95)
      expect(result.air_number).toBe('AIR-2025-002')
    })

    it('should handle low similarity score', async () => {
      const mockRequest = {
        'form-data': [
          {
            questionId: 'q1',
            question: 'What is unique?',
            answer: 'Novel approach to synthesis',
          },
        ],
        'submission-id': 'sub111',
        'form-id': 'form222',
      }

      const mockResponse = {
        air_number: 'AIR-2025-003',
        title: 'Different Innovation',
        similarity_score: 0.15,
      }

      const postSpy = vi.spyOn(noveltyScoreApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await noveltyScoreApiService.getNoveltyScore(mockRequest)

      expect(result.similarity_score).toBe(0.15)
    })

    it('should handle multiple form data entries', async () => {
      const mockRequest = {
        'form-data': [
          {
            questionId: 'q1',
            question: 'Title',
            answer: 'Innovation A',
          },
          {
            questionId: 'q2',
            question: 'Description',
            answer: 'Detailed description',
          },
          {
            questionId: 'q3',
            question: 'Category',
            answer: 'Biotechnology',
          },
        ],
        'submission-id': 'sub999',
        'form-id': 'form888',
      }

      const mockResponse = {
        air_number: 'AIR-2025-004',
        title: 'Related Innovation',
        similarity_score: 0.7,
      }

      const postSpy = vi.spyOn(noveltyScoreApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await noveltyScoreApiService.getNoveltyScore(mockRequest)

      expect(postSpy).toHaveBeenCalledWith(mockRequest, 'faiss/search')
      expect(result).toEqual(mockResponse)
      expect(mockRequest['form-data']).toHaveLength(3)
    })

    it('should handle empty form data', async () => {
      const mockRequest = {
        'form-data': [],
        'submission-id': 'sub555',
        'form-id': 'form666',
      }

      const mockResponse = {
        air_number: '',
        title: '',
        similarity_score: 0,
      }

      const postSpy = vi.spyOn(noveltyScoreApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await noveltyScoreApiService.getNoveltyScore(mockRequest)

      expect(result.similarity_score).toBe(0)
      expect(result.air_number).toBe('')
    })

    it('should handle API error', async () => {
      const mockRequest = {
        'form-data': [
          {
            questionId: 'q1',
            question: 'Test question',
            answer: 'Test answer',
          },
        ],
        'submission-id': 'sub000',
        'form-id': 'form000',
      }

      const postSpy = vi.spyOn(noveltyScoreApiService as any, 'post')
      postSpy.mockRejectedValue(new Error('API Error'))

      await expect(
        noveltyScoreApiService.getNoveltyScore(mockRequest)
      ).rejects.toThrow('API Error')
    })
  })
})
