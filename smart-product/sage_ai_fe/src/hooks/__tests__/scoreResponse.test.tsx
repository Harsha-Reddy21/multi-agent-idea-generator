import { beforeEach, describe, expect, it, vi } from 'vitest'

import { scoreApiService } from '../../core/api/score.api'
import {
  APPROVAL_SCORE_PREFIX,
  FormDashboardFormType,
} from '../../core/constants'
import { FormQuestion } from '../../core/models/form.model'
import { useScoreResponse } from '../scoreResponse'

// Mock the score API service
vi.mock('../../core/api/score.api', () => ({
  scoreApiService: {
    calculateScore: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock console.error to prevent test output pollution
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useScoreResponse', () => {
  const mockSubmissionId = 'submission-123'
  const mockFormType = FormDashboardFormType.WwtpForm
  const mockFormQuestions: FormQuestion[] = [
    { question_id: 'q1', answer: 'answer1' },
    { question_id: 'q2', answer: 'answer2' },
  ] as any

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
    localStorageMock.setItem.mockClear()
    localStorageMock.getItem.mockClear()
    consoleErrorSpy.mockClear()
  })

  describe('Successful Score Calculation', () => {
    it('should call scoreApiService.calculateScore with correct parameters', async () => {
      const mockScoreResponse = { total_score: 0.85 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      expect(scoreApiService.calculateScore).toHaveBeenCalledWith({
        submission_id: mockSubmissionId,
        form_data: mockFormQuestions,
        form_type: mockFormType,
      })
      expect(scoreApiService.calculateScore).toHaveBeenCalledTimes(1)
    })

    it('should store score in localStorage when total_score is returned', async () => {
      const mockScoreResponse = { total_score: 0.85 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      const expectedKey = `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`
      const expectedValue = (0.85 * 100).toFixed(2) // "85.00"

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expectedKey,
        expectedValue
      )
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
    })

    it('should return the total_score when successfully calculated', async () => {
      const mockScoreResponse = { total_score: 0.75 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(result).toBe(0.75)
    })

    it('should handle score of 0 correctly', async () => {
      const mockScoreResponse = { total_score: 0 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(result).toBe(0)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`,
        '0.00'
      )
    })

    it('should handle score of 1 (100%) correctly', async () => {
      const mockScoreResponse = { total_score: 1 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(result).toBe(1)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`,
        '100.00'
      )
    })

    it('should format score with 2 decimal places', async () => {
      const mockScoreResponse = { total_score: 0.876543 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`,
        '87.65'
      )
    })

    it('should work with different form types', async () => {
      const mockScoreResponse = { total_score: 0.92 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const differentFormType = 'DifferentFormType' as FormDashboardFormType

      await useScoreResponse(
        mockSubmissionId,
        differentFormType,
        mockFormQuestions
      )

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${differentFormType}-${mockSubmissionId}`,
        '92.00'
      )
    })

    it('should work with different submission IDs', async () => {
      const mockScoreResponse = { total_score: 0.65 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const differentSubmissionId = 'submission-999'

      await useScoreResponse(
        differentSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${differentSubmissionId}`,
        '65.00'
      )
    })

    it('should work with empty form questions array', async () => {
      const mockScoreResponse = { total_score: 0.5 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, [])

      expect(scoreApiService.calculateScore).toHaveBeenCalledWith({
        submission_id: mockSubmissionId,
        form_data: [],
        form_type: mockFormType,
      })
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should work with multiple form questions', async () => {
      const mockScoreResponse = { total_score: 0.88 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const multipleQuestions: FormQuestion[] = [
        { question_id: 'q1', answer: 'a1' },
        { question_id: 'q2', answer: 'a2' },
        { question_id: 'q3', answer: 'a3' },
        { question_id: 'q4', answer: 'a4' },
        { question_id: 'q5', answer: 'a5' },
      ] as any

      await useScoreResponse(mockSubmissionId, mockFormType, multipleQuestions)

      expect(scoreApiService.calculateScore).toHaveBeenCalledWith({
        submission_id: mockSubmissionId,
        form_data: multipleQuestions,
        form_type: mockFormType,
      })
    })
  })

  describe('Missing or Undefined Score', () => {
    it('should not store in localStorage when total_score is undefined', async () => {
      const mockScoreResponse = {} as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('should store "0.00" in localStorage when total_score is null (null is treated as 0)', async () => {
      const mockScoreResponse = { total_score: null }
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse as any
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      // null !== undefined, so it passes the check and gets stored as 0.00
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`,
        '0.00'
      )
      expect(result).toBeNull()
    })

    it('should return undefined when response has no total_score property', async () => {
      const mockScoreResponse = { some_other_field: 'value' }
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse as any
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(result).toBeUndefined()
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should catch and log error when calculateScore fails', async () => {
      const mockError = new Error('API Error')
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(mockError)

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calculating score:',
        mockError
      )
      expect(result).toBeUndefined()
    })

    it('should not store in localStorage when error occurs', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(mockError)

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network request failed')
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(networkError)

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calculating score:',
        networkError
      )
      expect(result).toBeUndefined()
    })

    it('should handle API timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(timeoutError)

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calculating score:',
        timeoutError
      )
      expect(result).toBeUndefined()
    })

    it('should handle 500 server errors', async () => {
      const serverError = { message: 'Internal Server Error', status: 500 }
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(serverError)

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calculating score:',
        serverError
      )
      expect(result).toBeUndefined()
    })

    it('should handle 404 not found errors', async () => {
      const notFoundError = { message: 'Not Found', status: 404 }
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(notFoundError)

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calculating score:',
        notFoundError
      )
      expect(result).toBeUndefined()
    })

    it('should handle validation errors', async () => {
      const validationError = {
        message: 'Validation failed',
        errors: ['Invalid submission_id'],
      }
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(
        validationError
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calculating score:',
        validationError
      )
      expect(result).toBeUndefined()
    })

    it('should handle string errors', async () => {
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(
        'String error message'
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calculating score:',
        'String error message'
      )
      expect(result).toBeUndefined()
    })

    it('should not throw error even when scoring fails', async () => {
      const mockError = new Error('Critical API Error')
      vi.mocked(scoreApiService.calculateScore).mockRejectedValue(mockError)

      // This should not throw
      await expect(
        useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)
      ).resolves.toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small decimal scores', async () => {
      const mockScoreResponse = { total_score: 0.001 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`,
        '0.10'
      )
    })

    it('should handle very large decimal precision', async () => {
      const mockScoreResponse = { total_score: 0.999999 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`,
        '100.00'
      )
    })

    it('should handle negative scores (if API returns them)', async () => {
      const mockScoreResponse = { total_score: -0.5 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`,
        '-50.00'
      )
    })

    it('should handle scores greater than 1', async () => {
      const mockScoreResponse = { total_score: 1.5 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${mockSubmissionId}`,
        '150.00'
      )
    })

    it('should handle special characters in submission ID', async () => {
      const mockScoreResponse = { total_score: 0.7 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const specialSubmissionId = 'sub-123-!@#$%'

      await useScoreResponse(
        specialSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${APPROVAL_SCORE_PREFIX}-${mockFormType}-${specialSubmissionId}`,
        '70.00'
      )
    })

    it('should handle very long submission IDs', async () => {
      const mockScoreResponse = { total_score: 0.8 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const longSubmissionId = 'a'.repeat(100)

      await useScoreResponse(longSubmissionId, mockFormType, mockFormQuestions)

      expect(scoreApiService.calculateScore).toHaveBeenCalledWith({
        submission_id: longSubmissionId,
        form_data: mockFormQuestions,
        form_type: mockFormType,
      })
    })

    it('should handle response with additional properties', async () => {
      const mockScoreResponse = {
        total_score: 0.9,
        additional_field: 'value',
        another_field: 123,
      }
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse as any
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(result).toBe(0.9)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('LocalStorage Key Format', () => {
    it('should use correct localStorage key format with APPROVAL_SCORE_PREFIX', async () => {
      const mockScoreResponse = { total_score: 0.85 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      const calls = localStorageMock.setItem.mock.calls
      expect(calls[0][0]).toMatch(new RegExp(`^${APPROVAL_SCORE_PREFIX}-`))
    })

    it('should include formType in localStorage key', async () => {
      const mockScoreResponse = { total_score: 0.85 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      const calls = localStorageMock.setItem.mock.calls
      expect(calls[0][0]).toContain(mockFormType)
    })

    it('should include submissionId in localStorage key', async () => {
      const mockScoreResponse = { total_score: 0.85 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      const calls = localStorageMock.setItem.mock.calls
      expect(calls[0][0]).toContain(mockSubmissionId)
    })

    it('should separate key components with hyphens', async () => {
      const mockScoreResponse = { total_score: 0.85 } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      const calls = localStorageMock.setItem.mock.calls
      const key = calls[0][0]
      const parts = key.split('-')
      expect(parts.length).toBeGreaterThan(2)
    })
  })

  describe('Return Value Consistency', () => {
    it('should return undefined when no score is available', async () => {
      const mockScoreResponse = {} as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(result).toBeUndefined()
    })

    it('should return the exact total_score value without modification', async () => {
      const exactScore = 0.123456789
      const mockScoreResponse = { total_score: exactScore } as any
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse
      )

      const result = await useScoreResponse(
        mockSubmissionId,
        mockFormType,
        mockFormQuestions
      )

      expect(result).toBe(exactScore)
    })

    it('should only store score if total_score is not undefined', async () => {
      const mockScoreResponse = { total_score: undefined }
      vi.mocked(scoreApiService.calculateScore).mockResolvedValue(
        mockScoreResponse as any
      )

      await useScoreResponse(mockSubmissionId, mockFormType, mockFormQuestions)

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })
})
