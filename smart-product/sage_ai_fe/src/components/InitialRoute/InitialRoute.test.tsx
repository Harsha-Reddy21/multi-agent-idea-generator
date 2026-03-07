import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import InitialRoute from './InitialRoute'

// Mock the UserSubmissionsContext
const mockUseUserSubmissions = vi.fn()

vi.mock('../../contexts/UserSubmissionsContext', () => ({
  useUserSubmissions: () => mockUseUserSubmissions(),
}))

// Mock Navigate component
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace: boolean }) => {
      mockNavigate(to, replace)
      return <div data-testid="navigate" data-to={to} data-replace={replace} />
    },
  }
})

describe('InitialRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should render loading message when loading is true', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: true,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should navigate immediately when loading is false from start', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      // When loading is false, useEffect immediately sets shouldRedirect to true
      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toBeInTheDocument()
      })
    })

    it('should continue showing loading when loading remains true', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [{ id: '1', name: 'Test' }],
        loading: true,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })
  })

  describe('Navigation to Submitter Dashboard', () => {
    it('should navigate to submitter dashboard when user has submissions', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [{ id: '1', name: 'Submission 1' }],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toBeInTheDocument()
        expect(navigateElement).toHaveAttribute(
          'data-to',
          '/submitter-dashboard'
        )
        expect(navigateElement).toHaveAttribute('data-replace', 'true')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/submitter-dashboard', true)
    })

    it('should navigate to submitter dashboard when user has multiple submissions', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          { id: '1', name: 'Submission 1' },
          { id: '2', name: 'Submission 2' },
          { id: '3', name: 'Submission 3' },
        ],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute(
          'data-to',
          '/submitter-dashboard'
        )
      })

      expect(mockNavigate).toHaveBeenCalledWith('/submitter-dashboard', true)
    })
  })

  describe('Navigation to Landing Page', () => {
    it('should navigate to landing page when submissions array is empty', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toBeInTheDocument()
        expect(navigateElement).toHaveAttribute('data-to', '/landing')
        expect(navigateElement).toHaveAttribute('data-replace', 'true')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/landing', true)
    })

    it('should navigate to landing page when submissions is null', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: null,
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute('data-to', '/landing')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/landing', true)
    })

    it('should navigate to landing page when submissions is undefined', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: undefined,
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute('data-to', '/landing')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/landing', true)
    })
  })

  describe('UseEffect Behavior', () => {
    it('should set shouldRedirect when loading changes from true to false', async () => {
      // Start with loading true
      mockUseUserSubmissions.mockReturnValue({
        submissions: [{ id: '1', name: 'Test' }],
        loading: true,
      })

      const { rerender } = render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      // Initially loading
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Change to not loading
      mockUseUserSubmissions.mockReturnValue({
        submissions: [{ id: '1', name: 'Test' }],
        loading: false,
      })

      rerender(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toBeInTheDocument()
      })
    })

    it('should update shouldRedirect only when loading changes', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toBeInTheDocument()
      })

      expect(mockNavigate).toHaveBeenCalledTimes(1)
    })
  })

  describe('Replace Navigation', () => {
    it('should always use replace=true for navigation', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [{ id: '1', name: 'Test' }],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute('data-replace', 'true')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/submitter-dashboard', true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle transition from loading to loaded with empty submissions', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: true,
      })

      const { rerender } = render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
      })

      rerender(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute('data-to', '/landing')
      })
    })

    it('should handle submissions with length property equal to 0', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toHaveAttribute(
          'data-to',
          '/landing'
        )
      })
    })

    it('should handle single submission correctly', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [{ id: '1', name: 'Single Submission' }],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toHaveAttribute(
          'data-to',
          '/submitter-dashboard'
        )
      })
    })
  })

  describe('hasSubmissions Logic', () => {
    it('should correctly evaluate hasSubmissions as true when array has items', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [{ id: '1' }],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute(
          'data-to',
          '/submitter-dashboard'
        )
      })
    })

    it('should correctly evaluate hasSubmissions as false when array is empty', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute('data-to', '/landing')
      })
    })

    it('should correctly evaluate hasSubmissions as false when submissions is null', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: null,
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute('data-to', '/landing')
      })
    })

    it('should correctly evaluate hasSubmissions as false when submissions is undefined', async () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: undefined,
        loading: false,
      })

      render(
        <MemoryRouter>
          <InitialRoute />
        </MemoryRouter>
      )

      await waitFor(() => {
        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toHaveAttribute('data-to', '/landing')
      })
    })
  })
})
