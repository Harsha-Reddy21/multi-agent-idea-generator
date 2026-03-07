# Component Documentation (Clean)

This document lists custom React components in the frontend, grouped by category. Each entry includes a short description, props (if any), a quick usage example, and important notes.

Notes sections only appear where there’s something to watch out for.

## App-level and routing

### App

- Description: Root application component that wires providers and routing and renders the app shell.
- Props: None
- Usage: `<App />`

### AppInner

- Description: Internal component inside `App` responsible for header, routes, and footer; not exported separately.
- Props: None
- Usage: Rendered within `App`.

### AppRoutes

- Description: Defines application routes using React Router.
- Props: None
- Usage: `<AppRoutes />`

## Pages

### AIRegistryForm

- Description: Page for the AI Registry form flow.
- Props: None
- Usage: `<AIRegistryForm />`

### AIRegistryFormInner

- Description: Inner implementation details for `AIRegistryForm`.
- Props: None
- Usage: Internal.

### BeginSubmission

- Description: Entry point page to begin a submission.
- Props: None
- Usage: `<BeginSubmission />`

### DigitalLegalOffice

- Description: Page for Digital Legal Office-related inputs.
- Props: None
- Usage: `<DigitalLegalOffice />`

### DigitalLegalOfficeInner

- Description: Inner component used by `DigitalLegalOffice`.
- Props: None
- Usage: Internal.

### FormDashboard

- Description: Dashboard summarizing forms and progress.
- Props: None
- Usage: `<FormDashboard />`

### IdeaSubmissionForm

- Description: Main idea submission form page.
- Props: None
- Usage: `<IdeaSubmissionForm />`

### IdeaSubmissionFormInner

- Description: Inner component used by `IdeaSubmissionForm`.
- Props: None
- Usage: Internal.

### LandingPage

- Description: Landing page shown to users who have not submitted an idea.
- Props: None
- Usage: `<LandingPage />`

### SecurityAndEng

- Description: Security and Engineering page.
- Props: None
- Usage: `<SecurityAndEng />`

### SecurityAndEngInner

- Description: Inner component used by `SecurityAndEng`.
- Props: None
- Usage: Internal.

### SubmitterDashboard

- Description: Dashboard for submitters to view/update submissions.
- Props: None
- Usage: `<SubmitterDashboard />`

### WnvVendorEngagement

- Description: Page for WNV vendor engagement.
- Props: None
- Usage: `<WnvVendorEngagement />`

### WnvVendorEngagementInner

- Description: Inner component used by `WnvVendorEngagement`.
- Props: None
- Usage: Internal.

### WorkingWithThirdParty

- Description: Page for working with third-party submissions.
- Props: None
- Usage: `<WorkingWithThirdParty />`

### WorkingWithThirdPartyInner

- Description: Inner component used by `WorkingWithThirdParty`.
- Props: None
- Usage: Internal.

## Components (general/UI)

### AICardButtons

- Description: Maps footer button descriptors to consistent LDS buttons for the current AI panel page. It resolves each descriptor to a concrete LDS button (primary/secondary/tertiary) and connects actions like next, prev, cancel, and useAnswer through a typed handler map. Disabled states, loading flags, and class variants are respected so button behavior remains predictable across pages. Page-specific button arrays come from `pageButtonIds` and are selected by `activePageIndex`, allowing flows to vary per step. The Next button renders with an arrow icon to match visual specs.
- Props:

| Prop             | Type                                                         | Required | Default | Description                        |
| ---------------- | ------------------------------------------------------------ | -------- | ------- | ---------------------------------- |
| pageButtonIds    | Partial<Record<number, AiPanelFooterButtonDescriptor[]>>     | Yes      | —       | Footer button descriptors per page |
| activePageIndex  | number                                                       | Yes      | —       | Current page index                 |
| actionHandlerMap | Record<AiPanelButtonActionType, () => void \| Promise<void>> | Yes      | —       | Handlers for each action           |

- Usage: `<AICardButtons pageButtonIds={config} activePageIndex={0} actionHandlerMap={handlers} />`
- Notes:
  - Errors thrown by parent handlers are swallowed (by design) to avoid noisy UI; surface your own toasts if needed.
  - Both `classes` (variant) and `className` can be set on LDS buttons; descriptors allow passing either.

### AIFeaturesCard

