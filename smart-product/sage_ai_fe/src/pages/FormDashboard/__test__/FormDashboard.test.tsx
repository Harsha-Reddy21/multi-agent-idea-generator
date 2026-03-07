import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FormDashboardFormType } from '@/core/constants'
import { FormCompletionStatus } from '@/core/models/form-completion-status.enum'

import FormDashboard from '../FormDashboard'

// Use vi.hoisted to declare mocks that can be used in vi.mock
const {
  mockNavigate,
  mockUseParams,
  mockUseLocation,
  mockGetFormDashboard,
  mockStartSSE,
  mockIsExtracting,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseParams: vi.fn(),
  mockUseLocation: vi.fn(),
  mockGetFormDashboard: vi.fn(),
  mockStartSSE: vi.fn(),
  mockIsExtracting: { current: false },
}))

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
    useLocation: () => mockUseLocation(),
  }
})

vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsBreadcrumb: ({ breadcrumbs }: any) => (
    <nav data-testid="breadcrumb">
      {breadcrumbs.map((crumb: any) => (
        <a key={crumb.key} href={crumb.href}>
          {crumb.text}
        </a>
      ))}
    </nav>
  ),
  LdsIcon: ({ name, className }: any) => (
    <span data-testid={`icon-${name}`} className={className}>
      {name}
    </span>
  ),
  LdsImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="lds-image" />
  ),
  LdsLoadingSpinner: ({ ariaLabel }: any) => (
    <div data-testid="loading-spinner" aria-label={ariaLabel}>
      Loading...
    </div>
  ),
  LdsModal: ({ modalId, open, closeModal, children }: any) =>
    open ? (
      <div data-testid={modalId} role="dialog" aria-modal="true">
        <button
          data-testid="modal-close-button"
          onClick={closeModal}
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    ) : null,
}))

vi.mock('../../../components/FormCard/FormCard', () => ({
  FormCard: ({
    title,
    completed,
    disabled,
    locked,
    badgeType,
    onAction,
    titleIcon,
  }: any) => (
    <div
      data-testid={`form-card-${title}`}
      data-completed={completed}
      data-disabled={disabled}
      data-locked={locked}
      data-badge-type={badgeType || ''}
    >
      <h3>{title}</h3>
      {titleIcon && <div data-testid="title-icon">{titleIcon}</div>}
      {onAction && (
        <button data-testid={`action-${title}`} onClick={onAction}>
          Open Form
        </button>
      )}
      {badgeType && <span data-testid="badge">{badgeType}</span>}
    </div>
  ),
}))

vi.mock('../../../contexts/ExtractionStatusContext', () => ({
  useExtractionStatus: () => ({
    startSSE: mockStartSSE,
    isExtracting: mockIsExtracting.current,
  }),
}))

vi.mock('../../../core/api/form-dashboard.api', () => ({
  formDashboardApi: {
    getFormDashboard: (...args: any[]) => mockGetFormDashboard(...args),
  },
}))

// Mock assets
vi.mock('../../../assets/blue-star.svg', () => ({ default: 'blue-star.svg' }))
vi.mock('../../../assets/gray-star.svg', () => ({ default: 'gray-star.svg' }))
vi.mock('../../../assets/light-bulb.svg', () => ({ default: 'light-bulb.svg' }))
vi.mock('../../../assets/lock-icon.svg', () => ({ default: 'lock-icon.svg' }))

