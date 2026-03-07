import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  enhanceAnswerApi,
  EnhanceAnswerResponse,
} from '@/core/api/enhance-answer.api'

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseEnhanceAnswerParams {
  userInput: string
  questionId: string
  submissionId: string
  formId?: string
  formData?: Record<string, unknown>
  autoRun?: boolean // if true, auto-call API when params change
  question?: string
}

export interface UseEnhanceAnswerResult {
  // parsed values from API
  enhancedAnswer: string
  originalText: string
  rationale: string
  interactionId: string | null
  // raw response if caller needs it
  response: EnhanceAnswerResponse | null
  // state
  status: FetchStatus
  loading: boolean
  error: string | null
  // actions
  fetchEnhancedAnswer: () => Promise<void>
  resetEnhancement: () => void
  updateParams: (next: Partial<UseEnhanceAnswerParams>) => void
}

/**
 * useEnhanceAnswer
 * Manages the Enhance Answer API call and returns parsed response fields
 * along with loading/error state and a trigger function.
 */
export function useEnhanceAnswer(
  initial: UseEnhanceAnswerParams
): UseEnhanceAnswerResult {
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [response, setResponse] = useState<EnhanceAnswerResponse | null>(null)
  const [enhancedAnswer, setEnhancedAnswer] = useState<string>('')
  const [originalText, setOriginalText] = useState<string>('')
  const [rationale, setRationale] = useState<string>('')
  const [interactionId, setInteractionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Keep params centrally; accept once when hook is created and allow updates
  const paramsRef = useRef<UseEnhanceAnswerParams>(initial)
  const [paramsState, setParamsState] =
    useState<UseEnhanceAnswerParams>(initial)
  const hasAutoRunRef = useRef<boolean>(false) // Track if auto-run already executed

  const loading = useMemo(() => status === 'loading', [status])

  const resetEnhancement = useCallback(() => {
    setStatus('idle')
    setResponse(null)
    setEnhancedAnswer('')
    setOriginalText('')
    setRationale('')
    setInteractionId(null)
    setError(null)
  }, [])

  const fetchEnhancedAnswer = useCallback(async () => {
    const { userInput, questionId, submissionId, question } = paramsRef.current

    const formData = [
      {
        questionId: questionId,
        question: question || '',
        answer: [userInput],
      },
    ]

    // guard
    if (!userInput || !questionId) {
      setError('Missing required parameters: userInput and questionId')
      setStatus('error')
      return
    }

    setStatus('loading')
    setError(null)
    setEnhancedAnswer('')
    setOriginalText(userInput)
    setInteractionId(null)

    try {
      const resp = await enhanceAnswerApi.enhanceAnswer(
        userInput,
        questionId,
        submissionId,
        paramsRef.current.formId,
        formData
      )
      setResponse(resp)
      setInteractionId(resp.interaction_id || null)

      const reviewedText =
        typeof resp.reviewed_text === 'string'
          ? resp.reviewed_text
          : JSON.stringify(resp.reviewed_text)

      const rationaleText =
        typeof resp.rationale === 'string'
          ? resp.rationale
          : resp.rationale
            ? JSON.stringify(resp.rationale)
            : ''

      setRationale(rationaleText)
      setEnhancedAnswer(reviewedText?.trim() || '')
      setStatus('success')
    } catch (e) {
      console.error('Enhance Answer API error:', e)
      setError(
        'Cortex is not responding. We are unable to analyze your answer at the moment. Please try again later.'
      )
      setStatus('error')
    }
  }, [])

  const updateParams = useCallback((next: Partial<UseEnhanceAnswerParams>) => {
    paramsRef.current = { ...paramsRef.current, ...next }
    setParamsState(prev => ({ ...prev, ...next }))
  }, [])

  const isReadyToFetch = useMemo(() => {
    const { userInput, questionId } = paramsState
    return !!userInput && userInput.trim() !== '' && !!questionId
  }, [paramsState])

  useEffect(() => {
    paramsRef.current = paramsState
    if (paramsState.autoRun && isReadyToFetch && !hasAutoRunRef.current) {
      hasAutoRunRef.current = true
      fetchEnhancedAnswer()
    }
  }, [paramsState, isReadyToFetch])

  return {
    enhancedAnswer,
    originalText,
    rationale,
    interactionId,
    response,
    status,
    loading,
    error,
    fetchEnhancedAnswer,
    resetEnhancement,
    updateParams,
  }
}
