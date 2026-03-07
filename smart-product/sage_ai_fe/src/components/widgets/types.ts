import { WidgetProps } from '@rjsf/utils'
import React from 'react'

// Centralized TypeScript types

export type InnerRender = (props: WidgetProps) => React.ReactNode

export interface WrapperOptions {
  includeTags?: boolean
  skipTitleRow?: boolean
}

export interface CustomCheckboxWidgetProps extends WidgetProps {
  shouldPreselect?: boolean
  preselectedEnumOption?: string
}

export interface FileMetadata {
  name: string
  size: string
  file: File
}