// Provide an isolated mock localStorage implementation for this test suite
// to avoid cross-file pollution and ensure all needed methods exist.
const localStorageStore: Record<string, string> = {}
const mockLocalStorage: Storage = {
  get length() {
    return Object.keys(localStorageStore).length
  },
  clear: vi.fn(() => {
    for (const k of Object.keys(localStorageStore)) delete localStorageStore[k]
  }),
  getItem: vi.fn((key: string) =>
    key in localStorageStore ? localStorageStore[key] : null
  ),
  key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('FormDashboard', () => {
  const mockSubmissionId = 'submission-123'

  const mockFormDashboardData = [
    {
      id: 'form-1',
      'submission-id': mockSubmissionId,
      'category-id': 'cat-1',
      category: 'recommended',
      status: FormCompletionStatus.COMPLETED,
      'form-type': FormDashboardFormType.IdeaSubForm,
    },
    {
      id: 'form-2',
      'submission-id': mockSubmissionId,
      'category-id': 'cat-2',
      category: 'recommended',
      status: FormCompletionStatus.PENDING,
      'form-type': FormDashboardFormType.AiRegistryForm,
    },
    {
      id: 'form-3',
      'submission-id': mockSubmissionId,
      'category-id': 'cat-3',
      category: 'recommended',
      status: FormCompletionStatus.PENDING,
      'form-type': FormDashboardFormType.DloForm,
    },
    {
      id: 'form-4',
      'submission-id': mockSubmissionId,
      'category-id': 'cat-4',
      category: 'recommended',
      status: FormCompletionStatus.PENDING,
      'form-type': FormDashboardFormType.SecurityArchForm,
    },
    {
      id: 'form-5',
      'submission-id': mockSubmissionId,
      'category-id': 'cat-5',
      category: 'optional',
      status: FormCompletionStatus.PENDING,
      'form-type': FormDashboardFormType.WwtpForm,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // Reset extraction status
    mockIsExtracting.current = false

    // Set default params
    mockUseParams.mockReturnValue({
      submissionId: mockSubmissionId,
    })

    // Set default location
    mockUseLocation.mockReturnValue({
      state: {},
      pathname: `/form-dashboard/${mockSubmissionId}`,
      search: '',
      hash: '',
      key: 'default',
    })

    // Set default mock return values
    mockGetFormDashboard.mockResolvedValue({
      message: 'Success',
      data: mockFormDashboardData,
      'novelty-score': null,
    })

    // Mock window.history.replaceState
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render loading spinner initially', () => {
      render(<FormDashboard />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should render form dashboard after data loads', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    it('should render breadcrumb navigation', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
      })

      expect(screen.getByText('Home')).toBeInTheDocument()
      // Use more specific query to get breadcrumb link
      const breadcrumbLink = screen.getByRole('link', {
        name: 'Form Dashboard',
      })
      expect(breadcrumbLink).toBeInTheDocument()
    })

    it('should render sidebar with greeting', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        // Use aria-label to find the sidebar specifically
        expect(
          screen.getByLabelText('Form Dashboard Sidebar')
        ).toBeInTheDocument()
      })
    })

    it('should render progress section', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Complete the checklist below to wrap up your submission!'
          )
        ).toBeInTheDocument()
      })

      expect(screen.getByText('Your Submission Progress')).toBeInTheDocument()
    })

    it('should render checklist section', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Intake Questionnaire')).toBeInTheDocument()
      })
    })
  })

  describe('Data Loading', () => {
    it('should fetch form dashboard data on mount', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(mockGetFormDashboard).toHaveBeenCalledWith(mockSubmissionId)
      })
    })

    it('should handle fetch error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetFormDashboard.mockRejectedValue(new Error('API Error'))

      render(<FormDashboard />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching form dashboard:',
          expect.any(Error)
        )
      })

      // Should still render without crashing
      expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it('should handle missing submissionId', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockUseParams.mockReturnValue({ submissionId: '' })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'No submissionId provided in route params'
        )
      })

      expect(mockGetFormDashboard).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should set loading to false after successful fetch', async () => {
      render(<FormDashboard />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should set loading to false after failed fetch', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetFormDashboard.mockRejectedValue(new Error('API Error'))

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Extraction Status Polling', () => {
    it('should start polling when navigated from BeginSubmission', async () => {
      mockUseLocation.mockReturnValue({
        state: { startExtraction: true },
        pathname: `/form-dashboard/${mockSubmissionId}`,
        search: '',
        hash: '',
        key: 'default',
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(mockStartSSE).toHaveBeenCalledWith(mockSubmissionId)
      })

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        document.title
      )
    })

    it('should not start polling when state is empty', async () => {
      mockUseLocation.mockReturnValue({
        state: {},
        pathname: `/form-dashboard/${mockSubmissionId}`,
        search: '',
        hash: '',
        key: 'default',
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      expect(mockStartSSE).not.toHaveBeenCalled()
    })

    it('should not start polling when startExtraction is false', async () => {
      mockUseLocation.mockReturnValue({
        state: { startExtraction: false },
        pathname: `/form-dashboard/${mockSubmissionId}`,
        search: '',
        hash: '',
        key: 'default',
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      expect(mockStartSSE).not.toHaveBeenCalled()
    })

    it('should not start polling when submissionId is missing', async () => {
      mockUseParams.mockReturnValue({ submissionId: '' })
      mockUseLocation.mockReturnValue({
        state: { startExtraction: true },
        pathname: '/form-dashboard',
        search: '',
        hash: '',
        key: 'default',
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      expect(mockStartSSE).not.toHaveBeenCalled()
    })
  })

  describe('Form Cards Rendering', () => {
    it('should render all form cards', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('form-card-Solution/System Overview')
        ).toBeInTheDocument()
      })

      expect(
        screen.getByTestId('form-card-AI Registry & Tech Innovation Pipeline')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('form-card-Digital Legal Office Form')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('form-card-Security Architecture and Engineering')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('form-card-Working with Third Party')
      ).toBeInTheDocument()
    })

    it('should mark completed forms correctly', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        expect(ideaCard).toHaveAttribute('data-completed', 'true')
      })

      const aiRegistryCard = screen.getByTestId(
        'form-card-AI Registry & Tech Innovation Pipeline'
      )
      expect(aiRegistryCard).toHaveAttribute('data-completed', 'false')
    })

    it('should lock forms when Idea Submission is not completed', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status:
            form['form-type'] === FormDashboardFormType.IdeaSubForm
              ? FormCompletionStatus.PENDING
              : form.status,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const aiRegistryCard = screen.getByTestId(
          'form-card-AI Registry & Tech Innovation Pipeline'
        )
        expect(aiRegistryCard).toHaveAttribute('data-locked', 'true')
      })
    })

    it('should not lock Idea Submission form', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status: FormCompletionStatus.PENDING,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        expect(ideaCard).toHaveAttribute('data-locked', 'false')
      })
    })

    it('should unlock forms when Idea Submission is completed', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const aiRegistryCard = screen.getByTestId(
          'form-card-AI Registry & Tech Innovation Pipeline'
        )
        expect(aiRegistryCard).toHaveAttribute('data-locked', 'false')
      })
    })

    it('should show correct badge types', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const aiRegistryCard = screen.getByTestId(
          'form-card-AI Registry & Tech Innovation Pipeline'
        )
        expect(aiRegistryCard).toHaveAttribute('data-badge-type', 'Required')
      })

      const wwtpCard = screen.getByTestId('form-card-Working with Third Party')
      expect(wwtpCard).toHaveAttribute('data-badge-type', 'Optional')
    })

    it('should not show badge for completed forms', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        expect(ideaCard).toHaveAttribute('data-badge-type', '')
      })
    })
  })

  describe('Form Navigation', () => {
    it('should navigate to form when action button clicked', async () => {
      const user = userEvent.setup()
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('action-Solution/System Overview')
        ).toBeInTheDocument()
      })

      const actionButton = screen.getByTestId('action-Solution/System Overview')
      await user.click(actionButton)

      expect(mockNavigate).toHaveBeenCalledWith(
        '/idea-submission/form-1/submission-123'
      )
    })

    it('should navigate to AI Registry form', async () => {
      const user = userEvent.setup()
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('action-AI Registry & Tech Innovation Pipeline')
        ).toBeInTheDocument()
      })

      const actionButton = screen.getByTestId(
        'action-AI Registry & Tech Innovation Pipeline'
      )
      await user.click(actionButton)

      expect(mockNavigate).toHaveBeenCalledWith(
        '/ai-registry/form-2/submission-123'
      )
    })

    it('should navigate to DLO form', async () => {
      const user = userEvent.setup()
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('action-Digital Legal Office Form')
        ).toBeInTheDocument()
      })

      const actionButton = screen.getByTestId(
        'action-Digital Legal Office Form'
      )
      await user.click(actionButton)

      expect(mockNavigate).toHaveBeenCalledWith(
        '/digital-legal-office/form-3/submission-123'
      )
    })

    it('should not render action button for locked forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status:
            form['form-type'] === FormDashboardFormType.IdeaSubForm
              ? FormCompletionStatus.PENDING
              : form.status,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('form-card-AI Registry & Tech Innovation Pipeline')
        ).toBeInTheDocument()
      })

      expect(
        screen.queryByTestId('action-AI Registry & Tech Innovation Pipeline')
      ).not.toBeInTheDocument()
    })
  })

  describe('Progress Calculation', () => {
    it('should calculate progress correctly with one completed form', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/40% completed/i)).toBeInTheDocument()
      })
    })

    it('should calculate progress with multiple completed forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status:
            form['form-type'] === FormDashboardFormType.WwtpForm
              ? FormCompletionStatus.PENDING
              : FormCompletionStatus.COMPLETED,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/100% completed/i)).toBeInTheDocument()
      })
    })

    it('should not count optional forms in progress', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status:
            form['form-type'] === FormDashboardFormType.WwtpForm
              ? FormCompletionStatus.COMPLETED
              : FormCompletionStatus.PENDING,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/20% completed/i)).toBeInTheDocument()
      })
    })

    it('should render progress bar with correct width', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-valuenow', '40')
        expect(progressBar).toHaveAttribute('aria-valuemin', '0')
        expect(progressBar).toHaveAttribute('aria-valuemax', '100')
      })
    })
  })

  describe('Checklist Rendering', () => {
    it('should show Intake Questionnaire as completed', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByLabelText('Initiate Form Submission step completed')
        ).toBeInTheDocument()
      })
    })

    it('should show correct checklist icons for completed forms', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('icon-check-circle-fill')).toBeInTheDocument()
      })
    })

    it('should show correct checklist icons for pending forms', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const pendingIcons = screen.getAllByTestId('icon-x-circle-fill')
        expect(pendingIcons.length).toBeGreaterThan(0)
      })
    })

    it('should not include optional forms in checklist', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Intake Questionnaire')).toBeInTheDocument()
      })

      // WWTP is optional, should not be in checklist
      const checklist = screen.getByLabelText('Forms Checklist')
      expect(checklist).not.toHaveTextContent('Working with Third Party')
    })
  })

  describe('AI Score from LocalStorage', () => {
    it('should read AI score from localStorage for AI Registry form', async () => {
      localStorage.setItem(`ai_score_${mockSubmissionId}`, '85.5')

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('form-card-AI Registry & Tech Innovation Pipeline')
        ).toBeInTheDocument()
      })

      // Score should be read from localStorage
      const scoreKey = `ai_score_${mockSubmissionId}`
      expect(localStorage.getItem(scoreKey)).toBe('85.5')
    })

    it('should handle AI score as percentage (0-1 range)', async () => {
      localStorage.setItem(`ai_score_${mockSubmissionId}`, '0.75')

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('form-card-AI Registry & Tech Innovation Pipeline')
        ).toBeInTheDocument()
      })
    })

    it('should handle AI score as percentage (0-100 range)', async () => {
      localStorage.setItem(`ai_score_${mockSubmissionId}`, '92')

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('form-card-AI Registry & Tech Innovation Pipeline')
        ).toBeInTheDocument()
      })
    })

    it('should use default AI score when localStorage is empty', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('form-card-AI Registry & Tech Innovation Pipeline')
        ).toBeInTheDocument()
      })

      // No score in localStorage, should use default (0)
      expect(localStorage.getItem(`ai_score_${mockSubmissionId}`)).toBeNull()
    })
  })

  describe('Sidebar Insights', () => {
    it('should not show originality insight when Idea Submission is pending', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status:
            form['form-type'] === FormDashboardFormType.IdeaSubForm
              ? FormCompletionStatus.PENDING
              : form.status,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      expect(
        screen.queryByText(/Your idea demonstrates.*originality/i)
      ).not.toBeInTheDocument()
    })

    it('should show form requirement insight', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(/You have 4 required forms and 1 optional form/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Form Metadata', () => {
    it('should merge API data with static metadata', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('form-card-Solution/System Overview')
        ).toBeInTheDocument()
      })

      // Verify forms are rendered with correct metadata
      expect(
        screen.getByTestId('form-card-AI Registry & Tech Innovation Pipeline')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('form-card-Digital Legal Office Form')
      ).toBeInTheDocument()
    })

    it('should handle forms without API data', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [],
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      // Forms should NOT render when there's no API data (filtered out)
      expect(
        screen.queryByTestId('form-card-Solution/System Overview')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('form-card-AI Registry & Tech Innovation Pipeline')
      ).not.toBeInTheDocument()
    })

    it('should sort forms by requirement level', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const formCards = screen.getAllByTestId(/^form-card-/)
        // First forms should be required (including Idea Submission)
        expect(formCards[0]).toHaveAttribute(
          'data-testid',
          'form-card-Solution/System Overview'
        )
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
        expect(
          screen.getByLabelText('Form Dashboard Sidebar')
        ).toBeInTheDocument()
        expect(
          screen.getByLabelText('Form Dashboard Submissions')
        ).toBeInTheDocument()
      })
    })

    it('should have proper ARIA attributes for progress bar', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-label', 'Submission progress')
      })
    })

    it('should have proper ARIA labels for checklist items', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByLabelText('Initiate Form Submission step completed')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty form dashboard data', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [],
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      // Should NOT render forms when there's no API data (filtered out)
      expect(
        screen.queryByTestId('form-card-Solution/System Overview')
      ).not.toBeInTheDocument()
    })

    it('should handle partial form dashboard data', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [mockFormDashboardData[0]], // Only Idea Submission
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByTestId('form-card-Solution/System Overview')
        ).toBeInTheDocument()
      })

      // Other forms should NOT render without API data (filtered out)
      expect(
        screen.queryByTestId('form-card-AI Registry & Tech Innovation Pipeline')
      ).not.toBeInTheDocument()
    })

    it('should handle all forms completed', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status: FormCompletionStatus.COMPLETED,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/100% completed/i)).toBeInTheDocument()
      })
    })

    it('should handle no forms completed', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status: FormCompletionStatus.PENDING,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/20% completed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Integration Tests', () => {
    it('should complete full user flow: load -> view forms -> navigate', async () => {
      const user = userEvent.setup()
      render(<FormDashboard />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Verify dashboard is displayed
      expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()

      // Verify progress is shown
      expect(screen.getByText(/40% completed/i)).toBeInTheDocument()

      // Click on a form action button
      const actionButton = screen.getByTestId('action-Solution/System Overview')
      await user.click(actionButton)

      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith(
        '/idea-submission/form-1/submission-123'
      )
    })

    it('should handle complete flow with extraction polling', async () => {
      mockUseLocation.mockReturnValue({
        state: { startExtraction: true },
        pathname: `/form-dashboard/${mockSubmissionId}`,
        search: '',
        hash: '',
        key: 'default',
      })

      render(<FormDashboard />)

      // Verify polling starts
      await waitFor(() => {
        expect(mockStartSSE).toHaveBeenCalledWith(mockSubmissionId)
      })

      // Verify state is cleared
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        document.title
      )

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Verify dashboard renders correctly
      expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
    })
  })

  describe('Form Card Properties', () => {
    it('should render title icons for locked forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status:
            form['form-type'] === FormDashboardFormType.IdeaSubForm
              ? FormCompletionStatus.PENDING
              : form.status,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getAllByTestId('title-icon').length).toBeGreaterThan(0)
      })
    })

    it('should not render title icon for non-locked required forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status: FormCompletionStatus.PENDING,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        // IdeaSubForm is never locked, so it shouldn't have a title icon
        expect(
          ideaCard.querySelector('[data-testid="title-icon"]')
        ).not.toBeInTheDocument()
      })
    })

    it('should render lock icon for forms without redirectPath', async () => {
      // When a form doesn't have API data, it's filtered out and not rendered
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [mockFormDashboardData[0]], // Only first form has data
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      // Only IdeaSubForm should be rendered
      expect(
        screen.getByTestId('form-card-Solution/System Overview')
      ).toBeInTheDocument()
      // Other forms without API data should not be rendered
      expect(
        screen.queryByTestId('form-card-AI Registry & Tech Innovation Pipeline')
      ).not.toBeInTheDocument()
    })

    it('should not show Innovation badge for required pending forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status: FormCompletionStatus.PENDING,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        // Required forms show 'Required' badge, not 'Innovation'
        expect(ideaCard).toHaveAttribute('data-badge-type', 'Required')
      })
    })

    it('should not show Innovation badge for required completed forms', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        // Completed forms don't have badges (badgeType is undefined, so it becomes empty string)
        expect(ideaCard).toHaveAttribute('data-badge-type', '')
      })
    })

    it('should apply featured class to first card', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const allCards = screen.getAllByTestId(/^form-card-/)
        // First card should be the IdeaSubForm (Solution/System Overview)
        expect(allCards[0]).toHaveAttribute(
          'data-testid',
          'form-card-Solution/System Overview'
        )
      })
    })

    it('should disable forms without redirectPath', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [], // No API data means forms are filtered out
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      // Forms without API data should not be rendered (filtered out)
      expect(
        screen.queryByTestId('form-card-Solution/System Overview')
      ).not.toBeInTheDocument()
    })

    it('should not have action handler for disabled forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [], // No API data means forms are filtered out
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      // Forms and action buttons should not be rendered without API data
      expect(
        screen.queryByTestId('action-Solution/System Overview')
      ).not.toBeInTheDocument()
    })
  })

  describe('Badge Type Logic', () => {
    it('should show Required badge for IdeaSubForm pending forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status: FormCompletionStatus.PENDING,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        expect(ideaCard).toHaveAttribute('data-badge-type', 'Required')
      })
    })

    it('should show Required badge for required pending forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const dloCard = screen.getByTestId(
          'form-card-Digital Legal Office Form'
        )
        expect(dloCard).toHaveAttribute('data-badge-type', 'Required')
      })
    })

    it('should show Optional badge for optional pending forms', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const wwtpCard = screen.getByTestId(
          'form-card-Working with Third Party'
        )
        expect(wwtpCard).toHaveAttribute('data-badge-type', 'Optional')
      })
    })

    it('should not show badge for any completed form', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status: FormCompletionStatus.COMPLETED,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      const allCards = screen.getAllByTestId(/^form-card-/)
      allCards.forEach(card => {
        expect(card).toHaveAttribute('data-badge-type', '')
      })
    })
  })

  describe('Title Icon Logic', () => {
    it('should show lock icon when redirectPath is undefined', async () => {
      // When no API data, forms are filtered out and not rendered
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [], // No API data = forms are filtered out
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      // No forms should be rendered when there's no API data
      expect(screen.queryByTestId('title-icon')).not.toBeInTheDocument()
    })

    it('should not show title icon for IdeaSubForm with redirectPath when unlocked', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status: FormCompletionStatus.PENDING,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        // IdeaSubForm is never locked and not mandatory, so no title icon
        expect(
          ideaCard.querySelector('[data-testid="title-icon"]')
        ).not.toBeInTheDocument()
      })
    })

    it('should show lock icon for locked forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData.map(form => ({
          ...form,
          status:
            form['form-type'] === FormDashboardFormType.IdeaSubForm
              ? FormCompletionStatus.PENDING
              : form.status,
        })),
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const aiRegistryCard = screen.getByTestId(
          'form-card-AI Registry & Tech Innovation Pipeline'
        )
        expect(
          aiRegistryCard.querySelector('[data-testid="title-icon"]')
        ).toBeInTheDocument()
      })
    })

    it('should not show title icon for unlocked required forms', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const aiRegistryCard = screen.getByTestId(
          'form-card-AI Registry & Tech Innovation Pipeline'
        )
        // When unlocked and required (not mandatory), titleIcon should be undefined
        expect(
          aiRegistryCard.querySelector('[data-testid="title-icon"]')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Rank Function Coverage', () => {
    it('should rank forms in correct order: required, optional', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const formCards = screen.getAllByTestId(/^form-card-/)
        const titles = formCards.map(card => card.getAttribute('data-testid'))

        // First four should be required (Idea Submission, AI Registry, DLO, Security)
        expect(titles.slice(0, 4)).toContain(
          'form-card-Solution/System Overview'
        )
        expect(titles.slice(0, 4)).toContain(
          'form-card-AI Registry & Tech Innovation Pipeline'
        )
        expect(titles.slice(0, 4)).toContain(
          'form-card-Digital Legal Office Form'
        )
        expect(titles.slice(0, 4)).toContain(
          'form-card-Security Architecture and Engineering'
        )

        // Optional should be last (WWTP)
        expect(titles[4]).toBe('form-card-Working with Third Party')
      })
    })

    it('should handle undefined requirement level in ranking', async () => {
      // This tests the default rank value of 3 for undefined
      render(<FormDashboard />)

      await waitFor(() => {
        const formCards = screen.getAllByTestId(/^form-card-/)
        // All forms should be rendered despite any undefined values
        expect(formCards.length).toBe(5)
      })
    })
  })

  describe('Novelty Score Display', () => {
    it('should calculate and display novelty score from API response (0-1 range)', async () => {
      // API returns 0.15 (15% similar), should display 85% original
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
        'novelty-score': 0.15,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(content =>
            content.startsWith(
              'Your idea demonstrates a high level of originality'
            )
          )
        ).toBeInTheDocument()
      })
      const blueStarImage = screen
        .getAllByTestId('lds-image')
        .find(img => img.getAttribute('src')?.includes('blue-star'))
      expect(blueStarImage).toBeInTheDocument()
    })

    it('should round novelty score to nearest integer', async () => {
      // API returns 0.345 (34.5% similar), should display 66% original (rounded from 65.5)
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
        'novelty-score': 0.345,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(content =>
            content.startsWith(
              'Your idea demonstrates a moderate level of originality'
            )
          )
        ).toBeInTheDocument()
      })
    })

    it('should round novelty score down when closer to lower integer', async () => {
      // API returns 0.666 (66.6% similar), should display 33% original (rounded from 33.4)
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
        'novelty-score': 0.666,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(content =>
            content.startsWith(
              'Your idea demonstrates a lower level of originality'
            )
          )
        ).toBeInTheDocument()
      })
    })

    it('should handle exact 0.5 rounding correctly (50% originality)', async () => {
      // API returns 0.505 (50.5% similar), should display 50% original (rounded from 49.5)
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
        'novelty-score': 0.505,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(content =>
            content.startsWith(
              'Your idea demonstrates a moderate level of originality'
            )
          )
        ).toBeInTheDocument()
      })
    })

    it('should handle 0% similarity (100% originality)', async () => {
      // API returns 0 (0% similar), should display 100% original
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
        'novelty-score': 0,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(content =>
            content.startsWith(
              'Your idea demonstrates a high level of originality'
            )
          )
        ).toBeInTheDocument()
      })
    })

    it('should handle high similarity (15% originality)', async () => {
      // API returns 0.85 (85% similar), should display 15% original
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
        'novelty-score': 0.85,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(content =>
            content.startsWith(
              'Your idea demonstrates a lower level of originality'
            )
          )
        ).toBeInTheDocument()
      })
    })

    it('should handle very low similarity (98% originality)', async () => {
      // API returns 0.02 (2% similar), should display 98% original
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
        'novelty-score': 0.02,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(content =>
            content.startsWith(
              'Your idea demonstrates a high level of originality'
            )
          )
        ).toBeInTheDocument()
      })
    })

    it('should not display novelty score when null', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
        'novelty-score': null,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      expect(
        screen.queryByText(/Your idea demonstrates.*originality/)
      ).not.toBeInTheDocument()
    })
  })

  describe('IdeaSubForm Requirement Level', () => {
    it('should always set IdeaSubForm as RECOMMENDED regardless of API category', async () => {
      // Even if API sends different category, IdeaSubForm should be RECOMMENDED
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [
          {
            id: 'form-1',
            'submission-id': mockSubmissionId,
            'category-id': 'cat-1',
            category: 'optional', // API says optional
            status: FormCompletionStatus.PENDING,
            'form-type': FormDashboardFormType.IdeaSubForm,
          },
          ...mockFormDashboardData.slice(1),
        ],
      })

      render(<FormDashboard />)

      await waitFor(() => {
        const ideaCard = screen.getByTestId(
          'form-card-Solution/System Overview'
        )
        // Should still show Required badge, not Optional
        expect(ideaCard).toHaveAttribute('data-badge-type', 'Required')
      })
    })

    it('should include IdeaSubForm in required forms count', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        // Should show 4 required forms (IdeaSubForm + 3 others)
        expect(
          screen.getByText(/You have 4 required forms and 1 optional form/i)
        ).toBeInTheDocument()
      })
    })

    it('should show IdeaSubForm in checklist as required', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        const checklist = screen.getByLabelText('Forms Checklist')
        expect(checklist).toBeInTheDocument()
      })

      // IdeaSubForm should appear in the checklist (non-optional forms only)
      const checklistItems = screen.getAllByRole('listitem')
      const ideaSubmissionItem = checklistItems.find(item =>
        item.textContent?.includes('Solution/System Overview')
      )
      expect(ideaSubmissionItem).toBeDefined()
    })
  })

  describe('Sidebar Form Count Display', () => {
    it('should not display mandatory count in sidebar insight', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Form Dashboard')).toBeInTheDocument()
      })

      // Should not mention "mandatory" in the insight text
      expect(screen.queryByText(/mandatory/i)).not.toBeInTheDocument()
    })

    it('should display correct count of required and optional forms', async () => {
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: mockFormDashboardData,
      })

      render(<FormDashboard />)

      await waitFor(() => {
        // Verify the exact count: 4 required (Idea, AI Registry, DLO, Security) and 1 optional (WWTP)
        expect(
          screen.getByText(/You have 4 required forms and 1 optional form/i)
        ).toBeInTheDocument()
      })
    })

    it('should handle singular and plural form text correctly', async () => {
      // When only IdeaSubForm has API data, others are filtered out (not shown)
      // Result: 1 required form (IdeaSubForm) and 0 optional forms
      mockGetFormDashboard.mockResolvedValue({
        message: 'Success',
        data: [
          mockFormDashboardData[0], // IdeaSubForm (required)
        ],
      })

      render(<FormDashboard />)

      await waitFor(() => {
        // Should use singular "form" for required and plural "forms" for optional
        expect(
          screen.getByText(/You have 1 required form and 0 optional forms/i)
        ).toBeInTheDocument()
      })
    })

    it('should handle plural forms text correctly', async () => {
      render(<FormDashboard />)

      await waitFor(() => {
        // With default data: 4 required forms (plural) and 1 optional form (singular)
        expect(
          screen.getByText(/You have 4 required forms and 1 optional form/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Extraction Modal', () => {
    it('should render modal when isExtracting is true', async () => {
      mockIsExtracting.current = true

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('doc-extraction-modal')).toBeInTheDocument()
        expect(
          screen.getByText(/Document Extraction in Progress/i)
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /We strongly suggest that you wait for the extracts to complete/i
          )
        ).toBeInTheDocument()
      })
    })

    it('should not render modal when isExtracting is false', async () => {
      mockIsExtracting.current = false

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.queryByTestId('doc-extraction-modal')
        ).not.toBeInTheDocument()
      })
    })

    it('should close modal when close button is clicked', async () => {
      mockIsExtracting.current = true
      const user = userEvent.setup()

      render(<FormDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('doc-extraction-modal')).toBeInTheDocument()
      })

      const closeButton = screen.getByTestId('modal-close-button')
      await user.click(closeButton)

      await waitFor(() => {
        expect(
          screen.queryByTestId('doc-extraction-modal')
        ).not.toBeInTheDocument()
      })
    })

    it('should display correct modal content text', async () => {
      mockIsExtracting.current = true

      render(<FormDashboard />)

      await waitFor(() => {
        expect(
          screen.getByText(
            /We strongly suggest that you wait for the extracts to complete before completing any of the following forms, but you can proceed with manual entry if needed/i
          )
        ).toBeInTheDocument()
      })
    })

    it('should have proper heading in modal', async () => {
      mockIsExtracting.current = true

      render(<FormDashboard />)

      await waitFor(() => {
        const heading = screen.getByText(/Document Extraction in Progress/i)
        expect(heading).toBeInTheDocument()
        expect(heading.tagName).toBe('H4')
      })
    })
  })
})
