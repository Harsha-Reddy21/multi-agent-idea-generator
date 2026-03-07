import { BadgeType } from '@/components/FormContainer/types'
export interface BadgeProps {
  text: string
  type: BadgeType
  icon?: React.ReactNode
  iconSrc?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  light?: boolean // helper flag to use lighter optional style (previous secondary badge)
  className?: string
  'data-testid'?: string
}
