import {
  LdsButton,
  LdsImage,
  LdsLoadingSpinner,
  LdsRadio,
} from '@elilillyco/ux-lds-react'
import React, { useEffect, useRef, useState } from 'react'

import { INFO_TOUR_MESSAGES, MIN_ENHANCE_TEXT_LENGTH } from '@/core/constants'
import { isGibberish } from '@/core/utils/text-validation.util'
import {
  isTourCompleted,
  markTourCompleted,
} from '@/core/utils/tour-state.util'
import { useEnhanceAnswer } from '@/hooks/useEnhanceAnswer'

import redStarIcon from '../../assets/ai_suggestion_Icon.svg'
import regenerateIcon from '../../assets/restart.svg'
import warningErrorIcon from '../../assets/Error_States.svg'
import InfoTourModal from '../InfoTourModal/InfoTourModal'
import { UserFeedback } from '../UserFeedback/UserFeedback'
import CheckCoverage from './CheckCoverage'
import styles from './RefineAnswerScreen.module.scss'
import type { useAiInteraction } from '@/hooks/useAiInteraction'
export interface Provenance {
  file_name: string
}

export interface RefineAnswerScreenProps {
  questionText?: string
  summaryText: string
  setSummaryText: (v: string) => void
  isEditingSummary: boolean
  setIsEditingSummary: (v: boolean) => void
  provenanceList?: Provenance[]
  onExtractClick?: (text: string) => void
  questionId: string | undefined
  submissionId: string | undefined
  inputValue: string | undefined
  formId?: string | undefined
  formData?: Record<string, unknown>
  currentInteractionId?: string | null
  onEnhanceError?: (errorMessage: string) => void
  onSelectionChange?: (selected: boolean) => void
  onAnswerSelect?: (answer: string) => void
  aiInteractions?: ReturnType<typeof useAiInteraction>
}

