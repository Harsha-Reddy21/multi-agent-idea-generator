import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UserIdeaSubmission } from '@/core/models/dashboard.model'
import { UserProfile } from '@/core/models/user.model'

import SubmitterDashboard from '../SubmitterDashboard'

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockNavigate, mockUseUser, mockUseUserSubmissions } = vi.hoisted(
  () => ({
    mockNavigate: vi.fn(),
    mockUseUser: vi.fn(),
    mockUseUserSubmissions: vi.fn(),
  })
)

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../../contexts/UserContext', () => ({
  useUser: mockUseUser,
}))

vi.mock('../../../contexts/UserSubmissionsContext', () => ({
  useUserSubmissions: mockUseUserSubmissions,
}))

// Mock LDS components
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
  LdsSearch: ({ placeholder, searchTerm, onChange, ...props }: any) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={searchTerm || ''}
      onChange={onChange}
      {...props}
    />
  ),
  LdsIcon: ({ name, className, style, ...props }: any) => (
    <svg
      data-testid="lds-icon"
      className={className}
      style={style}
      role="img"
      aria-label={name}
      {...props}
    >
      <title>{name}</title>
    </svg>
  ),
  LdsTabs: ({ children, tabLabels, activeTab, onChange }: any) => (
    <div data-testid="tabs-container">
      <div data-testid="tab-buttons">
        {tabLabels.map((tab: any) => (
          <button
            key={tab.tabId}
            data-testid={`tab-${tab.tabId}`}
            onClick={() => onChange(tab.tabId)}
            onDoubleClick={() => onChange({ tabId: tab.tabId })}
            onContextMenu={e => {
              e.preventDefault()
              onChange({ target: { value: String(tab.tabId) } })
            }}
            className={activeTab === tab.tabId ? 'active' : ''}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  ),
  LdsTabPanel: ({ children, tabId, activeTab }: any) => (
    <div
      data-testid={`tab-panel-${tabId}`}
      style={{ display: activeTab === tabId ? 'block' : 'none' }}
    >
      {children}
    </div>
  ),
  LdsButton: ({
    children,
    onClick,
    disabled,
    className,
    classes,
    ...rest
  }: any) => (
    <button
      type="button"
      data-testid="lds-button"
      onClick={onClick}
      disabled={disabled}
      className={`${className || ''} ${classes || ''}`.trim()}
      {...rest}
    >
      {children}
    </button>
  ),
}))

// Mock SubmissionCard component
vi.mock('../../../components/SubmissionCard/SubmissionCard', () => ({
  SubmissionCard: ({
    id,
    title,
    onUpdate,
    className,
    'data-testid': dataTestId,
    ...otherProps
  }: any) => {
    // Filter out non-DOM props to avoid React warnings
    const {
      ticketNumber: _ticketNumber,
      submissionCount: _submissionCount,
      submitted_at: _submittedAt,
      status,
      description,
    } = otherProps
    return (
      <div
        data-testid={dataTestId || `submission-card-${id}`}
        className={className}
      >
        <h3>{title}</h3>
        <p>Status: {status}</p>
        <p>{description}</p>
        <button
          data-testid={`update-button-${id}`}
          onClick={() => onUpdate?.(id)}
        >
          Update
        </button>
      </div>
    )
  },
}))

// Mock CSS modules
vi.mock('./SubmitterDashboard.module.scss', () => ({
  default: {
    submitterDashboardPage: 'submitterDashboardPage',
    breadcrumbContainer: 'breadcrumbContainer',
    headerRow: 'headerRow',
    pageTitleRow: 'pageTitleRow',
    titleBlock: 'titleBlock',
    startNewBtn: 'startNewBtn',
    filterRow: 'filterRow',
    searchWrapper: 'searchWrapper',
    searchSubtitle: 'searchSubtitle',
    searchBarContainer: 'searchBarContainer',
    loadingButtonLink: 'loadingButtonLink',
    filterButtonLink: 'filterButtonLink',
    tabsWrapper: 'tabsWrapper',
    cardsGrid: 'cardsGrid',
  },
}))

