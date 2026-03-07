import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AiPanelButtonActionId } from '@/core/constants'

import AICardButtons from '../AICardButtons'

describe('AICardButtons', () => {
  it('renders buttons for current page and triggers handlers on click', () => {
    const pageButtonIds = {
      1: [
        { action: AiPanelButtonActionId.cancel, type: 'outlined' },
        {
          action: AiPanelButtonActionId.proceedWithoutSelection,
          type: 'outlined',
        },
        { action: AiPanelButtonActionId.next },
      ],
    }

    const handlers = {
      [AiPanelButtonActionId.cancel]: vi.fn(),
      [AiPanelButtonActionId.prev]: vi.fn(),
      [AiPanelButtonActionId.next]: vi.fn(),
      [AiPanelButtonActionId.proceedWithoutSelection]: vi.fn(),
      [AiPanelButtonActionId.useAnswer]: vi.fn(),
    }

    const setActivePageIndex = vi.fn()

    render(
      <AICardButtons
        pageButtonIds={pageButtonIds}
        activePageIndex={1}
        setActivePageIndex={setActivePageIndex}
        actionHandlerMap={handlers}
      />
    )

    // Expect three buttons
    const btns = screen.getAllByTestId(/ai-card-btn-/)
    expect(btns.length).toBe(3)

    // Click them and ensure handlers are invoked
    fireEvent.click(btns[0])
    expect(handlers.cancel).toHaveBeenCalled()

    fireEvent.click(btns[1])
    expect(handlers.proceedWithoutSelection).toHaveBeenCalled()

    fireEvent.click(btns[2])
    expect(handlers.next).toHaveBeenCalled()
  })
})
