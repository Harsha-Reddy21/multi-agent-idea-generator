import { describe, expect,it } from 'vitest'

import {
  extractQuestionId,
  formatFileSize,
  isArrayValueEmpty,
  isValueEmpty,
  normalizeEventValue,
} from '../helpers'

describe('helpers utilities', () => {
  describe('normalizeEventValue', () => {
    describe('String values', () => {
      it('should return string value directly', () => {
        const result = normalizeEventValue('test value')
        expect(result).toBe('test value')
      })

      it('should return empty string as undefined', () => {
        const result = normalizeEventValue('')
        expect(result).toBeUndefined()
      })

      it('should handle string with spaces', () => {
        const result = normalizeEventValue('hello world')
        expect(result).toBe('hello world')
      })

      it('should handle string with special characters', () => {
        const result = normalizeEventValue('test@123!#$')
        expect(result).toBe('test@123!#$')
      })

      it('should handle numeric string', () => {
        const result = normalizeEventValue('12345')
        expect(result).toBe('12345')
      })

      it('should handle string with whitespace', () => {
        const result = normalizeEventValue('  text  ')
        expect(result).toBe('  text  ')
      })

      it('should handle single space as string', () => {
        const result = normalizeEventValue(' ')
        expect(result).toBe(' ')
      })
    })

    describe('Option object (LdsSelect behavior)', () => {
      it('should extract value from option object', () => {
        const result = normalizeEventValue({ value: 'option1' })
        expect(result).toBe('option1')
      })

      it('should return undefined when option value is empty string', () => {
        const result = normalizeEventValue({ value: '' })
        expect(result).toBeUndefined()
      })

      it('should handle option object with undefined value', () => {
        const result = normalizeEventValue({ value: undefined })
        expect(result).toBeUndefined()
      })

      it('should handle option object with numeric value', () => {
        const result = normalizeEventValue({ value: '123' })
        expect(result).toBe('123')
      })

      it('should prefer value property over target', () => {
        const result = normalizeEventValue({
          value: 'option-value',
          target: { value: 'target-value' },
        })
        expect(result).toBe('option-value')
      })

      it('should handle option object with additional properties', () => {
        const result = normalizeEventValue({
          value: 'test',
          label: 'Test Label',
          disabled: false,
        })
        expect(result).toBe('test')
      })
    })

    describe('Event object with target', () => {
      it('should extract value from event target', () => {
        const result = normalizeEventValue({ target: { value: 'event value' } })
        expect(result).toBe('event value')
      })

      it('should return undefined when target value is empty string', () => {
        const result = normalizeEventValue({ target: { value: '' } })
        expect(result).toBeUndefined()
      })

      it('should handle event with undefined target value', () => {
        const result = normalizeEventValue({ target: { value: undefined } })
        expect(result).toBeUndefined()
      })

      it('should handle event object with other properties', () => {
        const result = normalizeEventValue({
          target: { value: 'text' },
          type: 'change',
          bubbles: true,
        })
        expect(result).toBe('text')
      })

      it('should handle event with target but no value property', () => {
        const result = normalizeEventValue({ target: {} })
        expect(result).toBeUndefined()
      })
    })

    describe('Primitive values', () => {
      it('should return undefined for null', () => {
        const result = normalizeEventValue(null)
        expect(result).toBeUndefined()
      })

      it('should return undefined for undefined', () => {
        const result = normalizeEventValue(undefined)
        expect(result).toBeUndefined()
      })

      it('should return undefined for number', () => {
        const result = normalizeEventValue(123)
        expect(result).toBeUndefined()
      })

      it('should return undefined for boolean true', () => {
        const result = normalizeEventValue(true)
        expect(result).toBeUndefined()
      })

      it('should return undefined for boolean false', () => {
        const result = normalizeEventValue(false)
        expect(result).toBeUndefined()
      })

      it('should return undefined for symbol', () => {
        const result = normalizeEventValue(Symbol('test'))
        expect(result).toBeUndefined()
      })
    })

    describe('Complex objects', () => {
      it('should return undefined for empty object', () => {
        const result = normalizeEventValue({})
        expect(result).toBeUndefined()
      })

      it('should return undefined for object without value or target', () => {
        const result = normalizeEventValue({ name: 'test', id: '123' })
        expect(result).toBeUndefined()
      })

      it('should return undefined for array', () => {
        const result = normalizeEventValue(['value1', 'value2'])
        expect(result).toBeUndefined()
      })

      it('should return undefined for empty array', () => {
        const result = normalizeEventValue([])
        expect(result).toBeUndefined()
      })

      it('should handle nested object structure', () => {
        const result = normalizeEventValue({
          data: { target: { value: 'nested' } },
        })
        expect(result).toBeUndefined()
      })

      it('should handle object with value as non-string', () => {
        const result = normalizeEventValue({ value: 123 })
        expect(result).toBe(123)
      })

      it('should handle object with target value as non-string', () => {
        const result = normalizeEventValue({ target: { value: true } })
        expect(result).toBe(true)
      })
    })

    describe('Edge cases', () => {
      it('should handle object with null target', () => {
        const result = normalizeEventValue({ target: null })
        expect(result).toBeUndefined()
      })

      it('should handle object with undefined target', () => {
        const result = normalizeEventValue({ target: undefined })
        expect(result).toBeUndefined()
      })

      it('should handle string "0"', () => {
        const result = normalizeEventValue('0')
        expect(result).toBe('0')
      })

      it('should handle string "false"', () => {
        const result = normalizeEventValue('false')
        expect(result).toBe('false')
      })

      it('should handle string "null"', () => {
        const result = normalizeEventValue('null')
        expect(result).toBe('null')
      })

      it('should handle string "undefined"', () => {
        const result = normalizeEventValue('undefined')
        expect(result).toBe('undefined')
      })

      it('should handle very long string', () => {
        const longString = 'a'.repeat(10000)
        const result = normalizeEventValue(longString)
        expect(result).toBe(longString)
      })

      it('should handle unicode characters', () => {
        const result = normalizeEventValue('测试文本')
        expect(result).toBe('测试文本')
      })

      it('should handle emoji in string', () => {
        const result = normalizeEventValue('Hello 👋 World')
        expect(result).toBe('Hello 👋 World')
      })
    })
  })

  describe('formatFileSize', () => {
    it('should format 0 bytes as 0.00 MB', () => {
      const result = formatFileSize(0)
      expect(result).toBe('0.00 MB')
    })

    it('should format 1 byte as 0.00 MB', () => {
      const result = formatFileSize(1)
      expect(result).toBe('0.00 MB')
    })

    it('should format 1 KB as 0.00 MB', () => {
      const result = formatFileSize(1024)
      expect(result).toBe('0.00 MB')
    })

    it('should format 1 MB correctly', () => {
      const result = formatFileSize(1024 * 1024)
      expect(result).toBe('1.00 MB')
    })

    it('should format 1.5 MB correctly', () => {
      const result = formatFileSize(1.5 * 1024 * 1024)
      expect(result).toBe('1.50 MB')
    })

    it('should format 10 MB correctly', () => {
      const result = formatFileSize(10 * 1024 * 1024)
      expect(result).toBe('10.00 MB')
    })

    it('should format 100 MB correctly', () => {
      const result = formatFileSize(100 * 1024 * 1024)
      expect(result).toBe('100.00 MB')
    })

    it('should format 1 GB (1024 MB) correctly', () => {
      const result = formatFileSize(1024 * 1024 * 1024)
      expect(result).toBe('1024.00 MB')
    })

    it('should format 500 KB as 0.49 MB', () => {
      const result = formatFileSize(500 * 1024)
      expect(result).toBe('0.49 MB')
    })

    it('should format fractional MB with 2 decimal places', () => {
      const result = formatFileSize(1234567)
      expect(result).toMatch(/^\d+\.\d{2} MB$/)
    })

    it('should handle very small file size', () => {
      const result = formatFileSize(512)
      expect(result).toBe('0.00 MB')
    })

    it('should handle very large file size', () => {
      const result = formatFileSize(5000 * 1024 * 1024)
      expect(result).toBe('5000.00 MB')
    })

    it('should round to 2 decimal places', () => {
      const result = formatFileSize(1.999 * 1024 * 1024)
      expect(result).toMatch(/^\d+\.\d{2} MB$/)
    })

    it('should format 2.25 MB correctly', () => {
      const result = formatFileSize(2.25 * 1024 * 1024)
      expect(result).toBe('2.25 MB')
    })

    it('should format 0.01 MB correctly', () => {
      const result = formatFileSize(0.01 * 1024 * 1024)
      expect(result).toBe('0.01 MB')
    })

    it('should handle negative bytes as negative MB', () => {
      const result = formatFileSize(-1024 * 1024)
      expect(result).toBe('-1.00 MB')
    })

    it('should format decimal bytes correctly', () => {
      const result = formatFileSize(1536.5 * 1024)
      expect(result).toMatch(/^1\.\d{2} MB$/)
    })
  })

  describe('extractQuestionId', () => {
    it('should remove "root_" prefix from ID', () => {
      const result = extractQuestionId('root_question1')
      expect(result).toBe('question1')
    })

    it('should handle ID with multiple underscores', () => {
      const result = extractQuestionId('root_question_1_sub')
      expect(result).toBe('question_1_sub')
    })

    it('should return same ID if no "root_" prefix', () => {
      const result = extractQuestionId('question1')
      expect(result).toBe('question1')
    })

    it('should handle empty string', () => {
      const result = extractQuestionId('')
      expect(result).toBe('')
    })

    it('should handle ID with only "root_"', () => {
      const result = extractQuestionId('root_')
      expect(result).toBe('')
    })

    it('should handle ID with multiple "root_" occurrences', () => {
      const result = extractQuestionId('root_root_question')
      expect(result).toBe('root_question')
    })

    it('should handle numeric question ID', () => {
      const result = extractQuestionId('root_123')
      expect(result).toBe('123')
    })

    it('should handle question ID with special characters', () => {
      const result = extractQuestionId('root_question-1@test')
      expect(result).toBe('question-1@test')
    })

    it('should handle question ID with dots', () => {
      const result = extractQuestionId('root_question.1.2')
      expect(result).toBe('question.1.2')
    })

    it('should handle question ID with spaces', () => {
      const result = extractQuestionId('root_question 1')
      expect(result).toBe('question 1')
    })

    it('should handle very long question ID', () => {
      const longId = 'a'.repeat(1000)
      const result = extractQuestionId(`root_${longId}`)
      expect(result).toBe(longId)
    })

    it('should handle question ID with unicode', () => {
      const result = extractQuestionId('root_问题1')
      expect(result).toBe('问题1')
    })

    it('should handle nested path structure', () => {
      const result = extractQuestionId('root_section1_subsection2_question3')
      expect(result).toBe('section1_subsection2_question3')
    })

    it('should handle camelCase question ID', () => {
      const result = extractQuestionId('root_myQuestionId')
      expect(result).toBe('myQuestionId')
    })

    it('should handle UPPERCASE question ID', () => {
      const result = extractQuestionId('root_QUESTION_ID')
      expect(result).toBe('QUESTION_ID')
    })
  })

  describe('isValueEmpty', () => {
    it('should return true for undefined', () => {
      const result = isValueEmpty(undefined)
      expect(result).toBe(true)
    })

    it('should return true for null', () => {
      const result = isValueEmpty(null)
      expect(result).toBe(true)
    })

    it('should return true for empty string', () => {
      const result = isValueEmpty('')
      expect(result).toBe(true)
    })

    it('should return false for non-empty string', () => {
      const result = isValueEmpty('test')
      expect(result).toBe(false)
    })

    it('should return false for string with space', () => {
      const result = isValueEmpty(' ')
      expect(result).toBe(false)
    })

    it('should return false for number 0', () => {
      const result = isValueEmpty(0)
      expect(result).toBe(false)
    })

    it('should return false for positive number', () => {
      const result = isValueEmpty(123)
      expect(result).toBe(false)
    })

    it('should return false for negative number', () => {
      const result = isValueEmpty(-123)
      expect(result).toBe(false)
    })

    it('should return false for boolean true', () => {
      const result = isValueEmpty(true)
      expect(result).toBe(false)
    })

    it('should return false for boolean false', () => {
      const result = isValueEmpty(false)
      expect(result).toBe(false)
    })

    it('should return false for empty object', () => {
      const result = isValueEmpty({})
      expect(result).toBe(false)
    })

    it('should return false for object with properties', () => {
      const result = isValueEmpty({ name: 'test' })
      expect(result).toBe(false)
    })

    it('should return false for empty array', () => {
      const result = isValueEmpty([])
      expect(result).toBe(false)
    })

    it('should return false for non-empty array', () => {
      const result = isValueEmpty([1, 2, 3])
      expect(result).toBe(false)
    })

    it('should return false for function', () => {
      const result = isValueEmpty(() => {})
      expect(result).toBe(false)
    })

    it('should return false for Date object', () => {
      const result = isValueEmpty(new Date())
      expect(result).toBe(false)
    })

    it('should return false for string "0"', () => {
      const result = isValueEmpty('0')
      expect(result).toBe(false)
    })

    it('should return false for string "false"', () => {
      const result = isValueEmpty('false')
      expect(result).toBe(false)
    })

    it('should return false for string "null"', () => {
      const result = isValueEmpty('null')
      expect(result).toBe(false)
    })

    it('should return false for string "undefined"', () => {
      const result = isValueEmpty('undefined')
      expect(result).toBe(false)
    })

    it('should return false for NaN', () => {
      const result = isValueEmpty(NaN)
      expect(result).toBe(false)
    })

    it('should return false for Infinity', () => {
      const result = isValueEmpty(Infinity)
      expect(result).toBe(false)
    })

    it('should return false for Symbol', () => {
      const result = isValueEmpty(Symbol('test'))
      expect(result).toBe(false)
    })
  })

  describe('isArrayValueEmpty', () => {
    it('should return true for undefined', () => {
      const result = isArrayValueEmpty(undefined)
      expect(result).toBe(true)
    })

    it('should return true for null', () => {
      const result = isArrayValueEmpty(null)
      expect(result).toBe(true)
    })

    it('should return true for empty array', () => {
      const result = isArrayValueEmpty([])
      expect(result).toBe(true)
    })

    it('should return false for array with single element', () => {
      const result = isArrayValueEmpty([1])
      expect(result).toBe(false)
    })

    it('should return false for array with multiple elements', () => {
      const result = isArrayValueEmpty([1, 2, 3])
      expect(result).toBe(false)
    })

    it('should return false for array with undefined element', () => {
      const result = isArrayValueEmpty([undefined])
      expect(result).toBe(false)
    })

    it('should return false for array with null element', () => {
      const result = isArrayValueEmpty([null])
      expect(result).toBe(false)
    })

    it('should return false for array with empty string', () => {
      const result = isArrayValueEmpty([''])
      expect(result).toBe(false)
    })

    it('should return false for array with string elements', () => {
      const result = isArrayValueEmpty(['a', 'b', 'c'])
      expect(result).toBe(false)
    })

    it('should return false for array with object elements', () => {
      const result = isArrayValueEmpty([{ id: 1 }, { id: 2 }])
      expect(result).toBe(false)
    })

    it('should return false for array with mixed types', () => {
      const result = isArrayValueEmpty([1, 'test', null, undefined, {}])
      expect(result).toBe(false)
    })

    it('should return true for empty string', () => {
      const result = isArrayValueEmpty('')
      expect(result).toBe(true)
    })

    it('should return true for number 0', () => {
      const result = isArrayValueEmpty(0)
      expect(result).toBe(true)
    })

    it('should return true for boolean false', () => {
      const result = isArrayValueEmpty(false)
      expect(result).toBe(true)
    })

    it('should return false for non-empty string', () => {
      const result = isArrayValueEmpty('test')
      expect(result).toBe(false)
    })

    it('should return false for positive number', () => {
      const result = isArrayValueEmpty(123)
      expect(result).toBe(false)
    })

    it('should return false for boolean true', () => {
      const result = isArrayValueEmpty(true)
      expect(result).toBe(false)
    })

    it('should return false for object', () => {
      const result = isArrayValueEmpty({ key: 'value' })
      expect(result).toBe(false)
    })

    it('should return false for empty object', () => {
      const result = isArrayValueEmpty({})
      expect(result).toBe(false)
    })

    it('should return false for nested array', () => {
      const result = isArrayValueEmpty([[]])
      expect(result).toBe(false)
    })

    it('should return false for array-like object with length', () => {
      const result = isArrayValueEmpty({ length: 0 })
      expect(result).toBe(false)
    })

    it('should return false for function', () => {
      const result = isArrayValueEmpty(() => {})
      expect(result).toBe(false)
    })

    it('should return false for Date object', () => {
      const result = isArrayValueEmpty(new Date())
      expect(result).toBe(false)
    })

    it('should return false for large array', () => {
      const result = isArrayValueEmpty(Array(1000).fill(1))
      expect(result).toBe(false)
    })

    it('should return false for sparse array', () => {
      const sparseArray = new Array(10)
      const result = isArrayValueEmpty(sparseArray)
      expect(result).toBe(false)
    })
  })
})
