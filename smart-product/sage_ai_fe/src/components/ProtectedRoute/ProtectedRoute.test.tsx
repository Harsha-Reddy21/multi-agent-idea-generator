import { render, screen } from '@testing-library/react'
import { Navigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserSubmissions } from '../../contexts/UserSubmissionsContext'
import ProtectedRoute from './ProtectedRoute'

// Mock the dependencies
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(() => null),
}))

vi.mock('../../contexts/UserSubmissionsContext', () => ({
  useUserSubmissions: vi.fn(),
}))

describe('ProtectedRoute', () => {
  const mockUseUserSubmissions = vi.mocked(useUserSubmissions)
  const mockNavigate = vi.mocked(Navigate)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should render loading message when loading is true', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should render loading div with correct text', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      const { container } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      const loadingDiv = container.querySelector('div')
      expect(loadingDiv?.textContent).toBe('Loading...')
    })
  })

  describe('Children Rendering', () => {
    it('should render children when loading is false and no special conditions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render children when loading is false and requiresNoSubmissions is false', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={false}>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render complex children elements', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <div>
            <h1>Title</h1>
            <p>Description</p>
          </div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Navigation Logic - requiresNoSubmissions', () => {
    it('should navigate to /submitter-dashboard when requiresNoSubmissions is true and user has submissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test Submission',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Landing Page</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).toHaveBeenCalledWith(
        { to: '/submitter-dashboard', replace: true },
        {}
      )
      expect(screen.queryByText('Landing Page')).not.toBeInTheDocument()
    })

    it('should navigate with replace flag when redirecting', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Content</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ replace: true }),
        expect.anything()
      )
    })

    it('should not navigate when requiresNoSubmissions is true but user has no submissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Landing Page</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByText('Landing Page')).toBeInTheDocument()
    })

    it('should not navigate when requiresNoSubmissions is false even with submissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={false}>
          <div>Dashboard</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  describe('Submissions State Handling', () => {
    it('should handle null submissions as no submissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: null as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Content</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle undefined submissions as no submissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: undefined as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Content</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should treat empty array as no submissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Content</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should treat array with one submission as has submissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Content</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).toHaveBeenCalled()
    })

    it('should treat array with multiple submissions as has submissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test 1',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
          {
            id: '2',
            category_id: 'cat2',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-02',
            title: 'Test 2',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-124',
          },
          {
            id: '3',
            category_id: 'cat3',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-03',
            title: 'Test 3',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-125',
          },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Content</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  describe('Default Props', () => {
    it('should use default value false for requiresNoSubmissions when not provided', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <div>Content</div>
        </ProtectedRoute>
      )

      // Should not navigate because requiresNoSubmissions defaults to false
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should allow explicit false for requiresNoSubmissions', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={false}>
          <div>Content</div>
        </ProtectedRoute>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle loading true with submissions present', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Content</div>
        </ProtectedRoute>
      )

      // Should show loading, not navigate
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should handle loading false with error in context', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: 'Some error',
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <div>Content</div>
        </ProtectedRoute>
      )

      // Should still render children despite error
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should prioritize loading state over navigation logic', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [
          {
            id: '1',
            category_id: 'cat1',
            category_name: 'Category',
            status: 'submitted',
            submitted_at: '2025-01-01',
            title: 'Test',
            ai_registry_form_status: 'completed',
            ai_registry_update_form_id: 'form-123',
          },
        ],
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute requiresNoSubmissions={true}>
          <div>Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })
  })

  describe('React Element Children', () => {
    it('should accept and render any React element as children', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      const CustomComponent = () => <div>Custom Component</div>

      render(
        <ProtectedRoute>
          <CustomComponent />
        </ProtectedRoute>
      )

      expect(screen.getByText('Custom Component')).toBeInTheDocument()
    })

    it('should render children with props', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <div data-testid="child-element" className="test-class">
            Child with props
          </div>
        </ProtectedRoute>
      )

      const child = screen.getByTestId('child-element')
      expect(child).toBeInTheDocument()
      expect(child).toHaveClass('test-class')
      expect(screen.getByText('Child with props')).toBeInTheDocument()
    })
  })
})
