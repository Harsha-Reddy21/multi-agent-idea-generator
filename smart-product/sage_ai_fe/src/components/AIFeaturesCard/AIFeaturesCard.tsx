import {
  LdsButton,
  LdsDivider,
  LdsIcon,
  LdsImage,
  LdsStepIndicator,
  useToastContext,
} from '@elilillyco/ux-lds-react'
import { useAiInteraction } from '@/hooks/useAiInteraction'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AiPanelButtonActionId } from '@/core/constants'
import {
  AiPanelButtonActionType,
  AiPanelFooterButtonDescriptor,
} from '@/core/models/buttons.model'
import { showToast } from '@/core/utils/toast.utils'

import AIsuggestionIcon from '../../assets/ai_suggestion_Icon.svg'
import closeIcon from '../../assets/cross.svg'
import infoIcon from '../../assets/Info.svg'
import { AIFeaturesCardProps } from '../../core/models/ai-features-card.model'
import AICardButtons from './AICardButtons'
import styles from './AIFeaturesCard.module.scss'
import HelpModal from './HelpModal'
import RefineAnswerScreen from './RefineAnswerScreen'
import SelectAnswerScreen from './SelectAnswerScreen'

export const AIFeaturesCard: React.FC<AIFeaturesCardProps> = ({
  isVisible,
  onClose,
  questionText,
  questionId,
  submissionId,
  formId,
  inputValue,
  onExtractClick,
  commonFields,
  dataExtractOnly = false,
  formContext,
}) => {
  const { addToast } = useToastContext()
  // Instantiate AI interaction tracking and keep a reference to pass to children
  const aiInteractions = useAiInteraction()
  const [isEditingSummary, setIsEditingSummary] = useState<boolean>(false)
  const [summaryText, setSummaryText] = useState<string>('')
  const [showHelpPopover, setShowHelpPopover] = useState<boolean>(false)
  const [activePageIndex, setActivePageIndex] = useState<number>(0)
  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(true)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [selectedRefinedAnswer, setSelectedRefinedAnswer] = useState<string>('')
  const [isUseAnswerDisabled, setIsUseAnswerDisabled] = useState<boolean>(true)

  // Reset to first screen when the user focuses a different input (questionId changes)
  const prevQuestionIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    const prev = prevQuestionIdRef.current
    if (prev !== undefined && prev !== questionId) {
      // Question changed — start from SelectAnswerScreen and clear transient state
      setActivePageIndex(0)
      setIsEditingSummary(false)
      setSummaryText('')
      setIsNextDisabled(true)
      setSelectedAnswer('')
      setSelectedRefinedAnswer('')
      setIsUseAnswerDisabled(true)
    }
    prevQuestionIdRef.current = questionId
  }, [questionId])

  // Adjust steps based on dataExtractOnly mode
  const steps = dataExtractOnly
    ? ['Select Answer from Data Extracts']
    : ['Select Answer', 'Refine and Enhance Answer']

  const handleEnhanceError = (errorMessage: string) => {
    showToast({
      addToast,
      message: errorMessage,
      variant: 'error',
    })
  }

  const pageButtonIds: Partial<
    Record<number, AiPanelFooterButtonDescriptor[]>
  > = useMemo(() => {
    if (dataExtractOnly) {
      // In dataExtractOnly mode, only show Use Answer button with custom label
      return {
        0: [
          {
            action: AiPanelButtonActionId.useAnswer,
            disabled: isNextDisabled, // Reuse isNextDisabled for selection validation
            label: 'Use this Answer', // Custom label for dataExtractOnly mode
          },
        ],
      }
    }

    // Normal mode with two steps
    return {
      0: [
        { action: AiPanelButtonActionId.cancel, type: 'outlined' },
        {
          action: AiPanelButtonActionId.next,
          disabled: isNextDisabled,
        },
      ],
      1: [
        { action: AiPanelButtonActionId.prev, type: 'outlined' },
        {
          action: AiPanelButtonActionId.useAnswer,
          disabled: isUseAnswerDisabled,
        },
      ],
    }
  }, [isNextDisabled, isUseAnswerDisabled, dataExtractOnly])

  const actionHandlerMap: Record<
    AiPanelButtonActionType,
    () => void | Promise<void>
  > = useMemo(
    () => ({
      [AiPanelButtonActionId.cancel]: () => onClose(),
      [AiPanelButtonActionId.prev]: () => setActivePageIndex(p => p - 1),
      [AiPanelButtonActionId.next]: () => {
        if (activePageIndex === 0 && selectedAnswer) {
          setSummaryText(selectedAnswer)
        }
        setActivePageIndex(p => p + 1)
        // Enable Use Answer button when moving to tab 2
        setIsUseAnswerDisabled(false)
      },
      [AiPanelButtonActionId.proceedWithoutSelection]: () =>
        setActivePageIndex(p => p + 1),
      [AiPanelButtonActionId.useAnswer]: async () => {
        // In dataExtractOnly mode, use selectedAnswer directly
        // In normal mode, use selectedRefinedAnswer if we're on the refine screen, otherwise selectedAnswer
        const textToUse = dataExtractOnly 
          ? selectedAnswer 
          : activePageIndex === 1 && selectedRefinedAnswer 
            ? selectedRefinedAnswer 
            : summaryText

        if (onExtractClick && textToUse) {
          onExtractClick(textToUse)
        }
        await aiInteractions.updateAcceptance()
        aiInteractions.resetInteractions()
        // Reset all states
        setActivePageIndex(0)
        setIsEditingSummary(false)
        setSummaryText('')
        setIsNextDisabled(true)
        setSelectedAnswer('')
        setSelectedRefinedAnswer('')
        setIsUseAnswerDisabled(true)
        // Close the modal
        onClose()
      },
    }),
    [
      activePageIndex,
      selectedAnswer,
      selectedRefinedAnswer,
      summaryText,
      onClose,
      onExtractClick,
      dataExtractOnly,
    ]
  )

  if (!isVisible) return null

  // Use the calculated tab labels
  // const tabLabels = calculatedTabLabels

  // // Check if we have any tabs to display - if not, don't render tabs
  // const hasTabs = tabLabels.length > 0
  return (
    <div
      className={`${styles.aiFeaturesCard} ${showHelpPopover ? styles.noScroll : ''}`}
      data-testid="ai-features-card"
    >
      {/* Help Modal Component */}
      {showHelpPopover && (
        <HelpModal onClose={() => setShowHelpPopover(false)} />
      )}

      <div className={styles.header}>
        <span className={styles.title}>
          <LdsImage
            src={AIsuggestionIcon}
            alt="AI Suggestion"
            className={styles.aiIcon}
          />{' '}
          AI Response Builder
        </span>
        <div className={styles.headerActions}>
          <button
            className={styles.helpButton}
            onClick={() => setShowHelpPopover(!showHelpPopover)}
            aria-label="Help"
          >
            <LdsIcon name="question" className={styles.icon} />
          </button>
          <LdsButton
            className={styles.closeButton}
            onClick={onClose}
            data-testid="close-button"
          >
            <LdsImage src={closeIcon} alt="Close" />
          </LdsButton>
        </div>
      </div>
      <div className={styles.warningMessage}>
        <LdsImage src={infoIcon} alt="Info" className={styles.infoIcon} />
        <span>
          {activePageIndex === 0
            ? 'AI assisted answers, please verify and review your answers'
            : 'Review thoroughly—AI-generated results may not be fully accurate'}
        </span>
      </div>

      <LdsDivider aria-hidden="true" />

      {!dataExtractOnly && (
        <LdsStepIndicator
          className={styles.stepIndicator}
          forceCondensedMode={true}
          activeIndex={activePageIndex}
          completeLabel="Complete!"
          nextLabel="Next"
          ofLabel="of"
          showStepNumbers
          stepCompleteLabel="Complete"
          stepLabel="Step"
          steps={[...steps]}
        />
      )}

      <div className={styles.content}>
        {dataExtractOnly ? (
          // Data Extract Only Mode - Show only SelectAnswerScreen with limited options
          <SelectAnswerScreen
            questionText={questionText || ''}
            inputValue={inputValue || ''}
            formId={formId || ''}
            questionId={questionId || ''}
            submissionId={submissionId || ''}
            onNextDisabledChange={setIsNextDisabled}
            onAnswerSelect={setSelectedAnswer}
            commonFields={commonFields}
            dataExtractOnly={dataExtractOnly}
            aiInteractions={aiInteractions}
          />
        ) : (
          // Normal Mode - Show either Select or Refine screen based on activePageIndex
          <>
            {activePageIndex === 0 ? (
              <SelectAnswerScreen
                questionText={questionText || ''}
                inputValue={inputValue || ''}
                formId={formId || ''}
                questionId={questionId || ''}
                submissionId={submissionId || ''}
                onNextDisabledChange={setIsNextDisabled}
                onAnswerSelect={setSelectedAnswer}
                commonFields={commonFields}
                aiInteractions={aiInteractions}
              />
            ) : (
              <RefineAnswerScreen
                questionText={questionText}
                summaryText={summaryText}
                setSummaryText={setSummaryText}
                isEditingSummary={isEditingSummary}
                setIsEditingSummary={setIsEditingSummary}
                onExtractClick={onExtractClick}
                questionId={questionId}
                submissionId={submissionId}
                inputValue={inputValue}
                formId={formId || ''}
                formData={formContext?.formData || {}}
                currentInteractionId=""
                onEnhanceError={handleEnhanceError}
                onSelectionChange={selected =>
                  setIsUseAnswerDisabled(!selected)
                }
                onAnswerSelect={setSelectedRefinedAnswer}
                aiInteractions={aiInteractions}
              />
            )}
          </>
        )}
      </div>
      <div className={styles.footer}>
        <AICardButtons
          pageButtonIds={pageButtonIds}
          activePageIndex={activePageIndex}
          setActivePageIndex={setActivePageIndex}
          actionHandlerMap={actionHandlerMap}
        />
      </div>
    </div>
  )
}

export default AIFeaturesCard
