import React from 'react'

import {
  ButtonActionType,
  FooterButtonDescriptor,
} from '../../core/models/buttons.model'
export type InputType =
  | 'text-box'
  | 'text-area'
  | 'dropdown'
  | 'radio-buttons'
  | 'documents'

export interface FieldConfig {
  id: string
  title: string
  toolTip?: boolean
  aiEnhancement?: boolean
  inputType: InputType
  tags?: string[]
  options?: string[]
  dropdownOptions?: { label: string; value: string }[]
  fileTypes?: string[] // for documents upload placeholder
  value?: any
  required?: boolean
  disabled?: boolean
}

export interface FormHeaderProps {
  formTitle: string
  formSubtitle?: React.ReactNode
  progressEnabled?: boolean
  steps?: string[]
  breadcrumbs: { text: string; href: string }[]
  activePageIndex?: number
  confidenceScore?: number
  /** Optional numeric Approval Index percentage (0-100). When provided, header shows pill. */
  approvalIndexPercentage?: number
}

export interface FormContentProps {
  fields: FieldConfig[]
  pageSize: number // legacy number of fields per step (fallback if pageFieldCounts not provided)
  pageFieldCounts?: number[] // deprecated in favor of pageDetails
  pageDetails?: { title: string; pageFieldCount: number }[] // new pagination config
  onStepChange?: (step: number) => void
  onFieldChange?: (fieldId: string, value: any) => void
  tagActions?: Record<string, (fieldId: string, tag: string) => void>
  activePageIndex?: number
  fieldsPerPage?: number
  schema?: any
  uiSchema?: any
  formData: Record<string, unknown>
  setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
  submissionId?: string
  formType?: string
  formStatus?: string
  suggestionsData?: any
  suggestionsLoading?: boolean
  suggestionsError?: string | null
  commonFields?: any
  files?: string[]
}

export interface FooterButtonConfig {
  label: string
  onClick: () => void | Promise<void>
  /** visual style type */
  type?: string
  /** legacy variant mapping if needed */
  variant?: string
  disabled?: boolean
  /** optional class hook for SCSS styling */
  className?: string
}

export interface FormFooterProps {
  footerButtons?: FooterButtonConfig[]
  /** Pattern 2 config: per-page descriptors that are mapped to actionable buttons */
  pageButtonIds?: Record<number, FooterButtonDescriptor[]>
  /** Map of action id to handler (parent-owned business logic) */
  actionHandlerMap?: Partial<
    Record<ButtonActionType, () => void | Promise<void>>
  >
  sticky?: boolean
  activePageIndex?: number
  fieldsPerPage?: number
  totalFields?: number
  setActivePageIndex?: React.Dispatch<React.SetStateAction<number>>
  pageFieldCounts?: number[]
  pageDetails?: { title: string; pageFieldCount: number }[]
  formData?: Record<string, unknown>
  onFormSubmit?: (formData: Record<string, unknown>) => void | Promise<void>
  /** Optional path to redirect to after successful submit of last page */
  submitRedirectPath?: string
  /** Handler for Save Draft button click */
  skipDocumentUpload?: boolean
  /** Form status to control button visibility */
  formStatus?: string
}

export interface FormContainerOrchestratorProps
  extends FormHeaderProps,
    Omit<FormContentProps, 'formData' | 'setFormData'>,
    Omit<FormFooterProps, 'formData' | 'onFormSubmit'> {
  fieldsPerPage?: number
  activePageIndex?: number
  initialFormData?: Record<string, unknown>
  formData?: Record<string, unknown>
  setFormData?: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
  onFormSubmit?: (formData: Record<string, unknown>) => void | Promise<void>
  submissionId?: string
  formType?: string
  formStatus?: string
  suggestionsData?: any
  suggestionsLoading?: boolean
  suggestionsError?: string | null
  hideSideImage?: boolean
  commonFields?: any
  files?: string[]
}

export interface SubmitterViewProps {
  header: FormHeaderProps
  fields: FieldConfig[]
  footerButtons?: FooterButtonConfig[]
  fieldsPerPage: number
  activePageIndex: number
  setActivePageIndex: React.Dispatch<React.SetStateAction<number>>
}

export type BadgeType = 'submitted' | 'mandatory' | 'required' | 'optional'

// Normalized error shape returned to callers
export interface ApiError {
  status?: number
  message: string
  data?: unknown
  isAxiosError: boolean
  original?: unknown
}
