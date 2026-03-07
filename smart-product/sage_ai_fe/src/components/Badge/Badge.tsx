import { LdsImage } from '@elilillyco/ux-lds-react'
import React from 'react'

import { BadgeProps } from '@/core/models/badge.model'

import styles from './Badge.module.scss'

export const Badge: React.FC<BadgeProps> = ({
  text,
  type,
  icon,
  iconSrc,
  backgroundColor,
  borderColor,
  textColor,
  light = false,
  className,
  'data-testid': dt = 'badge',
}) => {
  const variantClass =
    type === 'submitted'
      ? styles.submitted
      : type === 'mandatory'
        ? styles.mandatory
        : type === 'required'
          ? styles.required
          : light
            ? styles.optionalLight
            : styles.optional

  const styleOverride: React.CSSProperties | undefined =
    type === 'optional' && (backgroundColor || borderColor || textColor)
      ? {
          background: backgroundColor,
          borderColor: borderColor,
          color: textColor,
        }
      : undefined

  return (
    <span
      className={[
        styles.badgeBase,
        variantClass,
        styleOverride ? styles.overrideColors : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={text}
      role="status"
      data-testid={dt}
      style={styleOverride}
    >
      {icon ? (
        <span className={styles.iconWrapper} aria-hidden="true">
          {icon}
        </span>
      ) : iconSrc ? (
        <LdsImage
          className={styles.iconImg}
          src={iconSrc}
          alt="Additional information icon"
        />
      ) : null}
      {text}
    </span>
  )
}

export default Badge
