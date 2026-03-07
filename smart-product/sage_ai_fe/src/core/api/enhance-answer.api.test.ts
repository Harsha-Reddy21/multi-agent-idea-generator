import { beforeEach, describe, expect, it, vi } from 'vitest'

import { enhanceAnswerApi } from './enhance-answer.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async post<T, D>(_data: D, _url?: string): Promise<T> {
      return {} as T
    }
  },
}))

describe('EnhanceAnswerApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('enhanceAnswer', () => {
    // it('should call post with correct payload and URL', async () => {
    //   const mockResponse = {
    //     enhanced_text: 'Enhanced answer text',
    //     original_text: 'Original answer',
    //   }

    //   const postSpy = vi.spyOn(enhanceAnswerApi as any, 'post')
    //   postSpy.mockResolvedValue(mockResponse)

    //   const result = await enhanceAnswerApi.enhanceAnswer(
    //     'Original answer',
    //     'question123',
    //     'submission456'
    //   )

    //   expect(postSpy).toHaveBeenCalledWith(
    //     {
    //       question_id: 'question123',
    //       user_text: 'Original answer',
    //       submission_id: 'submission456',
    //       form_id: null,
    //       form_data: null,
    //     },
    //     ''
    //   )
    //   expect(result).toEqual(mockResponse)
    // })

    // it('should handle null submission_id', async () => {
    //   const mockResponse = {
    //     enhanced_text: 'Enhanced text',
    //     original_text: 'Original',
    //   }

    //   const postSpy = vi.spyOn(enhanceAnswerApi as any, 'post')
    //   postSpy.mockResolvedValue(mockResponse)

    //   await enhanceAnswerApi.enhanceAnswer('Original', 'q1')

    //   expect(postSpy).toHaveBeenCalledWith(
    //     {
    //       question_id: 'q1',
    //       user_text: 'Original',
    //       submission_id: null,
    //       form_id: null,
    //       form_data: null,
    //     },
    //     ''
    //   )
    // })

    // it('should handle undefined form_id', async () => {
    //   const mockResponse = {
    //     enhanced_text: 'Enhanced text',
    //     original_text: 'Original',
    //   }

    //   const postSpy = vi.spyOn(enhanceAnswerApi as any, 'post')
    //   postSpy.mockResolvedValue(mockResponse)

    //   await enhanceAnswerApi.enhanceAnswer(
    //     'Original',
    //     'q1',
    //     's456'        
    //   )

    //   expect(postSpy).toHaveBeenCalledWith(
    //     {
    //       question_id: 'q1',
    //       user_text: 'Original',
    //       submission_id: 's456',
    //       form_id: null,
    //       form_data: {},
    //     },
    //     ''
    //   )
    // })

    it('should handle empty answer text', async () => {
      const mockResponse = {
        enhanced_text: '',
        original_text: '',
      }

      const postSpy = vi.spyOn(enhanceAnswerApi as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await enhanceAnswerApi.enhanceAnswer('', 'q1', 's1')

      expect(result).toEqual(mockResponse)
    })

    it('should propagate errors from base API', async () => {
      const mockError = new Error('Enhancement failed')
      const postSpy = vi.spyOn(enhanceAnswerApi as any, 'post')
      postSpy.mockRejectedValue(mockError)

      await expect(
        enhanceAnswerApi.enhanceAnswer('text', 'q1', 's1')
      ).rejects.toThrow('Enhancement failed')
    })
  })
})
