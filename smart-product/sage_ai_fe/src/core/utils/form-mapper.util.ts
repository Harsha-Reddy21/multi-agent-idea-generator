import { CommonFieldResponseModal, FormQuestion } from '../models/form.model'

/**
 * Helper function to find field schema in nested schema structure
 * Looks in properties, dependencies, and allOf for the field definition
 */
function findFieldSchema(
  questionId: string,
  schema: Record<string, unknown>
): Record<string, unknown> | null {
  // First check root properties
  const properties = (schema.properties as Record<string, unknown>) || {}
  if (properties[questionId]) {
    return properties[questionId] as Record<string, unknown>
  }

  // Check in allOf conditionals (if/then structures)
  const allOf = (schema.allOf as Array<Record<string, unknown>>) || []
  if (Array.isArray(allOf)) {
    for (const conditional of allOf) {
      const thenClause = conditional.then as Record<string, unknown>
      if (thenClause) {
        const thenProperties =
          (thenClause.properties as Record<string, unknown>) || {}
        if (thenProperties[questionId]) {
          return thenProperties[questionId] as Record<string, unknown>
        }
      }
    }
  }

  // Check in dependencies
  const dependencies = (schema.dependencies as Record<string, unknown>) || {}
  for (const depKey of Object.keys(dependencies)) {
    const dep = dependencies[depKey] as Record<string, unknown>
    const oneOf = dep.oneOf as Array<Record<string, unknown>>

    if (oneOf && Array.isArray(oneOf)) {
      for (const option of oneOf) {
        const depProps = (option.properties as Record<string, unknown>) || {}
        if (depProps[questionId]) {
          return depProps[questionId] as Record<string, unknown>
        }
      }
    }
  }

  return null
}

/**
 * Maps RJSF form data (key-value pairs) to API format (array of FormQuestion objects)
 * @param formData - The form data from React JSON Schema Form
 * @param schema - The JSON schema to extract question titles
 * @param uiSchema - The UI schema to extract widget types
 * @returns Array of FormQuestion objects
 */
export function mapFormDataToApiFormat(
  formData: Record<string, unknown>,
  schema: Record<string, unknown>,
  uiSchema?: Record<string, unknown>
): FormQuestion[] {
  const formQuestions: FormQuestion[] = []

  for (const [questionId, value] of Object.entries(formData)) {
    // Get the question schema (handles nested dependencies)
    const questionSchema = findFieldSchema(questionId, schema)
    if (!questionSchema) {
      // If schema not found, skip this field
      continue
    }

    const questionTitle = (questionSchema.title as string) || questionId
    const fieldFormat = questionSchema.format as string

    // Skip file upload fields (check schema format or value pattern)
    if (fieldFormat === 'data-url' || fieldFormat === 'file') {
      continue // Skip file uploads based on schema
    }

    // Skip if value is a File object or contains "[object File]" pattern
    const stringValue = String(value)
    if (
      stringValue === '[object File]' ||
      stringValue.includes('[object File]')
    ) {
      continue // Skip file uploads
    }

    // Ignore file uploads (RJSF file widget returns objects with name, size, type, etc.)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const possibleFileFields = ['name', 'size', 'type', 'lastModified']
      const valueKeys = Object.keys(value)
      const isFileUpload = possibleFileFields.some(field =>
        valueKeys.includes(field)
      )

      if (isFileUpload) {
        continue // Skip file uploads
      }
    }

    // Determine the UI element type
    const uiElementType = determineUIElementType(
      questionId,
      questionSchema,
      uiSchema
    )

    // Convert value to array format
    let answerArray: string[]
    if (Array.isArray(value)) {
      // If already an array, convert all items to strings
      answerArray = value.map(String)
    } else if (value === null || value === undefined || value === '') {
      // Empty answer
      answerArray = []
    } else if (typeof value === 'object') {
      // If it's an object, stringify it
      answerArray = [JSON.stringify(value)]
    } else {
      // Single value, convert to string and wrap in array
      answerArray = [String(value)]
    }

    formQuestions.push({
      questionId,
      question: questionTitle,
      answer: answerArray,
      type: uiElementType,
    })
  }

  return formQuestions
}

/**
 * Determines the UI element type based on schema and uiSchema
 * @param questionId - The question ID
 * @param questionSchema - The JSON schema for the field
 * @param uiSchema - The UI schema
 * @returns The UI element type (e.g., 'textbox', 'textarea', 'radio', 'select', 'MultiSelect', 'checkbox', 'datepicker', 'datetime', 'file')
 */
function determineUIElementType(
  questionId: string,
  questionSchema: Record<string, unknown>,
  uiSchema?: Record<string, unknown>
): string {
  // Check if uiSchema has explicit widget definition
  const fieldUiSchema = uiSchema?.[questionId] as
    | Record<string, unknown>
    | undefined
  if (fieldUiSchema) {
    const widget = fieldUiSchema['ui:widget'] as string
    if (widget) {
      const widgetType = getWidgetType(widget)
      if (widgetType) return widgetType
    }
  }

  // Fallback to schema type inference
  return inferTypeFromSchema(questionSchema)
}

