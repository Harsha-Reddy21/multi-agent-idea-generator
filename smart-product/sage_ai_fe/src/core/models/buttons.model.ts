export type ButtonActionType =
  | 'cancel'
  | 'prev'
  | 'next'
  | 'saveDraft'
  | 'submit'
  | 'skipUpload'
  | 'update'

export type AiPanelButtonActionType =
  | 'cancel'
  | 'prev'
  | 'next'
  | 'proceedWithoutSelection'
  | 'useAnswer'

export interface FooterButtonDescriptor {
  action: ButtonActionType
  type?: string
  className?: string
  whenDisabled?: () => boolean
  label?: string // override default
}

export interface AiPanelFooterButtonDescriptor {
  action: AiPanelButtonActionType
  type?: string
  className?: string
  label?: string // override default
  disabled?: boolean
}
