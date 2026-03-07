import React, { ReactNode } from 'react'

import styles from './LandingPageCard.module.scss'

interface LandingPageCardProps {
  /** Card heading */
  title: string
  /** Optional supporting text directly under the title */
  description?: ReactNode
  /** Optional emphasized line rendered above description (e.g., counts) */
  descriptionEmphasis?: ReactNode
  /** Optional aria-label override */
  ariaLabel?: string
  /** Flexible body content (e.g., video, actions, etc.) */
  children?: ReactNode
  /** When true, long description text preserves line breaks */
  preserveWhitespace?: boolean
}

const LandingPageCard: React.FC<LandingPageCardProps> = ({
  title,
  description,
  descriptionEmphasis,
  ariaLabel,
  children,
  preserveWhitespace = true,
}) => {
  return (
    <div
      className={styles.card}
      data-testid="landing-page-card"
      aria-label={ariaLabel ? ariaLabel : title}
    >
      <h3 className={styles.title}>{title}</h3>
      {(descriptionEmphasis || description) && (
        <div className={styles.descriptionWrapper}>
          {descriptionEmphasis && (
            <span
              className={`${styles.description} ${styles.descriptionEmphasis}`}
            >
              {descriptionEmphasis}
            </span>
          )}
          {description && (
            <span
              className={styles.description}
              style={
                preserveWhitespace ? { whiteSpace: 'pre-line' } : undefined
              }
            >
              {description}
            </span>
          )}
        </div>
      )}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  )
}

export default LandingPageCard
