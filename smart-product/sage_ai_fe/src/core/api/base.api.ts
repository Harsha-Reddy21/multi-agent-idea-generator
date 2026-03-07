import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'

import { ApiError } from '../../components/FormContainer/types'

export class BaseApiService {
  protected api: AxiosInstance

  constructor(endpoint: string, config?: AxiosRequestConfig) {
    // TODO: Take URL from env
    // const url = baseURL || import.meta.env.VITE_LILY_BACKEND_URL
    // const url = baseURL || 'https://lilly-sage-ai.dev.bu.lilly.com'
    this.api = axios.create({
      baseURL: `/api/${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000, // 5 minutes (300 seconds) - prevents default 120s browser timeout
      ...config,
    })

    this.setInterceptors()
  }

  /**
   * URL helper to reduce redundancy.
   *
   * @param url - The URL to get. If not provided, returns an empty string.
   * @returns The URL or an empty string.
   */
  private getUrl(url?: string): string {
    return url || ''
  }

  /**
   * Sends a GET request to the specified URL.
   *
   * @typeParam T - The expected response data type.
   * @param url - Optional URL to override the default endpoint.
   * @param config - Optional Axios request configuration.
   * @returns A promise resolving to an ApiResponse containing the response data.
   * @throws ApiError if the request fails.
   */
  protected async get<T>(
    url?: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get<T>(
        this.getUrl(url),
        config
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Sends a POST request to the specified URL with the provided data.
   *
   * @typeParam T - The expected response data type.
   * @typeParam D - The type of the data being sent in the request body.
   * @param data - The data to send in the request body.
   * @param url - Optional URL to override the default endpoint.
   * @param config - Optional Axios request configuration.
   * @returns A promise resolving to an ApiResponse containing the response data.
   * @throws ApiError if the request fails.
   */
  protected async post<T, D = unknown>(
    data: D,
    url?: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post<T>(
        this.getUrl(url),
        data,
        config
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Sends a PUT request to the specified URL with the provided data.
   *
   * @typeParam T - The expected response data type.
   * @typeParam D - The type of the data being sent in the request body.
   * @param data - The data to send in the request body.
   * @param url - Optional URL to override the default endpoint.
   * @param config - Optional Axios request configuration.
   * @returns A promise resolving to an ApiResponse containing the response data.
   * @throws ApiError if the request fails.
   */
  protected async put<T, D = unknown>(
    data: D,
    url?: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put<T>(
        this.getUrl(url),
        data,
        config
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Sends a PATCH request to the specified URL with the provided data.
   *
   * @typeParam T - The expected response data type.
   * @typeParam D - The type of the data being sent in the request body.
   * @param data - The data to send in the request body.
   * @param url - Optional URL to override the default endpoint.
   * @param config - Optional Axios request configuration.
   * @returns A promise resolving to an ApiResponse containing the response data.
   * @throws ApiError if the request fails.
   */
  protected async patch<T, D = unknown>(
    data: D,
    url?: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.patch<T>(
        this.getUrl(url),
        data,
        config
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Sends a DELETE request to the specified URL.
   *
   * @typeParam T - The expected response data type.
   * @param url - Optional URL to override the default endpoint.
   * @param config - Optional Axios request configuration.
   * @returns A promise resolving to an ApiResponse containing the response data.
   * @throws ApiError if the request fails.
   */
  protected async delete<T>(
    url?: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete<T>(
        this.getUrl(url),
        config
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * TODO: Handles Axios errors and formats them as an ApiError.
   *
   * @param error - The AxiosError object.
   * @returns An ApiError containing the error message, status, and optional code/detail.
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axErr = error as AxiosError
      const status = axErr.status
      // Prefer server-provided message if JSON with message/detail
      const data = axErr.response?.data
      let message: string
      if (data && typeof data === 'object') {
        const maybeMsg =
          (data as any).message || (data as any).detail || (data as any).error
        message = maybeMsg ? String(maybeMsg) : axErr.message
      } else {
        message = typeof data === 'string' ? data : axErr.message
      }
      const apiError: ApiError = {
        status,
        message,
        data,
        isAxiosError: true,
        original: error,
      }
      console.error(`[Axios Error - ${status}]`, apiError)
      return apiError
    }
    const fallback: ApiError = {
      status: undefined,
      message: error instanceof Error ? error.message : 'Unexpected error',
      data: undefined,
      isAxiosError: false,
      original: error,
    }
    console.error('[Unexpected Error]', fallback)
    return fallback
  }

  /**
   * Sets up Axios interceptors.
   */
  private setInterceptors() {
    // Request Interceptor
    this.api.interceptors.request.use(
      config => config,
      error => Promise.reject(error)
    )

    // Response Interceptor
    this.api.interceptors.response.use(
      response => response,
      error => {
        // Convert to ApiError before rejecting so caller always gets consistent shape
        const apiError = this.handleError(error)
        return Promise.reject(apiError)
      }
    )
  }
}
