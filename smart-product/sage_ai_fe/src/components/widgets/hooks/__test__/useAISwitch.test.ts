import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import * as tourStateUtil from '@/core/utils/tour-state.util'

import { useAISwitch } from '../useAISwitch'

// Mock tour-state.util
vi.mock('@/core/utils/tour-state.util', () => ({
  isTourCompleted: vi.fn(),
  markTourCompleted: vi.fn(),
}))

describe('useAISwitch', () => {
  const mockIsTourCompleted = vi.mocked(tourStateUtil.isTourCompleted)
  const mockMarkTourCompleted = vi.mocked(tourStateUtil.markTourCompleted)

  beforeEach(() => {
    vi.clearAllMocks()
    // Provide isolated storages with full API for this suite
    const createMockStorage = (): Storage => {
      const store: Record<string, string> = {}
      return {
        get length() {
          return Object.keys(store).length
        },
        clear: vi.fn(() => {
          for (const k of Object.keys(store)) delete store[k]
        }),
        getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
        removeItem: vi.fn((key: string) => {
          delete store[key]
        }),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = String(value)
        }),
      } as unknown as Storage
    }

    Object.defineProperty(window, 'localStorage', {
      value: createMockStorage(),
      configurable: true,
    })
    Object.defineProperty(window, 'sessionStorage', {
      value: createMockStorage(),
      configurable: true,
    })
    sessionStorage.clear()
    localStorage.clear()
    mockIsTourCompleted.mockReturnValue(false)
  })

  afterEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should initialize with aiSwitchEnabled as true when no stored state', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(true)
    })

    it('should initialize with stored state from localStorage', () => {
      const states = { s1: { q1: false } }
      localStorage.setItem('sage_ai_switch_states', JSON.stringify(states))

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(false)
    })

    it('should initialize with true when questionId is not provided', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          submissionId: 's1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(true)
    })

    it('should initialize with true when submissionId is not provided', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(true)
    })

    it('should initialize with showSwitchInfoModal as false when conditions not met', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
    })

    it('should initialize with isFirstField as false when conditions not met', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.isFirstField).toBe(false)
    })

    it('should return all expected properties', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current).toHaveProperty('aiSwitchEnabled')
      expect(result.current).toHaveProperty('setAiSwitchEnabled')
      expect(result.current).toHaveProperty('showSwitchInfoModal')
      expect(result.current).toHaveProperty('setShowSwitchInfoModal')
      expect(result.current).toHaveProperty('isFirstField')
      expect(result.current).toHaveProperty('handleSwitchModalClose')
    })

    it('should have function types for setters and handler', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(typeof result.current.setAiSwitchEnabled).toBe('function')
      expect(typeof result.current.setShowSwitchInfoModal).toBe('function')
      expect(typeof result.current.handleSwitchModalClose).toBe('function')
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should save switch state to localStorage when changed', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      const stored = localStorage.getItem('sage_ai_switch_states')
      expect(stored).toBeTruthy()
      const states = JSON.parse(stored!)
      expect(states.s1.q1).toBe(false)
    })

    it('should restore switch state from localStorage on mount', () => {
      const states = { s1: { q1: false } }
      localStorage.setItem('sage_ai_switch_states', JSON.stringify(states))

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(false)
    })

    it('should maintain separate states for different questions', () => {
      const { result: result1 } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result1.current.setAiSwitchEnabled(false)
      })

      const { result: result2 } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q2',
          submissionId: 's1',
        })
      )

      expect(result1.current.aiSwitchEnabled).toBe(false)
      expect(result2.current.aiSwitchEnabled).toBe(true)
    })

    it('should maintain separate states for different submissions', () => {
      const { result: result1 } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result1.current.setAiSwitchEnabled(false)
      })

      const { result: result2 } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's2',
        })
      )

      expect(result1.current.aiSwitchEnabled).toBe(false)
      expect(result2.current.aiSwitchEnabled).toBe(true)
    })

    it('should not save to localStorage when questionId is missing', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          submissionId: 's1',
        })
      )

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      const stored = localStorage.getItem('sage_ai_switch_states')
      expect(stored).toBeNull()
    })

    it('should not save to localStorage when submissionId is missing', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
        })
      )

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      const stored = localStorage.getItem('sage_ai_switch_states')
      expect(stored).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock current localStorage.setItem to throw (use the instance on window, not Storage.prototype)
      const originalSetItem = window.localStorage.setItem
      ;(window.localStorage as any).setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded')
      })

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(() => {
        act(() => {
          result.current.setAiSwitchEnabled(false)
        })
      }).not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save AI switch state:',
        expect.any(Error)
      )

      ;(window.localStorage as any).setItem = originalSetItem
      consoleErrorSpy.mockRestore()
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('sage_ai_switch_states', 'invalid json')

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      // Should default to true when localStorage is corrupted
      expect(result.current.aiSwitchEnabled).toBe(true)
    })

    it('should update state when IDs change', () => {
      const states = {
        s1: { q1: false },
        s2: { q2: true },
      }
      localStorage.setItem('sage_ai_switch_states', JSON.stringify(states))

      const { result, rerender } = renderHook(
        (props) => useAISwitch(props),
        {
          initialProps: {
            isAIFeatureEnabled: false,
            isIdeaSubmissionForm: false,
            questionId: 'q1',
            submissionId: 's1',
          },
        }
      )

      expect(result.current.aiSwitchEnabled).toBe(false)

      rerender({
        isAIFeatureEnabled: false,
        isIdeaSubmissionForm: false,
        questionId: 'q2',
        submissionId: 's2',
      })

      expect(result.current.aiSwitchEnabled).toBe(true)
    })
  })

  describe('Modal Display Logic - isAIFeatureEnabled', () => {
    it('should show modal when isAIFeatureEnabled is true and tour not completed', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
      })
    })

    it('should set isFirstField to true when showing modal for AI feature', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.isFirstField).toBe(true)
      })
    })

    it('should set sessionStorage when showing modal', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe('true')
      })
    })

    it('should not show modal when isAIFeatureEnabled is false', () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(result.current.isFirstField).toBe(false)
    })

    it('should not show modal when tour is already completed', () => {
      mockIsTourCompleted.mockReturnValue(true)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(result.current.isFirstField).toBe(false)
    })

    it('should not show modal when already shown in session', () => {
      sessionStorage.setItem('hasShownSwitchInfoModal', 'true')
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(result.current.isFirstField).toBe(false)
    })

    it('should call isTourCompleted with "switch_info" parameter', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(mockIsTourCompleted).toHaveBeenCalledWith('switch_info')
      })
    })
  })

  describe('Modal Display Logic - isIdeaSubmissionForm', () => {
    it('should show modal when isIdeaSubmissionForm is true and tour not completed', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: true,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
      })
    })

    it('should set isFirstField to true when showing modal for idea submission form', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: true,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.isFirstField).toBe(true)
      })
    })

    it('should not show modal when isIdeaSubmissionForm is false', () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(result.current.isFirstField).toBe(false)
    })
  })

  describe('Modal Display Logic - Combined Conditions', () => {
    it('should show modal when both isAIFeatureEnabled and isIdeaSubmissionForm are true', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: true,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
        expect(result.current.isFirstField).toBe(true)
      })
    })

    it('should not show modal when both conditions are false', () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(result.current.isFirstField).toBe(false)
    })

    it('should not show modal when both tour completed and session shown', () => {
      sessionStorage.setItem('hasShownSwitchInfoModal', 'true')
      mockIsTourCompleted.mockReturnValue(true)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: true,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(result.current.isFirstField).toBe(false)
    })

    it('should not show modal when tour completed but not session shown', () => {
      mockIsTourCompleted.mockReturnValue(true)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe(null)
    })

    it('should not show modal when session shown but tour not completed', () => {
      sessionStorage.setItem('hasShownSwitchInfoModal', 'true')
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
    })
  })

  describe('setAiSwitchEnabled', () => {
    it('should update aiSwitchEnabled to false when called with false', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(true)

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      expect(result.current.aiSwitchEnabled).toBe(false)
    })

    it('should update aiSwitchEnabled to true when called with true', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      expect(result.current.aiSwitchEnabled).toBe(false)

      act(() => {
        result.current.setAiSwitchEnabled(true)
      })

      expect(result.current.aiSwitchEnabled).toBe(true)
    })

    it('should toggle aiSwitchEnabled multiple times', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(true)

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })
      expect(result.current.aiSwitchEnabled).toBe(false)

      act(() => {
        result.current.setAiSwitchEnabled(true)
      })
      expect(result.current.aiSwitchEnabled).toBe(true)

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })
      expect(result.current.aiSwitchEnabled).toBe(false)
    })

    it('should maintain state when set to same value', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(true)

      act(() => {
        result.current.setAiSwitchEnabled(true)
      })

      expect(result.current.aiSwitchEnabled).toBe(true)
    })

    it('should persist state to localStorage when changed', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      const stored = localStorage.getItem('sage_ai_switch_states')
      const states = JSON.parse(stored!)
      expect(states.s1.q1).toBe(false)
    })
  })

  describe('setShowSwitchInfoModal', () => {
    it('should update showSwitchInfoModal to true when called with true', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)

      act(() => {
        result.current.setShowSwitchInfoModal(true)
      })

      expect(result.current.showSwitchInfoModal).toBe(true)
    })

    it('should update showSwitchInfoModal to false when called with false', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result.current.setShowSwitchInfoModal(true)
      })

      expect(result.current.showSwitchInfoModal).toBe(true)

      act(() => {
        result.current.setShowSwitchInfoModal(false)
      })

      expect(result.current.showSwitchInfoModal).toBe(false)
    })

    it('should toggle showSwitchInfoModal multiple times', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result.current.setShowSwitchInfoModal(true)
      })
      expect(result.current.showSwitchInfoModal).toBe(true)

      act(() => {
        result.current.setShowSwitchInfoModal(false)
      })
      expect(result.current.showSwitchInfoModal).toBe(false)

      act(() => {
        result.current.setShowSwitchInfoModal(true)
      })
      expect(result.current.showSwitchInfoModal).toBe(true)
    })
  })

  describe('handleSwitchModalClose', () => {
    it('should set showSwitchInfoModal to false', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
      })

      act(() => {
        result.current.handleSwitchModalClose()
      })

      expect(result.current.showSwitchInfoModal).toBe(false)
    })

    it('should call markTourCompleted with "switch_info"', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
      })

      act(() => {
        result.current.handleSwitchModalClose()
      })

      expect(mockMarkTourCompleted).toHaveBeenCalledWith('switch_info')
    })

    it('should work when modal was not shown initially', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)

      act(() => {
        result.current.handleSwitchModalClose()
      })

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(mockMarkTourCompleted).toHaveBeenCalledWith('switch_info')
    })

    it('should call markTourCompleted even when called multiple times', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result.current.handleSwitchModalClose()
      })

      expect(mockMarkTourCompleted).toHaveBeenCalledTimes(1)

      act(() => {
        result.current.handleSwitchModalClose()
      })

      expect(mockMarkTourCompleted).toHaveBeenCalledTimes(2)
    })
  })

  describe('useEffect Dependencies', () => {
    it('should not re-trigger modal when dependencies do not change', () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { rerender } = renderHook(
        (props) => useAISwitch(props),
        {
          initialProps: {
            isAIFeatureEnabled: false,
            isIdeaSubmissionForm: false,
            questionId: 'q1',
            submissionId: 's1',
          },
        }
      )

      expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe(null)

      rerender({
        isAIFeatureEnabled: false,
        isIdeaSubmissionForm: false,
        questionId: 'q1',
        submissionId: 's1',
      })

      expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe(null)
    })

    it('should react to isAIFeatureEnabled changing from false to true', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result, rerender } = renderHook(
        (props) => useAISwitch(props),
        {
          initialProps: {
            isAIFeatureEnabled: false,
            isIdeaSubmissionForm: false,
            questionId: 'q1',
            submissionId: 's1',
          },
        }
      )

      expect(result.current.showSwitchInfoModal).toBe(false)

      rerender({
        isAIFeatureEnabled: true,
        isIdeaSubmissionForm: false,
        questionId: 'q1',
        submissionId: 's1',
      })

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
      })
    })

    it('should react to isIdeaSubmissionForm changing from false to true', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result, rerender } = renderHook(
        (props) => useAISwitch(props),
        {
          initialProps: {
            isAIFeatureEnabled: false,
            isIdeaSubmissionForm: false,
            questionId: 'q1',
            submissionId: 's1',
          },
        }
      )

      expect(result.current.showSwitchInfoModal).toBe(false)

      rerender({
        isAIFeatureEnabled: false,
        isIdeaSubmissionForm: true,
        questionId: 'q1',
        submissionId: 's1',
      })

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
      })
    })

    it('should not show modal again if sessionStorage is already set', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result, rerender } = renderHook(
        (props) => useAISwitch(props),
        {
          initialProps: {
            isAIFeatureEnabled: true,
            isIdeaSubmissionForm: false,
            questionId: 'q1',
            submissionId: 's1',
          },
        }
      )

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
        expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe('true')
      })

      act(() => {
        result.current.handleSwitchModalClose()
      })

      rerender({
        isAIFeatureEnabled: true,
        isIdeaSubmissionForm: true,
        questionId: 'q1',
        submissionId: 's1',
      })

      expect(result.current.showSwitchInfoModal).toBe(false)
    })
  })

  describe('SessionStorage Integration', () => {
    it('should check sessionStorage on mount', () => {
      sessionStorage.setItem('hasShownSwitchInfoModal', 'true')
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
    })

    it('should set sessionStorage to "true" when showing modal', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe('true')
      })
    })

    it('should not modify sessionStorage when modal is not shown', () => {
      mockIsTourCompleted.mockReturnValue(false)

      renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe(null)
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete flow: show modal, close it, and mark tour completed', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
        expect(result.current.isFirstField).toBe(true)
      })

      expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe('true')

      act(() => {
        result.current.handleSwitchModalClose()
      })

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(mockMarkTourCompleted).toHaveBeenCalledWith('switch_info')
    })

    it('should allow manual control of modal state', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)

      act(() => {
        result.current.setShowSwitchInfoModal(true)
      })

      expect(result.current.showSwitchInfoModal).toBe(true)

      act(() => {
        result.current.setShowSwitchInfoModal(false)
      })

      expect(result.current.showSwitchInfoModal).toBe(false)
    })

    it('should handle AI switch toggle while modal is open', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result.current.showSwitchInfoModal).toBe(true)
      })

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      expect(result.current.aiSwitchEnabled).toBe(false)
      expect(result.current.showSwitchInfoModal).toBe(true)

      act(() => {
        result.current.handleSwitchModalClose()
      })

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(result.current.aiSwitchEnabled).toBe(false)
    })

    it('should work correctly across multiple hook instances with sessionStorage', async () => {
      mockIsTourCompleted.mockReturnValue(false)

      const { result: result1 } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      await waitFor(() => {
        expect(result1.current.showSwitchInfoModal).toBe(true)
      })

      expect(sessionStorage.getItem('hasShownSwitchInfoModal')).toBe('true')

      const { result: result2 } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: false,
          questionId: 'q2',
          submissionId: 's1',
        })
      )

      expect(result2.current.showSwitchInfoModal).toBe(false)
      expect(result2.current.isFirstField).toBe(false)
    })

    it('should persist and restore switch state across hook instances', () => {
      const { result: result1 } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      act(() => {
        result1.current.setAiSwitchEnabled(false)
      })

      const { result: result2 } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result2.current.aiSwitchEnabled).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle isTourCompleted returning true initially', () => {
      mockIsTourCompleted.mockReturnValue(true)

      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: true,
          isIdeaSubmissionForm: true,
          questionId: 'q1',
          submissionId: 's1',
        })
      )

      expect(result.current.showSwitchInfoModal).toBe(false)
      expect(result.current.isFirstField).toBe(false)
    })

    it('should handle missing questionId gracefully', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          submissionId: 's1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(true)

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      expect(result.current.aiSwitchEnabled).toBe(false)
      // Should not throw or break
    })

    it('should handle missing submissionId gracefully', () => {
      const { result } = renderHook(() =>
        useAISwitch({
          isAIFeatureEnabled: false,
          isIdeaSubmissionForm: false,
          questionId: 'q1',
        })
      )

      expect(result.current.aiSwitchEnabled).toBe(true)

      act(() => {
        result.current.setAiSwitchEnabled(false)
      })

      expect(result.current.aiSwitchEnabled).toBe(false)
      // Should not throw or break
    })
  })
})