/**
 * Maps custom widget names to standard UI types
 */
function getWidgetType(widget: string): string | null {
  const widgetMap: Record<string, string> = {
    customText: 'textbox',
    customTextarea: 'textarea',
    customRadio: 'radio',
    customSelect: 'select',
    customMultiSelect: 'MultiSelect',
    customCheckbox: 'checkbox',
    customDate: 'datepicker',
    customFile: 'file',
    textarea: 'textarea',
    radio: 'radio',
    select: 'select',
    checkboxes: 'multiselect',
    checkbox: 'checkbox',
    date: 'datepicker',
  }
  return widgetMap[widget] || null
}

/**
 * Infers UI element type from JSON schema properties
 */
function inferTypeFromSchema(questionSchema: Record<string, unknown>): string {
  const fieldType = questionSchema?.type as string
  const fieldFormat = questionSchema?.format as string
  const fieldEnum = questionSchema?.enum as unknown[]

  // Date/time fields
  if (fieldFormat === 'date') return 'datepicker'
  if (fieldFormat === 'date-time') return 'datetime'

  // File upload fields
  if (fieldFormat === 'data-url' || fieldFormat === 'file') return 'file'

  // Array types (multiselect)
  if (fieldType === 'array') return 'MultiSelect'

  // Enum types (select or radio)
  if (fieldEnum && Array.isArray(fieldEnum)) {
    return fieldEnum.length <= 4 ? 'radio' : 'select'
  }

  // Boolean type (checkbox)
  if (fieldType === 'boolean') return 'checkbox'

  // String type with multiline (textarea)
  if (fieldType === 'string') {
    const fieldWidget = (questionSchema['ui:widget'] as string) || ''
    if (fieldWidget === 'textarea') return 'textarea'
    return 'textbox'
  }

  // Number/integer type
  if (fieldType === 'number' || fieldType === 'integer') return 'textbox'

  // Default fallback
  return 'textbox'
}

/**
 * Maps API format (array of FormQuestion objects) back to RJSF form data (key-value pairs)
 * @param formQuestions - Array of FormQuestion objects from API
 * @param schema - The JSON schema to determine field types
 * @returns Form data object for RJSF
 */
export function mapApiFormatToFormData(
  formQuestions: FormQuestion[],
  schema: Record<string, unknown>
): Record<string, unknown> {
  const formData: Record<string, unknown> = {}

  for (const { questionId, answer } of formQuestions) {
    // Find the field schema (handles nested dependencies)
    const questionSchema = findFieldSchema(questionId, schema)
    const fieldType = questionSchema?.type as string
    const fieldFormat = questionSchema?.format as string

    // Convert answer array back to appropriate format based on schema type
    if (!answer || answer.length === 0) {
      // Empty answer
      formData[questionId] = undefined
    } else if (fieldType === 'array') {
      // Keep as array for multi-select fields
      formData[questionId] = answer
    } else if (fieldType === 'object') {
      // Parse JSON string back to object
      try {
        formData[questionId] = JSON.parse(answer[0])
      } catch {
        formData[questionId] = answer[0]
      }
    } else if (fieldType === 'number' || fieldType === 'integer') {
      // Convert to number
      formData[questionId] = Number(answer[0])
    } else if (fieldType === 'boolean') {
      // Convert to boolean
      formData[questionId] = answer[0] === 'true' || answer[0] === 'Yes'
    } else if (fieldFormat === 'date' || fieldFormat === 'date-time') {
      // Date fields - keep as string (RJSF expects date strings in ISO format)
      formData[questionId] = answer[0]
    } else {
      // String type or default - take first element
      formData[questionId] = answer[0]
    }
  }

  return formData
}

/**
 * Updates AI metadata for a specific question in the form data
 * @param formQuestions - Array of FormQuestion objects
 * @param questionId - The question ID to update
 * @param aiMetadata - The AI metadata to set
 * @returns Updated array of FormQuestion objects
 */
export function updateAiMetadata(
  formQuestions: FormQuestion[],
  questionId: string,
  aiMetadata: Record<string, unknown>
): FormQuestion[] {
  return formQuestions.map(q =>
    q.questionId === questionId
      ? { ...q, ai_meta_data: JSON.stringify(aiMetadata) }
      : q
  )
}

