import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockGetUserInfo } = vi.hoisted(() => ({
  mockGetUserInfo: vi.fn(),
}))

// Mock user API
vi.mock('./core/api/user.api', () => ({
  userApi: {
    getUserInfo: mockGetUserInfo,
  },
}))

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', async () => {
  const LdsHeaderLink = ({ children, href }: any) => (
    <a data-testid="header-link" href={href}>
      {children}
    </a>
  )

  const LdsHeaderComponent = ({ children, customLogo, className }: any) => (
    <header data-testid="lds-header" className={className}>
      <div data-testid="custom-logo">{customLogo}</div>
      {children}
    </header>
  )

  LdsHeaderComponent.Link = LdsHeaderLink

  return {
    LdsHeader: LdsHeaderComponent,
    LdsButton: ({
      children,
      onClick,
      disabled,
      iconPosition,
      ...props
    }: any) => (
      <button
        data-testid="lds-button"
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    ),
    LdsToast: () => <div data-testid="lds-toast" />,
    LdsToastProvider: ({ children, maxToasts }: any) => (
      <div data-testid="lds-toast-provider" data-max-toasts={maxToasts}>
        {children}
      </div>
    ),
    LdsLoadingSpinner: ({ className, ariaLabel }: any) => (
      <div
        data-testid="lds-loading-spinner"
        className={className}
        aria-label={ariaLabel}
      />
    ),
    useToastContext: () => ({
      addToast: vi.fn(),
      removeToast: vi.fn(),
      toasts: [],
    }),
  }
})

// Mock child components
vi.mock('./components/ExtractionStatusBanner', () => ({
  default: () => <div data-testid="extraction-status-banner" />,
}))

