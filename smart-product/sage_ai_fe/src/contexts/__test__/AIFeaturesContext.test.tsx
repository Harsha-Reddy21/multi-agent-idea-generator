import { act, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AIFeaturesProvider, useAIFeatures } from '../AIFeaturesContext'

describe('AIFeaturesContext', () => {
  describe('AIFeaturesProvider', () => {
    it('should render children', () => {
      render(
        <AIFeaturesProvider>
          <div data-testid="test-child">Test Child</div>
        </AIFeaturesProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    it('should provide context value to children', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      expect(result.current).toBeDefined()
      expect(result.current.isVisible).toBe(false)
      expect(result.current.questionText).toBe('')
      expect(result.current.questionId).toBe('')
      expect(result.current.submissionId).toBe('')
      expect(result.current.formId).toBe('')
      expect(result.current.inputValue).toBe('')
      expect(result.current.enhanceAnswerEnabled).toBe(false)
      expect(result.current.enhanceAnswerEnabledByQuestion).toEqual({})
      expect(result.current.coverageScores).toEqual({})
    })
  })

  describe('useAIFeatures Hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAIFeatures())
      }).toThrow('useAIFeatures must be used within AIFeaturesProvider')

      consoleSpy.mockRestore()
    })

    it('should return context when used within provider', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      expect(result.current).toBeDefined()
      expect(typeof result.current.showAIFeatures).toBe('function')
      expect(typeof result.current.hideAIFeatures).toBe('function')
      expect(typeof result.current.updateQuestionText).toBe('function')
      expect(typeof result.current.updateInputValue).toBe('function')
      expect(typeof result.current.updateSubmissionInfo).toBe('function')
      expect(typeof result.current.updateEnhanceAnswerEnabled).toBe('function')
      expect(typeof result.current.updateEnhanceAnswerEnabledForQuestion).toBe(
        'function'
      )
      expect(typeof result.current.isEnhanceAnswerEnabledForQuestion).toBe(
        'function'
      )
      expect(typeof result.current.updateCoverageScore).toBe('function')
      expect(typeof result.current.getCoverageScores).toBe('function')
    })
  })

  describe('State Management', () => {
    describe('showAIFeatures', () => {
      it('should update isVisible, questionText, and questionId', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.showAIFeatures('What is AI?', 'q123')
        })

        expect(result.current.isVisible).toBe(true)
        expect(result.current.questionText).toBe('What is AI?')
        expect(result.current.questionId).toBe('q123')
      })

      it('should handle empty question text', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.showAIFeatures('', 'q456')
        })

        expect(result.current.isVisible).toBe(true)
        expect(result.current.questionText).toBe('')
        expect(result.current.questionId).toBe('q456')
      })

      it('should handle empty question id', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.showAIFeatures('Question text', '')
        })

        expect(result.current.isVisible).toBe(true)
        expect(result.current.questionText).toBe('Question text')
        expect(result.current.questionId).toBe('')
      })

      it('should update values on subsequent calls', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.showAIFeatures('First question', 'q1')
        })

        expect(result.current.questionText).toBe('First question')
        expect(result.current.questionId).toBe('q1')

        act(() => {
          result.current.showAIFeatures('Second question', 'q2')
        })

        expect(result.current.questionText).toBe('Second question')
        expect(result.current.questionId).toBe('q2')
      })
    })

    describe('hideAIFeatures', () => {
      it('should set isVisible to false', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.showAIFeatures('Test', 'q1')
        })

        expect(result.current.isVisible).toBe(true)

        act(() => {
          result.current.hideAIFeatures()
        })

        expect(result.current.isVisible).toBe(false)
      })

      it('should not affect other state values', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.showAIFeatures('Test question', 'q999')
        })

        const questionText = result.current.questionText
        const questionId = result.current.questionId

        act(() => {
          result.current.hideAIFeatures()
        })

        expect(result.current.questionText).toBe(questionText)
        expect(result.current.questionId).toBe(questionId)
      })

      it('should be idempotent', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.hideAIFeatures()
          result.current.hideAIFeatures()
          result.current.hideAIFeatures()
        })

        expect(result.current.isVisible).toBe(false)
      })
    })

    describe('updateQuestionText', () => {
      it('should update question text', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateQuestionText('Updated question')
        })

        expect(result.current.questionText).toBe('Updated question')
      })

      it('should handle empty string', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateQuestionText('Initial text')
        })

        expect(result.current.questionText).toBe('Initial text')

        act(() => {
          result.current.updateQuestionText('')
        })

        expect(result.current.questionText).toBe('')
      })

      it('should handle special characters', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        const specialText = 'Question with <html> & "quotes" \'apostrophes\''

        act(() => {
          result.current.updateQuestionText(specialText)
        })

        expect(result.current.questionText).toBe(specialText)
      })
    })

    describe('updateInputValue', () => {
      it('should update input value', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateInputValue('User input')
        })

        expect(result.current.inputValue).toBe('User input')
      })

      it('should handle empty string', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateInputValue('Some value')
        })

        expect(result.current.inputValue).toBe('Some value')

        act(() => {
          result.current.updateInputValue('')
        })

        expect(result.current.inputValue).toBe('')
      })

      it('should handle long text', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        const longText = 'A'.repeat(1000)

        act(() => {
          result.current.updateInputValue(longText)
        })

        expect(result.current.inputValue).toBe(longText)
      })
    })

    describe('updateSubmissionInfo', () => {
      it('should update submission id and form id', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateSubmissionInfo('sub123', 'form456')
        })

        expect(result.current.submissionId).toBe('sub123')
        expect(result.current.formId).toBe('form456')
      })

      it('should handle empty strings', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateSubmissionInfo('', '')
        })

        expect(result.current.submissionId).toBe('')
        expect(result.current.formId).toBe('')
      })

      it('should update values on subsequent calls', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateSubmissionInfo('sub1', 'form1')
        })

        expect(result.current.submissionId).toBe('sub1')
        expect(result.current.formId).toBe('form1')

        act(() => {
          result.current.updateSubmissionInfo('sub2', 'form2')
        })

        expect(result.current.submissionId).toBe('sub2')
        expect(result.current.formId).toBe('form2')
      })
    })

    describe('updateEnhanceAnswerEnabled', () => {
      it('should enable enhance answer', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabled(true)
        })

        expect(result.current.enhanceAnswerEnabled).toBe(true)
      })

      it('should disable enhance answer', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabled(true)
        })

        expect(result.current.enhanceAnswerEnabled).toBe(true)

        act(() => {
          result.current.updateEnhanceAnswerEnabled(false)
        })

        expect(result.current.enhanceAnswerEnabled).toBe(false)
      })

      it('should toggle enhance answer multiple times', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabled(true)
        })
        expect(result.current.enhanceAnswerEnabled).toBe(true)

        act(() => {
          result.current.updateEnhanceAnswerEnabled(false)
        })
        expect(result.current.enhanceAnswerEnabled).toBe(false)

        act(() => {
          result.current.updateEnhanceAnswerEnabled(true)
        })
        expect(result.current.enhanceAnswerEnabled).toBe(true)
      })
    })

    describe('updateEnhanceAnswerEnabledForQuestion', () => {
      it('should enable enhance answer for specific question', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q1', true)
        })

        expect(result.current.enhanceAnswerEnabledByQuestion['q1']).toBe(true)
      })

      it('should disable enhance answer for specific question', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q2', true)
        })

        expect(result.current.enhanceAnswerEnabledByQuestion['q2']).toBe(true)

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q2', false)
        })

        expect(result.current.enhanceAnswerEnabledByQuestion['q2']).toBe(false)
      })

      it('should handle multiple questions independently', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q1', true)
          result.current.updateEnhanceAnswerEnabledForQuestion('q2', false)
          result.current.updateEnhanceAnswerEnabledForQuestion('q3', true)
        })

        expect(result.current.enhanceAnswerEnabledByQuestion['q1']).toBe(true)
        expect(result.current.enhanceAnswerEnabledByQuestion['q2']).toBe(false)
        expect(result.current.enhanceAnswerEnabledByQuestion['q3']).toBe(true)
      })

      it('should preserve existing question states when updating', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q1', true)
          result.current.updateEnhanceAnswerEnabledForQuestion('q2', true)
        })

        expect(result.current.enhanceAnswerEnabledByQuestion['q1']).toBe(true)
        expect(result.current.enhanceAnswerEnabledByQuestion['q2']).toBe(true)

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q3', false)
        })

        expect(result.current.enhanceAnswerEnabledByQuestion['q1']).toBe(true)
        expect(result.current.enhanceAnswerEnabledByQuestion['q2']).toBe(true)
        expect(result.current.enhanceAnswerEnabledByQuestion['q3']).toBe(false)
      })
    })

    describe('isEnhanceAnswerEnabledForQuestion', () => {
      it('should return true when question is enabled', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q1', true)
        })

        expect(result.current.isEnhanceAnswerEnabledForQuestion('q1')).toBe(
          true
        )
      })

      it('should return false when question is disabled', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q2', false)
        })

        expect(result.current.isEnhanceAnswerEnabledForQuestion('q2')).toBe(
          false
        )
      })

      it('should return false for non-existent question', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        expect(
          result.current.isEnhanceAnswerEnabledForQuestion('nonexistent')
        ).toBe(false)
      })

      it('should handle multiple questions correctly', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateEnhanceAnswerEnabledForQuestion('q1', true)
          result.current.updateEnhanceAnswerEnabledForQuestion('q2', false)
        })

        expect(result.current.isEnhanceAnswerEnabledForQuestion('q1')).toBe(
          true
        )
        expect(result.current.isEnhanceAnswerEnabledForQuestion('q2')).toBe(
          false
        )
        expect(result.current.isEnhanceAnswerEnabledForQuestion('q3')).toBe(
          false
        )
      })
    })

    describe('updateCoverageScore', () => {
      it('should update coverage score for a question', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 85)
        })

        expect(result.current.coverageScores['q1']).toBe(85)
      })

      it('should handle score of 0', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 0)
        })

        expect(result.current.coverageScores['q1']).toBe(0)
      })

      it('should handle score of 100', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 100)
        })

        expect(result.current.coverageScores['q1']).toBe(100)
      })

      it('should handle multiple questions independently', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 75)
          result.current.updateCoverageScore('q2', 90)
          result.current.updateCoverageScore('q3', 60)
        })

        expect(result.current.coverageScores['q1']).toBe(75)
        expect(result.current.coverageScores['q2']).toBe(90)
        expect(result.current.coverageScores['q3']).toBe(60)
      })

      it('should preserve existing scores when updating', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 80)
          result.current.updateCoverageScore('q2', 70)
        })

        expect(result.current.coverageScores['q1']).toBe(80)
        expect(result.current.coverageScores['q2']).toBe(70)

        act(() => {
          result.current.updateCoverageScore('q3', 95)
        })

        expect(result.current.coverageScores['q1']).toBe(80)
        expect(result.current.coverageScores['q2']).toBe(70)
        expect(result.current.coverageScores['q3']).toBe(95)
      })

      it('should update existing score', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 50)
        })

        expect(result.current.coverageScores['q1']).toBe(50)

        act(() => {
          result.current.updateCoverageScore('q1', 75)
        })

        expect(result.current.coverageScores['q1']).toBe(75)
      })

      it('should handle negative scores', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', -10)
        })

        expect(result.current.coverageScores['q1']).toBe(-10)
      })

      it('should handle decimal scores', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 85.5)
        })

        expect(result.current.coverageScores['q1']).toBe(85.5)
      })
    })

    describe('getCoverageScores', () => {
      it('should return empty object initially', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        const scores = result.current.getCoverageScores()
        expect(scores).toEqual({})
      })

      it('should return all coverage scores', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 80)
          result.current.updateCoverageScore('q2', 90)
          result.current.updateCoverageScore('q3', 70)
        })

        const scores = result.current.getCoverageScores()
        expect(scores).toEqual({
          q1: 80,
          q2: 90,
          q3: 70,
        })
      })

      it('should return updated scores after changes', () => {
        const { result } = renderHook(() => useAIFeatures(), {
          wrapper: AIFeaturesProvider,
        })

        act(() => {
          result.current.updateCoverageScore('q1', 50)
        })

        let scores = result.current.getCoverageScores()
        expect(scores).toEqual({ q1: 50 })

        act(() => {
          result.current.updateCoverageScore('q1', 75)
          result.current.updateCoverageScore('q2', 85)
        })

        scores = result.current.getCoverageScores()
        expect(scores).toEqual({ q1: 75, q2: 85 })
      })
    })
  })

  describe('useMemo Dependencies', () => {
    it('should update context value when state changes', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      expect(result.current.isVisible).toBe(false)
      expect(result.current.questionText).toBe('')

      act(() => {
        result.current.showAIFeatures('Test', 'q1')
      })

      // Values should update
      expect(result.current.isVisible).toBe(true)
      expect(result.current.questionText).toBe('Test')
      expect(result.current.questionId).toBe('q1')
    })

    it('should provide all context methods after state changes', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      act(() => {
        result.current.updateQuestionText('New text')
      })

      // All methods should still be available
      expect(typeof result.current.showAIFeatures).toBe('function')
      expect(typeof result.current.hideAIFeatures).toBe('function')
      expect(typeof result.current.updateQuestionText).toBe('function')
      expect(typeof result.current.updateInputValue).toBe('function')
      expect(typeof result.current.updateSubmissionInfo).toBe('function')
      expect(typeof result.current.updateEnhanceAnswerEnabled).toBe('function')
      expect(typeof result.current.updateEnhanceAnswerEnabledForQuestion).toBe(
        'function'
      )
      expect(typeof result.current.isEnhanceAnswerEnabledForQuestion).toBe(
        'function'
      )
      expect(typeof result.current.updateCoverageScore).toBe('function')
      expect(typeof result.current.getCoverageScores).toBe('function')

      // State should be updated
      expect(result.current.questionText).toBe('New text')
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle complete workflow', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      // Show AI features
      act(() => {
        result.current.showAIFeatures('What is machine learning?', 'q1')
      })

      expect(result.current.isVisible).toBe(true)
      expect(result.current.questionText).toBe('What is machine learning?')
      expect(result.current.questionId).toBe('q1')

      // Update submission info
      act(() => {
        result.current.updateSubmissionInfo('sub123', 'form456')
      })

      expect(result.current.submissionId).toBe('sub123')
      expect(result.current.formId).toBe('form456')

      // Enable enhance answer
      act(() => {
        result.current.updateEnhanceAnswerEnabled(true)
        result.current.updateEnhanceAnswerEnabledForQuestion('q1', true)
      })

      expect(result.current.enhanceAnswerEnabled).toBe(true)
      expect(result.current.isEnhanceAnswerEnabledForQuestion('q1')).toBe(true)

      // Update coverage score
      act(() => {
        result.current.updateCoverageScore('q1', 85)
      })

      expect(result.current.coverageScores['q1']).toBe(85)

      // Update input value
      act(() => {
        result.current.updateInputValue('User answer text')
      })

      expect(result.current.inputValue).toBe('User answer text')

      // Hide AI features
      act(() => {
        result.current.hideAIFeatures()
      })

      expect(result.current.isVisible).toBe(false)

      // Verify other state is preserved
      expect(result.current.questionText).toBe('What is machine learning?')
      expect(result.current.submissionId).toBe('sub123')
      expect(result.current.enhanceAnswerEnabled).toBe(true)
      expect(result.current.coverageScores['q1']).toBe(85)
    })

    it('should handle multiple questions with different settings', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      act(() => {
        result.current.updateEnhanceAnswerEnabledForQuestion('q1', true)
        result.current.updateEnhanceAnswerEnabledForQuestion('q2', false)
        result.current.updateEnhanceAnswerEnabledForQuestion('q3', true)

        result.current.updateCoverageScore('q1', 90)
        result.current.updateCoverageScore('q2', 75)
        result.current.updateCoverageScore('q3', 88)
      })

      expect(result.current.isEnhanceAnswerEnabledForQuestion('q1')).toBe(true)
      expect(result.current.isEnhanceAnswerEnabledForQuestion('q2')).toBe(false)
      expect(result.current.isEnhanceAnswerEnabledForQuestion('q3')).toBe(true)

      const scores = result.current.getCoverageScores()
      expect(scores).toEqual({
        q1: 90,
        q2: 75,
        q3: 88,
      })
    })

    it('should handle state resets and updates', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      // Set initial state
      act(() => {
        result.current.showAIFeatures('Question 1', 'q1')
        result.current.updateInputValue('Answer 1')
        result.current.updateCoverageScore('q1', 80)
      })

      // Update to new question
      act(() => {
        result.current.showAIFeatures('Question 2', 'q2')
        result.current.updateInputValue('Answer 2')
        result.current.updateCoverageScore('q2', 95)
      })

      expect(result.current.questionText).toBe('Question 2')
      expect(result.current.questionId).toBe('q2')
      expect(result.current.inputValue).toBe('Answer 2')

      // Previous coverage score should still exist
      expect(result.current.coverageScores['q1']).toBe(80)
      expect(result.current.coverageScores['q2']).toBe(95)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid state updates', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.updateCoverageScore(`q${i}`, i)
        }
      })

      const scores = result.current.getCoverageScores()
      expect(Object.keys(scores).length).toBe(100)
      expect(scores['q50']).toBe(50)
      expect(scores['q99']).toBe(99)
    })

    it('should handle same question id with different values', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      act(() => {
        result.current.showAIFeatures('First text', 'q1')
      })

      expect(result.current.questionText).toBe('First text')

      act(() => {
        result.current.showAIFeatures('Second text', 'q1')
      })

      expect(result.current.questionText).toBe('Second text')
      expect(result.current.questionId).toBe('q1')
    })

    it('should handle unicode characters', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      const unicodeText = '你好 🌟 مرحبا Здравствуйте'

      act(() => {
        result.current.updateQuestionText(unicodeText)
        result.current.updateInputValue(unicodeText)
      })

      expect(result.current.questionText).toBe(unicodeText)
      expect(result.current.inputValue).toBe(unicodeText)
    })

    it('should handle very long question ids', () => {
      const { result } = renderHook(() => useAIFeatures(), {
        wrapper: AIFeaturesProvider,
      })

      const longId = 'q' + 'x'.repeat(1000)

      act(() => {
        result.current.showAIFeatures('Test', longId)
        result.current.updateCoverageScore(longId, 85)
      })

      expect(result.current.questionId).toBe(longId)
      expect(result.current.coverageScores[longId]).toBe(85)
    })
  })
})