const RefineAnswerScreen: React.FC<RefineAnswerScreenProps> = ({
  questionText,
  summaryText,
  setSummaryText,
  questionId,
  submissionId,
  formId,
  currentInteractionId,
  onEnhanceError,
  onAnswerSelect,
  aiInteractions,
}) => {
  // Track whether to reveal enhance answer UI; we won't render the card
  const [enhanceAnswerResponse, setEnhanceAnswerResponse] =
    useState<boolean>(false)
  const [enhanceAnswerClicked, setEnhanceAnswerClicked] = useState(false)
  const [checkCoverageClicked, setCheckCoverageClicked] = useState(false)
  const [selectedOption, setSelectedOption] = React.useState<string>('')
  const [optionOneText, setOptionOneText] = React.useState<string>(summaryText)
  const [showRationale, setShowRationale] = useState<boolean>(false)
  const hasShownErrorToast = useRef<boolean>(false)
  const initialPayload = {
    question: questionText || '',
    userInput: summaryText,
    questionId: questionId || '',
    submissionId: submissionId || '',
    formId: formId || '',
    autoRun: false,
  }

  const [showEnhanceInfoModal, setShowEnhanceInfoModal] = useState<boolean>(
    !isTourCompleted('enhance_answer')
  )
  const [showCheckCoverageModal, setShowCheckCoverageModal] =
    useState<boolean>(false)
  const enhanceButtonRef = useRef<HTMLButtonElement>(null)
  const checkCoverageRef = useRef<HTMLDivElement>(null)
  // Handle Enhance Answer modal close
  const handleEnhanceModalClose = (isNext: boolean) => {
    setShowEnhanceInfoModal(false)
    markTourCompleted('enhance_answer')
    // Only show the Check Coverage modal if user clicked "Next" (not "Skip") and tour not completed
    if (isNext && !isTourCompleted('check_coverage')) {
      setShowCheckCoverageModal(true)
    }
  }
  // Handle Check Coverage modal close (both skip and next act as skip for now)
  const handleCheckCoverageModalClose = (_isNext: boolean) => {
    setShowCheckCoverageModal(false)
    markTourCompleted('check_coverage')
  }
  const enhanceAnswer = useEnhanceAnswer(initialPayload)
  const [optionTwoText, setOptionTwoText] = React.useState<string>(
    enhanceAnswer.enhancedAnswer
  )

  useEffect(() => {
    setOptionTwoText(enhanceAnswer.enhancedAnswer)
  }, [enhanceAnswer.enhancedAnswer])

  // Show error toast only once when error occurs
  useEffect(() => {
    if (enhanceAnswer.error && !hasShownErrorToast.current && onEnhanceError) {
      onEnhanceError("We can't fetch an enhanced answer at the moment.")
      hasShownErrorToast.current = true
    }
    // Reset the flag when error is cleared
    if (!enhanceAnswer.error) {
      hasShownErrorToast.current = false
    }
  }, [enhanceAnswer.error, onEnhanceError])
  // Use the stable setInteraction callback to avoid effect loops
  const { setInteraction: setAiInteraction } = aiInteractions ?? {}

  useEffect(() => {
    let currentAnswer = ''
    let isSelected = false

    if (selectedOption === 'optionOne' && optionOneText.trim() !== '') {
      currentAnswer = optionOneText
      isSelected = true
    } else if (selectedOption === 'option3' && optionTwoText.trim() !== '') {
      currentAnswer = optionTwoText
      isSelected = true
    }
    if (setAiInteraction && enhanceAnswer.interactionId) {
      setAiInteraction(
        enhanceAnswer.interactionId,
        selectedOption === 'option3'
      )
    }

    // Update parent with selected answer text
    if (onAnswerSelect && isSelected) {
      onAnswerSelect(currentAnswer)
    }
  }, [
    setAiInteraction,
    enhanceAnswer.interactionId,
    selectedOption,
    optionOneText,
    optionTwoText,
    onAnswerSelect,
  ])

  const prepareRationaleItems = (rationale: unknown): string[] => {
    const labels = ['content_added:', 'checklist_gaps_filled:']

    // Returns label-stripped content if text starts with an allowed label; otherwise null.
    const extractLabeledContent = (text: string): string | null => {
      const trimmed = text.trim()
      const lower = trimmed.toLowerCase()
      for (const label of labels) {
        if (lower.startsWith(label)) {
          // Strip the exact label length and trim the remainder
          return trimmed.slice(label.length).trim()
        }
      }
      // Not a labeled item; exclude from list per spec
      return null
    }

    // Case: Array input from API (e.g., ["content_added: ...", "checklist_gaps_filled: ..."])
    if (Array.isArray(rationale)) {
      return rationale
        .map(item => extractLabeledContent(String(item)))
        .filter((v): v is string => Boolean(v))
    }

    // Case: String input; split on ';' to create items, then process
    if (typeof rationale === 'string') {
      return rationale
        .split(';')
        .map(part => extractLabeledContent(part))
        .filter((v): v is string => Boolean(v))
    }

    // Fallback: nothing to render
    return []
  }
  return (
    <div
      className={styles.refineAnswerScreen}
      data-testid="refine-answer-screen"
    >
      <div className={styles.overview}>
        <div className={styles.overviewContent}>
          <p className={styles.overviewLabel} id="selected_question_label_1">
            {questionText || 'Provide an overview of the solution'}
          </p>
          {!enhanceAnswerClicked && (
            <LdsButton
              ref={enhanceButtonRef}
              className={styles.enhanceAnswerButton}
              classes="primary outlined compact"
              disabled={
                !summaryText ||
                summaryText.trim().length < MIN_ENHANCE_TEXT_LENGTH ||
                isGibberish(summaryText)
              }
              onClick={() => {
                if (
                  summaryText &&
                  summaryText.trim().length >= MIN_ENHANCE_TEXT_LENGTH &&
                  !isGibberish(summaryText)
                ) {
                  setEnhanceAnswerResponse(true)
                  setEnhanceAnswerClicked(true)
                  setCheckCoverageClicked(false)
                  // Ensure hook uses the latest text, then trigger the API call
                  enhanceAnswer.updateParams({ userInput: summaryText })
                  enhanceAnswer.fetchEnhancedAnswer()
                }
              }}
            >
              <LdsImage
                src={redStarIcon}
                alt="Enhance Answer Icon"
                aria-hidden="true"
                className={styles.pillIcon}
              />
              <span className={styles.pillText}>Enhance Answer</span>
            </LdsButton>
          )}
        </div>
      </div>

      {!enhanceAnswerClicked && (
        <div className={styles.aiSummarySection}>
          <div className={styles.aiSummaryContentContainer}>
            <textarea
              className={styles.aiSummaryContent}
              value={summaryText}
              onChange={e => setSummaryText(e.target.value)}
              rows={5}
            />
          </div>
        </div>
      )}
      {enhanceAnswerResponse && (
        <div className={styles.optionContainer}>
          <p className={styles.subTitles}>Your Answer</p>
          <div className={styles.enhancedAnswerPreview}>
            <div className={styles.previewInner}>
              <LdsRadio
                id="optionOne"
                name="answer-option"
                value="optionOne"
                label=""
                checked={selectedOption === 'optionOne'}
                onChange={() => {
                  setSelectedOption('optionOne')
                }}
              />
              <textarea
                id="optionOne-text"
                name="optionOne-text"
                value={optionOneText}
                onChange={e => {
                  enhanceAnswer.updateParams({
                    userInput: e.target.value,
                  })
                  setOptionOneText(e.target.value)
                }}
                placeholder=""
                className={styles.textInput}
                rows={5}
              />
            </div>
          </div>
          <div className={styles.previewHeaderRow}>
            <div className={styles.previewHeaderLeft}>
              <p className={styles.subTitles}>Enhanced Answer</p>
            </div>
            <div className={styles.previewHeaderRight}>
              <button
                className={styles.regenerateButton}
                onClick={() => {
                  enhanceAnswer.resetEnhancement()
                  enhanceAnswer.fetchEnhancedAnswer()
                }}
              >
                <LdsImage
                  src={regenerateIcon}
                  alt="Regenerate Icon"
                  aria-hidden="true"
                  className={styles.regenerateIcon}
                />
                <span>Regenerate</span>
              </button>
              <span className={styles.pipeSeparator}>|</span>
              <p
                className={styles.rationaleTitle}
                onClick={() => setShowRationale(prev => !prev)}
              >
                Show AI Rationale
              </p>
            </div>
          </div>
          <p className={styles.previewHelperText}>
            This text field is going to be editable for you! Update your answer
            to regenerate.
          </p>
          {showRationale && (
            <div
              className={styles.rationaleContainer}
              data-testid="rationale-container"
            >
              <p className={styles.rationaleHeader}>AI Rationale</p>
              <ul className={styles.rationaleList}>
                {prepareRationaleItems(enhanceAnswer.rationale).map(
                  (item, idx) => (
                    <li key={idx}>{item}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {enhanceAnswer.loading ? (
            <div className={styles.spinnerContainer}>
              <LdsLoadingSpinner
                className="primary"
                ariaLabel="Fetching new enhanced answer"
                svgTitle="Fetching new enhanced answer"
              />
            </div>
          ) : (
            <>
              {enhanceAnswer.error ? null : enhanceAnswer.enhancedAnswer ===
                'Unable to enhance: Please clarify your answer or provide more details. The current response is unclear or incomplete.' ? (
                <div className={styles.enhanceErrorMessageContainer}>
                  <img src={warningErrorIcon} alt="Warning Error Icon" />
                  <p className={styles.enhanceErrorMessage}>
                    Unable to generate Enhanced Answer
                  </p>
                  <p className={styles.enhanceErrorSubMessage}>
                    Retry or continue with Your Answer
                  </p>
                  <button
                    className={styles.regenerateButton}
                    onClick={() => {
                      enhanceAnswer.resetEnhancement()
                      enhanceAnswer.fetchEnhancedAnswer()
                    }}
                  >
                    <span>Retry</span>
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={styles.enhancedAnswerPreview}
                    data-testid="enhanced-answer-preview"
                  >
                    <div className={styles.previewInner}>
                      <LdsRadio
                        id="enhanced-answer-radio"
                        name="answer-option"
                        value="enhanced"
                        label=""
                        checked={selectedOption === 'option3'}
                        onChange={() => {
                          setSelectedOption('option3')
                        }}
                      />
                      <textarea
                        id="optionTwo-text"
                        name="optionTwo-text"
                        value={optionTwoText}
                        onChange={e => setOptionTwoText(e.target.value)}
                        placeholder=""
                        className={styles.textInput}
                        rows={5}
                      />
                    </div>
                  </div>

                  {/* User Rating for Enhanced Answer */}
                  {enhanceAnswer.enhancedAnswer &&
                    questionId &&
                    submissionId &&
                    formId && (
                      <>
                        <div className={styles.feedbackDivider} />
                        <UserFeedback
                          label="Rate your enhanced answer:"
                          submissionId={submissionId}
                          questionId={questionId}
                          formId={formId}
                          userInput={optionTwoText}
                          aiFeatureType="enhance_answer"
                          interactionId={enhanceAnswer.interactionId || null}
                          feedbackContext="enhanced answer"
                        />
                      </>
                    )}
                </>
              )}
            </>
          )}
        </div>
      )}
      <div className={styles.suggestionsSection} ref={checkCoverageRef}>
        <CheckCoverage
          questionId={questionId}
          submissionId={submissionId}
          userText={
            selectedOption === 'optionOne'
              ? optionOneText
              : selectedOption === 'option3'
                ? optionTwoText
                : summaryText
          }
          onLoadComplete={() => {}}
          formId={formId}
          interactionId={currentInteractionId}
          hideSuggestionsAndFeedback={
            enhanceAnswerClicked && !checkCoverageClicked
          }
          isRadioSelected={selectedOption !== ''}
          resetCoverage={enhanceAnswerClicked && selectedOption !== ''}
          onCheckCoverageClick={() => setCheckCoverageClicked(true)}
          clearCoverageData={enhanceAnswerClicked && !checkCoverageClicked}
        />

        {enhanceAnswerClicked && !checkCoverageClicked && (
          <div
            className={styles.improvementSection}
            id="initial_check_coverage_suggestions"
          >
            <h3 className={styles.improvementTitle}>
              Answer improvement suggestions
            </h3>
            <ul className={styles.improvementList}>
              <li>Describe how this solution anticipates future trends</li>
              <li>
                Provide context about the business challenge or opportunity this
                solution addresses
              </li>
              <li>Summarize the key features</li>
            </ul>
          </div>
        )}
      </div>

      {/* Info Tour Modal for Enhance Answer button */}
      <InfoTourModal
        isOpen={showEnhanceInfoModal}
        onClose={() => handleEnhanceModalClose(false)} // Skip clicked
        onNext={() => handleEnhanceModalClose(true)} // Next clicked
        message={INFO_TOUR_MESSAGES.ENHANCE_ANSWER}
        buttonText="Next"
        position="top"
        width={550}
        targetRef={enhanceButtonRef}
        skipButton={true}
        arrowAlign="right"
      />

      {/* Info Tour Modal for Check Coverage */}
      <InfoTourModal
        isOpen={showCheckCoverageModal}
        onClose={() => handleCheckCoverageModalClose(false)} // Skip clicked
        onNext={() => handleCheckCoverageModalClose(true)} // Next clicked (acts as skip for now)
        message={INFO_TOUR_MESSAGES.CHECK_COVERAGE}
        buttonText="Next"
        position="top"
        width={800}
        targetRef={checkCoverageRef}
        skipButton={true}
      />
    </div>
  )
}

export default RefineAnswerScreen
