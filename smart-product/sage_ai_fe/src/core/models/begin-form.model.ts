export interface BeginFormAnswer {
  questionId: string
  question: string
  answer: string[]
}

export interface BeginFormRequestModel {
  submission_journey: { form_data: BeginFormAnswer[] }
  files: File[]
}

export interface BeginFormResponseModel {
  message: string
  data: {
    id: string
    categoryId: string
  }
}
