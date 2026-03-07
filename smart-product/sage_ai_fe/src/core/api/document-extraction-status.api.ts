// import { SubmissionStatusResponse } from '../models/dashboard.model'
import { BaseApiService } from './base.api'

class DocumentExtractionStatusApi extends BaseApiService {
  constructor() {
    super('progress')
  }

  connectSSE(
    submissionId: string,
    onEvent: (event: {
      status?: string
      message?: string
      [key: string]: any
    }) => void,
    opts?: { email?: string; withCredentials?: boolean }
  ): () => void {
    const base = this.api.defaults.baseURL || ''
    // Read email from axios instance headers (same as other endpoints)
    // EventSource doesn't support custom headers, so we pass it as query param
    // Headers are set in BaseApiService constructor at this.api.defaults.headers
    const headers = this.api.defaults.headers || {}
    const emailFromHeaders =
      (headers['X-WEBAUTH-EMAIL'] as string) ||
      (headers.common?.['X-WEBAUTH-EMAIL'] as string) ||
      ''
    const email = opts?.email || emailFromHeaders || ''

    const url = `${base}/stream/${submissionId}?email=${encodeURIComponent(email)}`

    const eventSource = new EventSource(url, {
      withCredentials: opts?.withCredentials ?? false,
    })

    // Track if connection should be closed (terminal states)
    let shouldClose = false
    let isClosed = false

    eventSource.onmessage = (evt: MessageEvent) => {
      // Ignore messages if connection is already closed or should be closed
      if (
        isClosed ||
        shouldClose ||
        eventSource.readyState === EventSource.CLOSED
      ) {
        return
      }

      try {
        const payload = JSON.parse(evt.data)

        // Check if this is a terminal status that should close the connection
        const status = payload.status
        const isTerminalStatus =
          status === 'success' || status === 'failed' || status === 'completed'

        if (isTerminalStatus) {
          // Mark as should close first
          shouldClose = true
          // Process the event so context can handle terminal state
          onEvent(payload)
          // Then immediately close the connection to prevent further events
          isClosed = true
          eventSource.close()
          return
        }

        // Process non-terminal events normally
        onEvent(payload)
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = err => {
      // EventSource.CONNECTING = 0, EventSource.OPEN = 1, EventSource.CLOSED = 2
      if (eventSource.readyState === EventSource.CLOSED) {
        // Connection is closed, don't try to reconnect
        isClosed = true
        shouldClose = true
        console.log('SSE connection closed')
      } else if (shouldClose || isClosed) {
        // If we're in a terminal state or already closed, close the connection
        isClosed = true
        eventSource.close()
      } else {
        // Only log errors if we're not in a terminal state
        console.error('SSE error', err)
      }
    }

    // Return disconnect function that properly closes the connection
    return () => {
      shouldClose = true
      isClosed = true
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close()
      }
    }
  }
}

export const documentExtractionStatus = new DocumentExtractionStatusApi()
