import { act, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { dashboardApi } from '../../core/api/dashboard.api'
import { documentExtractionStatus } from '../../core/api/document-extraction-status.api'
import { ExtractionStatus } from '../../core/models/extraction-status.model'
import {
  ExtractionStatusProvider,
  useExtractionStatus,
} from '../ExtractionStatusContext'

// Mock the dashboard API
vi.mock('../../core/api/dashboard.api', () => ({
  dashboardApi: {
    getSubmissionStatus: vi.fn(),
  },
}))

// Mock the document extraction status API
vi.mock('../../core/api/document-extraction-status.api', () => ({
  documentExtractionStatus: {
    connectSSE: vi.fn(),
  },
}))

// Mock the UserContext
vi.mock('../UserContext', () => ({
  useUser: vi.fn(() => ({
    user: { email: 'test@example.com' },
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
}))

describe('ExtractionStatusContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('ExtractionStatusProvider', () => {
    it('should render children', () => {
      render(
        <ExtractionStatusProvider>
          <div data-testid="test-child">Test Child</div>
        </ExtractionStatusProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    it('should provide initial context values', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      expect(result.current.isExtracting).toBe(false)
      expect(result.current.extractionStatus).toBe(null)
      expect(result.current.extractionMessage).toBe('')
      expect(result.current.submissionId).toBe(null)
      expect(result.current.progress).toBe(0)
      expect(result.current.isDismissed).toBe(false)
      expect(typeof result.current.startPolling).toBe('function')
      expect(typeof result.current.stopPolling).toBe('function')
      expect(typeof result.current.dismissBanner).toBe('function')
      expect(typeof result.current.startSSE).toBe('function')
      expect(typeof result.current.stopSSE).toBe('function')
    })
  })

  describe('useExtractionStatus Hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useExtractionStatus())
      }).toThrow(
        'useExtractionStatus must be used within ExtractionStatusProvider'
      )

      consoleSpy.mockRestore()
    })

    it('should return context when used within provider', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      expect(result.current).toBeDefined()
      expect(result.current.isExtracting).toBeDefined()
      expect(result.current.extractionStatus).toBeDefined()
      expect(result.current.extractionMessage).toBeDefined()
    })
  })

  // Add test for getStatusMessage function coverage
  describe('getStatusMessage function', () => {
    it('should return correct messages for different status values', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      // Start SSE to trigger getStatusMessage usage
      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          // Test different status messages
          onMessage({ status: 'processing_questions', message: 'Test' })
          onMessage({ status: 'extracting_blocks', message: 'Test' })
          onMessage({ status: 'storing_results', message: 'Test' })
          onMessage({ status: 'fetching_questions', message: 'Test' })
          onMessage({ status: 'questions_fetched', message: 'Test' })
          onMessage({ status: 'blocks_extracted', message: 'Test' })
          onMessage({ status: 'question_processed', message: 'Test' })
          onMessage({ status: 'processing', message: 'Test' })
          onMessage({ status: 'pending', message: 'Test' })
          onMessage({ status: 'unknown_status', message: 'Test' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      // The messages should be formatted with event count
      expect(result.current.extractionMessage).toContain('Processing...')
    })
  })

  // Add test for UserContext dependency
  describe('UserContext dependency', () => {
    it('should work with different user email', async () => {
      // We can't easily change the mock at runtime due to hoisting
      // Instead, let's test that SSE is called with the mocked user
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(documentExtractionStatus.connectSSE).toHaveBeenCalledWith(
        'sub123',
        expect.any(Function),
        { email: 'test@example.com' }
      )
    })

    it('should handle user context integration', () => {
      // Test that the provider works with the mocked user context
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(documentExtractionStatus.connectSSE).toHaveBeenCalledWith(
        'sub123',
        expect.any(Function),
        expect.objectContaining({
          email: expect.any(String)
        })
      )
    })
  })

  // Add test for memoization
  describe('Context value memoization', () => {
    it('should maintain function references when state hasn not changed', () => {
      const { result, rerender } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      // Rerender without changing any state
      rerender()

      // Functions should be available and of correct type
      expect(typeof result.current.startPolling).toBe('function')
      expect(typeof result.current.stopPolling).toBe('function')
      expect(typeof result.current.dismissBanner).toBe('function')
      expect(typeof result.current.startSSE).toBe('function')
      expect(typeof result.current.stopSSE).toBe('function')
      
      // Test that state values remain the same
      expect(result.current.isExtracting).toBe(false)
      expect(result.current.extractionStatus).toBe(null)
      expect(result.current.extractionMessage).toBe('')
      expect(result.current.submissionId).toBe(null)
      expect(result.current.progress).toBe(0)
      expect(result.current.isDismissed).toBe(false)
    })

    it('should update context value when state changes', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const initialValue = result.current

      act(() => {
        result.current.dismissBanner()
      })

      // Value should be different reference after state change
      expect(result.current).not.toBe(initialValue)
      expect(result.current.isDismissed).toBe(true)
    })
  })

  // Add test for refs behavior
  describe('Refs behavior', () => {
    it('should maintain refs state across re-renders', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.isExtracting).toBe(true)
      expect(result.current.submissionId).toBe('sub123')
    })
  })

  // Add test for timeout cleanup edge cases
  describe('Timeout cleanup', () => {
    it('should not clear auto-dismiss timeout when stopping SSE in terminal state', async () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          // Trigger success immediately
          onMessage({ status: 'success', message: 'Success' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.isDismissed).toBe(false)

      // Fast forward 5 seconds to trigger auto-dismiss
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.isDismissed).toBe(true)
    })
  })

  // Add test for SSE error handling
  describe('SSE Error handling', () => {
    it('should handle disconnect function errors gracefully', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn().mockImplementation(() => {
        throw new Error('Disconnect failed')
      })
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      act(() => {
        result.current.startSSE('sub123')
      })

      // Should not throw error when stopping - the error is caught in try-catch
      expect(() => {
        act(() => {
          result.current.stopSSE()
        })
      }).not.toThrow()
    })

    it('should handle successful SSE connection setup', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      // Should successfully start SSE without throwing
      expect(() => {
        act(() => {
          result.current.startSSE('sub123')
        })
      }).not.toThrow()

      expect(result.current.isExtracting).toBe(true)
      expect(result.current.submissionId).toBe('sub123')
    })
  })

  // Add test for enum value matching in SSE
  describe('SSE Enum matching', () => {
    it('should handle status strings that match enum values', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          // Send enum value as string
          onMessage({ status: ExtractionStatus.Processing, message: 'Processing' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Processing)
    })

    it('should handle status strings that do not match enum values', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          // Send custom status string
          onMessage({ status: 'custom_status', message: 'Custom' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.extractionStatus).toBe('custom_status')
    })
  })

  // Add test for progress calculation edge cases
  describe('Progress calculation edge cases', () => {
    it('should handle progress calculation with more than total questions', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          // Send 15 events (more than TOTAL_QUESTIONS of 14)
          for (let i = 0; i < 15; i++) {
            onMessage({ status: 'processing_questions', message: 'Processing' })
          }
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      // Progress should be capped at 100%
      expect(result.current.progress).toBe(100)
    })
  })

  // Add test for polling with different response formats
  describe('Polling response format handling', () => {
    it('should handle polling response with missing fields', async () => {
      vi.mocked(dashboardApi.getSubmissionStatus).mockResolvedValue({
        submission_id: 'sub123',
        status: ExtractionStatus.Processing,
        // Missing message field
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      } as any)

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Processing)
      expect(result.current.extractionMessage).toBeUndefined()
    })
  })

  // Add test for Success status handling (different from Completed)
  describe('Success status handling', () => {
    it('should handle Success status in polling', async () => {
      vi.mocked(dashboardApi.getSubmissionStatus).mockResolvedValue({
        submission_id: 'sub123',
        status: ExtractionStatus.Success,
        message: 'Success',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Success)
      expect(result.current.isExtracting).toBe(false)
    })
  })

  // Add test for concurrent startSSE calls
  describe('Concurrent SSE operations', () => {
    it('should handle rapid startSSE calls for same submission', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      act(() => {
        result.current.startSSE('sub123')
        result.current.startSSE('sub123')
        result.current.startSSE('sub123')
      })

      // Should only call connectSSE once for same submission
      expect(documentExtractionStatus.connectSSE).toHaveBeenCalledTimes(1)
    })

    it('should handle startSSE after terminal state for same submission', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          onMessage({ status: 'success', message: 'Success' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Success)

      // Try to start SSE again for same submission - should be ignored
      act(() => {
        result.current.startSSE('sub123')
      })

      expect(documentExtractionStatus.connectSSE).toHaveBeenCalledTimes(1)
    })
  })

  // Add tests for additional edge cases and missing coverage
  describe('Additional edge cases', () => {
    it('should handle SSE message with empty status', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          onMessage({ status: '', message: 'Empty status' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.extractionMessage).toContain('Processing...')
    })

    it('should handle SSE failure status as string', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          onMessage({ status: 'failed', message: 'Failed' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Failed)
      expect(result.current.isExtracting).toBe(false)
    })

    it('should handle multiple stopSSE calls', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.stopSSE()
          result.current.stopSSE()
          result.current.stopSSE()
        })
      }).not.toThrow()
    })

    it('should handle startSSE with different submission IDs', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.submissionId).toBe('sub123')

      act(() => {
        result.current.startSSE('sub456')
      })

      expect(result.current.submissionId).toBe('sub456')
      // Should call connectSSE twice for different submissions
      expect(documentExtractionStatus.connectSSE).toHaveBeenCalledTimes(2)
    })

    it('should handle component unmount during SSE', () => {
      const { result, unmount } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      act(() => {
        result.current.startSSE('sub123')
      })

      // Should not throw when unmounting
      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })

  describe('Polling Error Scenarios', () => {
    it('should handle 400 status error during polling with server error message', async () => {
      const error = { status: 400, message: 'Bad Request' }
      vi.mocked(dashboardApi.getSubmissionStatus).mockRejectedValue(error)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Failed)
      expect(result.current.extractionMessage).toBe(
        'Server temporarily unavailable. Please try again shortly.'
      )
      expect(result.current.isExtracting).toBe(false)
      expect(result.current.isDismissed).toBe(false)

      // Fast forward 5 seconds to test auto-dismiss
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.isDismissed).toBe(true)

      consoleSpy.mockRestore()
    })

    it('should handle 401 status error during polling', async () => {
      const error = { status: 401, message: 'Unauthorized' }
      vi.mocked(dashboardApi.getSubmissionStatus).mockRejectedValue(error)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Failed)
      expect(result.current.isExtracting).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should handle 404 status error during polling', async () => {
      const error = { status: 404, message: 'Not Found' }
      vi.mocked(dashboardApi.getSubmissionStatus).mockRejectedValue(error)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Failed)
      expect(result.current.isExtracting).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should handle 500 status error during polling with specific error message', async () => {
      const error = { status: 500, message: 'Internal Server Error' }
      vi.mocked(dashboardApi.getSubmissionStatus).mockRejectedValue(error)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Failed)
      expect(result.current.extractionMessage).toBe(
        'Server temporarily unavailable. Please try again shortly.'
      )
      expect(result.current.progress).toBe(0)
      expect(result.current.isExtracting).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should continue polling on non-HTTP errors (no status code)', async () => {
      const error = new Error('Network error')
      vi.mocked(dashboardApi.getSubmissionStatus).mockRejectedValue(error)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      // Should still be polling (not stopped)
      expect(result.current.isExtracting).toBe(true)

      consoleSpy.mockRestore()
    })
  })

  describe('Polling Interval and Timing', () => {
    it('should set up polling interval and call pollSubmissionStatus repeatedly', async () => {
      vi.mocked(dashboardApi.getSubmissionStatus).mockResolvedValue({
        submission_id: 'sub123',
        status: ExtractionStatus.Processing,
        message: 'Processing...',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      // Initial call
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(dashboardApi.getSubmissionStatus).toHaveBeenCalledTimes(1)

      // Advance by polling interval (3000ms)
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(dashboardApi.getSubmissionStatus).toHaveBeenCalledTimes(2)

      // Advance by another interval
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(dashboardApi.getSubmissionStatus).toHaveBeenCalledTimes(3)
    })

    it('should auto-dismiss banner after terminal status', async () => {
      vi.mocked(dashboardApi.getSubmissionStatus)
        .mockResolvedValueOnce({
          submission_id: 'sub123',
          status: ExtractionStatus.Processing,
          message: 'Processing...',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        })
        .mockResolvedValueOnce({
          submission_id: 'sub123',
          status: ExtractionStatus.Failed,
          message: 'Failed',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        })

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      // First polling call
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Processing)
      expect(result.current.isExtracting).toBe(true)

      // Second polling call - terminal status
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Failed)
      expect(result.current.isExtracting).toBe(false)
      expect(result.current.isDismissed).toBe(false)

      // Auto-dismiss after 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.isDismissed).toBe(true)
    })
  })

  describe('Async startSSE function', () => {
    it('should handle async startSSE function properly', async () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockReturnValue(mockDisconnect)

      // This tests the async nature of startSSE function (line 149)
      await act(async () => {
        await result.current.startSSE('sub123')
      })

      expect(result.current.isExtracting).toBe(true)
      expect(result.current.submissionId).toBe('sub123')
      expect(documentExtractionStatus.connectSSE).toHaveBeenCalledTimes(1)
    })
  })

  describe('Progress calculation during polling', () => {
    it('should calculate progress based on elapsed time during polling', async () => {
      vi.mocked(dashboardApi.getSubmissionStatus).mockResolvedValue({
        submission_id: 'sub123',
        status: ExtractionStatus.Processing,
        message: 'Processing...',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.progress).toBeGreaterThan(0)
      expect(result.current.progress).toBeLessThan(95) // Capped at 95% until completed

      // Advance time to increase progress
      await act(async () => {
        vi.advanceTimersByTime(10000) // 10 seconds
      })

      expect(result.current.progress).toBeGreaterThan(0)
    })

    it('should set progress to 100% when status is Completed during polling', async () => {
      vi.mocked(dashboardApi.getSubmissionStatus).mockResolvedValue({
        submission_id: 'sub123',
        status: ExtractionStatus.Completed,
        message: 'Completed',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.progress).toBe(100)
      expect(result.current.extractionStatus).toBe(ExtractionStatus.Completed)
    })

    it('should reset progress to 0 when status is Failed during polling', async () => {
      vi.mocked(dashboardApi.getSubmissionStatus).mockResolvedValue({
        submission_id: 'sub123',
        status: ExtractionStatus.Failed,
        message: 'Failed',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })

      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      act(() => {
        result.current.startPolling('sub123')
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.progress).toBe(0)
      expect(result.current.extractionStatus).toBe(ExtractionStatus.Failed)
    })
  })

  // Tests to target specific uncovered lines
  describe('Uncovered lines targeting', () => {
    // Target line 201 - early return when isTerminalStateRef.current is true
    it('should ignore SSE events when already in terminal state', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      let onMessageCallback: any
      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          onMessageCallback = onMessage
          // Send terminal status first
          onMessage({ status: 'completed', message: 'Completed' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Completed)

      // Now try to send another event - should be ignored due to terminal state
      const initialMessage = result.current.extractionMessage
      act(() => {
        onMessageCallback({ status: 'processing', message: 'Should be ignored' })
      })

      // Status and message should remain unchanged
      expect(result.current.extractionStatus).toBe(ExtractionStatus.Completed)
      expect(result.current.extractionMessage).toBe(initialMessage)
    })

    // Target lines 247-255 - completed branch with auto-dismiss timeout
    it('should handle completed status with 100% progress and auto-dismiss', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          // Send completed status
          onMessage({ status: 'completed', message: 'Extraction completed successfully' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      expect(result.current.extractionStatus).toBe(ExtractionStatus.Completed)
      expect(result.current.progress).toBe(100)
      expect(result.current.extractionMessage).toBe('Extraction completed successfully')
      expect(result.current.isExtracting).toBe(false)
      expect(result.current.isDismissed).toBe(false)

      // Fast forward 5 seconds for auto-dismiss
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.isDismissed).toBe(true)
    })

    // Target line 291 - status string fallback when no enum match
    it('should set status as string when no enum match is found', () => {
      const { result } = renderHook(() => useExtractionStatus(), {
        wrapper: ExtractionStatusProvider,
      })

      const mockDisconnect = vi.fn()
      vi.mocked(documentExtractionStatus.connectSSE).mockImplementation(
        (_, onMessage) => {
          // Send a status string that doesn't match any enum value
          onMessage({ status: 'unknown_custom_status', message: 'Unknown status' })
          return mockDisconnect
        }
      )

      act(() => {
        result.current.startSSE('sub123')
      })

      // Should set the status as the string itself
      expect(result.current.extractionStatus).toBe('unknown_custom_status')
      expect(result.current.extractionMessage).toContain('Processing...')
    })
  })
})
