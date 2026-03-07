import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAiInteraction } from '../useAiInteraction'
import * as api from '../../core/api/ai-interaction.api'

describe('useAiInteraction', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with provided map and updates single interaction', async () => {
    const { result } = renderHook(() => useAiInteraction({ a: true }))
    expect(result.current.state.interactions).toEqual({ a: true })

    act(() => {
      result.current.setInteraction('b', false)
    })
    expect(result.current.state.interactions).toEqual({ a: true, b: false })
  })

  it('posts acceptance map and handles success', async () => {
    const spy = vi
      .spyOn(api.aiInteractionApiService, 'updateAcceptance')
      .mockResolvedValue({
        updated_count: 2,
        message: 'Updated interactions',
      })

    const { result } = renderHook(() => useAiInteraction({ a: true }))

    act(() => {
      result.current.setInteraction('b', false)
    })

    const res = await result.current.updateAcceptance()
    expect(spy).toHaveBeenCalledWith({ interactions: { a: true, b: false } })
    expect(res).toEqual({ updated_count: 2, message: 'Updated interactions' })
    expect(result.current.state.pending).toBe(false)
    expect(result.current.state.error).toBeNull()
  })

  it('handles API error', async () => {
    vi.spyOn(api.aiInteractionApiService, 'updateAcceptance').mockRejectedValue(
      {
        response: {
          data: {
            error: 'Not Found',
            message: 'AI interaction not found',
            status_code: 404,
          },
        },
        message: 'Request failed',
      } as any
    )

    const { result } = renderHook(() => useAiInteraction({ a: true }))

    // Ensure payload differs from lastPayloadRef so call is attempted
    act(() => {
      result.current.setInteraction('b', false)
    })

    // Use act to ensure state updates flush before assertions
    let res: any
    await act(async () => {
      res = await result.current.updateAcceptance()
    })
    expect(res).toEqual({
      updated_count: 0,
      message: 'Request failed',
    })
    expect(result.current.state.pending).toBe(false)
    expect(result.current.state.error).toBe('Request failed')
  })

  it('skips redundant calls when payload unchanged', async () => {
    const spy = vi
      .spyOn(api.aiInteractionApiService, 'updateAcceptance')
      .mockResolvedValue({
        updated_count: 1,
        message: 'Updated interactions',
      })
    const { result } = renderHook(() => useAiInteraction({ a: true }))

    // Make a change so first call hits API
    act(() => {
      result.current.setInteraction('b', false)
    })
    await result.current.updateAcceptance()
    expect(spy).toHaveBeenCalledTimes(1)

    // Second call with no changes should be skipped
    const res = await result.current.updateAcceptance()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(res).toEqual({ updated_count: 0, message: 'No changes' })
  })

  it('reset clears state', () => {
    const { result } = renderHook(() => useAiInteraction({ a: true }))

    act(() => {
      result.current.resetInteractions()
    })

    expect(result.current.state).toEqual({
      interactions: {},
      pending: false,
      error: null,
    })
  })
})
