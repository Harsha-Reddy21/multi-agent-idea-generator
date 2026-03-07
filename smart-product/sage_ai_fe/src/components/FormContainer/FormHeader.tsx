import {
  LdsDivider,
  LdsIcon,
  LdsImage,
  LdsStepIndicator,
  LdsTooltip,
} from '@elilillyco/ux-lds-react'
import React from 'react'

import redStarIcon from '../../assets/ai_assist.svg'
import styles from './FormContainer.module.scss'
import { FormHeaderProps } from './types'

export const FormHeader: React.FC<FormHeaderProps> = ({
  formTitle,
  formSubtitle,
  progressEnabled,
  steps,
  activePageIndex,
  approvalIndexPercentage,
}) => {
  // activePageIndex is 1-based externally; normalize for zero-based indexing
  const activeIndex = activePageIndex ? activePageIndex - 1 : 0
  const totalSteps = steps?.length || 0
  const currentStepLabel = steps && steps[activeIndex]
  const nextStepLabel = steps && steps[activeIndex + 1]

  return (
    <header
      className={styles.formHeader}
      data-testid="form-header"
      aria-label="Form Header"
    >
      <div className={styles.formHeader__titleRow}>
        <h1 className={styles.formHeader__title}>{formTitle}</h1>

        {typeof approvalIndexPercentage === 'number' && (
          <div
            className={styles.formHeader__approvalIndexPill}
            aria-label={`Approval Index: ${approvalIndexPercentage}%`}
          >
            <LdsImage
              src={redStarIcon}
              alt="Approval Index Icon"
              aria-hidden="true"
              className={styles.formHeader__approvalIndexIcon}
            />
            <span className={styles.formHeader__approvalIndexText}>
              Approval Index: {approvalIndexPercentage}%
            </span>
            <LdsTooltip hideIcon tooltipMode="text">
              <LdsTooltip.Text>
                <LdsIcon
                  name="info inline"
                  className={styles.formHeader__approvalIndexInfoIcon}
                />
              </LdsTooltip.Text>
              <LdsTooltip.Description>
                Likelihood of submission approval
              </LdsTooltip.Description>
            </LdsTooltip>
          </div>
        )}
      </div>
      {formSubtitle && (
        <div className={styles.formHeader__subtitle}>{formSubtitle}</div>
      )}
      <LdsDivider className={styles.formHeader__divider} aria-hidden="true" />

      {progressEnabled && steps && steps.length > 0 && (
        <div
          className={styles.formHeader__progress}
          data-testid="form-header-progress"
          aria-label="Form Progress"
        >
          {/* Accessible (but visually hidden) original step indicator for screen readers */}
          <div
            aria-hidden="true"
            className={styles.formHeader__progressHiddenNative}
          >
            <LdsStepIndicator
              forceCondensedMode={true}
              activeIndex={activeIndex}
              completeLabel="Complete!"
              nextLabel="Next"
              ofLabel="of"
              showStepNumbers
              stepCompleteLabel="Complete"
              stepLabel="Step"
              steps={[...steps]}
            />
          </div>

          {/* Custom Figma-aligned layout */}
          <div className={styles.formHeader__progressHeaderRow}>
            <span
              className={styles.formHeader__currentStepLabel}
              aria-live="polite"
              aria-label={`Current step: ${currentStepLabel}`}
            >
              {currentStepLabel}
            </span>
            {nextStepLabel && (
              <span
                className={styles.formHeader__nextStepLabel}
                aria-label={`Next step: ${nextStepLabel}`}
              >
                Next: {nextStepLabel}
              </span>
            )}
          </div>
          <div className={styles.formHeader__progressMetaRow}>
            <span
              className={styles.formHeader__stepCount}
              aria-label={`Step ${activeIndex + 1} of ${totalSteps}`}
            >
              {activeIndex + 1} of {totalSteps}
            </span>
            <div
              className={styles.formHeader__stepPills}
              role="list"
              aria-label="Form steps progress"
            >
              {steps.map((_, i) => {
                const state =
                  i < activeIndex
                    ? 'completed'
                    : i === activeIndex
                      ? 'active'
                      : 'default'
                return (
                  <span
                    key={i}
                    role="listitem"
                    aria-label={`Step ${i + 1} ${state}`}
                    className={
                      `${styles.formHeader__stepPill} ` +
                      (state === 'completed'
                        ? styles.formHeader__stepPillCompleted
                        : state === 'active'
                          ? styles.formHeader__stepPillActive
                          : styles.formHeader__stepPillDefault)
                    }
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default FormHeader
