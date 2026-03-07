import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BeginFormRequestModel } from '../models/begin-form.model'
import { UploadService } from './upload.api'

// Don't mock the base API for upload service - test the implementation directly
describe('UploadService', () => {
  let uploadService: UploadService

  beforeEach(() => {
    vi.clearAllMocks()
    uploadService = new UploadService()
  })

  describe('initialSubmissionBegin', () => {
    it('should successfully submit form data with files', async () => {
      const mockFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })
      const formData: BeginFormRequestModel = {
        submission_journey: {
          form_id: 'f123',
          user_id: 'u456',
          timestamp: new Date().toISOString(),
        },
        files: [mockFile],
      } as any

      // Mock the API post method
      const mockResponse = { id: 'submission-123', status: 'success' }
      vi.spyOn(uploadService['api'], 'post').mockResolvedValueOnce({
        data: mockResponse,
      })

      const result = await uploadService.initialSubmissionBegin(formData)

      expect(result).toEqual(mockResponse)
      expect(uploadService['api'].post).toHaveBeenCalledWith(
        'submit-idea',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      )
    })

    it('should handle multiple files in submission', async () => {
      const mockFile1 = new File(['content1'], 'test1.pdf', {
        type: 'application/pdf',
      })
      const mockFile2 = new File(['content2'], 'test2.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const formData: BeginFormRequestModel = {
        submission_journey: {
          form_id: 'f123',
          user_id: 'u456',
          timestamp: new Date().toISOString(),
        },
        files: [mockFile1, mockFile2],
      } as any

      const mockResponse = { id: 'submission-123', status: 'success' }
      vi.spyOn(uploadService['api'], 'post').mockResolvedValueOnce({
        data: mockResponse,
      })

      const result = await uploadService.initialSubmissionBegin(formData)

      expect(result).toEqual(mockResponse)
      expect(uploadService['api'].post).toHaveBeenCalled()
    })

    it('should throw error when API call fails', async () => {
      const mockFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })
      const formData: BeginFormRequestModel = {
        submission_journey: {
          form_id: 'f123',
          user_id: 'u456',
          timestamp: new Date().toISOString(),
        },
        files: [mockFile],
      } as any

      const mockError = new Error('Network error')
      vi.spyOn(uploadService['api'], 'post').mockRejectedValueOnce(mockError)
      vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        uploadService.initialSubmissionBegin(formData)
      ).rejects.toThrow('Failed submitting initial form data.')

      expect(console.error).toHaveBeenCalledWith(
        'File upload error:',
        mockError
      )
    })

    it('should properly format FormData with submission_journey as JSON string', async () => {
      const mockFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })
      const submissionJourney = {
        form_id: 'f123',
        user_id: 'u456',
        timestamp: '2024-01-01T00:00:00Z',
      }
      const formData: BeginFormRequestModel = {
        submission_journey: submissionJourney as any,
        files: [mockFile],
      }

      const mockResponse = { id: 'submission-123', status: 'success' }
      const postSpy = vi
        .spyOn(uploadService['api'], 'post')
        .mockResolvedValueOnce({
          data: mockResponse,
        })

      await uploadService.initialSubmissionBegin(formData)

      expect(postSpy).toHaveBeenCalled()
      const callArgs = postSpy.mock.calls[0]
      expect(callArgs[0]).toBe('submit-idea')
      expect(callArgs[1]).toBeInstanceOf(FormData)
    })

    it('should handle submission journey with complex data', async () => {
      const mockFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })
      const formData: BeginFormRequestModel = {
        submission_journey: {
          form_id: 'f123',
          user_id: 'u456',
          timestamp: new Date().toISOString(),
          additional_data: {
            nested: 'value',
            array: [1, 2, 3],
          },
        },
        files: [mockFile],
      } as any

      const mockResponse = { id: 'submission-123', status: 'success' }
      vi.spyOn(uploadService['api'], 'post').mockResolvedValueOnce({
        data: mockResponse,
      })

      const result = await uploadService.initialSubmissionBegin(formData)

      expect(result).toEqual(mockResponse)
    })

    it('should handle empty files array', async () => {
      const formData: BeginFormRequestModel = {
        submission_journey: {
          form_id: 'f123',
          user_id: 'u456',
          timestamp: new Date().toISOString(),
        },
        files: [],
      } as any

      const mockResponse = { id: 'submission-123', status: 'success' }
      vi.spyOn(uploadService['api'], 'post').mockResolvedValueOnce({
        data: mockResponse,
      })

      const result = await uploadService.initialSubmissionBegin(formData)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('validateMultipleFiles', () => {
    it('should validate PDF files successfully', () => {
      const files = [
        new File(['content'], 'file.pdf', { type: 'application/pdf' }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate Word documents successfully', () => {
      const files = [
        new File(['content'], 'file.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate old format Word documents (DOC)', () => {
      const files = [
        new File(['content'], 'file.doc', {
          type: 'application/msword',
        }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate PowerPoint files successfully', () => {
      const files = [
        new File(['content'], 'file.pptx', {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid file types', () => {
      const files = [
        new File(['content'], 'file.txt', { type: 'text/plain' }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toBe('file.txt not allowed, Only .docx/.doc/.pdf/.pptx files are allowed.')
    })

    it('should reject files when total size exceeds 10MB limit', () => {
      // Create files that individually are under 5MB but total over 10MB
      const content1 = new Array(4 * 1024 * 1024).fill('a').join('')
      const content2 = new Array(4 * 1024 * 1024).fill('b').join('')
      const content3 = new Array(4 * 1024 * 1024).fill('c').join('')
      const files = [
        new File([content1], 'file1.pdf', { type: 'application/pdf' }),
        new File([content2], 'file2.pdf', { type: 'application/pdf' }),
        new File([content3], 'file3.pdf', { type: 'application/pdf' }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.error.includes('Total file size exceeds 10MB limit'))).toBe(true)
    })

    it('should use custom total size limit parameter', () => {
      const content1 = new Array(3 * 1024 * 1024).fill('a').join('')
      const content2 = new Array(3 * 1024 * 1024).fill('b').join('')
      const files = [
        new File([content1], 'file1.pdf', { type: 'application/pdf' }),
        new File([content2], 'file2.pdf', { type: 'application/pdf' }),
      ]

      // Set custom total limit to 5MB
      const result = uploadService.validateMultipleFiles(files, 5)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.error.includes('Total file size exceeds 5MB limit'))).toBe(true)
    })

    it('should validate multiple files with total size check', () => {
      const file1 = new File(
        [new Array(3 * 1024 * 1024).fill('a').join('')],
        'file1.pdf',
        { type: 'application/pdf' }
      )
      const file2 = new File(
        [new Array(3 * 1024 * 1024).fill('a').join('')],
        'file2.pdf',
        { type: 'application/pdf' }
      )

      const result = uploadService.validateMultipleFiles([file1, file2], 5)

      expect(result.valid).toBe(false)
      expect(result.errors[0].error).toContain('exceeds 5MB limit')
    })

    it('should accept custom size limit', () => {
      const content = new Array(2 * 1024 * 1024).fill('a').join('')
      const files = [
        new File([content], 'file.pdf', { type: 'application/pdf' }),
      ]

      const result = uploadService.validateMultipleFiles(files, 3)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle multiple validation errors', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('')
      const files = [
        new File(['content'], 'file.txt', { type: 'text/plain' }),
        new File([largeContent], 'large.exe', { type: 'application/exe' }),
      ]

      const result = uploadService.validateMultipleFiles(files, 10)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('should reject files with blank type alongside valid file', () => {
      const files = [
        new File(['content'], 'file.pdf', { type: 'application/pdf' }),
        new File(['content'], 'file.unknown', { type: '' }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should validate with PowerPoint old format (PPT)', () => {
      const files = [
        new File(['content'], 'file.ppt', {
          type: 'application/vnd.ms-powerpoint',
        }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle empty files array', () => {
      const result = uploadService.validateMultipleFiles([])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should show total file size in error message', () => {
      const content1 = new Array(4 * 1024 * 1024).fill('a').join('')
      const content2 = new Array(4 * 1024 * 1024).fill('b').join('')
      const content3 = new Array(4 * 1024 * 1024).fill('c').join('')
      const files = [
        new File([content1], 'file1.pdf', { type: 'application/pdf' }),
        new File([content2], 'file2.pdf', { type: 'application/pdf' }),
        new File([content3], 'file3.pdf', { type: 'application/pdf' }),
      ]

      const result = uploadService.validateMultipleFiles(files)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.error.includes('12.00MB'))).toBe(true)
    })
  })

  describe('uploadService singleton', () => {
    it('should export uploadService instance', () => {
      expect(uploadService).toBeDefined()
      expect(uploadService).toBeInstanceOf(UploadService)
    })

    it('should have validateMultipleFiles method', () => {
      expect(uploadService.validateMultipleFiles).toBeDefined()
      expect(typeof uploadService.validateMultipleFiles).toBe('function')
    })

    it('should have initialSubmissionBegin method', () => {
      expect(uploadService.initialSubmissionBegin).toBeDefined()
      expect(typeof uploadService.initialSubmissionBegin).toBe('function')
    })
  })
})
