import { ButtonActionType } from './models/buttons.model'
export enum FormDashboardFormType {
  IdeaSubForm = 'idea-sub-form',
  AiRegistryForm = 'ai-registry-form',
  DloForm = 'dlo-form',
  WwtpForm = 'wwtp-form',
  WnvVendorEngagementForm = 'wwtp-new-vendor-form',
  GcoRiskRegistryForm = 'gco-risk-registry-form',
  SecurityArchForm = 'security-arch-form',
}

export enum ExtendedFormDashboardFormType {
  IdeaSubForm = 'idea-sub-form',
  AiRegistryForm = 'ai-registry-form',
  DloForm = 'dlo-form',
  WwtpForm = 'wwtp-form',
  WnvVendorEngagementForm = 'wwtp-new-vendor-form',
  GcoRiskRegistryForm = 'gco-risk-registry-form',
  SecurityArchForm = 'security-arch-form',
  BeginSubmissionForm = 'begin-submission-form',
}

export enum FetchStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum FORM_STATUS {
  COMPLETED = 'completed',
  PENDING = 'pending',
}

export const AI_TAGS: Record<string, string> = {
  DATA_EXTRACTS: 'Data Extracts',
  SUGGESTIONS_AVAILABLE: 'Suggestions available',
} as const

export const WARNING_MSG_INPUT_EMPTY: string =
  'Please enter valid content to enable enhanced answer feature'
export const ENHANCE_BTN_TXT: string = 'Enhance Answer'
export const REVIEW_BTN_TXT: string = 'Review Answer'
export const defaultButtonLabels: Record<ButtonActionType, string> = {
  cancel: 'Cancel',
  prev: 'Previous',
  next: 'Next',
  saveDraft: 'Save Draft',
  skipUpload: 'Skip Upload & Submit',
  submit: 'Submit',
  update: 'Update',
}

export const AiFeaturesButtonLabels: Record<AiPanelButtonActionId, string> = {
  cancel: 'Cancel',
  prev: 'Previous',
  next: 'Next',
  proceedWithoutSelection: 'Proceed without selection',
  useAnswer: 'Use Answer',
}

export const EXTRACT_DATA_READ_MORE_LIMIT: number = 200

export const NEGATIVE_FEEDBACK_CHIPS = [
  'Not Relevant',
  'Inaccurate information',
  'Confusing',
  'Other',
]

export const POSITIVE_FEEDBACK_CHIPS = [
  'Relevant',
  'Accurate',
  'Clear',
  'Other',
]

// Feedback chips for Data Extracts
export const DATA_EXTRACTS_FEEDBACK_CHIPS = [
  'Failure in Extraction',
  'Partial / Wrong or Irrelevant Data',
  'Transparency in Data',
  'Other',
]

// Feedback chips for Suggestions
export const SUGGESTIONS_FEEDBACK_CHIPS = [
  'Irrelevant Suggestion',
  'Hallucination',
  'Evaluation Quality',
  'Conflicting suggestions',
  'Contextuality',
  'Other',
]

// Feedback chips for Enhance Answer
export const ENHANCE_ANSWER_FEEDBACK_CHIPS = [
  'Rephrase Quality',
  'Tone / Communication mismatch',
  'Hallucination',
  'Other',
]

export enum Badges {
  Submitted = 'submitted',
  Mandatory = 'mandatory',
  Required = 'required',
  Optional = 'optional',
  BeginSubmissionForm = 'begin-submission-form',
}

export enum ButtonActionId {
  cancel = 'cancel',
  prev = 'prev',
  next = 'next',
  saveDraft = 'saveDraft',
  skipUpload = 'skipUpload',
  submit = 'submit',
  update = 'update',
}

export enum AiPanelButtonActionId {
  cancel = 'cancel',
  prev = 'prev',
  next = 'next',
  proceedWithoutSelection = 'proceedWithoutSelection',
  useAnswer = 'useAnswer',
}

export const APPROVAL_SCORE_PREFIX = 'ai_score_'

export const MANDATORY = 'mandatory'
export const RECOMMENDED = 'recommended'
export const OPTIONAL = 'optional'

// Type definition for requirement levels
export type RequirementLevel =
  | typeof MANDATORY
  | typeof OPTIONAL
  | typeof RECOMMENDED

export const CATEGORY_TO_REQUIREMENT_LEVEL: Record<string, RequirementLevel> = {
  recommended: RECOMMENDED,
  mandatory: MANDATORY,
  optional: OPTIONAL,
}

export const NOVELTY_SCORE_QUESTION_ID = ['AI-Q5', 'AI-Q6', 'AI-Q12']

export const STATUS_LABEL_MAP = {
  completed: 'Completed',
  submitted: 'In Progress',
}

export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 404,
}

// Extraction Status Constants
export const MAX_ESTIMATED_TIME = 45000 // 45 seconds max estimated time for extraction

// Info Tour Modal Messages
export const INFO_TOUR_MESSAGES = {
  DATA_EXTRACTS:
    'These are extracts from the documents you\nuploaded, which are related to this field.',
  LEVERAGE_ANSWERS:
    "These are the previously filled answers from the forms you\n've completed.",
  ENHANCE_ANSWER:
    'Enhance answer will do a grammar and\ntone check for your response and also\nattempt to incorporate all the suggestions\navailable below for that answer',
  CHECK_COVERAGE:
    'Check Coverage reviews your input to spot gaps, ensuring every\nresponse is complete. Suggestions surface the most relevant\nrecommendations as you type, helping you make confident\nchoices. There is already a first pass at checking coverage done, make some edits manually to enable this feature',
  AI_SWITCH:
    'Switch on the toggle to use\nthe **AI response builder** for\nfilling responses. Switch off to\nenter responses manually.',
} as const

export const MIN_ENHANCE_TEXT_LENGTH = 25

// Add these additional regex patterns and update existing ones
export const FIELD_VALIDATION_REGEX = {
  ALPHABETIC_WITH_SPACES: /^[A-Za-z\s]+$/,
  NUMERIC_ONLY: /[^0-9]/g,
  NUMERIC_10_DIGITS: /^[1-9][0-9]{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_LIST: /^[^\s@]+@[^\s@]+\.[^\s@]+(\s*,\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/,
  HAS_NUMERIC_PATTERN: /\[0-9\]/,
} as const

// Form Field Validation Regex Patterns (for JSON Schema)
export const VALIDATION_PATTERNS = {
  ALPHABETIC_WITH_SPACES: '^[A-Za-z\\s]+$',
  NUMERIC_10_DIGITS: '^[1-9][0-9]{9}$', // Updated: must start with 1-9
  EMAIL: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
} as const

// Error messages for validation patterns
export const VALIDATION_ERROR_MESSAGES = {
  ALPHABETIC_WITH_SPACES: 'Please enter only alphabets in this text field.',
  NUMERIC_10_DIGITS: 'Please enter a valid 10 digit telephone number.',
  EMAIL: 'Please enter a valid email address.',
} as const

// Telephone number validation config
export const TELEPHONE_VALIDATION = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 10,
} as const
