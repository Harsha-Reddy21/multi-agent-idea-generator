import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AIFeaturesProvider } from '../../contexts/AIFeaturesContext'
import { enhanceAnswerApi } from '../../core/api/enhance-answer.api'
import EnhanceAnswerCard, { renderRationaleList } from './EnhanceAnswerCard'

// Mock the API
vi.mock('../../core/api/enhance-answer.api', () => ({
  enhanceAnswerApi: {
    enhanceAnswer: vi.fn(),
  },
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AIFeaturesProvider>{children}</AIFeaturesProvider>
)

describe('EnhanceAnswerCard', () => {
  const defaultProps = {
    userInput: 'This is my original answer',
    questionId: 'q123',
    submissionId: 's456',
    isVisible: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render card when visible', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test-interaction-id',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    expect(screen.getByTestId('enhance-answer-card')).toBeInTheDocument()
  })

  it('should not render card content when not visible', () => {
    render(<EnhanceAnswerCard {...defaultProps} isVisible={false} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('enhance-answer-card')).toBeInTheDocument()
    expect(
      screen.queryByTestId('enhance-answer-loading')
    ).not.toBeInTheDocument()
  })

  it('should show loading state when API is called', async () => {
    // Create a promise that we can resolve manually
    let resolvePromise: (value: any) => void
    const apiPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockReturnValue(
      apiPromise as any
    )

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    // Wait for the component to mount and API to be called
    await waitFor(() => {
      expect(screen.getByTestId('enhance-answer-loading')).toBeInTheDocument()
    })

    expect(screen.getByTestId('enhance-answer-loading')).toBeInTheDocument()

    // Resolve the promise to finish the test
    await act(async () => {
      resolvePromise({ reviewed_text: 'Enhanced answer', interaction_id: 'test' })
    })
  })

  it('should have aria-busy when loading', async () => {
    // Create a promise that we can resolve manually
    let resolvePromise: (value: any) => void
    const apiPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockReturnValue(
      apiPromise as any
    )

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByTestId('enhance-answer-card')).toHaveAttribute(
        'aria-busy'
      )
    })

    // Resolve the promise to finish the test
    await act(async () => {
      resolvePromise({ reviewed_text: 'Enhanced answer', interaction_id: 'test' })
    })
  })

  it('should not have aria-busy when not loading', () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    render(<EnhanceAnswerCard {...defaultProps} isVisible={false} />, { wrapper: TestWrapper })

    expect(screen.getByTestId('enhance-answer-card')).not.toHaveAttribute(
      'aria-busy'
    )
  })

  it('should not call API on mount when not visible', () => {
    render(<EnhanceAnswerCard {...defaultProps} isVisible={false} />, { wrapper: TestWrapper })

    expect(enhanceAnswerApi.enhanceAnswer).not.toHaveBeenCalled()
  })

  it('should call API when visibility changes from false to true', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    const { rerender } = render(
      <EnhanceAnswerCard {...defaultProps} isVisible={false} />, { wrapper: TestWrapper }
    )

    expect(enhanceAnswerApi.enhanceAnswer).not.toHaveBeenCalled()

    await act(async () => {
      rerender(<EnhanceAnswerCard {...defaultProps} isVisible={true} />)
    })

    await waitFor(() => {
      expect(enhanceAnswerApi.enhanceAnswer).toHaveBeenCalledWith(
        'This is my original answer',
        'q123',
        's456'
      )
    })
  })

  it('should display enhanced answer on success', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'This is an enhanced version of the answer',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(
        screen.getByText('This is an enhanced version of the answer')
      ).toBeInTheDocument()
    })
  })

  it('should handle string response from API', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'String response from API',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(
        screen.getByText('String response from API')
      ).toBeInTheDocument()
    })
  })

  it('should handle non-string response from API', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: { some_field: 'This should be stringified' },
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByText(/some_field/)).toBeInTheDocument()
    })
  })

  it('should trim whitespace from enhanced answer', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: '   Whitespace around text   ',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByText('Whitespace around text')).toBeInTheDocument()
    })
  })

  it('should handle empty string response', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: '',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByTestId('enhance-answer-card')).toBeInTheDocument()
    })
    
    // When empty, it shows no content but card is still rendered
    expect(screen.queryByTestId('enhance-answer-content')).not.toBeInTheDocument()
  })

  it('should handle whitespace-only response', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: '   \n\t   ',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByTestId('enhance-answer-card')).toBeInTheDocument()
    })

    // When whitespace only, it shows no content but card is still rendered
    expect(screen.queryByTestId('enhance-answer-content')).not.toBeInTheDocument()
  })

  it('should display error message on API failure', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockRejectedValue(
      new Error('API Error')
    )

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(
        screen.getByText(/Cortex is not responding/)
      ).toBeInTheDocument()
    })
  })

  it('should call onUseThis when Use Answer button is clicked', async () => {
    const user = userEvent.setup()
    const onUseThis = vi.fn()
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(
        <EnhanceAnswerCard {...defaultProps} onUseThis={onUseThis} />, { wrapper: TestWrapper }
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Enhanced answer')).toBeInTheDocument()
    })

    const useButton = screen.getByRole('button', { name: /Use Answer/i })
    await act(async () => {
      await user.click(useButton)
    })

    expect(onUseThis).toHaveBeenCalledWith('Enhanced answer')
  })

  it('should show "Used Answer" button after clicking "Use Answer"', async () => {
    const user = userEvent.setup()
    const onUseThis = vi.fn()
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(
        <EnhanceAnswerCard {...defaultProps} onUseThis={onUseThis} />, { wrapper: TestWrapper }
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Enhanced answer')).toBeInTheDocument()
    })

    const useButton = screen.getByRole('button', { name: /Use Answer/i })
    await act(async () => {
      await user.click(useButton)
    })

    expect(screen.getByRole('button', { name: /Used Answer/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Use Answer/i })).not.toBeInTheDocument()
  })

  it('should call onKeepOriginal when Keep Original button is clicked', async () => {
    const user = userEvent.setup()
    const onKeepOriginal = vi.fn()
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(
        <EnhanceAnswerCard {...defaultProps} onKeepOriginal={onKeepOriginal} />, { wrapper: TestWrapper }
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Enhanced answer')).toBeInTheDocument()
    })

    const keepButton = screen.getByRole('button', { name: /Keep Original/i })
    await act(async () => {
      await user.click(keepButton)
    })

    expect(onKeepOriginal).toHaveBeenCalled()
  })

  it('should reset isUsed state when Keep Original is clicked', async () => {
    const user = userEvent.setup()
    const onUseThis = vi.fn()
    const onKeepOriginal = vi.fn()
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(
        <EnhanceAnswerCard
          {...defaultProps}
          onUseThis={onUseThis}
          onKeepOriginal={onKeepOriginal}
        />, { wrapper: TestWrapper }
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Enhanced answer')).toBeInTheDocument()
    })

    // Click Use Answer first
    const useButton = screen.getByRole('button', { name: /Use Answer/i })
    await act(async () => {
      await user.click(useButton)
    })

    expect(screen.getByRole('button', { name: /Used Answer/i })).toBeInTheDocument()

    // Click Keep Original
    const keepButton = screen.getByRole('button', { name: /Keep Original/i })
    await act(async () => {
      await user.click(keepButton)
    })

    // Use Answer button should be back to normal state
    expect(screen.getByRole('button', { name: /Use Answer/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Used Answer/i })).not.toBeInTheDocument()
  })

  it('should call API again when Regenerate button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(enhanceAnswerApi.enhanceAnswer)
      .mockResolvedValueOnce({
        reviewed_text: 'First enhanced answer',
        interaction_id: 'test1',
      } as any)
      .mockResolvedValueOnce({
        reviewed_text: 'Second enhanced answer',
        interaction_id: 'test2',
      } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByText('First enhanced answer')).toBeInTheDocument()
    })

    const regenerateButton = screen.getByRole('button', { name: /Regenerate/i })
    await act(async () => {
      await user.click(regenerateButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Second enhanced answer')).toBeInTheDocument()
    })

    expect(enhanceAnswerApi.enhanceAnswer).toHaveBeenCalledTimes(2)
  })

  it('should show loading state when regenerating', async () => {
    const user = userEvent.setup()
    // First call resolves immediately
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValueOnce({
      reviewed_text: 'First enhanced answer',
      interaction_id: 'test1',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByText('First enhanced answer')).toBeInTheDocument()
    })

    // Second call is slow
    let resolveSecondCall: (value: any) => void
    const secondApiCall = new Promise((resolve) => {
      resolveSecondCall = resolve
    })
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockReturnValueOnce(
      secondApiCall as any
    )

    const regenerateButton = screen.getByRole('button', { name: /Regenerate/i })
    await act(async () => {
      await user.click(regenerateButton)
    })

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByTestId('enhance-answer-loading')).toBeInTheDocument()
    })

    // Resolve the second call
    await act(async () => {
      resolveSecondCall!({ reviewed_text: 'Second enhanced answer', interaction_id: 'test2' })
    })

    await waitFor(() => {
      expect(screen.getByText('Second enhanced answer')).toBeInTheDocument()
    })
  })

  it('should reset state when card becomes hidden', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    const { rerender } = await act(async () => {
      return render(
        <EnhanceAnswerCard {...defaultProps} isVisible={true} />, { wrapper: TestWrapper }
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Enhanced answer')).toBeInTheDocument()
    })

    // Hide the card
    await act(async () => {
      rerender(<EnhanceAnswerCard {...defaultProps} isVisible={false} />)
    })

    // Show the card again
    await act(async () => {
      rerender(<EnhanceAnswerCard {...defaultProps} isVisible={true} />)
    })

    // Should call API again since state was reset
    expect(enhanceAnswerApi.enhanceAnswer).toHaveBeenCalledTimes(2)
  })

  it('should work without onUseThis callback', async () => {
    const user = userEvent.setup()
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByText('Enhanced answer')).toBeInTheDocument()
    })

    const useButton = screen.getByRole('button', { name: /Use Answer/i })
    await act(async () => {
      await user.click(useButton)
    })

    // Should not throw an error
    expect(screen.getByRole('button', { name: /Used Answer/i })).toBeInTheDocument()
  })

  it('should work without onKeepOriginal callback', async () => {
    const user = userEvent.setup()
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(screen.getByText('Enhanced answer')).toBeInTheDocument()
    })

    const keepButton = screen.getByRole('button', { name: /Keep Original/i })
    await act(async () => {
      await user.click(keepButton)
    })

    // Should not throw an error
    expect(screen.getByRole('button', { name: /Keep Original/i })).toBeInTheDocument()
  })

  it('should apply status class to card', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      // Check for CSS module class pattern instead of literal class name
      const card = screen.getByTestId('enhance-answer-card')
      expect(card.className).toMatch(/status_success/)
    })
  })

  it('should apply error status class on error', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockRejectedValue(
      new Error('API Error')
    )

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      // Check for CSS module class pattern instead of literal class name
      const card = screen.getByTestId('enhance-answer-card')
      expect(card.className).toMatch(/status_error/)
    })
  })

  it('should apply visible/hidden class based on isVisible prop', async () => {
    const { rerender } = await act(async () => {
      return render(
        <EnhanceAnswerCard {...defaultProps} isVisible={true} />, { wrapper: TestWrapper }
      )
    })

    let card = screen.getByTestId('enhance-answer-card')
    expect(card.className).toMatch(/cardVisible/)

    await act(async () => {
      rerender(<EnhanceAnswerCard {...defaultProps} isVisible={false} />)
    })

    card = screen.getByTestId('enhance-answer-card')
    expect(card.className).toMatch(/cardHidden/)
  })

  it('should capture original text at the time of API call', async () => {
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockResolvedValue({
      reviewed_text: 'Enhanced answer',
      interaction_id: 'test',
    } as any)

    const { rerender } = await act(async () => {
      return render(
        <EnhanceAnswerCard
          {...defaultProps}
          userInput="Original text"
          isVisible={true}
        />, { wrapper: TestWrapper }
      )
    })

    await waitFor(() => {
      expect(enhanceAnswerApi.enhanceAnswer).toHaveBeenCalledWith(
        'Original text',
        'q123',
        's456'
      )
    })

    // Change userInput prop
    await act(async () => {
      rerender(
        <EnhanceAnswerCard
          {...defaultProps}
          userInput="Modified text"
          isVisible={true}
        />
      )
    })

    // API should still have been called with original text
    expect(enhanceAnswerApi.enhanceAnswer).toHaveBeenCalledWith(
      'Original text',
      'q123',
      's456'
    )
  })

  it('should log error to console on API failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const apiError = new Error('API Error')
    vi.mocked(enhanceAnswerApi.enhanceAnswer).mockRejectedValue(apiError)

    await act(async () => {
      render(<EnhanceAnswerCard {...defaultProps} />, { wrapper: TestWrapper })
    })

    await waitFor(() => {
      expect(
        screen.getByText(/Cortex is not responding/)
      ).toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error during Enhance Answer:',
      apiError
    )

    consoleSpy.mockRestore()
  })

  it('should reset isUsed when regenerating', async () => {
    const user = userEvent.setup()
    const onUseThis = vi.fn()
    vi.mocked(enhanceAnswerApi.enhanceAnswer)
      .mockResolvedValueOnce({
        reviewed_text: 'First enhanced answer',
        interaction_id: 'test1',
      } as any)
      .mockResolvedValueOnce({
        reviewed_text: 'Second enhanced answer',
        interaction_id: 'test2',
      } as any)

    await act(async () => {
      render(
        <EnhanceAnswerCard {...defaultProps} onUseThis={onUseThis} />, { wrapper: TestWrapper }
      )
    })

    await waitFor(() => {
      expect(screen.getByText('First enhanced answer')).toBeInTheDocument()
    })

    // Click Use Answer
    const useButton = screen.getByRole('button', { name: /Use Answer/i })
    await act(async () => {
      await user.click(useButton)
    })

    expect(screen.getByRole('button', { name: /Used Answer/i })).toBeInTheDocument()

    // Click Regenerate
    const regenerateButton = screen.getByRole('button', { name: /Regenerate/i })
    await act(async () => {
      await user.click(regenerateButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Second enhanced answer')).toBeInTheDocument()
    })

    // Use Answer button should be back to normal state
    expect(screen.getByRole('button', { name: /Use Answer/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Used Answer/i })).not.toBeInTheDocument()
  })
})

describe('renderRationaleList helper', () => {
  it('strips prefixes and produces two list items', () => {
    const input = 'content_added: First rationale item; checklist_gaps_filled: Second rationale item'
    const result = renderRationaleList(input)

    expect(result).not.toBeNull()
    expect(result?.props.children).toHaveLength(2)
    expect(result?.props.children[0].props.children).toBe('First rationale item')
    expect(result?.props.children[1].props.children).toBe('Second rationale item')
  })

  it('pads missing second item', () => {
    const input = 'content_added: Only one item'
    const result = renderRationaleList(input)

    expect(result).not.toBeNull()
    expect(result?.props.children).toHaveLength(2)
    expect(result?.props.children[0].props.children).toBe('Only one item')
    expect(result?.props.children[1].props.children).toBe('')
  })

  it('returns null for empty input', () => {
    const result = renderRationaleList('')
    expect(result).toBeNull()
  })
})
