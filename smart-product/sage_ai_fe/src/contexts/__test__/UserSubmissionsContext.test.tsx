import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { dashboardApi } from '../../core/api/dashboard.api'
import {
  UserIdeaSubmission,
  UserIdeaSubmissionsResponse,
} from '../../core/models/dashboard.model'
import { useUser } from '../UserContext'
import {
  UserSubmissionsProvider,
  useUserSubmissions,
} from '../UserSubmissionsContext'

// Mock dependencies
vi.mock('../../core/api/dashboard.api', () => ({
  dashboardApi: {
    getUserSubmissions: vi.fn(),
  },
}))

vi.mock('../UserContext', () => ({
  useUser: vi.fn(),
}))

// Mock data
const mockSubmission: UserIdeaSubmission = {
  id: 'sub-123',
  category_id: 'cat-456',
  category_name: 'AI Innovation',
  status: 'submitted',
  submitted_at: '2024-01-15T10:30:00Z',
  title: 'AI-Powered Document Analysis',
  ai_registry_form_status: 'completed',
  ai_registry_update_form_id: 'form-789',
}

const mockSubmissions: UserIdeaSubmission[] = [
  mockSubmission,
  {
    id: 'sub-124',
    category_id: 'cat-457',
    category_name: 'Machine Learning',
    status: 'completed',
    submitted_at: '2024-01-20T14:45:00Z',
    title: 'Predictive Analytics System',
    ai_registry_form_status: 'completed',
    ai_registry_update_form_id: 'form-790',
  },
  {
    id: 'sub-125',
    category_id: 'cat-458',
    category_name: 'Data Science',
    status: 'submitted',
    submitted_at: '2024-01-25T09:15:00Z',
    title: 'Advanced Data Visualization',
    ai_registry_form_status: 'completed',
    ai_registry_update_form_id: 'form-791',
  },
]

const mockSuccessResponse: UserIdeaSubmissionsResponse = {
  message: 'Success',
  data: mockSubmissions,
}

