import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { serviceNowApi } from '@/core/api/service-now.api'

import LandingPage from '../LandingPage'

// Mock the service-now API
vi.mock('@/core/api/service-now.api', () => ({
  serviceNowApi: {
    getApprovedIdeasDashboard: vi.fn(),
  },
}))

// Mock the LoadingSpinner component
vi.mock('@/components/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: { message: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}))

// Mock the LandingPageCard component
vi.mock('@/components/LandingPageCard/LandingPageCard', () => ({
  default: ({
    title,
    description,
    descriptionEmphasis,
    children,
  }: {
    title: string
    description?: string
    descriptionEmphasis?: string
    children?: React.ReactNode
  }) => (
    <div data-testid="landing-page-card">
      <h3>{title}</h3>
      {descriptionEmphasis && <span>{descriptionEmphasis}</span>}
      {description && <p>{description}</p>}
      {children}
    </div>
  ),
}))

// Mock the assets
vi.mock('../../../src/assets/ai_assist.svg', () => ({
  default: 'ai-assist-icon.svg',
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LandingPage', () => {
  const mockApiResponse = {
    approved_count: 5,
    days: 30,
    message: 'Success',
    top_ideas: [
      {
        ai_system_name: 'AI System 1',
        problem_statement: 'This is a problem statement for system 1',
        submitted_by: {
          user_name: 'John Doe (12345)',
          user_id: '12345',
        },
      },
      {
        ai_system_name: 'AI System 2',
        problem_statement: 'This is a problem statement for system 2',
        submitted_by: {
          user_name: 'Jane Smith (67890)',
          user_id: '67890',
        },
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )
  }

  describe('Loading State', () => {
    it('should display loading spinner while fetching data', () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderComponent()

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading form data....')).toBeInTheDocument()
    })

    it('should hide loading spinner after data is fetched', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })
  })

  describe('Initial Render', () => {
    beforeEach(async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )
      renderComponent()
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should render the page wrapper and main content', () => {
      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should render the intro section with all elements', () => {
      // Badge
      expect(screen.getByAltText('AI Assist Icon')).toBeInTheDocument()
      expect(screen.getByText('AI-Powered Innovation')).toBeInTheDocument()

      // Titles
      expect(screen.getByText('SAGE.AI')).toBeInTheDocument()
      expect(screen.getByText('Smart AI Governance Engine')).toBeInTheDocument()

      // Description
      expect(
        screen.getByText(
          'Seamless submissions within one intelligent platform.'
        )
      ).toBeInTheDocument()
    })

    it('should render the Start Submission button in intro section', () => {
      const buttons = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })
      expect(buttons.length).toBeGreaterThan(0)
      expect(buttons[0]).toBeInTheDocument()
    })

    it('should render all landing page cards', () => {
      const cards = screen.getAllByTestId('landing-page-card')
      expect(cards).toHaveLength(2)
    })

    it('should render the video card with correct content', () => {
      expect(screen.getByText('Explore SAGE.AI in Action​')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Watch a short video to learn more about how SAGE.AI works for you.​'
        )
      ).toBeInTheDocument()

      const video = screen.getByLabelText('Introductory Sage.AI Video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute(
        'src',
        'https://www.w3schools.com/html/mov_bbb.mp4'
      )
    })

    it('should render the submission card with correct content', () => {
      expect(screen.getByText("Discover What's Next​")).toBeInTheDocument()
      expect(
        screen.getByText(/Form submissions are tedious and time consuming/i)
      ).toBeInTheDocument()

      // Check for list items
      expect(
        screen.getByText('Complete a brief questionnaire')
      ).toBeInTheDocument()
      expect(screen.getByText('Upload your documents')).toBeInTheDocument()
      expect(screen.getByText('Get feedback')).toBeInTheDocument()
    })

    it('should render the bottom decorator', () => {
      const decorator = document.querySelector('[aria-hidden="true"]')
      expect(decorator).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    beforeEach(async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )
      renderComponent()
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should navigate to /begin when clicking intro Start Submission button', async () => {
      const user = userEvent.setup()
      const buttons = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })

      await user.click(buttons[0])

      expect(mockNavigate).toHaveBeenCalledWith('/begin')
    })

    it('should navigate to /begin when clicking card Start your Submission button', async () => {
      const user = userEvent.setup()
      // Get all buttons with aria-label Start New Submission
      const buttons = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })

      // Click the second button (in the card)
      await user.click(buttons[1])

      expect(mockNavigate).toHaveBeenCalledWith('/begin')
    })
  })

  describe('API Data Fetching', () => {
    it('should call getApprovedIdeasDashboard on mount', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )

      renderComponent()

      await waitFor(() => {
        expect(serviceNowApi.getApprovedIdeasDashboard).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle successful API response with valid data', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should handle API response with zero approved count', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue({
        approved_count: 0,
        days: 30,
        message: 'Success',
        top_ideas: [],
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should handle API response with missing top_ideas', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue({
        approved_count: 5,
        days: 30,
        message: 'Success',
        top_ideas: undefined as any,
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should handle API response with non-array top_ideas', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue({
        approved_count: 5,
        days: 30,
        message: 'Success',
        top_ideas: null as any,
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should handle API response with negative approved count', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue({
        approved_count: -1,
        days: 30,
        message: 'Success',
        top_ideas: [],
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Component should still render even with invalid data
      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should handle API response with missing approved_count', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue({
        approved_count: undefined as any,
        days: 30,
        message: 'Success',
        top_ideas: [],
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should handle API error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockRejectedValue(
        new Error('API Error')
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching latest ideas:',
        expect.any(Error)
      )

      // Page should still render after error
      expect(screen.getByTestId('landing-page')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it('should handle null API response', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        null as any
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should handle empty object API response', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        {} as any
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    beforeEach(async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )
      renderComponent()
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should have proper aria-label for intro section', () => {
      const introSection = screen.getByText('SAGE.AI').closest('section')
      expect(introSection).toHaveAttribute('aria-label', 'Sage.AI Intro')
    })

    it('should have aria-hidden on decorative element', () => {
      const decorator = document.querySelector('[aria-hidden="true"]')
      expect(decorator).toBeInTheDocument()
    })

    it('should have proper aria-labels for buttons', () => {
      const introButton = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })
      expect(introButton.length).toBeGreaterThan(0)
    })

    it('should have proper alt text for AI icon', () => {
      const icon = screen.getByAltText('AI Assist Icon')
      expect(icon).toBeInTheDocument()
    })

    it('should have proper aria-label for video', () => {
      const video = screen.getByLabelText('Introductory Sage.AI Video')
      expect(video).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    beforeEach(async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )
      renderComponent()
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should render heading hierarchy correctly', () => {
      // h1 for main title
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'SAGE.AI'
      )

      // h2 for subtitle
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Smart AI Governance Engine'
      )
    })

    it('should render video with controls attribute', () => {
      const video = screen.getByLabelText('Introductory Sage.AI Video')
      expect(video).toHaveAttribute('controls')
    })

    it('should render all navigation buttons', () => {
      const buttons = screen.getAllByRole('button')
      // Should have at least 2 buttons (intro and card)
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should render the page with proper test id', () => {
      const landingPage = screen.getByTestId('landing-page')
      expect(landingPage.tagName).toBe('MAIN')
    })
  })

  describe('Edge Cases', () => {
    it('should handle component unmounting during API call', async () => {
      let resolveFn: (value: any) => void
      const promise = new Promise(resolve => {
        resolveFn = resolve
      })

      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockReturnValue(
        promise as any
      )

      const { unmount } = renderComponent()

      // Unmount before API resolves
      unmount()

      // Resolve after unmount
      resolveFn!(mockApiResponse)

      // Should not cause errors
      await waitFor(() => {
        expect(serviceNowApi.getApprovedIdeasDashboard).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle rapid navigation clicks', async () => {
      const user = userEvent.setup()
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      const buttons = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })

      // Click multiple times rapidly
      await user.click(buttons[0])
      await user.click(buttons[0])
      await user.click(buttons[0])

      expect(mockNavigate).toHaveBeenCalledWith('/begin')
      expect(mockNavigate).toHaveBeenCalledTimes(3)
    })

    it('should render with empty top_ideas array', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue({
        approved_count: 0,
        days: 30,
        message: 'Success',
        top_ideas: [],
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })
  })

  describe('Video Element', () => {
    beforeEach(async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )
      renderComponent()
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should render video element with correct source', () => {
      const video = screen.getByLabelText(
        'Introductory Sage.AI Video'
      ) as HTMLVideoElement
      expect(video.src).toBe('https://www.w3schools.com/html/mov_bbb.mp4')
    })

    it('should render video with controls', () => {
      const video = screen.getByLabelText('Introductory Sage.AI Video')
      expect(video).toHaveAttribute('controls')
    })
  })

  describe('State Management', () => {
    it('should initialize with loading state', () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockImplementation(
        () => new Promise(() => {})
      )

      renderComponent()

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should update state after successful API call', async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    })

    it('should update state after failed API call', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockRejectedValue(
        new Error('Failed')
      )

      renderComponent()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('CSS Classes and Styling', () => {
    beforeEach(async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )
      renderComponent()
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should apply correct CSS classes to buttons', () => {
      const buttons = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })
      // First button should have filled class
      expect(buttons[0].className).toContain('filled')
    })

    it('should apply secondary button class to card button', () => {
      const buttons = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })
      // Second button should have secondaryButton class
      expect(buttons[1].className).toContain('secondaryButton')
    })

    it('should render all required list items in the submission card', () => {
      expect(screen.getByText('Your big idea starts here:')).toBeInTheDocument()
      expect(
        screen.getByText('Complete a brief questionnaire')
      ).toBeInTheDocument()
      expect(screen.getByText('Upload your documents')).toBeInTheDocument()
      expect(screen.getByText('Get feedback')).toBeInTheDocument()
    })
  })

  describe('Button Icon Positions', () => {
    beforeEach(async () => {
      vi.mocked(serviceNowApi.getApprovedIdeasDashboard).mockResolvedValue(
        mockApiResponse
      )
      renderComponent()
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should render intro button with icon position after', () => {
      const buttons = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })
      expect(buttons[0]).toBeInTheDocument()
    })

    it('should render both Start New Submission buttons', () => {
      const buttons = screen.getAllByRole('button', {
        name: /Start New Submission/i,
      })
      expect(buttons).toHaveLength(2)
    })
  })
})
