import { LdsBreadcrumb } from '@elilillyco/ux-lds-react'
import React, { useCallback } from 'react'

// import roboBrainImg from '../../assets/roboBrain.svg'
// import webSvg from '../../assets/web.svg'
import styles from './FormContainer.module.scss'
import FormContent from './FormContent'
import { FormFooter } from './FormFooter'
import FormHeader from './FormHeader'
import { FormContainerOrchestratorProps } from './types'

export const FormContainer: React.FC<
  FormContainerOrchestratorProps
> = props => {
  const {
    approvalIndexPercentage,
    formTitle,
    formSubtitle,
    progressEnabled,
    fields,
    pageSize,
    onStepChange,
    onFieldChange,
    tagActions,
    footerButtons,
    pageButtonIds,
    actionHandlerMap,
    breadcrumbs,
    steps,
    activePageIndex,
    fieldsPerPage,
    setActivePageIndex,
    pageFieldCounts,
    pageDetails,
    schema,
    uiSchema,
    submitRedirectPath,
    formData,
    setFormData,
    submissionId,
    skipDocumentUpload,
    formType,
    formStatus,
    sticky,
    suggestionsData,
    suggestionsLoading,
    suggestionsError,
    hideSideImage = false,
    commonFields,
    files,
  } = props

  const handleFieldChange = useCallback(
    (fieldId: string, value: unknown) => {
      if (onFieldChange) {
        onFieldChange(fieldId, value)
      }
    },
    [onFieldChange]
  )

  return (
    <div
      className={styles.formContainer__outer}
      data-testid="form-container-outer"
    >
      <div
        className={
          formTitle === "Let's Get Started"
            ? `${styles.formContainer__content} ${styles['formContainer__content--beginSubmission']}`
            : styles.formContainer__content
        }
      >
        <div
          className={styles.formHeader__breadcrumbs}
          data-testid="form-header-breadcrumbs"
          aria-label="Breadcrumbs"
        >
          <LdsBreadcrumb
            breadcrumbs={breadcrumbs?.map((crumb, index) => ({
              ...crumb,
              key: `breadcrumb-${index}-${crumb.text}`,
            }))}
          />
        </div>
        <section
          className={styles.formContainer}
          aria-label="Form Container"
          data-testid="form-container"
        >
          <FormHeader
            approvalIndexPercentage={approvalIndexPercentage}
            formTitle={formTitle}
            formSubtitle={formSubtitle}
            progressEnabled={progressEnabled}
            breadcrumbs={breadcrumbs}
            steps={
              steps ||
              (Array.isArray(pageDetails) && pageDetails.length > 0
                ? pageDetails.map(d => d.title)
                : Array.isArray(pageFieldCounts)
                  ? pageFieldCounts.map((_, i) => `Page ${i + 1}`)
                  : undefined)
            }
            activePageIndex={activePageIndex}
          />
          <FormContent
            fields={fields}
            pageSize={pageSize}
            onStepChange={onStepChange}
            onFieldChange={handleFieldChange}
            tagActions={tagActions}
            activePageIndex={activePageIndex}
            fieldsPerPage={fieldsPerPage}
            pageFieldCounts={pageFieldCounts}
            pageDetails={pageDetails}
            schema={schema}
            uiSchema={uiSchema}
            formData={formData || {}}
            setFormData={
              setFormData ||
              (() => {
                // setFormData not provided
              })
            }
            submissionId={submissionId}
            formType={formType}
            formStatus={formStatus}
            suggestionsData={suggestionsData}
            suggestionsLoading={suggestionsLoading}
            suggestionsError={suggestionsError}
            commonFields={commonFields}
            files={files}
          />
          <FormFooter
            footerButtons={footerButtons}
            pageButtonIds={pageButtonIds}
            actionHandlerMap={actionHandlerMap}
            activePageIndex={activePageIndex}
            fieldsPerPage={fieldsPerPage}
            totalFields={fields.length}
            sticky={sticky}
            setActivePageIndex={setActivePageIndex}
            pageFieldCounts={pageFieldCounts}
            pageDetails={pageDetails}
            submitRedirectPath={submitRedirectPath}
            skipDocumentUpload={skipDocumentUpload}
            formStatus={formStatus}
            formData={formData}
          />
        </section>
      </div>
      {!hideSideImage && (
        <div className={styles.beginSubmissionImage} aria-hidden="true">
          {/* {formTitle === "Let's Get Started" ? (
            <div className={styles.beginSubmissionImageWrapper}>
              <LdsImage
                src={roboBrainImg}
                alt="Image showing the potential of AI"
                role="presentation"
                className={styles.beginSubmissionRoboBrainImage}
              />
            </div>
          ) : (
            <LdsImage
              src={webSvg}
              alt="Neural network graphic"
              role="presentation"
              className={styles.beginSubmissionWebImage}
            />
          )} */}
        </div>
      )}
    </div>
  )
}

export default FormContainer
