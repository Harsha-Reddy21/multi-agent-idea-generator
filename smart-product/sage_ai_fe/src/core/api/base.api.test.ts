import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BaseApiService } from './base.api'

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockAxiosCreate, mockIsAxiosError, mockApi } = vi.hoisted(() => {
  const mockApiInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  }

  return {
    mockApi: mockApiInstance,
    mockAxiosCreate: vi.fn(() => mockApiInstance),
    mockIsAxiosError: vi.fn(),
  }
})

// Mock axios module
vi.mock('axios', () => {
  return {
    default: {
      create: mockAxiosCreate,
      isAxiosError: mockIsAxiosError,
    },
  }
})

class TestApiService extends BaseApiService {
  constructor() {
    super('test-endpoint')
  }

  public async testGet<T>(url?: string) {
    return this.get<T>(url)
  }

  public async testPost<T, D>(data: D, url?: string) {
    return this.post<T, D>(data, url)
  }

  public async testPut<T, D>(data: D, url?: string) {
    return this.put<T, D>(data, url)
  }

  public async testPatch<T, D>(data: D, url?: string) {
    return this.patch<T, D>(data, url)
  }

  public async testDelete<T>(url?: string) {
    return this.delete<T>(url)
  }
}

describe('BaseApiService', () => {
  let service: TestApiService

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all mock functions
    mockApi.get.mockReset()
    mockApi.post.mockReset()
    mockApi.put.mockReset()
    mockApi.patch.mockReset()
    mockApi.delete.mockReset()
    mockApi.interceptors.request.use.mockReset()
    mockApi.interceptors.response.use.mockReset()
    mockAxiosCreate.mockClear()
    mockIsAxiosError.mockClear()

    service = new TestApiService()
  })

  describe('Constructor', () => {
    it('should create axios instance with correct baseURL', () => {
      expect(mockAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '/api/test-endpoint',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        })
      )
    })

    it('should set up interceptors', () => {
      expect(mockApi.interceptors.request.use).toHaveBeenCalled()
      expect(mockApi.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('GET method', () => {
    it('should make GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockApi.get.mockResolvedValue({ data: mockData })

      const result = await service.testGet<typeof mockData>('/test')

      expect(mockApi.get).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockData)
    })

    it('should make GET request with empty URL', async () => {
      const mockData = { success: true }
      mockApi.get.mockResolvedValue({ data: mockData })

      const result = await service.testGet<typeof mockData>()

      expect(mockApi.get).toHaveBeenCalledWith('', undefined)
      expect(result).toEqual(mockData)
    })

    it('should make GET request with config', async () => {
      const mockData = { items: [] }
      mockApi.get.mockResolvedValue({ data: mockData })

      await service.testGet<typeof mockData>('/list')

      expect(mockApi.get).toHaveBeenCalled()
    })

    it('should handle GET request error', async () => {
      const mockError = {
        message: 'Network Error',
        response: {
          data: { message: 'Server error' },
          status: 500,
        },
        status: 500,
      }
      mockApi.get.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(service.testGet('/test')).rejects.toMatchObject({
        message: 'Server error',
        status: 500,
        isAxiosError: true,
      })
    })
  })

  describe('POST method', () => {
    it('should make POST request and return data', async () => {
      const requestData = { name: 'New Item' }
      const responseData = { id: 1, ...requestData }
      mockApi.post.mockResolvedValue({ data: responseData })

      const result = await service.testPost<
        typeof responseData,
        typeof requestData
      >(requestData, '/create')

      expect(mockApi.post).toHaveBeenCalledWith(
        '/create',
        requestData,
        undefined
      )
      expect(result).toEqual(responseData)
    })

    it('should make POST request with empty URL', async () => {
      const requestData = { value: 123 }
      const responseData = { success: true }
      mockApi.post.mockResolvedValue({ data: responseData })

      const result = await service.testPost<
        typeof responseData,
        typeof requestData
      >(requestData)

      expect(mockApi.post).toHaveBeenCalledWith('', requestData, undefined)
      expect(result).toEqual(responseData)
    })

    it('should handle POST request error', async () => {
      const mockError = {
        message: 'Bad Request',
        response: {
          data: { detail: 'Invalid data' },
          status: 400,
        },
        status: 400,
      }
      mockApi.post.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(
        service.testPost({ data: 'test' }, '/create')
      ).rejects.toMatchObject({
        message: 'Invalid data',
        status: 400,
        isAxiosError: true,
      })
    })
  })

  describe('PUT method', () => {
    it('should make PUT request and return data', async () => {
      const requestData = { id: 1, name: 'Updated' }
      const responseData = { ...requestData, updated: true }
      mockApi.put.mockResolvedValue({ data: responseData })

      const result = await service.testPut<
        typeof responseData,
        typeof requestData
      >(requestData, '/update/1')

      expect(mockApi.put).toHaveBeenCalledWith(
        '/update/1',
        requestData,
        undefined
      )
      expect(result).toEqual(responseData)
    })

    it('should handle PUT request error', async () => {
      const mockError = {
        message: 'Not Found',
        response: {
          data: 'Resource not found',
          status: 404,
        },
        status: 404,
      }
      mockApi.put.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(
        service.testPut({ id: 999 }, '/update/999')
      ).rejects.toMatchObject({
        message: 'Resource not found',
        status: 404,
        isAxiosError: true,
      })
    })
  })

  describe('PATCH method', () => {
    it('should make PATCH request and return data', async () => {
      const requestData = { status: 'active' }
      const responseData = { id: 1, status: 'active' }
      mockApi.patch.mockResolvedValue({ data: responseData })

      const result = await service.testPatch<
        typeof responseData,
        typeof requestData
      >(requestData, '/partial-update/1')

      expect(mockApi.patch).toHaveBeenCalledWith(
        '/partial-update/1',
        requestData,
        undefined
      )
      expect(result).toEqual(responseData)
    })

    it('should handle PATCH request error', async () => {
      const mockError = {
        message: 'Conflict',
        response: {
          data: { error: 'Version mismatch' },
          status: 409,
        },
        status: 409,
      }
      mockApi.patch.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(
        service.testPatch({ version: 2 }, '/update')
      ).rejects.toMatchObject({
        message: 'Version mismatch',
        status: 409,
        isAxiosError: true,
      })
    })
  })

  describe('DELETE method', () => {
    it('should make DELETE request and return data', async () => {
      const responseData = { success: true }
      mockApi.delete.mockResolvedValue({ data: responseData })

      const result = await service.testDelete<typeof responseData>('/delete/1')

      expect(mockApi.delete).toHaveBeenCalledWith('/delete/1', undefined)
      expect(result).toEqual(responseData)
    })

    it('should handle DELETE request error', async () => {
      const mockError = {
        message: 'Forbidden',
        response: {
          data: { message: 'Permission denied' },
          status: 403,
        },
        status: 403,
      }
      mockApi.delete.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(service.testDelete('/delete/1')).rejects.toMatchObject({
        message: 'Permission denied',
        status: 403,
        isAxiosError: true,
      })
    })
  })

  describe('Error handling', () => {
    it('should handle Axios error with message field', async () => {
      const mockError = {
        message: 'Request failed',
        response: {
          data: { message: 'Custom error message' },
          status: 500,
        },
        status: 500,
      }
      mockApi.get.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(service.testGet('/test')).rejects.toMatchObject({
        message: 'Custom error message',
        status: 500,
        isAxiosError: true,
      })
    })

    it('should handle Axios error with detail field', async () => {
      const mockError = {
        message: 'Request failed',
        response: {
          data: { detail: 'Detailed error message' },
          status: 422,
        },
        status: 422,
      }
      mockApi.get.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(service.testGet('/test')).rejects.toMatchObject({
        message: 'Detailed error message',
        status: 422,
        isAxiosError: true,
      })
    })

    it('should handle Axios error with error field', async () => {
      const mockError = {
        message: 'Request failed',
        response: {
          data: { error: 'Error field message' },
          status: 400,
        },
        status: 400,
      }
      mockApi.get.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(service.testGet('/test')).rejects.toMatchObject({
        message: 'Error field message',
        status: 400,
        isAxiosError: true,
      })
    })

    it('should handle Axios error with string data', async () => {
      const mockError = {
        message: 'Request failed',
        response: {
          data: 'Plain string error',
          status: 500,
        },
        status: 500,
      }
      mockApi.get.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(service.testGet('/test')).rejects.toMatchObject({
        message: 'Plain string error',
        status: 500,
        isAxiosError: true,
      })
    })

    it('should handle Axios error without response data', async () => {
      const mockError = {
        message: 'Network Error',
        response: undefined,
        status: undefined,
      }
      mockApi.get.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(true)

      await expect(service.testGet('/test')).rejects.toMatchObject({
        message: 'Network Error',
        status: undefined,
        isAxiosError: true,
      })
    })

    it('should handle non-Axios error', async () => {
      const mockError = new Error('Unexpected error')
      mockApi.get.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(false)

      await expect(service.testGet('/test')).rejects.toMatchObject({
        message: 'Unexpected error',
        status: undefined,
        isAxiosError: false,
      })
    })

    it('should handle unknown error type', async () => {
      const mockError = 'String error'
      mockApi.get.mockRejectedValue(mockError)
      mockIsAxiosError.mockReturnValue(false)

      await expect(service.testGet('/test')).rejects.toMatchObject({
        message: 'Unexpected error',
        status: undefined,
        isAxiosError: false,
      })
    })
  })

  describe('Interceptors', () => {
    it('should have request interceptor configured', () => {
      expect(mockApi.interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should have response interceptor configured', () => {
      expect(mockApi.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should call request interceptor success handler and pass through config', () => {
      // Get the interceptor functions that were registered
      const requestInterceptorCalls =
        mockApi.interceptors.request.use.mock.calls
      expect(requestInterceptorCalls.length).toBeGreaterThan(0)

      // Get the success handler (first argument)
      const requestSuccessHandler = requestInterceptorCalls[0][0]

      // Test that it returns the config as-is
      const testConfig = { url: '/test', headers: {} }
      const result = requestSuccessHandler(testConfig)

      expect(result).toBe(testConfig)
    })

    it('should call request interceptor error handler when request fails', () => {
      // Get the interceptor functions that were registered
      const requestInterceptorCalls =
        mockApi.interceptors.request.use.mock.calls
      expect(requestInterceptorCalls.length).toBeGreaterThan(0)

      // Get the error handler (second argument)
      const requestErrorHandler = requestInterceptorCalls[0][1]

      // Test that it rejects the error
      const testError = new Error('Request setup error')
      const result = requestErrorHandler(testError)

      expect(result).toBeInstanceOf(Promise)
      return expect(result).rejects.toBe(testError)
    })

    it('should call response interceptor success handler and pass through response', () => {
      // Get the interceptor functions that were registered
      const responseInterceptorCalls =
        mockApi.interceptors.response.use.mock.calls
      expect(responseInterceptorCalls.length).toBeGreaterThan(0)

      // Get the success handler (first argument)
      const responseSuccessHandler = responseInterceptorCalls[0][0]

      // Test that it returns the response as-is
      const testResponse = { data: { result: 'success' }, status: 200 }
      const result = responseSuccessHandler(testResponse)

      expect(result).toBe(testResponse)
    })

    it('should call response interceptor error handler and convert to ApiError', async () => {
      // Get the interceptor functions that were registered
      const responseInterceptorCalls =
        mockApi.interceptors.response.use.mock.calls
      expect(responseInterceptorCalls.length).toBeGreaterThan(0)

      // Get the error handler (second argument)
      const responseErrorHandler = responseInterceptorCalls[0][1]

      // Test with an Axios error
      const axiosError = {
        message: 'Response error',
        response: {
          data: { message: 'Server error' },
          status: 500,
        },
        status: 500,
      }
      mockIsAxiosError.mockReturnValue(true)

      const result = responseErrorHandler(axiosError)

      expect(result).toBeInstanceOf(Promise)
      await expect(result).rejects.toMatchObject({
        message: 'Server error',
        status: 500,
        isAxiosError: true,
      })
    })
  })
})
