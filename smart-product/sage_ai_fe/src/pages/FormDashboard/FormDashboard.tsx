import {
  LdsBreadcrumb,
  LdsIcon,
  LdsImage,
  LdsLoadingSpinner,
  LdsModal,
} from '@elilillyco/ux-lds-react'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { FormCompletionStatus } from '@/core/models/form-completion-status.enum.ts'

import blueStarIcon from '../../assets/blue-star.svg'
import lightBulbSvg from '../../assets/light-bulb.svg' // Idea Submission title icon (assumed path)
// Assumption: lock icon asset exists at this relative path; adjust if actual location differs.
import lockIconSvg from '../../assets/lock-icon.svg'
import { FormCard } from '../../components/FormCard/FormCard'
import { useExtractionStatus } from '../../contexts/ExtractionStatusContext'
import { formDashboardApi } from '../../core/api/form-dashboard.api'
import {
  APPROVAL_SCORE_PREFIX,
  CATEGORY_TO_REQUIREMENT_LEVEL,
  FormDashboardFormType,
  MANDATORY,
  OPTIONAL,
  RECOMMENDED,
  RequirementLevel,
} from '../../core/constants.ts'
import { FORM_STATUS } from '../../core/constants.ts'
import { FormDashboardSummary } from '../../core/models/form.model'
import { ExtractionStatus } from '../../core/models/extraction-status.model'
import styles from './FormDashboard.module.scss'
import { getMessage } from '@/components/ExtractionStatusBanner/ExtractionStatusBanner.tsx'

interface DashboardFormMeta {
  formType: FormDashboardFormType
  title: string
  text: string
  duration: string
  stepCount?: number
  aiFieldPercentage?: number
  redirectPath?: string
  status?: 'completed' | 'pending' | 'in_progress'
  formId?: string
  submissionId?: string
  requirementLevel?: RequirementLevel
}