- Description: AI Response Builder that guides users through a two-step flow: pick an answer (from your input, data extracts, or common answers) and optionally refine it. It orchestrates panel visibility, page transitions, selected/refined text, and footer button availability, surfacing errors via toasts when API calls fail. When `dataExtractOnly` is true, it streamlines to a single step where the selected extract can be used immediately. State resets occur when the bound `questionId` changes so each field starts fresh. Parents should provide `onExtractClick` to commit the chosen/refined text back into the form.
- Props:

| Prop            | Type     | Required | Default | Description                                                 |
| --------------- | -------- | -------- | ------- | ----------------------------------------------------------- |
| isVisible       | boolean  | Yes      | —       | Controls visibility                                         |
| onClose         | function | Yes      | —       | Close handler                                               |
| questionText    | string   | No       | —       | Current question text                                       |
| questionId      | string   | No       | —       | Current question id                                         |
| submissionId    | string   | No       | —       | Current submission id                                       |
| formId          | string   | No       | —       | Current form id                                             |
| inputValue      | string   | No       | —       | Current input value                                         |
| onExtractClick  | function | No       | —       | Callback to use selected/refined answer                     |
| commonFields    | any      | No       | —       | Common fields for extract/use                               |
| dataExtractOnly | boolean  | No       | false   | Enable extract-only mode                                    |
| formContext     | object   | No       | —       | Context info (submissionId, formType, formData, formStatus) |

- Usage: `<AIFeaturesCard isVisible onClose={close} questionText={text} questionId={id} />`
- Notes:
  - Resets internal state when `questionId` changes (starts over on a new field).
  - In extract-only mode, the Use button label changes to “Use this Answer”.
  - `onExtractClick` should be provided to persist the selected/refined text back to the form.

### Badge

- Description: Status/label pill with optional icon and styling overrides.
- Props:

| Prop            | Type                                                   | Required | Default | Description                                    |
| --------------- | ------------------------------------------------------ | -------- | ------- | ---------------------------------------------- |
| text            | string                                                 | Yes      | —       | Badge text                                     |
| type            | "mandatory" \| "required" \| "optional" \| "submitted" | Yes      | —       | Visual variant                                 |
| icon            | React.ReactNode                                        | No       | —       | Custom icon node                               |
| iconSrc         | string                                                 | No       | —       | Image source for icon                          |
| backgroundColor | string                                                 | No       | —       | Override background color (type=optional only) |
| borderColor     | string                                                 | No       | —       | Override border color (type=optional only)     |
| textColor       | string                                                 | No       | —       | Override text color (type=optional only)       |
| light           | boolean                                                | No       | false   | Use light optional style                       |
| className       | string                                                 | No       | —       | Extra class names                              |
| data-testid     | string                                                 | No       | "badge" | Test id                                        |

- Usage: `<Badge text="Required" type="required" />`

### CheckCoverage

- Description: Reviews the current input for gaps and suggests improvements to reach complete coverage. Useful when answers must meet completeness standards.
- Props: None
- Usage: `<CheckCoverage />`

### DataExtracts

- Description: Displays document-derived extracts with provenance, fetch status, and retry controls, making it easy to prefill fields and accelerate form completion. It calls the backend using the trio of `questionId`, `submissionId`, and `formId`, and propagates a server-provided `interaction_id` to the parent when available. Long answers can be expanded/collapsed and unusable items are disabled until they include a valid `answer_text`. When the service indicates no documents (404-like), it sets a file-not-found flag via `DataExtractsStatusContext` so the banner can inform the user. Selecting “Use this Extract” marks the item as used and invokes `onExtractClick` with the text.
- Props:

| Prop                  | Type     | Required | Default | Description                                 |
| --------------------- | -------- | -------- | ------- | ------------------------------------------- |
| questionId            | string   | No       | —       | Field/question id                           |
| submissionId          | string   | No       | —       | Submission id                               |
| formId                | string   | No       | —       | Form id                                     |
| onExtractClick        | function | No       | —       | Callback invoked with selected extract text |
| onInteractionIdUpdate | function | No       | —       | Receives server-provided interaction id     |

- Usage: `<DataExtracts questionId={q} submissionId={s} formId={f} onExtractClick={useText} />`
- Notes:
  - Requires `questionId`, `submissionId`, and `formId` to fetch extracts; shows placeholders otherwise.
  - Sets a file-not-found flag via `DataExtractsStatusContext` when 404-like errors occur.
  - “Read More” toggles long answers; “Use this Extract” marks used and calls `onExtractClick`.

