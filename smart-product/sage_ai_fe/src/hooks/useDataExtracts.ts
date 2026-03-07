import { useEffect, useRef, useState } from 'react'

import { useDataExtractsStatus } from '../contexts/DataExtractsStatusContext'
import { cortexApiService } from '../core/api/cortex.api'
import { API_STATUS, FetchStatus } from '../core/constants'
import {
  ExtractedContent,
  UseDataExtractsParams,
  UseDataExtractsResult,
} from '../core/models/data-extracts.model'

export function useDataExtracts({
  questionId,
  submissionId,
  formId,
}: UseDataExtractsParams): UseDataExtractsResult {
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(FetchStatus.IDLE)
  const [extractedData, setExtractedData] = useState<ExtractedContent | null>(
    null
  )
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [interactionId, setInteractionId] = useState<string | null>(null)

  const { setIsFileNotFound, resetFileNotFound } = useDataExtractsStatus()

  // Prevent duplicate toasts in React 18 StrictMode (double invoked effects in dev)
  const errorToastShownRef = useRef<boolean>(false)

  const runFetch = () => {
    if (!questionId || !submissionId || !formId) {
      return
    }

    setFetchStatus(FetchStatus.LOADING)
    setErrorMessage(undefined)
    setExtractedData(null)
    resetFileNotFound() // Reset file not found status when starting new fetch
    errorToastShownRef.current = false

    cortexApiService
      .getDocExtracts(submissionId, formId, questionId)
      .then(response => {
        const extractedContent = response.extracted_content || null
        const iid = response.interaction_id || null
        setInteractionId(iid)
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
        if (!errorToastShownRef.current) {
          errorToastShownRef.current = true
        }
        setFetchStatus(FetchStatus.ERROR)
      })
  }

  // Prevent duplicate fetches in React 18 StrictMode while still refetching on param changes
  const hasAutoRunRef = useRef<boolean>(false)
  const lastParamsRef = useRef<{ q: string; s: string; f: string } | null>(null)

  useEffect(() => {
    const params = {
      q: questionId || '',
      s: submissionId || '',
      f: formId || '',
    }

    const isSameParams =
      lastParamsRef.current &&
      lastParamsRef.current.q === params.q &&
      lastParamsRef.current.s === params.s &&
      lastParamsRef.current.f === params.f

    // If params changed, allow one auto-run for the new values
    if (!isSameParams) {
      hasAutoRunRef.current = false
      lastParamsRef.current = params
    }

    if (!hasAutoRunRef.current && questionId && submissionId && formId) {
      hasAutoRunRef.current = true
      runFetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, submissionId, formId])

  const retry = () => runFetch()

  const provenanceList = extractedData?.provenance || null
  const answerText = extractedData?.answer_text || ''

  return {
    fetchStatus,
    errorMessage,
    extractedData,
    provenanceList,
    answerText,
    interactionId,
    retry,
  }
}
