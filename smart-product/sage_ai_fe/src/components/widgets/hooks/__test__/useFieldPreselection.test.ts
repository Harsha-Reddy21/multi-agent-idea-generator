import { act,renderHook } from '@testing-library/react'
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import { FormStatus } from '@/core/models/form.model'

import { useCheckboxPreselection,useFieldPreselection } from '../useFieldPreselection'

describe('useFieldPreselection', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Successful Preselection', () => {
    it('should preselect when all conditions are met with undefined value', async () => {
      const options = {
        value: undefined as unknown,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2', 'option3'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should preselect when value is null', async () => {
      const options = {
        value: null,
        selectedValue: 'option2',
        enumValues: ['option1', 'option2', 'option3'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option2')
    })

    it('should preselect when value is empty string', async () => {
      const options = {
        value: '',
        selectedValue: 'option3',
        enumValues: ['option1', 'option2', 'option3'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option3')
    })

    it('should preselect when formStatus is Draft', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })

    it('should preselect when disabled and readonly are explicitly false', async () => {
      const options = {
        value: null,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })

    it('should preselect with numeric string selectedValue', async () => {
      const options = {
        value: undefined as any,
        selectedValue: '123',
        enumValues: ['123', '456', '789'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('123')
    })

    it('should preselect with special character selectedValue', async () => {
      const options = {
        value: '',
        selectedValue: 'option-with-dash',
        enumValues: ['option-with-dash', 'option_with_underscore'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option-with-dash')
    })
  })

  describe('Should Not Preselect - Missing Required Conditions', () => {
    it('should not preselect when selectedValue is undefined', async () => {
      const options = {
        value: undefined as any,
        selectedValue: undefined,
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when selectedValue is empty string', async () => {
      const options = {
        value: undefined as any,
        selectedValue: '',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when enumValues is undefined', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: undefined,
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when enumValues is empty array', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: [],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when selectedValue is not in enumValues', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'nonexistent',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Should Not Preselect - Value Already Set', () => {
    it('should not preselect when value has a string value', async () => {
      const options = {
        value: 'existing-value',
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when value has a number value', async () => {
      const options = {
        value: 42,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when value is false (boolean)', async () => {
      const options = {
        value: false,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when value is 0 (zero)', async () => {
      const options = {
        value: 0,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when value is an object', async () => {
      const options = {
        value: { key: 'value' },
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when value is an array', async () => {
      const options = {
        value: ['item1', 'item2'],
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Should Not Preselect - Form Status', () => {
    it('should not preselect when formStatus is Submitted', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.Submitted,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })


  })

  describe('Should Not Preselect - Disabled/Readonly', () => {
    it('should not preselect when disabled is true', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: true,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when readonly is true', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: true,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when both disabled and readonly are true', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: true,
        readonly: true,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })




  })

  describe('Timeout and Cleanup', () => {
    it('should wait 500ms before calling onChange', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()

      await act(async () => {
        vi.advanceTimersByTime(300)
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })

    it('should cleanup timeout on unmount', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { unmount } = renderHook(() => useFieldPreselection(options))

      unmount()

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not call onChange if value changes before timeout', async () => {
      const options = {
        value: undefined as unknown,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useFieldPreselection(props),
        { initialProps: options }
      )

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      rerender({
        ...options,
        value: 'manually-set' as unknown,
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should double-check value is empty before preselecting', async () => {
      let currentValue: unknown = undefined

      const mockOnChangeWithUpdate = vi.fn((val) => {
        currentValue = val
      })

      const options = {
        value: currentValue,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChangeWithUpdate,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChangeWithUpdate).toHaveBeenCalledWith('option1')
    })
  })

  describe('Dependency Changes', () => {
    it('should re-trigger when value changes from filled to empty', async () => {
      const options = {
        value: 'existing' as unknown,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useFieldPreselection(props),
        { initialProps: options }
      )

      await act(async () => {
        vi.runAllTimers()
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      rerender({ ...options, value: undefined as unknown })

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })

    it('should re-trigger when selectedValue changes', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useFieldPreselection(props),
        { initialProps: options }
      )

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')

      mockOnChange.mockClear()

      rerender({ ...options, value: undefined, selectedValue: 'option2' })

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option2')
    })

    it('should re-trigger when formStatus changes from Submitted to Draft', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.Submitted,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useFieldPreselection(props),
        { initialProps: options }
      )

      await act(async () => {
        vi.runAllTimers()
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      rerender({ ...options, formStatus: FormStatus.pending })

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })

    it('should re-trigger when disabled changes from true to false', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: true,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useFieldPreselection(props),
        { initialProps: options }
      )

      await act(async () => {
        vi.runAllTimers()
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      rerender({ ...options, disabled: false })

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })

    it('should re-trigger when readonly changes from true to false', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option1',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: true,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useFieldPreselection(props),
        { initialProps: options }
      )

      await act(async () => {
        vi.runAllTimers()
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      rerender({ ...options, readonly: false })

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option1')
    })

    it('should re-trigger when enumValues changes', async () => {
      const options = {
        value: undefined as any,
        selectedValue: 'option3',
        enumValues: ['option1', 'option2'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useFieldPreselection(props),
        { initialProps: options }
      )

      await act(async () => {
        vi.runAllTimers()
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      rerender({ ...options, enumValues: ['option1', 'option2', 'option3'] })

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option3')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long enumValues array', async () => {
      const largeEnumValues = Array.from({ length: 1000 }, (_, i) => `option${i}`)

      const options = {
        value: undefined as any,
        selectedValue: 'option500',
        enumValues: largeEnumValues,
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option500')
    })

    it('should handle selectedValue with special characters', async () => {
      const options = {
        value: null,
        selectedValue: 'option!@#$%^&*()',
        enumValues: ['option1', 'option!@#$%^&*()'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('option!@#$%^&*()')
    })

    it('should handle selectedValue with unicode characters', async () => {
      const options = {
        value: '',
        selectedValue: '选项1',
        enumValues: ['选项1', '选项2', '选项3'],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('选项1')
    })

    it('should handle selectedValue with whitespace', async () => {
      const options = {
        value: undefined as any,
        selectedValue: '  option with spaces  ',
        enumValues: ['option1', '  option with spaces  '],
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useFieldPreselection(options))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(mockOnChange).toHaveBeenCalledWith('  option with spaces  ')
    })
  })
})

describe('useCheckboxPreselection', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful Preselection', () => {
    it('should preselect when all conditions are met with undefined value', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['option1'])
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should preselect when value is empty array', () => {
      const options = {
        value: [],
        shouldPreselect: true,
        preselectedEnumOption: 'option2',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['option2'])
    })

    it('should preselect when formStatus is Draft', () => {
      const options = {
        value: [],
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['option1'])
    })

    it('should preselect with numeric string preselectedEnumOption', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: '123',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['123'])
    })

    it('should preselect with special character preselectedEnumOption', () => {
      const options = {
        value: [],
        shouldPreselect: true,
        preselectedEnumOption: 'option-with-dash',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['option-with-dash'])
    })
  })

  describe('Should Not Preselect - Missing Required Conditions', () => {
    it('should not preselect when shouldPreselect is false', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: false,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when shouldPreselect is undefined', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: undefined,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when preselectedEnumOption is undefined', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: undefined,
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when preselectedEnumOption is empty string', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: '',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Should Not Preselect - Value Already Set', () => {
    it('should not preselect when value has items', () => {
      const options = {
        value: ['existing-option'],
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when value has multiple items', () => {
      const options = {
        value: ['option1', 'option2', 'option3'],
        shouldPreselect: true,
        preselectedEnumOption: 'option4',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Should Not Preselect - Form Status', () => {
    it('should not preselect when formStatus is Submitted', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.Submitted,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })


  })

  describe('Should Not Preselect - Disabled/Readonly', () => {
    it('should not preselect when disabled is true', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: true,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when readonly is true', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: true,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect when both disabled and readonly are true', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: true,
        readonly: true,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).not.toHaveBeenCalled()
    })




  })

  describe('hasPreselectedRef Behavior', () => {
    it('should only preselect once even if re-rendered', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useCheckboxPreselection(props),
        { initialProps: options }
      )

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()

      rerender(options)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect again when value changes to empty after preselection', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useCheckboxPreselection(props),
        { initialProps: options }
      )

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()

      rerender({ ...options, value: [] as any })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect again when shouldPreselect changes after initial preselection', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useCheckboxPreselection(props),
        { initialProps: options }
      )

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()

      rerender({ ...options, shouldPreselect: false })
      rerender({ ...options, shouldPreselect: true })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect again when preselectedEnumOption changes', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useCheckboxPreselection(props),
        { initialProps: options }
      )

      expect(mockOnChange).toHaveBeenCalledWith(['option1'])
      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()

      rerender({ ...options, preselectedEnumOption: 'option2' })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect again when formStatus changes', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useCheckboxPreselection(props),
        { initialProps: options }
      )

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()

      rerender({ ...options, formStatus: FormStatus.Submitted })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect again when disabled changes', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useCheckboxPreselection(props),
        { initialProps: options }
      )

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()

      rerender({ ...options, disabled: true })

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not preselect again when readonly changes', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      const { rerender } = renderHook(
        (props) => useCheckboxPreselection(props),
        { initialProps: options }
      )

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()

      rerender({ ...options, readonly: true })

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle preselectedEnumOption with special characters', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option!@#$%^&*()',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['option!@#$%^&*()'])
    })

    it('should handle preselectedEnumOption with unicode characters', () => {
      const options = {
        value: [],
        shouldPreselect: true,
        preselectedEnumOption: '选项1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['选项1'])
    })

    it('should handle preselectedEnumOption with whitespace', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: '  option with spaces  ',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['  option with spaces  '])
    })

    it('should handle value as null (treated as hasNoValue)', () => {
      const options = {
        value: null as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['option1'])
    })
  })

  describe('Integration with useFieldPreselection', () => {
    it('should work independently from useFieldPreselection', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'checkbox-option',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      expect(mockOnChange).toHaveBeenCalledWith(['checkbox-option'])
    })

    it('should preselect immediately without delay unlike useFieldPreselection', () => {
      const options = {
        value: undefined as any,
        shouldPreselect: true,
        preselectedEnumOption: 'option1',
        formStatus: FormStatus.pending,
        disabled: false,
        readonly: false,
        onChange: mockOnChange,
      }

      renderHook(() => useCheckboxPreselection(options))

      // Should be called immediately, no timeout
      expect(mockOnChange).toHaveBeenCalledWith(['option1'])
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })
})


