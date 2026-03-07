import { ExtractionStatus } from './extraction-status.model'

export enum FullSubmissionStatus {
  SUBMITTED = 'submitted', // Initial status when submission is created
  COMPLETED = 'completed', // All forms completed
}

export type SubmissionStatus = 'submitted' | 'completed'

export interface UserIdeaSubmission {
  id: string
  category_id: string
  category_name: string
  status: SubmissionStatus
  submitted_at: string
  title: string
  ai_registry_form_status: string
  ai_registry_update_form_id: string | null
}

export interface UserIdeaSubmissionsResponse {
  message: string
  data: UserIdeaSubmission[]
}

export interface DashboardSubmitterDetails {
  user_id: string
  user_name: string
}

export interface TopIdeaResponse {
  ai_system_name: string
  problem_statement: string
  submitted_by: DashboardSubmitterDetails
}

export interface DashboardLatestIdeasResponse {
  approved_count: number
  days: number
  top_ideas: TopIdeaResponse[]
  message: string
}

export interface SubmissionStatusResponse {
  submission_id: string
  status: ExtractionStatus
  message: string
  created_at: string
  updated_at: string
}
