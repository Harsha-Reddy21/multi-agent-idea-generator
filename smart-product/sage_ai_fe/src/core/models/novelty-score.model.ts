export interface GetNoveltyScoreRequest {
  'form-data': {
    questionId: string
    question: string
    answer: string
  }[]
  'submission-id': string
  'form-id': string
}

export interface GetNoveltyScoreResponse {
  air_number: string
  title: string
  similarity_score: number
}
