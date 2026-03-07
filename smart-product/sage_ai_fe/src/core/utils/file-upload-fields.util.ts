// Utility to extract file upload field keys from a uiSchema object
// Returns an array of question IDs where ui:widget is 'customFile'
export function getFileUploadFieldKeys(
  uiSchema: Record<string, any>
): string[] {
  if (!uiSchema) return []
  return Object.entries(uiSchema)
    .filter(([_, value]) => value && value['ui:widget'] === 'customFile')
    .map(([key]) => key)
}

// Utility to extract File objects from formData based on file upload fields defined in uiSchema
export function extractFilesFromFormData(
  formData: Record<string, unknown>,
  uiSchema: Record<string, any>
): File[] {
  const fileObjects: File[] = []
  if (!uiSchema) return fileObjects
  const fileKeys = getFileUploadFieldKeys(uiSchema)
  for (const key of fileKeys) {
    const filesValue = formData[key]
    if (filesValue instanceof File) {
      fileObjects.push(filesValue)
    } else if (
      Array.isArray(filesValue) &&
      filesValue.every((item: unknown) => item instanceof File)
    ) {
      fileObjects.push(...(filesValue as File[]))
    }
  }
  return fileObjects
}
