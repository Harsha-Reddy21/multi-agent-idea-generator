// Utility functions for common operations

/**
 * Normalizes event value from LDS components
 * LDS components may pass value directly as string, event object, or option object
 */
export const normalizeEventValue = (
  eventOrValue: unknown
): string | undefined => {
  let selectedValue: string | undefined

  if (typeof eventOrValue === 'string') {
    // Direct value passed
    selectedValue = eventOrValue
  } else if (eventOrValue && typeof eventOrValue === 'object') {
    // Check if it's an option object with a value property (LdsSelect behavior)
    const obj = eventOrValue as {
      value?: string
      target?: { value?: string }
    }
    if ('value' in obj && obj.value !== undefined) {
      // Option object from LdsSelect
      selectedValue = obj.value
    } else if (obj.target?.value !== undefined) {
      // Standard event object
      selectedValue = obj.target.value
    }
  }

  return selectedValue === '' ? undefined : selectedValue
}

/**
 * Formats file size in bytes to MB
 */
export const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

/**
 * Extracts question ID from RJSF field ID
 */
export const extractQuestionId = (id: string): string => {
  return id.replace(/^root_/, '')
}

/**
 * Checks if a value is empty
 */
export const isValueEmpty = (value: unknown): boolean => {
  return value === undefined || value === null || value === ''
}

/**
 * Checks if an array value is empty
 */
export const isArrayValueEmpty = (value: unknown): boolean => {
  return !value || (Array.isArray(value) && value.length === 0)
}
