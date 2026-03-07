/**
 * Checks if the provided text appears to be gibberish or meaningless input
 * @param text - The text to validate
 * @returns true if the text is considered gibberish, false otherwise
 */

// Constants for gibberish detection
const MIN_VOWEL_RATIO = 0.15 // Minimum vowel ratio for meaningful text (15%)
const MAX_VOWEL_RATIO = 0.7 // Maximum vowel ratio for meaningful text (70%)
const MIN_ALPHANUMERIC_RATIO = 0.3 // Minimum alphanumeric content ratio (30%)
const MAX_SPECIAL_CHAR_RATIO = 0.5 // Maximum special character ratio (50%)
const MAX_RANDOM_WORDS_RATIO = 0.7 // Maximum ratio of single-char/random words (70%)
const MAX_EMBEDDED_NUMBERS_RATIO = 0.3 // Maximum ratio of words with embedded numbers (30%)

// Regex patterns
const ALPHANUMERIC_PATTERN = /[a-zA-Z0-9]/
const DIGITS_ONLY_PATTERN = /^[\d\s]+$/
const DIGIT_PATTERN = /\d/
const REPETITIVE_CHAR_PATTERN = /(.)\1{2,}/
const NON_ALPHANUMERIC_PATTERN = /[^a-zA-Z0-9\s]/
const LETTER_SEQUENCE_PATTERN = /[a-zA-Z]+/g
const MIN_LETTER_SEQUENCE_PATTERN = /[a-zA-Z]{2,}/
const VOWEL_PATTERN = /[aeiouAEIOU]/g
const EXCESSIVE_CONSONANTS_PATTERN = /[^aeiouAEIOU]{5,}/i

export const isGibberish = (text: string): boolean => {
  if (!text || text.trim().length === 0) return false

  const trimmed = text.trim()

  // Check 1: All special characters (no alphanumeric content)
  if (!ALPHANUMERIC_PATTERN.test(trimmed)) {
    return true
  }

  // Check 2: All numbers (with or without spaces)
  if (DIGITS_ONLY_PATTERN.test(trimmed) && DIGIT_PATTERN.test(trimmed)) {
    return true
  }

  // Check 3: Repetitive characters (same char repeated 3+ times in a row)
  if (REPETITIVE_CHAR_PATTERN.test(trimmed)) {
    return true
  }

  // Check 4: Random mix of numbers and special characters (no actual letters)
  const hasLetters = /[a-zA-Z]/.test(trimmed)
  const hasNumbers = DIGIT_PATTERN.test(trimmed)
  const hasSpecialChars = NON_ALPHANUMERIC_PATTERN.test(trimmed)

  if (!hasLetters && hasNumbers && hasSpecialChars) {
    return true
  }

  // Check 5: Mostly special characters (more than 50% special chars, excluding spaces)
  const nonSpaceText = trimmed.replace(/\s/g, '')
  const specialCharCount = (nonSpaceText.match(/[^a-zA-Z0-9]/g) || []).length
  const specialCharRatio =
    nonSpaceText.length > 0 ? specialCharCount / nonSpaceText.length : 0
  if (specialCharRatio > MAX_SPECIAL_CHAR_RATIO) {
    return true
  }

  // Check 6: Very few actual words (less than 30% alphanumeric, excluding spaces for ratio calculation)
  const alphanumericCount = (nonSpaceText.match(/[a-zA-Z0-9]/g) || []).length
  const alphanumericRatio =
    nonSpaceText.length > 0 ? alphanumericCount / nonSpaceText.length : 0
  if (alphanumericRatio < MIN_ALPHANUMERIC_RATIO) {
    return true
  }

  // Check 7: No meaningful word patterns (no sequences of 2+ letters)
  if (!MIN_LETTER_SEQUENCE_PATTERN.test(trimmed)) {
    return true
  }

  // Check 8: Mostly random single characters separated by spaces
  const words = trimmed.split(/\s+/).filter(word => word.length > 0)
  if (words.length > 2) {
    const singleCharOrSymbolWords = words.filter(
      word => word.length === 1 || !MIN_LETTER_SEQUENCE_PATTERN.test(word)
    )
    const randomWordsRatio = singleCharOrSymbolWords.length / words.length
    if (randomWordsRatio > MAX_RANDOM_WORDS_RATIO) {
      return true
    }
  }

  // Check 9: Words with embedded numbers or heavy number/letter mixing
  // Check each word individually for gibberish patterns
  if (hasLetters && hasNumbers) {
    const words = trimmed.split(/\s+/).filter(word => word.length > 0)

    // Count how many words have numbers embedded in them
    const wordsWithEmbeddedNumbers = words.filter(word => {
      const hasLettersInWord = /[a-zA-Z]/.test(word)
      const hasNumbersInWord = DIGIT_PATTERN.test(word)
      return hasLettersInWord && hasNumbersInWord
    })

    // If more than 30% of words have numbers embedded, it's likely gibberish
    if (
      words.length > 2 &&
      wordsWithEmbeddedNumbers.length / words.length >
        MAX_EMBEDDED_NUMBERS_RATIO
    ) {
      return true
    }

    // Extract all letter sequences (ignoring numbers and special chars)
    const letterSequences = trimmed.match(LETTER_SEQUENCE_PATTERN) || []

    if (letterSequences.length > 0) {
      // Check if there's at least one meaningful letter sequence
      const hasAnyMeaningfulSequence = letterSequences.some(seq => {
        // Very short sequences (1-2 chars) are not meaningful on their own
        if (seq.length <= 2) return false

        const vowelCount = (seq.match(VOWEL_PATTERN) || []).length
        const vowelRatio = vowelCount / seq.length

        // Real words typically have at least 15% vowels and no more than 70%
        // Also check for excessive consonant clusters (5+ in a row)
        const hasExcessiveConsonants = EXCESSIVE_CONSONANTS_PATTERN.test(seq)

        // A sequence is meaningful if it has good vowel ratio and no excessive consonants
        return (
          vowelRatio >= MIN_VOWEL_RATIO &&
          vowelRatio <= MAX_VOWEL_RATIO &&
          !hasExcessiveConsonants
        )
      })

      // If NO meaningful sequences exist AND text is long enough, it's gibberish
      if (!hasAnyMeaningfulSequence && trimmed.length > 10) {
        return true
      }
    }
  }

  return false
}
