import { LdsImage, LdsRadio, LdsTextField } from '@elilillyco/ux-lds-react'
import * as Popover from '@radix-ui/react-popover'
import React, { useRef, useState } from 'react'

import {
  ExtendedFormDashboardFormType,
  INFO_TOUR_MESSAGES,
} from '@/core/constants'
import { SelectAnswerScreenProps } from '@/core/models/select-answer-screen.model'
import {
  isTourCompleted,
  markTourCompleted,
} from '@/core/utils/tour-state.util'
import { useDataExtracts } from '@/hooks/useDataExtracts'

import fileIcon from '../../assets/Files.svg'
import InfoTourModal from '../InfoTourModal/InfoTourModal'
import { UserFeedback } from '../widgets'
import ExtractPreviewCard from './DataExtracts/ExtractPreviewCard'
import styles from './SelectAnswerScreen.module.scss'

const SelectAnswerScreen: React.FC<SelectAnswerScreenProps> = ({
  questionText,
  inputValue,
  questionId,
  submissionId,
  formId,
  onNextDisabledChange,
  onAnswerSelect,
  commonFields,
  // dataExtractOnly,
  aiInteractions,
}) => {
  const {
    provenanceList,
    answerText,
    interactionId: dataExtractsInteractionId,
  } = useDataExtracts({
    questionId,
    submissionId,
    formId,
  })

  // Check if Data Extracts should be shown
  const showDataExtracts = React.useMemo(() => {
    return (
      answerText &&
      answerText.trim() !== '' &&
      provenanceList &&
      provenanceList.length > 0
    )
  }, [answerText, provenanceList])

  // Check if current question exists in commonFields
  const commonFieldMatch = React.useMemo(() => {
    return commonFields?.find(field => field.question_id === questionId)
  }, [commonFields, questionId])
  const showOption3 = !!commonFieldMatch
  const sourceFields = (commonFieldMatch as any)?.source_fields ?? []

  const [selectedOption, setSelectedOption] = React.useState<string>('')
  const [option1Text, setOption1Text] = React.useState<string>(inputValue || '')
  const [option2Text, setOption2Text] = React.useState<string>(answerText || '')
  const [option3Text, setOption3Text] = React.useState<string>(
    commonFieldMatch?.answer || ''
  )

  const [hoveredCitationKey, setHoveredCitationKey] = React.useState<
    string | null
  >(null)
  const [hoveredCommonKey, setHoveredCommonKey] = React.useState<string | null>(
    null
  )
  const [showDataExtractsModal, setShowDataExtractsModal] =
    useState<boolean>(false)
  const [showLeverageAnswersModal, setShowLeverageAnswersModal] =
    useState<boolean>(false)
  const dataExtractsHeaderRef = useRef<HTMLHeadingElement>(null)
  const leverageAnswersHeaderRef = useRef<HTMLHeadingElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (showDataExtracts && !isTourCompleted('data_extracts')) {
      setShowDataExtractsModal(true)
    }
  }, [showDataExtracts])

  React.useEffect(() => {
    if (inputValue) {
      setOption1Text(inputValue)
    }
  }, [inputValue])

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const maxHeight = 150
      const scrollHeight = textareaRef.current.scrollHeight

      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = maxHeight + 'px'
        textareaRef.current.style.overflowY = 'auto'
      } else {
        textareaRef.current.style.height = scrollHeight + 'px'
        textareaRef.current.style.overflowY = 'hidden'
      }
    }
  }, [option2Text])

  // Update option2Text when answerText from API changes
  React.useEffect(() => {
    if (answerText) {
      setOption2Text(answerText)
    }
  }, [answerText])

  // Update option3Text when commonFieldMatch changes
  React.useEffect(() => {
    if (commonFieldMatch?.answer) {
      setOption3Text(commonFieldMatch.answer)
    }
  }, [commonFieldMatch])

  // Group provenance entries by file name once (stable across renders)
  const groupedProvenance = React.useMemo(() => {
    const groups = new Map<string, any[]>()
      ; (provenanceList ?? []).forEach((doc: any) => {
        const key = doc?.file_name ?? 'Unknown Source'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(doc)
      })
    return Array.from(groups.entries()).map(([fileName, items]) => ({
      fileName,
      items,
    }))
  }, [provenanceList])

  const groupedSourceFields = React.useMemo(() => {
    const groups = new Map<string, any[]>()
      ; (sourceFields as any[]).forEach((field: any) => {
        const key = field?.form_type ?? 'Unknown'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(field)
      })
    return Array.from(groups.entries()).map(([formType, items]) => ({
      formType,
      items,
    }))
  }, [sourceFields])

  React.useEffect(() => {
    let isDisabled = true
    let currentAnswer = ''

    if (selectedOption === 'option1' && option1Text.trim() !== '') {
      isDisabled = false
      currentAnswer = option1Text
    } else if (selectedOption === 'option2' && option2Text.trim() !== '') {
      isDisabled = false
      currentAnswer = option2Text
    } else if (selectedOption === 'option3' && option3Text.trim() !== '') {
      isDisabled = false
      currentAnswer = option3Text
    }

    onNextDisabledChange?.(isDisabled)
    onAnswerSelect?.(currentAnswer)
  }, [
    selectedOption,
    option1Text,
    option2Text,
    option3Text,
    onNextDisabledChange,
    onAnswerSelect,
  ])

  // Use the stable setInteraction callback to avoid effect loops
  const { setInteraction: setAiInteraction } = aiInteractions ?? {}

  // Keep Data Extracts acceptance in sync with selection
  // True only when option2 is selected; false otherwise
  React.useEffect(() => {
    if (selectedOption !== 'option2') return
    console.log('dataExtractsInteractionId', dataExtractsInteractionId)
    console.log('selectedOption:', selectedOption)
    if (setAiInteraction && dataExtractsInteractionId) {
      setAiInteraction(dataExtractsInteractionId, selectedOption === 'option2')
    }
  }, [setAiInteraction, dataExtractsInteractionId, selectedOption])

  // Handle Data Extracts modal close
  const handleDataExtractsModalClose = (isNext: boolean) => {
    setShowDataExtractsModal(false)
    markTourCompleted('data_extracts')
    // Only show the second modal if user clicked "Next" (not "Skip") and tour not completed
    if (isNext && !isTourCompleted('leverage_answers')) {
      setShowLeverageAnswersModal(true)
    }
  }

  // Handle Leverage Answers modal close
  const handleLeverageAnswersModalClose = () => {
    setShowLeverageAnswersModal(false)
    markTourCompleted('leverage_answers')
  }

  const mapFormTypeToName = (formType: string) => {
    switch (formType) {
      case ExtendedFormDashboardFormType.AiRegistryForm:
        return 'AI Registry Form'
      case ExtendedFormDashboardFormType.IdeaSubForm:
        return 'Solution/System Overview Form'
      case ExtendedFormDashboardFormType.DloForm:
        return 'Digital Legal Office Form'
      case ExtendedFormDashboardFormType.WwtpForm:
        return 'Working with Third Parties Form'
      case ExtendedFormDashboardFormType.WnvVendorEngagementForm:
        return 'Working with Third Parties Form'
      case ExtendedFormDashboardFormType.BeginSubmissionForm:
        return 'Initial Submission Form'
      case ExtendedFormDashboardFormType.SecurityArchForm:
        return 'Security Architecture & Engineering Form'
      default:
        return 'Document Extract'
    }
  }

  return (
    <div
      className={styles.selectAnswerScreen}
      data-testid="select-answer-screen"
    >
      {showOption3 && (
        <>
          <section className={styles.frame}>
            <header className={styles.frameHeader}>
              <h3 className={styles.frameTitle} ref={leverageAnswersHeaderRef}>
                Insights from past responses
              </h3>
              <p className={styles.frameSubtitle}>
                These are the insights available from the fields you filled in
                previously
              </p>
            </header>

            <div className={styles.optionContainer}>
              <div className={styles.radioOptionTextfield}>
                <LdsRadio
                  id="option3"
                  name="answer-option"
                  value="option3"
                  label=""
                  checked={selectedOption === 'option3'}
                  onChange={() => setSelectedOption('option3')}
                />
                <LdsTextField
                  id="option3-text"
                  name="option3-text"
                  label=""
                  value={option3Text}
                  onChange={e => setOption3Text(e.target.value)}
                  placeholder=""
                  className={styles.textInput}
                />
              </div>
              <div className={styles.provenanceGrid}>
                {groupedSourceFields.map(({ formType, items }) => (
                  <div key={formType} className={styles.provenanceItem}>
                    <div className={styles.extractSource}>
                      <LdsImage
                        src={fileIcon}
                        alt="Source Field :"
                        className={styles.fileIcon}
                      />
                      <span className={styles.fileName}>
                        {mapFormTypeToName(formType)}
                      </span>

                      <div className={styles.citationList}>
                        {items.map((entry: any, idx: number) => {
                          const number = entry?.citationNumber ?? idx + 1
                          const key = `common-${formType}-${idx}`
                          return (
                            <Popover.Root
                              key={key}
                              open={hoveredCommonKey === key}
                            >
                              <Popover.Trigger asChild>
                                <span
                                  className={styles.citationNumber}
                                  onMouseEnter={() => setHoveredCommonKey(key)}
                                  onMouseLeave={() => setHoveredCommonKey(null)}
                                >
                                  [{number}]
                                </span>
                              </Popover.Trigger>

                              <Popover.Portal>
                                <Popover.Content
                                  className={styles.sourcePopover}
                                  side="bottom"
                                  sideOffset={4}
                                  align="start"
                                  onMouseEnter={() => setHoveredCommonKey(key)}
                                  onMouseLeave={() => setHoveredCommonKey(null)}
                                >
                                  <ExtractPreviewCard
                                    provenance={entry as any}
                                    documentType="commonField"
                                  />
                                </Popover.Content>
                              </Popover.Portal>
                            </Popover.Root>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {showDataExtracts && (
        <>
          {showOption3 && <div className={styles.divider}></div>}

          <section className={styles.frame}>
            <header className={styles.frameHeader}>
              <h3 className={styles.frameTitle} ref={dataExtractsHeaderRef}>
                Data Extracts
              </h3>
              <p className={styles.frameSubtitle}>
                This is the extracts from the documents you uploaded
              </p>
            </header>

            <div className={styles.optionContainer}>
              <div className={styles.radioOption}>
                <LdsRadio
                  id="option2"
                  name="answer-option"
                  value="option2"
                  label=""
                  checked={selectedOption === 'option2'}
                  onChange={() => {
                    setSelectedOption('option2')
                  }}
                />
                <textarea
                  ref={textareaRef}
                  id="option2-text"
                  name="option2-text"
                  value={option2Text}
                  onChange={e => setOption2Text(e.target.value)}
                  placeholder="Data from documents"
                  className={styles.textInput}
                  rows={1}
                />
              </div>
            </div>

            <div className={styles.provenanceGrid}>
              {groupedProvenance.map(({ fileName, items }) => (
                <div key={fileName} className={styles.provenanceItem}>
                  <div className={styles.extractSource}>
                    <LdsImage
                      src={fileIcon}
                      alt="File :"
                      className={styles.fileIcon}
                    />
                    <span className={styles.fileName}>{fileName}</span>

                    <div className={styles.citationList}>
                      {items.map((entry: any, idx: number) => {
                        const number = entry?.citationNumber ?? idx + 1
                        const key = `${fileName}-${idx}`
                        return (
                          <Popover.Root
                            key={key}
                            open={hoveredCitationKey === key}
                          >
                            <Popover.Trigger asChild>
                              <span
                                className={styles.citationNumber}
                                onMouseEnter={() => setHoveredCitationKey(key)}
                                onMouseLeave={() => setHoveredCitationKey(null)}
                              >
                                [{number}]
                              </span>
                            </Popover.Trigger>

                            <Popover.Portal>
                              <Popover.Content
                                className={styles.sourcePopover}
                                side="bottom"
                                sideOffset={4}
                                align="start"
                                onMouseEnter={() => setHoveredCitationKey(key)}
                                onMouseLeave={() => setHoveredCitationKey(null)}
                              >
                                <ExtractPreviewCard
                                  provenance={entry as any}
                                  documentType="uploadedDocument"
                                />
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <div className={styles.overview}>
        <div className={styles.divider}></div>
        <p className={styles.overviewLabel} id="selected_question_label_2">
          {questionText}
        </p>
        <p className={styles.overviewSubtext}>
          This text field is going to be editable for you!
        </p>
      </div>

      <div className={styles.optionContainer}>
        <div className={styles.radioOptionTextfield}>
          <LdsRadio
            id="option1"
            name="answer-option"
            value="option1"
            label=""
            checked={selectedOption === 'option1'}
            onChange={() => setSelectedOption('option1')}
          />
          <LdsTextField
            id="option1-text"
            name="option1-text"
            label=""
            value={option1Text}
            onChange={e => setOption1Text(e.target.value)}
            placeholder="Please type the answer"
            className={styles.textInput}
          />
        </div>
      </div>

      {/* Info Tour Modal for Data Extracts */}
      {showDataExtracts && (
        <InfoTourModal
          isOpen={showDataExtractsModal}
          onClose={() => handleDataExtractsModalClose(false)} // Skip clicked
          onNext={() => handleDataExtractsModalClose(true)} // Next clicked
          message={INFO_TOUR_MESSAGES.DATA_EXTRACTS}
          buttonText="Next"
          position="top"
          width={500}
          targetRef={dataExtractsHeaderRef}
          skipButton={true}
        />
      )}

      {/* Info Tour Modal for Leverage Previously Filled Answers */}
      <InfoTourModal
        isOpen={showLeverageAnswersModal}
        onClose={handleLeverageAnswersModalClose}
        message={INFO_TOUR_MESSAGES.LEVERAGE_ANSWERS}
        buttonText="Okay"
        position="top"
        width={500}
        targetRef={leverageAnswersHeaderRef}
        skipButton={false}
      />

      {/* UserFeedback for Data Extracts */}
      {showDataExtracts && questionId && submissionId && formId && (
        <UserFeedback
          label="Rate your documents extracted:"
          submissionId={submissionId}
          questionId={questionId}
          formId={formId}
          userInput={option2Text}
          aiFeatureType="data_extracts"
          interactionId={dataExtractsInteractionId || null}
          feedbackContext="data extracts"
        />
      )}
    </div>
  )
}

export default SelectAnswerScreen
