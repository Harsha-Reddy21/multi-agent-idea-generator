import {
  LdsButton,
  LdsImage,
  LdsLoadingSpinner,
} from '@elilillyco/ux-lds-react'
import React, { useState } from 'react'

import SuccessTick from '../../../assets/success_tick.svg'
import XCircleFilled from '../../../assets/XCircleFilled.svg'
import { useAIFeatures } from '../../../contexts/AIFeaturesContext'
import { suggestionsApiService } from '../../../core/api/suggestions.api'
import { EXTRACT_DATA_READ_MORE_LIMIT } from '../../../core/constants'
import {
  SuggestionCoverageResponseBody,
  SuggestionsResponse,
} from '../../../core/models/suggestion.model'
import { isGibberish } from '../../../core/utils/text-validation.util'
import styles from './SuggestionsCheckCoverage.module.scss'

export interface SuggestionsCheckCoverageProps {
  questionText?: string
  questionId?: string
  inputValue?: string
  submissionId?: string
  suggestionsData?: SuggestionsResponse | null
  loading?: boolean
  error?: string | null
  onInteractionIdUpdate: (interactionId: string | null) => void
}

/**
 * SuggestionsCheckCoverage - Displays AI suggestions and check coverage functionality
 */
export const SuggestionsCheckCoverage: React.FC<
  SuggestionsCheckCoverageProps