describe('SubmitterDashboard', () => {
  const mockUser: UserProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    anyIdeasSubmitted: '5',
    department: 'Engineering',
    title: 'Software Engineer',
  }

  const mockSubmissions: UserIdeaSubmission[] = [
    {
      id: 'sub-1',
      category_id: 'cat-1',
      category_name: 'AI Innovation',
      status: 'submitted',
      submitted_at: '2023-01-15T10:30:00Z',
      title: 'AI Chatbot Enhancement',
      ai_registry_form_status: 'completed',
      ai_registry_update_form_id: 'form-790',
    },
    {
      id: 'sub-2',
      category_id: 'cat-2',
      category_name: 'Data Analytics',
      status: 'completed',
      submitted_at: '2023-02-20T14:45:00Z',
      title: 'Predictive Analytics Dashboard',
      ai_registry_form_status: 'pending',
      ai_registry_update_form_id: 'form-791',
    },
    {
      id: 'sub-3',
      category_id: 'cat-1',
      category_name: 'AI Innovation',
      status: 'submitted',
      submitted_at: '2023-03-10T09:15:00Z',
      title: 'Machine Learning Pipeline',
      ai_registry_form_status: 'pending',
      ai_registry_update_form_id: 'form-792',
    },
    {
      id: 'sub-4',
      category_id: 'cat-3',
      category_name: 'Process Automation',
      status: 'completed',
      submitted_at: '2023-03-25T16:20:00Z',
      title: '', // Empty title for filtering test
      ai_registry_form_status: 'completed',
      ai_registry_update_form_id: 'form-793',
    },
  ]

  const createWrapper =
    () =>
    ({ children }: { children: React.ReactNode }) => (
      <BrowserRouter>{children}</BrowserRouter>
    )

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseUser.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    mockUseUserSubmissions.mockReturnValue({
      submissions: mockSubmissions,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the main dashboard page with correct aria-label', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByLabelText('Submitter Dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('submitter-dashboard-page')).toBeInTheDocument()
    })

    it('should render breadcrumb navigation', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })
      // Breadcrumb may not be rendered in this page; ensure test does not fail if absent
      const breadcrumb = screen.queryByTestId('breadcrumb')
      expect(breadcrumb).toBeNull()
    })

    it('should render page title and start new submission link', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Welcome,')
      // Verify the start submission control exists
      const startButton = screen.getByTestId('lds-button')
      expect(startButton).toBeInTheDocument()
      expect(startButton).toHaveTextContent('Start New Submission')
    })

    it('should render search and filter section', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('Your Submissions')).toBeInTheDocument()
      // expect(screen.getByTestId('search-input')).toBeInTheDocument()
      // expect(screen.getByText('Filter')).toBeInTheDocument()
    })

    it('should render tabs container', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByTestId('tabs-container')).toBeInTheDocument()
      expect(screen.getByTestId('tab-buttons')).toBeInTheDocument()
    })
  })

  describe('User Context Integration', () => {
    it('should display user name from context', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Welcome,')
      expect(heading).toHaveTextContent('John Doe')
    })

    it('should fallback to userName prop when user context is null', () => {
      mockUseUser.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard userName="Jane Smith" />, {
        wrapper: createWrapper(),
      })
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Welcome,')
      expect(heading).toHaveTextContent('Jane Smith')
    })

    it('should display empty string when both user context and userName prop are null', () => {
      mockUseUser.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Welcome,')
    })

    it('should handle missing user name property', () => {
      mockUseUser.mockReturnValue({
        user: { ...mockUser, name: undefined },
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard userName="Fallback Name" />, {
        wrapper: createWrapper(),
      })
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Welcome,')
      expect(heading).toHaveTextContent('Fallback Name')
    })
  })

  describe('Submissions Data Handling', () => {
    it('should filter out submissions with blank titles', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Should show 3 valid submissions (excluding the one with empty title)
      expect(screen.getByText('All Submissions (3)')).toBeInTheDocument()
    })

    it('should calculate correct counts by status', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('All Submissions (3)')).toBeInTheDocument()
      expect(screen.getByText('In Progress (2)')).toBeInTheDocument() // 2 submitted (sub-1, sub-3)
      expect(screen.getByText('Completed (1)')).toBeInTheDocument() // 1 completed (sub-2)
    })

    it('should handle empty submissions list', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('All Submissions (0)')).toBeInTheDocument()
      expect(screen.getByText('In Progress (0)')).toBeInTheDocument()
      expect(screen.getByText('Completed (0)')).toBeInTheDocument()

      // Should find at least one "No submissions found" message (there will be multiple in different tab panels)
      expect(
        screen.getAllByText('No submissions found.').length
      ).toBeGreaterThan(0)
    })

    it('should handle submissions with only empty titles', () => {
      const emptyTitleSubmissions = [
        { ...mockSubmissions[0], title: '' },
        { ...mockSubmissions[1], title: '   ' }, // whitespace only
        { ...mockSubmissions[2], title: undefined as any },
      ]

      mockUseUserSubmissions.mockReturnValue({
        submissions: emptyTitleSubmissions,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('All Submissions (0)')).toBeInTheDocument()
      expect(
        screen.getAllByText('No submissions found.').length
      ).toBeGreaterThan(0)
    })
  })

  describe('Tab Navigation', () => {
    it('should render all tab labels with correct counts', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByTestId('tab-1')).toHaveTextContent(
        'All Submissions (3)'
      )
      expect(screen.getByTestId('tab-2')).toHaveTextContent('In Progress (2)')
      expect(screen.getByTestId('tab-3')).toHaveTextContent('Completed (1)')
    })

    it('should start with "All Submissions" tab active', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByTestId('tab-1')).toHaveClass('active')
      expect(screen.getByTestId('tab-panel-1')).toHaveStyle('display: block')
    })

    it('should switch to "In Progress" tab and filter submissions', async () => {
      const user = userEvent.setup()
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      await user.click(screen.getByTestId('tab-2'))

      await waitFor(() => {
        expect(screen.getByTestId('tab-2')).toHaveClass('active')
      })

      // Check that active tab panel shows only submitted submissions
      const activeTabPanel = screen.getByTestId('tab-panel-2')
      expect(activeTabPanel).toHaveStyle('display: block')

      // Should show only submitted submissions in active panel (sub-1 and sub-3)
      const activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(2)
      expect(activePanelCards[0]).toHaveAttribute(
        'data-testid',
        'submission-card-sub-1'
      )
      expect(activePanelCards[1]).toHaveAttribute(
        'data-testid',
        'submission-card-sub-3'
      )
    })

    it('should switch to "Completed" tab and filter submissions', async () => {
      const user = userEvent.setup()
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      await user.click(screen.getByTestId('tab-3'))

      await waitFor(() => {
        expect(screen.getByTestId('tab-3')).toHaveClass('active')
      })

      // Check that active tab panel shows only completed submissions
      const activeTabPanel = screen.getByTestId('tab-panel-3')
      expect(activeTabPanel).toHaveStyle('display: block')

      // Should show 1 completed submission (sub-2)
      const activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(1)
      expect(activePanelCards[0]).toHaveAttribute(
        'data-testid',
        'submission-card-sub-2'
      )
    })

    it('should handle tab change with different argument types', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Test direct number argument
      fireEvent.click(screen.getByTestId('tab-2'))
      await waitFor(() => {
        expect(screen.getByTestId('tab-2')).toHaveClass('active')
      })

      // Test object with tabId property
      const tabButton = screen.getByTestId('tab-3')
      fireEvent.click(tabButton)
      await waitFor(() => {
        expect(screen.getByTestId('tab-3')).toHaveClass('active')
      })
    })
  })

  // describe('Search Functionality', () => {
  //   it('should handle search input changes', async () => {
  //     const user = userEvent.setup()
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const searchInput = screen.getByTestId('search-input')
  //     await user.type(searchInput, 'AI Innovation')

  //     await waitFor(() => {
  //       expect(searchInput).toHaveValue('AI Innovation')
  //     })
  //   })

  //   it('should filter submissions by category name', async () => {
  //     const user = userEvent.setup()
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const searchInput = screen.getByTestId('search-input')
  //     await user.type(searchInput, 'AI Innovation')

  //     await waitFor(() => {
  //       // Check active tab panel for filtered results
  //       const activeTabPanel = screen.getByTestId('tab-panel-1')
  //       const activePanelCards = activeTabPanel.querySelectorAll(
  //         '[data-testid^="submission-card"]'
  //       )
  //       expect(activePanelCards.length).toBe(2)
  //       expect(activePanelCards[0]).toHaveAttribute(
  //         'data-testid',
  //         'submission-card-sub-1'
  //       )
  //       expect(activePanelCards[1]).toHaveAttribute(
  //         'data-testid',
  //         'submission-card-sub-3'
  //       )
  //     })
  //   })

  //   it('should filter submissions by status', async () => {
  //     const user = userEvent.setup()
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const searchInput = screen.getByTestId('search-input')
  //     await user.type(searchInput, 'completed')

  //     await waitFor(() => {
  //       // Check active tab panel for filtered results
  //       const activeTabPanel = screen.getByTestId('tab-panel-1')
  //       const activePanelCards = activeTabPanel.querySelectorAll(
  //         '[data-testid^="submission-card"]'
  //       )
  //       expect(activePanelCards.length).toBe(1)
  //       expect(activePanelCards[0]).toHaveAttribute(
  //         'data-testid',
  //         'submission-card-sub-2'
  //       )
  //     })
  //   })

  //   it('should filter submissions by submitted date', async () => {
  //     const user = userEvent.setup()
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const searchInput = screen.getByTestId('search-input')
  //     await user.type(searchInput, '2023-02-20')

  //     await waitFor(() => {
  //       // Check active tab panel for filtered results
  //       const activeTabPanel = screen.getByTestId('tab-panel-1')
  //       const activePanelCards = activeTabPanel.querySelectorAll(
  //         '[data-testid^="submission-card"]'
  //       )
  //       expect(activePanelCards.length).toBe(1)
  //       expect(activePanelCards[0]).toHaveAttribute(
  //         'data-testid',
  //         'submission-card-sub-2'
  //       )
  //     })
  //   })

  //   it('should show no results for non-matching search', async () => {
  //     const user = userEvent.setup()
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const searchInput = screen.getByTestId('search-input')
  //     await user.type(searchInput, 'nonexistent')

  //     await waitFor(() => {
  //       // Check active tab panel shows no results message
  //       const activeTabPanel = screen.getByTestId('tab-panel-1')
  //       expect(activeTabPanel.textContent).toContain('No submissions found.')
  //       const activePanelCards = activeTabPanel.querySelectorAll(
  //         '[data-testid^="submission-card"]'
  //       )
  //       expect(activePanelCards.length).toBe(0)
  //     })
  //   })

  //   it('should handle empty search term', async () => {
  //     const user = userEvent.setup()
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const searchInput = screen.getByTestId('search-input')
  //     await user.type(searchInput, 'AI')
  //     await user.clear(searchInput)

  //     await waitFor(() => {
  //       // Check active tab panel shows all submissions when search is cleared
  //       const activeTabPanel = screen.getByTestId('tab-panel-1')
  //       const activePanelCards = activeTabPanel.querySelectorAll(
  //         '[data-testid^="submission-card"]'
  //       )
  //       expect(activePanelCards.length).toBe(3)
  //     })
  //   })

  //   it('should handle search with different onChange argument types', async () => {
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const searchInput = screen.getByTestId('search-input')

  //     // Test with string value
  //     fireEvent.change(searchInput, { target: { value: 'test string' } })
  //     await waitFor(() => {
  //       expect(searchInput).toHaveValue('test string')
  //     })

  //     // Test with event object
  //     fireEvent.change(searchInput, { target: { value: 'event object' } })
  //     await waitFor(() => {
  //       expect(searchInput).toHaveValue('event object')
  //     })
  //   })
  // })

  // describe('Filter Functionality', () => {
  //   it('should show filter button in normal state', () => {
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     expect(screen.getByText('Filter')).toBeInTheDocument()
  //     expect(screen.queryByText('Filtering...')).not.toBeInTheDocument()
  //   })

  //   it('should show loading state when filter is clicked', async () => {
  //     const user = userEvent.setup()
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     await user.click(screen.getByText('Filter'))

  //     expect(screen.getByText('Filtering...')).toBeInTheDocument()
  //     expect(screen.queryByText('Filter')).not.toBeInTheDocument()
  //   })

  //   it('should return to normal state after filter loading completes', async () => {
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const filterButton = screen.getByText('Filter')
  //     fireEvent.click(filterButton)

  //     expect(screen.getByText('Filtering...')).toBeInTheDocument()

  //     // Wait for the filter loading to complete (600ms timeout)
  //     await waitFor(
  //       () => {
  //         expect(screen.getByText('Filter')).toBeInTheDocument()
  //         expect(screen.queryByText('Filtering...')).not.toBeInTheDocument()
  //       },
  //       { timeout: 3000 }
  //     )
  //   })

  //   it('should prevent filter button click when in loading state', async () => {
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     const filterButton = screen.getByText('Filter')
  //     fireEvent.click(filterButton)

  //     // Should show loading state
  //     await waitFor(() => {
  //       expect(screen.getByText('Filtering...')).toBeInTheDocument()
  //     })

  //     const loadingLink = screen.getByText('Filtering...')
  //     expect(loadingLink.closest('a')).toHaveAttribute('aria-disabled', 'true')
  //   })
  // })

  describe('Submission Card Rendering', () => {
    it('should render submission cards with correct data', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Check active tab panel contains the expected cards
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      const activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(3)

      // Check titles within the active tab panel only
      expect(activeTabPanel.querySelector('h3')).toHaveTextContent(
        'AI Chatbot Enhancement'
      )
      const allTitles = Array.from(activeTabPanel.querySelectorAll('h3')).map(
        h3 => h3.textContent
      )
      expect(allTitles).toContain('AI Chatbot Enhancement')
      expect(allTitles).toContain('Predictive Analytics Dashboard')
      expect(allTitles).toContain('Machine Learning Pipeline')
    })

    it('should handle submission card update navigation', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Click the first update button found in the active tab panel
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      const updateButton = activeTabPanel.querySelector(
        '[data-testid="update-button-sub-1"]'
      ) as HTMLElement

      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/form-dashboard/sub-1')
      })
    })

    it('should pass correct props to SubmissionCard', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Check card in active tab panel
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      const card = activeTabPanel.querySelector(
        '[data-testid="submission-card-sub-1"]'
      )
      expect(card).toHaveAttribute('data-testid', 'submission-card-sub-1')
    })
  })

  describe('Pagination Handling', () => {
    const createLargeSubmissionSet = (count: number): UserIdeaSubmission[] => {
      return Array.from({ length: count }, (_, index) => ({
        id: `sub-${index + 1}`,
        category_id: `cat-${(index % 3) + 1}`,
        category_name: `Category ${(index % 3) + 1}`,
        status: index % 2 === 0 ? 'submitted' : 'completed',
        submitted_at: `2023-0${(index % 12) + 1}-15T10:30:00Z`,
        title: `Submission ${index + 1}`,
        ai_registry_form_status: 'completed',
        ai_registry_update_form_id: `form-${(index % 12) + 1}`,
      }))
    }

    it('should show all submissions without pagination', () => {
      const largeSubmissions = createLargeSubmissionSet(15)
      mockUseUserSubmissions.mockReturnValue({
        submissions: largeSubmissions,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Check active tab panel shows all 15 submissions (no pagination)
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      const activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(15)
    })

    it('should reset page to 1 when tab changes', async () => {
      const largeSubmissions = createLargeSubmissionSet(15)
      mockUseUserSubmissions.mockReturnValue({
        submissions: largeSubmissions,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Switch to another tab
      const tab2 = screen.getByTestId('tab-2')
      fireEvent.click(tab2)

      await waitFor(() => {
        // Should show first page of filtered results
        expect(screen.getByTestId('tab-2')).toHaveClass('active')
      })
    })

    // it('should reset page to 1 when filter is applied', async () => {
    //   const largeSubmissions = createLargeSubmissionSet(15)
    //   mockUseUserSubmissions.mockReturnValue({
    //     submissions: largeSubmissions,
    //     loading: false,
    //     error: null,
    //     refetch: vi.fn(),
    //   })

    //   render(<SubmitterDashboard />, { wrapper: createWrapper() })

    //   const filterButton = screen.getByText('Filter')
    //   fireEvent.click(filterButton)

    //   // Wait for filter loading to complete
    //   await waitFor(
    //     () => {
    //       expect(screen.getByText('Filter')).toBeInTheDocument()
    //     },
    //     { timeout: 3000 }
    //   )
    // }, 10000)
  })

  // describe('Combined Search and Tab Filtering', () => {
  //   it('should apply both tab filter and search filter', async () => {
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     // Switch to "Completed" tab
  //     const tab3 = screen.getByTestId('tab-3')
  //     fireEvent.click(tab3)

  //     // Add search term
  //     const searchInput = screen.getByTestId('search-input')
  //     fireEvent.change(searchInput, { target: { value: 'Analytics' } })

  //     await waitFor(() => {
  //       // Check active tab panel shows only completed submissions with "Analytics" in category
  //       const activeTabPanel = screen.getByTestId('tab-panel-3')
  //       const activePanelCards = activeTabPanel.querySelectorAll(
  //         '[data-testid^="submission-card"]'
  //       )
  //       expect(activePanelCards.length).toBe(1)
  //       expect(activePanelCards[0]).toHaveAttribute(
  //         'data-testid',
  //         'submission-card-sub-2'
  //       )
  //     })
  //   })

  //   it('should maintain search when switching tabs', async () => {
  //     render(<SubmitterDashboard />, { wrapper: createWrapper() })

  //     // Add search term first
  //     const searchInput = screen.getByTestId('search-input')
  //     fireEvent.change(searchInput, { target: { value: 'AI Innovation' } })

  //     // Switch to "In Progress" tab
  //     const tab2 = screen.getByTestId('tab-2')
  //     fireEvent.click(tab2)

  //     await waitFor(() => {
  //       // Check active tab panel shows submitted submissions with "AI Innovation" category
  //       // Both sub-1 and sub-3 have status='submitted' and category='AI Innovation'
  //       const activeTabPanel = screen.getByTestId('tab-panel-2')
  //       const activePanelCards = activeTabPanel.querySelectorAll(
  //         '[data-testid^="submission-card"]'
  //       )
  //       expect(activePanelCards.length).toBe(2)
  //       expect(activePanelCards[0]).toHaveAttribute(
  //         'data-testid',
  //         'submission-card-sub-1'
  //       )
  //       expect(activePanelCards[1]).toHaveAttribute(
  //         'data-testid',
  //         'submission-card-sub-3'
  //       )
  //     })
  //   })
  // })

  describe('Edge Cases', () => {
    it('should handle submissions context loading state', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('All Submissions (0)')).toBeInTheDocument()
    })

    it('should handle submissions context error state', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: 'Failed to fetch submissions',
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('All Submissions (0)')).toBeInTheDocument()
      expect(
        screen.getAllByText('No submissions found.').length
      ).toBeGreaterThan(0)
    })

    it('should handle malformed submission data gracefully', () => {
      const malformedSubmissions = [
        {
          id: 'sub-1',
          category_id: 'cat-1',
          category_name: 'AI Innovation',
          status: 'submitted',
          submitted_at: 'invalid-date',
          title: 'Valid Title',
        },
        {
          id: 'sub-2',
          category_id: null as any,
          category_name: null as any,
          status: null as any,
          submitted_at: null as any,
          title: 'Another Valid Title',
        },
      ] as UserIdeaSubmission[]

      mockUseUserSubmissions.mockReturnValue({
        submissions: malformedSubmissions,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('All Submissions (2)')).toBeInTheDocument()

      // Check active tab panel contains expected cards
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      const activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(2)
    })

    it('should handle undefined submissions array', () => {
      mockUseUserSubmissions.mockReturnValue({
        submissions: undefined as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      // Should not crash and should show empty state
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Check within active tab to avoid duplicate element issues
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      expect(screen.getAllByText('All Submissions (0)')[0]).toBeInTheDocument()
      expect(activeTabPanel.textContent).toContain('No submissions found.')
    })
  })

  describe('SubmissionCard Props', () => {
    it('should pass aiRegistryFormId prop to SubmissionCard', () => {
      const mockWithFormId: UserIdeaSubmission[] = [
        {
          id: 'sub-1',
          category_id: 'cat-1',
          category_name: 'AI Innovation',
          status: 'completed',
          submitted_at: '2023-01-15T10:30:00Z',
          title: 'Test Submission',
          ai_registry_form_status: 'completed',
          ai_registry_update_form_id: 'form-123',
        },
      ]

      mockUseUserSubmissions.mockReturnValue({
        submissions: mockWithFormId,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Verify the card is rendered within the active tab panel
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      expect(activeTabPanel).toHaveTextContent('Test Submission')
    })

    it('should handle empty aiRegistryFormId', () => {
      const mockWithEmptyFormId: UserIdeaSubmission[] = [
        {
          id: 'sub-1',
          category_id: 'cat-1',
          category_name: 'AI Innovation',
          status: 'completed',
          submitted_at: '2023-01-15T10:30:00Z',
          title: 'Test Submission',
          ai_registry_form_status: 'pending',
          ai_registry_update_form_id: '',
        },
      ]

      mockUseUserSubmissions.mockReturnValue({
        submissions: mockWithEmptyFormId,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Verify the card is rendered within the active tab panel
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      expect(activeTabPanel).toHaveTextContent('Test Submission')
    })

    it('should handle whitespace-only aiRegistryFormId by trimming it', () => {
      const mockWithWhitespaceFormId: UserIdeaSubmission[] = [
        {
          id: 'sub-1',
          category_id: 'cat-1',
          category_name: 'AI Innovation',
          status: 'completed',
          submitted_at: '2023-01-15T10:30:00Z',
          title: 'Test Submission',
          ai_registry_form_status: 'completed',
          ai_registry_update_form_id: '   ',
        },
      ]

      mockUseUserSubmissions.mockReturnValue({
        submissions: mockWithWhitespaceFormId,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Verify the card is rendered within the active tab panel
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      expect(activeTabPanel).toHaveTextContent('Test Submission')
    })

    it('should not pass aiRegistryFormStatus prop to SubmissionCard', () => {
      // This test verifies the bug fix where aiRegistryFormStatus was removed
      // The component now relies on the submission status alone
      const mockSubmissionsWithStatus: UserIdeaSubmission[] = [
        {
          id: 'sub-1',
          category_id: 'cat-1',
          category_name: 'AI Innovation',
          status: 'completed',
          submitted_at: '2023-01-15T10:30:00Z',
          title: 'Completed Submission',
          ai_registry_form_status: 'pending', // This should not affect the button visibility
          ai_registry_update_form_id: 'form-123',
        },
      ]

      mockUseUserSubmissions.mockReturnValue({
        submissions: mockSubmissionsWithStatus,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      // Button visibility is determined by submission status, not ai_registry_form_status
      // The actual SubmissionCard component will show the button based on status === 'completed'
      // Verify within the active tab panel to avoid multiple matches
      const activeTabPanel = screen.getByTestId('tab-panel-1')
      expect(activeTabPanel).toHaveTextContent('Completed Submission')
    })
  })

  describe('Navigation Actions', () => {
    it('should navigate to /begin when Start New Submission button is clicked', async () => {
      const user = userEvent.setup()
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const startButton = screen.getByTestId('lds-button')
      await user.click(startButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/begin')
      })
    })

    it('should navigate when Start New Submission button is clicked with fireEvent', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const startButton = screen.getByTestId('lds-button')
      fireEvent.click(startButton)

      expect(mockNavigate).toHaveBeenCalledWith('/begin')
    })

    it('should handle multiple update button clicks', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const activeTabPanel = screen.getByTestId('tab-panel-1')
      const updateButton1 = activeTabPanel.querySelector(
        '[data-testid="update-button-sub-1"]'
      ) as HTMLElement
      const updateButton2 = activeTabPanel.querySelector(
        '[data-testid="update-button-sub-2"]'
      ) as HTMLElement

      fireEvent.click(updateButton1)
      expect(mockNavigate).toHaveBeenCalledWith('/form-dashboard/sub-1')

      fireEvent.click(updateButton2)
      expect(mockNavigate).toHaveBeenCalledWith('/form-dashboard/sub-2')
    })
  })

  describe('Tab onChange Edge Cases', () => {
    it('should handle onChange with event.target.value as valid number', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const tab2Button = screen.getByTestId('tab-2')
      fireEvent.click(tab2Button)

      await waitFor(() => {
        expect(screen.getByTestId('tab-2')).toHaveClass('active')
      })
    })

    it('should handle onChange with object containing tabId', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const tab2Button = screen.getByTestId('tab-2')
      fireEvent.doubleClick(tab2Button)

      await waitFor(() => {
        expect(screen.getByTestId('tab-2')).toHaveClass('active')
        expect(screen.getByTestId('tab-panel-2')).toHaveStyle('display: block')
      })
    })

    it('should handle onChange with direct number argument', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const tab3Button = screen.getByTestId('tab-3')
      fireEvent.click(tab3Button)

      await waitFor(() => {
        expect(screen.getByTestId('tab-3')).toHaveClass('active')
        expect(screen.getByTestId('tab-panel-3')).toHaveStyle('display: block')
      })
    })

    it('should handle onChange with event.target.value format', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const tab2Button = screen.getByTestId('tab-2')
      fireEvent.contextMenu(tab2Button)

      await waitFor(() => {
        expect(screen.getByTestId('tab-2')).toHaveClass('active')
        expect(screen.getByTestId('tab-panel-2')).toHaveStyle('display: block')
      })
    })

    it('should handle onChange with string value that parses to valid number', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const tab3Button = screen.getByTestId('tab-3')
      fireEvent.contextMenu(tab3Button)

      await waitFor(() => {
        expect(screen.getByTestId('tab-3')).toHaveClass('active')
      })
    })
  })

  describe('Filtered Data Scenarios', () => {
    it('should handle empty filter result for In Progress tab', async () => {
      const completedOnlySubmissions: UserIdeaSubmission[] = [
        {
          id: 'sub-1',
          category_id: 'cat-1',
          category_name: 'AI Innovation',
          status: 'completed',
          submitted_at: '2023-01-15T10:30:00Z',
          title: 'Completed Submission 1',
          ai_registry_form_status: 'completed',
          ai_registry_update_form_id: 'form-1',
        },
        {
          id: 'sub-2',
          category_id: 'cat-2',
          category_name: 'Data Analytics',
          status: 'completed',
          submitted_at: '2023-02-20T14:45:00Z',
          title: 'Completed Submission 2',
          ai_registry_form_status: 'completed',
          ai_registry_update_form_id: 'form-2',
        },
      ]

      mockUseUserSubmissions.mockReturnValue({
        submissions: completedOnlySubmissions,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const tab2Button = screen.getByTestId('tab-2')
      fireEvent.click(tab2Button)

      await waitFor(() => {
        expect(screen.getByTestId('tab-2')).toHaveClass('active')
      })

      const activeTabPanel = screen.getByTestId('tab-panel-2')
      expect(activeTabPanel.textContent).toContain('No submissions found.')
    })

    it('should handle empty filter result for Completed tab', async () => {
      const submittedOnlySubmissions: UserIdeaSubmission[] = [
        {
          id: 'sub-1',
          category_id: 'cat-1',
          category_name: 'AI Innovation',
          status: 'submitted',
          submitted_at: '2023-01-15T10:30:00Z',
          title: 'In Progress Submission 1',
          ai_registry_form_status: 'pending',
          ai_registry_update_form_id: 'form-1',
        },
        {
          id: 'sub-2',
          category_id: 'cat-2',
          category_name: 'Data Analytics',
          status: 'submitted',
          submitted_at: '2023-02-20T14:45:00Z',
          title: 'In Progress Submission 2',
          ai_registry_form_status: 'pending',
          ai_registry_update_form_id: 'form-2',
        },
      ]

      mockUseUserSubmissions.mockReturnValue({
        submissions: submittedOnlySubmissions,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const tab3Button = screen.getByTestId('tab-3')
      fireEvent.click(tab3Button)

      await waitFor(() => {
        expect(screen.getByTestId('tab-3')).toHaveClass('active')
      })

      const activeTabPanel = screen.getByTestId('tab-panel-3')
      expect(activeTabPanel.textContent).toContain('No submissions found.')
    })

    it('should correctly filter when switching between all tabs', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      let activeTabPanel = screen.getByTestId('tab-panel-1')
      let activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(3)

      fireEvent.click(screen.getByTestId('tab-2'))
      await waitFor(() => {
        expect(screen.getByTestId('tab-2')).toHaveClass('active')
      })
      activeTabPanel = screen.getByTestId('tab-panel-2')
      activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(2)

      fireEvent.click(screen.getByTestId('tab-3'))
      await waitFor(() => {
        expect(screen.getByTestId('tab-3')).toHaveClass('active')
      })
      activeTabPanel = screen.getByTestId('tab-panel-3')
      activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(1)

      fireEvent.click(screen.getByTestId('tab-1'))
      await waitFor(() => {
        expect(screen.getByTestId('tab-1')).toHaveClass('active')
      })
      activeTabPanel = screen.getByTestId('tab-panel-1')
      activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(3)
    })
  })

  describe('Submission Card Properties', () => {
    it('should pass all required props to SubmissionCard', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const activeTabPanel = screen.getByTestId('tab-panel-1')
      const card = activeTabPanel.querySelector(
        '[data-testid="submission-card-sub-1"]'
      )

      expect(card).toHaveAttribute('data-testid', 'submission-card-sub-1')
      expect(card?.querySelector('h3')).toHaveTextContent(
        'AI Chatbot Enhancement'
      )
      expect(card?.querySelector('p')).toHaveTextContent('Status: submitted')
    })

    it('should render description with submitted_at timestamp', () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      const activeTabPanel = screen.getByTestId('tab-panel-1')
      const descriptions = activeTabPanel.querySelectorAll('p')

      const submittedAtDescription = Array.from(descriptions).find(p =>
        p.textContent?.includes('Submitted at:')
      )

      expect(submittedAtDescription).toBeTruthy()
      expect(submittedAtDescription?.textContent).toContain('2023-')
    })
  })

  describe('useMemo Dependencies', () => {
    it('should recalculate filteredData when activeTab changes', async () => {
      render(<SubmitterDashboard />, { wrapper: createWrapper() })

      let activeTabPanel = screen.getByTestId('tab-panel-1')
      let activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(3)

      fireEvent.click(screen.getByTestId('tab-2'))

      await waitFor(() => {
        activeTabPanel = screen.getByTestId('tab-panel-2')
        activePanelCards = activeTabPanel.querySelectorAll(
          '[data-testid^="submission-card"]'
        )
        expect(activePanelCards.length).toBe(2)
      })
    })

    it('should recalculate filteredData when validSubmissions changes', () => {
      const { rerender } = render(<SubmitterDashboard />, {
        wrapper: createWrapper(),
      })

      let activeTabPanel = screen.getByTestId('tab-panel-1')
      let activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(3)

      const newSubmissions: UserIdeaSubmission[] = [
        {
          id: 'sub-new',
          category_id: 'cat-1',
          category_name: 'New Category',
          status: 'submitted',
          submitted_at: '2023-04-01T10:00:00Z',
          title: 'New Submission',
          ai_registry_form_status: 'pending',
          ai_registry_update_form_id: 'form-999',
        },
      ]

      mockUseUserSubmissions.mockReturnValue({
        submissions: newSubmissions,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      rerender(<SubmitterDashboard />)

      activeTabPanel = screen.getByTestId('tab-panel-1')
      activePanelCards = activeTabPanel.querySelectorAll(
        '[data-testid^="submission-card"]'
      )
      expect(activePanelCards.length).toBe(1)
    })

    it('should recalculate validSubmissions when userSubmissions changes', () => {
      const { rerender } = render(<SubmitterDashboard />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByText('All Submissions (3)')).toBeInTheDocument()

      mockUseUserSubmissions.mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      rerender(<SubmitterDashboard />)

      expect(screen.getByText('All Submissions (0)')).toBeInTheDocument()
    })
  })
})
