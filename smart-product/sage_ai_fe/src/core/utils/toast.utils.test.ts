import { describe, expect, it, vi } from 'vitest'

import { showToast } from './toast.utils'

describe('toast.utils', () => {
  describe('showToast', () => {
    it('should call addToast with default values', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Test message',
      })

      expect(mockAddToast).toHaveBeenCalledTimes(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Test message',
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should call addToast with custom variant', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Error message',
        variant: 'error',
      })

      expect(mockAddToast).toHaveBeenCalledTimes(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Error message',
        variant: 'error',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should call addToast with warning variant', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Warning message',
        variant: 'warning',
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Warning message',
        variant: 'warning',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should call addToast with info variant', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Info message',
        variant: 'info',
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Info message',
        variant: 'info',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should call addToast with custom timeout', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Custom timeout message',
        timeout: 3000,
      })

      expect(mockAddToast).toHaveBeenCalledTimes(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Custom timeout message',
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 3000,
        autoDismiss: true,
      })
    })

    it('should call addToast with custom variant and timeout', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Custom message',
        variant: 'error',
        timeout: 10000,
      })

      expect(mockAddToast).toHaveBeenCalledTimes(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Custom message',
        variant: 'error',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 10000,
        autoDismiss: true,
      })
    })

    it('should handle empty message string', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: '',
      })

      expect(mockAddToast).toHaveBeenCalledTimes(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: '',
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should handle very long message strings', () => {
      const mockAddToast = vi.fn()
      const longMessage = 'A'.repeat(1000)

      showToast({
        addToast: mockAddToast,
        message: longMessage,
      })

      expect(mockAddToast).toHaveBeenCalledTimes(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: longMessage,
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should handle zero timeout', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Zero timeout message',
        timeout: 0,
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Zero timeout message',
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 0,
        autoDismiss: true,
      })
    })

    it('should always set position to top', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Position test',
      })

      expect(mockAddToast.mock.calls[0][0].position).toBe('top')
    })

    it('should always set align to center', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Align test',
      })

      expect(mockAddToast.mock.calls[0][0].align).toBe('center')
    })

    it('should always set dismissible to true', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Dismissible test',
      })

      expect(mockAddToast.mock.calls[0][0].dismissible).toBe(true)
    })

    it('should always set autoDismiss to true', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'AutoDismiss test',
      })

      expect(mockAddToast.mock.calls[0][0].autoDismiss).toBe(true)
    })

    it('should handle special characters in message', () => {
      const mockAddToast = vi.fn()
      const specialMessage = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`'

      showToast({
        addToast: mockAddToast,
        message: specialMessage,
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: specialMessage,
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should handle message with HTML tags', () => {
      const mockAddToast = vi.fn()
      const htmlMessage = '<div>Test <strong>message</strong></div>'

      showToast({
        addToast: mockAddToast,
        message: htmlMessage,
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: htmlMessage,
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should handle message with newlines', () => {
      const mockAddToast = vi.fn()
      const multilineMessage = 'Line 1\nLine 2\nLine 3'

      showToast({
        addToast: mockAddToast,
        message: multilineMessage,
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: multilineMessage,
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should handle message with Unicode characters', () => {
      const mockAddToast = vi.fn()
      const unicodeMessage = '✓ Success! 🎉 测试'

      showToast({
        addToast: mockAddToast,
        message: unicodeMessage,
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: unicodeMessage,
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 6000,
        autoDismiss: true,
      })
    })

    it('should handle large timeout values', () => {
      const mockAddToast = vi.fn()

      showToast({
        addToast: mockAddToast,
        message: 'Large timeout',
        timeout: 999999,
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        toastMessage: 'Large timeout',
        variant: 'success',
        position: 'top',
        align: 'center',
        dismissible: true,
        timeout: 999999,
        autoDismiss: true,
      })
    })
  })
})
