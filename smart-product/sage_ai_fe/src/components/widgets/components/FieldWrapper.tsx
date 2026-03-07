import {
  LdsIcon,
  LdsSwitch,
  LdsTooltip,
  useToastContext,
} from '@elilillyco/ux-lds-react'
import { WidgetProps } from '@rjsf/utils'
import React, { useMemo, useRef } from 'react'

import { TagBtnProp } from '@/core/models/common.model'
import { FormStatus } from '@/core/models/form.model'
import { isGibberish } from '@/core/utils/text-validation.util'
import { showToast } from '@/core/utils/toast.utils'

import { useAIFeatures } from '../../../contexts/AIFeaturesContext'
import { ExtendedFormDashboardFormType } from '../../../core/constants'
import formStyles from '../../FormContainer/FormContainer.module.scss'
import InfoTourModal from '../../InfoTourModal/InfoTourModal'
import { useAISwitch } from '../hooks/useAISwitch'
import styles from './FieldWrapper.module.scss'

type InnerRender = (props: WidgetProps) => React.ReactNode

interface WrapperOptions {
  includeTags?: boolean
  skipTitleRow?: boolean
}

interface FieldWrapperProps {
  inner: InnerRender
  props: WidgetProps
  options?: WrapperOptions
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  inner,
  props,
  options = {},
}) => {
  const { includeTags = false, skipTitleRow = false } = options
  const aiFeatures = useAIFeatures()
  const { addToast } = useToastContext()
  const { id, uiSchema, schema, formContext } = props
  const tags: TagBtnProp[] =
    includeTags && uiSchema?.['ui:tags'] ? uiSchema['ui:tags'] : []
  const switchButtonRef = useRef<HTMLDivElement>(null)

  const isIdeaSubmissionForm = () =>
    formContext.formType === ExtendedFormDashboardFormType.IdeaSubForm

  // Check if form is submitted (completed status) - disable all fields
  const isFormSubmitted = formContext?.formStatus === FormStatus.Submitted

  // Get question text from schema or uiSchema
  const questionText =
    schema?.title || uiSchema?.['ui:title'] || schema?.description || ''

  // Get placeholder from uiSchema (supports both ui:placeHolder and ui:options.placeHolder)
  const uiPlaceholder =
    uiSchema?.['ui:placeHolder'] || uiSchema?.['ui:options']?.placeHolder

  // Check if this field has AI features enabled
  const isAIFeatureEnabled =
    includeTags && tags.some(tag => tag.isAIFeatureEnable === true)

  // Get IDs for checking field-specific extraction
  const questionId = useMemo(() => props.id.replace(/^root_/, ''), [props.id])
  const submissionId = formContext?.submissionId || aiFeatures.submissionId

  // Use AI switch hook
  const {
    aiSwitchEnabled,
    setAiSwitchEnabled,
    showSwitchInfoModal,
    isFirstField,
    handleSwitchModalClose,
  } = useAISwitch({
    isAIFeatureEnabled,
    isIdeaSubmissionForm: isIdeaSubmissionForm(),
    questionId,
    submissionId,
  })

  // Wrap onChange to update context when value changes
  const wrappedOnChange = (value: unknown) => {
    props.onChange(value)
    // Update input value in context for fields with AI features enabled OR Idea Submission Form
    if (isAIFeatureEnabled || isIdeaSubmissionForm()) {
      const valueStr = String(value || '')
      aiFeatures.updateInputValue(valueStr)

      // Enable/disable Enhance Answer based on trimmed text length > 25 AND not gibberish
      const currentQuestionId = props.id.replace(/^root_/, '')
      const trimmedText = valueStr.trim()
      const isValidInput = trimmedText.length > 25 && !isGibberish(trimmedText)
      aiFeatures.updateEnhanceAnswerEnabledForQuestion(
        currentQuestionId,
        isValidInput
      )
    }
  }

  // Handle focus to open AI features
  const handleFocus = () => {
    // Check both isAIFeatureEnabled AND isIdeaSubmissionForm to match the switch button logic
    if ((isAIFeatureEnabled || isIdeaSubmissionForm()) && aiSwitchEnabled) {
      const questionId = props.id.replace(/^root_/, '')
      aiFeatures.showAIFeatures(questionText, questionId, false)
      const currentValue = String(props.value || '')
      aiFeatures.updateInputValue(currentValue)
      const trimmedText = currentValue.trim()
      const isValidInput = trimmedText.length > 25 && !isGibberish(trimmedText)
      aiFeatures.updateEnhanceAnswerEnabledForQuestion(questionId, isValidInput)
    }
  }

  // Determine if AI features should be allowed for this field
  const shouldAllowAIFeatures = useMemo(() => {
    if (isIdeaSubmissionForm()) {
      // For idea submission forms, allow AI features if:
      // 1. Field has AI features enabled AND AI switch is enabled
      return isAIFeatureEnabled && aiSwitchEnabled
    } else {
      // For other forms with AI-enabled tags, always allow
      return isAIFeatureEnabled
    }
  }, [isIdeaSubmissionForm, isAIFeatureEnabled, aiSwitchEnabled])

  // Determine if AI switch should be shown
  const shouldShowAISwitch = useMemo(() => {
    return isAIFeatureEnabled
  }, [isAIFeatureEnabled])

  // Create new props with wrapped onChange and apply disabled state if form is submitted
  // Also disable fields when AI features card is visible
  // Include placeholder from uiSchema if available, otherwise use the default placeholder
  const wrappedProps = {
    ...props,
    onChange: wrappedOnChange,
    onFocus: (id: string, value: any) => {
      // Only allow focus if shouldAllowAIFeatures is true
      if (shouldAllowAIFeatures) {
        handleFocus()
      }

      // Also call the original onFocus if it exists
      if (props.onFocus) {
        props.onFocus(id, value)
      }
    },
    disabled:
      props.disabled ||
      isFormSubmitted ||
      (aiFeatures.isVisible &&
        (isAIFeatureEnabled || isIdeaSubmissionForm()) &&
        aiSwitchEnabled),
    readonly:
      props.readonly ||
      isFormSubmitted ||
      (aiFeatures.isVisible &&
        (isAIFeatureEnabled || isIdeaSubmissionForm()) &&
        aiSwitchEnabled),
    placeholder: uiPlaceholder || props.placeholder,
  }

  return (
    <>
      {aiFeatures.isVisible &&
        (isAIFeatureEnabled || isIdeaSubmissionForm()) &&
        aiSwitchEnabled && (
          <div className={formStyles.formContent__blurOverlay} />
        )}
      <div
        key={id}
        className={formStyles.formContent__field}
        data-testid={`form-field-${id}`}
      >
        {!skipTitleRow && (
          <div className={formStyles.formContent__fieldTitleRow}>
            <div className={formStyles.formContent__fieldTitleRowContent}>
              <p>
                {props.label}
                {props.required && (
                  <span className={formStyles.formContent__required}>*</span>
                )}
                {uiSchema?.['ui:toolTip'] && (
                  <span
                    className={formStyles.formContent__tooltipIcon}
                    onClick={event => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                  >
                    <LdsTooltip
                      hideIcon
                      tooltipMode="text"
                      className={styles.wideTooltip}
                    >
                      <LdsTooltip.Text>
                        <LdsIcon
                          name="copy inline"
                          className={`info ${styles.wrapField__tooltip}`}
                        />
                      </LdsTooltip.Text>
                      <LdsTooltip.Description>
                        {uiSchema?.['ui:toolTip']}
                      </LdsTooltip.Description>
                    </LdsTooltip>
                  </span>
                )}
              </p>
            </div>
            {shouldShowAISwitch && (
              <div
                className={formStyles.formContent__aiSwitch}
                ref={switchButtonRef}
              >
                <LdsSwitch
                  id={`ai-switch-${id}`}
                  label=""
                  checked={aiSwitchEnabled && !isFormSubmitted}
                  disabled={isFormSubmitted}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const isChecked = e.target.checked
                    setAiSwitchEnabled(isChecked)
                    if (!isChecked) {
                      // User manually disabled the switch
                      aiFeatures.hideAIFeatures()
                      // Show toast notification
                      showToast({
                        addToast,
                        message: 'AI Features turned off',
                        variant: 'success',
                        timeout: 3000,
                      })
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
        <div>{inner(wrappedProps)}</div>
      </div>

      {/* Info Tour Modal for AI Switch - Only for the first field */}
      {isFirstField &&
        (isAIFeatureEnabled || isIdeaSubmissionForm()) &&
        shouldShowAISwitch && (
          <InfoTourModal
            isOpen={showSwitchInfoModal}
            onClose={handleSwitchModalClose}
            message="Switch on the toggle to use\nthe **AI response builder** for\nfilling responses. Switch off to\nenter responses manually."
            buttonText="Okay"
            position="top"
            width={400}
            targetRef={switchButtonRef}
          />
        )}
    </>
  )
}

export const wrapField = (inner: InnerRender, options: WrapperOptions = {}) => {
  return (props: WidgetProps) =>
    (<FieldWrapper inner={inner} props={props} options={options} />) as never
}
