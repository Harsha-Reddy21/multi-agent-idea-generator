import { beforeEach, describe, expect, it } from 'vitest'

import { CommonFieldResponseModal, FormQuestion } from '../models/form.model'
import {
  mapApiFormatToFormData,
  mapFormDataToApiFormat,
  mergeCommonFieldsWithFormData,
  updateAiMetadata,
} from './form-mapper.util'

describe('form-mapper.util', () => {
  let mockSchema: Record<string, unknown>
  let mockUiSchema: Record<string, unknown>

  beforeEach(() => {
    mockSchema = {
      properties: {
        name: { title: 'Full Name', type: 'string' },
        age: { title: 'Age', type: 'number' },
        active: { title: 'Is Active', type: 'boolean' },
        tags: { title: 'Tags', type: 'array', items: { type: 'string' } },
        joinDate: { title: 'Join Date', type: 'string', format: 'date' },
        createdAt: { title: 'Created At', type: 'string', format: 'date-time' },
        avatar: { title: 'Avatar', type: 'string', format: 'data-url' },
        document: { title: 'Document', type: 'string', format: 'file' },
        bio: { title: 'Biography', type: 'string' },
        status: { title: 'Status', type: 'string', enum: ['active', 'inactive', 'pending'] },
        priority: {
          title: 'Priority',
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical', 'urgent'],
        },
        metadata: { title: 'Metadata', type: 'object' },
      },
      dependencies: {
        country: {
          oneOf: [
            {
              properties: {
                country: { const: 'USA' },
                state: { title: 'State', type: 'string' },
              },
            },
            {
              properties: {
                country: { const: 'Canada' },
                province: { title: 'Province', type: 'string' },
              },
            },
          ],
        },
      },
    }

    mockUiSchema = {
      name: { 'ui:widget': 'customText' },
      bio: { 'ui:widget': 'customTextarea' },
      tags: { 'ui:widget': 'customMultiSelect' },
      status: { 'ui:widget': 'customRadio' },
      priority: { 'ui:widget': 'customSelect' },
      active: { 'ui:widget': 'customCheckbox' },
      joinDate: { 'ui:widget': 'customDate' },
      document: { 'ui:widget': 'customFile' },
    }
  })

  describe('mapFormDataToApiFormat', () => {
    it('should map simple string field to FormQuestion', () => {
      const formData = { name: 'John Doe' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        questionId: 'name',
        question: 'Full Name',
        answer: ['John Doe'],
        type: 'textbox',
      })
    })

    it('should map number field correctly', () => {
      const formData = { age: 25 }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'age',
        question: 'Age',
        answer: ['25'],
        type: 'textbox',
      })
    })

    it('should map boolean field as checkbox', () => {
      const formData = { active: true }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'active',
        question: 'Is Active',
        answer: ['true'],
        type: 'checkbox',
      })
    })

    it('should map array field as MultiSelect', () => {
      const formData = { tags: ['javascript', 'react', 'testing'] }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'tags',
        question: 'Tags',
        answer: ['javascript', 'react', 'testing'],
        type: 'MultiSelect',
      })
    })

    it('should map date field as datepicker', () => {
      const formData = { joinDate: '2024-01-15' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'joinDate',
        question: 'Join Date',
        answer: ['2024-01-15'],
        type: 'datepicker',
      })
    })

    it('should map date-time field as datetime', () => {
      const formData = { createdAt: '2024-01-15T10:30:00Z' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'createdAt',
        question: 'Created At',
        answer: ['2024-01-15T10:30:00Z'],
        type: 'datetime',
      })
    })

    it('should skip data-url file upload fields', () => {
      const formData = { avatar: 'data:image/png;base64,...' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should skip file format fields', () => {
      const formData = { document: 'file.pdf' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should skip File object uploads', () => {
      const formData = { document: '[object File]' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should skip fields with file-like objects', () => {
      const formData = {
        document: {
          name: 'file.txt',
          size: 1024,
          type: 'text/plain',
          lastModified: 1234567890,
        },
      }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should map textarea field from uiSchema', () => {
      const formData = { bio: 'A long biography' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'bio',
        question: 'Biography',
        answer: ['A long biography'],
        type: 'textarea',
      })
    })

    it('should map radio field from enum with <=4 options', () => {
      const formData = { status: 'active' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'status',
        question: 'Status',
        answer: ['active'],
        type: 'radio',
      })
    })

    it('should map select field from enum with >4 options', () => {
      const formData = { priority: 'high' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'priority',
        question: 'Priority',
        answer: ['high'],
        type: 'select',
      })
    })

    it('should handle null values', () => {
      const formData = { name: null }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'name',
        question: 'Full Name',
        answer: [],
        type: 'textbox',
      })
    })

    it('should handle undefined values', () => {
      const formData = { name: undefined }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'name',
        question: 'Full Name',
        answer: [],
        type: 'textbox',
      })
    })

    it('should handle empty string values', () => {
      const formData = { name: '' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'name',
        question: 'Full Name',
        answer: [],
        type: 'textbox',
      })
    })

    it('should skip unknown fields without schema', () => {
      const formData = { unknownField: 'value' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should stringify object values', () => {
      const formData = { metadata: { key: 'value', count: 5 } }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0].answer[0]).toBe(JSON.stringify({ key: 'value', count: 5 }))
    })

    it('should map nested dependency fields', () => {
      const formData = { country: 'USA', state: 'California' }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toContainEqual({
        questionId: 'country',
        question: 'country',
        answer: ['USA'],
        type: 'textbox',
      })
      expect(result).toContainEqual({
        questionId: 'state',
        question: 'State',
        answer: ['California'],
        type: 'textbox',
      })
    })

    it('should handle empty array values', () => {
      const formData = { tags: [] }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'tags',
        question: 'Tags',
        answer: [],
        type: 'MultiSelect',
      })
    })

    it('should convert numeric array items to strings', () => {
      const formData = { tags: [1, 2, 3] }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result[0]).toEqual({
        questionId: 'tags',
        question: 'Tags',
        answer: ['1', '2', '3'],
        type: 'MultiSelect',
      })
    })

    it('should handle complex multi-field form data', () => {
      const formData = {
        name: 'John Doe',
        age: 30,
        active: true,
        tags: ['developer', 'react'],
        joinDate: '2020-01-15',
      }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(5)
      expect(result.map(q => q.questionId)).toEqual([
        'name',
        'age',
        'active',
        'tags',
        'joinDate',
      ])
    })

    it('should use questionId as fallback when title is missing', () => {
      const schemaWithoutTitle = {
        properties: {
          customField: { type: 'string' }, // No title
        },
      }
      const formData = { customField: 'value' }
      const result = mapFormDataToApiFormat(formData, schemaWithoutTitle)

      expect(result[0].question).toBe('customField')
    })

    it('should handle uiSchema without explicit widget', () => {
      const formData = { name: 'John' }
      const result = mapFormDataToApiFormat(formData, mockSchema, {})

      expect(result[0].type).toBe('textbox')
    })

    it('should handle widget that returns null from getWidgetType', () => {
      const uiSchemaWithUnknownWidget = {
        name: { 'ui:widget': 'unknownWidget' },
      }
      const formData = { name: 'John' }
      const result = mapFormDataToApiFormat(formData, mockSchema, uiSchemaWithUnknownWidget)

      expect(result[0].type).toBe('textbox')
    })

    it('should skip value where stringValue equals [object File]', () => {
      // Test line 70: stringValue === '[object File]'
      const fileValue = Object.create({
        toString() {
          return '[object File]'
        },
      })
      const formData = { document: fileValue }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should skip value that includes [object File] in string representation (line 72)', () => {
      // Test line 72: stringValue.includes('[object File]')
      // Create a mock that has [object File] in the middle of its string representation
      
      // Override Object.prototype.toString to return string with [object File]
      const testValue = {
        toString() {
          return 'Text before [object File] text after'
        },
      }
      
      const formData = { document: testValue }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should skip object values with file-like properties (name, size, type, lastModified)', () => {
      // Test line 84: isFileUpload check
      const fileObject = {
        name: 'document.pdf',
        size: 2048,
        type: 'application/pdf',
        lastModified: 1234567890,
      }
      const formData = { document: fileObject }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should detect file upload with only some file properties (line 84)', () => {
      // Another test for line 84: isFileUpload check
      // Object with just 'size' property should trigger file detection
      const fileObject = {
        size: 2048,
        data: 'content',
      }
      const formData = { document: fileObject }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should detect file upload with type property (line 84)', () => {
      // Test for detecting file objects based on 'type' property
      const fileObject = {
        type: 'application/pdf',
        content: 'file data',
      }
      const formData = { document: fileObject }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should detect file upload with lastModified property (line 84)', () => {
      // Test for detecting file objects based on 'lastModified' property
      const fileObject = {
        lastModified: 1234567890,
        content: 'file data',
      }
      const formData = { document: fileObject }
      const result = mapFormDataToApiFormat(formData, mockSchema, mockUiSchema)

      expect(result).toHaveLength(0)
    })

    it('should not skip regular object values without file properties', () => {
      const regularObject = {
        key: 'value',
        nested: { data: 'test' },
      }
      const schemaWithObjectType = {
        properties: {
          data: { title: 'Data', type: 'object' },
        },
      }
      const formData = { data: regularObject }
      const result = mapFormDataToApiFormat(formData, schemaWithObjectType)

      expect(result).toHaveLength(1)
      expect(result[0].answer[0]).toBe(JSON.stringify(regularObject))
    })

    it('should return select type for enum with more than 4 options (line 193)', () => {
      // Test line 193: return enum.length > 4 ? 'select' : 'radio'
      const schemaWithLargeEnum = {
        properties: {
          level: {
            title: 'Difficulty Level',
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master', 'legendary'],
          },
        },
      }
      const formData = { level: 'advanced' }
      const result = mapFormDataToApiFormat(formData, schemaWithLargeEnum)

      expect(result[0]).toEqual({
        questionId: 'level',
        question: 'Difficulty Level',
        answer: ['advanced'],
        type: 'select',
      })
    })
  })

  describe('mapApiFormatToFormData', () => {
    it('should convert FormQuestion array to form data object', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: ['John Doe'],
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result).toEqual({ name: 'John Doe' })
    })

    it('should handle empty answer array', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: [],
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.name).toBeUndefined()
    })

    it('should handle null answer', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: null as any,
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.name).toBeUndefined()
    })

    it('should keep array type as array', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'tags',
          question: 'Tags',
          answer: ['javascript', 'react'],
          type: 'MultiSelect',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.tags).toEqual(['javascript', 'react'])
    })

    it('should convert number strings to numbers', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'age',
          question: 'Age',
          answer: ['25'],
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.age).toBe(25)
      expect(typeof result.age).toBe('number')
    })

    it('should convert boolean string to boolean', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'active',
          question: 'Is Active',
          answer: ['true'],
          type: 'checkbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.active).toBe(true)
    })

    it('should handle boolean "Yes" string', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'active',
          question: 'Is Active',
          answer: ['Yes'],
          type: 'checkbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.active).toBe(true)
    })

    it('should convert "false" string to false boolean', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'active',
          question: 'Is Active',
          answer: ['false'],
          type: 'checkbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.active).toBe(false)
    })

    it('should handle date format fields', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'joinDate',
          question: 'Join Date',
          answer: ['2024-01-15'],
          type: 'datepicker',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.joinDate).toBe('2024-01-15')
    })

    it('should handle date-time format fields', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'createdAt',
          question: 'Created At',
          answer: ['2024-01-15T10:30:00Z'],
          type: 'datetime',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.createdAt).toBe('2024-01-15T10:30:00Z')
    })

    it('should parse JSON object strings', () => {
      const jsonData = { key: 'value', nested: { count: 5 } }
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'metadata',
          question: 'Metadata',
          answer: [JSON.stringify(jsonData)],
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.metadata).toEqual(jsonData)
    })

    it('should handle invalid JSON and treat as string', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'metadata',
          question: 'Metadata',
          answer: ['{invalid json}'],
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.metadata).toBe('{invalid json}')
    })

    it('should handle nested dependency fields', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'country',
          question: 'Country',
          answer: ['USA'],
          type: 'textbox',
        },
        {
          questionId: 'state',
          question: 'State',
          answer: ['California'],
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.country).toBe('USA')
      expect(result.state).toBe('California')
    })

    it('should handle integer type', () => {
      const schemaWithInteger = {
        properties: {
          count: { title: 'Count', type: 'integer' },
        },
      }
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'count',
          question: 'Count',
          answer: ['42'],
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, schemaWithInteger)

      expect(result.count).toBe(42)
    })

    it('should handle multiple form questions', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: ['John Doe'],
          type: 'textbox',
        },
        {
          questionId: 'age',
          question: 'Age',
          answer: ['30'],
          type: 'textbox',
        },
        {
          questionId: 'active',
          question: 'Is Active',
          answer: ['true'],
          type: 'checkbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result).toEqual({
        name: 'John Doe',
        age: 30,
        active: true,
      })
    })

    it('should handle question without schema definition', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'unknown',
          question: 'Unknown Field',
          answer: ['some value'],
          type: 'textbox',
        },
      ]
      const result = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(result.unknown).toBe('some value')
    })
  })

  describe('updateAiMetadata', () => {
    it('should add ai_meta_data to specific question', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: ['John Doe'],
          type: 'textbox',
        },
      ]
      const metadata = { confidence: 0.95, source: 'ai' }
      const result = updateAiMetadata(formQuestions, 'name', metadata)

      expect(result[0].ai_meta_data).toBe(JSON.stringify(metadata))
    })

    it('should not modify other questions', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: ['John Doe'],
          type: 'textbox',
        },
        {
          questionId: 'email',
          question: 'Email',
          answer: ['john@example.com'],
          type: 'textbox',
        },
      ]
      const metadata = { confidence: 0.95 }
      const result = updateAiMetadata(formQuestions, 'name', metadata)

      expect(result[0].ai_meta_data).toBe(JSON.stringify(metadata))
      expect(result[1].ai_meta_data).toBeUndefined()
    })

    it('should handle complex metadata objects', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: ['John Doe'],
          type: 'textbox',
        },
      ]
      const metadata = {
        confidence: 0.95,
        algorithm: 'bert',
        suggestions: ['John D.', 'Jon Doe'],
        processingTime: 1234,
      }
      const result = updateAiMetadata(formQuestions, 'name', metadata)

      expect(JSON.parse(result[0].ai_meta_data as string)).toEqual(metadata)
    })

    it('should handle empty metadata', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: ['John Doe'],
          type: 'textbox',
        },
      ]
      const metadata = {}
      const result = updateAiMetadata(formQuestions, 'name', metadata)

      expect(result[0].ai_meta_data).toBe('{}')
    })

    it('should handle updating non-existent question id', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: ['John Doe'],
          type: 'textbox',
        },
      ]
      const metadata = { confidence: 0.95 }
      const result = updateAiMetadata(formQuestions, 'nonexistent', metadata)

      expect(result).toHaveLength(1)
      expect(result[0].ai_meta_data).toBeUndefined()
    })

    it('should return new array without mutating original', () => {
      const formQuestions: FormQuestion[] = [
        {
          questionId: 'name',
          question: 'Full Name',
          answer: ['John Doe'],
          type: 'textbox',
        },
      ]
      const metadata = { confidence: 0.95 }
      const result = updateAiMetadata(formQuestions, 'name', metadata)

      expect(result).not.toBe(formQuestions)
      expect(formQuestions[0].ai_meta_data).toBeUndefined()
    })
  })

  describe('mergeCommonFieldsWithFormData', () => {
    it('should merge common fields into empty form data', () => {
      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'name', answer: 'John Doe', multi_source: false },
          { question_id: 'email', answer: 'john@example.com', multi_source: false },
        ],
      }
      const schema = {
        properties: {
          name: { title: 'Name', type: 'string' },
          email: { title: 'Email', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      })
      expect(result.multiSourceData).toEqual({})
    })

    it('should not overwrite existing non-empty values', () => {
      const formData = { name: 'Jane Doe' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [{ question_id: 'name', answer: 'John Doe', multi_source: false }],
      }
      const schema = {
        properties: {
          name: { title: 'Name', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData.name).toBe('Jane Doe')
    })

    it('should fill in missing fields from common fields', () => {
      const formData = { name: 'Jane Doe' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'name', answer: 'John Doe', multi_source: false },
          { question_id: 'email', answer: 'john@example.com', multi_source: false },
        ],
      }
      const schema = {
        properties: {
          name: { title: 'Name', type: 'string' },
          email: { title: 'Email', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData.name).toBe('Jane Doe')
      expect(result.formData.email).toBe('john@example.com')
    })

    it('should replace null values with common field values', () => {
      const formData = { name: null }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [{ question_id: 'name', answer: 'John Doe', multi_source: false }],
      }
      const schema = {
        properties: {
          name: { title: 'Name', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData.name).toBe('John Doe')
    })

    it('should replace undefined values with common field values', () => {
      const formData = { name: undefined }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [{ question_id: 'name', answer: 'John Doe', multi_source: false }],
      }
      const schema = {
        properties: {
          name: { title: 'Name', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData.name).toBe('John Doe')
    })

    it('should replace empty string values with common field values', () => {
      const formData = { name: '' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [{ question_id: 'name', answer: 'John Doe', multi_source: false }],
      }
      const schema = {
        properties: {
          name: { title: 'Name', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData.name).toBe('John Doe')
    })

    it('should replace empty array with common field values', () => {
      const formData = { tags: [] }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [{ question_id: 'tags', answer: 'javascript,react', multi_source: false }],
      }
      const schema = {
        properties: {
          tags: { title: 'Tags', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData.tags).toBe('javascript,react')
    })

    it('should skip common fields with empty answers', () => {
      const formData = { name: '' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [{ question_id: 'name', answer: '', multi_source: false }],
      }
      const result = mergeCommonFieldsWithFormData(formData, commonFieldsResponse)

      expect(result.formData.name).toBe('')
    })

    it('should handle empty common_fields array', () => {
      const formData = { name: 'Jane Doe' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [],
      }
      const result = mergeCommonFieldsWithFormData(formData, commonFieldsResponse)

      expect(result.formData).toEqual(formData)
      expect(result.multiSourceData).toEqual({})
    })

    it('should handle undefined common_fields', () => {
      const formData = { name: 'Jane Doe' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: undefined as any,
      }
      const result = mergeCommonFieldsWithFormData(formData, commonFieldsResponse)

      expect(result.formData).toEqual(formData)
      expect(result.multiSourceData).toEqual({})
    })

    it('should handle null common_fields', () => {
      const formData = { name: 'Jane Doe' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: null as any,
      }
      const result = mergeCommonFieldsWithFormData(formData, commonFieldsResponse)

      expect(result.formData).toEqual(formData)
      expect(result.multiSourceData).toEqual({})
    })

    it('should not mutate original formData', () => {
      const formData = { name: '' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [{ question_id: 'name', answer: 'John Doe', multi_source: false }],
      }
      mergeCommonFieldsWithFormData(formData, commonFieldsResponse)

      expect(formData.name).toBe('')
    })

    it('should handle multiple common fields with various conditions', () => {
      const formData = {
        firstName: 'Jane',
        lastName: '',
        email: null as any,
        phone: undefined,
        website: 'https://jane.com',
      }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'firstName', answer: 'John', multi_source: false }, // Should not overwrite
          { question_id: 'lastName', answer: 'Doe', multi_source: false }, // Should fill empty string
          { question_id: 'email', answer: 'john@example.com', multi_source: false }, // Should fill null
          { question_id: 'phone', answer: '555-1234', multi_source: false }, // Should fill undefined
          { question_id: 'website', answer: 'https://john.com', multi_source: false }, // Should not overwrite
          { question_id: 'address', answer: '123 Main St', multi_source: false }, // Should add new field
        ],
      }
      const schema = {
        properties: {
          firstName: { title: 'First Name', type: 'string' },
          lastName: { title: 'Last Name', type: 'string' },
          email: { title: 'Email', type: 'string' },
          phone: { title: 'Phone', type: 'string' },
          website: { title: 'Website', type: 'string' },
          address: { title: 'Address', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData.firstName).toBe('Jane')
      expect(result.formData.lastName).toBe('Doe')
      expect(result.formData.email).toBe('john@example.com')
      expect(result.formData.phone).toBe('555-1234')
      expect(result.formData.website).toBe('https://jane.com')
      expect(result.formData.address).toBe('123 Main St')
    })

    it('should handle common field with whitespace-only answer', () => {
      const formData = { name: 'Jane' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [{ question_id: 'email', answer: '   ', multi_source: false }],
      }
      const result = mergeCommonFieldsWithFormData(formData, commonFieldsResponse)

      expect(result.formData.email).toBeUndefined()
    })

    it('should add new fields from common fields', () => {
      const formData = { name: 'Jane Doe' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'email', answer: 'jane@example.com', multi_source: false },
          { question_id: 'phone', answer: '555-1234', multi_source: false },
        ],
      }
      const schema = {
        properties: {
          name: { title: 'Name', type: 'string' },
          email: { title: 'Email', type: 'string' },
          phone: { title: 'Phone', type: 'string' },
        },
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schema
      )

      expect(result.formData).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-1234',
      })
    })

    it('should merge fields from allOf.then.properties', () => {
      const schemaWithAllOf = {
        properties: {
          S_Q26: {
            title: 'Test Data Question',
            type: 'string',
            enum: ['Yes', 'No'],
          },
        },
        allOf: [
          {
            if: {
              properties: {
                S_Q26: { const: 'No' },
              },
              required: ['S_Q26'],
            },
            then: {
              properties: {
                S_Q35: {
                  title: 'PHI Question',
                  type: 'string',
                  enum: ['Yes', 'No', 'Not Sure'],
                },
                S_Q36: {
                  title: 'PI/SPI Question',
                  type: 'string',
                  enum: ['Yes', 'No', 'Not Sure'],
                },
              },
            },
          },
        ],
      }

      const formData = { S_Q26: 'No' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q35', answer: 'Yes', multi_source: false },
          { question_id: 'S_Q36', answer: 'No', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schemaWithAllOf
      )

      expect(result.formData.S_Q35).toBe('Yes')
      expect(result.formData.S_Q36).toBe('No')
    })

    it('should merge fields from dependencies.oneOf', () => {
      const schemaWithOneOf = {
        properties: {
          S_Q16: {
            title: 'Hosting Location',
            type: 'string',
            enum: ['Lilly Cloud', 'SaaS', 'External Data Center'],
          },
        },
        dependencies: {
          S_Q16: {
            oneOf: [
              {
                properties: {
                  S_Q16: {
                    enum: ['Lilly Cloud', 'SaaS'],
                  },
                  S_Q17: {
                    title: 'Cloud Accounts',
                    type: 'string',
                  },
                },
              },
              {
                properties: {
                  S_Q16: {
                    enum: ['External Data Center'],
                  },
                },
              },
            ],
          },
        },
      }

      const formData = { S_Q16: 'Lilly Cloud' }
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q17', answer: 'AWS Account 123', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schemaWithOneOf
      )

      expect(result.formData.S_Q17).toBe('AWS Account 123')
    })

    it('should validate enum values for fields in allOf', () => {
      const schemaWithAllOf = {
        properties: {
          S_Q26: {
            title: 'Test Data Question',
            type: 'string',
            enum: ['Yes', 'No'],
          },
        },
        allOf: [
          {
            if: {
              properties: {
                S_Q26: { const: 'No' },
              },
            },
            then: {
              properties: {
                S_Q35: {
                  title: 'PHI Question',
                  type: 'string',
                  enum: ['Yes', 'No', 'Not Sure'],
                },
              },
            },
          },
        ],
      }

      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q35', answer: 'Invalid Value', multi_source: false },
          { question_id: 'S_Q35', answer: 'Yes', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schemaWithAllOf
      )

      // Invalid enum value should be skipped, valid one should be merged
      expect(result.formData.S_Q35).toBe('Yes')
    })

    it('should validate enum values for fields in dependencies.oneOf', () => {
      const schemaWithOneOf = {
        properties: {
          S_Q29: {
            title: 'Third Party Question',
            type: 'string',
            enum: ['Yes', 'No'],
          },
        },
        dependencies: {
          S_Q29: {
            oneOf: [
              {
                properties: {
                  S_Q29: { enum: ['Yes'] },
                  S_Q30: {
                    title: 'Third Party Names',
                    type: 'string',
                  },
                  S_Q31: {
                    title: 'Third Party Role',
                    type: 'string',
                  },
                },
              },
            ],
          },
        },
      }

      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q30', answer: 'Valid Third Party', multi_source: false },
          { question_id: 'S_Q31', answer: 'Valid Role', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schemaWithOneOf
      )

      expect(result.formData.S_Q30).toBe('Valid Third Party')
      expect(result.formData.S_Q31).toBe('Valid Role')
    })

    it('should not merge fields that do not exist in schema (allOf or oneOf)', () => {
      const schemaWithAllOf = {
        properties: {
          S_Q26: {
            title: 'Test Data Question',
            type: 'string',
            enum: ['Yes', 'No'],
          },
        },
        allOf: [
          {
            if: {
              properties: {
                S_Q26: { const: 'No' },
              },
            },
            then: {
              properties: {
                S_Q35: {
                  title: 'PHI Question',
                  type: 'string',
                  enum: ['Yes', 'No'],
                },
              },
            },
          },
        ],
      }

      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q35', answer: 'Yes', multi_source: false },
          { question_id: 'NonExistentField', answer: 'Some Value', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schemaWithAllOf
      )

      expect(result.formData.S_Q35).toBe('Yes')
      expect(result.formData.NonExistentField).toBeUndefined()
    })

    it('should handle multiple allOf conditionals', () => {
      const schemaWithMultipleAllOf = {
        properties: {
          S_Q23: {
            title: 'SSO Question',
            type: 'string',
            enum: ['Yes', 'No'],
          },
          S_Q26: {
            title: 'Test Data Question',
            type: 'string',
            enum: ['Yes', 'No'],
          },
        },
        allOf: [
          {
            if: {
              properties: {
                S_Q26: { const: 'No' },
              },
            },
            then: {
              properties: {
                S_Q35: {
                  title: 'PHI Question',
                  type: 'string',
                  enum: ['Yes', 'No'],
                },
              },
            },
          },
          {
            if: {
              properties: {
                S_Q23: { const: 'No' },
              },
            },
            then: {
              properties: {
                S_Q41: {
                  title: 'SSO Explanation',
                  type: 'string',
                },
              },
            },
          },
        ],
      }

      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q35', answer: 'Yes', multi_source: false },
          { question_id: 'S_Q41', answer: 'Explanation text', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schemaWithMultipleAllOf
      )

      expect(result.formData.S_Q35).toBe('Yes')
      expect(result.formData.S_Q41).toBe('Explanation text')
    })

    it('should handle fields in both root properties and allOf (prefer root)', () => {
      const schemaWithOverlap = {
        properties: {
          S_Q1: {
            title: 'Title',
            type: 'string',
          },
        },
        allOf: [
          {
            if: {
              properties: {
                S_Q26: { const: 'No' },
              },
            },
            then: {
              properties: {
                S_Q1: {
                  title: 'Alternative Title',
                  type: 'string',
                },
              },
            },
          },
        ],
      }

      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q1', answer: 'Test Title', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schemaWithOverlap
      )

      // Should find in root properties first, so it should be merged
      expect(result.formData.S_Q1).toBe('Test Title')
    })

    it('should handle complex schema with allOf, dependencies, and root properties', () => {
      const complexSchema = {
        properties: {
          S_Q1: {
            title: 'Title',
            type: 'string',
          },
          S_Q16: {
            title: 'Hosting',
            type: 'string',
            enum: ['Lilly Cloud', 'SaaS'],
          },
        },
        allOf: [
          {
            if: {
              properties: {
                S_Q26: { const: 'No' },
              },
            },
            then: {
              properties: {
                S_Q35: {
                  title: 'PHI Question',
                  type: 'string',
                  enum: ['Yes', 'No'],
                },
              },
            },
          },
        ],
        dependencies: {
          S_Q16: {
            oneOf: [
              {
                properties: {
                  S_Q16: { enum: ['Lilly Cloud'] },
                  S_Q17: {
                    title: 'Cloud Accounts',
                    type: 'string',
                  },
                },
              },
            ],
          },
        },
      }

      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q1', answer: 'Test Title', multi_source: false },
          { question_id: 'S_Q35', answer: 'Yes', multi_source: false },
          { question_id: 'S_Q17', answer: 'AWS Account', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        complexSchema
      )

      expect(result.formData.S_Q1).toBe('Test Title')
      expect(result.formData.S_Q35).toBe('Yes')
      expect(result.formData.S_Q17).toBe('AWS Account')
    })

    it('should not merge fields that exist only in allOf when schema is not provided', () => {
      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q35', answer: 'Yes', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(formData, commonFieldsResponse)

      // Without schema, field should not be merged
      expect(result.formData.S_Q35).toBeUndefined()
    })

    it('should handle enum validation for fields in allOf with oneOf structure', () => {
      const schemaWithComplexEnum = {
        properties: {
          S_Q29: {
            title: 'Third Party Question',
            type: 'string',
            enum: ['Yes', 'No'],
          },
        },
        allOf: [
          {
            if: {
              properties: {
                S_Q29: { const: 'Yes' },
              },
            },
            then: {
              properties: {
                S_Q29: {
                  oneOf: [
                    {
                      properties: {
                        S_Q29: { enum: ['Yes'] },
                        S_Q30: {
                          title: 'Third Party Names',
                          type: 'string',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
        dependencies: {
          S_Q29: {
            oneOf: [
              {
                properties: {
                  S_Q29: { enum: ['Yes'] },
                  S_Q30: {
                    title: 'Third Party Names',
                    type: 'string',
                  },
                },
              },
            ],
          },
        },
      }

      const formData = {}
      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'S_Q30', answer: 'Valid Name', multi_source: false },
        ],
      }
      const result = mergeCommonFieldsWithFormData(
        formData,
        commonFieldsResponse,
        schemaWithComplexEnum
      )

      expect(result.formData.S_Q30).toBe('Valid Name')
    })
  })

  describe('Integration tests', () => {
    it('should round-trip form data through mapping functions', () => {
      const originalFormData = {
        name: 'John Doe',
        age: 30,
        active: true,
        tags: ['developer', 'react'],
        joinDate: '2020-01-15',
      }

      const formQuestions = mapFormDataToApiFormat(originalFormData, mockSchema, mockUiSchema)
      const reconstructedFormData = mapApiFormatToFormData(formQuestions, mockSchema)

      expect(reconstructedFormData).toEqual(originalFormData)
    })

    it('should handle complex form workflow', () => {
      const initialFormData = {
        name: '',
        email: '',
      }

      const commonFieldsResponse: CommonFieldResponseModal = {
        common_fields: [
          { question_id: 'name', answer: 'John Doe', multi_source: false },
          { question_id: 'email', answer: 'john@example.com', multi_source: false },
          { question_id: 'phone', answer: '555-1234', multi_source: false },
        ],
      }

      const schemaForIntegration = {
        properties: {
          name: { title: 'Full Name', type: 'string' },
          email: { title: 'Email', type: 'string' },
          phone: { title: 'Phone', type: 'string' },
        },
      }

      const mergedResult = mergeCommonFieldsWithFormData(
        initialFormData,
        commonFieldsResponse,
        schemaForIntegration
      )

      const formQuestions = mapFormDataToApiFormat(mergedResult.formData, schemaForIntegration)
      const result = mapApiFormatToFormData(formQuestions, schemaForIntegration)

      const metadata = { source: 'common_fields', confidence: 0.9 }
      const updatedQuestions = updateAiMetadata(formQuestions, 'name', metadata)

      expect(result.name).toBe('John Doe')
      expect(result.email).toBe('john@example.com')
      expect(result.phone).toBe('555-1234')
      expect(updatedQuestions[0].ai_meta_data).toBe(JSON.stringify(metadata))
    })
  })
})
