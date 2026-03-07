import React from 'react'

import { useExtractionStatus } from '../../contexts/ExtractionStatusContext'
import { ExtractionStatus } from '../../core/models/extraction-status.model'
import styles from './ExtractionStatusBanner.module.scss'

export const getMessage = (
  message: string,
  status: ExtractionStatus,
  bannerMessage: boolean = true
) => {
  // If we have a custom message from the context (e.g., from backend or error handling), use it
  if (message) {
    // Parse the message to add bold tags if needed
    if (
      status === ExtractionStatus.Completed ||
      status === ExtractionStatus.Success
    ) {
      if (message.includes('No documents provided')) {
        return message
      }
      return (
        <>
          <strong>Data extraction is complete</strong> you can access the AI
          feature in all the forms
        </>
      )
    }
    if (status === ExtractionStatus.Failed) {
      if (message.includes('Cortex')) {
        return message
      }

      // Check if it's a server error or actual extraction failure
      if (message.includes('Server temporarily unavailable')) {
        return 'Cortex is not responding. Please try again later.'
        // return message // Server error message (no bold)
      }
      // If we have a specific error message from backend, show it
      if (
        message &&
        message.trim() &&
        !message.includes('Failed to extract data')
      ) {
        return (
          <>
            <strong>Extraction failed:</strong> {message}
          </>
        )
      }
      // Default extraction failure message
      return (
        <>
          <strong>Failed to extract data!</strong> Please reupload the documents
        </>
      )
    }
    // For processing/pending states - show hardcoded message only if message is generic
    if (
      status === ExtractionStatus.Processing ||
      status === ExtractionStatus.Pending ||
      status === ExtractionStatus.ExtractingBlocks ||
      status === ExtractionStatus.BlocksExtracted ||
      status === ExtractionStatus.FetchingQuestions ||
      status === ExtractionStatus.QuestionsFetched ||
      status === ExtractionStatus.ProcessingQuestions
    ) {
      return (
        <>
          <strong>{message}</strong>
          {bannerMessage && (
            <p>
              {' '}
              but you're free to continue submitting your form with initial AI
              suggestions.
            </p>
          )}
        </>
      )
    }
    // For all other statuses (like ProcessingQuestions, ExtractingBlocks, etc.),
    // display the actual message from the backend
    return message
  }

  // Fallback messages if no custom message
  switch (status) {
    case ExtractionStatus.Failed:
      return (
        <>
          <strong>Failed to extract data!</strong> Please reupload the documents
        </>
      )
    case ExtractionStatus.Processing:
    case ExtractionStatus.Pending:
      return (
        <>
          Data extraction is running in the background. Meanwhile you can
          continue form filling using basic AI Suggestions
        </>
      )
    case ExtractionStatus.Completed:
      return (
        <>
          <strong>Data extraction is complete</strong> you can access the AI
          feature in all the forms
        </>
      )
    default:
      return (
        <>
          Document extraction is still in progress and is taking longer than
          usual. We'll notify you once it's complete.
        </>
      )
  }
}

export const ExtractionStatusBanner: React.FC = () => {
  const {
    extractionStatus,
    extractionMessage,
    dismissBanner,
    isDismissed,
    progress,
    submissionId,
    startSSE,
    stopSSE,
  } = useExtractionStatus()

  // Don't render if dismissed
  if (isDismissed) return null

  // Don't render if no status yet
  if (!extractionStatus) return null

  const isFailed = extractionStatus === ExtractionStatus.Failed

  const handleRetry = () => {
    if (submissionId) {
      // Stop any existing SSE connection and reset state
      stopSSE()
      // Restart extraction with the same submissionId
      startSSE(submissionId)
    }
  }

  const getStatusClass = () => {
    switch (extractionStatus) {
      case ExtractionStatus.Processing:
      case ExtractionStatus.Pending:
      case ExtractionStatus.Failed:
        return styles.bannerPink
      case ExtractionStatus.Completed:
      case ExtractionStatus.Success:
        return styles.bannerGreen
      default:
        return ''
    }
  }

  return (
    <div
      className={`${styles.extractionBanner} ${getStatusClass()}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={styles.bannerMessage}>
        {getMessage(extractionMessage, extractionStatus)}
      </div>
      {isFailed ? (
        <button
          className={styles.retryButton}
          onClick={handleRetry}
          aria-label="Retry extraction"
          title="Retry"
        >
          Retry
        </button>
      ) : (
        <button
          className={styles.hideButton}
          onClick={dismissBanner}
          aria-label="Hide notification"
          title="Hide"
        >
          Hide
        </button>
      )}
      {!isFailed && (
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBarIndicator}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Extraction progress: ${Math.round(progress)}%`}
          ></div>
        </div>
      )}
    </div>
  )
}

export default ExtractionStatusBanner