### EnhancedAIRegistryForm

- Description: Modal that lets users view and update AI Registry details tied to a submission.
- Props:

| Prop             | Type     | Required | Default | Description               |
| ---------------- | -------- | -------- | ------- | ------------------------- |
| isOpen           | boolean  | Yes      | —       | Modal visibility          |
| onClose          | function | Yes      | —       | Close handler             |
| submissionId     | string   | Yes      | —       | Submission identifier     |
| aiRegistryFormId | string   | No       | ""      | Existing registry form id |

- Usage: `<EnhancedAIRegistryForm isOpen onClose={close} submissionId={id} />`

### EnhanceAnswerCard

- Description: Enhances a selected answer by clarifying, expanding, or polishing the text via an API call, and explains changes with a rationale list. The request fires when the card first becomes visible, and the component resets when hidden to avoid stale state. Users can regenerate to try a different enhancement, and “Use Answer” passes the reviewed text up so the form can be updated. It captures the current `userInput` at call time, so subsequent regenerations reflect edits the user makes. On service errors (e.g., Cortex unavailable), it shows a friendly message and stops further enhancement.
- Props: None (controlled by the parent via callbacks in usage sites)
- Usage: `<EnhanceAnswerCard isVisible userInput={text} questionId={q} submissionId={s} onUseThis={cb} />`
- Notes:
  - Calls the backend when the card first becomes visible; resets when hidden.
  - Captures the current `userInput` at the time of API call (regenerate uses updated input).
  - On error, shows a friendly message (Cortex unavailable) and halts enhancement.

### ExtractPreviewCard

- Description: Presents a concise preview of extracted content and its provenance details.
- Props: None
- Usage: `<ExtractPreviewCard />`

### ExtractionStatusBanner

- Description: Global banner that reflects document extraction lifecycle states (pending, processing, success, failed) with contextual messages and progress when applicable. It reads and controls state from `ExtractionStatusProvider`, including dismiss/hide and a retry that restarts the SSE process with the active submission. Error text is normalized (e.g., “Cortex” vs “Server unavailable”) for clearer user messaging. The progress bar is suppressed for failures to avoid confusion. When dismissed or when there’s no active status, the banner returns `null` to stay out of the layout.
- Props: None
- Usage: `<ExtractionStatusBanner />`
- Notes:
  - Returns `null` if dismissed or if no status is available.
  - Message text has special-case parsing (e.g., “Cortex” errors, server unavailable, no documents).
  - Progress bar is hidden when failed; retry restarts SSE with the same submission id.

### FieldWrapper

- Description: Wraps RJSF widgets with consistent labels, help/tooltip rendering, validation/error regions, and spacing while coordinating AI features. For Idea Submission forms, it only enables AI if extraction succeeded globally and the specific field has extracted data (checked via a field-level API). When the AI panel is open with the AI switch enabled, the underlying control becomes read-only/disabled and a blur overlay indicates it’s controlled by AI. Focus can open the AI panel, and value changes are pushed to the AI context to gate the Enhance button (length/gibberish checks). Requires a populated `formContext` (submissionId, formId, formType, formStatus) to behave correctly.
- Props: None (used internally by wrapping widgets)
- Usage: `<FieldWrapper inner={renderWidget} props={widgetProps} />`
- Notes:
  - For Idea Submission forms, AI features are allowed only if global extraction succeeded AND the specific field has extracted data (checked via API). This introduces a per-field async call.
  - When the AI panel is visible with the AI switch enabled, the field is disabled/readonly and a blur overlay is shown.
  - `onFocus` may open the AI panel; `onChange` updates context and enables “Enhance Answer” only if text length > 25 and not gibberish.
  - Requires `formContext` (with `formType`, `submissionId`, `formId`, `formStatus`) to behave correctly.

### Footer

- Description: App footer with external links.
- Props: None
- Usage: `<Footer />`

### FormCard

- Description: Compact card summarizing a form’s title, description, status, and meta (estimated time and step count), with optional iconography and interactivity. It renders badges to communicate “Mandatory/Required/Optional” classifications and can be used as a button-like entry point. The `locked` and `completed` flags drive both visuals and accessibility labelling; `locked` takes precedence. Keyboard users can activate the card with Enter/Space when interactive. Ideal for dashboards or selection screens listing multiple forms.
- Props:

