import { FormDashboardListResponse } from '../models/form.model'
import { BaseApiService } from './base.api'

class FormDashboardApi extends BaseApiService {
  constructor() {
    super('form-dashboard')
  }

  async getFormDashboard(
    submissionId: string
  ): Promise<FormDashboardListResponse> {
    return this.get('', {
      params: {
        'submission-id': submissionId,
      },
    })
  }
}

export const formDashboardApi = new FormDashboardApi()
