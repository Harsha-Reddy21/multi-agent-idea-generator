import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'

interface AIFeaturesContextType {
  isVisible: boolean
  questionText: string
  questionId: string
  submissionId: string
  formId: string
  inputValue: string
  enhanceAnswerEnabled: boolean
  enhanceAnswerEnabledByQuestion: Record<string, boolean>
  coverageScores: Record<string, number>
  dataExtractOnly: boolean
  showAIFeatures: (
    text: string,
    questionId: string,
    dataExtractOnly?: boolean
  ) => void
  hideAIFeatures: () => void
  updateQuestionText: (text: string) => void
  updateInputValue: (value: string) => void
  updateSubmissionInfo: (submissionId: string, formId: string) => void
  updateEnhanceAnswerEnabled: (enabled: boolean) => void
  updateEnhanceAnswerEnabledForQuestion: (
    questionId: string,
    enabled: boolean
  ) => void
  isEnhanceAnswerEnabledForQuestion: (questionId: string) => boolean
  updateCoverageScore: (questionId: string, score: number) => void
  getCoverageScores: () => Record<string, number>
}

const AIFeaturesContext = createContext<AIFeaturesContextType | undefined>(
  undefined
)

export const AIFeaturesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [questionId, setQuestionId] = useState('')
  const [submissionId, setSubmissionId] = useState('')
  const [formId, setFormId] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [enhanceAnswerEnabled, setEnhanceAnswerEnabled] = useState(false)
  const [enhanceAnswerEnabledByQuestion, setEnhanceAnswerEnabledByQuestion] =
    useState<Record<string, boolean>>({})
  const [coverageScores, setCoverageScores] = useState<Record<string, number>>(
    {}
  )
  const [dataExtractOnly, setDataExtractOnly] = useState<boolean>(false)

  const showAIFeatures = (text: string, qId: string, dExtractOnly = false) => {
    setQuestionText(text)
    setQuestionId(qId)
    setIsVisible(true)
    setDataExtractOnly(Boolean(dExtractOnly))
  }

  const hideAIFeatures = () => {
    setIsVisible(false)
  }

  const updateQuestionText = (text: string) => {
    setQuestionText(text)
  }

  const updateInputValue = (value: string) => {
    setInputValue(value)
  }

  const updateSubmissionInfo = (subId: string, fId: string) => {
    setSubmissionId(subId)
    setFormId(fId)
  }

  const updateEnhanceAnswerEnabled = (enabled: boolean) => {
    setEnhanceAnswerEnabled(enabled)
  }

  const updateEnhanceAnswerEnabledForQuestion = (
    qId: string,
    enabled: boolean
  ) => {
    setEnhanceAnswerEnabledByQuestion(prev => ({
      ...prev,
      [qId]: enabled,
    }))
  }

  const isEnhanceAnswerEnabledForQuestion = (qId: string): boolean => {
    return enhanceAnswerEnabledByQuestion[qId] ?? false
  }

  const updateCoverageScore = (qId: string, score: number) => {
    setCoverageScores(prev => ({
      ...prev,
      [qId]: score,
    }))
  }

  const getCoverageScores = (): Record<string, number> => {
    return coverageScores
  }

  const value = useMemo(
    () => ({
      isVisible,
      questionText,
      questionId,
      submissionId,
      formId,
      inputValue,
      enhanceAnswerEnabled,
      enhanceAnswerEnabledByQuestion,
      coverageScores,
      dataExtractOnly,
      showAIFeatures,
      hideAIFeatures,
      updateQuestionText,
      updateInputValue,
      updateSubmissionInfo,
      updateEnhanceAnswerEnabled,
      updateEnhanceAnswerEnabledForQuestion,
      isEnhanceAnswerEnabledForQuestion,
      updateCoverageScore,
      getCoverageScores,
    }),
    [
      isVisible,
      questionText,
      questionId,
      submissionId,
      formId,
      inputValue,
      enhanceAnswerEnabled,
      enhanceAnswerEnabledByQuestion,
      coverageScores,
      dataExtractOnly,
    ]
  )

  return (
    <AIFeaturesContext.Provider value={value}>
      {children}
    </AIFeaturesContext.Provider>
  )
}

export const useAIFeatures = () => {
  const context = useContext(AIFeaturesContext)
  if (!context) {
    throw new Error('useAIFeatures must be used within AIFeaturesProvider')
  }
  return context
}
