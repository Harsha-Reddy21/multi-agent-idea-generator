import { act,renderHook } from '@testing-library/react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import { useFileUpload } from '../useFileUpload'

describe('useFileUpload', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockFile = (name: string, size: number, type = 'application/pdf'): File => {
    const file = new File(['a'], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }

  const createMockChangeEvent = (files: File[] | null): React.ChangeEvent<HTMLInputElement> => {
    const fileList = files
      ? ({
          length: files.length,
          item: (index: number) => files[index] || null,
          [Symbol.iterator]: function* () {
            for (let i = 0; i < files.length; i++) {
              yield files[i]
            }
          },
        } as unknown as FileList)
      : null

    return {
      target: {
        files: fileList,
        value: '',
      } as HTMLInputElement,
    } as React.ChangeEvent<HTMLInputElement>
  }

  describe('Initialization', () => {
    it('should initialize with empty uploadedFiles', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      expect(result.current.uploadedFiles).toEqual([])
    })

    it('should initialize with fileInputRef', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      expect(result.current.fileInputRef).toBeDefined()
      expect(result.current.fileInputRef.current).toBeNull()
    })

    it('should return handleFileChange function', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      expect(typeof result.current.handleFileChange).toBe('function')
    })

    it('should return handleDeleteFile function', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      expect(typeof result.current.handleDeleteFile).toBe('function')
    })

    it('should initialize correctly with multiple true', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      expect(result.current.uploadedFiles).toEqual([])
      expect(result.current.fileInputRef).toBeDefined()
    })

    it('should initialize correctly with multiple false', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      expect(result.current.uploadedFiles).toEqual([])
      expect(result.current.fileInputRef).toBeDefined()
    })
  })

  describe('handleFileChange - Single File Mode', () => {
    it('should upload single file', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1024 * 1024) // 1 MB
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(result.current.uploadedFiles[0].name).toBe('test.pdf')
      expect(result.current.uploadedFiles[0].size).toBe('1.00 MB')
      expect(result.current.uploadedFiles[0].file).toBe(file)
      expect(mockOnChange).toHaveBeenCalledWith(file)
    })

    it('should replace previous file when uploading new file', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('first.pdf', 1024 * 1024)
      const event1 = createMockChangeEvent([file1])

      act(() => {
        result.current.handleFileChange(event1)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(result.current.uploadedFiles[0].name).toBe('first.pdf')

      const file2 = createMockFile('second.pdf', 2 * 1024 * 1024)
      const event2 = createMockChangeEvent([file2])

      act(() => {
        result.current.handleFileChange(event2)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(result.current.uploadedFiles[0].name).toBe('second.pdf')
      expect(result.current.uploadedFiles[0].size).toBe('2.00 MB')
      expect(mockOnChange).toHaveBeenCalledWith(file2)
    })

    it('should handle file with decimal MB size', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1536 * 1024) // 1.5 MB
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].size).toBe('1.50 MB')
    })

    it('should handle very small file size', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('tiny.txt', 512) // 0.0005 MB
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].size).toBe('0.00 MB')
    })

    it('should handle very large file size', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('large.zip', 100 * 1024 * 1024) // 100 MB
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].size).toBe('100.00 MB')
    })

    it('should call onChange with undefined when no files selected', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const event = createMockChangeEvent(null)

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(mockOnChange).toHaveBeenCalledWith(undefined)
      expect(result.current.uploadedFiles).toEqual([])
    })

    it('should call onChange with undefined when empty file list', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const event = createMockChangeEvent([])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(mockOnChange).toHaveBeenCalledWith(undefined)
      expect(result.current.uploadedFiles).toEqual([])
    })

    it('should reset file input value after upload', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const mockInput = document.createElement('input')
      mockInput.type = 'file'
      result.current.fileInputRef.current = mockInput

      // Spy on the value setter
      const valueSetter = vi.fn()
      Object.defineProperty(mockInput, 'value', {
        set: valueSetter,
        get: () => '',
      })

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(valueSetter).toHaveBeenCalledWith('')
    })

    it('should handle file upload when fileInputRef is null', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      result.current.fileInputRef.current = null

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(mockOnChange).toHaveBeenCalledWith(file)
    })

    it('should handle file with special characters in name', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test file (1) [copy].pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].name).toBe('test file (1) [copy].pdf')
    })

    it('should handle file with unicode characters in name', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('测试文件.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].name).toBe('测试文件.pdf')
    })

    it('should handle different file types', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('image.png', 1024 * 1024, 'image/png')
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].name).toBe('image.png')
      expect(result.current.uploadedFiles[0].file.type).toBe('image/png')
    })
  })

  describe('handleFileChange - Multiple File Mode', () => {
    it('should reset file input value after upload', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const mockInput = document.createElement('input')
      mockInput.type = 'file'
      result.current.fileInputRef.current = mockInput

      // Spy on the value setter
      const valueSetter = vi.fn()
      Object.defineProperty(mockInput, 'value', {
        set: valueSetter,
        get: () => '',
      })

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(valueSetter).toHaveBeenCalledWith('')
    })

    it('should upload multiple files', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const event = createMockChangeEvent([file1, file2])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles).toHaveLength(2)
      expect(result.current.uploadedFiles[0].name).toBe('file1.pdf')
      expect(result.current.uploadedFiles[0].size).toBe('1.00 MB')
      expect(result.current.uploadedFiles[1].name).toBe('file2.pdf')
      expect(result.current.uploadedFiles[1].size).toBe('2.00 MB')
      expect(mockOnChange).toHaveBeenCalledWith([file1, file2])
    })

    it('should append new files to existing files', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const event1 = createMockChangeEvent([file1])

      act(() => {
        result.current.handleFileChange(event1)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)

      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const file3 = createMockFile('file3.pdf', 3 * 1024 * 1024)
      const event2 = createMockChangeEvent([file2, file3])

      act(() => {
        result.current.handleFileChange(event2)
      })

      expect(result.current.uploadedFiles).toHaveLength(3)
      expect(result.current.uploadedFiles[0].name).toBe('file1.pdf')
      expect(result.current.uploadedFiles[1].name).toBe('file2.pdf')
      expect(result.current.uploadedFiles[2].name).toBe('file3.pdf')
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.arrayContaining([file1, file2, file3])
      )
    })

    it('should call onChange with empty array when no files selected', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const event = createMockChangeEvent(null)

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(mockOnChange).toHaveBeenCalledWith([])
      expect(result.current.uploadedFiles).toEqual([])
    })

    it('should call onChange with empty array when empty file list', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const event = createMockChangeEvent([])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(mockOnChange).toHaveBeenCalledWith([])
      expect(result.current.uploadedFiles).toEqual([])
    })

    it('should handle many files', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const files = Array.from({ length: 10 }, (_, i) =>
        createMockFile(`file${i}.pdf`, (i + 1) * 1024 * 1024)
      )
      const event = createMockChangeEvent(files)

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles).toHaveLength(10)
      expect(mockOnChange).toHaveBeenCalledWith(files)
    })

    it('should preserve order of uploaded files', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('a.pdf', 1024 * 1024)
      const file2 = createMockFile('b.pdf', 2 * 1024 * 1024)
      const file3 = createMockFile('c.pdf', 3 * 1024 * 1024)
      const event = createMockChangeEvent([file1, file2, file3])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].name).toBe('a.pdf')
      expect(result.current.uploadedFiles[1].name).toBe('b.pdf')
      expect(result.current.uploadedFiles[2].name).toBe('c.pdf')
    })
  })

  describe('handleDeleteFile - Single File Mode', () => {
    it('should delete the only file', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(0)
      })

      expect(result.current.uploadedFiles).toHaveLength(0)
      expect(mockOnChange).toHaveBeenCalledWith(undefined)
    })

    it('should call onChange with undefined after deletion', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(0)
      })

      expect(mockOnChange).toHaveBeenCalledWith(undefined)
    })

    it('should handle delete with invalid index', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(5)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle delete with negative index', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(-1)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('handleDeleteFile - Multiple File Mode', () => {
    it('should delete specific file by index', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const file3 = createMockFile('file3.pdf', 3 * 1024 * 1024)
      const event = createMockChangeEvent([file1, file2, file3])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles).toHaveLength(3)
      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(1)
      })

      expect(result.current.uploadedFiles).toHaveLength(2)
      expect(result.current.uploadedFiles[0].name).toBe('file1.pdf')
      expect(result.current.uploadedFiles[1].name).toBe('file3.pdf')
      expect(mockOnChange).toHaveBeenCalledWith([file1, file3])
    })

    it('should delete first file', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const event = createMockChangeEvent([file1, file2])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(0)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(result.current.uploadedFiles[0].name).toBe('file2.pdf')
      expect(mockOnChange).toHaveBeenCalledWith([file2])
    })

    it('should delete last file', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const event = createMockChangeEvent([file1, file2])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(1)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(result.current.uploadedFiles[0].name).toBe('file1.pdf')
      expect(mockOnChange).toHaveBeenCalledWith([file1])
    })

    it('should delete all files one by one', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const event = createMockChangeEvent([file1, file2])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(0)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(mockOnChange).toHaveBeenCalledWith([file2])

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(0)
      })

      expect(result.current.uploadedFiles).toHaveLength(0)
      expect(mockOnChange).toHaveBeenCalledWith([])
    })

    it('should call onChange with empty array when last file is deleted', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(0)
      })

      expect(result.current.uploadedFiles).toHaveLength(0)
      expect(mockOnChange).toHaveBeenCalledWith([])
    })

    it('should handle delete with invalid index', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const event = createMockChangeEvent([file1, file2])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(10)
      })

      expect(result.current.uploadedFiles).toHaveLength(2)
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle delete with negative index', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const event = createMockChangeEvent([file1, file2])

      act(() => {
        result.current.handleFileChange(event)
      })

      mockOnChange.mockClear()

      act(() => {
        result.current.handleDeleteFile(-1)
      })

      expect(result.current.uploadedFiles).toHaveLength(2)
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete workflow: upload, delete, re-upload', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      // Upload initial files
      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const event1 = createMockChangeEvent([file1, file2])

      act(() => {
        result.current.handleFileChange(event1)
      })

      expect(result.current.uploadedFiles).toHaveLength(2)

      // Delete one file
      act(() => {
        result.current.handleDeleteFile(0)
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(result.current.uploadedFiles[0].name).toBe('file2.pdf')

      // Upload more files
      const file3 = createMockFile('file3.pdf', 3 * 1024 * 1024)
      const event2 = createMockChangeEvent([file3])

      act(() => {
        result.current.handleFileChange(event2)
      })

      expect(result.current.uploadedFiles).toHaveLength(2)
      expect(result.current.uploadedFiles[0].name).toBe('file2.pdf')
      expect(result.current.uploadedFiles[1].name).toBe('file3.pdf')
    })

    it('should maintain file reference integrity', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].file).toBe(file)
      expect(mockOnChange).toHaveBeenCalledWith(file)
    })

    it('should handle rapid file changes', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file1 = createMockFile('file1.pdf', 1024 * 1024)
      const file2 = createMockFile('file2.pdf', 2 * 1024 * 1024)
      const file3 = createMockFile('file3.pdf', 3 * 1024 * 1024)

      act(() => {
        result.current.handleFileChange(createMockChangeEvent([file1]))
        result.current.handleFileChange(createMockChangeEvent([file2]))
        result.current.handleFileChange(createMockChangeEvent([file3]))
      })

      expect(result.current.uploadedFiles).toHaveLength(1)
      expect(result.current.uploadedFiles[0].name).toBe('file3.pdf')
    })

    it('should switch between multiple modes correctly', () => {
      const { result: result1 } = renderHook(() =>
        useFileUpload({ multiple: false, onChange: mockOnChange })
      )

      const file = createMockFile('test.pdf', 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result1.current.handleFileChange(event)
      })

      expect(result1.current.uploadedFiles).toHaveLength(1)

      // Switching multiple prop requires new hook instance
      const { result: result2 } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const file2 = createMockFile('test2.pdf', 2 * 1024 * 1024)
      const event2 = createMockChangeEvent([file2])

      act(() => {
        result2.current.handleFileChange(event2)
      })

      expect(result2.current.uploadedFiles).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle file with zero size', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('empty.txt', 0)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].size).toBe('0.00 MB')
    })

    it('should handle file with very long name', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const longName = 'a'.repeat(255) + '.pdf'
      const file = createMockFile(longName, 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].name).toBe(longName)
    })

    it('should handle file size formatting edge cases', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      // 1.999 MB should round to 2.00 MB
      const file = createMockFile('test.pdf', 1.999 * 1024 * 1024)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].size).toMatch(/^\d+\.\d{2} MB$/)
    })

    it('should handle multiple delete operations', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      const files = [
        createMockFile('file1.pdf', 1024 * 1024),
        createMockFile('file2.pdf', 2 * 1024 * 1024),
        createMockFile('file3.pdf', 3 * 1024 * 1024),
        createMockFile('file4.pdf', 4 * 1024 * 1024),
      ]
      const event = createMockChangeEvent(files)

      act(() => {
        result.current.handleFileChange(event)
      })

      act(() => {
        result.current.handleDeleteFile(1)
      })

      act(() => {
        result.current.handleDeleteFile(1)
      })

      expect(result.current.uploadedFiles).toHaveLength(2)
      expect(result.current.uploadedFiles[0].name).toBe('file1.pdf')
      expect(result.current.uploadedFiles[1].name).toBe('file4.pdf')
    })

    it('should handle empty files array gracefully', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: true,
          onChange: mockOnChange,
        })
      )

      act(() => {
        result.current.handleDeleteFile(0)
      })

      expect(result.current.uploadedFiles).toEqual([])
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('formatFileSize Function', () => {
    it('should format file sizes correctly for various sizes', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const testCases = [
        { bytes: 0, expected: '0.00 MB' },
        { bytes: 1024, expected: '0.00 MB' },
        { bytes: 1024 * 1024, expected: '1.00 MB' },
        { bytes: 1.5 * 1024 * 1024, expected: '1.50 MB' },
        { bytes: 10 * 1024 * 1024, expected: '10.00 MB' },
        { bytes: 100 * 1024 * 1024, expected: '100.00 MB' },
        { bytes: 1024 * 1024 * 1024, expected: '1024.00 MB' },
      ]

      testCases.forEach(({ bytes, expected }) => {
        const file = createMockFile('test.pdf', bytes)
        const event = createMockChangeEvent([file])

        act(() => {
          result.current.handleFileChange(event)
        })

        expect(result.current.uploadedFiles[0].size).toBe(expected)
      })
    })

    it('should always format with 2 decimal places', () => {
      const { result } = renderHook(() =>
        useFileUpload({
          multiple: false,
          onChange: mockOnChange,
        })
      )

      const file = createMockFile('test.pdf', 1234567)
      const event = createMockChangeEvent([file])

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.uploadedFiles[0].size).toMatch(/^\d+\.\d{2} MB$/)
    })
  })
})