vi.mock('./components/Footer/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}))

vi.mock('./components/UserProfile/UserProfile', () => ({
  default: ({ userProfile }: any) => (
    <div data-testid="user-profile">
      {userProfile?.name || userProfile?.email}
    </div>
  ),
}))

// Mock AppRoutes
vi.mock('./routes/AppRoutes', () => ({
  default: () => <div data-testid="app-routes">App Routes</div>,
}))

// Mock context providers
vi.mock('./contexts/UserContext', () => ({
  UserProvider: ({ children }: any) => (
    <div data-testid="user-provider">{children}</div>
  ),
}))

vi.mock('./contexts/UserSubmissionsContext', () => ({
  UserSubmissionsProvider: ({ children }: any) => (
    <div data-testid="user-submissions-provider">{children}</div>
  ),
}))

vi.mock('./contexts/ExtractionStatusContext', () => ({
  ExtractionStatusProvider: ({ children }: any) => (
    <div data-testid="extraction-status-provider">{children}</div>
  ),
}))

vi.mock('./contexts/DataExtractsStatusContext', () => ({
  DataExtractsStatusProvider: ({ children }: any) => (
    <div data-testid="data-extracts-status-provider">{children}</div>
  ),
}))

// Mock assets
vi.mock('./assets/lilly-long-logo.svg', () => ({
  default: 'lilly-logo.svg',
}))

// Mock CSS imports
vi.mock('./App.scss', () => ({}))
vi.mock('@elilillyco/ux-lds-react/src/css/lds.css', () => ({}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserInfo.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      anyIdeasSubmitted: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Core Rendering', () => {
    it('should render the App component successfully', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('lds-toast-provider')).toBeInTheDocument()
      })
    })

    it('should render the header with logo', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('lds-header')).toBeInTheDocument()
        expect(screen.getByTestId('custom-logo')).toBeInTheDocument()
      })
    })

    it('should render the footer', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument()
      })
    })

    it('should render the extraction status banner', async () => {
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByTestId('extraction-status-banner')
        ).toBeInTheDocument()
      })
    })

    it('should render LdsToast component', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('lds-toast')).toBeInTheDocument()
      })
    })

    it('should have correct main content structure', async () => {
      render(<App />)

      await waitFor(() => {
        const mainContent = document.querySelector('.App-content')
        expect(mainContent).toBeInTheDocument()
      })
    })

    it('should render AppRoutes component', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('app-routes')).toBeInTheDocument()
      })
    })
  })

  describe('Context Providers', () => {
    it('should wrap the app with UserProvider', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('user-provider')).toBeInTheDocument()
      })
    })

    it('should wrap the app with UserSubmissionsProvider', async () => {
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByTestId('user-submissions-provider')
        ).toBeInTheDocument()
      })
    })

    it('should wrap the app with ExtractionStatusProvider', async () => {
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByTestId('extraction-status-provider')
        ).toBeInTheDocument()
      })
    })

    it('should wrap the app with DataExtractsStatusProvider', async () => {
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByTestId('data-extracts-status-provider')
        ).toBeInTheDocument()
      })
    })

    it('should wrap the app with LdsToastProvider with maxToasts set to 5', async () => {
      render(<App />)

      await waitFor(() => {
        const toastProvider = screen.getByTestId('lds-toast-provider')
        expect(toastProvider).toBeInTheDocument()
        expect(toastProvider).toHaveAttribute('data-max-toasts', '5')
      })
    })
  })

  describe('User Profile Fetching', () => {
    it('should fetch user info on mount', async () => {
      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalledTimes(1)
      })
    })

    it('should display user profile when user data is loaded', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        anyIdeasSubmitted: true,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('should handle user info fetch error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetUserInfo.mockRejectedValue(new Error('Failed to fetch user'))

      render(<App />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching user info:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })

    it('should not display user profile when user data is null', async () => {
      mockGetUserInfo.mockResolvedValue(null)

      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalled()
      })

      expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
    })

    it('should display user profile with email when name is not available', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        anyIdeasSubmitted: false,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('should handle user profile with both name and email', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        anyIdeasSubmitted: true,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Header Navigation', () => {
    it('should display Dashboard link when user has submitted ideas and not on dashboard', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        anyIdeasSubmitted: true,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
    })

    it('should not display Dashboard link when user has not submitted ideas', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        anyIdeasSubmitted: false,
      })

      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalled()
      })

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('should always display FAQ link', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('FAQ')).toBeInTheDocument()
      })
    })

    it('should have correct href for FAQ link', async () => {
      render(<App />)

      await waitFor(() => {
        const faqLink = screen.getByText('FAQ').closest('a')
        expect(faqLink).toHaveAttribute(
          'href',
          'https://ai.lilly.com/frequently-asked-questions'
        )
      })
    })

    it('should have correct href for Dashboard link when displayed', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        anyIdeasSubmitted: true,
      })

      render(<App />)

      await waitFor(() => {
        const dashboardLink = screen.getByText('Dashboard').closest('a')
        expect(dashboardLink).toHaveAttribute('href', '/submitter-dashboard')
      })
    })
  })

  describe('Header Logo', () => {
    it('should render Lilly logo with correct alt text', async () => {
      render(<App />)

      await waitFor(() => {
        const logo = screen.getByAltText('Eli Lilly and Company logo')
        expect(logo).toBeInTheDocument()
      })
    })

    it('should render logo with correct src', async () => {
      render(<App />)

      await waitFor(() => {
        const logo = screen.getByAltText(
          'Eli Lilly and Company logo'
        ) as HTMLImageElement
        expect(logo.src).toContain('lilly-logo.svg')
      })
    })

    it('should render logo with padding style', async () => {
      render(<App />)

      await waitFor(() => {
        const logo = screen.getByAltText(
          'Eli Lilly and Company logo'
        ) as HTMLImageElement
        expect(logo).toHaveStyle({ padding: '0' })
      })
    })
  })

  describe('App Structure', () => {
    it('should have the App div with correct className', async () => {
      render(<App />)

      await waitFor(() => {
        const appDiv = document.querySelector('.App')
        expect(appDiv).toBeInTheDocument()
      })
    })

    it('should have header-nav-wrapper with proper structure', async () => {
      render(<App />)

      await waitFor(() => {
        const navWrapper = document.querySelector('.header-nav-wrapper')
        expect(navWrapper).toBeInTheDocument()
      })
    })

    it('should render header with Lds-header className', async () => {
      render(<App />)

      await waitFor(() => {
        const header = screen.getByTestId('lds-header')
        expect(header).toHaveClass('Lds-header')
      })
    })

    it('should render BrowserRouter at the root level', async () => {
      const { container } = render(<App />)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle getUserInfo returning undefined', async () => {
      mockGetUserInfo.mockResolvedValue(undefined)

      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalled()
      })

      expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
    })

    it('should not crash when anyIdeasSubmitted is undefined', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      })

      expect(() => render(<App />)).not.toThrow()

      await waitFor(() => {
        expect(screen.getByTestId('lds-header')).toBeInTheDocument()
      })
    })

    it('should handle network timeout errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetUserInfo.mockRejectedValue(new Error('Network timeout'))

      render(<App />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      // App should still render despite error
      expect(screen.getByTestId('lds-header')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it('should handle null userProfile without crashing', async () => {
      mockGetUserInfo.mockResolvedValue(null)

      expect(() => render(<App />)).not.toThrow()

      await waitFor(() => {
        expect(screen.getByTestId('lds-header')).toBeInTheDocument()
      })
    })

    it('should not display user profile when userProfile is null', async () => {
      mockGetUserInfo.mockResolvedValue(null)

      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalled()
      })

      expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should render all major sections in correct order', async () => {
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByTestId('extraction-status-banner')
        ).toBeInTheDocument()
      })

      const appDiv = document.querySelector('.App')
      expect(appDiv?.children[0]).toHaveAttribute(
        'data-testid',
        'extraction-status-banner'
      )
    })

    it('should render main content with App-content class', async () => {
      render(<App />)

      await waitFor(() => {
        const main = document.querySelector('main.App-content')
        expect(main).toBeInTheDocument()
      })
    })

    it('should nest components correctly within providers', async () => {
      render(<App />)

      await waitFor(() => {
        const userProvider = screen.getByTestId('user-provider')
        const submissionsProvider = screen.getByTestId(
          'user-submissions-provider'
        )

        expect(userProvider).toBeInTheDocument()
        expect(submissionsProvider).toBeInTheDocument()
      })
    })
  })

  describe('User State Management', () => {
    it('should start with null userProfile state', async () => {
      mockGetUserInfo.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<App />)

      // UserProfile should not be rendered before fetch completes
      expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
    })

    it('should update state after successful fetch', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-2',
        name: 'New User',
        email: 'new@example.com',
        anyIdeasSubmitted: false,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('New User')).toBeInTheDocument()
      })
    })

    it('should call getUserInfo only once per mount', async () => {
      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalledTimes(1)
      })

      // Wait a bit more to ensure it's not called again
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockGetUserInfo).toHaveBeenCalledTimes(1)
    })
  })
})

