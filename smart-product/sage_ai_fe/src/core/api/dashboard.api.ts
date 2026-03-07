import {
  SubmissionStatusResponse,
  UserIdeaSubmissionsResponse,
} from '../models/dashboard.model'
import { BaseApiService } from './base.api'

class DashboardApi extends BaseApiService {
  constructor() {
    super('get-user-submissions')
  }

  async getUserSubmissions(): Promise<UserIdeaSubmissionsResponse> {
    return this.get<UserIdeaSubmissionsResponse>()
  }

  async getSubmissionStatus(
    submissionId: string
  ): Promise<SubmissionStatusResponse> {
    // Create a new instance with the submission-status endpoint
    const statusService = new SubmissionStatusApi()
    return statusService.fetchStatus(submissionId)
  }
}

class SubmissionStatusApi extends BaseApiService {
  constructor() {
    super('submission-status')
  }

  async fetchStatus(submissionId: string): Promise<SubmissionStatusResponse> {
    return this.get<SubmissionStatusResponse>('', {
      params: { 'submission-id': submissionId },
    })
  }
}

export const dashboardApi = new DashboardApi()
