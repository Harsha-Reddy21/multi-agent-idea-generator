import { RegistryWidgetsType, WidgetProps } from '@rjsf/utils'

import { CustomBooleanCheckboxWidget as BooleanCheckboxWidget } from './widgets/components/CustomBooleanCheckboxWidget'
import { CustomCheckboxWidget as CheckboxWidget } from './widgets/components/CustomCheckboxWidget'
import { CustomDateWidget as DateWidget } from './widgets/components/CustomDateWidget'
import { CustomFileWidget as FileWidget } from './widgets/components/CustomFileWidget'
import { CustomMultiselectDropdown as MultiselectDropdown } from './widgets/components/CustomMultiselectDropdown'
import { CustomMultiSelectWidget as MultiSelectWidget } from './widgets/components/CustomMultiSelectWidget'
import { CustomRadioWidget as RadioWidget } from './widgets/components/CustomRadioWidget'
import { CustomSelectWidget as SelectWidget } from './widgets/components/CustomSelectWidget'
import { CustomTextArea as TextAreaWidget } from './widgets/components/CustomTextArea'
import { CustomTextWidget as TextWidget } from './widgets/components/CustomTextWidget'
// Import modular components
import { FieldWrapper } from './widgets/components/FieldWrapper'
// Import types
import type { InnerRender, WrapperOptions } from './widgets/types'

// Re-export for backward compatibility
export { UserFeedback } from './UserFeedback/UserFeedback'

// Simplified wrapper using FieldWrapper component
const wrapField = (inner: InnerRender, options: WrapperOptions = {}) => {
  return (props: WidgetProps) => (
    <FieldWrapper props={props} inner={inner} options={options} />
  )
}

// Simple widgets using modular components
export const CustomTextWidget = wrapField(TextWidget as InnerRender, {
  includeTags: true,
})
export const CustomRadioWidget = wrapField(RadioWidget as InnerRender, {
  includeTags: true,
})
export const CustomSelectWidget = wrapField(SelectWidget as InnerRender, {
  includeTags: true,
})
export const CustomDateWidget = wrapField(DateWidget as InnerRender, {
  includeTags: true,
})
export const CustomTextArea = wrapField(TextAreaWidget as InnerRender, {
  includeTags: true,
})
export const CustomMultiSelectWidget = wrapField(
  MultiSelectWidget as InnerRender,
  { includeTags: true }
)
export const CustomFileWidget = wrapField(FileWidget as InnerRender, {
  includeTags: true,
})
export const CustomBooleanCheckboxWidget = wrapField(
  BooleanCheckboxWidget as InnerRender
)
export const CustomCheckboxWidget = wrapField(CheckboxWidget as InnerRender, {
  includeTags: true,
})
export const CustomMultiselectDropdown = wrapField(
  MultiselectDropdown as InnerRender,
  { includeTags: true }
)

// Export all widgets for RJSF
export const customWidgets: RegistryWidgetsType = {
  customText: CustomTextWidget,
  customRadio: CustomRadioWidget,
  customSelect: CustomSelectWidget,
  customMultiSelect: CustomMultiselectDropdown,
  customFile: CustomFileWidget,
  customCheckbox: CustomCheckboxWidget,
  customDate: CustomDateWidget,
  customTextArea: CustomTextArea,
  customBooleanCheckbox: CustomBooleanCheckboxWidget,
}
