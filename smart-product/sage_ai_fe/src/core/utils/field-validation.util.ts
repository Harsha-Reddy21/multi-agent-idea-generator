import { FIELD_VALIDATION_REGEX, VALIDATION_ERROR_MESSAGES, TELEPHONE_VALIDATION } from '../constants'

/**
 * Field type identifiers based on schema properties
 */
export interface FieldIdentifiers {
    isTelephoneField: boolean
    isEmailField: boolean
    isMultiEmailField: boolean
    isNameField: boolean
}

/**
 * Validation result for a field
 */
export interface FieldValidationResult {
    isValid: boolean
    errorMessage: string
}

/**
 * Identifies the type of field based on schema properties
 * @param schema - The field schema
 * @returns Object with boolean flags for field types
 */
export const identifyFieldType = (schema: any): FieldIdentifiers => {
    const title = schema?.title?.toLowerCase() || ''

    return {
        isTelephoneField: title.includes('telephone') || title.includes('phone'),
        isEmailField: title.includes('email'),
        isMultiEmailField: title.includes('email') && (title.includes('comma') || title.includes('separated')), 
        isNameField: title.includes('first name') || title.includes('last name'),
    }
}

/**
 * Validates a telephone number field
 * Always returns the same error message for any telephone validation failure
 * @param value - The field value
 * @param schemaErrorMessage - Optional custom error message from schema
 * @returns Validation result with error message if invalid
 */
export const validateTelephoneField = (
    value: string,
    schemaErrorMessage?: string
): FieldValidationResult => {
    const numericValue = value.replace(FIELD_VALIDATION_REGEX.NUMERIC_ONLY, '')
    
    // Check if has non-numeric characters OR starts with zero OR not exactly 10 digits
    const isInvalid = value !== numericValue ||
        (numericValue.length > 0 && (numericValue.startsWith('0') || numericValue.length !== TELEPHONE_VALIDATION.MIN_LENGTH))

    return isInvalid 
        ? { isValid: false, errorMessage: schemaErrorMessage || VALIDATION_ERROR_MESSAGES.NUMERIC_10_DIGITS }
        : { isValid: true, errorMessage: '' }
}

/**
 * Validates an email field
 * @param value - The field value
 * @param schemaErrorMessage - Optional custom error message from schema
 * @param allowMultiple - Flag to allow multiple emails validation
 * @returns Validation result with error message if invalid
 */
export const validateEmailField = (
    value: string,
    schemaErrorMessage?: string,
    allowMultiple: boolean = false
): FieldValidationResult => {
    const regex = allowMultiple ? FIELD_VALIDATION_REGEX.EMAIL_LIST : FIELD_VALIDATION_REGEX.EMAIL
    const isValid = regex.test(value.trim())
    
    return {
        isValid,
        errorMessage: isValid ? '' : schemaErrorMessage || VALIDATION_ERROR_MESSAGES.EMAIL
    }
}

/**
 * Validates a name field (alphabets and spaces only)
 * @param value - The field value
 * @param schemaErrorMessage - Optional custom error message from schema
 * @returns Validation result with error message if invalid
 */
export const validateNameField = (
    value: string,
    schemaErrorMessage?: string
): FieldValidationResult => {
    const isValid = FIELD_VALIDATION_REGEX.ALPHABETIC_WITH_SPACES.test(value)
    
    return {
        isValid,
        errorMessage: isValid ? '' : schemaErrorMessage || VALIDATION_ERROR_MESSAGES.ALPHABETIC_WITH_SPACES
    }
}

/**
 * Sanitizes input for telephone fields by removing non-numeric characters
 * @param value - The input value
 * @param maxLength - Maximum allowed length
 * @returns Sanitized numeric string
 */
export const sanitizeTelephoneInput = (value: string, maxLength?: number): string => {
    const sanitized = value.replace(FIELD_VALIDATION_REGEX.NUMERIC_ONLY, '')
    return maxLength ? sanitized.slice(0, maxLength) : sanitized
}

/**
 * Validates a field based on its type
 * @param value - The field value
 * @param fieldType - The identified field type
 * @param schemaErrorMessage - Optional custom error message from schema
 * @returns Validation result with error message if invalid
 */
export const validateField = (
    value: string,
    fieldType: FieldIdentifiers,
    schemaErrorMessage?: string
): FieldValidationResult => {
    if (!value) {
        return { isValid: true, errorMessage: '' }
    }

    if (fieldType.isTelephoneField) {
        return validateTelephoneField(value, schemaErrorMessage)
    }

    if (fieldType.isEmailField) {
        return validateEmailField(value, schemaErrorMessage, fieldType.isMultiEmailField)
    }

    if (fieldType.isNameField) {
        return validateNameField(value, schemaErrorMessage)
    }

    return { isValid: true, errorMessage: '' }
}
