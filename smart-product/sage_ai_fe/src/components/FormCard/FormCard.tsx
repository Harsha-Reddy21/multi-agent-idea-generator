// Removed LdsBadge in favor of custom Badge component
import { LdsIcon, LdsImage, LdsTooltip } from '@elilillyco/ux-lds-react'
import React from 'react'

import redStarIcon from '../../assets/ai_assist.svg'
import clockIcon from '../../assets/clock-icon.svg'
import { Badge } from '../Badge/Badge'
import { BadgeType } from '../FormContainer/types'
import styles from './FormCard.module.scss'

export interface FormCardProps {
  disabled?: boolean
  required?: boolean
  completed?: boolean
  locked?: boolean
  title: string
  text: string
  duration?: string
  stepCount?: number
  aiFieldPercentage?: number
  className?: string
  'data-testid'?: string
  actionLabel?: string
  onAction?: () => void
  showActionButton?: boolean
  actionVariant?: string
  /** Optional icon rendered just before the title text */
  titleIcon?: React.ReactNode
  /** (Deprecated) Approval Index value; retained for backwards compatibility but not displayed */
  approvalIndex?: number | string
  /** Classification for badge prior to completion; when completed always displays Submitted */
  badgeType?: 'Mandatory' | 'Required' | 'Optional'
  /** Optional secondary badge shown adjacent to primary badge */
  secondaryBadgeLabel?: string
  /** Controls visibility of metaRow (duration, steps, AI fields). Defaults to true. */
  showMetaRow?: boolean
  /** (Removed) Context strip props deprecated after simplification */
  contextStripTitle?: never
  contextStripBody?: never
  contextStripVariant?: never
  contextStripIcon?: never
}

export const FormCard: React.FC<FormCardProps> = ({
  completed = false,
  locked = false,
  title,
  text,
  duration,
  stepCount,
  aiFieldPercentage,
  className,
  disabled,
  'data-testid': testId = 'form-card',
  onAction,
  titleIcon,
  badgeType,
  //secondaryBadgeLabel,
  showMetaRow = true,
}) => {
  const durationLabel = duration || undefined

  const isInteractive = !!onAction && !locked && !disabled

  const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (!isInteractive) return
    onAction?.()
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
    if (!isInteractive) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onAction?.()
    }
  }

  return (
    <div
      className={[
        styles.formCard,
        isInteractive ? styles.clickable : '',
        locked ? styles.locked : '',
        completed && !locked ? styles.completed : '', // locked takes precedence over completed for border color
        !showMetaRow ? styles.noMetaRow : '',
        badgeType === 'Optional' && !completed && !locked
          ? styles.optional
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role={isInteractive ? 'button' : 'group'}
      aria-label={title}
      aria-disabled={!isInteractive}
      tabIndex={isInteractive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={testId}
    >
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          {titleIcon && (
            <span className={styles.titleIcon} aria-hidden="true">
              {titleIcon}
            </span>
          )}
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.badges} aria-label="status badges">
          {(() => {
            const label = completed ? 'Submitted' : badgeType
            if (!label) return null
            let type: BadgeType
            if (completed) type = 'submitted'
            else if (label === 'Mandatory') type = 'mandatory'
            else if (label === 'Required') type = 'required'
            else type = 'optional'
            return <Badge text={label} type={type} />
          })()}
          {/** TODO: This is be to uncommented once BE is implemented */}
          {/* {secondaryBadgeLabel && !completed && (
            <div
              className={styles.aiFieldsPill}
              aria-label="AI Fields availability"
            >
              <LdsImage
                src={redStarIcon}
                alt="Red star icon"
                aria-hidden="true"
              />
              <p>
                Available on{' '}
                {typeof aiFieldPercentage === 'number'
                  ? `${aiFieldPercentage}%`
                  : '—'}{' '}
                Fields
              </p>
            </div>
          )} */}
        </div>
      </div>

      {aiFieldPercentage && aiFieldPercentage !== 0 ? (
        <div className={styles.approvalIndexRow} aria-label="approval index">
          <span className={styles.approvalIndexIcon} aria-hidden="true">
            <LdsImage src={redStarIcon} alt="Red star icon" />
          </span>
          <span className={styles.approvalIndexText}>
            Approval Index:{' '}
            {typeof aiFieldPercentage === 'number'
              ? `${aiFieldPercentage}%`
              : '—'}
          </span>
          <LdsTooltip tooltipMode="text" hideIcon>
            <LdsTooltip.Text>
              <LdsIcon name="copy inline" className="info"></LdsIcon>
            </LdsTooltip.Text>
            <LdsTooltip.Description>
              The Approval Index reflects the likelihood of this form being
              approved.
            </LdsTooltip.Description>
          </LdsTooltip>
        </div>
      ) : null}

      <p className={styles.text}>{text}</p>
      {!completed && showMetaRow && (
        <div className={styles.metaRow}>
          {(durationLabel || typeof stepCount === 'number') && (
            <div className={styles.metaRow} aria-label="form metadata">
              {(durationLabel ||
                (typeof stepCount === 'number' && stepCount > 0)) && (
                <span className={styles.metaCompactGroup}>
                  {durationLabel && (
                    <span className={styles.metaItem}>
                      <LdsImage
                        src={clockIcon}
                        alt="Estimated Time"
                        className={styles.clockIcon}
                      />
                      {durationLabel}
                    </span>
                  )}
                  {durationLabel &&
                    typeof stepCount === 'number' &&
                    stepCount > 0 && (
                      <span className={styles.metaSeparator} aria-hidden="true">
                        |
                      </span>
                    )}
                  {typeof stepCount === 'number' && stepCount > 0 && (
                    <span
                      className={styles.metaItem}
                    >{`${stepCount} steps`}</span>
                  )}
                </span>
              )}
            </div>
          )}
          {/** TODO: This is to be uncommented once BE is implemented */}
          {/* Show original non-pill AI fields info for all cards except the one using secondary badge pill */}
          {/* {!secondaryBadgeLabel && (
            <div
              className={styles.aiFieldsInfo}
              aria-label="AI Fields availability"
            >
              <LdsImage
                src={redStarIcon}
                alt="Red star icon"
                aria-hidden="true"
              />
              <p>
                Available on{' '}
                <strong>
                  {typeof aiFieldPercentage === 'number'
                    ? `${aiFieldPercentage}%`
                    : '—'}{' '}
                  Fields
                </strong>
              </p>
            </div>
          )} */}
        </div>
      )}
      {/* Action button removed; card surface now handles click (see isInteractive). */}
    </div>
  )
}

export default FormCard
