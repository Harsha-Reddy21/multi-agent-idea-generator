import { useEffect, useState } from 'react'

import {
  isTourCompleted,
  markTourCompleted,
} from '@/core/utils/tour-state.util'

interface UseAISwitchOptions {
  isAIFeatureEnabled: boolean
  isIdeaSubmissionForm: boolean
  questionId?: string
  submissionId?: string
}

interface UseAISwitchReturn {
  aiSwitchEnabled: boolean
  setAiSwitchEnabled: (enabled: boolean) => void
  showSwitchInfoModal: boolean
  setShowSwitchInfoModal: (show: boolean) => void
  isFirstField: boolean
  handleSwitchModalClose: () => void
}

// Track if the info modal has been shown for any field using sessionStorage
const SESSION_KEY = 'hasShownSwitchInfoModal'

const hasShownSwitchInfoModal = (): boolean => {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

const setHasShownSwitchInfoModal = (value: boolean): void => {
  sessionStorage.setItem(SESSION_KEY, value.toString())
}

// Helper functions for persisting switch state per question
const AI_SWITCH_STORAGE_KEY = 'sage_ai_switch_states'

const getStoredSwitchState = (
  submissionId: string | undefined,
  questionId: string | undefined
): boolean | null => {
  if (!submissionId || !questionId) return null

  try {
    const stored = localStorage.getItem(AI_SWITCH_STORAGE_KEY)
    if (!stored) return null

    const states = JSON.parse(stored) as Record<string, Record<string, boolean>>
    return states[submissionId]?.[questionId] ?? null
  } catch {
    return null
  }
}

const saveSwitchState = (
  submissionId: string | undefined,
  questionId: string | undefined,
  enabled: boolean
): void => {
  if (!submissionId || !questionId) return

  try {
    const stored = localStorage.getItem(AI_SWITCH_STORAGE_KEY)
    const states = stored
      ? (JSON.parse(stored) as Record<string, Record<string, boolean>>)
      : {}

    if (!states[submissionId]) {
      states[submissionId] = {}
    }

    states[submissionId][questionId] = enabled
    localStorage.setItem(AI_SWITCH_STORAGE_KEY, JSON.stringify(states))
  } catch (error) {
    console.error('Failed to save AI switch state:', error)
  }
}

export const useAISwitch = ({
  isAIFeatureEnabled,
  isIdeaSubmissionForm,
  questionId,
  submissionId,
}: UseAISwitchOptions): UseAISwitchReturn => {
  // Initialize with stored state or default to true
  const [aiSwitchEnabled, setAiSwitchEnabledState] = useState<boolean>(() => {
    const storedState = getStoredSwitchState(submissionId, questionId)
    return storedState !== null ? storedState : true
  })

  const [showSwitchInfoModal, setShowSwitchInfoModal] = useState<boolean>(false)
  const [isFirstField, setIsFirstField] = useState<boolean>(false)

  // Restore switch state when component mounts or IDs change
  useEffect(() => {
    const storedState = getStoredSwitchState(submissionId, questionId)
    if (storedState !== null) {
      setAiSwitchEnabledState(storedState)
    }
  }, [submissionId, questionId])

  // Wrapper to persist state when changed
  const setAiSwitchEnabled = (enabled: boolean) => {
    setAiSwitchEnabledState(enabled)
    saveSwitchState(submissionId, questionId, enabled)
  }

  // Show info modal only for the first field with AI features enabled
  useEffect(() => {
    if (
      (isAIFeatureEnabled || isIdeaSubmissionForm) &&
      !hasShownSwitchInfoModal() &&
      !isTourCompleted('switch_info')
    ) {
      setIsFirstField(true)
      setShowSwitchInfoModal(true)
      setHasShownSwitchInfoModal(true)
    }
  }, [isAIFeatureEnabled, isIdeaSubmissionForm])

  const handleSwitchModalClose = () => {
    setShowSwitchInfoModal(false)
    markTourCompleted('switch_info')
  }

  return {
    aiSwitchEnabled,
    setAiSwitchEnabled,
    showSwitchInfoModal,
    setShowSwitchInfoModal,
    isFirstField,
    handleSwitchModalClose,
  }
}
