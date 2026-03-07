import { LdsButton, LdsImage } from '@elilillyco/ux-lds-react'
import React, { useEffect, useState } from 'react'

import SuccessTick from '../../assets/success_tick.svg'
import WarningCircleFilled from '../../assets/WarningCircleFilled.svg'
import { suggestionsApiService } from '../../core/api/suggestions.api'
import { CheckCoverageProps } from '../../core/models/ai-features-card.model'
import { SuggestionCoverageResponseBody } from '../../core/models/suggestion.model'
import { UserFeedback } from '../UserFeedback/UserFeedback'
import styles from './CheckCoverage.module.scss'

export const CheckCoverage: React.FC<CheckCoverageProps> = ({
  questionId,
  submissionId,
  userText,
  onLoadComplete,
  formId,
  hideSuggestionsAndFeedback = false,
  isRadioSelected = false,
  resetCoverage = false,
  onCheckCoverageClick,
  clearCoverageData = false,
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [coverageData, setCoverageData] =
    useState<SuggestionCoverageResponseBody | null>(null)
  const [shouldFetchCoverage, setShouldFetchCoverage] = useState<boolean>(false)
  const [isCoverageChecked, setIsCoverageChecked] = useState<boolean>(false)
  const [lastCheckedText, setLastCheckedText] = useState<string>('')
  const [coverageInteractionId, setCoverageInteractionId] = useState<
    string | null
  >(null)

  // Reset coverage when resetCoverage prop changes
  useEffect(() => {
    if (resetCoverage) {
      setIsCoverageChecked(false)
    }
  }, [resetCoverage])

  // Clear coverage data when clearCoverageData prop changes
  useEffect(() => {
    if (clearCoverageData) {
      setCoverageData(null)
      setIsCoverageChecked(false)
      setCoverageInteractionId(null)
    }
  }, [clearCoverageData])

  const initialSuggestionsInfo = [
    {
      id: 1,
      text: 'Describe how this solution anticipates future trends',
    },
    {
      id: 2,
      text: 'Provide context about the business challenge or opportunity this solution addresses',
    },
    {
      id: 3,
      text: 'Summarize the key features',
    },
  ]

  // Reset coverage checked state when userText changes
  useEffect(() => {
    if (
      userText !== lastCheckedText &&
      isCoverageChecked &&
      lastCheckedText !== ''
    ) {
      setIsCoverageChecked(false)
      // Don't reset shouldFetchCoverage or coverageData - keep showing last results
    }
  }, [userText, lastCheckedText, isCoverageChecked])

  useEffect(() => {
    const fetchCoverage = async () => {
      if (!questionId || !submissionId || !userText) return

      try {
        setLoading(true)
        setError(null)
        const response = await suggestionsApiService.checkSuggestionsCoverage({
          question_id: questionId,
          submission_id: submissionId,
          user_text: userText,
        })
        setCoverageData(response)
        setCoverageInteractionId(response.interaction_id || null)
        setIsCoverageChecked(true)
        setLastCheckedText(userText)
      } catch (err) {
        console.error('Error fetching coverage:', err)
        setError('Failed to load coverage data. Please try again.')
      } finally {
        setLoading(false)
        if (onLoadComplete) onLoadComplete()
      }
    }

    fetchCoverage()
  }, [shouldFetchCoverage])

  return (
    <>
      <div className={styles.checkCoverageSection}>
        <LdsButton
          className={styles.checkCoverageButton}
          classes="primary outlined"
          disabled={
            loading ||
            !userText ||
            userText.trim() === '' ||
            isCoverageChecked ||
            (hideSuggestionsAndFeedback && !isRadioSelected)
          }
          onClick={() => {
            setShouldFetchCoverage(prev => !prev) // Toggle to trigger useEffect
            if (onCheckCoverageClick) onCheckCoverageClick()
          }}
        >
          Check coverage
        </LdsButton>
      </div>

      {loading && (
        <div className={styles.checkCoverageContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading coverage analysis...</p>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.checkCoverageContainer}>
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && !coverageData && !hideSuggestionsAndFeedback && (
        <>
          <h3 className={styles.suggestionsTitle}>
            Answer writing suggestions
          </h3>
          <ul className={styles.initialSuggestionsList}>
            {initialSuggestionsInfo.map(suggestion => (
              <li key={suggestion.id} className={styles.initialSuggestionItem}>
                {suggestion.text}
              </li>
            ))}
          </ul>
        </>
      )}

      {!loading && !error && coverageData && (
        <div
          className={styles.checkCoverageContainer}
          id="check-coverage-results"
        >
          <div className={styles.coverageContent}>
            {/* Completed Suggestions */}
            {coverageData.completed_suggestions.length > 0 && (
              <div className={styles.suggestionsSection}>
                {coverageData.completed_suggestions.map((suggestion, index) => (
                  <div
                    key={`completed-${index}`}
                    className={styles.suggestionItem}
                  >
                    <div className={styles.suggestionIcon}>
                      <LdsImage
                        src={SuccessTick}
                        alt="success tick icon"
                        className={styles.statusIcon_success}
                      />
                    </div>
                    <div className={styles.suggestionContent}>
                      <p className={styles.suggestionText}>{suggestion.text}</p>
                      <p className={styles.suggestionRationale}>
                        {suggestion.rationale}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Required Suggestions */}
            {coverageData.required_suggestions.length > 0 && (
              <div className={styles.suggestionsSectionError}>
                {coverageData.required_suggestions.map((suggestion, index) => (
                  <React.Fragment key={`required-${index}`}>
                    <div
                      className={`${styles.suggestionItem} ${styles.suggestionItem_warning}`}
                    >
                      <div className={styles.suggestionIcon}>
                        <LdsImage
                          src={WarningCircleFilled}
                          alt="warning icon"
                          className={styles.statusIcon_warning}
                        />
                      </div>
                      <div
                        className={`${styles.suggestionContent} ${index === coverageData.required_suggestions.length - 1 ? styles.suggestionContentLast : ''}`}
                      >
                        <p className={styles.suggestionText}>
                          {suggestion.text}
                        </p>
                        <p className={styles.suggestionRationale}>
                          {suggestion.rationale}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Message when all suggestions are incorporated */}
            {coverageData.required_suggestions.length === 0 && (
              <p className={styles.allSuggestionsMessage}>
                All the suggestions are incorporated in the answer!
              </p>
            )}
          </div>
        </div>
      )}

      {!loading &&
        !error &&
        coverageData &&
        questionId &&
        submissionId &&
        formId &&
        !hideSuggestionsAndFeedback && (
          <>
            <div className={styles.feedbackDivider} />
            <UserFeedback
              label="Rate suggestion coverage:"
              submissionId={submissionId}
              questionId={questionId}
              formId={formId}
              userInput={userText}
              aiFeatureType="suggestions"
              interactionId={coverageInteractionId}
            />
          </>
        )}
    </>
  )
}

export default CheckCoverage