| Prop              | Type                                    | Required | Default     | Description                    |
| ----------------- | --------------------------------------- | -------- | ----------- | ------------------------------ |
| title             | string                                  | Yes      | —           | Title text                     |
| text              | string                                  | Yes      | —           | Description text               |
| completed         | boolean                                 | No       | false       | Submitted state                |
| locked            | boolean                                 | No       | false       | Locked state                   |
| duration          | string                                  | No       | —           | Estimated time label           |
| stepCount         | number                                  | No       | —           | Number of steps                |
| aiFieldPercentage | number                                  | No       | —           | Approval/AI fields percent     |
| disabled          | boolean                                 | No       | false       | Disable interaction            |
| className         | string                                  | No       | —           | Extra classes                  |
| data-testid       | string                                  | No       | "form-card" | Test id                        |
| onAction          | function                                | No       | —           | Click handler when interactive |
| titleIcon         | React.ReactNode                         | No       | —           | Icon before title              |
| badgeType         | "Mandatory" \| "Required" \| "Optional" | No       | —           | Badge classification           |
| showMetaRow       | boolean                                 | No       | true        | Show/hide meta row             |

- Usage: `<FormCard title="AI Registry" text="Complete details" stepCount={5} onAction={open} />`
- Notes:
  - `locked` takes precedence over `completed` for styling/accessibility.
  - Keyboard accessible: space/enter on the card triggers `onAction` when interactive.

### FormContainer

- Description: Layout shell that brings together the form header, RJSF content, and footer actions.
- Props: None
- Usage: `<FormContainer>...</FormContainer>`

### FormContent

- Description: Hosts the RJSF form and dynamically pages fields based on the schema and UI schema, showing only the active page while keeping DOM noise low. It honors `ui:order` (or property order) to compute per-page field lists, applies `ui:hidden` to non-active fields, and clears hidden conditional fields so stale values don’t leak into submissions. It wires AI features so selected/refined answers can be inserted into the current field, and toasts provide submit feedback. The external `activePageIndex` is 1-based and normalized internally to 0-based. The AI panel is suppressed entirely when `formStatus` is “completed”.
- Props (key ones):

| Prop                                 | Type                | Required | Default | Description                |
| ------------------------------------ | ------------------- | -------- | ------- | -------------------------- |
| schema                               | object              | Yes      | —       | JSON schema                |
| uiSchema                             | object              | Yes      | —       | RJSF UI schema             |
| formData                             | object              | Yes      | —       | Current form data          |
| setFormData                          | function            | Yes      | —       | Setter for form data       |
| activePageIndex                      | number              | No       | 1       | Active page (1-based)      |
| pageFieldCounts/pageDetails/pageSize | array/object/number | No       | —       | Paging configuration       |
| submissionId                         | string              | No       | —       | Current submission id      |
| formType                             | string              | No       | —       | Form type key              |
| formStatus                           | string              | No       | —       | Current status             |
| suggestionsData                      | any                 | No       | —       | AI suggestions payload     |
| suggestionsLoading                   | boolean             | No       | —       | Suggestions loading state  |
| suggestionsError                     | string              | No       | —       | Suggestions error          |
| commonFields                         | any                 | No       | —       | Common fields for extracts |

- Usage: `<FormContent schema={schema} uiSchema={ui} formData={data} setFormData={setData} />`
- Notes:
  - `activePageIndex` is 1-based externally; converted to 0-based for internal indexing.
  - Determines order via `ui:order`; otherwise uses `schema.properties` order.
  - Adds `ui:hidden` to non-active fields; `onChange` clears hidden conditional fields via a utility.
  - `handleExtractClick` enables “Enhance Answer” only if extracted text length > 25.
  - Does not render AI panel when `formStatus` is “completed”.

### FormFooter

- Description: Renders Save Draft/Submit/Next/Prev using a descriptor system that supports per-page configuration, async loading states, success/failure transitions, and sticky mode. It computes total upload size from `formData` and disables Submit when the aggregate exceeds 10MB to avoid backend errors. Both descriptor-driven (`pageButtonIds`) and legacy `footerButtons` are supported; note that custom labels in explicit buttons may bypass the built-in Submit size check. When the form is already submitted, submit/save/skipUpload actions are filtered out. Use `actionHandlerMap` to keep UI definitions declarative and behavior centralized.
- Props (descriptor-driven):

