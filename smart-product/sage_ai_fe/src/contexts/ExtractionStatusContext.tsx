import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { documentExtractionStatus } from '@/core/api/document-extraction-status.api'

import { dashboardApi } from '../core/api/dashboard.api'
import { MAX_ESTIMATED_TIME } from '../core/constants'
import { ExtractionStatus } from '../core/models/extraction-status.model'
import { useUser } from './UserContext'

interface ExtractionStatusContextType {
  isExtracting: boolean
  extractionStatus: ExtractionStatus | null
  extractionMessage: string
  submissionId: string | null
  progress: number
  startPolling: (submissionId: string) => void
  stopPolling: () => void
  dismissBanner: () => void
  isDismissed: boolean
  startSSE: (submissionId: string) => void
  stopSSE: () => void
}

const ExtractionStatusContext = createContext<
  ExtractionStatusContextType | undefined
>(undefined)

export const useExtractionStatus = () => {
  const context = useContext(ExtractionStatusContext)
  if (!context) {
    throw new Error(
      'useExtractionStatus must be used within ExtractionStatusProvider'
    )
  }
  return context
}

interface ExtractionStatusProviderProps {
  children: React.ReactNode
}

const POLL_INTERVAL = 3000 // Poll every 3 seconds
const TERMINAL_STATUSES: ExtractionStatus[] = [
  ExtractionStatus.Failed,
  ExtractionStatus.Success,
]

export const ExtractionStatusProvider: React.FC<
  ExtractionStatusProviderProps
