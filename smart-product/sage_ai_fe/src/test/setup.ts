import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect, vi } from 'vitest'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Provide a minimal jest compatibility layer for legacy tests still calling jest.*
// (We prefer updating tests to use vi.*, but this prevents ReferenceErrors during migration.)
if (!(globalThis as any).jest) {
  ;(globalThis as any).jest = {
    fn: vi.fn,
    spyOn: vi.spyOn,
    mock: vi.mock,
    clearAllMocks: vi.clearAllMocks,
    resetAllMocks: vi.resetAllMocks,
    restoreAllMocks: vi.restoreAllMocks,
  }
}

// Polyfill window.matchMedia for libraries (e.g., design system) that rely on it.
if (!(window as any).matchMedia) {
  ;(window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {}, // deprecated API
    removeListener() {}, // deprecated API
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  })
}

// Polyfill ResizeObserver (simple no-op implementation sufficient for tests)
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(globalThis as any).ResizeObserver = ResizeObserver
}

// Silence not implemented scrollTo warnings
if (!window.scrollTo) {
  // Assign a no-op scrollTo to suppress jsdom warnings during tests
  ;(window as any).scrollTo = () => {}
}

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.clearAllMocks()
})
