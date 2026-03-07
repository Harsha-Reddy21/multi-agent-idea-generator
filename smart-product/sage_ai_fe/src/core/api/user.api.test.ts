import { beforeEach, describe, expect, it, vi } from 'vitest'

import { userApi } from './user.api'

// Mock the base API
vi.mock('./base.api', () => ({
  BaseApiService: class {
    protected async get<T>(): Promise<T> {
      return {} as T
    }
  },
}))

describe('UserApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserInfo', () => {
    it('should call get with correct URL', async () => {
      const mockUserProfile = {
        user_id: 'user123',
        email: 'test@lilly.com',
        name: 'Test User',
        role: 'developer',
      }

      const getSpy = vi.spyOn(userApi as any, 'get')
      getSpy.mockResolvedValue(mockUserProfile)

      const result = await userApi.getUserInfo()

      expect(getSpy).toHaveBeenCalledWith('/user_info')
      expect(result).toEqual(mockUserProfile)
    })

    it('should handle empty user profile', async () => {
      const mockUserProfile = {
        user_id: '',
        email: '',
        name: '',
        role: '',
      }

      const getSpy = vi.spyOn(userApi as any, 'get')
      getSpy.mockResolvedValue(mockUserProfile)

      const result = await userApi.getUserInfo()

      expect(result).toEqual(mockUserProfile)
    })

    it('should propagate errors from base API', async () => {
      const mockError = new Error('Unauthorized')
      const getSpy = vi.spyOn(userApi as any, 'get')
      getSpy.mockRejectedValue(mockError)

      await expect(userApi.getUserInfo()).rejects.toThrow('Unauthorized')
    })
  })
})