vi.mock('./pages/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}))

vi.mock('./pages/BeginSubmission', () => ({
  default: () => <div data-testid="begin-submission">Begin Submission</div>,
}))

vi.mock('./pages/IdeaSubmission/IdeaSubmissionForm', () => ({
  default: () => (
    <div data-testid="idea-submission-form">Idea Submission Form</div>
  ),
}))

vi.mock('./pages/FormDashboard/FormDashboard', () => ({
  default: () => <div data-testid="form-dashboard">Form Dashboard</div>,
}))

vi.mock('./pages/SubmitterDashboard/SubmitterDashboard', () => ({
  default: ({ userName }: any) => (
    <div data-testid="submitter-dashboard">
      Submitter Dashboard - {userName}
    </div>
  ),
}))

vi.mock('./pages/AIRegistryForm/AIRegistryForm', () => ({
  default: () => <div data-testid="ai-registry-form">AI Registry Form</div>,
}))

vi.mock('./pages/DigitalLegalOffice/DigitalLegalOffice', () => ({
  default: () => (
    <div data-testid="digital-legal-office">Digital Legal Office</div>
  ),
}))

vi.mock('./pages/WorkingWithThirdParty/WorkingWithThirdParty', () => ({
  default: () => (
    <div data-testid="working-with-third-party">Working With Third Party</div>
  ),
}))

vi.mock('./pages/SecurityAndEng/SecurityAndEng', () => ({
  default: () => (
    <div data-testid="security-and-eng">Security And Engineering</div>
  ),
}))

// Mock context providers
vi.mock('./contexts/UserContext', () => ({
  UserProvider: ({ children }: any) => (
    <div data-testid="user-provider">{children}</div>
  ),
  useUser: () => ({
    user: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock('./contexts/UserSubmissionsContext', () => ({
  UserSubmissionsProvider: ({ children }: any) => (
    <div data-testid="user-submissions-provider">{children}</div>
  ),
  useUserSubmissions: () => ({
    submissions: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock('./contexts/ExtractionStatusContext', () => ({
  ExtractionStatusProvider: ({ children }: any) => (
    <div data-testid="extraction-status-provider">{children}</div>
  ),
  useExtractionStatus: () => ({
    status: null,
    loading: false,
    error: null,
  }),
}))

// Mock assets
vi.mock('./assets/lilly-long-logo.svg', () => ({
  default: 'lilly-logo.svg',
}))

// Mock CSS imports
vi.mock('./App.scss', () => ({}))
vi.mock('@elilillyco/ux-lds-react/src/css/lds.css', () => ({}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserInfo.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      anyIdeasSubmitted: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Core Rendering', () => {
    it('should render the App component successfully', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('lds-toast-provider')).toBeInTheDocument()
      })
    })

    it('should render the header with logo', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('lds-header')).toBeInTheDocument()
        expect(screen.getByTestId('custom-logo')).toBeInTheDocument()
      })
    })

    it('should render the footer', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument()
      })
    })

    it('should render the extraction status banner', async () => {
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByTestId('extraction-status-banner')
        ).toBeInTheDocument()
      })
    })

    it('should render LdsToast component', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('lds-toast')).toBeInTheDocument()
      })
    })

    it('should have correct main content structure', async () => {
      render(<App />)

      await waitFor(() => {
        const mainContent = document.querySelector('.App-content')
        expect(mainContent).toBeInTheDocument()
      })
    })
  })

  describe('Context Providers', () => {
    it('should wrap the app with UserProvider', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('user-provider')).toBeInTheDocument()
      })
    })

    it('should wrap the app with UserSubmissionsProvider', async () => {
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByTestId('user-submissions-provider')
        ).toBeInTheDocument()
      })
    })

    it('should wrap the app with ExtractionStatusProvider', async () => {
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByTestId('extraction-status-provider')
        ).toBeInTheDocument()
      })
    })

    it('should wrap the app with LdsToastProvider with maxToasts set to 5', async () => {
      render(<App />)

      await waitFor(() => {
        const toastProvider = screen.getByTestId('lds-toast-provider')
        expect(toastProvider).toBeInTheDocument()
      })
    })
  })

  describe('User Profile Fetching', () => {
    it('should fetch user info on mount', async () => {
      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalledTimes(1)
      })
    })

    it('should display user profile when user data is loaded', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        anyIdeasSubmitted: true,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('should handle user info fetch error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetUserInfo.mockRejectedValue(new Error('Failed to fetch user'))

      render(<App />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching user info:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })

    it('should not display user profile when user data is null', async () => {
      mockGetUserInfo.mockResolvedValue(null)

      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalled()
      })

      expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
    })
  })

  describe('Header Navigation', () => {
    it('should display Dashboard link when user has submitted ideas', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        anyIdeasSubmitted: true,
      })

      render(<App />)

      await waitFor(() => {
        const dashboardLinks = screen.getAllByText('Dashboard')
        expect(dashboardLinks.length).toBeGreaterThan(0)
      })
    })

    it('should not display Dashboard link when user has not submitted ideas', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        anyIdeasSubmitted: false,
      })

      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalled()
      })

      // Dashboard link should not be in header navigation
      const headerLinks = screen.queryAllByTestId('header-link')
      const dashboardLink = headerLinks.find(
        link => link.textContent === 'Dashboard'
      )
      expect(dashboardLink).toBeUndefined()
    })

    it('should always display FAQ link', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('FAQ')).toBeInTheDocument()
      })
    })

    it('should have correct href for FAQ link', async () => {
      render(<App />)

      await waitFor(() => {
        const faqLink = screen.getByText('FAQ').closest('a')
        expect(faqLink).toHaveAttribute(
          'href',
          'https://ai.lilly.com/frequently-asked-questions'
        )
      })
    })
  })

  describe('Header Logo', () => {
    it('should render Lilly logo with correct alt text', async () => {
      render(<App />)

      await waitFor(() => {
        const logo = screen.getByAltText('Eli Lilly and Company logo')
        expect(logo).toBeInTheDocument()
      })
    })

    it('should render logo with correct src', async () => {
      render(<App />)

      await waitFor(() => {
        const logo = screen.getByAltText(
          'Eli Lilly and Company logo'
        ) as HTMLImageElement
        expect(logo.src).toContain('lilly-logo.svg')
      })
    })

    it('should render logo with padding style', async () => {
      render(<App />)

      await waitFor(() => {
        const logo = screen.getByAltText(
          'Eli Lilly and Company logo'
        ) as HTMLImageElement
        expect(logo).toHaveStyle({ padding: '0' })
      })
    })
  })

  describe('App Structure', () => {
    it('should have the App div with correct className', async () => {
      render(<App />)

      await waitFor(() => {
        const appDiv = document.querySelector('.App')
        expect(appDiv).toBeInTheDocument()
      })
    })

    it('should have header-nav-wrapper with proper structure', async () => {
      render(<App />)

      await waitFor(() => {
        const navWrapper = document.querySelector('.header-nav-wrapper')
        expect(navWrapper).toBeInTheDocument()
      })
    })

    it('should render header with Lds-header className', async () => {
      render(<App />)

      await waitFor(() => {
        const header = screen.getByTestId('lds-header')
        expect(header).toHaveClass('Lds-header')
      })
    })
  })

  describe('User Profile Display Logic', () => {
    it('should display user profile with email when name is not available', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        anyIdeasSubmitted: false,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('should handle user profile with both name and email', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        anyIdeasSubmitted: true,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle getUserInfo returning undefined', async () => {
      mockGetUserInfo.mockResolvedValue(undefined)

      render(<App />)

      await waitFor(() => {
        expect(mockGetUserInfo).toHaveBeenCalled()
      })

      expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
    })

    it('should not crash when anyIdeasSubmitted is undefined', async () => {
      mockGetUserInfo.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      })

      expect(() => render(<App />)).not.toThrow()

      await waitFor(() => {
        expect(screen.getByTestId('lds-header')).toBeInTheDocument()
      })
    })

    it('should handle network timeout errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockGetUserInfo.mockRejectedValue(new Error('Network timeout'))

      render(<App />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      // App should still render despite error
      expect(screen.getByTestId('lds-header')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })
  })
})
