import { FormSchemaResponse } from '../models/form.model'

const isAnswerPresent = (val: unknown, pattern?: string): boolean => {
  if (val === null || val === undefined) return false
  if (Array.isArray(val)) return val.length > 0
  if (typeof val === 'string') {
    if (val.trim().length === 0) return false
    // Validate against pattern if provided
    if (pattern) {
      try {
        const regex = new RegExp(pattern)
        return regex.test(val)
      } catch (e) {
        // Invalid regex pattern, skip validation
        return true
      }
    }
    return true
  }
  if (typeof val === 'boolean') return val === true
  return true
}

const getRequiredFieldsForPage = (
  schema: FormSchemaResponse | null,
  pageIndex: number,
  overrides?: Record<number, string[]>
): string[] => {
  if (!schema) return []
  // If an override is provided for this page, use it (escape hatch for custom rules)
  if (overrides && overrides[pageIndex]) return overrides[pageIndex]
  const allRequired: string[] = Array.isArray(schema.schema.required)
    ? (schema.schema.required as string[])
    : []
  const tab = schema.tabSchema[pageIndex - 1]
  if (!tab) return []
  return tab.fields.filter(f => allRequired.includes(f))
}

const areRequiredFieldsSatisfied = (
  required: string[],
  data: Record<string, unknown>,
  schema: FormSchemaResponse | null
): boolean => {
  return required.every(fid => {
    const fieldValue = data[fid]
    // Safely access properties with proper typing
    const properties = schema?.schema?.properties as Record<string, any> | undefined
    const fieldSchema = properties?.[fid]
    const pattern = fieldSchema?.pattern as string | undefined
    return isAnswerPresent(fieldValue, pattern)
  })
}

/**
 * Get conditionally required fields that belong to a specific page
 */
const getConditionallyRequiredFieldsForPage = (
  schema: FormSchemaResponse | null,
  pageIndex: number,
  data: Record<string, unknown>
): string[] => {
  if (!schema?.schema?.dependencies) return []

  // Get all fields on this page
  const tab = schema.tabSchema[pageIndex - 1]
  if (!tab) return []
  const pageFields = new Set(tab.fields)

  const conditionallyRequired: string[] = []
  const dependencies = schema.schema.dependencies as Record<string, any>

  Object.keys(dependencies).forEach(dependencyKey => {
    const dependency = dependencies[dependencyKey]

    // Check if dependency has oneOf conditions
    if (dependency.oneOf && Array.isArray(dependency.oneOf)) {
      dependency.oneOf.forEach((condition: any) => {
        if (condition.properties && condition.required) {
          // Check if this condition matches current data
          const matches = checkConditionMatch(
            condition.properties,
            dependencyKey,
            data
          )
          if (matches) {
            // Only include required fields that belong to this page
            const pageSpecificRequired = condition.required.filter(
              (field: string) => pageFields.has(field)
            )
            conditionallyRequired.push(...pageSpecificRequired)
          }
        }
      })
    }
  })

  return conditionallyRequired
}

export const validatePageAnswers = (
  schema: FormSchemaResponse | null,
  pageIndex: number,
  data: Record<string, unknown>,
  overrides?: Record<number, string[]>
): boolean => {
  const requiredOnPage = getRequiredFieldsForPage(schema, pageIndex, overrides)
  const conditionalRequired = getConditionallyRequiredFieldsForPage(
    schema,
    pageIndex,
    data
  )

  const allRequiredOnPage = [
    ...new Set([...requiredOnPage, ...conditionalRequired]),
  ]

  if (allRequiredOnPage.length === 0) return true
  return areRequiredFieldsSatisfied(allRequiredOnPage, data, schema)
}

/**
 * Get all conditionally required fields based on current form data and dependencies
 */
const getConditionallyRequiredFields = (
  schema: FormSchemaResponse | null,
  data: Record<string, unknown>
): string[] => {
  if (!schema?.schema?.dependencies) return []

  const conditionallyRequired: string[] = []
  const dependencies = schema.schema.dependencies as Record<string, any>

  Object.keys(dependencies).forEach(dependencyKey => {
    const dependency = dependencies[dependencyKey]

    // Check if dependency has oneOf conditions
    if (dependency.oneOf && Array.isArray(dependency.oneOf)) {
      dependency.oneOf.forEach((condition: any) => {
        if (condition.properties && condition.required) {
          // Check if this condition matches current data
          const matches = checkConditionMatch(
            condition.properties,
            dependencyKey,
            data
          )
          if (matches) {
            conditionallyRequired.push(...condition.required)
          }
        }
      })
    }
  })

  return conditionallyRequired
}

/**
 * Check if a condition matches the current form data
 */
