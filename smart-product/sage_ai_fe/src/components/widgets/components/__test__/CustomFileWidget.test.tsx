import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExtendedFormDashboardFormType } from '../../../../core/constants'
import { CustomFileWidget } from '../CustomFileWidget'

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsButton: ({
    onClick,
    disabled,
    children,
    classes,
    'aria-label': ariaLabel,
    className,
    ...props
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      data-classes={classes}
      {...props}
    >
      {children}
    </button>
  ),
  LdsIcon: ({ name, inline, style, className }: any) => (
    <span
      data-testid={`lds-icon-${name}`}
      data-inline={inline}
      style={style}
      className={className}
    >
      {name}
    </span>
  ),
  LdsImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="lds-image" />
  ),
}))

// Mock the SCSS module
vi.mock('../CustomFileWidget.module.scss', () => ({
  default: {
    checkboxContainer: 'mocked-checkbox-container',
    proTipMessage: 'mocked-pro-tip-message',
    proTipIcon: 'mocked-pro-tip-icon',
    fileDropzone: 'mocked-file-dropzone',
    disabled: 'mocked-disabled',
    enabled: 'mocked-enabled',
    hiddenFileInput: 'mocked-hidden-file-input',
    fileDropzoneIcon: 'mocked-file-dropzone-icon',
    fileDropzoneMainText: 'mocked-file-dropzone-main-text',
    fileDropzoneMain2Text: 'mocked-file-dropzone-main2-text',
    fileDropzoneSubText: 'mocked-file-dropzone-sub-text',
    uploadedFilesContainer: 'mocked-uploaded-files-container',
    uploadedFilesTitle: 'mocked-uploaded-files-title',
    uploadedFilesGrid: 'mocked-uploaded-files-grid',
    uploadedFileItem: 'mocked-uploaded-file-item',
    uploadedFileInfo: 'mocked-uploaded-file-info',
    uploadedFileName: 'mocked-uploaded-file-name',
    uploadedFileSize: 'mocked-uploaded-file-size',
    deleteFileButton: 'mocked-delete-file-button',
    uploadedFilesInfoMessage: 'mocked-uploaded-files-info-message',
    infoIcon: 'mocked-info-icon',
  },
}))

// Mock the assets
vi.mock('../../../../assets/light-bulb.svg', () => ({
  default: 'mocked-light-bulb-icon.svg',
}))

vi.mock('../../../../assets/upload-icon.svg', () => ({
  default: 'mocked-upload-icon.svg',
}))

// Mock the useFileUpload hook
const mockHandleFileChange = vi.fn()
const mockHandleDeleteFile = vi.fn()
const mockHandleFiles = vi.fn()
const mockFileInputRef: any = { current: { click: vi.fn() } }
const mockUseFileUpload = vi.fn()

vi.mock('../../hooks/useFileUpload', () => ({
  useFileUpload: (options: any) => mockUseFileUpload(options),
}))

