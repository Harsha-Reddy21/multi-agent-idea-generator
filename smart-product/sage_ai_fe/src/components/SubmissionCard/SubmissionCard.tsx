import { LdsBadge, LdsButton } from '@elilillyco/ux-lds-react'
import React, { useState } from 'react'

import { FormCompletionStatus } from '@/core/models/form-completion-status.enum'

import { STATUS_LABEL_MAP } from '../../core/constants'
import { FullSubmissionStatus } from '../../core/models/dashboard.model'
import { SubmissionCardProps } from '../../core/models/submission-card.model'
import EnhancedAIRegistryForm from '../EnhancedAIRegistryForm'
import styles from './SubmissionCard.module.scss'

function formatDate(dateString: any) {
  const dateObj = new Date(dateString)
  if (isNaN(dateObj.getTime())) return dateString
  // Use UTC-based getters to avoid timezone shifting at day boundaries
  const day = dateObj.getUTCDate().toString().padStart(2, '0')
  const month = dateObj.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
  const year = dateObj.getUTCFullYear()
  return `${day} ${month} ${year}`
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({
  id,
  title,
  status,
  onUpdate,
  onRefresh,
  className,
  'data-testid': testId,
  ticketNumber,
  submitted_at,
  aiRegistryFormId = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const statusClass =
    status === FullSubmissionStatus.SUBMITTED
      ? styles['status-inprogress']
      : status === FullSubmissionStatus.COMPLETED
        ? styles['status-completed']
        : ''

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleUpdateSuccess = async () => {
    // Trigger parent refresh if callback provided
    if (onRefresh) {
      await onRefresh()
    }
  }

  return (
    <div
      className={[styles.submissionCard, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={title}
      data-testid={testId}
    >
      <div className={styles.headerRow}>
        <div>
          <div
            className={styles.titleBlock}
            onClick={() => onUpdate && onUpdate(id)}
          >
            <h3 className={styles.title}>{title}</h3>
          </div>
          <div
            className={styles.subText}
            onClick={() => onUpdate && onUpdate(id)}
          >
            <div>
              <span className={styles.submissionIdLabel}>Submission ID:</span>{' '}
              <span className={styles.ticketNumber}>{ticketNumber}</span>
            </div>

            <div>
              <span className={styles.submissionIdLabel}>Created On:</span>{' '}
              <span className={styles.ticketNumber}>
                {submitted_at ? formatDate(submitted_at) : ''}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.badges}>
          <LdsBadge className={[styles.statusBadge, statusClass].join(' ')}>
            {status === FullSubmissionStatus.SUBMITTED
              ? STATUS_LABEL_MAP.submitted
              : status === FullSubmissionStatus.COMPLETED
                ? STATUS_LABEL_MAP.completed
                : STATUS_LABEL_MAP[status]}
          </LdsBadge>
        </div>
      </div>
      <div className={styles.actionsRow}>
        {onUpdate && (
          <>
            <LdsButton
              classes="compact primary radius-sm"
              className={styles.viewDetailsBtnCls}
              onClick={() => onUpdate(id)}
              aria-label="View Submission Details"
            >
              View Details
            </LdsButton>
            {status === FormCompletionStatus.COMPLETED && (
              <LdsButton
                classes="compact link radius-sm"
                className={styles.updateFormBtn}
                onClick={handleOpenModal}
                aria-label="Update AI Registry Form"
              >
                Update AI Registry Form
              </LdsButton>
            )}
          </>
        )}
      </div>

      <EnhancedAIRegistryForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        submissionId={ticketNumber || id}
        aiRegistryFormId={aiRegistryFormId}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  )
}

export default SubmissionCard
