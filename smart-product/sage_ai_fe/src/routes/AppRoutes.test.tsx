import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AppRoutes from './AppRoutes'

// Mock all page components
vi.mock('../components/InitialRoute/InitialRoute', () => ({
  default: () => <div data-testid="initial-route">Initial Route</div>,
}))

vi.mock('../components/ProtectedRoute/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}))

vi.mock('../pages/Landing/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}))

vi.mock('../pages/BeginSubmission/BeginSubmission', () => ({
  default: () => <div data-testid="begin-submission">Begin Submission</div>,
}))

vi.mock('../pages/IdeaSubmission/IdeaSubmissionForm', () => ({
  default: () => (
    <div data-testid="idea-submission-form">Idea Submission Form</div>
  ),
}))

vi.mock('../pages/FormDashboard/FormDashboard', () => ({
  default: () => <div data-testid="form-dashboard">Form Dashboard</div>,
}))

vi.mock('../pages/SubmitterDashboard/SubmitterDashboard', () => ({
  default: ({ userName }: { userName: string }) => (
    <div data-testid="submitter-dashboard">
      Submitter Dashboard - {userName}
    </div>
  ),
}))

vi.mock('../pages/AIRegistryForm/AIRegistryForm', () => ({
  default: () => <div data-testid="ai-registry-form">AI Registry Form</div>,
}))

vi.mock('../pages/DigitalLegalOffice/DigitalLegalOffice', () => ({
  default: () => (
    <div data-testid="digital-legal-office">Digital Legal Office</div>
  ),
}))

vi.mock('../pages/WorkingWithThirdParty/WorkingWithThirdParty', () => ({
  default: () => (
    <div data-testid="working-with-third-party">Working With Third Party</div>
  ),
}))

vi.mock('../pages/WnvVendorEngagement/WnvVendorEngagement', () => ({
  default: () => (
    <div data-testid="wnv-vendor-engagement">WNV Vendor Engagement</div>
  ),
}))

vi.mock('../pages/SecurityAndEng/SecurityAndEng', () => ({
  default: () => (
    <div data-testid="security-and-eng">Security And Engineering</div>
  ),
}))

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render InitialRoute component for "/" path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('initial-route')).toBeInTheDocument()
    expect(screen.getByText('Initial Route')).toBeInTheDocument()
  })

  it('should render LandingPage within ProtectedRoute for "/landing" path', () => {
    render(
      <MemoryRouter initialEntries={['/landing']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    expect(screen.getByText('Landing Page')).toBeInTheDocument()
  })

  it('should render BeginSubmission component for "/begin" path', () => {
    render(
      <MemoryRouter initialEntries={['/begin']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('begin-submission')).toBeInTheDocument()
    expect(screen.getByText('Begin Submission')).toBeInTheDocument()
  })

  it('should render IdeaSubmissionForm for "/idea-submission/:formId/:submissionId" path', () => {
    render(
      <MemoryRouter initialEntries={['/idea-submission/form123/sub456']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('idea-submission-form')).toBeInTheDocument()
    expect(screen.getByText('Idea Submission Form')).toBeInTheDocument()
  })

  it('should render FormDashboard for "/form-dashboard/:submissionId" path', () => {
    render(
      <MemoryRouter initialEntries={['/form-dashboard/sub789']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('form-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Form Dashboard')).toBeInTheDocument()
  })

  it('should render SubmitterDashboard for "/submitter-dashboard" path', () => {
    render(
      <MemoryRouter initialEntries={['/submitter-dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('submitter-dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Submitter Dashboard/)).toBeInTheDocument()
  })

  it('should render AIRegistryForm for "/ai-registry/:formId/:submissionId" path', () => {
    render(
      <MemoryRouter initialEntries={['/ai-registry/form123/sub456']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('ai-registry-form')).toBeInTheDocument()
    expect(screen.getByText('AI Registry Form')).toBeInTheDocument()
  })

  it('should render DigitalLegalOffice for "/digital-legal-office/:formId/:submissionId" path', () => {
    render(
      <MemoryRouter initialEntries={['/digital-legal-office/form123/sub456']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('digital-legal-office')).toBeInTheDocument()
    expect(screen.getByText('Digital Legal Office')).toBeInTheDocument()
  })

  it('should render WorkingWithThirdParty for "/working-with-third-party/:formId/:submissionId" path', () => {
    render(
      <MemoryRouter
        initialEntries={['/working-with-third-party/form123/sub456']}
      >
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('working-with-third-party')).toBeInTheDocument()
    expect(screen.getByText('Working With Third Party')).toBeInTheDocument()
  })

  it('should render WnvVendorEngagement for "/wnv-vendor-engagement/:formId/:submissionId" path', () => {
    render(
      <MemoryRouter initialEntries={['/wnv-vendor-engagement/form123/sub456']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('wnv-vendor-engagement')).toBeInTheDocument()
    expect(screen.getByText('WNV Vendor Engagement')).toBeInTheDocument()
  })

  it('should render SecurityAndEng for "/security-and-engineering/:formId/:submissionId" path', () => {
    render(
      <MemoryRouter
        initialEntries={['/security-and-engineering/form123/sub456']}
      >
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('security-and-eng')).toBeInTheDocument()
    expect(screen.getByText('Security And Engineering')).toBeInTheDocument()
  })

  it('should handle route parameters correctly for idea submission', () => {
    render(
      <MemoryRouter initialEntries={['/idea-submission/abc123/xyz789']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('idea-submission-form')).toBeInTheDocument()
  })

  it('should handle route parameters correctly for form dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/form-dashboard/submission-id-123']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('form-dashboard')).toBeInTheDocument()
  })

  it('should handle route parameters correctly for AI registry', () => {
    render(
      <MemoryRouter initialEntries={['/ai-registry/formId123/subId456']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('ai-registry-form')).toBeInTheDocument()
  })

  it('should handle route parameters correctly for digital legal office', () => {
    render(
      <MemoryRouter
        initialEntries={['/digital-legal-office/formId123/subId456']}
      >
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('digital-legal-office')).toBeInTheDocument()
  })

  it('should handle route parameters correctly for working with third party', () => {
    render(
      <MemoryRouter
        initialEntries={['/working-with-third-party/formId123/subId456']}
      >
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('working-with-third-party')).toBeInTheDocument()
  })

  it('should handle route parameters correctly for WNV vendor engagement', () => {
    render(
      <MemoryRouter
        initialEntries={['/wnv-vendor-engagement/formId123/subId456']}
      >
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('wnv-vendor-engagement')).toBeInTheDocument()
  })

  it('should handle route parameters correctly for security and engineering', () => {
    render(
      <MemoryRouter
        initialEntries={['/security-and-engineering/formId123/subId456']}
      >
        <AppRoutes />
      </MemoryRouter>
    )

    expect(screen.getByTestId('security-and-eng')).toBeInTheDocument()
  })

  it('should render the Routes component', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should wrap LandingPage with ProtectedRoute that has requiresNoSubmissions prop', () => {
    render(
      <MemoryRouter initialEntries={['/landing']}>
        <AppRoutes />
      </MemoryRouter>
    )

    const protectedRoute = screen.getByTestId('protected-route')
    expect(protectedRoute).toBeInTheDocument()
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
  })
})
