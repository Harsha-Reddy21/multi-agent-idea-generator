import { useRef, useState } from 'react'

interface UploadedFile {
  name: string
  size: string
  file: File
}

interface UseFileUploadOptions {
  multiple: boolean
  onChange: (value: File | File[] | undefined) => void
}

interface UseFileUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  uploadedFiles: UploadedFile[]
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFiles: (files: File[] | FileList) => void
  handleDeleteFile: (indexToDelete: number) => void
}

const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

export const useFileUpload = ({
  multiple,
  onChange,
}: UseFileUploadOptions): UseFileUploadReturn => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) {
      onChange(multiple ? [] : undefined)
      setUploadedFiles([])
      return
    }

    const fileArray = Array.from(selectedFiles)

    // Store file metadata for display (names + size + File object)
    const newFiles = fileArray.map(f => ({
      name: f.name,
      size: formatFileSize(f.size),
      file: f,
    }))

    if (multiple) {
      // Append to existing files for multiple mode
      const updatedFiles = [...uploadedFiles, ...newFiles]
      setUploadedFiles(updatedFiles)
      onChange(updatedFiles.map(f => f.file))
    } else {
      // Replace with single file
      setUploadedFiles(newFiles)
      onChange(newFiles[0].file)
    }

    // Reset the input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFiles = (files: File[] | FileList) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files)

    if (!fileArray || fileArray.length === 0) {
      onChange(multiple ? [] : undefined)
      setUploadedFiles([])
      return
    }

    const newFiles = fileArray.map(f => ({
      name: f.name,
      size: formatFileSize(f.size),
      file: f,
    }))

    if (multiple) {
      const updatedFiles = [...uploadedFiles, ...newFiles]
      setUploadedFiles(updatedFiles)
      onChange(updatedFiles.map(f => f.file))
    } else {
      setUploadedFiles([newFiles[0]])
      onChange(newFiles[0].file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteFile = (indexToDelete: number) => {
    // Validate index before deleting
    if (indexToDelete < 0 || indexToDelete >= uploadedFiles.length) {
      return
    }

    const updatedFiles = uploadedFiles.filter((_, idx) => idx !== indexToDelete)
    setUploadedFiles(updatedFiles)

    if (multiple) {
      onChange(updatedFiles.length > 0 ? updatedFiles.map(f => f.file) : [])
    } else {
      onChange(undefined)
    }
  }

  return {
    fileInputRef,
    uploadedFiles,
    handleFileChange,
    handleFiles,
    handleDeleteFile,
  }
}
