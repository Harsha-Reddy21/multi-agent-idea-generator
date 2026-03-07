import { useCallback, useMemo, useRef, useState } from 'react'
import {
  aiInteractionApiService,
  AiInteractionAcceptanceRequest,
} from '../core/api/ai-interaction.api'

export type AiInteractionState = {
  interactions: Record<string, boolean>
  pending: boolean
  error: string | null
}

export function useAiInteraction(
  initialInteractions?: Record<string, boolean>
) {
  const [state, setState] = useState<AiInteractionState>({
    interactions: initialInteractions ?? {},
    pending: false,
    error: null,
  })

  const lastPayloadRef = useRef<Record<string, boolean>>(state.interactions)

  const setInteraction = useCallback((id: string, accepted: boolean) => {
    setState(prev => ({
      ...prev,
      interactions: { ...prev.interactions, [id]: accepted },
    }))
  }, [])

  const setInteractions = useCallback((map: Record<string, boolean>) => {
    setState(prev => ({
      ...prev,
      interactions: { ...prev.interactions, ...map },
    }))
  }, [])

  const updateAcceptance = useCallback(async () => {
    const payload: AiInteractionAcceptanceRequest = {
      interactions: { ...state.interactions },
    }
    // Prevent redundant calls with identical payloads
    if (
      JSON.stringify(payload.interactions) ===
      JSON.stringify(lastPayloadRef.current)
    ) {
      return { updated_count: 0, message: 'No changes' }
    }
    setState(prev => ({ ...prev, pending: true, error: null }))
    try {
      const res = await aiInteractionApiService.updateAcceptance(payload)
      lastPayloadRef.current = { ...payload.interactions }
      setState(prev => ({ ...prev, pending: false, error: null }))
      return res
    } catch (e: any) {
      // Expect backend error shape: { error, message, status_code }
      const msg = e?.message ?? e?.response?.data?.message ?? 'Unknown error'
      setState(prev => ({ ...prev, pending: false, error: msg }))
      return { updated_count: 0, message: msg }
    }
  }, [state.interactions])

  const resetInteractions = useCallback(() => {
    lastPayloadRef.current = {}
    setState({ interactions: {}, pending: false, error: null })
  }, [])

  const controls = useMemo(
    () => ({
      state,
      setInteraction,
      setInteractions,
      updateAcceptance,
      resetInteractions,
    }),
    [
      state,
      setInteraction,
      setInteractions,
      updateAcceptance,
      resetInteractions,
    ]
  )

  return controls
}
