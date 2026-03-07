import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { userApi } from '../../core/api/user.api'
import { UserProfile } from '../../core/models/user.model'
import { UserProvider, useUser } from '../UserContext'

// Mock the user API
vi.mock('../../core/api/user.api', () => ({
  userApi: {
    getUserInfo: vi.fn(),
  },
}))

describe('UserContext', () => {
  const mockUserProfile: UserProfile = {
    id: 'user123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    anyIdeasSubmitted: 'yes',
    department: 'Engineering',
    title: 'Senior Developer',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('UserProvider', () => {
    it('should render children', () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      render(
        <UserProvider>
          <div data-testid="test-child">Test Child</div>
        </UserProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    it('should fetch user on mount', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      // Initially loading
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.error).toBe(null)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUserProfile)
      expect(result.current.error).toBe(null)
      expect(userApi.getUserInfo).toHaveBeenCalledTimes(1)
    })

    it('should provide initial loading state', () => {
      vi.mocked(userApi.getUserInfo).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.error).toBe(null)
    })

    it('should provide user data after successful fetch', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUserProfile)
      expect(result.current.user?.name).toBe('John Doe')
      expect(result.current.user?.email).toBe('john.doe@example.com')
      expect(result.current.user?.role).toBe('admin')
    })

    it('should set error state on fetch failure', async () => {
      const error = new Error('Network error')
      vi.mocked(userApi.getUserInfo).mockRejectedValue(error)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
      expect(result.current.error).toBe('Failed to fetch user information')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching user info:',
        error
      )

      consoleSpy.mockRestore()
    })

    it('should clear error on successful refetch', async () => {
      vi.mocked(userApi.getUserInfo)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockUserProfile)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch user information')
      })

      expect(result.current.user).toBe(null)

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user).toEqual(mockUserProfile)
      expect(result.current.error).toBe(null)

      consoleSpy.mockRestore()
    })

    it('should set loading state during refetch', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let refetchPromise: Promise<void>
      act(() => {
        refetchPromise = result.current.refetch()
      })

      // Should be loading during refetch
      expect(result.current.loading).toBe(true)

      await act(async () => {
        await refetchPromise!
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('useUser Hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useUser())
      }).toThrow('useUser must be used within UserProvider')

      consoleSpy.mockRestore()
    })

    it('should return context when used within provider', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      expect(result.current).toBeDefined()
      expect(result.current.user).toBeDefined()
      expect(result.current.loading).toBeDefined()
      expect(result.current.error).toBeDefined()
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should provide all context properties', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('refetch')
    })
  })

  describe('refetch', () => {
    it('should refetch user data', async () => {
      const updatedUser: UserProfile = {
        ...mockUserProfile,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      }

      vi.mocked(userApi.getUserInfo)
        .mockResolvedValueOnce(mockUserProfile)
        .mockResolvedValueOnce(updatedUser)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.name).toBe('John Doe')
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user?.name).toBe('Jane Doe')
      expect(result.current.user?.email).toBe('jane.doe@example.com')
      expect(userApi.getUserInfo).toHaveBeenCalledTimes(2)
    })

    it('should handle refetch errors', async () => {
      vi.mocked(userApi.getUserInfo)
        .mockResolvedValueOnce(mockUserProfile)
        .mockRejectedValueOnce(new Error('Refetch error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUserProfile)
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user).toBe(null)
      expect(result.current.error).toBe('Failed to fetch user information')

      consoleSpy.mockRestore()
    })

    it('should be callable multiple times', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refetch()
      })

      await act(async () => {
        await result.current.refetch()
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(userApi.getUserInfo).toHaveBeenCalledTimes(4) // Initial + 3 refetches
    })

    it('should clear previous error on refetch', async () => {
      vi.mocked(userApi.getUserInfo)
        .mockRejectedValueOnce(new Error('First error'))
        .mockRejectedValueOnce(new Error('Second error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch user information')
      })

      // Refetch should clear error before setting it again
      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.error).toBe('Failed to fetch user information')

      consoleSpy.mockRestore()
    })
  })

  describe('Loading States', () => {
    it('should set loading to false after successful fetch', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUserProfile)
    })

    it('should set loading to false after failed fetch', async () => {
      vi.mocked(userApi.getUserInfo).mockRejectedValue(new Error('Error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch user information')

      consoleSpy.mockRestore()
    })

    it('should set loading to true during fetch', async () => {
      let resolvePromise: (value: UserProfile) => void
      vi.mocked(userApi.getUserInfo).mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve
          })
      )

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolvePromise!(mockUserProfile)
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle API error with message', async () => {
      const error = new Error('API rate limit exceeded')
      vi.mocked(userApi.getUserInfo).mockRejectedValue(error)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch user information')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching user info:',
        error
      )

      consoleSpy.mockRestore()
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network request failed')
      vi.mocked(userApi.getUserInfo).mockRejectedValue(networkError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
      expect(result.current.error).toBe('Failed to fetch user information')

      consoleSpy.mockRestore()
    })

    it('should handle timeout error', async () => {
      const timeoutError = new Error('Request timeout')
      vi.mocked(userApi.getUserInfo).mockRejectedValue(timeoutError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch user information')
      })

      expect(result.current.user).toBe(null)

      consoleSpy.mockRestore()
    })

    it('should set user to null on error', async () => {
      vi.mocked(userApi.getUserInfo)
        .mockResolvedValueOnce(mockUserProfile)
        .mockRejectedValueOnce(new Error('Error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUserProfile)
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user).toBe(null)

      consoleSpy.mockRestore()
    })
  })

  describe('User Data Properties', () => {
    it('should store complete user profile', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUserProfile)
      })

      expect(result.current.user?.id).toBe('user123')
      expect(result.current.user?.name).toBe('John Doe')
      expect(result.current.user?.email).toBe('john.doe@example.com')
      expect(result.current.user?.role).toBe('admin')
      expect(result.current.user?.is_active).toBe(true)
      expect(result.current.user?.created_at).toBe('2024-01-01T00:00:00Z')
      expect(result.current.user?.anyIdeasSubmitted).toBe('yes')
      expect(result.current.user?.department).toBe('Engineering')
      expect(result.current.user?.title).toBe('Senior Developer')
    })

    it('should handle different user roles', async () => {
      const regularUser: UserProfile = {
        ...mockUserProfile,
        role: 'user',
      }

      vi.mocked(userApi.getUserInfo).mockResolvedValue(regularUser)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.role).toBe('user')
      })
    })

    it('should handle inactive users', async () => {
      const inactiveUser: UserProfile = {
        ...mockUserProfile,
        is_active: false,
      }

      vi.mocked(userApi.getUserInfo).mockResolvedValue(inactiveUser)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.is_active).toBe(false)
      })
    })

    it('should handle users with no ideas submitted', async () => {
      const userNoIdeas: UserProfile = {
        ...mockUserProfile,
        anyIdeasSubmitted: 'no',
      }

      vi.mocked(userApi.getUserInfo).mockResolvedValue(userNoIdeas)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.anyIdeasSubmitted).toBe('no')
      })
    })

    it('should handle different departments', async () => {
      const marketingUser: UserProfile = {
        ...mockUserProfile,
        department: 'Marketing',
        title: 'Marketing Manager',
      }

      vi.mocked(userApi.getUserInfo).mockResolvedValue(marketingUser)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.department).toBe('Marketing')
        expect(result.current.user?.title).toBe('Marketing Manager')
      })
    })
  })

  describe('useMemo Dependencies', () => {
    it('should update context value when user changes', async () => {
      const updatedUser: UserProfile = {
        ...mockUserProfile,
        name: 'Updated Name',
      }

      vi.mocked(userApi.getUserInfo)
        .mockResolvedValueOnce(mockUserProfile)
        .mockResolvedValueOnce(updatedUser)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.name).toBe('John Doe')
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user?.name).toBe('Updated Name')
    })

    it('should update context value when loading changes', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should update context value when error changes', async () => {
      vi.mocked(userApi.getUserInfo)
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(mockUserProfile)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch user information')
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.error).toBe(null)

      consoleSpy.mockRestore()
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle rapid refetch calls', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        const promises = [
          result.current.refetch(),
          result.current.refetch(),
          result.current.refetch(),
        ]
        await Promise.all(promises)
      })

      expect(result.current.user).toEqual(mockUserProfile)
    })

    it('should handle error followed by success', async () => {
      vi.mocked(userApi.getUserInfo)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockUserProfile)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch user information')
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user).toEqual(mockUserProfile)
      expect(result.current.error).toBe(null)

      consoleSpy.mockRestore()
    })

    it('should handle success followed by error', async () => {
      vi.mocked(userApi.getUserInfo)
        .mockResolvedValueOnce(mockUserProfile)
        .mockRejectedValueOnce(new Error('Second error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUserProfile)
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.user).toBe(null)
      expect(result.current.error).toBe('Failed to fetch user information')

      consoleSpy.mockRestore()
    })

    it('should maintain state consistency during transitions', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // During refetch
      let refetchPromise: Promise<void>
      act(() => {
        refetchPromise = result.current.refetch()
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        await refetchPromise!
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual(mockUserProfile)
      expect(result.current.error).toBe(null)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null user data gracefully', async () => {
      vi.mocked(userApi.getUserInfo).mockRejectedValue(new Error('Error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toBe(null)
      })

      expect(result.current.user).toBe(null)

      consoleSpy.mockRestore()
    })

    it('should handle empty string values in user profile', async () => {
      const userWithEmptyStrings: UserProfile = {
        id: '',
        name: '',
        email: '',
        role: '',
        is_active: true,
        created_at: '',
        anyIdeasSubmitted: '',
        department: '',
        title: '',
      }

      vi.mocked(userApi.getUserInfo).mockResolvedValue(userWithEmptyStrings)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(userWithEmptyStrings)
      })

      expect(result.current.user?.id).toBe('')
      expect(result.current.user?.name).toBe('')
    })

    it('should handle very long user names', async () => {
      const longNameUser: UserProfile = {
        ...mockUserProfile,
        name: 'A'.repeat(1000),
      }

      vi.mocked(userApi.getUserInfo).mockResolvedValue(longNameUser)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.name.length).toBe(1000)
      })
    })

    it('should handle special characters in user data', async () => {
      const specialCharUser: UserProfile = {
        ...mockUserProfile,
        name: "John O'Doe <test@test.com>",
        email: 'test+user@example.com',
      }

      vi.mocked(userApi.getUserInfo).mockResolvedValue(specialCharUser)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.name).toBe("John O'Doe <test@test.com>")
        expect(result.current.user?.email).toBe('test+user@example.com')
      })
    })

    it('should handle unicode characters', async () => {
      const unicodeUser: UserProfile = {
        ...mockUserProfile,
        name: '张三 🚀',
        department: 'مهندسی',
      }

      vi.mocked(userApi.getUserInfo).mockResolvedValue(unicodeUser)

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      })

      await waitFor(() => {
        expect(result.current.user?.name).toBe('张三 🚀')
        expect(result.current.user?.department).toBe('مهندسی')
      })
    })
  })
})