describe('CustomFileWidget', () => {
  const defaultProps = {
    id: 'test-file-upload',
    name: 'test-file-upload',
    value: [],
    required: false,
    disabled: false,
    readonly: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onFocus: vi.fn(),
    schema: {},
    formData: undefined,
    uiSchema: {},
    idSchema: {},
    errorSchema: {},
    formContext: {},
    autofocus: false,
    rawErrors: [],
    options: {},
    registry: {} as any,
    label: 'Test Label',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFileInputRef.current = { click: vi.fn() }
    mockUseFileUpload.mockReturnValue({
      fileInputRef: mockFileInputRef,
      uploadedFiles: [],
      handleFileChange: mockHandleFileChange,
      handleFiles: mockHandleFiles,
      handleDeleteFile: mockHandleDeleteFile,
    })
  })

  describe('Rendering - Basic Elements', () => {
    it('should render the file upload container', () => {
      render(<CustomFileWidget {...defaultProps} />)

      expect(
        screen.getByTestId(`file-input-container-${defaultProps.id}`)
      ).toBeInTheDocument()
    })

    it('should render the hidden file input', () => {
      render(<CustomFileWidget {...defaultProps} />)

      const fileInput = screen.getByTestId(
        `hidden-file-input-${defaultProps.id}`
      )
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('type', 'file')
    })

    it('should render upload icon', () => {
      render(<CustomFileWidget {...defaultProps} />)

      const uploadIcon = screen.getByAltText('')
      expect(uploadIcon).toBeInTheDocument()
      expect(uploadIcon).toHaveAttribute('src', 'mocked-upload-icon.svg')
    })

    it('should render main dropzone text', () => {
      render(<CustomFileWidget {...defaultProps} />)

      expect(
        screen.getByText('Drag and drop files or click the box to upload')
      ).toBeInTheDocument()
    })

    it('should render supported formats text', () => {
      render(<CustomFileWidget {...defaultProps} />)

      expect(
        screen.getByText('Supported formats: .docx / .doc / .pdf /.pptx')
      ).toBeInTheDocument()
    })

    it('should render file size note', () => {
      render(<CustomFileWidget {...defaultProps} />)

      expect(
        screen.getByText(
          'Note: Each file must be valid. Maximum total size should be 10 MB.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('Rendering - Pro Tip Message', () => {
    it('should render pro tip message by default', () => {
      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.getByText(/Pro Tip:/)).toBeInTheDocument()
      expect(
        screen.getByText(
          /Upload your documents to enable faster and smarter AI-assisted completion./
        )
      ).toBeInTheDocument()
    })

    it('should render light bulb icon in pro tip', () => {
      render(<CustomFileWidget {...defaultProps} />)

      const lightBulb = screen.getByTestId('lds-image')
      expect(lightBulb).toHaveAttribute('src', 'mocked-light-bulb-icon.svg')
      expect(lightBulb).toHaveAttribute('alt', 'Pro Tip')
    })

    it('should hide pro tip for AI Registry form', () => {
      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.AiRegistryForm,
            files: [],
          }}
        />
      )

      expect(screen.queryByText(/Pro Tip:/)).not.toBeInTheDocument()
    })

    it('should hide pro tip for DLO form', () => {
      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.DloForm,
            files: [],
          }}
        />
      )

      expect(screen.queryByText(/Pro Tip:/)).not.toBeInTheDocument()
    })

    it('should hide pro tip for Security Architecture form', () => {
      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.SecurityArchForm,
            files: [],
          }}
        />
      )

      expect(screen.queryByText(/Pro Tip:/)).not.toBeInTheDocument()
    })

    it('should show pro tip for other form types', () => {
      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{ formType: 'OtherFormType' }}
        />
      )

      expect(screen.getByText(/Pro Tip:/)).toBeInTheDocument()
    })
  })

  describe('Rendering - Recommended Documentation', () => {
    it('should render recommended documentation by default', () => {
      render(<CustomFileWidget {...defaultProps} />)

      expect(
        screen.getByText(
          /Recommended documentation: Charter, Solution Overview, Technical Architecture, etc./
        )
      ).toBeInTheDocument()
    })

    it('should hide recommended documentation for AI Registry form', () => {
      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.AiRegistryForm,
            files: [],
          }}
        />
      )

      expect(
        screen.queryByText(/Recommended documentation:/)
      ).not.toBeInTheDocument()
    })

    it('should hide recommended documentation for DLO form', () => {
      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.DloForm,
            files: [],
          }}
        />
      )

      expect(
        screen.queryByText(/Recommended documentation:/)
      ).not.toBeInTheDocument()
    })

    it('should hide recommended documentation for Security Architecture form', () => {
      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.SecurityArchForm,
            files: [],
          }}
        />
      )

      expect(
        screen.queryByText(/Recommended documentation:/)
      ).not.toBeInTheDocument()
    })
  })

  describe('Multiple File Upload', () => {
    it('should pass multiple=false when not specified in uiSchema', () => {
      render(<CustomFileWidget {...defaultProps} />)

      expect(mockUseFileUpload).toHaveBeenCalledWith({
        multiple: false,
        onChange: defaultProps.onChange,
      })
    })

    it('should pass multiple=true when specified in uiSchema', () => {
      render(
        <CustomFileWidget
          {...defaultProps}
          uiSchema={{ 'ui:options': { multiple: true } }}
        />
      )

      expect(mockUseFileUpload).toHaveBeenCalledWith({
        multiple: true,
        onChange: defaultProps.onChange,
      })
    })

    it('should set multiple attribute on file input when multiple is true', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [],
        handleFileChange: mockHandleFileChange,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(
        <CustomFileWidget
          {...defaultProps}
          uiSchema={{ 'ui:options': { multiple: true } }}
        />
      )

      const fileInput = screen.getByTestId(
        `hidden-file-input-${defaultProps.id}`
      )
      expect(fileInput).toHaveAttribute('multiple')
    })

    it('should not set multiple attribute when multiple is false', () => {
      render(<CustomFileWidget {...defaultProps} />)

      const fileInput = screen.getByTestId(
        `hidden-file-input-${defaultProps.id}`
      )
      expect(fileInput).not.toHaveAttribute('multiple')
    })
  })

  describe('Disabled and Readonly States', () => {
    it('should disable file input when disabled is true', () => {
      render(<CustomFileWidget {...defaultProps} disabled={true} />)

      const fileInput = screen.getByTestId(
        `hidden-file-input-${defaultProps.id}`
      )
      expect(fileInput).toBeDisabled()
    })

    it('should disable file input when readonly is true', () => {
      render(<CustomFileWidget {...defaultProps} readonly={true} />)

      const fileInput = screen.getByTestId(
        `hidden-file-input-${defaultProps.id}`
      )
      expect(fileInput).toBeDisabled()
    })

    it('should apply disabled class when disabled', () => {
      render(<CustomFileWidget {...defaultProps} disabled={true} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      expect(container).toHaveClass('mocked-disabled')
    })

    it('should apply enabled class when not disabled', () => {
      render(<CustomFileWidget {...defaultProps} disabled={false} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      expect(container).toHaveClass('mocked-enabled')
    })

    it('should set tabIndex to -1 when disabled', () => {
      render(<CustomFileWidget {...defaultProps} disabled={true} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      expect(container).toHaveAttribute('tabIndex', '-1')
    })

    it('should set tabIndex to 0 when enabled', () => {
      render(<CustomFileWidget {...defaultProps} disabled={false} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      expect(container).toHaveAttribute('tabIndex', '0')
    })

    it('should set aria-disabled when disabled', () => {
      render(<CustomFileWidget {...defaultProps} disabled={true} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      expect(container).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Keyboard Accessibility', () => {
    it('should trigger file input on Enter key', () => {
      // Mock HTMLInputElement.prototype.click
      const mockClick = vi.fn()
      HTMLInputElement.prototype.click = mockClick

      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      fireEvent.keyDown(container, { key: 'Enter' })

      expect(mockClick).toHaveBeenCalled()
    })

    it('should trigger file input on Space key', () => {
      // Mock HTMLInputElement.prototype.click
      const mockClick = vi.fn()
      HTMLInputElement.prototype.click = mockClick

      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      fireEvent.keyDown(container, { key: ' ' })

      expect(mockClick).toHaveBeenCalled()
    })

    it('should not trigger file input on other keys', () => {
      const mockClick = vi.fn()
      mockFileInputRef.current = { click: mockClick }
      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      fireEvent.keyDown(container, { key: 'a' })

      expect(mockClick).not.toHaveBeenCalled()
    })

    it('should not trigger file input when disabled', () => {
      const mockClick = vi.fn()
      mockFileInputRef.current = { click: mockClick }
      render(<CustomFileWidget {...defaultProps} disabled={true} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      fireEvent.keyDown(container, { key: 'Enter' })

      expect(mockClick).not.toHaveBeenCalled()
    })

    it('should not trigger file input when readonly', () => {
      const mockClick = vi.fn()
      mockFileInputRef.current = { click: mockClick }
      render(<CustomFileWidget {...defaultProps} readonly={true} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      fireEvent.keyDown(container, { key: 'Enter' })

      expect(mockClick).not.toHaveBeenCalled()
    })

    it('should prevent default behavior on Enter key', () => {
      const mockClick = vi.fn()
      mockFileInputRef.current = { click: mockClick }
      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      container.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('File Upload Handler', () => {
    it('should call handleFileChange when file is selected', () => {
      render(<CustomFileWidget {...defaultProps} />)

      const fileInput = screen.getByTestId(
        `hidden-file-input-${defaultProps.id}`
      )
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(mockHandleFileChange).toHaveBeenCalled()
    })
  })

  describe('Uploaded Files Display', () => {
    it('should not render uploaded files container when no files', () => {
      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.queryByText('Your Uploads')).not.toBeInTheDocument()
    })

    it('should render uploaded files container when files exist', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.getByText('Your Uploads')).toBeInTheDocument()
    })

    it('should render uploaded files grid', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(
        screen.getByTestId(`uploaded-files-grid-${defaultProps.id}`)
      ).toBeInTheDocument()
    })

    it('should render single uploaded file', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'document.pdf', size: '2.5 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.getByText('document.pdf')).toBeInTheDocument()
      expect(screen.getByText('2.5 MB')).toBeInTheDocument()
    })

    it('should render multiple uploaded files', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [
          { name: 'file1.pdf', size: '1 MB' },
          { name: 'file2.docx', size: '2 MB' },
          { name: 'file3.pptx', size: '3 MB' },
        ],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.getByText('file1.pdf')).toBeInTheDocument()
      expect(screen.getByText('1 MB')).toBeInTheDocument()
      expect(screen.getByText('file2.docx')).toBeInTheDocument()
      expect(screen.getByText('2 MB')).toBeInTheDocument()
      expect(screen.getByText('file3.pptx')).toBeInTheDocument()
      expect(screen.getByText('3 MB')).toBeInTheDocument()
    })

    it('should render file with correct test id', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [
          { name: 'test.pdf', size: '1 MB' },
          { name: 'test2.pdf', size: '2 MB' },
        ],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.getByTestId('uploaded-file-0')).toBeInTheDocument()
      expect(screen.getByTestId('uploaded-file-1')).toBeInTheDocument()
    })
  })

  describe('Delete File Functionality', () => {
    it('should render delete button for uploaded file', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.getByTestId('delete-file-0')).toBeInTheDocument()
    })

    it('should render trash icon in delete button', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.getByTestId('lds-icon-trash')).toBeInTheDocument()
    })

    it('should call handleDeleteFile when delete button is clicked', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      const deleteButton = screen.getByTestId('delete-file-0')
      fireEvent.click(deleteButton)

      expect(mockHandleDeleteFile).toHaveBeenCalledWith(0)
    })

    it('should call handleDeleteFile with correct index for multiple files', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [
          { name: 'file1.pdf', size: '1 MB' },
          { name: 'file2.pdf', size: '2 MB' },
          { name: 'file3.pdf', size: '3 MB' },
        ],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      fireEvent.click(screen.getByTestId('delete-file-1'))
      expect(mockHandleDeleteFile).toHaveBeenCalledWith(1)

      fireEvent.click(screen.getByTestId('delete-file-2'))
      expect(mockHandleDeleteFile).toHaveBeenCalledWith(2)
    })

    it('should disable delete button when disabled', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} disabled={true} />)

      expect(screen.getByTestId('delete-file-0')).toBeDisabled()
    })

    it('should disable delete button when readonly', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} readonly={true} />)

      expect(screen.getByTestId('delete-file-0')).toBeDisabled()
    })

    it('should have proper aria-label for delete button', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'my-document.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      const deleteButton = screen.getByTestId('delete-file-0')
      expect(deleteButton).toHaveAttribute(
        'aria-label',
        'Delete my-document.pdf'
      )
    })
  })

  describe('Info Message for Uploaded Files', () => {
    it('should render info message when files are uploaded', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(
        screen.getByText(
          /While your files are uploading, we'll extract the data behind the scenes/
        )
      ).toBeInTheDocument()
    })

    it('should render info icon in info message', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      expect(screen.getByTestId('lds-icon-info')).toBeInTheDocument()
    })

    it('should hide info message for AI Registry form', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.AiRegistryForm,
            files: [],
          }}
        />
      )

      expect(
        screen.queryByText(/While your files are uploading/)
      ).not.toBeInTheDocument()
    })

    it('should hide info message for DLO form', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.DloForm,
            files: [],
          }}
        />
      )

      expect(
        screen.queryByText(/While your files are uploading/)
      ).not.toBeInTheDocument()
    })

    it('should hide info message for Security Architecture form', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'test.pdf', size: '1 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.SecurityArchForm,
            files: [],
          }}
        />
      )

      expect(
        screen.queryByText(/While your files are uploading/)
      ).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="button" on dropzone', () => {
      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      expect(container).toHaveAttribute('role', 'button')
    })

    it('should have proper id for dropzone', () => {
      render(<CustomFileWidget {...defaultProps} id="my-file-upload" />)

      const container = screen.getByTestId(
        'file-input-container-my-file-upload'
      )
      expect(container).toHaveAttribute('id', 'my-file-upload-dropzone')
    })

    it('should associate label with hidden input', () => {
      render(<CustomFileWidget {...defaultProps} id="accessible-file" />)

      const container = screen.getByTestId(
        'file-input-container-accessible-file'
      )
      const input = screen.getByTestId('hidden-file-input-accessible-file')

      expect(container).toHaveAttribute('for', 'accessible-file')
      expect(input).toHaveAttribute('id', 'accessible-file')
    })
  })

  describe('Drag and Drop', () => {
    it('should call handleFiles with all dropped files (multiple=false, takes first file)', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      const pdf = new File(['content'], 'report.pdf', {
        type: 'application/pdf',
      })
      const txt = new File(['content'], 'notes.txt', {
        type: 'text/plain',
      })
      const docx = new File(['content'], 'proposal.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      fireEvent.drop(container, {
        dataTransfer: { files: [pdf, txt, docx] },
      })

      // In single mode, only the first file should be passed (regardless of type)
      expect(mockHandleFiles).toHaveBeenCalledTimes(1)
      const args = mockHandleFiles.mock.calls[0][0]
      expect(Array.isArray(args)).toBe(true)
      expect(args).toHaveLength(1)
      expect(args[0].name).toBe('report.pdf')
    })

    it('should call handleFiles with all dropped files (multiple=true)', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(
        <CustomFileWidget
          {...defaultProps}
          uiSchema={{ 'ui:options': { multiple: true } }}
        />
      )

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      const pdf = new File(['x'], 'file.pdf', { type: 'application/pdf' })
      const pptx = new File(['x'], 'slides.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })
      const png = new File(['x'], 'image.png', { type: 'image/png' })

      fireEvent.drop(container, {
        dataTransfer: { files: [pdf, pptx, png] },
      })

      expect(mockHandleFiles).toHaveBeenCalledTimes(1)
      const args = mockHandleFiles.mock.calls[0][0]
      // All files should be passed through without filtering
      expect(args).toHaveLength(3)
      expect(args.map((f: File) => f.name).sort()).toEqual(
        ['file.pdf', 'image.png', 'slides.pptx'].sort()
      )
    })

    it('should call handleFiles even when dropped files are unsupported (validation happens elsewhere)', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      const txt = new File(['content'], 'readme.txt', { type: 'text/plain' })

      fireEvent.drop(container, {
        dataTransfer: { files: [txt] },
      })

      // handleFiles should be called - validation/error display happens in the hook or form
      expect(mockHandleFiles).toHaveBeenCalledTimes(1)
      const args = mockHandleFiles.mock.calls[0][0]
      expect(args).toHaveLength(1)
      expect(args[0].name).toBe('readme.txt')
    })

    it('should not call handleFiles when no files are dropped', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )

      fireEvent.drop(container, {
        dataTransfer: { files: [] },
      })

      expect(mockHandleFiles).not.toHaveBeenCalled()
    })

    it('should ignore drop when disabled', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} disabled={true} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      const pdf = new File(['x'], 'file.pdf', { type: 'application/pdf' })

      fireEvent.drop(container, {
        dataTransfer: { files: [pdf] },
      })

      expect(mockHandleFiles).not.toHaveBeenCalled()
    })

    it('should ignore drop when readonly', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} readonly={true} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )
      const pdf = new File(['x'], 'file.pdf', { type: 'application/pdf' })

      fireEvent.drop(container, {
        dataTransfer: { files: [pdf] },
      })

      expect(mockHandleFiles).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as id', () => {
      render(<CustomFileWidget {...defaultProps} id="" />)

      expect(screen.getByTestId('file-input-container-')).toBeInTheDocument()
    })

    it('should handle special characters in id', () => {
      const specialId = 'test-file-123_$'
      render(<CustomFileWidget {...defaultProps} id={specialId} />)

      expect(
        screen.getByTestId(`file-input-container-${specialId}`)
      ).toBeInTheDocument()
    })

    it('should handle file input ref being null', () => {
      mockFileInputRef.current = null
      render(<CustomFileWidget {...defaultProps} />)

      const container = screen.getByTestId(
        `file-input-container-${defaultProps.id}`
      )

      expect(() => {
        fireEvent.keyDown(container, { key: 'Enter' })
      }).not.toThrow()
    })

    it('should handle formContext being undefined', () => {
      render(<CustomFileWidget {...defaultProps} formContext={undefined} />)

      expect(screen.getByText(/Pro Tip:/)).toBeInTheDocument()
    })

    it('should handle uiSchema being undefined', () => {
      render(<CustomFileWidget {...defaultProps} uiSchema={undefined} />)

      expect(mockUseFileUpload).toHaveBeenCalledWith({
        multiple: false,
        onChange: defaultProps.onChange,
      })
    })
  })

  describe('Integration Tests', () => {
    it('should render complete component with all features', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'document.pdf', size: '5 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(<CustomFileWidget {...defaultProps} />)

      // Pro tip
      expect(screen.getByText(/Pro Tip:/)).toBeInTheDocument()
      // Dropzone
      expect(
        screen.getByText('Drag and drop files or click the box to upload')
      ).toBeInTheDocument()
      // Recommended docs
      expect(screen.getByText(/Recommended documentation:/)).toBeInTheDocument()
      // Uploaded files
      expect(screen.getByText('Your Uploads')).toBeInTheDocument()
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
      // Info message
      expect(
        screen.getByText(/While your files are uploading/)
      ).toBeInTheDocument()
    })

    it('should render minimal component for specific form types', () => {
      mockUseFileUpload.mockReturnValue({
        fileInputRef: mockFileInputRef,
        uploadedFiles: [{ name: 'document.pdf', size: '5 MB' }],
        handleFileChange: mockHandleFileChange,
        handleFiles: mockHandleFiles,
        handleDeleteFile: mockHandleDeleteFile,
      })

      render(
        <CustomFileWidget
          {...defaultProps}
          formContext={{
            formType: ExtendedFormDashboardFormType.AiRegistryForm,
            files: [],
          }}
        />
      )

      // Pro tip hidden
      expect(screen.queryByText(/Pro Tip:/)).not.toBeInTheDocument()
      // Dropzone visible
      expect(
        screen.getByText('Drag and drop files or click the box to upload')
      ).toBeInTheDocument()
      // Recommended docs hidden
      expect(
        screen.queryByText(/Recommended documentation:/)
      ).not.toBeInTheDocument()
      // Uploaded files visible
      expect(screen.getByText('Your Uploads')).toBeInTheDocument()
      // Info message hidden
      expect(
        screen.queryByText(/While your files are uploading/)
      ).not.toBeInTheDocument()
    })
  })
})
