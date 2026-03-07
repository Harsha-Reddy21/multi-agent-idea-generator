import { beforeEach, describe, expect, it, vi } from 'vitest'

import { formDashboardApi } from './form-dashboard.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async get<T>(_url?: string, _config?: any): Promise<T> {
      return {} as T
    }
  },
}))

describe('FormDashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFormDashboard', () => {
    it('should call get with correct parameters', async () => {
      const mockResponse = {
        forms: [
          { id: 'f1', title: 'Form 1', status: 'pending' },
          { id: 'f2', title: 'Form 2', status: 'completed' },
        ],
      }

      const getSpy = vi.spyOn(formDashboardApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await formDashboardApi.getFormDashboard('submission123')

      expect(getSpy).toHaveBeenCalledWith('', {
        params: {
          'submission-id': 'submission123',
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle special characters in submission ID', async () => {
      const mockResponse = {
        forms: [],
      }

      const getSpy = vi.spyOn(formDashboardApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      await formDashboardApi.getFormDashboard('sub-123_abc')

      expect(getSpy).toHaveBeenCalledWith('', {
        params: {
          'submission-id': 'sub-123_abc',
        },
      })
    })

    it('should handle empty forms list', async () => {
      const mockResponse = {
        message: 'success',
        data: [],
      }

      const getSpy = vi.spyOn(formDashboardApi as any, 'get')
      getSpy.mockResolvedValue(mockResponse)

      const result = await formDashboardApi.getFormDashboard('s1')

      expect(result.data).toHaveLength(0)
    })

    it('should propagate errors from base API', async () => {
      const mockError = new Error('Dashboard fetch failed')
      const getSpy = vi.spyOn(formDashboardApi as any, 'get')
      getSpy.mockRejectedValue(mockError)

      await expect(
        formDashboardApi.getFormDashboard('s1')
      ).rejects.toThrow('Dashboard fetch failed')
    })
  })
})
