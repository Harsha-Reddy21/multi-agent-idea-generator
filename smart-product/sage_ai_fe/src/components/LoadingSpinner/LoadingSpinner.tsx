import { LdsLoadingSpinner } from '@elilillyco/ux-lds-react'
import React from 'react'

import styles from './LoadingSpinner.module.scss'

interface LoadingSpinnerProps {
  message?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading form data',
}) => {
  return (
    <main className={styles.loadingContainer}>
      <div className={styles.loadingWrapper}>
        <LdsLoadingSpinner
          className="primary"
          ariaLabel={message}
          svgTitle={message}
        />
      </div>
    </main>
  )
}

export default LoadingSpinner