> = ({
  questionId,
  inputValue = '',
  suggestionsData = null,
  submissionId,
  loading = false,
  error = null,
  onInteractionIdUpdate,
}) => {
  const aiFeatures = useAIFeatures()
  const [checkingCoverage, setCheckingCoverage] = useState(false)
  const [allSuggestions, setAllSuggestions] = useState<
    Array<{
      questionId: string
      suggestion: string
      state_val: number
      rationale?: string
    }>
  >([])
  const [allSuggestionsCovered, setAllSuggestionsCovered] = useState(false)
  const [lastCheckedValue, setLastCheckedValue] = useState('')
  const [expandedRationales, setExpandedRationales] = useState<Set<string>>(
    new Set()
  )

  // Reset state only when input value changes after a check
  React.useEffect(() => {
    if (inputValue !== lastCheckedValue) {
      setAllSuggestionsCovered(false)
    }
  }, [inputValue, lastCheckedValue])

  // Initialize suggestions when suggestionsData changes
  React.useEffect(() => {
    const filteredData = questionId
      ? suggestionsData?.data.filter(item => item.question_id === questionId)
      : suggestionsData?.data

    const suggestions =
      filteredData?.flatMap(item =>
        item.suggestions.map(suggestion => ({
          questionId: item.question_id,
          suggestion,
          state_val: 0,
          rationale: undefined,
        }))
      ) || []

    setAllSuggestions(suggestions)
    setAllSuggestionsCovered(false)
    setCheckingCoverage(false)
    setExpandedRationales(new Set())
  }, [suggestionsData, questionId])

  const handleCheckCoverage = async () => {
    if (
      !questionId ||
      !inputValue ||
      inputValue.trim() === '' ||
      !submissionId
    ) {
      return
    }

    try {
      setCheckingCoverage(true)

      const response = await suggestionsApiService.checkSuggestionsCoverage({
        question_id: questionId,
        submission_id: submissionId,
        user_text: inputValue,
      })

      onInteractionIdUpdate(response.interaction_id)

      // Convert response to object array with state_val
      const requiredSuggestionsArray = response.required_suggestions.map(
        item => ({
          questionId: questionId,
          suggestion: item.text,
          rationale: item.rationale,
          state_val: 2,
        })
      )

      const completedSuggestionsArray = response.completed_suggestions.map(
        item => ({
          questionId: questionId,
          suggestion: item.text,
          rationale: item.rationale,
          state_val: 1,
        })
      )

      // Combine all suggestions with updated state_val
      const updatedSuggestions = [
        ...requiredSuggestionsArray,
        ...completedSuggestionsArray,
      ]
      setAllSuggestions(updatedSuggestions)

      // Check if all suggestions are covered (no required suggestions)
      const allCovered = response.required_suggestions.length === 0
      setAllSuggestionsCovered(allCovered)
      setLastCheckedValue(inputValue)

      assessAndStoreScore(response, questionId)
    } catch (error) {
      console.error('Error checking coverage:', error)
      // TODO: Show error message to user
    } finally {
      setCheckingCoverage(false)
    }
  }

  const assessAndStoreScore = (
    response: SuggestionCoverageResponseBody,
    questionId: string
  ) => {
    // TODO: TEMPORARY - This scoring logic is temporary until proper BE support is added
    // Currently calculating: completedCount / totalCount
    const completedCount = response.completed_suggestions.length
    const totalCount = response.required_suggestions.length + completedCount
    const score = totalCount > 0 ? completedCount / totalCount : 0
    const roundedScore = Math.round(score * 100) / 100
    // Avoid sending 0 score - use 0.01 as minimum
    const finalScore = roundedScore === 0 ? 0.01 : roundedScore

    // Store the score in context
    aiFeatures.updateCoverageScore(questionId, finalScore)

    console.warn('✅ Coverage Score Stored:', {
      questionId,
      completedCount,
      totalCount,
      score: finalScore,
      percentage: `${(finalScore * 100).toFixed(1)}%`,
    })
  }

  const toggleRationale = (key: string) => {
    setExpandedRationales(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Loading suggestions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.suggestions}>
        <h4 className={styles.suggestionsTitle}>
          Suggestions highlight the top recommendations, empowering you to
          choose with confidence.
        </h4>
        <h4 className={styles.suggestionsTitle}>
          Check Coverage scans your input for missing details to ensure all
          responses are fully addressed.
        </h4>

        {allSuggestions.map(item => {
          const key = `${item.questionId}-${item.suggestion}`
          const hasRationale = item.rationale && item.rationale.trim() !== ''
          const isExpanded = expandedRationales.has(key)
          const shouldTruncate =
            hasRationale &&
            item.rationale!.length > EXTRACT_DATA_READ_MORE_LIMIT

          return (
            <div key={key} className={styles.suggestionItem}>
              <label className={styles.radioLabel}>
                {item.state_val === 2 && (
                  <LdsImage
                    src={XCircleFilled}
                    alt="done"
                    className={styles.statusIcon_cross}
                  />
                )}
                {item.state_val === 1 && (
                  <LdsImage
                    src={SuccessTick}
                    alt=""
                    className={styles.statusIcon_success}
                  />
                )}
                {item.state_val === 0 && (
                  <span className={styles.radioCustom}></span>
                )}
                <div>
                  <span className={styles.suggestionText}>
                    {item.suggestion}
                  </span>
                  {item.state_val === 1 && hasRationale && (
                    <div className={styles.rationaleText}>
                      Suggestion has been incorporated
                    </div>
                  )}
                  {item.state_val === 2 && hasRationale && (
                    <div className={styles.rationaleText}>
                      {shouldTruncate && !isExpanded
                        ? `${item.rationale!.substring(0, EXTRACT_DATA_READ_MORE_LIMIT)}... `
                        : item.rationale}
                      {shouldTruncate && (
                        <LdsButton
                          className={styles.readMoreButton}
                          onClick={() => toggleRationale(key)}
                        >
                          {isExpanded ? 'Read Less' : 'Read More'}
                        </LdsButton>
                      )}
                    </div>
                  )}
                </div>
              </label>
            </div>
          )
        })}
      </div>

      <div className={styles.checkCoverage}>
        <LdsButton
          className={styles.checkButton}
          onClick={handleCheckCoverage}
          disabled={
            !inputValue ||
            inputValue.trim() === '' ||
            isGibberish(inputValue.trim()) ||
            checkingCoverage ||
            allSuggestionsCovered
          }
        >
          <span className={styles.buttonContent}>
            {checkingCoverage && (
              <LdsLoadingSpinner
                className="primary"
                ariaLabel="Checking coverage"
                svgTitle="Checking coverage"
              />
            )}
            <span>{checkingCoverage ? 'Checking...' : 'Check Coverage'}</span>
          </span>
        </LdsButton>
        {allSuggestionsCovered && (
          <span className={styles.checkText}>
            All the suggestions are covered in the input field!
          </span>
        )}
        {!allSuggestionsCovered &&
          (!inputValue ||
            inputValue.trim() === '' ||
            isGibberish(inputValue.trim())) && (
            <span className={styles.checkText}>
              Please enter valid content to enable Check Coverage
            </span>
          )}
      </div>
    </div>
  )
}

export default SuggestionsCheckCoverage