| Prop               | Type                                        | Required | Default | Description                     |
| ------------------ | ------------------------------------------- | -------- | ------- | ------------------------------- |
| footerButtons      | FooterButtonConfig[]                        | No       | —       | Explicit buttons (legacy)       |
| pageButtonIds      | Record<number, FooterButtonDescriptor[]>    | No       | —       | Buttons per page                |
| activePageIndex    | number                                      | No       | 1       | Current page index              |
| setActivePageIndex | function                                    | No       | —       | Setter for active page          |
| actionHandlerMap   | Record<string, () => void \| Promise<void>> | No       | —       | Action handlers                 |
| formData           | object                                      | No       | —       | Used to compute total file size |
| sticky             | boolean                                     | No       | false   | Sticky footer layout            |
| formStatus         | FormStatus                                  | No       | —       | Current form status             |

- Usage: `<FormFooter pageButtonIds={cfg} activePageIndex={1} actionHandlerMap={handlers} />`
- Notes:
  - Total upload size > 10MB disables Submit. This is enforced when using descriptor-driven buttons.
  - If you pass explicit `footerButtons`, the Submit detection relies on label matching; custom labels may bypass the size check.
  - When `formStatus` is submitted, submit/save/skipUpload buttons are filtered out.

### FormHeader

- Description: Displays the form’s title and optional subtitle above a progress header styled to match Figma designs, mirroring a multi-step indicator. It computes accessible labels for the current and next steps so screen readers understand progress context. When provided, it shows an approval index with an informational tooltip. Steps are derived from the `steps` array, and `activePageIndex` is accepted as 1-based for simpler integration with page numbering in the UI. Use it to keep page headers consistent across different forms.
- Props:

| Prop                    | Type     | Required | Default | Description            |
| ----------------------- | -------- | -------- | ------- | ---------------------- |
| formTitle               | string   | Yes      | —       | Main title             |
| formSubtitle            | string   | No       | —       | Subtitle               |
| progressEnabled         | boolean  | No       | —       | Show progress section  |
| steps                   | string[] | No       | —       | Step labels            |
| activePageIndex         | number   | No       | 1       | Active step (1-based)  |
| approvalIndexPercentage | number   | No       | —       | Approval index percent |

- Usage: `<FormHeader formTitle="Idea Submission" steps={["Intro","Details"]} activePageIndex={1} />`
- Notes:
  - `activePageIndex` is 1-based; it’s normalized internally to 0-based for indicators.

### HelpModal

- Description: Focused help modal inside the AI panel that explains features like data extract, coverage checks, and editing.
- Props:

| Prop    | Type     | Required | Default | Description   |
| ------- | -------- | -------- | ------- | ------------- |
| onClose | function | Yes      | —       | Close handler |

- Usage: `<HelpModal onClose={close} />`

### InfoTourModal

- Description: A lightweight, portal-based walkthrough modal that anchors to a target element (top/bottom/left/right) and supports rich text (inline bold and line breaks). While open, it registers scroll/resize listeners on the window and the nearest scrollable parent to maintain precise positioning; unmounting removes those listeners. It offers Skip and Next/Okay flows and can align the callout arrow (start/center/end) for pixel-perfect placement. Provide a `targetRef` for best results; without it, the modal falls back to default coordinates. Ideal for first-run guidance sprinkled across forms and AI panels.
- Props:

| Prop       | Type                                   | Required | Default  | Description                                  |
| ---------- | -------------------------------------- | -------- | -------- | -------------------------------------------- |
| isOpen     | boolean                                | Yes      | —        | Controls visibility                          |
| onClose    | function                               | Yes      | —        | Close handler                                |
| onNext     | function                               | No       | —        | Optional next action                         |
| message    | string                                 | Yes      | —        | Supports `**bold**` and `\n` for line breaks |
| buttonText | string                                 | No       | "Okay"   | Main button label                            |
| width      | number                                 | No       | —        | Fixed width (px)                             |
| position   | "top" \| "bottom" \| "left" \| "right" | No       | "bottom" | Modal position relative to target            |
| targetRef  | React.RefObject<HTMLElement>           | No       | —        | Target element reference                     |
| skipButton | boolean                                | No       | false    | Renders a Skip button                        |
| arrowAlign | "center" \| "start" \| "end"           | No       | "center" | Arrow alignment                              |

