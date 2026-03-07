import { LdsButton, LdsDivider, LdsImage } from '@elilillyco/ux-lds-react'
import React, { useEffect, useState } from 'react'

import enhanceGreen from '../../assets/enhance_green.svg'
import iconRight from '../../assets/Icon Right.svg'
import {
  enhanceAnswerApi,
  EnhanceAnswerResponse,
} from '../../core/api/enhance-answer.api'
import {
  EnhanceAnswerCardProps,
  FetchStatus,
} from '../../core/models/enhance-answer-card.model'
import styles from './EnhanceAnswerCard.module.scss'

/**
 * EnhanceAnswerCard - Displays enhanced answer with options to use, regenerate, or keep original
 */
// Exported for unit testing
export const renderRationaleList = (text: string) => {
  if (!text) return null
  const parts = text
    .split(';')
    .map(p => p.trim())
    .filter(Boolean)
  const labels = ['content_added:', 'checklist_gaps_filled:']
  const cleaned = parts.map(p => {
    const lower = p.toLowerCase()
    for (const label of labels) {
      if (lower.startsWith(label)) return p.slice(label.length).trim()
    }
    return p
  })
  while (cleaned.length < 2) cleaned.push('')
  return (
    <ul className={styles.rationaleList} data-testid="rationale-list">
      {cleaned.slice(0, 2).map((cleanedRationale, i) => (
        <li key={i}>{cleanedRationale}</li>
      ))}
    </ul>
  )
}

export const EnhanceAnswerCard: React.FC<EnhanceAnswerCardProps> = ({
  userInput,
  questionId,
  submissionId,
  isVisible,
  onUseThis,
  onKeepOriginal,
  onClose,
}) => {
  const [isUsed, setIsUsed] = useState(false)
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle')
  const [enhancedAnswer, setEnhancedAnswer] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [originalText, setOriginalText] = useState<string>('')
  const [rationale, setRationale] = useState<string>('')

  // rationale now rendered via exported helper for testing

  const isLoading = fetchStatus === 'loading'
  const isError = fetchStatus === 'error'
  const isSuccess = fetchStatus === 'success'

  // Call API on mount and when regenerate is triggered
  const callEnhanceAPI = () => {
    setFetchStatus('loading')
    setErrorMessage(undefined)
    setEnhancedAnswer('')
    setIsUsed(false)
    setOriginalText(userInput) // Capture the current input text at the time of API call

    enhanceAnswerApi
      .enhanceAnswer(userInput, questionId, submissionId)
      .then((response: EnhanceAnswerResponse) => {
        const reviewedText =
          typeof response.reviewed_text === 'string'
            ? response.reviewed_text
            : JSON.stringify(response.reviewed_text)
        const rationale =
          typeof response.rationale === 'string'
            ? response.rationale
            : JSON.stringify(response.rationale)
        setRationale(rationale)

        const suggestion = reviewedText?.trim()

        if (suggestion) {
          setEnhancedAnswer(suggestion)
        } else {
          setEnhancedAnswer('')
        }
        setFetchStatus('success')
      })
      .catch((error: Error) => {
        console.error('Error during Enhance Answer:', error)
        setErrorMessage(
          'Cortex is not responding.\nWe are unable to analyze your answer at the moment. Please try again later.'
        )
        setFetchStatus('error')
      })
  }

  // Call API only when card becomes visible for the first time or when explicitly requested
  useEffect(() => {
    if (isVisible && fetchStatus === 'idle') {
      setIsUsed(false)
      callEnhanceAPI()
    }
  }, [isVisible])

  // Reset state when card is hidden
  useEffect(() => {
    if (!isVisible) {
      setFetchStatus('idle')
      setEnhancedAnswer('')
      setErrorMessage(undefined)
      setIsUsed(false)
    }
  }, [isVisible])

  const handleRegenerate = () => {
    callEnhanceAPI()
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div
          className={styles.loadingState}
          data-testid="enhance-answer-loading"
        >
          <div className={styles.spinner} aria-label="Loading" />
          <p className={styles.loadingText}>Generating enhanced answer…</p>
        </div>
      )
    }

    if (isError) {
      return (
        <div
          className={styles.errorState}
          role="alert"
          data-testid="enhance-answer-error"
        >
          <p className={styles.errorMessage}>
            {errorMessage || 'Error generating enhanced answer'}
          </p>
        </div>
      )
    }

    if (isSuccess && enhancedAnswer) {
      return (
        <div
          className={styles.answerContent}
          data-testid="enhance-answer-content"
        >
          <div className={styles.answerHeader}>
            <img src={enhanceGreen} alt="AI" className={styles.aiIcon} />
            <h4 className={styles.answerTitle}>Enhanced Answer</h4>
          </div>
          <div className={styles.answerText}>
            <p>{enhancedAnswer}</p>
          </div>
          {rationale && (
            <>
              <LdsDivider className={styles.divider} />
              <div className={styles.answerHeader}>
                <img src={enhanceGreen} alt="AI" className={styles.aiIcon} />
                <h4 className={styles.answerTitle}>AI Rationale</h4>
              </div>
              <div className={styles.answerText}>
                {renderRationaleList(rationale)}
              </div>
            </>
          )}

          <div className={styles.actionButtons}>
            {!isUsed ? (
              <LdsButton
                onClick={() => {
                  setIsUsed(true)
                  onUseThis?.(enhancedAnswer)
                }}
                classes="primary compact"
                className={styles.useButton}
                data-testid="use-this-button"
              >
                Use Answer
              </LdsButton>
            ) : (
              <LdsButton
                disabled
                classes="outlined compact"
                className={styles.usedButton}
                data-testid="used-text-button"
              >
                Used Answer
                <LdsImage
                  src={iconRight}
                  alt="Used Answer"
                  className={styles.usedButtonIcon}
                />
              </LdsButton>
            )}
            <LdsButton
              onClick={handleRegenerate}
              classes="outlined compact"
              className={styles.regenerateButton}
              data-testid="regenerate-button"
            >
              Regenerate Answer
            </LdsButton>
            <LdsButton
              onClick={() => {
                setIsUsed(false)
                onKeepOriginal?.(originalText)
              }}
              classes="outlined compact"
              className={styles.keepButton}
              data-testid="keep-original-button"
            >
              Keep Original
            </LdsButton>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <section
      className={[
        styles.enhanceAnswerCard,
        styles[`status_${fetchStatus}`],
        isVisible ? styles.cardVisible : styles.cardHidden,
      ].join(' ')}
      data-testid="enhance-answer-card"
      aria-busy={isLoading || undefined}
    >
      {onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close enhance answer panel"
          data-testid="close-enhance-panel-button"
        >
          ×
        </button>
      )}
      {renderContent()}
    </section>
  )
}

export default EnhanceAnswerCard
