import { describe, expect, it, vi } from 'vitest'

import { userFeedbackApi } from './user-feedback.api'

describe('UserFeedbackApi', () => {
  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const mockPayload = {
        submission_id: 'sub123',
        question_id: 'AI-Q1',
        form_id: 'form456',
        user_input: 'Test input',
        ai_feature_type: 'suggestions' as const,
        feedback_type: 'like' as const,
        feedback_tags: ['Relevant', 'Accurate'],
        user_comment: 'Great suggestions!',
      }

      const mockResponse = {
        interaction: {
          id: 'interaction123',
          submission_id: 'sub123',
          question_id: 'AI-Q1',
          user_input: 'Test input',
          ai_feature_type: 'suggestions' as const,
          ai_generated_content: {},
          created_at: '2025-11-26T10:00:00Z',
        },
        feedback: {
          id: 'feedback123',
          interaction_id: 'interaction123',
          form_id: 'form456',
          feedback_type: 'like' as const,
          feedback_tags: ['Relevant', 'Accurate'],
          user_comment: 'Great suggestions!',
          rating: null,
          created_at: '2025-11-26T10:00:00Z',
          updated_at: '2025-11-26T10:00:00Z',
        },
      }

      vi.spyOn(userFeedbackApi, 'submitFeedback').mockResolvedValue(
        mockResponse
      )

      const result = await userFeedbackApi.submitFeedback(mockPayload)

      expect(result).toEqual(mockResponse)
      expect(userFeedbackApi.submitFeedback).toHaveBeenCalledWith(mockPayload)
    })

    it('should handle negative feedback with tags', async () => {
      const mockPayload = {
        submission_id: 'sub123',
        question_id: 'AI-Q2',
        form_id: 'form456',
        user_input: 'Original text',
        ai_feature_type: 'enhance_answer' as const,
        feedback_type: 'dislike' as const,
        feedback_tags: ['Not Relevant', 'Needs Improvement'],
        user_comment: 'The enhancement was not helpful',
      }

      const mockResponse = {
        interaction: {
          id: 'interaction456',
          submission_id: 'sub123',
          question_id: 'AI-Q2',
          user_input: 'Original text',
          ai_feature_type: 'enhance_answer' as const,
          ai_generated_content: {},
          created_at: '2025-11-26T10:00:00Z',
        },
        feedback: {
          id: 'feedback456',
          interaction_id: 'interaction456',
          form_id: 'form456',
          feedback_type: 'dislike' as const,
          feedback_tags: ['Not Relevant', 'Needs Improvement'],
          user_comment: 'The enhancement was not helpful',
          rating: null,
          created_at: '2025-11-26T10:00:00Z',
          updated_at: '2025-11-26T10:00:00Z',
        },
      }

      vi.spyOn(userFeedbackApi, 'submitFeedback').mockResolvedValue(
        mockResponse
      )

      const result = await userFeedbackApi.submitFeedback(mockPayload)

      expect(result).toEqual(mockResponse)
    })

    it('should handle data_extracts feedback type', async () => {
      const mockPayload = {
        submission_id: 'sub789',
        question_id: 'AI-Q3',
        form_id: 'form789',
        user_input: null,
        ai_feature_type: 'data_extracts' as const,
        feedback_type: 'like' as const,
        feedback_tags: null,
        user_comment: null,
      }

      const mockResponse = {
        interaction: {
          id: 'interaction789',
          submission_id: 'sub789',
          question_id: 'AI-Q3',
          user_input: null,
          ai_feature_type: 'data_extracts' as const,
          ai_generated_content: {},
          created_at: '2025-11-26T10:00:00Z',
        },
        feedback: {
          id: 'feedback789',
          interaction_id: 'interaction789',
          form_id: 'form789',
          feedback_type: 'like' as const,
          feedback_tags: null,
          user_comment: null,
          rating: null,
          created_at: '2025-11-26T10:00:00Z',
          updated_at: '2025-11-26T10:00:00Z',
        },
      }

      vi.spyOn(userFeedbackApi, 'submitFeedback').mockResolvedValue(
        mockResponse
      )

      const result = await userFeedbackApi.submitFeedback(mockPayload)

      expect(result).toEqual(mockResponse)
    })
  })
})
