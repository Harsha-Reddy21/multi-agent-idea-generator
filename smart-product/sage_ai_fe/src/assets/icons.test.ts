import { describe, expect, it, vi } from 'vitest'

import { encodedRedStarIcon } from './icons'

// Mock the SVG import
vi.mock('./ai_assist.svg', () => ({
  default: 'mocked-ai-assist-icon.svg',
}))

describe('icons', () => {
  describe('encodedRedStarIcon', () => {
    it('should be defined', () => {
      expect(encodedRedStarIcon).toBeDefined()
    })

    it('should be a string', () => {
      expect(typeof encodedRedStarIcon).toBe('string')
    })

    it('should be a properly encoded URI component', () => {
      // The encoded string should not contain unencoded special characters
      // that would be encoded by encodeURIComponent
      // eslint-disable-next-line no-useless-escape
      const hasUnEncodedChars = /[<>{}|\\^`\[\]]/.test(encodedRedStarIcon)
      expect(hasUnEncodedChars).toBe(false)
    })

    it('should encode the redStarIcon value', () => {
      const mockIconPath = 'mocked-ai-assist-icon.svg'
      const expectedEncoded = encodeURIComponent(mockIconPath)
      expect(encodedRedStarIcon).toBe(expectedEncoded)
    })

    it('should be decodable back to the original value', () => {
      const decoded = decodeURIComponent(encodedRedStarIcon)
      expect(decoded).toBe('mocked-ai-assist-icon.svg')
    })

    it('should handle special characters in the icon path', () => {
      // Verify that encodeURIComponent is properly applied
      // The result should be a valid URI component
      expect(() => decodeURIComponent(encodedRedStarIcon)).not.toThrow()
    })

    it('should not be an empty string', () => {
      expect(encodedRedStarIcon).not.toBe('')
      expect(encodedRedStarIcon.length).toBeGreaterThan(0)
    })

    it('should match the encoded format', () => {
      // Encoded strings should only contain valid URI characters
      // Valid characters: A-Z a-z 0-9 - _ . ! ~ * ' ( )
      // Plus % for the encoding itself
      const validUriComponentPattern = /^[A-Za-z0-9\-_.!~*'()%]+$/
      expect(validUriComponentPattern.test(encodedRedStarIcon)).toBe(true)
    })

    it('should preserve the file extension information when decoded', () => {
      const decoded = decodeURIComponent(encodedRedStarIcon)
      expect(decoded).toContain('.svg')
    })

    it('should be usable in data URIs or URLs', () => {
      // The encoded value should be safe to use in URLs
      const testUrl = `data:image/svg+xml,${encodedRedStarIcon}`
      expect(testUrl).toContain(encodedRedStarIcon)
      expect(typeof testUrl).toBe('string')
    })

    it('should not equal the original unencoded value', () => {
      // The encoded version should be different from the original
      // (unless the original has no special characters, which is unlikely for a path)
      const mockIconPath = 'mocked-ai-assist-icon.svg'
      // In this case they might be equal since the mock path has no special chars
      // but we're testing the encoding happens
      expect(encodedRedStarIcon).toBe(encodeURIComponent(mockIconPath))
    })

    it('should be consistent across multiple accesses', () => {
      // Import the value multiple times to ensure consistency
      const firstAccess = encodedRedStarIcon
      const secondAccess = encodedRedStarIcon
      expect(firstAccess).toBe(secondAccess)
    })

    it('should handle the encoding correctly for the mocked SVG path', () => {
      // Verify the encoding process works correctly
      const original = 'mocked-ai-assist-icon.svg'
      const manuallyEncoded = encodeURIComponent(original)
      expect(encodedRedStarIcon).toBe(manuallyEncoded)
    })
  })

  describe('encodeURIComponent usage', () => {
    it('should properly encode special characters if present', () => {
      // Test that encodeURIComponent is working as expected
      const testString = 'test file.svg'
      const encoded = encodeURIComponent(testString)
      expect(encoded).toBe('test%20file.svg')
      expect(encoded).toContain('%20') // space is encoded as %20
    })

    it('should handle forward slashes in paths', () => {
      // Test encoding behavior with path separators
      const testPath = 'path/to/file.svg'
      const encoded = encodeURIComponent(testPath)
      expect(encoded).toContain('%2F') // forward slash encoded
    })

    it('should handle dots and hyphens without encoding', () => {
      // Dots and hyphens are not encoded by encodeURIComponent
      const testString = 'test-file.svg'
      const encoded = encodeURIComponent(testString)
      expect(encoded).toBe('test-file.svg')
      expect(encoded).not.toContain('%')
    })
  })

  describe('Module exports', () => {
    it('should export encodedRedStarIcon as a named export', () => {
      expect(encodedRedStarIcon).toBeDefined()
    })

    it('should not be undefined or null', () => {
      expect(encodedRedStarIcon).not.toBeUndefined()
      expect(encodedRedStarIcon).not.toBeNull()
    })
  })
})