describe('UserSubmissionsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('UserSubmissionsProvider', () => {
    it('should render children', () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      expect(result.current).toBeDefined()
    })

    it('should fetch submissions when user is loaded', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.submissions).toEqual(mockSubmissions)
      })

      expect(dashboardApi.getUserSubmissions).toHaveBeenCalledTimes(1)
    })

    it('should provide initial loading state', () => {
      vi.mocked(useUser).mockReturnValue({
        user: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      expect(result.current.loading).toBe(true)
    })

    it('should provide submissions data after successful fetch', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions).toHaveLength(3)
      expect(result.current.submissions[0].title).toBe(
        'AI-Powered Document Analysis'
      )
      expect(result.current.error).toBeNull()
    })

    it('should set error state on fetch failure', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('API Error')
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
      })

      expect(result.current.submissions).toEqual([])
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching submissions:',
        expect.any(Error)
      )
    })

    it('should not fetch when user is still loading', () => {
      vi.mocked(useUser).mockReturnValue({
        user: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      expect(dashboardApi.getUserSubmissions).not.toHaveBeenCalled()
    })

    it('should set loading to false when user fails to load', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: null,
        loading: false,
        error: 'User fetch failed',
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(dashboardApi.getUserSubmissions).not.toHaveBeenCalled()
    })

    it('should handle empty submissions array', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'no',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue({
        message: 'Success',
        data: [],
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should handle null data in response', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue({
        message: 'Success',
        data: null as any,
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions).toEqual([])
    })
  })

  describe('useUserSubmissions Hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useUserSubmissions())
      }).toThrow(
        'useUserSubmissions must be used within UserSubmissionsProvider'
      )
    })

    it('should return context when used within provider', () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      expect(result.current).toBeDefined()
      expect(result.current.submissions).toBeDefined()
      expect(result.current.loading).toBeDefined()
      expect(result.current.error).toBeDefined()
      expect(result.current.refetch).toBeDefined()
    })

    it('should provide all context properties', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current).toMatchObject({
        submissions: expect.any(Array),
        loading: expect.any(Boolean),
        error: null,
        refetch: expect.any(Function),
      })
    })
  })

  describe('refetch', () => {
    it('should refetch submissions data', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newSubmission: UserIdeaSubmission = {
        id: 'sub-999',
        category_id: 'cat-999',
        category_name: 'New Category',
        status: 'submitted',
        submitted_at: '2024-02-01T12:00:00Z',
        title: 'New Submission',
        ai_registry_form_status: 'completed',
        ai_registry_update_form_id: 'form-793',
      }

      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue({
        message: 'Success',
        data: [newSubmission],
      })

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.submissions).toEqual([newSubmission])
      })
    })

    it('should handle refetch errors', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('Refetch failed')
      )

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
      })

      expect(result.current.submissions).toEqual([])
    })

    it('should be callable multiple times', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.refetch()
      await result.current.refetch()
      await result.current.refetch()

      expect(dashboardApi.getUserSubmissions).toHaveBeenCalledTimes(4) // 1 initial + 3 refetch
    })

    it('should clear previous error on successful refetch', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('Initial error')
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
      })

      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })

      expect(result.current.submissions).toEqual(mockSubmissions)
    })

    it('should set loading state during refetch', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Create a delayed promise to observe loading state
      let resolvePromise: any
      vi.mocked(dashboardApi.getUserSubmissions).mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = () => resolve(mockSuccessResponse)
          })
      )

      const refetchPromise = result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      resolvePromise()
      await refetchPromise

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Loading States', () => {
    it('should set loading to false after successful fetch', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions).toHaveLength(3)
    })

    it('should set loading to false after failed fetch', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('Fetch failed')
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch submissions')
    })

    it('should set loading to true during fetch', () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      expect(result.current.loading).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle API error with message', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('API request failed')
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
      })

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching submissions:',
        expect.any(Error)
      )
    })

    it('should handle network error', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
      })
    })

    it('should handle timeout error', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('Request timeout')
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
      })
    })

    it('should set submissions to empty array on error', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.submissions).toHaveLength(3)
      })

      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('Fetch error')
      )

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.submissions).toEqual([])
      })
    })
  })

  describe('Submission Data Properties', () => {
    it('should store complete submission data', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions[0]).toMatchObject({
        id: 'sub-123',
        category_id: 'cat-456',
        category_name: 'AI Innovation',
        status: 'submitted',
        submitted_at: '2024-01-15T10:30:00Z',
        title: 'AI-Powered Document Analysis',
      })
    })

    it('should handle different submission statuses', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const statuses = result.current.submissions.map(s => s.status)
      expect(statuses).toContain('submitted')
      expect(statuses).toContain('completed')
      expect(statuses.length).toBe(3)
    })

    it('should handle different categories', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const categories = result.current.submissions.map(s => s.category_name)
      expect(categories).toContain('AI Innovation')
      expect(categories).toContain('Machine Learning')
      expect(categories).toContain('Data Science')
    })

    it('should handle submissions with different dates', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const dates = result.current.submissions.map(s => s.submitted_at)
      expect(dates).toContain('2024-01-15T10:30:00Z')
      expect(dates).toContain('2024-01-20T14:45:00Z')
      expect(dates).toContain('2024-01-25T09:15:00Z')
    })

    it('should preserve submission order from API', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions[0].id).toBe('sub-123')
      expect(result.current.submissions[1].id).toBe('sub-124')
      expect(result.current.submissions[2].id).toBe('sub-125')
    })
  })

  describe('useMemo Dependencies', () => {
    it('should update context value when submissions change', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialSubmissions = result.current.submissions

      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue({
        message: 'Success',
        data: [mockSubmission],
      })

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.submissions).not.toBe(initialSubmissions)
      })
    })

    it('should update context value when loading changes', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(mockSuccessResponse), 100)
          })
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      const loadingInitially = result.current.loading

      await waitFor(() => {
        expect(result.current.loading).not.toBe(loadingInitially)
      })
    })

    it('should update context value when error changes', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeNull()

      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('New error')
      )

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
      })
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle rapid refetch calls', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Fire multiple refetch calls rapidly
      const promises = [
        result.current.refetch(),
        result.current.refetch(),
        result.current.refetch(),
      ]

      await Promise.all(promises)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions).toHaveLength(3)
    })

    it('should handle error followed by successful fetch', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('First error')
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
      })

      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
        expect(result.current.submissions).toHaveLength(3)
      })
    })

    it('should handle successful fetch followed by error', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.submissions).toHaveLength(3)
      })

      vi.mocked(dashboardApi.getUserSubmissions).mockRejectedValue(
        new Error('Second error')
      )

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch submissions')
        expect(result.current.submissions).toEqual([])
      })
    })

    it('should maintain state consistency during transitions', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // At any point, if not loading, we should have either data or error
      expect(
        result.current.submissions.length > 0 || result.current.error !== null
      ).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle submission with empty title', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue({
        message: 'Success',
        data: [{ ...mockSubmission, title: '' }],
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions[0].title).toBe('')
    })

    it('should handle very long submission titles', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      const longTitle = 'A'.repeat(500)
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue({
        message: 'Success',
        data: [{ ...mockSubmission, title: longTitle }],
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions[0].title).toBe(longTitle)
    })

    it('should handle special characters in submission data', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue({
        message: 'Success',
        data: [
          {
            ...mockSubmission,
            title: 'Title with "quotes" and \'apostrophes\' and <brackets>',
          },
        ],
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions[0].title).toContain('quotes')
      expect(result.current.submissions[0].title).toContain('apostrophes')
    })

    it('should handle unicode characters in submission data', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue({
        message: 'Success',
        data: [
          { ...mockSubmission, title: 'AI系统 with emoji 🤖 and symbols ∑' },
        ],
      })

      const { result } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.submissions[0].title).toContain('🤖')
      expect(result.current.submissions[0].title).toContain('AI系统')
    })

    it('should handle user transition from loading to loaded', async () => {
      vi.mocked(useUser).mockReturnValue({
        user: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      const { rerender } = renderHook(() => useUserSubmissions(), {
        wrapper: ({ children }) => (
          <UserSubmissionsProvider>{children}</UserSubmissionsProvider>
        ),
      })

      vi.mocked(dashboardApi.getUserSubmissions).mockResolvedValue(
        mockSuccessResponse
      )

      expect(dashboardApi.getUserSubmissions).not.toHaveBeenCalled()

      // Now update useUser to return loaded user
      vi.mocked(useUser).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01',
          anyIdeasSubmitted: 'yes',
          department: 'IT',
          title: 'Developer',
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      rerender()

      await waitFor(() => {
        expect(dashboardApi.getUserSubmissions).toHaveBeenCalled()
      })
    })
  })
})
