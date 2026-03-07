import { beforeEach, describe, expect, it, vi } from 'vitest'

import { documentExtractionStatus } from './document-extraction-status.api'

// Mock EventSource
class MockEventSource {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 2

  url: string
  withCredentials: boolean
  readyState: number = 1 // OPEN
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string, options?: { withCredentials?: boolean }) {
    this.url = url
    this.withCredentials = options?.withCredentials ?? false
  }

  close() {
    this.readyState = 2 // CLOSED
  }

  // Helper methods for testing
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({
        data: JSON.stringify(data),
      } as MessageEvent)
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

describe('DocumentExtractionStatusApi', () => {
  let mockEventSource: MockEventSource
  let mockOnEvent: (event: {
    [key: string]: any
    status?: string
    message?: string
  }) => void

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnEvent = vi.fn()

    // Mock EventSource constructor
    global.EventSource = class extends MockEventSource {
      constructor(url: string, options?: { withCredentials?: boolean }) {
        super(url, options)
        mockEventSource = this
      }
    } as any
  })

  describe('connectSSE', () => {
    it('should create EventSource with correct URL and submissionId', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      expect(mockEventSource.url).toContain('/stream/sub123')
      disconnect()
    })

    it('should include email in URL query parameter', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent,
        {
          email: 'test@example.com',
        }
      )

      expect(mockEventSource.url).toContain('email=test%40example.com')
      disconnect()
    })

    it('should set withCredentials option when provided', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent,
        {
          withCredentials: true,
        }
      )

      expect(mockEventSource.withCredentials).toBe(true)
      disconnect()
    })

    it('should default withCredentials to false', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      expect(mockEventSource.withCredentials).toBe(false)
      disconnect()
    })

    it('should call onEvent callback when message is received', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      const payload = {
        status: 'processing',
        message: 'Processing documents',
      }

      mockEventSource.simulateMessage(payload)

      expect(mockOnEvent).toHaveBeenCalledWith(payload)
      disconnect()
    })

    it('should handle terminal status "success" and close connection', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      const payload = {
        status: 'success',
        message: 'Extraction completed',
      }

      mockEventSource.simulateMessage(payload)

      expect(mockOnEvent).toHaveBeenCalledWith(payload)
      expect(mockEventSource.readyState).toBe(2) // CLOSED
      disconnect()
    })

    it('should handle terminal status "failed" and close connection', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      const payload = {
        status: 'failed',
        message: 'Extraction failed',
      }

      mockEventSource.simulateMessage(payload)

      expect(mockOnEvent).toHaveBeenCalledWith(payload)
      expect(mockEventSource.readyState).toBe(2) // CLOSED
      disconnect()
    })

    it('should handle terminal status "completed" and close connection', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      const payload = {
        status: 'completed',
        message: 'Extraction completed',
      }

      mockEventSource.simulateMessage(payload)

      expect(mockOnEvent).toHaveBeenCalledWith(payload)
      expect(mockEventSource.readyState).toBe(2) // CLOSED
      disconnect()
    })

    it('should ignore messages after terminal status is received', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      // First message - terminal status
      mockEventSource.simulateMessage({ status: 'success', message: 'Done' })
      expect(mockOnEvent).toHaveBeenCalledTimes(1)

      // Second message - should be ignored
      mockEventSource.simulateMessage({
        status: 'processing',
        message: 'Still processing',
      })
      expect(mockOnEvent).toHaveBeenCalledTimes(1) // Still 1, not 2

      disconnect()
    })

    it('should ignore messages if connection is already closed', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      // Close connection manually
      mockEventSource.close()

      // Try to send message
      mockEventSource.simulateMessage({
        status: 'processing',
        message: 'Processing',
      })

      // The implementation checks readyState === CLOSED and returns early
      // So onEvent should NOT be called
      expect(mockOnEvent).not.toHaveBeenCalled()
      disconnect()
    })

    it('should handle JSON parse errors gracefully', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      // Simulate invalid JSON
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage({
          data: 'invalid json',
        } as MessageEvent)
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error parsing SSE message:',
        expect.any(Error)
      )
      expect(mockOnEvent).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
      disconnect()
    })

    it('should handle error events when connection is closed', () => {
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {})

      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      // Clear the spy after connection is created (to ignore the 'url' log)
      consoleLogSpy.mockClear()

      // Close connection first
      mockEventSource.close()

      // Simulate error
      mockEventSource.simulateError()

      // Should log 'SSE connection closed'
      expect(consoleLogSpy).toHaveBeenCalledWith('SSE connection closed')
      expect(mockEventSource.readyState).toBe(2) // CLOSED

      consoleLogSpy.mockRestore()
      disconnect()
    })

    it('should handle error events when shouldClose is true', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      // Trigger terminal status to set shouldClose
      mockEventSource.simulateMessage({ status: 'success', message: 'Done' })

      // Simulate error after terminal status
      mockEventSource.simulateError()

      expect(mockEventSource.readyState).toBe(2) // CLOSED
      disconnect()
    })

    it('should log error for non-terminal error events', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      // Simulate error while connection is open
      mockEventSource.simulateError()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'SSE error',
        expect.any(Event)
      )

      consoleErrorSpy.mockRestore()
      disconnect()
    })

    it('should return disconnect function that closes connection', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      expect(mockEventSource.readyState).toBe(1) // OPEN

      disconnect()

      expect(mockEventSource.readyState).toBe(2) // CLOSED
    })

    it('should not close connection if already closed in disconnect function', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      // Close connection manually
      mockEventSource.close()

      // Disconnect should not throw error
      expect(() => disconnect()).not.toThrow()
    })

    it('should process non-terminal events normally', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent
      )

      const payload1 = { status: 'processing', message: 'Processing 1' }
      const payload2 = {
        status: 'processing_questions',
        message: 'Processing 2',
      }

      mockEventSource.simulateMessage(payload1)
      mockEventSource.simulateMessage(payload2)

      expect(mockOnEvent).toHaveBeenCalledTimes(2)
      expect(mockOnEvent).toHaveBeenNthCalledWith(1, payload1)
      expect(mockOnEvent).toHaveBeenNthCalledWith(2, payload2)

      disconnect()
    })

    it('should encode email in URL correctly', () => {
      const disconnect = documentExtractionStatus.connectSSE(
        'sub123',
        mockOnEvent,
        {
          email: 'user+test@example.com',
        }
      )

      expect(mockEventSource.url).toContain('email=user%2Btest%40example.com')

      disconnect()
    })
  })
})
