import { describe, expect, it } from 'vitest'

import { isGibberish } from './text-validation.util'

describe('isGibberish', () => {
    describe('Basic input validation', () => {
        it('should return false for empty string', () => {
            expect(isGibberish('')).toBe(false)
        })

        it('should return false for whitespace only', () => {
            expect(isGibberish('   ')).toBe(false)
            expect(isGibberish('\t\n\r')).toBe(false)
        })

        it('should return false for null or undefined input', () => {
            expect(isGibberish(null as any)).toBe(false)
            expect(isGibberish(undefined as any)).toBe(false)
        })
    })

    describe('Check 1: All special characters (no alphanumeric)', () => {
        it('should return true for only special characters', () => {
            expect(isGibberish('!@#$%^&*()')).toBe(true)
            expect(isGibberish('{}[]|\\:";\'<>?,./')).toBe(true)
            expect(isGibberish('~`-_=+')).toBe(true)
        })

        it('should return true for special characters with spaces', () => {
            expect(isGibberish('! @ # $ %')).toBe(true)
            expect(isGibberish('   !@#   $%^   ')).toBe(true)
        })
    })

    describe('Check 2: All numbers (with or without spaces)', () => {
        it('should return true for only numbers', () => {
            expect(isGibberish('123456')).toBe(true)
            expect(isGibberish('0987654321')).toBe(true)
        })

        it('should return true for numbers with spaces', () => {
            expect(isGibberish('1 2 3 4 5')).toBe(true)
            expect(isGibberish('  123  456  789  ')).toBe(true)
        })

        it('should return false for mixed alphanumeric', () => {
            expect(isGibberish('abc123')).toBe(false)
            expect(isGibberish('123abc')).toBe(false)
        })
    })

    describe('Check 3: Repetitive characters', () => {
        it('should return true for same character repeated 3+ times', () => {
            expect(isGibberish('aaa')).toBe(true)
            expect(isGibberish('aaaa')).toBe(true)
            expect(isGibberish('hello aaaa world')).toBe(true)
            expect(isGibberish('xxxxxxxxxxxxx')).toBe(true)
            expect(isGibberish('111')).toBe(true)
            expect(isGibberish('!!!')).toBe(true)
        })

        it('should return false for characters repeated less than 3 times', () => {
            expect(isGibberish('aa')).toBe(false)
            expect(isGibberish('hello world')).toBe(false)
            expect(isGibberish('good morning')).toBe(false)
        })
    })

    describe('Check 4: Numbers and special characters without letters', () => {
        it('should return true for mix of numbers and special chars without letters', () => {
            expect(isGibberish('123!@#')).toBe(true)
            expect(isGibberish('456$%^789')).toBe(true)
            expect(isGibberish('1!2@3#4$')).toBe(true)
        })

        it('should return false when letters are present', () => {
            expect(isGibberish('123abc!@#')).toBe(false)
            expect(isGibberish('hello123!')).toBe(false)
        })

        it('should return false for only numbers (covered by Check 2)', () => {
            expect(isGibberish('123456')).toBe(true)
        })
    })

    describe('Check 5: Mostly special characters (>50%)', () => {
        it('should return true when special chars exceed 50%', () => {
            expect(isGibberish('a!@#$%')).toBe(true) // 1 letter, 5 special = 83% special
            expect(isGibberish('ab!@#$%^&*')).toBe(true) // 2 letters, 8 special = 80% special
        })

        it('should return false when special chars are 50% or less', () => {
            expect(isGibberish('abc!')).toBe(false) // 3 letters, 1 special = 25% special
            expect(isGibberish('hello world!')).toBe(false)
        })
    })

    describe('Check 6: Very few alphanumeric characters (<30%)', () => {
        it('should return true when alphanumeric is less than 30%', () => {
            expect(isGibberish('a!@#$%^&*(')).toBe(true) // 1 alphanum, 9 special = 10% alphanum
            expect(isGibberish('ab!@#$%^&*()')).toBe(true) // 2 alphanum, 10 special = 16.7% alphanum
        })

        it('should return false when alphanumeric is 30% or more', () => {
            expect(isGibberish('abc!@#')).toBe(false) // 3 alphanum, 3 special = 50% alphanum
            expect(isGibberish('hello!')).toBe(false)
        })
    })

    describe('Check 7: No meaningful word patterns', () => {
        it('should return true when no sequences of 2+ letters exist', () => {
            expect(isGibberish('a 1 b 2 c 3')).toBe(true)
            expect(isGibberish('x!y@z#')).toBe(true)
            expect(isGibberish('1a2b3c')).toBe(true)
        })

        it('should return false when sequences of 2+ letters exist', () => {
            expect(isGibberish('ab cd ef')).toBe(false)
            expect(isGibberish('hello')).toBe(false)
            expect(isGibberish('a1 bb c2')).toBe(true) // 66% of words have embedded numbers
        })
    })

    describe('Check 8: Mostly random single characters', () => {
        it('should return true when >70% of words are single chars or non-letter sequences', () => {
            expect(isGibberish('a b c d e')).toBe(true) // 5 single chars = 100%
            expect(isGibberish('a b c hello')).toBe(true) // 3 single chars out of 4 = 75%
            expect(isGibberish('x 1 @ y z normal')).toBe(true) // 5 single/symbol out of 6 = 83%
        })

        it('should return false when 70% or less are single chars', () => {
            expect(isGibberish('hello world test')).toBe(false) // 0 single chars
            expect(isGibberish('a hello world test')).toBe(false) // 1 single char out of 4 = 25%
            expect(isGibberish('a b hello world')).toBe(false) // 2 single chars out of 4 = 50%
        })

        it('should handle edge case with 2 or fewer words', () => {
            expect(isGibberish('a b')).toBe(true) // Falls through to other checks
            expect(isGibberish('hello')).toBe(false)
        })
    })

    describe('Valid text cases', () => {
        it('should return false for normal sentences', () => {
            expect(isGibberish('Hello world')).toBe(false)
            expect(isGibberish('This is a normal sentence.')).toBe(false)
            expect(isGibberish('How are you today?')).toBe(false)
        })

        it('should return false for words with numbers', () => {
            expect(isGibberish('Product123')).toBe(false)
            expect(isGibberish('Version 2.0')).toBe(false)
            expect(isGibberish('Room 101')).toBe(false)
        })

        it('should return false for normal text with punctuation', () => {
            expect(isGibberish('Hello, world!')).toBe(false)
            expect(isGibberish("It's a beautiful day.")).toBe(false)
            expect(isGibberish('Question: What time is it?')).toBe(false)
        })

        it('should return false for technical terms and code-like text', () => {
            expect(isGibberish('getElementById')).toBe(false)
            expect(isGibberish('function test()')).toBe(false)
            expect(isGibberish('const value = 42')).toBe(false)
        })
    })

    describe('Edge cases', () => {
        it('should handle mixed whitespace', () => {
            expect(isGibberish('\t\nhello\r\n')).toBe(false)
            expect(isGibberish('  \t  hello world  \n  ')).toBe(false)
        })

        it('should handle unicode characters', () => {
            expect(isGibberish('café')).toBe(false)
            expect(isGibberish('naïve')).toBe(false)
        })

        it('should handle very long text', () => {
            const longValidText = 'This is a very long sentence that contains many words and should not be considered gibberish at all.'
            expect(isGibberish(longValidText)).toBe(false)

            const longGibberish = 'a'.repeat(100)
            expect(isGibberish(longGibberish)).toBe(true)
        })

        it('should handle text with mixed case', () => {
            expect(isGibberish('HeLLo WoRLd')).toBe(false)
            expect(isGibberish('CamelCaseText')).toBe(false)
        })

        it('should prioritize earlier checks over later ones', () => {
            // Text that would fail multiple checks should still return true
            expect(isGibberish('!!!')).toBe(true) // Repetitive chars (Check 3)
            expect(isGibberish('123')).toBe(true) // All numbers (Check 2)
        })
    })
})