import { LdsButton, LdsImage } from '@elilillyco/ux-lds-react'
import * as Popover from '@radix-ui/react-popover'
import React, { useEffect, useRef, useState } from 'react'

import errorIcon from '../../../assets/Error_States.svg'
import fileIcon from '../../../assets/Files.svg'
import tickIcon from '../../../assets/tick.svg'
import { useDataExtractsStatus } from '../../../contexts/DataExtractsStatusContext'
import { cortexApiService } from '../../../core/api/cortex.api'
import {
  EXTRACT_DATA_READ_MORE_LIMIT,
  FetchStatus,
} from '../../../core/constants'
import { API_STATUS } from '../../../core/constants'
import { ExtractedContent } from '../../../core/models/data-extracts.model'
import styles from './DataExtracts.module.scss'
import ExtractPreviewCard from './ExtractPreviewCard'

export interface DataExtractsProps {
  questionText?: string
  questionId?: string
  submissionId?: string
  formId?: string
  onExtractClick?: (fullAnswer: string) => void
  onInteractionIdUpdate?: (interactionId: string | null) => void
}

/**
 * DataExtracts - Displays extracted data from documents
 */
export const DataExtracts: React.FC<DataExtractsProps> = ({
  questionId,
  submissionId,
  formId,
  onExtractClick,
  onInteractionIdUpdate,
}) => {
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(FetchStatus.IDLE)
  const [extractedData, setExtractedData] = useState<ExtractedContent | null>(
    null
  )
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [hoveredSourceIndex, setHoveredSourceIndex] = useState<number | null>(
    null
  )
  const [isUsed, setIsUsed] = useState<boolean>(false)
  const { setIsFileNotFound, resetFileNotFound } = useDataExtractsStatus()

  useEffect(() => {
    setIsUsed(false)
  }, [questionId])

  // Prevent duplicate toasts in React 18 StrictMode (double invoked effects in dev)
  const errorToastShownRef = useRef<boolean>(false)

  useEffect(() => {
    if (!questionId || !submissionId || !formId) {
      return
    }

    setFetchStatus(FetchStatus.LOADING)
    setErrorMessage(undefined)
    setExtractedData(null)
    resetFileNotFound() // Reset file not found status when starting new fetch
    // Reset toast flag for this new request cycle
    errorToastShownRef.current = false

    cortexApiService
      .getDocExtracts(submissionId, formId, questionId)
      .then(response => {
        const extractedContent = response.extracted_content || null
        // capture interaction_id from response (if present)
        const iid = response.interaction_id || null
        if (onInteractionIdUpdate) onInteractionIdUpdate(iid)
        setExtractedData(extractedContent)
        setFetchStatus(FetchStatus.SUCCESS)
        resetFileNotFound() // Reset on success
      })
      .catch(error => {
        console.error('Error fetching data extracts:', error)
        const errorStatus = error.status || error.status_code || 500

        // Update context if 404 error
        if (errorStatus === API_STATUS.ERROR) {
          setIsFileNotFound(true)
        } else {
          resetFileNotFound()
        }

        setErrorMessage(
          "We couldn't fetch data extracts right now. Please try again later."
        )
        // Show failure toast only once
        if (!errorToastShownRef.current) {
          errorToastShownRef.current = true
        }
        setFetchStatus(FetchStatus.ERROR)
      })
  }, [
    questionId,
    submissionId,
    formId,
    setIsFileNotFound,
    resetFileNotFound,
    onInteractionIdUpdate,
  ])

  const handleRetry = () => {
    if (!questionId || !submissionId || !formId) {
      return
    }

    setFetchStatus(FetchStatus.LOADING)
    setErrorMessage(undefined)
    setExtractedData(null)
    resetFileNotFound() // Reset file not found status on retry
    // Reset toast flag for retry cycle
    errorToastShownRef.current = false

    cortexApiService
      .getDocExtracts(submissionId, formId, questionId)
      .then(response => {
        const extractedContent = response.extracted_content || null
        // capture interaction_id on retry as well
        const iid = response.interaction_id || null
        if (onInteractionIdUpdate) onInteractionIdUpdate(iid)
        setExtractedData(extractedContent)
        setFetchStatus(FetchStatus.SUCCESS)
        resetFileNotFound() // Reset on success
      })
      .catch(error => {
        console.error('Error fetching data extracts:', error)
        const errorStatus = error.status || error.status_code || 500

        // Update context if 404 error
        if (errorStatus === API_STATUS.ERROR) {
          setIsFileNotFound(true)
        } else {
          resetFileNotFound()
        }

        setErrorMessage(
          "We couldn't fetch data extracts right now. Please try again later."
        )
        // Show failure toast only once
        if (!errorToastShownRef.current) {
          errorToastShownRef.current = true
        }
        setFetchStatus(FetchStatus.ERROR)
      })
  }

  // (Removed unused showToast conditional stub to avoid confusion.)

  return (
    <div className={styles.tabContent}>
      <div className={styles.dataExtracts}>
        {fetchStatus === FetchStatus.LOADING && (
          <p className={styles.dataExtractsPlaceholder}>
            Loading data extracts...
          </p>
        )}

        {fetchStatus === FetchStatus.ERROR && (
          <div className={styles.dataExtractsErrorContainer}>
            <img src={errorIcon} alt="Error" className={styles.errorIcon} />
            <h4 className={styles.errorTitle}>Cortex Failed to Extract Data</h4>
            <p className={styles.errorMessage}>
              {errorMessage || 'Please click on retry'}
            </p>
            <LdsButton
              type="button"
              className={styles.retryButton}
              onClick={handleRetry}
              data-testid="retry-data-extracts-button"
            >
              Retry
            </LdsButton>
          </div>
        )}

        {fetchStatus === FetchStatus.SUCCESS && !extractedData && (
          <p className={styles.dataExtractsPlaceholder}>
            No data extracts available for this question.
          </p>
        )}

        {fetchStatus === FetchStatus.SUCCESS && extractedData && (
          <>
            <h4 className={styles.dataExtractsTitle}>
              Data Extracts seamlessly capture key information from your
              uploaded documents, streamlining the input process for greater
              speed and accuracy
            </h4>
            <div className={styles.extractsList}>
              {(() => {
                const provenanceList = extractedData.provenance
                const shouldTruncate =
                  extractedData.answer_text.length >
                  EXTRACT_DATA_READ_MORE_LIMIT
                const hasValidAnswer =
                  extractedData.answer_text &&
                  extractedData.answer_text.trim() !== ''

                return (
                  <div className={styles.extractItemContainer}>
                    {hasValidAnswer && (
                      <h6 className={styles.extractedTitle}>
                        This is a suitable extract for the input field
                      </h6>
                    )}

                    <p className={styles.extractAnswer}>
                      {shouldTruncate && !isExpanded
                        ? `${extractedData.answer_text.substring(0, EXTRACT_DATA_READ_MORE_LIMIT)}... `
                        : extractedData.answer_text}
                      {shouldTruncate && (
                        <LdsButton
                          className={styles.readMoreButton}
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsExpanded(!isExpanded)
                          }}
                        >
                          {isExpanded ? 'Read Less' : 'Read More'}
                        </LdsButton>
                      )}
                    </p>

                    <div className={styles.actions}>
                      {!isUsed ? (
                        <LdsButton
                          type="button"
                          classes="text compact"
                          className={styles.useExtractButton}
                          disabled={!hasValidAnswer}
                          onClick={() => {
                            setIsUsed(true)
                            if (onExtractClick) {
                              onExtractClick(extractedData.answer_text)
                            }
                          }}
                        >
                          Use this Extract
                        </LdsButton>
                      ) : (
                        <div className={styles.dataExtractUsed}>
                          <LdsImage
                            src={tickIcon}
                            alt="Check"
                            className={styles.checkIcon}
                          />
                          <span className={styles.usedText}>
                            Data extract used
                          </span>
                        </div>
                      )}
                    </div>

                    <p className={styles.extractSourceLength}>
                      {extractedData.provenance?.length || 0} relevant resources
                      found
                    </p>

                    <div className={styles.provenanceList}>
                      {provenanceList &&
                        provenanceList.map((provenance, index) => (
                          <div key={index}>
                            <Popover.Root open={hoveredSourceIndex === index}>
                              <Popover.Trigger asChild>
                                <div
                                  className={styles.extractSource}
                                  onMouseEnter={() =>
                                    setHoveredSourceIndex(index)
                                  }
                                  onMouseLeave={() =>
                                    setHoveredSourceIndex(null)
                                  }
                                >
                                  <LdsImage
                                    src={fileIcon}
                                    alt="File :"
                                    className={styles.fileIcon}
                                  />
                                  {provenance.file_name}
                                </div>
                              </Popover.Trigger>
                              <Popover.Portal>
                                <Popover.Content
                                  className={styles.sourcePopover}
                                  side="bottom"
                                  sideOffset={4}
                                  align="start"
                                  onMouseEnter={() =>
                                    setHoveredSourceIndex(index)
                                  }
                                  onMouseLeave={() =>
                                    setHoveredSourceIndex(null)
                                  }
                                >
                                  <ExtractPreviewCard
                                    provenance={provenance}
                                    documentType="uploadedDocument"
                                  />
                                </Popover.Content>
                              </Popover.Portal>
                            </Popover.Root>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DataExtracts
