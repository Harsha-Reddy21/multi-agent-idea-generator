# Sage AI Frontend - Project Architecture & Code Standards

**Version:** 1.0  
**Last Updated:** December 16, 2025  
**Tech Stack:** React 18.2 + TypeScript 5.9 + Vite 5.4

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Application Flow](#application-flow)
4. [Directory Structure](#directory-structure)
5. [Architecture Patterns](#architecture-patterns)
6. [Code Standards & Conventions](#code-standards--conventions)
7. [Component Guidelines](#component-guidelines)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Testing Strategy](#testing-strategy)
11. [Styling Guidelines](#styling-guidelines)
12. [Build & Development](#build--development)
13. [Deployment Process](#deployment-process)

---

## Project Overview

Sage AI Frontend is a React-based web application that provides an intelligent form management system with AI-powered features including document extraction, answer enhancement, and suggestions.

### Key Features

- **Dynamic Form Rendering** using React JSON Schema Form (@rjsf)
- **AI-Powered Assistance** for form completion and data extraction
- **Real-time Document Processing** with SSE (Server-Sent Events)
- **Multi-step Form Workflows** across various departments
- **Dashboard & Analytics** for submission tracking

---

## Technology Stack

### Core Dependencies

```json
{
  "react": "^18.2.0", // UI Library
  "react-router-dom": "6.14.2", // Client-side routing
  "typescript": "~5.9.3", // Type safety
  "vite": "^5.4.0", // Build tool
  "@rjsf/core": "^5.24.13", // JSON Schema Forms
  "@rjsf/validator-ajv8": "^5.24.13", // Form validation
  "axios": "^1.12.2", // HTTP client
  "@elilillyco/ux-lds-react": "^2.11.1" // Lilly Design System
}
```

### Development Tools

- **Vite** - Fast build tool with HMR
- **TypeScript** - Static typing and enhanced IDE support
- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **SASS** - CSS preprocessing

---

## Application Flow

### User Journey Overview

The Sage AI application supports multiple form submission workflows with AI-powered assistance. Below is the complete flow from user authentication to form submission.

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Entry                        │
│                      (main.tsx)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Context Providers                          │
│   • UserProvider (Authentication & User Data)                │
│   • UserSubmissionsProvider (Submission List)                │
│   • ExtractionStatusProvider (Document Processing)           │
│   • DataExtractsStatusProvider (Data Status)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    App Layout                                │
│   • Header (Navigation, User Menu)                           │
│   • Main Content Area (Routes)                               │
│   • Footer                                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
              ┌──────┴──────┐
              │   Routing   │
              └──────┬──────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   [Landing]   [Dashboard]  [Form Pages]
```

### 1. **Landing Page Flow**

```
Landing Page (/)
│
├─► View Feature Cards
│   • AI Registry
│   • Idea Submission
│   • Research Submissions
│   • Clinical Trial Forms
│
├─► "Get Started" Button
│   └─► Navigate to BeginSubmission
│
└─► "View My Submissions" (if authenticated)
    └─► Navigate to FormDashboard
```

**Components:**

- `Landing.tsx` - Main landing page
- `FeatureCard` - Individual feature display cards
- Navigation to `/begin-submission` or `/dashboard`

---

### 2. **Begin Submission Flow**

```
Begin Submission Page (/begin-submission)
│
├─► User Authentication Check
│   ├─► Authenticated: Load user data
│   └─► Not Authenticated: Redirect to login
│
├─► Select Submission Type
│   • Idea Submission
│   • AI Registry
│   • Research Submission
│   • Clinical Trial
│
├─► Optional: Upload Supporting Documents
│   ├─► Drag & Drop Files
│   ├─► File Validation (size, type)
│   └─► Upload to S3 via API
│
└─► Navigate to Form
    • Passes submission_id
    • Includes uploaded document references
```

**Key Components:**

- `BeginSubmission.tsx` - Submission type selection
- `FileUploadWidget` - Document upload interface
- API: `uploadApi.uploadFiles()`

**State Management:**

- Upload status tracked locally
- Files stored in S3
- Submission ID generated on server

---

### 3. **Form Rendering Flow (RJSF)**

```
Form Page (/idea-submission, /ai-registry, etc.)
│
├─► Fetch Form Schema
│   • GET /api/forms/{formId}/schema
│   • Returns JSON Schema + UI Schema
│
├─► Initialize Form State
│   • Load existing draft (if any)
│   • Apply pre-filled values
│   • Set up validation rules
│
├─► Render Dynamic Form (RJSF)
│   • JSON Schema → Form Fields
│   • Custom Widgets Applied
│   • Field Dependencies Evaluated
│
├─► User Interaction Loop
│   │
│   ├─► Field Change Event
│   │   ├─► Update Form Data
│   │   ├─► Trigger Validation
│   │   ├─► Show AI Features (if enabled)
│   │   └─► Save Draft (auto-save)
│   │
│   ├─► AI Feature Activation
│   │   ├─► Document Extraction
│   │   ├─► Answer Enhancement
│   │   └─► Suggestions/Recommendations
│   │
│   └─► Navigation
│       ├─► Next Section
│       ├─► Previous Section
│       └─► Save & Exit
│
└─► Form Submission
    ├─► Final Validation
    ├─► POST /api/submissions
    ├─► Success: Redirect to Dashboard
    └─► Error: Show validation errors
```

**Key Components:**

- `FormContainer.tsx` - RJSF wrapper with custom logic
- `widgets/` - Custom form field widgets
- `templates.tsx` - Custom field templates
- `AIFeaturesCard.tsx` - AI assistance panel

**APIs Used:**

- `formsApi.getFormSchema(formId)` - Fetch schema
- `submissionsApi.createSubmission(data)` - Submit form
- `submissionsApi.updateDraft(id, data)` - Auto-save draft

---

### 3.1 **Dynamic Form Generation: JSON Schema to UI**

The application uses **React JSON Schema Form (RJSF)** to dynamically generate forms from JSON schemas. This allows forms to be configured and updated without code changes.

#### **Architecture Overview**

```
┌──────────────────────────────────────────────────────────────┐
│                     Backend (Python)                          │
│  • Stores form definitions in database                        │
│  • Returns JSON Schema + UI Schema                            │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP API
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  Frontend (React + RJSF)                      │
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ JSON Schema  │───►│ RJSF Engine  │───►│   UI Output  │   │
│  │  (Structure) │    │  (Processor) │    │  (Components)│   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                    │                    │           │
│         │            ┌───────▼────────┐           │           │
│         │            │   UI Schema    │           │           │
│         │            │ (Presentation) │           │           │
│         │            └────────────────┘           │           │
│         │                                         │           │
│  ┌──────▼─────────────────────────────────────────▼──────┐   │
│  │            Custom Configuration Layer                  │   │
│  │  • Custom Widgets  • Custom Templates                  │   │
│  │  • Custom Validators  • Custom Fields                  │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

#### **Step 1: JSON Schema Definition (Backend)**

The backend defines the form structure using JSON Schema:

```json
{
  "title": "AI Registry Form",
  "type": "object",
  "required": ["project_name", "use_case_category"],
  "properties": {
    "project_name": {
      "type": "string",
      "title": "Project Name",
      "minLength": 3,
      "maxLength": 100
    },
    "use_case_category": {
      "type": "string",
      "title": "Use Case Category",
      "enum": [
        "Predictive Analytics",
        "Natural Language Processing",
        "Computer Vision",
        "Other"
      ]
    },
    "description": {
      "type": "string",
      "title": "Project Description",
      "minLength": 10
    },
    "team_members": {
      "type": "array",
      "title": "Team Members",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "role": { "type": "string" }
        }
      }
    },
    "attachments": {
      "type": "array",
      "title": "Supporting Documents",
      "items": {
        "type": "string",
        "format": "data-url"
      }
    }
  },
  "dependencies": {
    "use_case_category": {
      "oneOf": [
        {
          "properties": {
            "use_case_category": { "enum": ["Other"] },
            "other_category": {
              "type": "string",
              "title": "Specify Other Category"
            }
          },
          "required": ["other_category"]
        }
      ]
    }
  }
}
```

**JSON Schema Properties:**

- `type` - Data type (string, number, object, array, boolean)
- `title` - Field label displayed to user
- `required` - Array of required field names
- `enum` - Predefined options for dropdowns
- `minLength/maxLength` - String length validation
- `format` - Special formats (email, date, data-url)
- `dependencies` - Conditional field display logic
- `items` - Schema for array elements

---

#### **Step 2: UI Schema Definition (Backend)**

The UI Schema controls how fields are rendered:

```json
{
  "project_name": {
    "ui:widget": "CustomTextWidget",
    "ui:options": {
      "placeholder": "Enter project name",
      "ai_enabled": true,
      "help": "Provide a descriptive name for your AI project"
    }
  },
  "use_case_category": {
    "ui:widget": "CustomSelectWidget",
    "ui:options": {
      "enumLabels": {
        "Predictive Analytics": "Predictive Analytics (Forecasting)",
        "Natural Language Processing": "NLP (Text Analysis)",
        "Computer Vision": "Computer Vision (Image/Video)",
        "Other": "Other (Specify Below)"
      }
    }
  },
  "description": {
    "ui:widget": "CustomTextAreaWidget",
    "ui:options": {
      "rows": 5,
      "ai_enabled": true,
      "enhanceable": true
    }
  },
  "team_members": {
    "ui:options": {
      "addable": true,
      "removable": true,
      "orderable": true
    },
    "items": {
      "name": { "ui:widget": "text" },
      "email": { "ui:widget": "email" },
      "role": {
        "ui:widget": "select",
        "ui:options": {
          "enumOptions": [
            { "value": "lead", "label": "Project Lead" },
            { "value": "developer", "label": "Developer" },
            { "value": "analyst", "label": "Data Analyst" }
          ]
        }
      }
    }
  },
  "attachments": {
    "ui:widget": "CustomFileWidget",
    "ui:options": {
      "accept": ".pdf,.doc,.docx,.xlsx",
      "multiple": true,
      "maxSize": 10485760
    }
  },
  "ui:order": [
    "project_name",
    "use_case_category",
    "other_category",
    "description",
    "team_members",
    "attachments"
  ]
}
```

**UI Schema Properties:**

- `ui:widget` - Custom widget component name
- `ui:options` - Widget-specific configuration
- `ui:order` - Field display order
- `ui:field` - Custom field template
- `ui:placeholder` - Input placeholder text
- `ui:help` - Help text below field

---

#### **Step 3: Frontend Receives Schemas**

```typescript
// FormContainer.tsx or page component
const [formSchema, setFormSchema] = useState<JSONSchema7>(null)
const [uiSchema, setUiSchema] = useState<UiSchema>(null)
const [formData, setFormData] = useState<any>({})

useEffect(() => {
  const loadFormSchema = async () => {
    try {
      // API call to fetch schemas
      const response = await formsApi.getFormSchema(formId)

      // Response contains:
      // {
      //   schema: { ...JSON Schema... },
      //   uiSchema: { ...UI Schema... },
      //   formData: { ...pre-filled data... }
      // }

      setFormSchema(response.schema)
      setUiSchema(response.uiSchema)
      setFormData(response.formData || {})
    } catch (error) {
      console.error('Failed to load form schema:', error)
    }
  }

  loadFormSchema()
}, [formId])
```

---

#### **Step 4: RJSF Processes Schemas**

```typescript
// FormContainer.tsx
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import { customWidgets } from './widgets/widgets'
import { customTemplates } from './templates'

const FormContainer = () => {
  return (
    <Form
      schema={formSchema}           // JSON Schema (structure)
      uiSchema={uiSchema}           // UI Schema (presentation)
      formData={formData}           // Current form data
      validator={validator}         // AJV validator
      widgets={customWidgets}       // Custom widget mapping
      templates={customTemplates}   // Custom field templates
      onChange={handleChange}       // Data change handler
      onSubmit={handleSubmit}       // Form submission
      onError={handleError}         // Validation errors
    />
  )
}
```

**RJSF Processing Steps:**

1. **Schema Parsing**
   - RJSF reads JSON Schema
   - Identifies field types and constraints
   - Builds internal form structure

2. **Widget Selection**

   ```typescript
   // RJSF determines which widget to use:

   // Default mapping
   type: "string" → TextWidget
   type: "number" → NumberWidget
   type: "boolean" → CheckboxWidget
   type: "array" → ArrayFieldTemplate

   // Custom mapping (from ui:widget)
   ui:widget: "CustomTextWidget" → CustomTextWidget component
   ui:widget: "CustomFileWidget" → CustomFileWidget component
   ```

3. **Field Rendering**
   - RJSF creates field components
   - Applies UI Schema options
   - Wraps with templates (labels, errors, help text)

4. **Validation Setup**
   - AJV validator reads constraints
   - Creates validation functions
   - Attaches to field change events

---

#### **Step 5: Custom Widget Mapping**

```typescript
// widgets/widgets.tsx
import { CustomTextWidget } from './components/CustomTextWidget'
import { CustomSelectWidget } from './components/CustomSelectWidget'
import { CustomFileWidget } from './components/CustomFileWidget'
import { CustomTextAreaWidget } from './components/CustomTextAreaWidget'
import { CustomDateWidget } from './components/CustomDateWidget'

export const customWidgets = {
  // Override default widgets
  TextWidget: CustomTextWidget,
  SelectWidget: CustomSelectWidget,
  TextareaWidget: CustomTextAreaWidget,
  FileWidget: CustomFileWidget,
  DateWidget: CustomDateWidget,

  // Custom widget names (used via ui:widget)
  CustomTextWidget: CustomTextWidget,
  CustomSelectWidget: CustomSelectWidget,
  CustomFileWidget: CustomFileWidget,
  CustomTextAreaWidget: CustomTextAreaWidget,
  CustomDateWidget: CustomDateWidget,
}
```

**Widget Component Structure:**

```typescript
// CustomTextWidget.tsx
interface WidgetProps {
  id: string                    // Field ID
  value: any                    // Current value
  required: boolean             // Is required?
  disabled: boolean             // Is disabled?
  readonly: boolean             // Is readonly?
  onChange: (value: any) => void // Change handler
  onBlur: (id: string, value: any) => void
  onFocus: (id: string, value: any) => void
  options: any                  // UI Schema options
  schema: JSONSchema7           // Field schema
  label: string                 // Field label
  placeholder?: string          // Placeholder text
}

export const CustomTextWidget: React.FC<WidgetProps> = (props) => {
  const {
    id,
    value,
    onChange,
    options,
    label,
    placeholder,
    required
  } = props

  // Extract custom options from UI Schema
  const aiEnabled = options?.ai_enabled || false
  const enhanceable = options?.enhanceable || false

  return (
    <FieldWrapper
      id={id}
      label={label}
      required={required}
      aiEnabled={aiEnabled}
    >
      <LdsTextField
        id={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />

      {enhanceable && (
        <EnhanceAnswerButton
          question={label}
          currentAnswer={value}
          onEnhance={(enhanced) => onChange(enhanced)}
        />
      )}
    </FieldWrapper>
  )
}
```

---

#### **Step 6: Dynamic Rendering Flow**

```
JSON Schema Field Definition
         │
         │ "project_name": {
         │   "type": "string",
         │   "title": "Project Name"
         │ }
         │
         ▼
    RJSF Engine
         │
         ├─► Reads type: "string"
         ├─► Reads title: "Project Name"
         ├─► Checks UI Schema for widget override
         │
         ▼
    UI Schema Lookup
         │
         │ "project_name": {
         │   "ui:widget": "CustomTextWidget",
         │   "ui:options": { "ai_enabled": true }
         │ }
         │
         ▼
    Widget Selection
         │
         ├─► Found: CustomTextWidget
         ├─► Options: { ai_enabled: true }
         │
         ▼
    Component Rendering
         │
         ├─► CustomTextWidget rendered
         ├─► Props passed: id, value, onChange, options
         ├─► LdsTextField inside widget
         ├─► AI toggle rendered (ai_enabled=true)
         │
         ▼
    DOM Output
         │
         ▼
    <div class="field-wrapper">
      <label>Project Name *</label>
      <input type="text" value="..." />
      <button class="ai-toggle">AI</button>
      <span class="help-text">...</span>
    </div>
```

---

#### **Step 7: Conditional Field Rendering (Dependencies)**

RJSF automatically handles conditional fields based on `dependencies`:

```json
// JSON Schema
{
  "dependencies": {
    "use_case_category": {
      "oneOf": [
        {
          "properties": {
            "use_case_category": { "enum": ["Other"] },
            "other_category": {
              "type": "string",
              "title": "Specify Other Category"
            }
          },
          "required": ["other_category"]
        }
      ]
    }
  }
}
```

**Rendering Logic:**

1. User selects "Other" in `use_case_category` dropdown
2. RJSF detects dependency condition matched
3. `other_category` field is dynamically added to form
4. Field becomes required
5. User changes selection to "Predictive Analytics"
6. RJSF removes `other_category` field
7. Validation no longer requires it

---

#### **Step 8: Array Field Rendering**

For array fields (like team_members):

```typescript
// RJSF automatically creates:
// 1. Add button to add new items
// 2. Remove button for each item
// 3. Reorder controls (if orderable: true)
// 4. Nested form for each array item

<ArrayFieldTemplate>
  {items.map((item, index) => (
    <div key={index} class="array-item">
      <div class="item-fields">
        {/* Nested fields based on items schema */}
        <CustomTextWidget id="name" />
        <CustomTextWidget id="email" />
        <CustomSelectWidget id="role" />
      </div>
      <div class="item-controls">
        <button onClick={moveUp}>↑</button>
        <button onClick={moveDown}>↓</button>
        <button onClick={remove}>✕</button>
      </div>
    </div>
  ))}
  <button onClick={addItem}>+ Add Team Member</button>
</ArrayFieldTemplate>
```

---

#### **Step 9: Real-time Validation**

```typescript
// Validation flow on field change
onChange={(formData) => {
  // 1. Update form data state
  setFormData(formData)

  // 2. RJSF triggers validation via AJV
  const errors = validator.validateFormData(formData, schema)

  // 3. Errors passed to error template
  // 4. Inline error messages displayed

  // 5. Custom validation (if any)
  const customErrors = customValidate(formData)

  // 6. Merge and display all errors
}}
```

**Error Display:**

```tsx
<FieldTemplate>
  <label>{label}</label>
  <Widget {...props} />
  {errors.map(error => (
    <span class="error-message">{error}</span>
  ))}
  {help && <span class="help-text">{help}</span>}
</FieldTemplate>
```

---

#### **Step 10: Form Data Submission**

```typescript
const handleSubmit = async ({ formData }: IChangeEvent) => {
  // formData contains all field values matching schema structure
  // {
  //   project_name: "AI Chatbot",
  //   use_case_category: "Natural Language Processing",
  //   description: "Customer support chatbot...",
  //   team_members: [
  //     { name: "John", email: "john@ex.com", role: "lead" }
  //   ],
  //   attachments: ["base64encodedfile..."]
  // }

  try {
    // Submit to backend
    const response = await submissionsApi.createSubmission({
      form_id: formId,
      data: formData,
      status: 'submitted',
    })

    // Navigate to success page
    navigate('/dashboard')
  } catch (error) {
    // Handle submission error
    setSubmissionError(error.message)
  }
}
```

---

#### **Complete Data Flow Example**

```
Backend: Form Definition
│
├─► JSON Schema: { type: "string", title: "Name" }
├─► UI Schema: { "ui:widget": "CustomTextWidget", "ui:options": { "ai_enabled": true } }
│
└─► API Response: GET /api/forms/ai-registry
    {
      "schema": {...},
      "uiSchema": {...},
      "formData": {}
    }

Frontend: RJSF Processing
│
├─► Parse Schemas
│   ├─► Field type: string
│   ├─► Widget: CustomTextWidget
│   └─► Options: { ai_enabled: true }
│
├─► Render Component Tree
│   <Form>
│     <CustomTextWidget
│       id="name"
│       value=""
│       onChange={fn}
│       options={{ ai_enabled: true }}
│     />
│   </Form>
│
├─► User Types: "AI Chatbot"
│   ├─► onChange triggered
│   ├─► formData updated: { name: "AI Chatbot" }
│   ├─► Validation runs
│   └─► No errors
│
└─► User Clicks Submit
    ├─► onSubmit triggered
    ├─► Final validation
    ├─► POST /api/submissions
    │   Body: { form_id: "ai-registry", data: {...} }
    └─► Success: Navigate to /dashboard
```

---

#### **Benefits of JSON Schema Approach**

1. **Dynamic Configuration** - Update forms without deploying code
2. **Consistency** - Same schema used for validation on frontend & backend
3. **Reusability** - Custom widgets reused across all forms
4. **Type Safety** - JSON Schema provides structure validation
5. **Flexibility** - Easy to add/remove fields or change form structure
6. **Maintainability** - Form logic centralized in schema definitions
7. **Version Control** - Schema changes tracked in database
8. **Multi-tenancy** - Different forms for different use cases without code duplication

---

### 4. **AI Features Flow**

#### A. Document Extraction Flow

```
Document Extraction
│
├─► User Uploads Document
│   • PDF, DOCX, or image files
│   • Files uploaded to S3
│
├─► Initiate Extraction
│   • POST /api/cortex/extract
│   • Submission ID + File references
│
├─► SSE Connection Established
│   • EventSource(/api/cortex/extraction-status/{id})
│   • Real-time status updates
│
├─► Processing States
│   │
│   ├─► "pending" - Queued
│   ├─► "processing" - AI extracting data
│   │   └─► Progress updates (0-100%)
│   ├─► "success" - Extraction complete
│   │   └─► Extracted data returned
│   └─► "error" - Extraction failed
│       └─► Error message displayed
│
└─► Apply Extracted Data
    • Map extracted values to form fields
    • User reviews and confirms
    • Pre-fill form with extracted data
```

**State Management:**

- `ExtractionStatusContext` - Manages SSE connection
- `useDataExtracts` hook - Extraction logic
- Progress tracked in real-time

**Components:**

- `DataExtractionCard.tsx` - Extraction UI
- `ExtractionProgress.tsx` - Progress indicator
- SSE endpoint: `/api/cortex/extraction-status/{submissionId}`

---

#### B. Answer Enhancement Flow

```
Answer Enhancement (Enhance Answer Feature)
│
├─► User Types Answer
│   • Text field with AI toggle
│
├─► Click "Enhance" Button
│   • Current answer sent to AI
│   • Question context included
│
├─► API Request
│   • POST /api/cortex/enhance-answer
│   • Body: { question, currentAnswer, context }
│
├─► AI Processing
│   ├─► Analyze current answer
│   ├─► Generate improvements
│   └─► Return enhanced version
│
├─► Display Enhanced Answer
│   • Side-by-side comparison
│   • Original vs Enhanced
│
└─► User Action
    ├─► Accept Enhancement
    │   └─► Replace field value
    ├─► Edit Enhancement
    │   └─► Modify before accepting
    └─► Reject Enhancement
        └─► Keep original value
```

**Components:**

- `EnhanceAnswerCard.tsx` - Enhancement UI
- `useEnhanceAnswer` hook - Enhancement logic
- `CustomTextWidget.tsx` - Widget with AI toggle

**API:**

- `cortexApi.enhanceAnswer(question, answer)`

---

#### C. AI Suggestions Flow

```
AI Suggestions
│
├─► Field Focus Event
│   • User clicks on field
│   • Field has AI enabled
│
├─► Fetch Suggestions
│   • POST /api/cortex/suggestions
│   • Context: form data, question type
│
├─► Display Suggestions
│   • Dropdown or card list
│   • Ranked by relevance
│
└─► User Selection
    ├─► Click Suggestion
    │   └─► Auto-fill field
    └─► Ignore
        └─► Continue manual entry
```

**Components:**

- `AIFeaturesCard.tsx` - Suggestions panel
- `useAISwitch` hook - AI feature toggle

---

### 5. **Form Dashboard Flow**

```
Form Dashboard (/dashboard)
│
├─► Load User Submissions
│   • GET /api/submissions/user/{userId}
│   • Returns list of all submissions
│
├─► Display Submission Cards
│   │
│   ├─► Draft Submissions
│   │   • Status: "draft"
│   │   • Action: Continue Editing
│   │
│   ├─► In Progress
│   │   • Status: "in-progress"
│   │   • Action: View/Edit
│   │
│   ├─► Under Review
│   │   • Status: "under-review"
│   │   • Action: View Only
│   │
│   └─► Completed
│       • Status: "completed"
│       • Action: View/Download
│
├─► Filter & Search
│   • By submission type
│   • By status
│   • By date range
│
└─► Actions
    ├─► View Submission Details
    ├─► Edit Draft
    ├─► Delete Draft
    └─► Download Submission
```

**Components:**

- `FormDashboard.tsx` - Dashboard page
- `SubmissionCard.tsx` - Individual submission card
- `FilterBar.tsx` - Filter controls

**State Management:**

- `UserSubmissionsContext` - Submission list
- Local state for filters

**APIs:**

- `submissionsApi.getUserSubmissions()`
- `submissionsApi.getSubmissionDetails(id)`

---

### 6. **Form Validation Flow**

```
Validation Pipeline
│
├─► Field-Level Validation (Real-time)
│   ├─► On Change Event
│   ├─► AJV Schema Validation
│   ├─► Custom Widget Validation
│   └─► Display Inline Errors
│
├─► Section-Level Validation
│   ├─► On Section Navigation
│   ├─► Validate all fields in section
│   └─► Block navigation if invalid
│
└─► Form-Level Validation (On Submit)
    ├─► Validate entire form
    ├─► Check required fields
    ├─► Validate dependencies
    ├─► Custom business rules
    │
    ├─► Valid: Proceed to submission
    └─► Invalid:
        ├─► Scroll to first error
        ├─► Highlight error fields
        └─► Display error summary
```

**Validation Libraries:**

- `@rjsf/validator-ajv8` - JSON Schema validation
- Custom validators in `utils/`

---

### 7. **Data Flow Architecture**

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │ User Actions
       ▼
┌─────────────────┐
│   Components    │ ◄─┐
│   (Pages/Forms) │   │ Props/State
└────────┬────────┘   │
         │             │
         │ Context API │
         ▼             │
┌─────────────────┐   │
│  State Manager  │ ──┘
│   (Contexts)    │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│  API Services   │
│  (BaseApiService)│
└────────┬────────┘
         │
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│   Backend API   │
│  (localhost:8080)│
└─────────────────┘
```

**Data Flow Principles:**

1. **Unidirectional Data Flow** - Data flows down via props/context
2. **Event Handlers Flow Up** - User actions flow up via callbacks
3. **Context for Global State** - Authentication, submissions, extraction status
4. **Local State for UI** - Form data, loading states, temporary UI state
5. **API Layer Abstraction** - All API calls through service classes

---

### 8. **Error Handling Flow**

```
Error Handling Strategy
│
├─► API Errors
│   ├─► Network Errors (timeout, connection)
│   │   └─► Retry mechanism (3 attempts)
│   ├─► 4xx Errors (client errors)
│   │   └─► Display user-friendly message
│   └─► 5xx Errors (server errors)
│       └─► Log error + Show generic message
│
├─► Validation Errors
│   ├─► Schema Validation Errors
│   │   └─► Inline field errors
│   └─► Business Logic Errors
│       └─► Toast notifications
│
├─► Authentication Errors
│   ├─► 401 Unauthorized
│   │   └─► Redirect to login
│   └─► 403 Forbidden
│       └─► Show access denied message
│
└─► Runtime Errors
    ├─► React Error Boundaries
    │   └─► Fallback UI
    └─► Console Logging
        └─► Development diagnostics
```

**Error Components:**

- `ErrorBoundary.tsx` - Catch React errors
- Toast notifications via LDS `useToastContext`
- Inline validation messages

---

### 9. **Performance Optimization Flow**

```
Performance Strategies
│
├─► Code Splitting
│   • Route-based lazy loading
│   • React.lazy() + Suspense
│   • Dynamic imports
│
├─► State Management
│   • Context splitting (avoid re-renders)
│   • useMemo for expensive calculations
│   • useCallback for function memoization
│
├─► Asset Optimization
│   • Image lazy loading
│   • CSS module code splitting
│   • Tree shaking (Vite)
│
├─► API Optimization
│   • Request debouncing (auto-save)
│   • Response caching
│   • Pagination for large lists
│
└─► Build Optimization
    • Minification
    • Gzip compression (nginx)
    • CDN for static assets
```

---

### 10. **Security Flow**

```
Security Measures
│
├─► Authentication
│   • JWT token-based auth
│   • Token stored securely
│   • Auto-refresh on expiry
│
├─► Authorization
│   • Role-based access control
│   • Protected routes
│   • API endpoint permissions
│
├─► Data Protection
│   • HTTPS only (production)
│   • XSS prevention (React escaping)
│   • CSRF tokens
│   • Content Security Policy
│
└─► File Upload Security
    • File type validation
    • Size limits (10MB default)
    • Virus scanning (backend)
    • S3 secure storage
```

---

## Directory Structure

```
sage_ai_fe/
├── src/
│   ├── assets/                    # Static assets (images, icons)
│   ├── components/                # Reusable UI components
│   │   ├── AIFeaturesCard/       # AI features panel
│   │   ├── Badge/                # Status badges
│   │   ├── EnhanceAnswerCard/    # AI answer enhancement UI
│   │   ├── FormCard/             # Form display cards
│   │   ├── FormContainer/        # Form wrapper with logic
│   │   ├── LoadingSpinner/       # Loading indicators
│   │   ├── UserFeedback/         # Feedback component
│   │   ├── widgets/              # Custom form widgets
│   │   │   ├── components/       # Individual widget implementations
│   │   │   ├── hooks/            # Widget-specific hooks
│   │   │   └── utils/            # Widget utilities
│   │   └── templates.tsx         # Form templates
│   ├── contexts/                 # React Context providers
│   │   ├── AIFeaturesContext.tsx
│   │   ├── ExtractionStatusContext.tsx
│   │   ├── UserContext.tsx
│   │   └── UserSubmissionsContext.tsx
│   ├── core/                     # Core business logic
│   │   ├── api/                  # API service layer
│   │   │   ├── base.api.ts      # Base API service class
│   │   │   ├── forms.api.ts     # Form-related APIs
│   │   │   ├── upload.api.ts    # File upload APIs
│   │   │   ├── cortex.api.ts    # AI/ML service APIs
│   │   │   └── ...
│   │   ├── models/               # TypeScript interfaces & types
│   │   │   ├── form.model.ts
│   │   │   ├── user.model.ts
│   │   │   └── ...
│   │   ├── utils/                # Utility functions
│   │   │   ├── form-mapper.util.ts
│   │   │   ├── text-validation.util.ts
│   │   │   └── ...
│   │   └── constants.ts          # Application constants
│   ├── hooks/                    # Custom React hooks
│   │   ├── useDataExtracts.ts
│   │   ├── useEnhanceAnswer.ts
│   │   └── scoreResponse.tsx
│   ├── pages/                    # Page-level components (routes)
│   │   ├── Landing/
│   │   ├── BeginSubmission/
│   │   ├── IdeaSubmission/
│   │   ├── AIRegistryForm/
│   │   ├── FormDashboard/
│   │   └── ...
│   ├── routes/                   # Routing configuration
│   │   └── AppRoutes.tsx
│   ├── shared/                   # Shared resources
│   │   └── styles/               # Global styles & variables
│   ├── test/                     # Test configuration
│   │   └── setup.ts
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Application entry point
│   └── index.scss                # Global styles
├── public/                        # Static public assets
├── __mocks__/                     # Test mocks
├── lilly-packages/                # Local Lilly packages
├── .env                           # Environment variables
├── vite.config.ts                 # Vite configuration
├── vitest.config.ts               # Vitest test configuration
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.js               # ESLint configuration
├── .prettierrc.js                 # Prettier configuration
├── package.json                   # Dependencies & scripts
└── README.md                      # Project documentation
```

---

## Architecture Patterns

### 1. **Layered Architecture**

```
┌─────────────────────────────────────┐
│   Presentation Layer (Pages)        │
├─────────────────────────────────────┤
│   Component Layer (UI Components)   │
├─────────────────────────────────────┤
│   State Management (Contexts/Hooks) │
├─────────────────────────────────────┤
│   Business Logic (Core/Utils)       │
├─────────────────────────────────────┤
│   Data Layer (API Services)         │
└─────────────────────────────────────┘
```

### 2. **Component Structure**

#### Component Organization Pattern

Each major component follows this structure:

```
ComponentName/
├── ComponentName.tsx        # Main component
├── ComponentName.module.scss # Component styles
├── ComponentName.test.tsx   # Unit tests
├── types.ts                 # Component-specific types
├── hooks/                   # Component-specific hooks
└── index.ts                 # Public exports
```

#### Widget Component Pattern

Custom form widgets follow a modular pattern:

```
widgets/
├── widgets.tsx                      # Main widget exports
├── components/                      # Individual widgets
│   ├── CustomTextWidget.tsx
│   ├── CustomFileWidget.tsx
│   ├── FieldWrapper.tsx            # Common wrapper
│   └── ...
├── hooks/                           # Widget hooks
│   ├── useAISwitch.ts
│   ├── useFieldPreselection.ts
│   └── useFileUpload.ts
└── utils/                           # Widget utilities
    └── helpers.ts
```

### 3. **API Service Pattern**

All API services extend `BaseApiService`:

```typescript
// base.api.ts
export class BaseApiService {
  protected api: AxiosInstance

  constructor(endpoint: string, config?: AxiosRequestConfig) {
    this.api = axios.create({
      baseURL: `/api/${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000,
    })
  }

  protected async get<T>(url?: string, config?: AxiosRequestConfig)
  protected async post<T>(url?: string, data?: any, config?: AxiosRequestConfig)
  protected async put<T>(url?: string, data?: any, config?: AxiosRequestConfig)
  protected async delete<T>(url?: string, config?: AxiosRequestConfig)
}

// forms.api.ts
export class FormsApiService extends BaseApiService {
  constructor() {
    super('forms')
  }

  async getFormSchema(formId: string) {
    return this.get<FormSchema>(`/${formId}`)
  }
}

export const formsApi = new FormsApiService()
```

### 4. **Context Pattern**

Contexts are used for global state management:

```typescript
// Context structure
interface ContextState {
  // State properties
}

interface ContextActions {
  // Action methods
}

const Context = createContext<ContextState & ContextActions | undefined>(undefined)

export const ContextProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<ContextState>(initialState)

  const actions = {
    // Action implementations
  }

  return (
    <Context.Provider value={{ ...state, ...actions }}>
      {children}
    </Context.Provider>
  )
}

export const useContext = () => {
  const context = useContext(Context)
  if (!context) throw new Error('useContext must be used within Provider')
  return context
}
```

---

## Code Standards & Conventions

### TypeScript Standards

#### 1. **Type Definitions**

- Use `interface` for object shapes
- Use `type` for unions, intersections, and primitives
- Use `enum` for fixed sets of named constants

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
}

type UserRole = 'admin' | 'user' | 'reviewer'

enum FormStatus {
  Draft = 'draft',
  InProgress = 'in-progress',
  Submitted = 'submitted',
  Completed = 'completed',
}

// ❌ Avoid
type User = {
  // Use interface instead
  id: string
}
```

#### 2. **Function Signatures**

```typescript
// ✅ Explicit return types
function getUserById(id: string): Promise<User> {
  return userApi.get(id)
}

// ✅ Arrow functions with types
const processForm = async (data: FormData): Promise<FormResponse> => {
  return formsApi.submit(data)
}

// ✅ Generic functions
function mapArray<T, U>(array: T[], mapper: (item: T) => U): U[] {
  return array.map(mapper)
}
```

#### 3. **Null Handling**

```typescript
// ✅ Use optional chaining
const userName = user?.profile?.name

// ✅ Nullish coalescing
const displayName = userName ?? 'Guest'

// ✅ Type guards
if (response && 'data' in response) {
  // TypeScript knows response has data
}
```

### Naming Conventions

```typescript
// Components: PascalCase
const UserProfile = () => {}
const AIFeaturesCard = () => {}

// Hooks: camelCase with 'use' prefix
const useUserData = () => {}
const useFormValidation = () => {}

// Functions: camelCase
const getUserData = () => {}
const validateForm = () => {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_FILE_SIZE = 10485760

// Interfaces: PascalCase (no 'I' prefix)
interface FormData {}
interface ApiResponse {}

// Types: PascalCase
type UserRole = 'admin' | 'user'
type FormStatus = 'draft' | 'submitted'

// Enums: PascalCase
enum FormType {
  IdeaSubmission = 'idea_submission',
  AIRegistry = 'ai_registry',
}

// CSS Modules: camelCase
import styles from './Component.module.scss'
const className = styles.containerWrapper
```

### File Naming Conventions

```
Components:       PascalCase.tsx         (UserProfile.tsx)
Pages:           PascalCase.tsx         (BeginSubmission.tsx)
Hooks:           camelCase.ts           (useDataExtracts.ts)
Utils:           kebab-case.util.ts     (form-mapper.util.ts)
Models:          kebab-case.model.ts    (user.model.ts)
APIs:            kebab-case.api.ts      (forms.api.ts)
Tests:           *.test.tsx or *.spec.tsx
Styles:          *.module.scss or *.scss
Constants:       kebab-case.ts          (constants.ts)
```

### Import Organization

ESLint enforces import sorting via `simple-import-sort`:

```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// 2. Internal absolute imports (@/* paths)
import { userApi } from '@/core/api/user.api'
import { FormData } from '@/core/models/form.model'
import { UserContext } from '@/contexts/UserContext'

// 3. Relative imports
import styles from './Component.module.scss'
import { helper } from './utils/helpers'

// 4. Type-only imports (if needed)
import type { User } from '@/core/models/user.model'
```

### Code Formatting (Prettier)

```javascript
// .prettierrc.js configuration
{
  semi: false,              // No semicolons
  singleQuote: true,        // Single quotes
  trailingComma: 'es5',     // Trailing commas where valid
  tabWidth: 2,              // 2-space indentation
  printWidth: 80,           // 80 character line limit
  arrowParens: 'avoid',     // Omit parens when possible
  bracketSpacing: true,     // Space in object literals
  endOfLine: 'auto'         // Auto line endings
}
```

Example formatted code:

```typescript
// ✅ Formatted
const getUserData = async (userId: string) => {
  const response = await userApi.get(userId)
  return response
}

const config = { timeout: 5000, retry: 3 }

// ❌ Unformatted (will be auto-fixed)
const getUserData = async (userId: string) => {
  const response = await userApi.get(userId)
  return response
}
```

### ESLint Rules

Key rules enforced:

```javascript
rules: {
  'react/react-in-jsx-scope': 'off',           // No React import needed (React 17+)
  'react/prop-types': 'off',                   // TypeScript handles prop validation
  '@typescript-eslint/no-explicit-any': 'warn', // Warn on 'any' usage
  '@typescript-eslint/no-unused-vars': 'warn',  // Warn on unused variables
  'simple-import-sort/imports': 'error',       // Enforce import order
  'simple-import-sort/exports': 'error'        // Enforce export order
}
```

### Comment Standards

```typescript
/**
 * JSDoc for public APIs and complex functions
 *
 * @param userId - The unique user identifier
 * @param options - Optional configuration
 * @returns Promise resolving to user data
 * @throws {ApiError} When user is not found
 */
async function getUserProfile(
  userId: string,
  options?: RequestOptions
): Promise<UserProfile> {
  // Implementation details
}

// Single-line comments for inline explanations
const maxRetries = 3 // Retry up to 3 times before failing

// TODO comments for future work
// TODO: Implement caching mechanism for user data
// FIXME: Handle edge case when userId is empty
```

---

## Component Guidelines

### Functional Components

All components use functional components with hooks:

```typescript
// ✅ Functional component with TypeScript
import React, { useState, useEffect } from 'react'

interface UserCardProps {
  userId: string
  onUpdate?: (user: User) => void
}

export const UserCard: React.FC<UserCardProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userApi.get(userId)
        setUser(data)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) return <LoadingSpinner />
  if (!user) return <div>User not found</div>

  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

### Custom Hooks

Extract reusable logic into custom hooks:

```typescript
// hooks/useUserData.ts
export const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const data = await userApi.get(userId)
        setUser(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  return { user, loading, error }
}

// Usage in component
const UserProfile = ({ userId }) => {
  const { user, loading, error } = useUserData(userId)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return <div>{user?.name}</div>
}
```

### Props Interface Pattern

```typescript
// Base props interface
interface BaseComponentProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

// Extend base props
interface ButtonProps extends BaseComponentProps {
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

// Union types for conditional props
type ConditionalProps =
  | { type: 'submit'; onSubmit: () => void }
  | { type: 'button'; onClick: () => void }

// Component with conditional props
const Button: React.FC<ButtonProps & ConditionalProps> = props => {
  // Implementation
}
```

### Component Export Patterns

```typescript
// Default export for main component
export default UserProfile

// Named exports for related utilities
export { UserCard, UserAvatar, UserBadge }

// Re-export from index.ts
// index.ts
export { default as UserProfile } from './UserProfile'
export { UserCard, UserAvatar } from './components'
export type { UserProfileProps } from './types'
```

---

## State Management

### Context Usage

Four main contexts manage global state:

#### 1. **UserContext**

```typescript
// Manages authenticated user data
interface UserContextState {
  user: UserProfile | null
  loading: boolean
  error: Error | null
}

// Usage
const { user, loading } = useUser()
```

#### 2. **AIFeaturesContext**

```typescript
// Manages AI feature visibility and state
interface AIFeaturesState {
  isVisible: boolean
  currentQuestion: string
  inputValue: string
  showAIFeatures: (question: string, id: string, dataOnly: boolean) => void
  hideAIFeatures: () => void
}

// Usage
const { showAIFeatures, hideAIFeatures } = useAIFeatures()
```

#### 3. **ExtractionStatusContext**

```typescript
// Manages document extraction status via SSE
interface ExtractionStatusState {
  extractionStatus: 'pending' | 'processing' | 'success' | 'error'
  progress: number
  startPolling: (submissionId: string) => void
  stopPolling: () => void
}

// Usage
const { extractionStatus, progress } = useExtractionStatus()
```

#### 4. **UserSubmissionsContext**

```typescript
// Manages user's submission list
interface UserSubmissionsState {
  submissions: Submission[]
  fetchSubmissions: () => Promise<void>
}

// Usage
const { submissions, fetchSubmissions } = useUserSubmissions()
```

### Local State Management

Use `useState` for component-local state:

```typescript
const [formData, setFormData] = useState<FormData>({})
const [errors, setErrors] = useState<Record<string, string>>({})
const [isSubmitting, setIsSubmitting] = useState(false)
```

Use `useReducer` for complex state logic:

```typescript
type Action =
  | { type: 'SET_FIELD'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'RESET' }

const formReducer = (state: FormState, action: Action): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const [state, dispatch] = useReducer(formReducer, initialState)
```

---

## API Integration

### Overview

The Sage AI Frontend integrates with the backend Python/FastAPI service through a well-structured API layer. All communication uses REST APIs with JSON payloads, except for file uploads (multipart/form-data) and real-time updates (Server-Sent Events).

**Backend Service:** `sage_ai_be` (FastAPI + Python)  
**Frontend Service:** `sage_ai_fe` (React + TypeScript + Vite)

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                      │
│                                                                   │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐│
│  │   Components   │───►│  API Services  │───►│  HTTP Client   ││
│  │  (UI Layer)    │◄───│  (Business)    │◄───│    (Axios)     ││
│  └────────────────┘    └────────────────┘    └────────────────┘│
│                              │                        │          │
└──────────────────────────────┼────────────────────────┼──────────┘
                               │                        │
                               │ /api/...               │
                               ▼                        ▼
                        ┌─────────────────────────────────┐
                        │   Vite Dev Proxy (Dev Only)     │
                        │   Proxies /api/* requests to    │
                        │   http://localhost:8080         │
                        └─────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│              Backend (FastAPI + Python)                           │
│              Running on port 8080                                 │
│                                                                   │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐│
│  │  API Routes    │───►│   Handlers     │───►│   Services     ││
│  │  (Endpoints)   │◄───│  (Business     │◄───│  (Data/AI)     ││
│  │                │    │   Logic)       │    │                ││
│  └────────────────┘    └────────────────┘    └────────────────┘│
│         │                      │                      │          │
│         ▼                      ▼                      ▼          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Database (PostgreSQL)                        │  │
│  │              AI Services (Cortex, OpenAI)                 │  │
│  │              Storage (S3/Local)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Base API Service

**Location:** `src/core/api/base.api.ts`

All API services inherit from `BaseApiService`, which provides:
- Centralized Axios configuration
- Consistent error handling
- Request/response interceptors
- Type-safe HTTP methods

```typescript
export class BaseApiService {
  protected api: AxiosInstance

  constructor(endpoint: string, config?: AxiosRequestConfig) {
    this.api = axios.create({
      baseURL: `/api/${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000, // 5 minutes (prevents browser timeout)
    })
    this.setInterceptors()
  }

  protected async get<T>(url?: string, config?: AxiosRequestConfig): Promise<T>
  protected async post<T>(data?: any, url?: string, config?: AxiosRequestConfig): Promise<T>
  protected async put<T>(data?: any, url?: string, config?: AxiosRequestConfig): Promise<T>
  protected async patch<T>(data?: any, url?: string, config?: AxiosRequestConfig): Promise<T>
  protected async delete<T>(url?: string, config?: AxiosRequestConfig): Promise<T>
  
  protected handleError(error: unknown): ApiError {
    // Centralized error transformation
  }
}
```

**Key Features:**

- **Base URL Pattern:** `/api/{endpoint}` - automatically proxied to backend
- **Timeout:** 5 minutes to handle long-running AI operations
- **Content-Type:** `application/json` (default, overridden for file uploads)
- **Interceptors:** Request/response transformations and error handling

---

### Development Proxy Configuration

**Location:** `vite.config.ts`

In development mode, Vite proxies all `/api/*` requests to the backend server:

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Keeps /api prefix as backend expects it
      },
    },
  },
})
```

**How it works:**

1. Frontend makes request to `/api/users/user_info`
2. Vite proxy intercepts and forwards to `http://localhost:8080/api/users/user_info`
3. Backend processes request and returns response
4. Vite proxy returns response to frontend

**Production Setup:**

In production, Nginx handles the proxying:
- Frontend: `https://lilly-sage-ai.dev.bu.lilly.com`
- Backend API: `https://lilly-sage-ai.dev.bu.lilly.com/api`

---

### API Services Overview

**Location:** `src/core/api/`

The frontend implements 15+ specialized API service classes, each handling a specific domain:

| Service | Endpoint Base | Purpose |
|---------|--------------|---------|
| `UserApi` | `/api/users` | User authentication and profile |
| `FormsApi` | `/api/forms` | Form schemas, submission, validation |
| `UploadService` | `/api/forms` | File upload and validation |
| `DashboardApi` | `/api/dashboard` | Analytics and metrics |
| `FormDashboardApi` | `/api/form-dashboard` | User submissions list |
| `CortexApiService` | `/api/cortex` | Document data extraction |
| `EnhanceAnswerApi` | `/api/enhance-answer` | AI answer enhancement |
| `ReviewAnswerApi` | `/api/review-answer` | AI answer review/validation |
| `SuggestionsApi` | `/api/suggestions` | AI field suggestions |
| `NoveltyScoreApi` | `/api/novelty-score` | Idea novelty scoring |
| `ScoreApi` | `/api/score` | Answer quality scoring |
| `UserFeedbackApi` | `/api/user-feedback` | User feedback tracking |
| `ServiceNowApi` | `/api/servicenow` | ServiceNow integration |
| `DocumentExtractionStatusApi` | `/api/progress` | SSE status updates |
| `AiInteractionApi` | `/api/ai-interactions` | AI usage tracking |

---

### API Service Implementation Examples

#### 1. User API

**File:** `src/core/api/user.api.ts`  
**Backend Route:** `sage_ai_be/data_service/routes/user_routes.py`

```typescript
class UserApi extends BaseApiService {
  constructor() {
    super('users')
  }

  async getUserInfo(): Promise<UserProfile> {
    return this.get<UserProfile>('/user_info')
  }
}

export const userApi = new UserApi()
```

**Backend Endpoint:**
```python
@router.get("/user_info", response_model=UserProfile)
async def get_user_info(current_user: dict = Depends(get_current_user)):
    return await user_service.get_user_profile(current_user)
```

**Usage in Component:**
```typescript
import { userApi } from '@/core/api/user.api'

const MyComponent = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await userApi.getUserInfo()
        setUser(profile)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])
  
  return <div>Welcome, {user?.name}</div>
}
```

---

#### 2. Forms API

**File:** `src/core/api/forms.api.ts`  
**Backend Routes:** `sage_ai_be/data_service/routes/form_routes.py`

```typescript
class FormApi extends BaseApiService {
  constructor() {
    super('forms')
  }

  async getFormSchema(
    formSchema: ExtendedFormDashboardFormType
  ): Promise<FormSchemaResponse> {
    // Currently returns local JSON schemas
    // TODO: Replace with actual API call to backend
    return localSchemas[formSchema]
  }

  async getFormDetails(
    formId: string,
    submissionId: string
  ): Promise<FormDetailsResponse> {
    return this.get(
      `/get-form-details?form-id=${formId}&submission-id=${submissionId}`
    )
  }

  async submitForm(
    formId: string,
    submissionId: string,
    payload: FormSubmitRequest,
    files?: File[]
  ): Promise<FormSubmitResponse> {
    const formData = new FormData()
    formData.append('form_data', JSON.stringify(payload.form_data))
    formData.append('action', payload.action)
    
    files?.forEach(file => formData.append('files', file))
    
    return this.put(
      formData,
      `/submit-form?form-id=${formId}&submission-id=${submissionId}`,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }
}

export const formsApi = new FormApi()
```

**Backend Endpoints:**
```python
@router.get("/get-form-details")
async def get_form_details(form_id: str, submission_id: str):
    return await form_service.get_details(form_id, submission_id)

@router.put("/submit-form")
async def submit_form(
    form_id: str,
    submission_id: str,
    form_data: str = Form(...),
    action: str = Form(...),
    files: List[UploadFile] = File(None)
):
    return await form_service.submit_form(
        form_id, submission_id, form_data, action, files
    )
```

---

#### 3. Upload API

**File:** `src/core/api/upload.api.ts`  
**Backend Route:** `sage_ai_be/data_service/routes/form_routes.py`

```typescript
export class UploadService extends BaseApiService {
  constructor() {
    super('forms')
  }

  async initialSubmissionBegin(
    formData: BeginFormRequestModel
  ): Promise<BeginFormResponseModel> {
    const formDataPayload = new FormData()
    
    // Append metadata as JSON string
    formDataPayload.append(
      'submission_journey',
      JSON.stringify(formData.submission_journey)
    )
    
    // Append files
    formData.files.forEach(file => {
      formDataPayload.append('files', file)
    })

    const response = await this.api.post<BeginFormResponseModel>(
      'submit-idea',
      formDataPayload,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data
  }

  validateMultipleFiles(
    files: File[],
    maxTotalSizeInMB: number = 10
  ): { valid: boolean; errors: { error: string }[] } {
    const errors: { error: string }[] = []
    const maxTotalSizeInBytes = maxTotalSizeInMB * 1024 * 1024
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    
    let totalFileSize = 0
    for (const file of files) {
      totalFileSize += file.size
      if (!allowedTypes.includes(file.type)) {
        errors.push({
          error: `${file.name} not allowed. Only .docx/.doc/.pdf/.pptx files are allowed.`,
        })
      }
    }

    if (totalFileSize > maxTotalSizeInBytes) {
      errors.push({
        error: `Total file size exceeds ${maxTotalSizeInMB}MB limit`,
      })
    }

    return { valid: errors.length === 0, errors }
  }
}

export const uploadService = new UploadService()
```

**Backend Endpoint:**
```python
@router.post("/submit-idea")
async def submit_idea(
    submission_journey: str = Form(...),
    files: List[UploadFile] = File(...)
):
    journey_data = json.loads(submission_journey)
    uploaded_files = await file_service.save_files(files)
    submission = await submission_service.create_submission(
        journey_data, uploaded_files
    )
    return {
        "message": "Submission created successfully",
        "data": {"id": submission.id, "categoryId": submission.category_id}
    }
```

---

#### 4. AI Features APIs

##### A. Document Extraction (Cortex API)

**File:** `src/core/api/cortex.api.ts`  
**Backend Route:** `sage_ai_be/data_service/routes/cortex_routes.py`

```typescript
class CortexApiService extends BaseApiService {
  constructor() {
    super('cortex')
  }

  async getDocExtracts(
    submissionId: string,
    formId: string,
    questionId: string
  ): Promise<GetDocExtractsResponse> {
    return this.get<GetDocExtractsResponse>(
      `/get-doc-extracts?submission-id=${submissionId}&form-id=${formId}&question-id=${questionId}`
    )
  }
}

export const cortexApiService = new CortexApiService()
```

**Backend Endpoint:**
```python
@router.get("/get-doc-extracts")
async def get_doc_extracts(
    submission_id: str,
    form_id: str,
    question_id: str
):
    return await cortex_service.extract_from_documents(
        submission_id, form_id, question_id
    )
```

---

##### B. Answer Enhancement API

**File:** `src/core/api/enhance-answer.api.ts`  
**Backend Route:** `sage_ai_be/data_service/routes/enhance_answer_routes.py`

```typescript
class EnhanceAnswerApi extends BaseApiService {
  constructor() {
    super('enhance-answer')
  }

  async enhanceAnswer(
    answerText: string,
    questionId: string,
    submissionId?: string,
    formId?: string,
    formData?: Record<string, any>[]
  ): Promise<EnhanceAnswerResponse> {
    const payload: EnhanceAnswerRequest = {
      question_id: questionId,
      user_text: answerText,
      submission_id: submissionId || null,
      form_id: formId || null,
      form_data: formData || null,
    }
    return this.post<EnhanceAnswerResponse, EnhanceAnswerRequest>(payload, '')
  }
}

export const enhanceAnswerApi = new EnhanceAnswerApi()
```

**Backend Endpoint:**
```python
@router.post("/")
async def enhance_answer(request: EnhanceAnswerRequest):
    enhanced = await ai_service.enhance_answer(
        request.question_id,
        request.user_text,
        request.submission_id,
        request.form_id,
        request.form_data
    )
    return EnhanceAnswerResponse(enhanced_text=enhanced)
```

---

##### C. Suggestions API

**File:** `src/core/api/suggestions.api.ts`  
**Backend Route:** `sage_ai_be/data_service/routes/suggestions_routes.py`

```typescript
class SuggestionsApi extends BaseApiService {
  constructor() {
    super('suggestions')
  }

  async getSuggestions(
    questionId: string,
    formId: string,
    submissionId?: string,
    formData?: Record<string, any>[]
  ): Promise<SuggestionsResponse> {
    const payload: SuggestionsRequest = {
      question_id: questionId,
      form_id: formId,
      submission_id: submissionId || null,
      form_data: formData || null,
    }
    return this.post<SuggestionsResponse, SuggestionsRequest>(payload, '')
  }
}

export const suggestionsApi = new SuggestionsApi()
```

---

#### 5. Real-Time Updates (Server-Sent Events)

**File:** `src/core/api/document-extraction-status.api.ts`  
**Backend Route:** `sage_ai_be/data_service/routes/progress_routes.py`

```typescript
class DocumentExtractionStatusApi extends BaseApiService {
  constructor() {
    super('progress')
  }

  connectSSE(
    submissionId: string,
    onEvent: (event: { status?: string; message?: string }) => void,
    opts?: { email?: string; withCredentials?: boolean }
  ): () => void {
    const base = this.api.defaults.baseURL || ''
    const headers = this.api.defaults.headers || {}
    const email = opts?.email || headers['X-WEBAUTH-EMAIL'] || ''
    
    const url = `${base}/stream/${submissionId}?email=${encodeURIComponent(email)}`
    const eventSource = new EventSource(url, {
      withCredentials: opts?.withCredentials ?? false,
    })

    let shouldClose = false

    eventSource.onmessage = (evt: MessageEvent) => {
      if (shouldClose) return
      
      try {
        const payload = JSON.parse(evt.data)
        const isTerminalStatus = ['success', 'failed', 'completed'].includes(
          payload.status
        )
        
        if (isTerminalStatus) {
          shouldClose = true
          onEvent(payload)
          eventSource.close()
          return
        }
        
        onEvent(payload)
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE error', err)
      if (shouldClose || eventSource.readyState === EventSource.CLOSED) {
        eventSource.close()
      }
    }

    // Return disconnect function
    return () => {
      shouldClose = true
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close()
      }
    }
  }
}

export const documentExtractionStatusApi = new DocumentExtractionStatusApi()
```

**Backend Endpoint:**
```python
@router.get("/stream/{submission_id}")
async def stream_progress(
    submission_id: str,
    email: str = Query(...),
    request: Request = None
):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            
            status = await progress_service.get_status(submission_id)
            yield {
                "data": json.dumps({
                    "status": status.status,
                    "message": status.message,
                    "progress": status.progress
                })
            }
            
            if status.status in ["success", "failed", "completed"]:
                break
                
            await asyncio.sleep(1)
    
    return EventSourceResponse(event_generator())
```

**Usage in Context:**
```typescript
import { documentExtractionStatusApi } from '@/core/api/document-extraction-status.api'

export const ExtractionStatusProvider = ({ children }) => {
  const [status, setStatus] = useState<string>('idle')
  
  const startMonitoring = (submissionId: string) => {
    const disconnect = documentExtractionStatusApi.connectSSE(
      submissionId,
      (event) => {
        setStatus(event.status || 'unknown')
        if (['success', 'failed', 'completed'].includes(event.status)) {
          disconnect()
        }
      }
    )
    
    return disconnect
  }
  
  return (
    <ExtractionStatusContext.Provider value={{ status, startMonitoring }}>
      {children}
    </ExtractionStatusContext.Provider>
  )
}
```

---

### Error Handling

All API services use centralized error handling through `BaseApiService`:

```typescript
protected handleError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      isAxiosError: true,
      original: error,
    }
  }
  
  return {
    message: error instanceof Error ? error.message : 'Unknown error',
    isAxiosError: false,
    original: error,
  }
}
```

**Error Interface:**
```typescript
interface ApiError {
  status?: number
  message: string
  data?: unknown
  isAxiosError: boolean
  original: unknown
}
```

**Component Error Handling:**
```typescript
try {
  const data = await formsApi.submitForm(formId, submissionId, payload)
  // Handle success
  toast.success('Form submitted successfully!')
  navigate('/dashboard')
} catch (error) {
  const apiError = error as ApiError
  
  if (apiError.status === 400) {
    toast.error('Invalid form data. Please check your inputs.')
  } else if (apiError.status === 404) {
    toast.error('Form not found.')
  } else if (apiError.status === 500) {
    toast.error('Server error. Please try again later.')
  } else {
    toast.error(apiError.message || 'An unexpected error occurred.')
  }
}
```

---

### Request/Response Flow Examples

#### Example 1: User Login Flow

```
1. User enters credentials
   ↓
2. Component calls userApi.login()
   ↓
3. POST /api/users/login
   Body: { email, password }
   ↓
4. Vite proxy forwards to http://localhost:8080/api/users/login
   ↓
5. Backend validates credentials
   ↓
6. Backend returns JWT token + user profile
   Response: { token, user: { id, name, email, role } }
   ↓
7. Frontend stores token in localStorage
   ↓
8. Frontend updates UserContext
   ↓
9. User redirected to dashboard
```

#### Example 2: Form Submission with File Upload

```
1. User fills form and attaches files
   ↓
2. Component validates files using uploadService.validateMultipleFiles()
   ↓
3. Component calls formsApi.submitForm()
   ↓
4. Create FormData object:
   - Append form_data as JSON string
   - Append action ('submit')
   - Append each file
   ↓
5. PUT /api/forms/submit-form?form-id=X&submission-id=Y
   Content-Type: multipart/form-data
   ↓
6. Backend receives multipart request
   ↓
7. Backend saves files to S3
   ↓
8. Backend stores form data in PostgreSQL
   ↓
9. Backend triggers RPA automation (if applicable)
   ↓
10. Backend returns success response
    Response: { success: true, message: "Form submitted" }
    ↓
11. Frontend shows success message
    ↓
12. Frontend navigates to dashboard
```

#### Example 3: AI Document Extraction with SSE

```
1. User uploads documents
   ↓
2. Component calls uploadService.initialSubmissionBegin()
   ↓
3. POST /api/forms/submit-idea
   Content-Type: multipart/form-data
   ↓
4. Backend saves files and creates submission
   Response: { message: "Created", data: { id: "sub-123" } }
   ↓
5. Component calls documentExtractionStatusApi.connectSSE("sub-123")
   ↓
6. EventSource connection established to /api/progress/stream/sub-123
   ↓
7. Backend starts document extraction (AI processing)
   ↓
8. Backend sends SSE updates every second:
   - { status: "pending", progress: 0 }
   - { status: "processing", progress: 25 }
   - { status: "processing", progress: 50 }
   - { status: "processing", progress: 75 }
   - { status: "success", progress: 100, data: {...} }
   ↓
9. Frontend updates UI with progress
   ↓
10. Terminal status received → EventSource closed
    ↓
11. Frontend displays extracted data in form fields
```

---

### API Response Type Safety

All APIs use TypeScript interfaces for request/response types:

**Location:** `src/core/models/`

```typescript
// form.model.ts
export interface FormSubmitRequest {
  form_data: Record<string, unknown>
  action: string
}

export interface FormSubmitResponse {
  success: boolean
  message: string
  data?: unknown
}

// enhance-answer.model.ts
export interface EnhanceAnswerRequest {
  question_id: string
  user_text: string
  submission_id?: string | null
  form_id?: string | null
  form_data?: Record<string, any>[] | null
}

export interface EnhanceAnswerResponse {
  enhanced_text: string
  model_used?: string
  tokens_used?: number
}

// user.model.ts
export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  department: string
  title: string
  anyIdeasSubmitted: string
}
```

---

### Backend Route Structure Reference

**Backend Project:** `sage_ai_be/data_service/routes/`

| Route File | Frontend API Service | Endpoints |
|------------|---------------------|-----------|
| `user_routes.py` | `user.api.ts` | `/api/users/user_info` |
| `form_routes.py` | `forms.api.ts`, `upload.api.ts` | `/api/forms/*` |
| `cortex_routes.py` | `cortex.api.ts` | `/api/cortex/*` |
| `enhance_answer_routes.py` | `enhance-answer.api.ts` | `/api/enhance-answer` |
| `review_answer_routes.py` | `review-answer.api.ts` | `/api/review-answer` |
| `suggestions_routes.py` | `suggestions.api.ts` | `/api/suggestions` |
| `progress_routes.py` | `document-extraction-status.api.ts` | `/api/progress/stream/*` |
| `dashboard_routes.py` | `dashboard.api.ts` | `/api/dashboard/*` |
| `form_dashboard_routes.py` | `form-dashboard.api.ts` | `/api/form-dashboard/*` |

---

### Best Practices

1. **Always use singleton exports:** `export const userApi = new UserApi()`
2. **Use TypeScript interfaces for all payloads:** Ensures type safety
3. **Handle errors consistently:** Use centralized error handling
4. **Validate files before upload:** Use `validateMultipleFiles()` method
5. **Close SSE connections:** Always call disconnect function when done
6. **Use appropriate Content-Type:** `application/json` for JSON, `multipart/form-data` for files
7. **Add loading states:** Show spinners during API calls
8. **Implement retry logic:** For transient failures (optional)
9. **Cache responses:** Use React Query or similar for caching (future enhancement)
10. **Test API services:** Write unit tests for each API method

---

### File Upload Pattern

```typescript
// Step 1: Validate files
const validation = uploadService.validateMultipleFiles(files, 10) // 10MB limit
if (!validation.valid) {
  validation.errors.forEach(err => toast.error(err.error))
  return
}

// Step 2: Prepare payload
const payload: BeginFormRequestModel = {
  submission_journey: {
    category: selectedCategory,
    user_id: user.id,
    metadata: { ... }
  },
  files: files
}

// Step 3: Upload
try {
  const response = await uploadService.initialSubmissionBegin(payload)
  const submissionId = response.data.id
  
  // Step 4: Navigate to form with submissionId
  navigate(`/form/${response.data.categoryId}?submission=${submissionId}`)
} catch (error) {
  toast.error('Upload failed')
}
```

---

## Testing Strategy

### Unit Testing with Vitest

Configuration in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{js,ts}',
      ],
    },
  },
})
```

### Testing Patterns

#### 1. **Component Testing**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  it('renders user information', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com' }
    render(<UserCard user={user} />)

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('calls onUpdate when button clicked', () => {
    const onUpdate = vi.fn()
    render(<UserCard user={mockUser} onUpdate={onUpdate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Update' }))

    expect(onUpdate).toHaveBeenCalledWith(mockUser)
  })
})
```

#### 2. **Hook Testing**

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useUserData } from './useUserData'

vi.mock('@/core/api/user.api', () => ({
  userApi: {
    get: vi.fn().mockResolvedValue({ id: '1', name: 'John' }),
  },
}))

describe('useUserData', () => {
  it('fetches user data', async () => {
    const { result } = renderHook(() => useUserData('1'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual({ id: '1', name: 'John' })
    })
  })
})
```

#### 3. **Mocking Dependencies**

```typescript
// Mock entire module
vi.mock('@/core/api/user.api', () => ({
  userApi: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsTextField: ({ id, value, onChange }: any) => (
    <input
      data-testid={`lds-textfield-${id}`}
      value={value}
      onChange={onChange}
    />
  ),
  useToastContext: () => ({
    addToast: vi.fn()
  })
}))
```

### Coverage Requirements

- **Target:** 90%+ line coverage for components
- **Excludes:** Test files, mocks, config files
- **Run coverage:** `npm run test:coverage`

---

## Styling Guidelines

### SCSS Module Pattern

All component styles use SCSS modules:

```scss
// Component.module.scss
.container {
  display: flex;
  padding: 1rem;

  &Wrapper {
    // Creates .containerWrapper
    background: $color-background;
  }

  &--active {
    // BEM modifier: .container--active
    border-color: $color-primary;
  }
}

.header {
  font-size: 1.5rem;
  color: $color-text-primary;
}
```

Usage in component:

```typescript
import styles from './Component.module.scss'

const Component = () => (
  <div className={styles.container}>
    <h1 className={styles.header}>Title</h1>
  </div>
)
```

### Lilly Design System (LDS)

Use LDS components from `@elilillyco/ux-lds-react`:

```typescript
import {
  LdsButton,
  LdsTextField,
  LdsToast,
  LdsModal
} from '@elilillyco/ux-lds-react'
import '@elilillyco/ux-lds-react/src/css/lds.css'

const Form = () => (
  <form>
    <LdsTextField
      id="username"
      label="Username"
      value={value}
      onChange={handleChange}
    />
    <LdsButton variant="primary" onClick={handleSubmit}>
      Submit
    </LdsButton>
  </form>
)
```

### Color Variables

Reference `COLOR_VARIABLES_GUIDE.md` for available color tokens.

Common patterns:

```scss
// Import shared colors
@import '../../shared/styles/colors';

.button {
  background-color: $color-primary;
  color: $color-text-inverse;

  &:hover {
    background-color: $color-primary-dark;
  }

  &:disabled {
    background-color: $color-disabled;
    cursor: not-allowed;
  }
}
```

### Responsive Design

```scss
// Mobile-first approach
.container {
  padding: 1rem;

  // Tablet
  @media (min-width: 768px) {
    padding: 2rem;
  }

  // Desktop
  @media (min-width: 1024px) {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## Build & Development

### Development Server

```bash
# Start dev server (port 5173)
npm run dev

# Dev server with API proxy
# Proxies /api/* to http://localhost:8080
```

### Build Process

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

Build output: `dist/`

- TypeScript compilation
- Vite bundling with code splitting
- Source maps generated

### Code Quality

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Testing Commands

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# CI test run
npm run test:ci
```

### Environment Variables

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_DEBUG=true
```

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
const isDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true'
```

### Path Aliases

TypeScript path mapping via `@/*`:

```typescript
// Instead of: '../../../core/api/user.api'
import { userApi } from '@/core/api/user.api'

// Instead of: '../../components/Button'
import { Button } from '@/components/Button'
```

Configured in:

- `tsconfig.json`: `{ "paths": { "@/*": ["./src/*"] } }`
- `vite.config.ts`: `alias: { '@': path.resolve(__dirname, './src') }`

---

## Deployment Process

### Overview

The Sage AI application uses ARGO CD for continuous deployment to Dev and QA environments. When code is merged into the respective branches, the deployment process is managed through ARGO CD pipelines accessible via Lilly's internal network.

**Deployment Workflow:**

```
Code Merge → Branch (dev/qa) → Build Pipeline → ARGO CD Sync → Deployed
```

---

### Prerequisites

#### 1. Access Lilly Environment

Before deploying, you must be connected to the Lilly internal network. There are two ways to access:

**Option A: Direct Lilly Network Connection**
- Connect to Lilly corporate network
- Access deployment tools directly

**Option B: VDI via Citrix (Remote Access)**
- Access Citrix StoreFront portal
- URL: **https://virtuallilly.cloud.com/Citrix/StoreWeb/#/home**
- Login with your Lilly credentials
- Launch virtual desktop environment

**Citrix Login Steps:**

1. Navigate to https://virtuallilly.cloud.com/Citrix/StoreWeb/#/home
2. Enter your Lilly username and password
3. Complete multi-factor authentication (if prompted)
4. Select and launch your assigned virtual desktop
5. Once logged in, you can access ARGO CD URLs

---

### Deployment Environments

#### Dev Environment

**ARGO CD Dashboard:**
```
https://argocd.apps-d.lrl.lilly.com/applications/lilly-sage-ai-dev/lilly-sage-ai-dev?resource=
```

**Branch:** `dev`  
**Target:** Development environment  
**Auto-sync:** Disabled (manual sync required)

---

#### QA Environment

**ARGO CD Dashboard:**
```
https://argocd.apps-q.lrl.lilly.com/applications/lilly-sage-ai-qa/lilly-sage-ai-qa?resource=
```

**Branch:** `qa`  
**Target:** QA/Testing environment  
**Auto-sync:** Disabled (manual sync required)

---

### Deployment Steps

#### Step 1: Verify Build Success

**IMPORTANT:** Before triggering ARGO CD deployment, ensure the CI/CD build pipeline has completed successfully.

1. Check the build status in your CI/CD system (GitHub Actions, Jenkins, etc.)
2. Verify that all tests have passed
3. Confirm that Docker images have been built and pushed to the registry
4. Review any build logs for warnings or errors

**Build Success Indicators:**
- ✅ All unit tests passed
- ✅ Linting checks passed
- ✅ Docker image built successfully
- ✅ Image pushed to container registry
- ✅ No critical security vulnerabilities detected

**If build fails:**
- Do NOT proceed with ARGO CD sync
- Fix the build issues first
- Re-run the build pipeline
- Wait for successful build confirmation

---

#### Step 2: Access ARGO CD Dashboard

1. **Ensure you're connected to Lilly network** (or logged into Citrix VDI)

2. **Open the appropriate ARGO CD URL:**
   - **For Dev:** https://argocd.apps-d.lrl.lilly.com/applications/lilly-sage-ai-dev/lilly-sage-ai-dev?resource=
   - **For QA:** https://argocd.apps-q.lrl.lilly.com/applications/lilly-sage-ai-qa/lilly-sage-ai-qa?resource=

3. **Login to ARGO CD:**
   - Use your Lilly SSO credentials
   - Complete multi-factor authentication if required

4. **Verify you're on the correct application page:**
   - Application Name: `lilly-sage-ai-dev` or `lilly-sage-ai-qa`
   - Check the target cluster and namespace

---

#### Step 3: Synchronize Application

1. **Click the "SYNC" button** (located in the top toolbar)

2. **Configure Sync Options Modal:**
   
   A modal will appear with various sync options:

   - **REVISION:** Verify the correct branch/commit is selected
   - **☑️ PRUNE:** **Check this option** (IMPORTANT)
     - This removes Kubernetes resources that no longer exist in Git
     - Ensures clean deployments without orphaned resources
   - **DRY RUN:** Leave unchecked (unless testing)
   - **APPLY ONLY:** Leave unchecked
   - **FORCE:** Leave unchecked (unless instructed by DevOps)

   **Prune Option Explanation:**
   ```
   When PRUNE is enabled:
   - Deletes resources removed from Git config
   - Cleans up old ConfigMaps, Secrets, Deployments
   - Prevents resource drift
   - Recommended for all standard deployments
   ```

3. **Review Selected Resources:**
   - Expand the resource tree to see what will be synced
   - Verify all expected resources are listed:
     - Deployments (frontend, backend)
     - Services
     - ConfigMaps
     - Secrets
     - Ingress routes

4. **Click "SYNCHRONIZE" button**
   - Confirm the action if prompted
   - Do NOT close the browser window

---

#### Step 4: Monitor Deployment Progress

1. **Watch the sync status:**
   - Status will change from `Syncing` → `Synced`
   - Health will change from `Progressing` → `Healthy`

2. **Monitor individual resources:**
   - Click on each resource (Pods, Deployments) to see details
   - Watch pod status: `Pending` → `ContainerCreating` → `Running`
   - Check for any error messages in the event logs

3. **Typical resource sync order:**
   ```
   ConfigMaps/Secrets → Deployments → ReplicaSets → Pods → Services → Ingress
   ```

4. **Real-time logs (optional):**
   - Click on a Pod to view live logs
   - Useful for troubleshooting startup issues

---

#### Step 5: Wait for Deployment Completion

**Expected Time:** 5-10 minutes

**Timeline:**
- **0-2 min:** Resources being synced to cluster
- **2-5 min:** Pods starting, containers pulling images
- **5-8 min:** Application initialization, health checks
- **8-10 min:** All pods healthy, traffic routing updated

**Deployment Complete Indicators:**

```
✅ Sync Status: Synced
✅ Health Status: Healthy
✅ All Pods: Running (green)
✅ Last Sync: < 1 minute ago
✅ Sync Result: Successful
```

**If deployment takes longer than 10 minutes:**
- Check pod events for errors
- Review application logs
- Verify Docker image is accessible
- Check resource limits and quotas
- Contact DevOps if issues persist

---

#### Step 6: Verify Deployment

1. **Check Application Health in ARGO CD:**
   - All resources should show `Healthy` status
   - Pods should be `Running` with green indicators
   - No error messages in the status section

2. **Access the Deployed Application:**
   
   **Dev Environment:**
   ```
   https://lilly-sage-ai.dev.bu.lilly.com
   ```
   
   **QA Environment:**
   ```
   https://lilly-sage-ai.qa.bu.lilly.com
   ```

3. **Perform Smoke Tests:**
   - Verify the login page loads
   - Test user authentication
   - Check that the dashboard displays
   - Test a basic form submission
   - Verify AI features are working

4. **Check Application Logs (Optional):**
   - Frontend logs: Check browser console
   - Backend logs: View in ARGO CD pod logs or Kibana

---

### Troubleshooting

#### Sync Fails

**Problem:** Sync operation fails with errors

**Solutions:**
- Review error messages in ARGO CD UI
- Check if resources have conflicts (e.g., duplicate names)
- Verify Kubernetes cluster has sufficient resources
- Ensure Docker images are accessible from the cluster
- Check RBAC permissions for ARGO CD service account

**Common Errors:**
```
❌ ImagePullBackOff → Docker image not found or registry auth failed
❌ CrashLoopBackOff → Application crashes on startup
❌ InvalidImageName → Wrong image tag or repository
❌ ResourceQuotaExceeded → Cluster resource limits reached
```

---

#### Pods Not Starting

**Problem:** Pods stuck in `Pending` or `ContainerCreating`

**Solutions:**
- Click on the pod to view events
- Check for resource constraints (CPU, memory)
- Verify persistent volume claims (if applicable)
- Ensure node selectors/affinity rules are satisfied
- Check for image pull secrets

---

#### Application Unhealthy After Sync

**Problem:** Sync completes but health status shows `Degraded` or `Unhealthy`

**Solutions:**
- Check pod logs for application errors
- Verify environment variables and ConfigMaps
- Test database connectivity
- Check external service dependencies (APIs, S3, etc.)
- Review health check endpoints

---

#### Wrong Version Deployed

**Problem:** Deployed version doesn't match expected code changes

**Solutions:**
- Verify the correct Git branch/commit is selected in sync options
- Check that CI/CD pipeline built from the right branch
- Confirm Docker image tag matches the expected version
- Hard refresh ARGO CD dashboard (clear cache)
- Re-run the sync operation

---

### Rollback Procedure

 If the deployment causes issues, you can rollback to a previous version:

1. **Navigate to History Tab** in ARGO CD
2. **Select a previous successful revision**
3. **Click "Rollback" button**
4. **Confirm the rollback operation**
5. **Monitor the rollback** (similar to deployment)
6. **Verify application health** after rollback completes

**Alternative Rollback via Sync:**
- In the SYNC modal, manually select a previous Git commit/tag
- Ensure PRUNE is checked
- Click SYNCHRONIZE

---

### Best Practices

1. **Always verify build success** before ARGO CD sync
2. **Enable PRUNE option** for clean deployments
3. **Monitor the sync progress** until completion (don't close the window)
4. **Perform smoke tests** after deployment
5. **Communicate deployments** to team members (Slack, email)
6. **Deploy during off-peak hours** when possible
7. **Have a rollback plan** ready before deploying
8. **Document any deployment issues** for future reference
9. **Keep ARGO CD dashboard open** for 5-10 minutes to monitor stability
10. **Coordinate with QA team** before QA deployments

---

### Deployment Checklist

**Pre-Deployment:**
- [ ] Code merged to target branch (dev/qa)
- [ ] CI/CD build pipeline completed successfully
- [ ] All tests passed
- [ ] Docker images built and pushed
- [ ] Connected to Lilly network or Citrix VDI
- [ ] Team notified about upcoming deployment

**During Deployment:**
- [ ] Accessed correct ARGO CD URL (dev/qa)
- [ ] Clicked SYNC button
- [ ] Checked PRUNE option
- [ ] Reviewed resources to be synced
- [ ] Clicked SYNCHRONIZE button
- [ ] Monitored sync progress (5-10 minutes)

**Post-Deployment:**
- [ ] Verified Sync Status: Synced
- [ ] Verified Health Status: Healthy
- [ ] All pods showing Running status
- [ ] Accessed deployed application URL
- [ ] Performed smoke tests
- [ ] Checked application logs (if needed)
- [ ] Notified team of successful deployment
- [ ] Documented any issues encountered

---

### Quick Reference

**Citrix Portal:**
```
https://virtuallilly.cloud.com/Citrix/StoreWeb/#/home
```

**ARGO CD - Dev:**
```
https://argocd.apps-d.lrl.lilly.com/applications/lilly-sage-ai-dev/lilly-sage-ai-dev?resource=
```

**ARGO CD - QA:**
```
https://argocd.apps-q.lrl.lilly.com/applications/lilly-sage-ai-qa/lilly-sage-ai-qa?resource=
```

**Application URLs:**
- **Dev:** https://lilly-sage-ai.dev.bu.lilly.com
- **QA:** https://lilly-sage-ai.qa.bu.lilly.com

**Key Sync Options:**
- ✅ **PRUNE:** Always check this option
- ⏱️ **Wait Time:** 5-10 minutes for deployment
- 🔄 **Rollback:** Available via History tab

---

## Best Practices Summary

### ✅ DO

- Use TypeScript for all code
- Define interfaces for all component props
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Use Context for global state
- Write unit tests for components and utilities
- Follow Prettier formatting rules
- Use SCSS modules for component styles
- Leverage LDS components
- Handle errors gracefully
- Document complex logic with comments
- Use meaningful variable and function names
- Keep components small and focused
- Use async/await for asynchronous operations

### ❌ DON'T

- Use class components
- Use `any` type without justification
- Mutate state directly
- Ignore TypeScript errors
- Write inline styles (use SCSS modules)
- Commit unformatted code
- Skip writing tests for new components
- Use global CSS classes
- Hardcode API URLs
- Leave console.log statements in production code
- Create deeply nested component hierarchies
- Mix business logic with UI components

---

## Additional Resources

- **Figma Design Prototype:** https://www.figma.com/design/TCKRNZY4L6iN2KCbEETWKx/Sage-AI---UI?m=auto&node-id=5766-120965&t=pT0dSU3qeTakfGgE-1
- **API Documentation:** `API_DOCUMENTATION.md`
- **Color Guide:** `COLOR_VARIABLES_GUIDE.md`
- **Lilly Design System:** Internal documentation
- **React JSON Schema Forms:** https://rjsf-team.github.io/react-jsonschema-form/
- **Vitest Documentation:** https://vitest.dev/

---

**Maintained by:** Sage AI Development Team  
**Last Review:** December 16, 2025
