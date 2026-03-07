import { beforeEach, describe, expect, it, vi } from 'vitest'

import { suggestionsApiService } from './suggestions.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async get<T>(_url?: string): Promise<T> {
      return {} as T
    }
    protected async post<T, D>(_data: D, _url?: string): Promise<T> {
      return {} as T
    }
  },
}))

describe('SuggestionsApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSuggestions', () => {
    it('should call get with correct URL parameter', async () => {
      const mockResponse = {
        suggestions: [
          { id: '1', text: 'Suggestion 1' },
          { id: '2', text: 'Suggestion 2' },
        ],
      }

      const getSpy = vi.spyOn(suggestionsApiService as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await suggestionsApiService.getSuggestions('ai-registry')

      expect(getSpy).toHaveBeenCalledWith('suggestions?form_type=ai-registry')
      expect(result).toEqual(mockResponse)
    })

    it('should handle different form types', async () => {
      const formTypes = [
        'ai-registry',
        'security-arch',
        'idea-submission',
        'begin-submission',
      ]

      for (const formType of formTypes) {
        const mockResponse = {
          suggestions: [],
        }

        const getSpy = vi.spyOn(suggestionsApiService as any, 'get')
        getSpy.mockResolvedValue(mockResponse)

        await suggestionsApiService.getSuggestions(formType)

        expect(getSpy).toHaveBeenCalledWith(`suggestions?form_type=${formType}`)
      }
    })

    it('should handle empty suggestions', async () => {
      const mockResponse = {
        form_type: 'test',
        data: [],
      }

      const getSpy = vi.spyOn(suggestionsApiService as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await suggestionsApiService.getSuggestions('test-form')

      expect(result.data).toHaveLength(0)
    })

    it('should propagate errors from base API', async () => {
      const mockError = new Error('Suggestions fetch failed')
      const getSpy = vi.spyOn(suggestionsApiService as any, 'get')
      getSpy.mockRejectedValue(mockError)

      await expect(
        suggestionsApiService.getSuggestions('form-type')
      ).rejects.toThrow('Suggestions fetch failed')
    })
  })

  describe('checkSuggestionsCoverage', () => {
    it('should call post with correct payload', async () => {
      const requestBody = {
        question_id: 'q123',
        submission_id: 's123',
        user_text: 'User input text',
      }

      const mockResponse = {
        coverage_percentage: 75,
        matched_suggestions: ['s1', 's2', 's3'],
        missing_topics: ['topic1'],
      }

      const postSpy = vi.spyOn(suggestionsApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await suggestionsApiService.checkSuggestionsCoverage(
        requestBody
      )

      expect(postSpy).toHaveBeenCalledWith(
        requestBody,
        'check-suggestions-coverage'
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle 100% coverage', async () => {
      const requestBody = {
        question_id: 'q1',
        submission_id: 's1',
        user_text: 'Complete answer',
      }

      const mockResponse = {
        required_suggestions: [],
        completed_suggestions: [
          { text: 's1', rationale: 'r1' },
          { text: 's2', rationale: 'r2' },
        ],
      }

      const postSpy = vi.spyOn(suggestionsApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await suggestionsApiService.checkSuggestionsCoverage(
        requestBody
      )

      expect(result.required_suggestions).toHaveLength(0)
      expect(result.completed_suggestions).toHaveLength(2)
    })

    it('should handle 0% coverage', async () => {
      const requestBody = {
        question_id: 'q1',
        submission_id: 's1',
        user_text: 'Irrelevant text',
      }

      const mockResponse = {
        required_suggestions: [
          { text: 'all', rationale: 'missing' },
        ],
        completed_suggestions: [],
      }

      const postSpy = vi.spyOn(suggestionsApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      const result = await suggestionsApiService.checkSuggestionsCoverage(
        requestBody
      )

      expect(result.required_suggestions).toHaveLength(1)
      expect(result.completed_suggestions).toHaveLength(0)
    })

    it('should handle empty user text', async () => {
      const requestBody = {
        question_id: 'q1',
        submission_id: 's1',
        user_text: '',
      }

      const mockResponse = {
        required_suggestions: [],
        completed_suggestions: [],
      }

      const postSpy = vi.spyOn(suggestionsApiService as any, 'post')
      postSpy.mockResolvedValue(mockResponse)

      await suggestionsApiService.checkSuggestionsCoverage(requestBody)

      expect(postSpy).toHaveBeenCalledWith(
        requestBody,
        'check-suggestions-coverage'
      )
    })

    it('should propagate errors from base API', async () => {
      const requestBody = {
        question_id: 'q1',
        submission_id: 's1',
        user_text: 'text',
      }

      const mockError = new Error('Coverage check failed')
      const postSpy = vi.spyOn(suggestionsApiService as any, 'post')
      postSpy.mockRejectedValue(mockError)

      await expect(
        suggestionsApiService.checkSuggestionsCoverage(requestBody)
      ).rejects.toThrow('Coverage check failed')
    })
  })
})