- Usage: `<InfoTourModal isOpen message={msg} onClose={close} position="top" targetRef={ref} />`
- Notes:
  - Best positioning requires a valid `targetRef`; otherwise it may render at default coordinates.
  - Attaches scroll/resize listeners (including on scrollable parents) while open; unmount cleans them up.

### InitialRoute

- Description: Small route component that decides the starting page based on state/guards.
- Props: None
- Usage: `<InitialRoute />`

### LandingPageCard

- Description: Card used on the landing page for feature summaries.
- Props: None
- Usage: `<LandingPageCard />`

### LoadingSpinner

- Description: Centers an LDS spinner with an accessible label and title for screen readers.
- Props:

| Prop    | Type   | Required | Default             | Description                        |
| ------- | ------ | -------- | ------------------- | ---------------------------------- |
| message | string | No       | "Loading form data" | Accessible label/title for spinner |

- Usage: `<LoadingSpinner message="Loading submissions" />`

### ProtectedRoute

- Description: Minimal route guard that reads user submissions from context and conditionally redirects to keep users on the appropriate flow. With `requiresNoSubmissions`, it blocks access for users who already have submissions (e.g., redirecting to a dashboard) and displays a loading placeholder until submission state is known. It relies on `UserSubmissionsProvider`, so ensure the provider wraps the router. Designed to remain simple and declarative while centralizing the logic for a few guarded routes.
- Props:

| Prop                  | Type               | Required | Default | Description                                            |
| --------------------- | ------------------ | -------- | ------- | ------------------------------------------------------ |
| children              | React.ReactElement | Yes      | —       | Protected content                                      |
| requiresNoSubmissions | boolean            | No       | false   | If true, redirects users with submissions to dashboard |

- Usage: `<ProtectedRoute requiresNoSubmissions><LandingPage /></ProtectedRoute>`
- Notes:
  - Depends on `UserSubmissionsProvider` for state; shows a simple “Loading...” placeholder until ready.

### RefineAnswerScreen

- Description: Dedicated screen for polishing a previously selected answer with options to edit, enhance via the service, compare, toggle rationale, and regenerate. It enforces validation (minimum length and non-gibberish) before enabling Enhance to avoid noisy requests. First-run users get inline tours that explain the Enhance and Coverage features and can be skipped or completed. Selected text is propagated up so the parent can keep the canonical answer in sync. Works hand-in-hand with `EnhanceAnswerCard` and the AI footer buttons.
- Props: None (parent passes state and callbacks)
- Usage: `<RefineAnswerScreen summaryText={text} setSummaryText={set} questionId={q} submissionId={s} />`
- Notes:
  - Disables Enhance until text length ≥ `MIN_ENHANCE_TEXT_LENGTH` and not gibberish.
  - Uses tour state to optionally show InfoTour modals for Enhance and Check Coverage.

### SelectAnswerScreen

- Description: The first step in the AI panel where users pick an answer from three sources: their own input, document data extracts, or common answers. It manages local selection state, fires `onNextDisabledChange` to control navigation, and calls `onAnswerSelect` when a choice is made or edited. Text areas auto-resize to fit content and provenance is grouped for better scannability. First-time users are guided with two short tours (Data Extracts and Leverage Answers) to encourage discovery. Sets the stage for the refinement step by producing a clear, initial candidate answer.
- Props: None (parent passes state and callbacks)
- Usage: `<SelectAnswerScreen questionText={qText} inputValue={val} questionId={q} submissionId={s} formId={f} onNextDisabledChange={setDisabled} onAnswerSelect={setAnswer} />`
- Notes:
  - Uses a data-extracts hook; shows tours for Data Extracts and Leverage Answers the first time.
  - Calls `onNextDisabledChange` and `onAnswerSelect` as user selects/edits options.

### SubmissionCard

- Description: Summarizes a submission with a concise title, ticket number, created date, and a status badge, optionally revealing additional actions. When the submission is completed, users can open the AI Registry modal directly from the card to review or update registry details. Both the title and subtext are interactive and invoke `onUpdate(id)` to reveal more details. Dates are formatted using UTC to avoid off-by-one confusion around midnight. Intended for dashboards and history views where quick scanning and simple actions matter.
- Props:

