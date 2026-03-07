const TOUR_STORAGE_KEY = 'sage_ai_tour_completed'

export type TourId =
  | 'switch_info'
  | 'data_extracts'
  | 'leverage_answers'
  | 'enhance_answer'
  | 'check_coverage'

/**
 * Get all completed tours from localStorage
 */
const getCompletedTours = (): Set<TourId> => {
  try {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY)
    if (stored) {
      const tours = JSON.parse(stored) as TourId[]
      return new Set(tours)
    }
  } catch (error) {
    console.error('Error reading tour state:', error)
  }
  return new Set()
}

/**
 * Save completed tours to localStorage
 */
const saveCompletedTours = (tours: Set<TourId>): void => {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(Array.from(tours)))
  } catch (error) {
    console.error('Error saving tour state:', error)
  }
}

/**
 * Check if a tour has been completed
 */
export const isTourCompleted = (tourId: TourId): boolean => {
  const completed = getCompletedTours()
  return completed.has(tourId)
}

/**
 * Mark a tour as completed
 */
export const markTourCompleted = (tourId: TourId): void => {
  const completed = getCompletedTours()
  completed.add(tourId)
  saveCompletedTours(completed)
}

/**
 * Reset all tours (for testing/debugging)
 */
export const resetAllTours = (): void => {
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY)
  } catch (error) {
    console.error('Error resetting tours:', error)
  }
}
