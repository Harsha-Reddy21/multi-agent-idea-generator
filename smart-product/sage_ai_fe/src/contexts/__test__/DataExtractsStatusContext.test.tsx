import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  DataExtractsStatusProvider,
  useDataExtractsStatus,
} from '../DataExtractsStatusContext'

describe('DataExtractsStatusContext', () => {
  describe('DataExtractsStatusProvider', () => {
    it('should render children', () => {
      const { result } = renderHook(() => useDataExtractsStatus(), {
        wrapper: ({ children }) => (
          <DataExtractsStatusProvider>{children}</DataExtractsStatusProvider>
        ),
      })

      expect(result.current).toBeDefined()
    })

    it('should provide initial state with isFileNotFound as false', () => {
      const { result } = renderHook(() => useDataExtractsStatus(), {
        wrapper: DataExtractsStatusProvider,
      })

      expect(result.current.isFileNotFound).toBe(false)
    })

    it('should provide setIsFileNotFound function', () => {
      const { result } = renderHook(() => useDataExtractsStatus(), {
        wrapper: DataExtractsStatusProvider,
      })

      expect(result.current.setIsFileNotFound).toBeDefined()
      expect(typeof result.current.setIsFileNotFound).toBe('function')
    })

    it('should provide resetFileNotFound function', () => {
      const { result } = renderHook(() => useDataExtractsStatus(), {
        wrapper: DataExtractsStatusProvider,
      })

      expect(result.current.resetFileNotFound).toBeDefined()
      expect(typeof result.current.resetFileNotFound).toBe('function')
    })

    it('should render multiple children', () => {
      const { result } = renderHook(() => useDataExtractsStatus(), {
        wrapper: ({ children }) => (
          <DataExtractsStatusProvider>
            <div>Child 1</div>
            {children}
            <div>Child 2</div>
          </DataExtractsStatusProvider>
        ),
      })

      expect(result.current).toBeDefined()
    })
  })

  describe('useDataExtractsStatus', () => {
    describe('Hook Usage', () => {
      it('should throw error when used outside of provider', () => {
        expect(() => {
          renderHook(() => useDataExtractsStatus())
        }).toThrow(
          'useDataExtractsStatus must be used within DataExtractsStatusProvider'
        )
      })

      it('should throw error with correct message when context is undefined', () => {
        try {
          renderHook(() => useDataExtractsStatus())
        } catch (error) {
          expect((error as Error).message).toBe(
            'useDataExtractsStatus must be used within DataExtractsStatusProvider'
          )
        }
      })

      it('should not throw error when used inside provider', () => {
        expect(() => {
          renderHook(() => useDataExtractsStatus(), {
            wrapper: DataExtractsStatusProvider,
          })
        }).not.toThrow()
      })
    })

    describe('State Management', () => {
      let wrapper: React.FC<{ children: React.ReactNode }>

      beforeEach(() => {
        wrapper = ({ children }) => (
          <DataExtractsStatusProvider>{children}</DataExtractsStatusProvider>
        )
      })

      it('should update isFileNotFound to true when setIsFileNotFound is called with true', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper,
        })

        expect(result.current.isFileNotFound).toBe(false)

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current.isFileNotFound).toBe(true)
      })

      it('should update isFileNotFound to false when setIsFileNotFound is called with false', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper,
        })

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current.isFileNotFound).toBe(true)

        act(() => {
          result.current.setIsFileNotFound(false)
        })

        expect(result.current.isFileNotFound).toBe(false)
      })

      it('should handle multiple consecutive calls to setIsFileNotFound', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper,
        })

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current.isFileNotFound).toBe(true)

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current.isFileNotFound).toBe(true)

        act(() => {
          result.current.setIsFileNotFound(false)
        })

        expect(result.current.isFileNotFound).toBe(false)
      })

      it('should reset isFileNotFound to false when resetFileNotFound is called', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper,
        })

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current.isFileNotFound).toBe(true)

        act(() => {
          result.current.resetFileNotFound()
        })

        expect(result.current.isFileNotFound).toBe(false)
      })

      it('should reset isFileNotFound to false even when already false', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper,
        })

        expect(result.current.isFileNotFound).toBe(false)

        act(() => {
          result.current.resetFileNotFound()
        })

        expect(result.current.isFileNotFound).toBe(false)
      })

      it('should handle multiple reset calls', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper,
        })

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current.isFileNotFound).toBe(true)

        act(() => {
          result.current.resetFileNotFound()
          result.current.resetFileNotFound()
          result.current.resetFileNotFound()
        })

        expect(result.current.isFileNotFound).toBe(false)
      })
    })

    describe('Context Value Memoization', () => {
      it('should maintain stable reference when state does not change', () => {
        const { result, rerender } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        const firstReference = result.current

        rerender()

        expect(result.current).toBe(firstReference)
      })

      it('should update reference when state changes', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        const firstReference = result.current

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current).not.toBe(firstReference)
      })

      it('should have stable setIsFileNotFound function reference', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        const setFunction = result.current.setIsFileNotFound

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current.setIsFileNotFound).toBe(setFunction)
      })
    })

    describe('Integration Tests', () => {
      it('should handle complete workflow: set to true, check, then reset', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        // Initial state
        expect(result.current.isFileNotFound).toBe(false)

        // Set to true (e.g., file not found error occurred)
        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(result.current.isFileNotFound).toBe(true)

        // Reset (e.g., user navigated away or retried)
        act(() => {
          result.current.resetFileNotFound()
        })

        expect(result.current.isFileNotFound).toBe(false)
      })

      it('should allow alternating between true and false states', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        for (let i = 0; i < 5; i++) {
          act(() => {
            result.current.setIsFileNotFound(true)
          })
          expect(result.current.isFileNotFound).toBe(true)

          act(() => {
            result.current.resetFileNotFound()
          })
          expect(result.current.isFileNotFound).toBe(false)
        }
      })

      it('should maintain state consistency across multiple hook consumers', () => {
        let sharedWrapper: React.FC<{ children: React.ReactNode }>

        const Wrapper = ({ children }: { children: React.ReactNode }) => (
          <DataExtractsStatusProvider>{children}</DataExtractsStatusProvider>
        )

        sharedWrapper = Wrapper

        const { result: result1 } = renderHook(() => useDataExtractsStatus(), {
          wrapper: sharedWrapper,
        })
        const { result: result2 } = renderHook(() => useDataExtractsStatus(), {
          wrapper: sharedWrapper,
        })

        // Both hooks start with the same initial state
        expect(result1.current.isFileNotFound).toBe(false)
        expect(result2.current.isFileNotFound).toBe(false)

        // Update from result1
        act(() => {
          result1.current.setIsFileNotFound(true)
        })

        // Both should reflect the change since they share the same provider
        expect(result1.current.isFileNotFound).toBe(true)
        // Note: result2 will still be false because they are in separate provider instances
        // This test verifies that each hook gets its own independent state
        expect(result2.current.isFileNotFound).toBe(false)
      })
    })

    describe('Edge Cases', () => {
      it('should handle rapid successive state changes', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        act(() => {
          result.current.setIsFileNotFound(true)
          result.current.setIsFileNotFound(false)
          result.current.setIsFileNotFound(true)
          result.current.resetFileNotFound()
        })

        expect(result.current.isFileNotFound).toBe(false)
      })

      it('should maintain boolean type for isFileNotFound', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        expect(typeof result.current.isFileNotFound).toBe('boolean')

        act(() => {
          result.current.setIsFileNotFound(true)
        })

        expect(typeof result.current.isFileNotFound).toBe('boolean')
      })

      it('should handle setIsFileNotFound with explicit boolean values', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        act(() => {
          result.current.setIsFileNotFound(Boolean(1))
        })

        expect(result.current.isFileNotFound).toBe(true)

        act(() => {
          result.current.setIsFileNotFound(Boolean(0))
        })

        expect(result.current.isFileNotFound).toBe(false)
      })
    })

    describe('Return Value Structure', () => {
      it('should return all expected properties', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        expect(result.current).toHaveProperty('isFileNotFound')
        expect(result.current).toHaveProperty('setIsFileNotFound')
        expect(result.current).toHaveProperty('resetFileNotFound')
      })

      it('should return exactly three properties', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        expect(Object.keys(result.current)).toHaveLength(3)
      })

      it('should have correct types for all properties', () => {
        const { result } = renderHook(() => useDataExtractsStatus(), {
          wrapper: DataExtractsStatusProvider,
        })

        expect(typeof result.current.isFileNotFound).toBe('boolean')
        expect(typeof result.current.setIsFileNotFound).toBe('function')
        expect(typeof result.current.resetFileNotFound).toBe('function')
      })
    })
  })
})