export const FormDashboard: React.FC = () => {
  // Tabs removed; unified grid view
  const [apiFormsData, setApiFormsData] = useState<FormDashboardSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [noveltyScore, setNoveltyScore] = useState<number | null>(null)
  const { submissionId = '' } = useParams<{ submissionId: string }>()
  const location = useLocation()
  const {
    startSSE,
    isExtracting,
    progress,
    extractionStatus,
    extractionMessage,
  } = useExtractionStatus()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true)
  // Track if we've already started extraction for this submission to prevent duplicate calls

  const extractionStartedRef = useRef<string | null>(null)
  const navigate = useNavigate()

  const isFailed = extractionStatus === ExtractionStatus.Failed

  useEffect(() => {
    if (!isExtracting) {
      setIsModalOpen(false)
    } else {
      setIsModalOpen(true)
    }
  }, [isExtracting])
  // Start extraction polling if navigated from BeginSubmission
  useEffect(() => {
    const shouldStartExtraction = location.state?.startExtraction
    // Only start if we haven't already started for this submission
    if (
      shouldStartExtraction &&
      submissionId &&
      extractionStartedRef.current !== submissionId
    ) {
      extractionStartedRef.current = submissionId
      startSSE(submissionId)
      // Clear the state so it doesn't trigger again on refresh
      window.history.replaceState({}, document.title)
    }
    // Reset ref if submissionId changes (new submission)
    if (
      submissionId &&
      extractionStartedRef.current !== submissionId &&
      !shouldStartExtraction
    ) {
      extractionStartedRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId, location.state?.startExtraction]) // Only depend on submissionId and the startExtraction flag, not startSSE

  // Fetch form dashboard data
  useEffect(() => {
    const fetchFormDashboard = async () => {
      try {
        setIsLoading(true)
        if (!submissionId) {
          console.error('No submissionId provided in route params')
          setIsLoading(false)
          return
        }
        const response = await formDashboardApi.getFormDashboard(submissionId)
        setApiFormsData(response.data)
        if (
          response?.['novelty-score'] !== null &&
          response?.['novelty-score'] !== undefined &&
          response?.['novelty-score'] >= 0 &&
          response?.['novelty-score'] < 1
        ) {
          setNoveltyScore(Math.round((1 - response?.['novelty-score']) * 100))
        }
      } catch (err) {
        console.error('Error fetching form dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFormDashboard()
  }, [submissionId])

  // Helper function to map API category to requirementLevel
  const mapCategoryToRequirementLevel = (
    category?: string
  ): RequirementLevel => {
    if (!category) return OPTIONAL
    const mapped = CATEGORY_TO_REQUIREMENT_LEVEL[category]
    return mapped || OPTIONAL
  }

  // Base static form metadata templates (without requirementLevel - set dynamically from API)
  const baseFormMetadataMap: Record<
    FormDashboardFormType,
    Omit<
      DashboardFormMeta,
      'status' | 'formId' | 'submissionId' | 'requirementLevel'
    >
  > = {
    [FormDashboardFormType.AiRegistryForm]: {
      formType: FormDashboardFormType.AiRegistryForm,
      title: 'AI Registry & Tech Innovation Pipeline',
      text: 'This form gathers critical use case details to guide prioritization and risk review for solution design, especially when AI is included.',
      duration: '45-60 mins',
      stepCount: 6,
      redirectPath: '/ai-registry',
    },
    [FormDashboardFormType.DloForm]: {
      formType: FormDashboardFormType.DloForm,
      title: 'Digital Legal Office Form',
      text: 'All new work involving PI must undergo a privacy review to ensure necessary controls and documentation.',
      duration: '10-15 mins',
      stepCount: 2,
      redirectPath: '/digital-legal-office',
    },
    [FormDashboardFormType.WwtpForm]: {
      formType: FormDashboardFormType.WwtpForm,
      title: 'Working with Third Party',
      text: 'The WwTP program helps to identify and manage risks from third-party engagements throughout their lifecycle.',
      duration: '45-60 mins',
      stepCount: 2,
      redirectPath: '/working-with-third-party',
    },
    [FormDashboardFormType.GcoRiskRegistryForm]: {
      formType: FormDashboardFormType.GcoRiskRegistryForm,
      title: 'GCO Digital Risk Registry Form',
      text: 'Essential information about your AI system, users, and technical details.',
      duration: '35-40 mins',
      stepCount: 4,
      redirectPath: '/gco-digital-risk-registry',
    },
    [FormDashboardFormType.SecurityArchForm]: {
      formType: FormDashboardFormType.SecurityArchForm,
      title: 'Security Architecture and Engineering',
      text: 'Essential information about your AI system, users, and technical details.',
      duration: '35-40 mins',
      stepCount: 6,
      redirectPath: '/security-and-engineering',
    },
    [FormDashboardFormType.IdeaSubForm]: {
      formType: FormDashboardFormType.IdeaSubForm,
      title: 'Solution/System Overview',
      text: 'Provide key details about your solution/system to support a well-informed evaluation.',
      duration: '15-20 mins',
      stepCount: 5,
      redirectPath: '/idea-submission',
    },
    [FormDashboardFormType.WnvVendorEngagementForm]: {
      formType: FormDashboardFormType.WnvVendorEngagementForm,
      title: 'Working with Third Party',
      text: 'The WwTP program helps to identify and manage risks from third-party engagements throughout their lifecycle.',
      duration: '45-60 mins',
      stepCount: 4,
      redirectPath: '/wnv-vendor-engagement',
    },
  }

  // Build dynamic formMetadataMap with requirementLevel from API data
  const formMetadataMap = React.useMemo(() => {
    const map: Record<
      FormDashboardFormType,
      Omit<DashboardFormMeta, 'status' | 'formId' | 'submissionId'> & {
        requirementLevel: RequirementLevel
      }
    > = {} as any

    Object.entries(baseFormMetadataMap).forEach(([formType, metadata]) => {
      const apiData = apiFormsData.find(f => f['form-type'] === formType)
      // Always set IdeaSubForm as recommended, otherwise use API category
      const requirementLevel =
        formType === FormDashboardFormType.IdeaSubForm
          ? RECOMMENDED
          : mapCategoryToRequirementLevel(apiData?.category)

      map[formType as FormDashboardFormType] = {
        ...metadata,
        requirementLevel,
      }
    })

    return map
  }, [apiFormsData])

  // Merge API data with static metadata
  const mergeFormData = (
    formTypes: FormDashboardFormType[]
  ): DashboardFormMeta[] => {
    return formTypes
      .filter(formType => {
        // Filter out forms that don't exist in backend response
        const apiData = apiFormsData.find(f => f['form-type'] === formType)
        return apiData !== undefined
      })
      .map(formType => {
        const metadata = formMetadataMap[formType]
        const apiData = apiFormsData.find(f => f['form-type'] === formType)!

        // TODO: TEMPORARY - Read score from localStorage for demo purposes
        // This will be REMOVED once the BE sends aiFieldPercentage in the form dashboard API response
        let aiFieldPercentage =
          Math.ceil((metadata?.aiFieldPercentage ?? 0) * 10) / 10
        if (formType === FormDashboardFormType.AiRegistryForm) {
          const storedScore = localStorage.getItem(
            `${APPROVAL_SCORE_PREFIX}-${FormDashboardFormType.AiRegistryForm}-${submissionId}`
          )
          if (storedScore) {
            const scoreValue = parseFloat(storedScore)
            // Convert score (0-1 or 0-100 range) to percentage if needed
            aiFieldPercentage = scoreValue > 1 ? scoreValue : scoreValue * 100
          }
        }

        return {
          ...metadata,
          status: apiData.status,
          formId: apiData.id,
          submissionId: apiData['submission-id'],
          redirectPath: `${metadata.redirectPath}/${apiData.id}/${apiData['submission-id']}`,
          aiFieldPercentage,
        } as DashboardFormMeta
      })
  }

  // Unified forms list (priority ordering: mandatory -> required -> optional)
  const allFormsfromBE: DashboardFormMeta[] = mergeFormData([
    FormDashboardFormType.IdeaSubForm,
    FormDashboardFormType.AiRegistryForm,
    FormDashboardFormType.DloForm,
    FormDashboardFormType.SecurityArchForm,
    FormDashboardFormType.WwtpForm,
    FormDashboardFormType.WnvVendorEngagementForm,
  ]).sort((a, b) => {
    const rank = (lvl: string | undefined) =>
      lvl === MANDATORY ? 0 : lvl === RECOMMENDED ? 1 : lvl === OPTIONAL ? 2 : 3
    return rank((a as any).requirementLevel) - rank((b as any).requirementLevel)
  })

  // Filter out GCO Risk Registry Form from the unified forms list
  const allForms = allFormsfromBE.filter(
    form => form.formType !== FormDashboardFormType.GcoRiskRegistryForm
  )

  const ideaSubmissionForm = allForms.find(
    form => form.formType === FormDashboardFormType.IdeaSubForm
  )
  const isIdeaSubmissionCompleted =
    ideaSubmissionForm?.status === FORM_STATUS.COMPLETED

  // Dynamic user name from context (fallback to generic label)

  const computeProgress = (forms: DashboardFormMeta[]) => {
    const nonOptional = forms.filter(
      f => (f as any).requirementLevel !== OPTIONAL
    )
    const completedNonOptional = nonOptional.filter(
      f => f.status === FORM_STATUS.COMPLETED
    ).length

    const STATIC_BEGIN_SUBMISSION_FORM = 1
    const completedCount = completedNonOptional + STATIC_BEGIN_SUBMISSION_FORM
    const total = nonOptional.length + STATIC_BEGIN_SUBMISSION_FORM
    const raw = (completedCount / total) * 100
    const progressPercent = Math.min(100, Math.round(raw))

    return { progressPercent, completedCount, total }
  }

  const { progressPercent } = computeProgress(allForms)

  // TODO : need to remove infuture if not require
  // const computeRequirementSummary = (forms: DashboardFormMeta[]) => {
  //   const mandatoryCount = forms.filter(
  //     f => (f as any).requirementLevel === 'mandatory'
  //   ).length
  //   const optionalCount = forms.filter(
  //     f => (f as any).requirementLevel === 'optional'
  //   ).length
  //   const mandatoryLabel = `${mandatoryCount} mandatory ${mandatoryCount === 1 ? 'form' : 'forms'}`
  //   const optionalLabel = `${optionalCount} ${optionalCount === 1 ? 'is' : 'are'} optional`
  //   return `fill ${mandatoryLabel} and ${optionalLabel}.`
  // }
  // const requirementSummaryText = computeRequirementSummary(allForms)

  return (
    <main
      className={styles.formDashboardPage}
      aria-label="Form Dashboard"
      data-testid="form-dashboard-page"
    >
      {isExtracting && isModalOpen && (
        <LdsModal
          modalId="doc-extraction-modal"
          open={true}
          closeModal={() => setIsModalOpen(false)}
          modalSizeClass="col-md-8"
        >
          <div>
            {!isFailed && (
              <div className={styles.modalProgressBarContainer}>
                <div
                  className={styles.modalProgressBarIndicator}
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Extraction progress: ${Math.round(progress)}%`}
                ></div>
              </div>
            )}
            <h4 className={styles.modalHeading}>
              Document Extraction in Progress
            </h4>
            <div className={styles.modalExtractionStatusMessage}>
              {extractionStatus
                ? getMessage(extractionMessage, extractionStatus, false)
                : ''}
            </div>
            <p>
              We strongly suggest that you wait for the extracts to complete
              before completing any of the following forms, but you can proceed
              with manual entry if needed.
            </p>
          </div>
        </LdsModal>
      )}
      <aside
        className={styles.formDashboardSidebar}
        aria-label="Form Dashboard Sidebar"
      >
        <div className={styles.breadcrumbContainer}>
          <LdsBreadcrumb
            breadcrumbs={[
              { text: 'Home', href: '/landing', key: 'home' },
              {
                text: 'Form Dashboard',
                href: `/form-dashboard/${submissionId}`,
                key: 'form-dashboard',
              },
            ]}
          />
        </div>
        <div className={`$${styles.sidebarSection}`}>
          <h2 className={styles.sidebarGreeting}>
            <span className={styles.sidebarGreetingRest}>Form Dashboard</span>
          </h2>
          {noveltyScore !== null && (
            <p className={`${styles.sidebarInsight}`}>
              <LdsImage
                src={blueStarIcon}
                alt="Originality icon"
                className={styles.calloutIcon}
              />

              <span>
                {noveltyScore >= 67
                  ? 'Your idea demonstrates a high level of originality compared to the other ideas submitted.'
                  : noveltyScore >= 34
                    ? 'Your idea demonstrates a moderate level of originality compared to the other ideas submitted. Consider exploring additional unique angles to further enhance your submission.'
                    : 'Your idea demonstrates a lower level of originality compared to the other ideas submitted. We encourage you to refine your concept or introduce new elements to set your idea apart.'}
              </span>
            </p>
          )}

          {(() => {
            const requiredCount = allForms.filter(
              f => f.requirementLevel === RECOMMENDED
            ).length
            const optionalCount = allForms.filter(
              f => f.requirementLevel === OPTIONAL
            ).length
            return (
              <p className={styles.sidebarInsight}>
                <img
                  src={blueStarIcon}
                  alt="Originality icon"
                  className={styles.calloutIcon}
                />
                <span>
                  <strong>
                    You have {requiredCount} required{' '}
                    {requiredCount === 1 ? 'form' : 'forms'} and {optionalCount}{' '}
                    optional {optionalCount === 1 ? 'form' : 'forms'}{' '}
                  </strong>
                  to fill out based on your data
                </span>
              </p>
            )
          })()}
        </div>
        <div
          className={`${styles.sidebarSection} ${styles.progressSection}`}
          aria-label="Submission Progress"
        >
          {/* Figma-derived progress block */}
          <p className={styles.progressIntro}>
            Complete the checklist below to wrap up your submission!
          </p>
          <div className={styles.progressHeaderRow}>
            <span className={styles.progressLabel}>
              Your Submission Progress
            </span>
            <span className={styles.progressValue}>
              {progressPercent}% completed
            </span>
          </div>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Submission progress"
          >
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div
          className={`${styles.sidebarSection} ${styles.checklistSection}`}
          aria-label="Forms Checklist"
        >
          <ul className={styles.checklist}>
            <li
              key="check-initiate-submission"
              className={styles.checklistItem}
              aria-label="Initiate Form Submission step completed"
            >
              <span className={styles.checklistIcon}>
                <LdsIcon
                  name="check-circle-fill"
                  className={styles.checklistIconCompleted}
                  aria-label="Initiate Form Submission completed"
                />
              </span>
              <span className={styles.checklistTitle}>
                Intake Questionnaire
              </span>
            </li>
            {allForms
              .filter(f => (f as any).requirementLevel !== OPTIONAL)
              .map(f => {
                const status =
                  f.status === FormCompletionStatus.COMPLETED
                    ? FormCompletionStatus.COMPLETED
                    : FormCompletionStatus.PENDING
                return (
                  <li
                    key={`check-${f.formType}`}
                    className={styles.checklistItem}
                  >
                    <span className={styles.checklistIcon}>
                      <LdsIcon
                        name={
                          status === FormCompletionStatus.COMPLETED
                            ? 'check-circle-fill'
                            : 'x-circle-fill'
                        }
                        className={
                          status === FormCompletionStatus.COMPLETED
                            ? styles.checklistIconCompleted
                            : styles.checklistIconPending
                        }
                        aria-label={
                          status === FormCompletionStatus.COMPLETED
                            ? 'Form completed'
                            : 'Form not completed'
                        }
                      />
                    </span>
                    <span className={styles.checklistTitle}>{f.title}</span>
                  </li>
                )
              })}
          </ul>
        </div>
      </aside>
      <div
        className={styles.formDashboardCardsSection}
        aria-label="Form Dashboard Submissions"
        data-testid="form-dashboard-page"
      >
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <LdsLoadingSpinner
              className="primary"
              ariaLabel="Loading form dashboard"
              svgTitle="Loading form dashboard"
            />
          </div>
        ) : (
          <>
            <section
              className={styles.section}
              aria-labelledby="all-forms-heading"
            >
              <div className={styles.cardsGrid}>
                {allForms.map((form, idx) => {
                  const { redirectPath, ...cardProps } = form
                  const requirementLevel = (form as any)
                    .requirementLevel as RequirementLevel
                  const badgeType =
                    form.status === FormCompletionStatus.COMPLETED
                      ? undefined
                      : requirementLevel === MANDATORY
                        ? 'Mandatory'
                        : requirementLevel === RECOMMENDED
                          ? 'Required'
                          : 'Optional'
                  // Idea Submission Overview card should never be locked; other cards lock until Idea Submission completed
                  const locked =
                    form.formType === FormDashboardFormType.IdeaSubForm
                      ? false
                      : !isIdeaSubmissionCompleted
                  const extraClass = idx === 0 ? styles.featuredCard : undefined
                  return (
                    <FormCard
                      key={`form-${idx}`}
                      completed={form.status === FormCompletionStatus.COMPLETED}
                      disabled={redirectPath === undefined}
                      locked={locked}
                      className={extraClass}
                      {...cardProps}
                      badgeType={badgeType as any}
                      showMetaRow={
                        form.formType !== FormDashboardFormType.IdeaSubForm
                      }
                      secondaryBadgeLabel={
                        requirementLevel === MANDATORY &&
                        form.status !== FormCompletionStatus.COMPLETED
                          ? 'Innovation'
                          : undefined
                      }
                      titleIcon={
                        redirectPath === undefined ? (
                          <img src={lockIconSvg} alt="Locked" />
                        ) : requirementLevel === MANDATORY ? (
                          <img src={lightBulbSvg} alt="Idea" />
                        ) : locked ? (
                          <img src={lockIconSvg} alt="Locked" />
                        ) : undefined
                      }
                      onAction={
                        locked || redirectPath === undefined
                          ? undefined
                          : () => navigate(redirectPath)
                      }
                    />
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default FormDashboard
