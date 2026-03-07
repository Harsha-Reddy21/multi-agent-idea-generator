/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  enhanceAnswerApi,
  EnhanceAnswerResponse,
} from '../../core/api/enhance-answer.api'
import { useEnhanceAnswer, UseEnhanceAnswerParams } from '../useEnhanceAnswer'

// Mock the enhance-answer API
vi.mock('../../core/api/enhance-answer.api', () => ({
  enhanceAnswerApi: {
    enhanceAnswer: vi.fn(),
  },
}))

describe('useEnhanceAnswer', () => {
  const mockEnhanceAnswer = enhanceAnswerApi.enhanceAnswer as any

  const defaultParams: UseEnhanceAnswerParams = {
    userInput: 'Test user input',
    questionId: 'q123',
    submissionId: 's456',
    formData: { field1: 'value1' },
    formId: 'f789',
    autoRun: false,
  }

  const mockSuccessResponse: EnhanceAnswerResponse = {
    question_id: 'q123',
    original_text: 'Test user input',
    reviewed_text: 'Enhanced answer text',
    rationale: 'This is the rationale for the enhancement',
    interaction_id: 'iid-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Initial State', () => {
    it('returns idle status and empty values initially', () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      expect(result.current.status).toBe('idle')
      expect(result.current.loading).toBe(false)
      expect(result.current.enhancedAnswer).toBe('')
      expect(result.current.originalText).toBe('')
      expect(result.current.rationale).toBe('')
      expect(result.current.interactionId).toBeNull()
      expect(result.current.response).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('provides all required functions', () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      expect(typeof result.current.fetchEnhancedAnswer).toBe('function')
      expect(typeof result.current.resetEnhancement).toBe('function')
      expect(typeof result.current.updateParams).toBe('function')
    })
  })

  describe('fetchEnhancedAnswer', () => {
    it('successfully fetches and parses enhanced answer', async () => {
      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.status).toBe('success')
      expect(result.current.loading).toBe(false)
      expect(result.current.enhancedAnswer).toBe('Enhanced answer text')
      expect(result.current.originalText).toBe('Test user input')
      expect(result.current.rationale).toBe(
        'This is the rationale for the enhancement'
      )
      expect(result.current.interactionId).toBe('iid-123')
      expect(result.current.response).toEqual(mockSuccessResponse)
      expect(result.current.error).toBeNull()
    })

    it('sets loading state during API call', async () => {
      let resolvePromise: (value: EnhanceAnswerResponse) => void
      mockEnhanceAnswer.mockImplementationOnce(
        () =>
          new Promise<EnhanceAnswerResponse>(resolve => {
            resolvePromise = resolve
          })
      )

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      act(() => {
        result.current.fetchEnhancedAnswer()
      })

      await waitFor(() => {
        expect(result.current.status).toBe('loading')
        expect(result.current.loading).toBe(true)
      })

      await act(async () => {
        resolvePromise!(mockSuccessResponse)
      })

      expect(result.current.status).toBe('success')
      expect(result.current.loading).toBe(false)
    })

    it('handles error when API call fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockEnhanceAnswer.mockRejectedValueOnce(new Error('API Error'))

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.status).toBe('error')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(
        'Cortex is not responding. We are unable to analyze your answer at the moment. Please try again later.'
      )
      expect(result.current.enhancedAnswer).toBe('')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Enhance Answer API error:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('validates required parameters and sets error if missing userInput', async () => {
      const params = { ...defaultParams, userInput: '' }
      const { result } = renderHook(() => useEnhanceAnswer(params))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.status).toBe('error')
      expect(result.current.error).toBe(
        'Missing required parameters: userInput and questionId'
      )
      expect(mockEnhanceAnswer).not.toHaveBeenCalled()
    })

    it('validates required parameters and sets error if missing questionId', async () => {
      const params = { ...defaultParams, questionId: '' }
      const { result } = renderHook(() => useEnhanceAnswer(params))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.status).toBe('error')
      expect(result.current.error).toBe(
        'Missing required parameters: userInput and questionId'
      )
      expect(mockEnhanceAnswer).not.toHaveBeenCalled()
    })

    it('handles reviewed_text as object and stringifies it', async () => {
      const responseWithObjectText: EnhanceAnswerResponse = {
        ...mockSuccessResponse,
        reviewed_text: { content: 'Enhanced text', metadata: { score: 95 } },
      }
      mockEnhanceAnswer.mockResolvedValueOnce(responseWithObjectText)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.enhancedAnswer).toBe(
        JSON.stringify({ content: 'Enhanced text', metadata: { score: 95 } })
      )
      expect(result.current.status).toBe('success')
    })

    it('handles rationale as object and stringifies it', async () => {
      const responseWithObjectRationale: EnhanceAnswerResponse = {
        ...mockSuccessResponse,
        rationale: { reason: 'Grammar improvement', confidence: 0.95 } as any,
      }
      mockEnhanceAnswer.mockResolvedValueOnce(responseWithObjectRationale)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.rationale).toBe(
        JSON.stringify({ reason: 'Grammar improvement', confidence: 0.95 })
      )
      expect(result.current.status).toBe('success')
    })

    it('handles missing rationale', async () => {
      const responseWithoutRationale: EnhanceAnswerResponse = {
        question_id: 'q123',
        original_text: 'Test user input',
        reviewed_text: 'Enhanced answer text',
      }
      mockEnhanceAnswer.mockResolvedValueOnce(responseWithoutRationale)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.rationale).toBe('')
      expect(result.current.status).toBe('success')
    })

    it('handles missing interaction_id', async () => {
      const responseWithoutInteractionId: EnhanceAnswerResponse = {
        question_id: 'q123',
        original_text: 'Test user input',
        reviewed_text: 'Enhanced answer text',
        rationale: 'Rationale text',
      }
      mockEnhanceAnswer.mockResolvedValueOnce(responseWithoutInteractionId)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.interactionId).toBeNull()
      expect(result.current.status).toBe('success')
    })

    it('trims whitespace from enhanced answer', async () => {
      const responseWithWhitespace: EnhanceAnswerResponse = {
        ...mockSuccessResponse,
        reviewed_text: '  Enhanced answer with spaces  ',
      }
      mockEnhanceAnswer.mockResolvedValueOnce(responseWithWhitespace)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.enhancedAnswer).toBe('Enhanced answer with spaces')
    })

    it('sets originalText to userInput when fetching', async () => {
      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.originalText).toBe('Test user input')
    })

    it('clears previous values when starting new fetch', async () => {
      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      // First fetch
      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.enhancedAnswer).toBe('Enhanced answer text')

      // Second fetch - should clear during loading
      let resolveSecondPromise: (value: EnhanceAnswerResponse) => void
      mockEnhanceAnswer.mockImplementationOnce(
        () =>
          new Promise<EnhanceAnswerResponse>(resolve => {
            resolveSecondPromise = resolve
          })
      )

      act(() => {
        result.current.fetchEnhancedAnswer()
      })

      await waitFor(() => {
        expect(result.current.status).toBe('loading')
        expect(result.current.enhancedAnswer).toBe('')
        expect(result.current.error).toBeNull()
      })

      // Complete second fetch
      const secondResponse = {
        ...mockSuccessResponse,
        reviewed_text: 'New enhanced text',
      }
      await act(async () => {
        resolveSecondPromise!(secondResponse)
      })

      expect(result.current.enhancedAnswer).toBe('New enhanced text')
    })
  })

  describe('resetEnhancement', () => {
    it('resets all state to initial values', async () => {
      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      // First fetch to populate state
      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.status).toBe('success')
      expect(result.current.enhancedAnswer).toBe('Enhanced answer text')

      // Reset
      act(() => {
        result.current.resetEnhancement()
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.loading).toBe(false)
      expect(result.current.enhancedAnswer).toBe('')
      expect(result.current.originalText).toBe('')
      expect(result.current.rationale).toBe('')
      expect(result.current.interactionId).toBeNull()
      expect(result.current.response).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('resets error state', async () => {
      mockEnhanceAnswer.mockRejectedValueOnce(new Error('API Error'))

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.status).toBe('error')
      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.resetEnhancement()
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.error).toBeNull()
    })
  })

  describe('updateParams', () => {
    it('updates userInput parameter', () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      act(() => {
        result.current.updateParams({ userInput: 'New user input' })
      })

      // Params are updated internally - verify by calling fetch
      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      act(() => {
        result.current.fetchEnhancedAnswer()
      })

      expect(mockEnhanceAnswer).toHaveBeenCalledWith(
        'New user input',
        'q123',
        's456',
        'f789',
        [
          {
            answer: ['New user input'],
            question: '',
            questionId: 'q123',
          },
        ]
      )
    })

    it('updates questionId parameter', () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      act(() => {
        result.current.updateParams({ questionId: 'q999' })
      })

      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      act(() => {
        result.current.fetchEnhancedAnswer()
      })

      expect(mockEnhanceAnswer).toHaveBeenCalledWith(
        'Test user input',
        'q999',
        's456',
        'f789',
        [
          {
            answer: ['Test user input'],
            question: '',
            questionId: 'q999',
          },
        ]
      )
    })

    it('updates submissionId parameter', () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      act(() => {
        result.current.updateParams({ submissionId: 's999' })
      })

      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      act(() => {
        result.current.fetchEnhancedAnswer()
      })

      expect(mockEnhanceAnswer).toHaveBeenCalledWith(
        'Test user input',
        'q123',
        's999',
        'f789',
        [
          {
            answer: ['Test user input'],
            question: '',
            questionId: 'q123',
          },
        ]
      )
    })

    it('updates multiple parameters at once', () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      act(() => {
        result.current.updateParams({
          userInput: 'Updated input',
          questionId: 'q888',
          submissionId: 's777',
        })
      })

      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      act(() => {
        result.current.fetchEnhancedAnswer()
      })

      expect(mockEnhanceAnswer).toHaveBeenCalledWith(
        'Updated input',
        'q888',
        's777',
        'f789',
        [
          {
            answer: ['Updated input'],
            question: '',
            questionId: 'q888',
          },
        ]
      )
    })

    it('preserves other parameters when updating partial params', () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      act(() => {
        result.current.updateParams({ userInput: 'Only userInput updated' })
      })

      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      act(() => {
        result.current.fetchEnhancedAnswer()
      })

      // Original questionId and submissionId should be preserved
      expect(mockEnhanceAnswer).toHaveBeenCalledWith(
        'Only userInput updated',
        'q123',
        's456',
        'f789',
        [
          {
            answer: ['Only userInput updated'],
            question: '',
            questionId: 'q123',
          },
        ]
      )
    })
  })

  describe('autoRun functionality', () => {
    it('automatically fetches when autoRun is true and params are valid', async () => {
      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      const autoRunParams = { ...defaultParams, autoRun: true }

      const { result } = renderHook(() => useEnhanceAnswer(autoRunParams))

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })

      expect(mockEnhanceAnswer).toHaveBeenCalledWith(
        'Test user input',
        'q123',
        's456',
        'f789',
        [
          {
            answer: ['Test user input'],
            question: '',
            questionId: 'q123',
          },
        ]
      )
      expect(result.current.enhancedAnswer).toBe('Enhanced answer text')
    })

    it('does not auto-run when autoRun is false', async () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      // Wait a bit to ensure no auto-run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.status).toBe('idle')
      expect(mockEnhanceAnswer).not.toHaveBeenCalled()
    })

    it('does not auto-run when userInput is empty', async () => {
      const autoRunParams = { ...defaultParams, userInput: '', autoRun: true }

      const { result } = renderHook(() => useEnhanceAnswer(autoRunParams))

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.status).toBe('idle')
      expect(mockEnhanceAnswer).not.toHaveBeenCalled()
    })

    it('does not auto-run when userInput is only whitespace', async () => {
      const autoRunParams = {
        ...defaultParams,
        userInput: '   ',
        autoRun: true,
      }

      const { result } = renderHook(() => useEnhanceAnswer(autoRunParams))

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.status).toBe('idle')
      expect(mockEnhanceAnswer).not.toHaveBeenCalled()
    })

    it('does not auto-run when questionId is empty', async () => {
      const autoRunParams = { ...defaultParams, questionId: '', autoRun: true }

      const { result } = renderHook(() => useEnhanceAnswer(autoRunParams))

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.status).toBe('idle')
      expect(mockEnhanceAnswer).not.toHaveBeenCalled()
    })

    it('only runs auto-fetch once even with multiple renders', async () => {
      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      const autoRunParams = { ...defaultParams, autoRun: true }

      const { result, rerender } = renderHook(() =>
        useEnhanceAnswer(autoRunParams)
      )

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })

      const firstCallCount = mockEnhanceAnswer.mock.calls.length

      // Rerender multiple times
      rerender()
      rerender()
      rerender()

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Should still be called only once
      expect(mockEnhanceAnswer).toHaveBeenCalledTimes(firstCallCount)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty reviewed_text from API', async () => {
      const responseWithEmptyText: EnhanceAnswerResponse = {
        ...mockSuccessResponse,
        reviewed_text: '',
      }
      mockEnhanceAnswer.mockResolvedValueOnce(responseWithEmptyText)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.enhancedAnswer).toBe('')
      expect(result.current.status).toBe('success')
    })

    it('handles very long enhanced answer text', async () => {
      const longText = 'A'.repeat(10000)
      const responseWithLongText: EnhanceAnswerResponse = {
        ...mockSuccessResponse,
        reviewed_text: longText,
      }
      mockEnhanceAnswer.mockResolvedValueOnce(responseWithLongText)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.enhancedAnswer).toBe(longText)
      expect(result.current.status).toBe('success')
    })

    it('handles special characters in enhanced answer', async () => {
      const specialCharsText = 'Text with <html> & "quotes" and \n newlines'
      const responseWithSpecialChars: EnhanceAnswerResponse = {
        ...mockSuccessResponse,
        reviewed_text: specialCharsText,
      }
      mockEnhanceAnswer.mockResolvedValueOnce(responseWithSpecialChars)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.enhancedAnswer).toBe(specialCharsText)
      expect(result.current.status).toBe('success')
    })

    it('handles undefined formData and formId', () => {
      const minimalParams: UseEnhanceAnswerParams = {
        userInput: 'Test input',
        questionId: 'q123',
        submissionId: 's456',
      }

      const { result } = renderHook(() => useEnhanceAnswer(minimalParams))

      expect(result.current.status).toBe('idle')
      expect(result.current.error).toBeNull()
    })
  })

  describe('Loading State Computed Property', () => {
    it('loading is true when status is loading', async () => {
      let resolvePromise: (value: EnhanceAnswerResponse) => void
      mockEnhanceAnswer.mockImplementationOnce(
        () =>
          new Promise<EnhanceAnswerResponse>(resolve => {
            resolvePromise = resolve
          })
      )

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      act(() => {
        result.current.fetchEnhancedAnswer()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await act(async () => {
        resolvePromise!(mockSuccessResponse)
      })

      expect(result.current.loading).toBe(false)
    })

    it('loading is false when status is success', async () => {
      mockEnhanceAnswer.mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.status).toBe('success')
      expect(result.current.loading).toBe(false)
    })

    it('loading is false when status is error', async () => {
      mockEnhanceAnswer.mockRejectedValueOnce(new Error('API Error'))

      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      await act(async () => {
        await result.current.fetchEnhancedAnswer()
      })

      expect(result.current.status).toBe('error')
      expect(result.current.loading).toBe(false)
    })

    it('loading is false when status is idle', () => {
      const { result } = renderHook(() => useEnhanceAnswer(defaultParams))

      expect(result.current.status).toBe('idle')
      expect(result.current.loading).toBe(false)
    })
  })
})