> = ({ children }) => {
  const { user } = useUser()
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionStatus, setExtractionStatus] =
    useState<ExtractionStatus | null>(null)
  const [extractionMessage, setExtractionMessage] = useState('')
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [progress, setProgress] = useState(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousStatusRef = useRef<ExtractionStatus | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)
  // Track if we're in a terminal state to prevent processing further SSE events
  const isTerminalStateRef = useRef<boolean>(false)
  // Track current submission ID in ref to avoid dependency issues
  const currentSubmissionIdRef = useRef<string | null>(null)
  // Track active extraction state in ref to avoid dependency issues
  const isExtractingRef = useRef<boolean>(false)
  // Track active timeouts for cleanup
  const activeTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  // Track number of events received for progress calculation
  const eventCountRef = useRef<number>(0)
  // Total number of questions/events expected (14 events = 100% complete)
  const TOTAL_QUESTIONS = 14

  // Helper function to get status message based on extraction status
  const getStatusMessage = (
    status: string | ExtractionStatus | null
  ): string => {
    if (!status) return 'Processing...'

    const statusStr = String(status).toLowerCase()

    switch (statusStr) {
      case 'processing_questions':
        return 'Extracting Data fields'
      case 'extracting_blocks':
        return 'Extracting blocks'
      case 'storing_results':
        return 'Storing results'
      case 'fetching_questions':
        return 'Fetching questions'
      case 'questions_fetched':
        return 'Questions fetched'
      case 'blocks_extracted':
        return 'Blocks extracted'
      case 'question_processed':
        return 'Processing question'
      case 'processing':
        return 'Processing documents'
      case 'pending':
        return 'Preparing extraction'
      default:
        return 'Processing...'
    }
  }

  // new streaming services
  const disconnectRef = useRef<(() => void) | null>(null)

  const stopSSE = useCallback(() => {
    // Clear any legacy polling interval (kept for backward compatibility)
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    // Disconnect SSE
    if (disconnectRef.current) {
      try {
        disconnectRef.current()
      } catch (_) {}
      disconnectRef.current = null
    }
    // Clear all active timeouts ONLY if not in a terminal state
    // This preserves the auto-dismiss timeout for success/completion banners
    if (!isTerminalStateRef.current) {
      activeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      activeTimeoutsRef.current.clear()
    }

    setIsExtracting(false)
    isExtractingRef.current = false
    pollingStartTimeRef.current = null

    // Note: We preserve currentSubmissionIdRef and isTerminalStateRef when stopping
    // due to a terminal state, so we can prevent restarting SSE for the same submission.
    // These will be reset when starting a new extraction or manually stopping.
    // Reset event counter when stopping SSE
    eventCountRef.current = 0
  }, [])

  const startSSE = useCallback(
    async (currentSubmissionId: string) => {
      // If already streaming same submission and not in terminal state, ignore
      if (
        currentSubmissionIdRef.current === currentSubmissionId &&
        isExtractingRef.current &&
        !isTerminalStateRef.current
      ) {
        return
      }

      // If we're in a terminal state for this submission, don't restart
      if (
        currentSubmissionIdRef.current === currentSubmissionId &&
        isTerminalStateRef.current
      ) {
        return
      }

      // Stop any existing stream first
      stopSSE()

      // Reset refs for new extraction
      // (stopSSE preserves them if we were in a terminal state, so we reset them here)
      currentSubmissionIdRef.current = currentSubmissionId
      isExtractingRef.current = true
      isTerminalStateRef.current = false
      eventCountRef.current = 0

      // Update state
      setSubmissionId(currentSubmissionId)
      setIsExtracting(true)
      setIsDismissed(false)
      setProgress(0)
      previousStatusRef.current = null
      pollingStartTimeRef.current = Date.now()
      // Reset event counter for new extraction
      eventCountRef.current = 0
      // Initial state (optional): rely on first SSE event instead
      setExtractionStatus(ExtractionStatus.Pending)
      setExtractionMessage(
        `0/${TOTAL_QUESTIONS} ${getStatusMessage(ExtractionStatus.Pending)}`
      )

      // Establish simple SSE via API module
      disconnectRef.current = documentExtractionStatus.connectSSE(
        currentSubmissionId,
        payload => {
          // Ignore events if we're already in a terminal state
          // This prevents processing any events after success/failed
          if (isTerminalStateRef.current) {
            return
          }

          const statusString = payload.status as string
          // Try to map the status string to an ExtractionStatus enum value
          // This handles cases where the backend sends status strings that match enum values
          const newStatus = Object.values(ExtractionStatus).includes(
            statusString as ExtractionStatus
          )
            ? (statusString as ExtractionStatus)
            : (payload.status as ExtractionStatus) || null

          // Check for terminal status FIRST before processing anything else
          // This ensures we stop immediately and don't process any queued events
          const isSuccess =
            newStatus === ExtractionStatus.Success || statusString === 'success'
          const isFailed =
            newStatus === ExtractionStatus.Failed || statusString === 'failed'
          const isCompleted =
            newStatus === ExtractionStatus.Completed ||
            statusString === 'completed'

          if (isSuccess || isFailed || isCompleted) {
            // Set terminal state immediately to prevent any further processing
            isTerminalStateRef.current = true
            isExtractingRef.current = false

            if (isSuccess) {
              setProgress(100)
              setExtractionStatus(ExtractionStatus.Success)
              setExtractionMessage(
                payload.message ||
                  'Your forms have been populated successfully.'
              )
              setIsDismissed(false)
              const timeout = setTimeout(() => setIsDismissed(true), 5000)
              activeTimeoutsRef.current.add(timeout)
              previousStatusRef.current = ExtractionStatus.Success
            } else if (isFailed) {
              setProgress(0)
              setExtractionStatus(ExtractionStatus.Failed)
              setExtractionMessage(payload.message || 'Extraction failed')
              setIsDismissed(false)
              const timeout = setTimeout(() => setIsDismissed(true), 5000)
              activeTimeoutsRef.current.add(timeout)
              previousStatusRef.current = ExtractionStatus.Failed
            } else if (isCompleted) {
              // When completed, set progress to 100% (14 events received)
              setProgress(100)
              setExtractionStatus(ExtractionStatus.Completed)
              setExtractionMessage(payload.message || 'Extraction completed')
              setIsDismissed(false)
              const timeout = setTimeout(() => setIsDismissed(true), 5000)
              activeTimeoutsRef.current.add(timeout)
              previousStatusRef.current = ExtractionStatus.Completed
            }

            // Stop SSE immediately after handling terminal state
            stopSSE()
            return // Exit early - no further processing
          }

          // Only process non-terminal events
          // Count events and calculate progress based on event count
          // Each event represents one question processed, 14 events = 100%
          // Event count capped at TOTAL_QUESTIONS to avoid exceeding 100%
          if (
            eventCountRef.current < TOTAL_QUESTIONS &&
            (newStatus === ExtractionStatus.ProcessingQuestions ||
              statusString === 'processing_questions')
          ) {
            eventCountRef.current++
          }
          const calculatedProgress = Math.min(
            (eventCountRef.current / TOTAL_QUESTIONS) * 100,
            100
          )
          setProgress(calculatedProgress)

          // Format message as "{eventCount}/14 {statusMessage}"
          const statusMessage = getStatusMessage(newStatus || statusString)
          const formattedMessage = `${eventCountRef.current}/${TOTAL_QUESTIONS} ${statusMessage}`
          setExtractionMessage(formattedMessage)

          // Handle status updates for non-terminal statuses
          if (newStatus) {
            setExtractionStatus(newStatus)
            previousStatusRef.current = newStatus
          } else if (statusString) {
            // If status doesn't match enum, still try to set it (might be a new status)
            setExtractionStatus(statusString as ExtractionStatus)
          }
        },
        { email: user?.email }
      )
    },
    [stopSSE, user] // Depend on user object to ensure callback updates when user changes
  )

  // end new streaming services

  // Legacy polling services
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsExtracting(false)
    pollingStartTimeRef.current = null
  }, [])

  const pollSubmissionStatus = useCallback(
    async (currentSubmissionId: string) => {
      try {
        const response =
          await dashboardApi.getSubmissionStatus(currentSubmissionId)

        const previousStatus = previousStatusRef.current
        const newStatus = response.status

        setExtractionStatus(newStatus)
        setExtractionMessage(response.message)

        // Calculate progress based on time elapsed
        if (pollingStartTimeRef.current) {
          const elapsed = Date.now() - pollingStartTimeRef.current
          let calculatedProgress = Math.min(
            (elapsed / MAX_ESTIMATED_TIME) * 100,
            95
          ) // Cap at 95% until completed

          if (newStatus === ExtractionStatus.Completed) {
            calculatedProgress = 100
          } else if (newStatus === ExtractionStatus.Failed) {
            // Keep current progress or reset to 0
            calculatedProgress = 0
          }

          setProgress(calculatedProgress)
        }

        // If status changed to terminal (completed/failed), show banner even if dismissed
        if (
          TERMINAL_STATUSES.includes(newStatus) &&
          previousStatus !== newStatus &&
          (previousStatus === ExtractionStatus.Processing ||
            previousStatus === ExtractionStatus.Pending)
        ) {
          setIsDismissed(false) // Re-show banner for terminal status
        }

        // Update the previous status
        previousStatusRef.current = newStatus

        // Stop polling if we reach a terminal status
        if (TERMINAL_STATUSES.includes(newStatus)) {
          stopPolling()
          // Auto-dismiss message after 5 seconds
          setTimeout(() => {
            setIsDismissed(true)
          }, 5000)
        }
      } catch (error: any) {
        console.error(
          '[ExtractionStatus] Error polling submission status:',
          error
        )

        // Check if it's a server/network error (400, 401, 404, 422, 500, etc.)
        const status = error?.status
        if (status && status >= 400) {
          stopPolling()
          // Show server error banner (not actual extraction failure)
          setExtractionStatus(ExtractionStatus.Failed)
          setExtractionMessage(
            'Server temporarily unavailable. Please try again shortly.'
          )
          setProgress(0) // Reset progress on error
          setIsDismissed(false) // Re-show banner for error
          // Auto-dismiss error message after 5 seconds
          setTimeout(() => {
            setIsDismissed(true)
          }, 5000)
        }
      }
    },
    [stopPolling]
  )

  const startPolling = useCallback(
    (newSubmissionId: string) => {
      // Stop any existing polling
      stopPolling()

      setSubmissionId(newSubmissionId)
      setIsExtracting(true)
      setIsDismissed(false)
      setProgress(0)
      // setExtractionStatus('pending')
      // setExtractionMessage('Preparing document extraction...')
      previousStatusRef.current = null
      pollingStartTimeRef.current = Date.now()

      // Start polling immediately
      pollSubmissionStatus(newSubmissionId)

      // Set up interval for subsequent polls
      pollingIntervalRef.current = setInterval(() => {
        pollSubmissionStatus(newSubmissionId)
      }, POLL_INTERVAL)
    },
    [pollSubmissionStatus, stopPolling]
  )
  // End legacy polling services

  const dismissBanner = useCallback(() => {
    setIsDismissed(true)
    // If extraction is still in progress, continue polling in background
    // but just hide the banner
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
      stopSSE()
      // Clear all timeouts on unmount to prevent memory leaks
      activeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      activeTimeoutsRef.current.clear()
    }
  }, [stopPolling, stopSSE])

  // Memoize context value to prevent unnecessary re-renders
  const value: ExtractionStatusContextType = useMemo(
    () => ({
      isExtracting,
      extractionStatus,
      extractionMessage,
      submissionId,
      progress,
      startPolling,
      stopPolling,
      dismissBanner,
      isDismissed,
      startSSE,
      stopSSE,
    }),
    [
      isExtracting,
      extractionStatus,
      extractionMessage,
      submissionId,
      progress,
      startPolling,
      stopPolling,
      dismissBanner,
      isDismissed,
      startSSE,
      stopSSE,
    ]
  )

  return (
    <ExtractionStatusContext.Provider value={value}>
      {children}
    </ExtractionStatusContext.Provider>
  )
}
