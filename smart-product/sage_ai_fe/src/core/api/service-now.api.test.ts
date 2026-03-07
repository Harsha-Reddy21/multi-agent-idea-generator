import { beforeEach, describe, expect, it, vi } from 'vitest'

import { serviceNowApi } from './service-now.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async get<T>(_url?: string, _config?: any): Promise<T> {
      return {} as T
    }
  },
}))

describe('ServiceNowApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getApprovedIdeasDashboard', () => {
    it('should call get with default parameters', async () => {
      const mockResponse = {
        approved_count: 10,
        top_ideas: [
          { id: '1', title: 'Idea 1', date: '2024-01-01' },
          { id: '2', title: 'Idea 2', date: '2024-01-02' },
        ],
      }

      const getSpy = vi.spyOn(serviceNowApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await serviceNowApi.getApprovedIdeasDashboard()

      expect(getSpy).toHaveBeenCalledWith('/approved-ideas-dashboard', {
        params: {
          days: 30,
          limit: 2,
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should call get with custom days parameter', async () => {
      const mockResponse = {
        approved_count: 5,
        top_ideas: [],
      }

      const getSpy = vi.spyOn(serviceNowApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      await serviceNowApi.getApprovedIdeasDashboard(7)

      expect(getSpy).toHaveBeenCalledWith('/approved-ideas-dashboard', {
        params: {
          days: 7,
          limit: 2,
        },
      })
    })

    it('should call get with custom limit parameter', async () => {
      const mockResponse = {
        approved_count: 20,
        top_ideas: [
          { id: '1', title: 'Idea 1', date: '2024-01-01' },
          { id: '2', title: 'Idea 2', date: '2024-01-02' },
          { id: '3', title: 'Idea 3', date: '2024-01-03' },
          { id: '4', title: 'Idea 4', date: '2024-01-04' },
          { id: '5', title: 'Idea 5', date: '2024-01-05' },
        ],
      }

      const getSpy = vi.spyOn(serviceNowApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      await serviceNowApi.getApprovedIdeasDashboard(30, 5)

      expect(getSpy).toHaveBeenCalledWith('/approved-ideas-dashboard', {
        params: {
          days: 30,
          limit: 5,
        },
      })
    })

    it('should call get with both custom parameters', async () => {
      const mockResponse = {
        approved_count: 0,
        top_ideas: [],
      }

      const getSpy = vi.spyOn(serviceNowApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      await serviceNowApi.getApprovedIdeasDashboard(90, 10)

      expect(getSpy).toHaveBeenCalledWith('/approved-ideas-dashboard', {
        params: {
          days: 90,
          limit: 10,
        },
      })
    })

    it('should handle empty response', async () => {
      const mockResponse = {
        approved_count: 0,
        top_ideas: [],
      }

      const getSpy = vi.spyOn(serviceNowApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await serviceNowApi.getApprovedIdeasDashboard(30, 2)

      expect(result.approved_count).toBe(0)
      expect(result.top_ideas).toHaveLength(0)
    })

    it('should propagate errors from base API', async () => {
      const mockError = new Error('Service Now API error')
      const getSpy = vi.spyOn(serviceNowApi as any, 'get')
      getSpy.mockRejectedValue(mockError)

      await expect(
        serviceNowApi.getApprovedIdeasDashboard()
      ).rejects.toThrow('Service Now API error')
    })
  })
})
