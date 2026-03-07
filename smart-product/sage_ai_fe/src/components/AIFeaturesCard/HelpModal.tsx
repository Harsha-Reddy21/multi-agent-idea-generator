import {
  LdsButton,
  LdsDivider,
  LdsIcon,
  LdsSwitch,
} from '@elilillyco/ux-lds-react'
import React from 'react'

import styles from './HelpModal.module.scss'

interface HelpModalProps {
  onClose: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className={styles.helpModalOverlay}>
      <div className={styles.helpModal}>
        <div className={styles.helpHeader}>
          <LdsButton
            className={styles.backButton}
            onClick={onClose}
            aria-label="Close help"
          >
            <LdsIcon name="arrow-left" className={styles.backIcon} />
          </LdsButton>
          <span className={styles.helpTitle}>Help</span>
          <LdsIcon name="question" className={styles.helpIcon} />
        </div>
        <LdsDivider aria-hidden="true" />

        <div className={styles.helpContent}>
          <div className={styles.helpSection}>
            <div className={styles.helpSectionHeader}>
              <div className={styles.aiSwitch}>
                <LdsSwitch
                  id={`ai-switch-help-modal`}
                  label=""
                  defaultChecked={true}
                />
              </div>
              <h3 className={styles.helpSectionTitle}>AI Response Builder</h3>
            </div>
            <p className={styles.helpDescription}>
              This is a one stop shop for all the help to build your answer
              using integrated AI
            </p>

            <div className={styles.helpSubSection}>
              <h4 className={styles.helpSubTitle}>When to use it:</h4>
              <p className={styles.helpText}>
                Use this feature when you need to quick brainstorm/enhance/avoid
                redundancy on your data field.
              </p>
            </div>
          </div>

          <div className={styles.helpSection}>
            <div className={styles.helpSectionHeader}>
              <LdsButton
                classes="primary compact"
                className={styles.useButton}
                data-testid="use-this-button"
              >
                Use Answer
              </LdsButton>
              <h3 className={styles.helpSectionTitle}>Use AI Data Extract</h3>
            </div>
            <p className={styles.helpDescription}>
              This is a summary to the key information from your uploaded
              documents, streamlining the input process for greater speed and
              accuracy from this particular input field
            </p>

            <div className={styles.helpSubSection}>
              <h4 className={styles.helpSubTitle}>When to use it:</h4>
              <p className={styles.helpText}>
                Use this feature when you need to quickly and accurately
                summarize the most important information from your uploaded
                documents. It is especially valuable when you want to reduce
                potential errors—by automatically extracting and presenting key
                points for review or entry in this particular field
              </p>
            </div>
          </div>

          <div className={styles.helpSection}>
            <div className={styles.helpSectionHeader}>
              <LdsButton
                className={styles.checkCoverageButton}
                classes="primary outlined"
              >
                Check coverage
              </LdsButton>
            </div>
            <p className={styles.helpDescription}>
              Check Coverage reviews your input to spot gaps, ensuring every
              response is complete. Suggestions surface the most relevant
              recommendations as you type, helping you make confident choices
            </p>
            <div className={styles.helpSubSection}>
              <h4 className={styles.helpSubTitle}>When to use it:</h4>
              <p className={styles.helpText}>
                Use this feature when you want to ensure that your responses are
                thorough and nothing important is overlooked. It’s particularly
                helpful when you’re aiming for complete coverage of requirements
                or topics, and when you want proactive recommendations that make
                selecting the best options faster and more confident—especially
                as you compose your input
              </p>
            </div>
          </div>

          <div className={styles.helpSection}>
            <div className={styles.helpSectionHeader}>
              <LdsButton
                className={styles.checkCoverageButton}
                classes="primary outlined"
              >
                Edit
              </LdsButton>
            </div>
            <p className={styles.helpDescription}>
              You can make changes to the AI summary and use this as the answer
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpModal
