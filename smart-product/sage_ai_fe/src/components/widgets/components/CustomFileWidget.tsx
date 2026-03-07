import { LdsButton, LdsIcon, LdsImage } from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'

import lightBulbIcon from '../../../assets/light-bulb.svg'
import uploadIcon from '../../../assets/upload-icon.svg'
import { ExtendedFormDashboardFormType } from '../../../core/constants'
import { useFileUpload } from '../hooks/useFileUpload'
import styles from './CustomFileWidget.module.scss'

export const CustomFileWidget: React.FC<WidgetProps> = ({
  id,
  disabled,
  readonly,
  onChange,
  uiSchema,
  formContext,
}) => {
  const multiple = Boolean(uiSchema?.['ui:options']?.multiple)

  // Use extracted file upload hook
  const {
    fileInputRef,
    uploadedFiles,
    handleFileChange,
    handleFiles,
    handleDeleteFile,
  } = useFileUpload({ multiple, onChange })

  const subsequentFileUploads = [
    ExtendedFormDashboardFormType.AiRegistryForm,
    ExtendedFormDashboardFormType.DloForm,
    ExtendedFormDashboardFormType.SecurityArchForm,
  ].includes(formContext?.formType)

  return (
    <div className={styles.checkboxContainer}>
      {!subsequentFileUploads && (
        <div className={styles.proTipMessage}>
          <LdsImage
            src={lightBulbIcon}
            alt="Pro Tip"
            className={styles.proTipIcon}
          />
          <span>
            <strong>Pro Tip:</strong> Upload your documents to enable faster and
            smarter AI-assisted completion.
          </span>
        </div>
      )}
      {subsequentFileUploads && (
        <div>
          <p>{`${formContext?.files?.length > 0 ? `You previously uploaded "${formContext.files.join(', ')}" for data extracts.` : ''} Here you can include supplemental documents with your submission. This step is optional, but supplemental documents help reviewers expedite the processing of your submission.`}</p>
          <p>
            Examples could include network diagrams, design specifications,
            sample data processed by your application, and more.
          </p>
        </div>
      )}
      <label
        htmlFor={id}
        id={`${id}-dropzone`}
        role="button"
        tabIndex={disabled || readonly ? -1 : 0}
        aria-disabled={disabled || readonly || undefined}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !readonly) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        onDragOver={e => {
          // Allow drop
          if (disabled || readonly) return
          e.preventDefault()
        }}
        onDrop={e => {
          if (disabled || readonly) return
          e.preventDefault()

          const dtFiles = Array.from(e.dataTransfer?.files || [])

          if (dtFiles.length === 0) return

          // Pass all files to handleFiles - don't filter here
          // This matches the behavior of the manual file input
          if (!multiple) {
            handleFiles([dtFiles[0]])
          } else {
            handleFiles(dtFiles)
          }
        }}
        className={`${styles.fileDropzone} ${disabled || readonly ? styles.disabled : styles.enabled}`}
        data-testid={`file-input-container-${id}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          name={id}
          multiple={multiple}
          disabled={disabled || readonly}
          onChange={handleFileChange}
          className={styles.hiddenFileInput}
          data-testid={`hidden-file-input-${id}`}
          accept=".doc,.docx,.pdf,.pptx"
        />
        <img src={uploadIcon} alt="" className={styles.fileDropzoneIcon} />
        <div className={styles.fileDropzoneMainText}>
          Drag and drop files or click the box to upload
        </div>
        {!subsequentFileUploads && (
          <div className={styles.fileDropzoneMain2Text}>
            Recommended documentation: Charter, Solution Overview, Technical
            Architecture, etc.
          </div>
        )}
        <div className={styles.fileDropzoneSubText}>
          {subsequentFileUploads
            ? 'Please upload any supporting documents for your submission'
            : 'Supported formats: .docx / .doc / .pdf /.pptx'}
        </div>
        {!subsequentFileUploads && (
          <div className={styles.fileDropzoneSubText}>
            Note: Each file must be valid. Maximum total size should be 10 MB.
          </div>
        )}
      </label>
      {uploadedFiles.length > 0 && (
        <div className={styles.uploadedFilesContainer}>
          <div className={styles.uploadedFilesTitle}>Your Uploads</div>
          <div
            className={styles.uploadedFilesGrid}
            data-testid={`uploaded-files-grid-${id}`}
          >
            {uploadedFiles.map((f, idx) => (
              <div
                key={`${f.name}-${idx}`}
                className={styles.uploadedFileItem}
                data-testid={`uploaded-file-${idx}`}
              >
                <div className={styles.uploadedFileInfo}>
                  <span className={styles.uploadedFileName}>{f.name}</span>
                  <span className={styles.uploadedFileSize}>{f.size}</span>
                </div>
                <LdsButton
                  onClick={() => handleDeleteFile(idx)}
                  disabled={disabled || readonly}
                  aria-label={`Delete ${f.name}`}
                  classes="text compact"
                  data-testid={`delete-file-${idx}`}
                  className={styles.deleteFileButton}
                >
                  <LdsIcon
                    style={{ width: '1.125rem', height: '1.125rem' }}
                    name="trash"
                    inline
                  />
                </LdsButton>
              </div>
            ))}
          </div>
          {!subsequentFileUploads && (
            <div className={styles.uploadedFilesInfoMessage}>
              <LdsIcon name="info" className={styles.infoIcon} inline />
              <span>
                While your files are uploading, we'll extract the data behind
                the scenes. You can submit your form now and continue to the
                next step!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