| Prop             | Type                 | Required | Default | Description            |
| ---------------- | -------------------- | -------- | ------- | ---------------------- |
| id               | string               | Yes      | —       | Submission id          |
| title            | string               | Yes      | —       | Submission title       |
| status           | FullSubmissionStatus | Yes      | —       | Current status         |
| onUpdate         | function             | No       | —       | Update/view handler    |
| className        | string               | No       | —       | Extra classes          |
| data-testid      | string               | No       | —       | Test id                |
| ticketNumber     | string               | No       | —       | External ticket number |
| submitted_at     | string               | No       | —       | Created date string    |
| aiRegistryFormId | string               | No       | ""      | AI registry form id    |

- Usage: `<SubmissionCard id={id} title={title} status={status} onUpdate={open} />`
- Notes:
  - Title and subtext are clickable and call `onUpdate(id)`.
  - Dates are formatted using UTC to avoid timezone shifts at day boundaries.

### SuggestionsCheckCoverage

- Description: Suggests missing elements and checks coverage as the user composes input.
- Props: None
- Usage: `<SuggestionsCheckCoverage />`

### UserFeedback

- Description: Captures quick feedback via positive/negative rating, chips, and an optional comment.
- Props: None
- Usage: `<UserFeedback />`

### UserProfile

- Description: Shows the user’s initial and a truncated name with tooltips for full text, keeping headers compact.
- Props:

| Prop        | Type        | Required | Default | Description        |
| ----------- | ----------- | -------- | ------- | ------------------ |
| userProfile | UserProfile | Yes      | —       | User profile model |

- Usage: `<UserProfile userProfile={user} />`
- Notes:
  - Name is truncated at 20 characters with a tooltip for the full value.

## Form widgets (custom inputs)

### CustomBooleanCheckboxWidget

- Description: Boolean checkbox widget for RJSF.
- Props: Standard RJSF widget props
- Usage: `<CustomBooleanCheckboxWidget />`

### CustomCheckboxWidget

- Description: Multi-option checkbox widget.
- Props: Standard RJSF widget props
- Usage: `<CustomCheckboxWidget />`

### CustomDateWidget

- Description: Date input widget with change handling.
- Props: Standard RJSF widget props
- Usage: `<CustomDateWidget />`

### CustomFileWidget

- Description: File upload widget for single/multiple files.
- Props: Standard RJSF widget props
- Usage: `<CustomFileWidget />`

### CustomMultiSelectWidget

- Description: Multi-select widget built on LDS Select.
- Props: Standard RJSF widget props
- Usage: `<CustomMultiSelectWidget />`

### CustomMultiselectDropdown

- Description: Tag-like multiselect built on a third-party control that supports search, selection, and chip removal, while adapting to RJSF’s value semantics. It transforms `enumOptions` into the control’s `{ id, name }` shape, keeps the selected list controlled, and emits a string[] of selected ids back to RJSF. Disabled/readonly states are respected so forms can centrally govern mutability. Use when you need a compact, familiar token-style multi-select that integrates cleanly with schema-driven forms.
- Props: Standard RJSF widget props
- Usage: `<CustomMultiselectDropdown />`
- Notes:
  - Expects `value` as a string[] of selected ids; `enumOptions` are transformed into `{name, id}` objects for the control.

### CustomRadioWidget

- Description: Radio group widget for RJSF.
- Props: Standard RJSF widget props
- Usage: `<CustomRadioWidget />`

### CustomSelectWidget

- Description: Single-select widget that wraps LDS Select and normalizes its various `onChange` payload shapes (string, event, or option object) into a simple value for RJSF. Empty strings are converted to `undefined` to align with RJSF’s expectation of “no selection.” It preserves disabled/readonly and passes through arbitrary props from UI schema for styling and accessibility. Use as the default select control for consistency with the LDS component library.
- Props: Standard RJSF widget props
- Usage: `<CustomSelectWidget />`
- Notes:
  - Converts empty string to `undefined` before calling `onChange` to align with RJSF expectations.

### CustomTextArea

- Description: Textarea widget.
- Props: Standard RJSF widget props
- Usage: `<CustomTextArea />`

### CustomTextWidget

- Description: Text input widget.
- Props: Standard RJSF widget props
- Usage: `<CustomTextWidget />`

### CustomFieldTemplate

