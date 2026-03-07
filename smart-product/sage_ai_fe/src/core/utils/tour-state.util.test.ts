import { beforeEach, describe, expect, it, vi } from 'vitest'

import { isTourCompleted, markTourCompleted, resetAllTours, type TourId } from './tour-state.util'

describe('tour-state.util', () => {
    // Mock localStorage
    const localStorageMock = (() => {
        let store: Record<string, string> = {}

        return {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => {
                store[key] = value
            },
            removeItem: (key: string) => {
                delete store[key]
            },
            clear: () => {
                store = {}
            },
        }
    })()

    beforeEach(() => {
        // Reset localStorage before each test
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        })
        localStorageMock.clear()
    })

    describe('isTourCompleted', () => {
        it('should return false for a tour that has not been completed', () => {
            expect(isTourCompleted('switch_info')).toBe(false)
        })

        it('should return true for a tour that has been completed', () => {
            markTourCompleted('switch_info')
            expect(isTourCompleted('switch_info')).toBe(true)
        })

        it('should return false for different tour IDs', () => {
            markTourCompleted('switch_info')
            expect(isTourCompleted('data_extracts')).toBe(false)
        })

        it('should handle localStorage errors gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            // Mock localStorage.getItem to throw an error
            const originalGetItem = localStorageMock.getItem
            localStorageMock.getItem = vi.fn(() => {
                throw new Error('localStorage error')
            })

            expect(isTourCompleted('switch_info')).toBe(false)
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error reading tour state:', expect.any(Error))

            // Restore
            localStorageMock.getItem = originalGetItem
            consoleErrorSpy.mockRestore()
        })
    })

    describe('markTourCompleted', () => {
        it('should mark a single tour as completed', () => {
            markTourCompleted('switch_info')
            expect(isTourCompleted('switch_info')).toBe(true)
        })

        it('should mark multiple tours as completed', () => {
            markTourCompleted('switch_info')
            markTourCompleted('data_extracts')
            markTourCompleted('leverage_answers')

            expect(isTourCompleted('switch_info')).toBe(true)
            expect(isTourCompleted('data_extracts')).toBe(true)
            expect(isTourCompleted('leverage_answers')).toBe(true)
        })

        it('should not duplicate tour IDs when marked multiple times', () => {
            markTourCompleted('switch_info')
            markTourCompleted('switch_info')
            markTourCompleted('switch_info')

            const stored = localStorage.getItem('sage_ai_tour_completed')
            const tours = JSON.parse(stored!) as TourId[]

            expect(tours.filter(t => t === 'switch_info').length).toBe(1)
        })

        it('should persist tours across multiple calls', () => {
            markTourCompleted('switch_info')
            expect(isTourCompleted('switch_info')).toBe(true)

            markTourCompleted('data_extracts')
            expect(isTourCompleted('switch_info')).toBe(true)
            expect(isTourCompleted('data_extracts')).toBe(true)
        })

        it('should handle localStorage write errors gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            // Mock localStorage.setItem to throw an error
            const originalSetItem = localStorageMock.setItem
            localStorageMock.setItem = vi.fn(() => {
                throw new Error('localStorage write error')
            })

            markTourCompleted('switch_info')
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving tour state:', expect.any(Error))

            // Restore
            localStorageMock.setItem = originalSetItem
            consoleErrorSpy.mockRestore()
        })
    })

    describe('resetAllTours', () => {
        it('should reset all completed tours', () => {
            markTourCompleted('switch_info')
            markTourCompleted('data_extracts')
            markTourCompleted('leverage_answers')

            expect(isTourCompleted('switch_info')).toBe(true)
            expect(isTourCompleted('data_extracts')).toBe(true)

            resetAllTours()

            expect(isTourCompleted('switch_info')).toBe(false)
            expect(isTourCompleted('data_extracts')).toBe(false)
            expect(isTourCompleted('leverage_answers')).toBe(false)
        })

        it('should work when no tours have been completed', () => {
            expect(() => resetAllTours()).not.toThrow()
            expect(isTourCompleted('switch_info')).toBe(false)
        })

        it('should handle localStorage removeItem errors gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            // Mock localStorage.removeItem to throw an error
            const originalRemoveItem = localStorageMock.removeItem
            localStorageMock.removeItem = vi.fn(() => {
                throw new Error('localStorage removeItem error')
            })

            resetAllTours()
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error resetting tours:', expect.any(Error))

            // Restore
            localStorageMock.removeItem = originalRemoveItem
            consoleErrorSpy.mockRestore()
        })
    })

    describe('localStorage integration', () => {
        it('should correctly serialize and deserialize tour data', () => {
            const tourIds: TourId[] = ['switch_info', 'data_extracts', 'leverage_answers', 'enhance_answer', 'check_coverage']

            tourIds.forEach(id => markTourCompleted(id))

            const stored = localStorage.getItem('sage_ai_tour_completed')
            expect(stored).toBeTruthy()

            const parsed = JSON.parse(stored!) as TourId[]
            expect(parsed).toHaveLength(5)
            expect(parsed).toEqual(expect.arrayContaining(tourIds))

            tourIds.forEach(id => {
                expect(isTourCompleted(id)).toBe(true)
            })
        })

        it('should handle corrupted localStorage data gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            localStorage.setItem('sage_ai_tour_completed', 'invalid json data')

            expect(isTourCompleted('switch_info')).toBe(false)
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error reading tour state:', expect.any(Error))

            consoleErrorSpy.mockRestore()
        })
    })

    describe('all tour IDs', () => {
        it('should work with all defined tour IDs', () => {
            const allTourIds: TourId[] = [
                'switch_info',
                'data_extracts',
                'leverage_answers',
                'enhance_answer',
                'check_coverage'
            ]

            allTourIds.forEach(tourId => {
                expect(isTourCompleted(tourId)).toBe(false)
                markTourCompleted(tourId)
                expect(isTourCompleted(tourId)).toBe(true)
            })

            resetAllTours()

            allTourIds.forEach(tourId => {
                expect(isTourCompleted(tourId)).toBe(false)
            })
        })
    })
})