/**
 * Merges common fields response into form data.
 * Updates values in formData when:
 * 1. The key (question_id) does not exist in formData, OR
 * 2. The key exists but has no value (null, undefined, empty string, or empty array)
 * 3. The commonFields has a non-empty answer for that key
 *
 * Note: This will NOT overwrite existing non-empty values in formData
 * For multi-source fields (multi_source: true), the value is NOT prefilled into formData
 * but stored separately to be displayed in the AI Features Card
 *
 * @param formData - The existing form data object (from mapApiFormatToFormData)
 * @param commonFieldsResponse - The response from getCommonFields API
 * @returns Object with updated form data and multi-source fields
 */
export const mergeCommonFieldsWithFormData = (
  formData: Record<string, unknown>,
  commonFieldsResponse: CommonFieldResponseModal,
  schema?: Record<string, unknown>
): {
  formData: Record<string, unknown>
  multiSourceData: Record<string, string>
} => {
  // Create a copy of formData to avoid mutations
  const updatedFormData = { ...formData }
  const multiSourceData: Record<string, string> = {}

  // Check if common_fields exists and is not empty
  if (
    !commonFieldsResponse.common_fields ||
    commonFieldsResponse.common_fields.length === 0
  ) {
    return { formData: updatedFormData, multiSourceData }
  }

  // Helper function to check if a value is valid for a field's enum
  // Uses findFieldSchema to handle nested structures (oneOf dependencies)
  const isValidEnumValue = (questionId: string, value: unknown): boolean => {
    if (!schema) return true // Skip validation if no schema

    // First check if field is directly in properties
    const properties = (schema.properties as Record<string, unknown>) || {}
    const fieldSchema = properties[questionId] as
      | Record<string, unknown>
      | undefined

    if (fieldSchema) {
      // Check if field has enum directly
      if (fieldSchema.enum && Array.isArray(fieldSchema.enum)) {
        return fieldSchema.enum.includes(value)
      }

      // Check if field has oneOf structure (like S-Q29)
      if (fieldSchema.oneOf && Array.isArray(fieldSchema.oneOf)) {
        // Check all oneOf options for matching enum value
        for (const option of fieldSchema.oneOf as Array<
          Record<string, unknown>
        >) {
          const optionProps =
            (option.properties as Record<string, unknown>) || {}
          const optionField = optionProps[questionId] as
            | Record<string, unknown>
            | undefined
          if (
            optionField?.enum &&
            Array.isArray(optionField.enum) &&
            optionField.enum.includes(value)
          ) {
            return true
          }
        }
      }
    }

    // Fallback: Use findFieldSchema to handle nested structures (dependencies)
    const nestedFieldSchema = findFieldSchema(questionId, schema)
    if (nestedFieldSchema?.enum && Array.isArray(nestedFieldSchema.enum)) {
      return nestedFieldSchema.enum.includes(value)
    }

    // If no enum constraint found, allow the value
    return true
  }
  // Iterate through common fields
  for (const field of commonFieldsResponse.common_fields) {
    const { question_id, answer, multi_source } = field

    // Check if answer from common fields is not empty
    if (!answer || answer.trim() === '') {
      continue
    }

    // If multi_source is true, store separately and skip form prefill
    if (multi_source) {
      multiSourceData[question_id] = answer
      continue
    }

    // Validate enum values against schema
    if (!isValidEnumValue(question_id, answer)) {
      continue
    }

    // Get the current value in formData
    const currentValue = updatedFormData[question_id]

    // Check if the field should be updated:
    // 1. Key doesn't exist in formData
    // 2. Value is null or undefined
    // 3. Value is empty string
    // 4. Value is empty array
    const shouldUpdate =
      !(question_id in updatedFormData) ||
      currentValue === null ||
      currentValue === undefined ||
      currentValue === '' ||
      (Array.isArray(currentValue) && currentValue.length === 0)

    if (shouldUpdate) {
      // Check if field exists anywhere in schema (root properties, allOf, or dependencies.oneOf)
      // Use findFieldSchema to handle nested structures
      if (schema) {
        const fieldSchema = findFieldSchema(question_id, schema)

        // Only set the value if field exists in schema (anywhere)
        if (fieldSchema) {
          updatedFormData[question_id] = answer
        }
      }
    }
  }

  return { formData: updatedFormData, multiSourceData }
}

/**
 * Checks if a field has AI features enabled by examining the uiSchema tags
 * @param questionId - The question ID to check
 * @param uiSchema - The UI schema containing field configurations
 * @returns true if the field has AI features enabled, false otherwise
 */
export const isFieldAIEnabled = (
  questionId: string,
  uiSchema?: Record<string, unknown>
): boolean => {
  if (!uiSchema) return false

  const fieldUiSchema = uiSchema[questionId] as
    | Record<string, unknown>
    | undefined

  if (!fieldUiSchema) return false

  const tags = fieldUiSchema['ui:tags'] as
    | Array<{ isAIFeatureEnable?: boolean }>
    | undefined

  if (!tags || !Array.isArray(tags)) return false

  return tags.some(tag => tag.isAIFeatureEnable === true)
}