- Description: Field template that centralizes label rendering (including required marks), tooltip/help placement, error display, and spacing/padding so individual widgets can stay minimal. If the `help` string starts with `Tooltip:`, the template renders an inline tooltip instead of a standard help block. It hides labels for object schemas and respects `ui:hidden` so conditional sections don’t leak into the DOM. Error regions remain consistently placed so layouts don’t jump during validation. Use this to enforce uniform field chrome across the entire form system.
- Props:

| Prop        | Type            | Required | Default | Description                    |
| ----------- | --------------- | -------- | ------- | ------------------------------ |
| id          | string          | Yes      | —       | Field id                       |
| classNames  | string          | No       | —       | CSS classes applied            |
| label       | string          | No       | —       | Field label                    |
| help        | React.ReactNode | No       | —       | Help content or tooltip marker |
| required    | boolean         | No       | —       | Required indicator             |
| description | React.ReactNode | No       | —       | Field description              |
| errors      | React.ReactNode | No       | —       | Validation errors              |
| children    | React.ReactNode | Yes      | —       | Field control                  |
| schema      | object          | Yes      | —       | JSON schema                    |
| uiSchema    | object          | Yes      | —       | UI schema                      |

- Usage: Used via RJSF `templates={{ FieldTemplate: CustomFieldTemplate }}`
- Notes:
  - If `help` starts with `Tooltip:`, it’s rendered as an inline tooltip instead of help text.
  - Hides labels for object schemas and respects `ui:hidden`.

## Context providers (React components)

### AIFeaturesProvider

- Description: Provides AI panel visibility, selected question metadata, user input value, coverage scoring, and glue functions for opening/closing the panel and syncing form context. It exposes setters so field wrappers can push keystrokes and so AI screens can publish selected/refined answers. Consumers use this to drive footer button availability (e.g., Enable Enhance) and to reset state when navigating across fields. Keeps the panel’s UX coherent even as forms vary widely in schema and status.
- Props:

| Prop     | Type            | Required | Default | Description     |
| -------- | --------------- | -------- | ------- | --------------- |
| children | React.ReactNode | Yes      | —       | Wrapped content |

- Usage: `<AIFeaturesProvider><App /></AIFeaturesProvider>`

### DataExtractsStatusProvider

- Description: Supplies app-wide data extracts status (e.g., file-not-found) and banner visibility flags so components can coordinate messaging. Data-extract consumers like `DataExtracts` update this context when backend calls indicate missing documents or similar conditions. The banner listens here to decide whether to inform users about missing files and how to recover. Keep this provider near the root so both banners and panels can subscribe.
- Props:

| Prop     | Type            | Required | Default | Description     |
| -------- | --------------- | -------- | ------- | --------------- |
| children | React.ReactNode | Yes      | —       | Wrapped content |

- Usage: `<DataExtractsStatusProvider><App /></DataExtractsStatusProvider>`

### ExtractionStatusProvider

- Description: Central source of truth for extraction runs: status enum, progress percentage, user-facing message, and controls to dismiss or (re)start the SSE stream. The banner and controls subscribe to this provider to present real-time updates and a predictable retry experience. Messages are normalized so copy stays consistent across the app. Place this high enough in the tree that both banners and form pages can participate in the same run.
- Props:

| Prop     | Type            | Required | Default | Description     |
| -------- | --------------- | -------- | ------- | --------------- |
| children | React.ReactNode | Yes      | —       | Wrapped content |

- Usage: `<ExtractionStatusProvider><App /></ExtractionStatusProvider>`

### UserProvider

- Description: Provides current user data, loading state, and `refetch`.
- Props:

| Prop     | Type            | Required | Default | Description     |
| -------- | --------------- | -------- | ------- | --------------- |
| children | React.ReactNode | Yes      | —       | Wrapped content |

- Usage: `<UserProvider><App /></UserProvider>`

### UserSubmissionsProvider

- Description: Fetches and exposes the current user’s submissions along with loading/error state and a `refetch` method so dashboards and guards can stay fresh. Initial render shows a loading placeholder until the first fetch resolves. Designed to be light and dependency-free so multiple features (e.g., routing, cards) can rely on a single source of truth. Wrap your app or routing subtree with this provider to enable `ProtectedRoute` and submissions-driven UI.
- Props:

| Prop     | Type            | Required | Default | Description     |
| -------- | --------------- | -------- | ------- | --------------- |
| children | React.ReactNode | Yes      | —       | Wrapped content |

- Usage: `<UserSubmissionsProvider><App /></UserSubmissionsProvider>`
