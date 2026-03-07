import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExtractionStatus } from '../../core/models/extraction-status.model'
import ExtractionStatusBanner from './ExtractionStatusBanner'

// Mock the ExtractionStatusContext
const mockDismissBanner = vi.fn()
const mockUseExtractionStatus = vi.fn()

vi.mock('../../contexts/ExtractionStatusContext', () => ({
  useExtractionStatus: () => mockUseExtractionStatus(),
}))

describe('ExtractionStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isDismissed is true', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '',
      progress: 50,
      dismissBanner: mockDismissBanner,
      isDismissed: true,
    })

    const { container } = render(<ExtractionStatusBanner />)

    expect(container.firstChild).toBeNull()
  })

  it('should not render when extractionStatus is null', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: null,
      extractionMessage: '',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    const { container } = render(<ExtractionStatusBanner />)

    expect(container.firstChild).toBeNull()
  })

  it('should render banner with processing status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '',
      progress: 50,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.getByText(/Data extraction is running in the background/)
    ).toBeInTheDocument()
  })

  it('should render banner with pending status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Pending,
      extractionMessage: '',
      progress: 30,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.getByText(/Data extraction is running in the background/)
    ).toBeInTheDocument()
  })

  it('should render banner with completed status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Completed,
      extractionMessage: '',
      progress: 100,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/Data extraction is complete/)).toBeInTheDocument()
  })

  it('should render banner with failed status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Failed,
      extractionMessage: '',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/Failed to extract data!/)).toBeInTheDocument()
    expect(
      screen.getByText(/Please reupload the documents/)
    ).toBeInTheDocument()
  })

  it('should apply pink banner class for processing status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '',
      progress: 50,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const banner = screen.getByRole('status')
    expect(banner.className).toContain('bannerPink')
  })

  it('should apply pink banner class for pending status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Pending,
      extractionMessage: '',
      progress: 30,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const banner = screen.getByRole('status')
    expect(banner.className).toContain('bannerPink')
  })

  it('should apply pink banner class for failed status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Failed,
      extractionMessage: '',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const banner = screen.getByRole('status')
    expect(banner.className).toContain('bannerPink')
  })

  it('should apply green banner class for completed status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Completed,
      extractionMessage: '',
      progress: 100,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const banner = screen.getByRole('status')
    expect(banner.className).toContain('bannerGreen')
  })

  it('should render Hide button', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '',
      progress: 50,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const hideButton = screen.getByRole('button', {
      name: /hide notification/i,
    })
    expect(hideButton).toBeInTheDocument()
    expect(hideButton).toHaveTextContent('Hide')
  })

  it('should call dismissBanner when Hide button is clicked', async () => {
    const user = userEvent.setup()
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '',
      progress: 50,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const hideButton = screen.getByRole('button', {
      name: /hide notification/i,
    })
    await user.click(hideButton)

    expect(mockDismissBanner).toHaveBeenCalledTimes(1)
  })

  it('should have aria attributes for accessibility', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '',
      progress: 50,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const banner = screen.getByRole('status')
    expect(banner).toHaveAttribute('aria-live', 'polite')
    expect(banner).toHaveAttribute('aria-atomic', 'true')
  })

  // Custom message tests - Completed status
  it('should display custom message for completed status with "No documents provided"', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Completed,
      extractionMessage: 'No documents provided for extraction',
      progress: 100,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(
      screen.getByText('No documents provided for extraction')
    ).toBeInTheDocument()
  })

  it('should display formatted completed message when custom message exists', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Completed,
      extractionMessage: 'Documents extracted successfully',
      progress: 100,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByText(/Data extraction is complete/)).toBeInTheDocument()
    expect(
      screen.getByText(/you can access the AI feature in all the forms/)
    ).toBeInTheDocument()
  })

  // Custom message tests - Failed status
  it('should display custom message for failed status with "Cortex"', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Failed,
      extractionMessage: 'Cortex service is unavailable',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(
      screen.getByText('Cortex service is unavailable')
    ).toBeInTheDocument()
  })

  it('should display server error message for failed status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Failed,
      extractionMessage: 'Server temporarily unavailable',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(
      screen.getByText('Cortex is not responding. Please try again later.')
    ).toBeInTheDocument()
  })

  it('should display formatted failed message for actual extraction failure', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Failed,
      extractionMessage: 'Extraction process encountered errors',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByText(/Extraction failed:/)).toBeInTheDocument()
    expect(
      screen.getByText(/Extraction process encountered errors/)
    ).toBeInTheDocument()
  })

  // Custom message tests - Processing/Pending status
  it('should display formatted processing message when custom message exists', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '5/14 Processing documents',
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByText(/5\/14 Processing documents/)).toBeInTheDocument()
    expect(
      screen.getByText(
        /but you're free to continue submitting your form with initial AI suggestions./
      )
    ).toBeInTheDocument()
  })

  it('should display formatted pending message when custom message exists', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Pending,
      extractionMessage: '0/14 Preparing extraction',
      progress: 20,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByText(/0\/14 Preparing extraction/)).toBeInTheDocument()
    expect(
      screen.getByText(
        /but you're free to continue submitting your form with initial AI suggestions./
      )
    ).toBeInTheDocument()
  })

  // Fallback message tests (no custom message)
  it('should display fallback message for failed status without custom message', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Failed,
      extractionMessage: '',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByText(/Failed to extract data!/)).toBeInTheDocument()
    expect(
      screen.getByText(/Please reupload the documents/)
    ).toBeInTheDocument()
  })

  it('should display fallback message for processing status without custom message', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '',
      progress: 50,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(
      screen.getByText(/Data extraction is running in the background/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /Meanwhile you can continue form filling using basic AI Suggestions/
      )
    ).toBeInTheDocument()
  })

  it('should display fallback message for pending status without custom message', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Pending,
      extractionMessage: '',
      progress: 30,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(
      screen.getByText(/Data extraction is running in the background/)
    ).toBeInTheDocument()
  })

  it('should display fallback message for completed status without custom message', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Completed,
      extractionMessage: '',
      progress: 100,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByText(/Data extraction is complete/)).toBeInTheDocument()
    expect(
      screen.getByText(/you can access the AI feature in all the forms/)
    ).toBeInTheDocument()
  })

  it('should display default "Processing..." for unknown status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: 'unknown' as any,
      extractionMessage: '',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(
      screen.getByText(
        "Document extraction is still in progress and is taking longer than usual. We'll notify you once it's complete."
      )
    ).toBeInTheDocument()
  })

  it('should apply no additional class for unknown status', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: 'unknown' as any,
      extractionMessage: '',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const banner = screen.getByRole('status')
    expect(banner.className).not.toContain('bannerPink')
    expect(banner.className).not.toContain('bannerGreen')
  })

  it('should render strong tag in completed message', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Completed,
      extractionMessage: '',
      progress: 100,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const strongElement = screen.getByText('Data extraction is complete')
    expect(strongElement.tagName).toBe('STRONG')
  })

  it('should render strong tag in failed message', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Failed,
      extractionMessage: '',
      progress: 0,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const strongElement = screen.getByText('Failed to extract data!')
    expect(strongElement.tagName).toBe('STRONG')
  })

  it('should render strong tag in processing message with custom message', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: '5/14 Processing documents',
      progress: 60,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    const strongElement = screen.getByText('5/14 Processing documents')
    expect(strongElement.tagName).toBe('STRONG')
  })

  it('should handle null extractionMessage', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Processing,
      extractionMessage: null as any,
      progress: 50,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(
      screen.getByText(/Data extraction is running in the background/)
    ).toBeInTheDocument()
  })

  it('should handle undefined extractionMessage', () => {
    mockUseExtractionStatus.mockReturnValue({
      extractionStatus: ExtractionStatus.Completed,
      extractionMessage: undefined as any,
      progress: 100,
      dismissBanner: mockDismissBanner,
      isDismissed: false,
    })

    render(<ExtractionStatusBanner />)

    expect(screen.getByText(/Data extraction is complete/)).toBeInTheDocument()
  })

  // Progress bar tests
  // describe('Progress Bar', () => {
  //   it('should render progress bar with correct width for processing status', () => {
  //     mockUseExtractionStatus.mockReturnValue({
  //       extractionStatus: ExtractionStatus.Processing,
  //       extractionMessage: '',
  //       progress: 45,
  //       dismissBanner: mockDismissBanner,
  //       isDismissed: false,
  //     })

  //     render(<ExtractionStatusBanner />)

  //     const progressBar = screen.getByRole('progressbar')
  //     expect(progressBar).toBeInTheDocument()
  //     expect(progressBar).toHaveStyle({ width: '45%' })
  //     expect(progressBar).toHaveAttribute('aria-valuenow', '45')
  //     expect(progressBar).toHaveAttribute('aria-valuemin', '0')
  //     expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  //   })

  //   it('should render progress bar with 100% width for completed status', () => {
  //     mockUseExtractionStatus.mockReturnValue({
  //       extractionStatus: ExtractionStatus.Completed,
  //       extractionMessage: '',
  //       progress: 100,
  //       dismissBanner: mockDismissBanner,
  //       isDismissed: false,
  //     })

  //     render(<ExtractionStatusBanner />)

  //     const progressBar = screen.getByRole('progressbar')
  //     expect(progressBar).toHaveStyle({ width: '100%' })
  //     expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  //   })

  //   it('should render progress bar with 0% width for failed status', () => {
  //     mockUseExtractionStatus.mockReturnValue({
  //       extractionStatus: ExtractionStatus.Failed,
  //       extractionMessage: '',
  //       progress: 0,
  //       dismissBanner: mockDismissBanner,
  //       isDismissed: false,
  //     })

  //     render(<ExtractionStatusBanner />)

  //     const progressBar = screen.getByRole('progressbar')
  //     expect(progressBar).toHaveStyle({ width: '0%' })
  //     expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  //   })

  //   it('should update progress bar width when progress changes', () => {
  //     mockUseExtractionStatus.mockReturnValue({
  //       extractionStatus: ExtractionStatus.Processing,
  //       extractionMessage: '',
  //       progress: 25,
  //       dismissBanner: mockDismissBanner,
  //       isDismissed: false,
  //     })

  //     const { rerender } = render(<ExtractionStatusBanner />)

  //     let progressBar = screen.getByRole('progressbar')
  //     expect(progressBar).toHaveStyle({ width: '25%' })

  //     mockUseExtractionStatus.mockReturnValue({
  //       extractionStatus: ExtractionStatus.Processing,
  //       extractionMessage: '',
  //       progress: 75,
  //       dismissBanner: mockDismissBanner,
  //       isDismissed: false,
  //     })

  //     rerender(<ExtractionStatusBanner />)

  //     progressBar = screen.getByRole('progressbar')
  //     expect(progressBar).toHaveStyle({ width: '75%' })
  //   })

  //   it('should have accessible label for progress bar', () => {
  //     mockUseExtractionStatus.mockReturnValue({
  //       extractionStatus: ExtractionStatus.Processing,
  //       extractionMessage: '',
  //       progress: 50,
  //       dismissBanner: mockDismissBanner,
  //       isDismissed: false,
  //     })

  //     render(<ExtractionStatusBanner />)

  //     const progressBar = screen.getByRole('progressbar')
  //     expect(progressBar).toHaveAttribute(
  //       'aria-label',
  //       'Extraction progress: 50%'
  //     )
  //   })
  // })
})
