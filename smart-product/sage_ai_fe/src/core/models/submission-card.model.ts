import { SubmissionStatus } from './dashboard.model'

export interface SubmissionCardProps {
  id: string
  title: string
  description: string
  status: SubmissionStatus
  onUpdate?: (id: string) => void
  className?: string
  'data-testid'?: string
  ticketNumber?: string
  submissionCount?: number
  submitted_at?: string
  aiRegistryFormId?: string
  aiRegistryFormStatus?: string
  onRefresh?: () => void | Promise<void>
}
