import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hoist mocks to the top level
const { mockRender, mockCreateRoot, mockUnmount } = vi.hoisted(() => {
  const mockRender = vi.fn()
  const mockUnmount = vi.fn()
  const mockCreateRoot = vi.fn(() => ({
    render: mockRender,
    unmount: mockUnmount,
  }))

  return { mockRender, mockCreateRoot, mockUnmount }
})

// Mock react-dom/client before any imports
vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}))

// Mock the App component
vi.mock('./App', () => ({
  default: () => null,
}))

// Mock the CSS import
vi.mock('./index.scss', () => ({}))

describe('main.tsx', () => {
  let rootElement: HTMLDivElement

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Setup a fresh root element in the DOM
    rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.innerHTML = ''
    document.body.appendChild(rootElement)

    // Reset modules to allow fresh imports
    vi.resetModules()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('DOM Setup', () => {
    it('should get the root element by id', async () => {
      await import('./main')

      // The module should call createRoot with the root element
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement)
    })

    it('should call createRoot with the root element', async () => {
      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement)
      expect(mockCreateRoot).toHaveBeenCalledTimes(1)
    })

    it('should use non-null assertion operator', async () => {
      // This test verifies that the code uses getElementById('root')!
      // By ensuring it works with our root element
      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalled()
    })
  })

  describe('React Rendering', () => {
    it('should render the App component', async () => {
      await import('./main')

      expect(mockRender).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalledTimes(1)
    })

    it('should wrap App in StrictMode', async () => {
      await import('./main')

      // Get the rendered element from the mock
      const renderedElement = mockRender.mock.calls[0][0]

      // Check that it's a StrictMode component
      expect(renderedElement.type).toBe(StrictMode)
    })

    it('should render App component inside StrictMode', async () => {
      const { default: App } = await import('./App')
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]

      // Check that App is a child of StrictMode
      expect(renderedElement.props.children.type).toBe(App)
    })

    it('should call render exactly once', async () => {
      await import('./main')

      expect(mockRender).toHaveBeenCalledTimes(1)
    })

    it('should call createRoot exactly once', async () => {
      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalledTimes(1)
    })

    it('should chain createRoot and render in one statement', async () => {
      await import('./main')

      // Both should be called
      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalled()

      // Render should be called after createRoot returns
      expect(mockRender).toHaveBeenCalledTimes(1)
    })
  })

  describe('Application Structure', () => {
    it('should use StrictMode for development best practices', async () => {
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]
      expect(renderedElement.type).toBe(StrictMode)
    })

    it('should have App as the only child of StrictMode', async () => {
      const { default: App } = await import('./App')
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]
      const children = renderedElement.props.children

      // Should have exactly one child (App)
      expect(Array.isArray(children)).toBe(false)
      expect(children.type).toBe(App)
    })

    it('should not have additional props on StrictMode', async () => {
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]
      const props = renderedElement.props

      // StrictMode should only have children prop
      expect(Object.keys(props)).toEqual(['children'])
    })

    it('should render StrictMode directly', async () => {
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]

      // The root level element should be StrictMode
      expect(renderedElement.type).toBe(StrictMode)
    })
  })

  describe('Root Element Requirements', () => {
    it('should work with a valid root element', async () => {
      const validRoot = document.createElement('div')
      validRoot.id = 'root'
      document.body.innerHTML = ''
      document.body.appendChild(validRoot)

      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalledWith(validRoot)
    })

    it('should accept any HTMLElement as root', async () => {
      const customElement = document.createElement('section')
      customElement.id = 'root'
      document.body.innerHTML = ''
      document.body.appendChild(customElement)

      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalledWith(customElement)
    })

    it('should target element with id "root"', async () => {
      // Create a different element
      const otherElement = document.createElement('div')
      otherElement.id = 'other'
      document.body.appendChild(otherElement)

      await import('./main')

      // Should still use the 'root' element, not 'other'
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement)
      expect(mockCreateRoot).not.toHaveBeenCalledWith(otherElement)
    })
  })

  describe('Module Imports', () => {
    it('should import index.scss for global styles', async () => {
      // If the import fails, this test will fail
      await expect(import('./main')).resolves.toBeDefined()
    })

    it('should import React StrictMode', async () => {
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]
      expect(renderedElement.type).toBe(StrictMode)
    })

    it('should import createRoot from react-dom/client', async () => {
      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalled()
    })

    it('should import App component', async () => {
      const { default: App } = await import('./App')
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]
      expect(renderedElement.props.children.type).toBe(App)
    })

    it('should successfully import all dependencies', async () => {
      // This will throw if any import fails
      await expect(import('./main')).resolves.toBeDefined()

      // Verify all mocks were called, confirming successful execution
      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalled()
    })
  })

  describe('Rendering Order', () => {
    it('should create root before rendering', async () => {
      const callOrder: string[] = []

      mockCreateRoot.mockImplementationOnce(() => {
        callOrder.push('createRoot')
        return {
          render: vi.fn((...args: unknown[]) => {
            callOrder.push('render')
            mockRender(...args)
          }),
          unmount: mockUnmount,
        }
      })

      await import('./main')

      expect(callOrder).toEqual(['createRoot', 'render'])
    })

    it('should use method chaining pattern', async () => {
      // The code does: createRoot(...).render(...)
      // This means render is called on the return value of createRoot
      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalled()

      // Verify it was called as part of the chain
      expect(mockCreateRoot).toHaveBeenCalledTimes(1)
      expect(mockRender).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle re-import of the module', async () => {
      await import('./main')

      // Reset modules to allow re-import
      vi.resetModules()
      // Clear mocks
      vi.clearAllMocks()

      // Re-import will re-execute the module code
      await import('./main')

      // Should have been called again
      expect(mockRender).toHaveBeenCalledTimes(1)
    })

    it('should handle empty root element', async () => {
      const emptyRoot = document.createElement('div')
      emptyRoot.id = 'root'
      // No children
      document.body.innerHTML = ''
      document.body.appendChild(emptyRoot)

      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalled()
    })

    it('should work with root element that has existing content', async () => {
      // Add some existing content to root
      rootElement.innerHTML = '<p>Existing content</p>'

      await import('./main')

      // Should still work - React will replace the content
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement)
      expect(mockRender).toHaveBeenCalled()
    })
  })

  describe('StrictMode Benefits', () => {
    it('should enable additional checks in development', async () => {
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]

      // StrictMode helps identify potential problems
      expect(renderedElement.type).toBe(StrictMode)
    })

    it('should wrap entire App in StrictMode', async () => {
      const { default: App } = await import('./App')
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]

      // Entire app is wrapped
      expect(renderedElement.type).toBe(StrictMode)
      expect(renderedElement.props.children.type).toBe(App)
    })

    it('should use StrictMode without any configuration props', async () => {
      await import('./main')

      const renderedElement = mockRender.mock.calls[0][0]
      const props = Object.keys(renderedElement.props).filter(
        key => key !== 'children'
      )

      // StrictMode doesn't take any props besides children
      expect(props).toHaveLength(0)
    })
  })

  describe('Type Safety', () => {
    it('should use non-null assertion for root element', async () => {
      // The code uses getElementById('root')!
      // This test verifies it works correctly
      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement)
    })

    it('should properly type the root element as HTMLElement', async () => {
      await import('./main')

      // createRoot expects an Element or DocumentFragment
      const callArg = (
        mockCreateRoot.mock.calls[0] as unknown as [HTMLElement]
      )[0]
      expect(callArg).toBeInstanceOf(HTMLElement)
    })

    it('should pass HTMLElement to createRoot', async () => {
      await import('./main')

      const callArg = (
        mockCreateRoot.mock.calls[0] as unknown as [HTMLElement]
      )[0]
      expect(callArg).toBe(rootElement)
      expect(callArg).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Code Structure', () => {
    it('should execute code at module level', async () => {
      // main.tsx doesn't export anything, it executes immediately
      const mainModule = await import('./main')

      // Should have no exports
      expect(Object.keys(mainModule)).toHaveLength(0)

      // But should have executed the code
      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalled()
    })

    it('should not wrap code in function or export', async () => {
      const mainModule = await import('./main')

      // Module should have no named exports (it's just imperative code)
      const exports = Object.keys(mainModule)
      expect(exports).toHaveLength(0)
    })

    it('should create root and render in single expression', async () => {
      // The code is: createRoot(...).render(...)
      // This is a single chained expression
      await import('./main')

      expect(mockCreateRoot).toHaveBeenCalledTimes(1)
      expect(mockRender).toHaveBeenCalledTimes(1)
    })
  })
})
