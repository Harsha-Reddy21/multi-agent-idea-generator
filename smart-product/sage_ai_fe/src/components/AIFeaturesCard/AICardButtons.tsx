import { LdsButton } from '@elilillyco/ux-lds-react'
import React, { useMemo } from 'react'

import { AiFeaturesButtonLabels, AiPanelButtonActionId } from '@/core/constants'
import {
  AiPanelButtonActionType,
  AiPanelFooterButtonDescriptor,
} from '@/core/models/buttons.model'

import styles from './AIFeaturesCard.module.scss'

export type AICardButtonsProps = {
  pageButtonIds: Partial<Record<number, AiPanelFooterButtonDescriptor[]>>
  activePageIndex: number
  setActivePageIndex: React.Dispatch<React.SetStateAction<number>>
  actionHandlerMap: Record<AiPanelButtonActionType, () => void | Promise<void>>
}

type FooterButtonConfig = {
  label: string
  onClick: () => void
  type?: string
  className?: string
  disabled?: boolean
}

/**
 * AICardButtons renders the AI panel footer buttons for the current page.
 * It maps the descriptors from pageButtonIds[activePageIndex] to concrete button configs
 * using the provided actionHandlerMap, and renders them as LdsButton components.
 */
export const AICardButtons: React.FC<AICardButtonsProps> = ({
  pageButtonIds,
  activePageIndex,
  actionHandlerMap,
}) => {
  const currentFooterButtons: FooterButtonConfig[] = useMemo(() => {
    const descriptors: AiPanelFooterButtonDescriptor[] =
      pageButtonIds[activePageIndex] || []

    return descriptors.map(d => {
      const parentHandler = actionHandlerMap?.[d.action]
      const wrapped = () => {
        // Don't invoke if disabled
        if (d.disabled) return

        if (parentHandler) {
          Promise.resolve(parentHandler()).catch(() => {
            // Swallow errors for now; can surface toast/logging later
          })
        }
      }

      return {
        label: d.label || AiFeaturesButtonLabels[d.action],
        onClick: wrapped,
        type: d.type,
        className: d.className,
        disabled: d.disabled,
      }
    })
  }, [pageButtonIds, activePageIndex, actionHandlerMap])

  return (
    <div className={styles.footerButtons} data-testid="ai-card-buttons">
      {currentFooterButtons.map((btn, idx) => (
        <LdsButton
          key={idx}
          data-testid={`ai-card-btn-${idx}`}
          aria-label={btn.label}
          onClick={btn.onClick}
          classes={btn.type}
          className={btn.className || 'aiCardFooter__button'}
          disabled={btn.disabled}
          icon={
            btn.label === AiFeaturesButtonLabels[AiPanelButtonActionId.next]
              ? 'arrow-right'
              : undefined
          }
        >
          {btn.label}
        </LdsButton>
      ))}
    </div>
  )
}

export default AICardButtons
