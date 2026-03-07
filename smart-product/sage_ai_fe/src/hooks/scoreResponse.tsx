import { scoreApiService } from '../core/api/score.api'
import { APPROVAL_SCORE_PREFIX, FormDashboardFormType } from '../core/constants'
import { FormQuestion } from '../core/models/form.model'

export const useScoreResponse = async (
  submissionId: string,
  formType: FormDashboardFormType,
  formQuestions: FormQuestion[]
) => {
  try {
    const scoreResponse = await scoreApiService.calculateScore({
      submission_id: submissionId,
      form_data: formQuestions,
      form_type: formType,
    })

    // TODO: TEMPORARY - Store score in localStorage for demo purposes
    // This will be REMOVED once proper BE integration is complete
    // The score should come from the form dashboard API response
    if (scoreResponse.total_score !== undefined) {
      localStorage.setItem(
        `${APPROVAL_SCORE_PREFIX}-${formType}-${submissionId}`,
        (scoreResponse.total_score * 100).toFixed(2)
      )
      return scoreResponse.total_score
    }
  } catch (scoreError) {
    console.error('Error calculating score:', scoreError)
    // Don't fail the whole submission if scoring fails
  }
}