const checkConditionMatch = (
  conditionProperties: Record<string, any>,
  dependencyKey: string,
  data: Record<string, unknown>
): boolean => {
  const conditionProp = conditionProperties[dependencyKey]
  if (!conditionProp) return false

  const currentValue = data[dependencyKey]

  // Check enum match (e.g., { "enum": ["Yes"] })
  if (conditionProp.enum && Array.isArray(conditionProp.enum)) {
    return conditionProp.enum.includes(currentValue)
  }

  // Check contains match for arrays (e.g., { "contains": { "const": "Other" } })
  if (conditionProp.contains && conditionProp.contains.const) {
    if (Array.isArray(currentValue)) {
      return currentValue.includes(conditionProp.contains.const)
    }
  }

  // Check not contains for arrays
  if (conditionProp.not?.contains?.const) {
    if (Array.isArray(currentValue)) {
      return !currentValue.includes(conditionProp.not.contains.const)
    }
  }

  return false
}

/**
 * Get all conditional fields (both visible and hidden) from dependencies
 */
const getAllConditionalFields = (
  schema: FormSchemaResponse | null
): string[] => {
  if (!schema?.schema?.dependencies) return []

  const allConditionalFields: string[] = []
  const dependencies = schema.schema.dependencies as Record<string, any>

  Object.keys(dependencies).forEach(dependencyKey => {
    const dependency = dependencies[dependencyKey]

    if (dependency.oneOf && Array.isArray(dependency.oneOf)) {
      dependency.oneOf.forEach((condition: any) => {
        if (condition.properties) {
          // Get all fields defined in this condition (excluding the dependency key itself)
          Object.keys(condition.properties).forEach(field => {
            if (
              field !== dependencyKey &&
              !allConditionalFields.includes(field)
            ) {
              allConditionalFields.push(field)
            }
          })
          // Also include required fields from this condition
          if (condition.required && Array.isArray(condition.required)) {
            condition.required.forEach((field: string) => {
              if (
                field !== dependencyKey &&
                !allConditionalFields.includes(field)
              ) {
                allConditionalFields.push(field)
              }
            })
          }
        }
      })
    }
  })

  return allConditionalFields
}

/**
 * Get fields that should be visible based on current form data
 */
const getVisibleConditionalFields = (
  schema: FormSchemaResponse | null,
  data: Record<string, unknown>
): string[] => {
  if (!schema?.schema?.dependencies) return []

  const visibleFields: string[] = []
  const dependencies = schema.schema.dependencies as Record<string, any>

  Object.keys(dependencies).forEach(dependencyKey => {
    const dependency = dependencies[dependencyKey]

    if (dependency.oneOf && Array.isArray(dependency.oneOf)) {
      dependency.oneOf.forEach((condition: any) => {
        if (condition.properties) {
          const matches = checkConditionMatch(
            condition.properties,
            dependencyKey,
            data
          )
          if (matches) {
            // Add all fields from matching condition
            Object.keys(condition.properties).forEach(field => {
              if (field !== dependencyKey && !visibleFields.includes(field)) {
                visibleFields.push(field)
              }
            })
            if (condition.required && Array.isArray(condition.required)) {
              condition.required.forEach((field: string) => {
                if (field !== dependencyKey && !visibleFields.includes(field)) {
                  visibleFields.push(field)
                }
              })
            }
          }
        }
      })
    }
  })

  return visibleFields
}

/**
 * Clear values of hidden conditional fields based on current form data
 * Returns updated form data with hidden fields cleared
 */
export const clearHiddenConditionalFields = (
  schema: FormSchemaResponse | null,
  data: Record<string, unknown>
): Record<string, unknown> => {
  if (!schema?.schema?.dependencies) return data

  const allConditionalFields = getAllConditionalFields(schema)
  const visibleFields = getVisibleConditionalFields(schema, data)

  // Find fields that should be hidden (all conditional fields minus visible ones)
  const hiddenFields = allConditionalFields.filter(
    field => !visibleFields.includes(field)
  )

  // Create new data object with hidden fields cleared
  const clearedData = { ...data }
  hiddenFields.forEach(field => {
    if (field in clearedData) {
      delete clearedData[field]
    }
  })

  return clearedData
}

/**
 * Validates that all required fields across the entire form are filled
 */
export const validateEntireForm = (
  schema: FormSchemaResponse | null,
  data: Record<string, unknown>
): boolean => {
  if (!schema) return false

  // Get base required fields
  const baseRequired: string[] = Array.isArray(schema.schema.required)
    ? (schema.schema.required as string[])
    : []

  // Get conditionally required fields based on current form data
  const conditionalRequired = getConditionallyRequiredFields(schema, data)

  // Combine both sets of required fields
  const allRequired = [...new Set([...baseRequired, ...conditionalRequired])]

  if (allRequired.length === 0) return true
  return areRequiredFieldsSatisfied(allRequired, data, schema)
}
