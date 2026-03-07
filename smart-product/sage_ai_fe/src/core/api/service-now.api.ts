import { DashboardLatestIdeasResponse } from '../models/dashboard.model'
import { BaseApiService } from './base.api'

class ServiceNowApi extends BaseApiService {
  constructor() {
    super('service-now')
  }

  /**
   * Fetches approved ideas dashboard data
   *
   * @param days - Number of days to look back for approved ideas (default: 30)
   * @param limit - Maximum number of top ideas to return (default: 2)
   * @returns Promise with dashboard data including approved count and top ideas
   */
  async getApprovedIdeasDashboard(
    days: number = 30,
    limit: number = 2
  ): Promise<DashboardLatestIdeasResponse> {
    return this.get<DashboardLatestIdeasResponse>('/approved-ideas-dashboard', {
      params: {
        days,
        limit,
      },
    })
  }
}

export const serviceNowApi = new ServiceNowApi()
