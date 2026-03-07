import { LdsButton } from '@elilillyco/ux-lds-react'
import React, { useEffect, useState } from 'react'

import thumbsDownIcon from '../../assets/thumbs-down.svg'
import thumbsUpIcon from '../../assets/thumbs-up.svg'
import {
  AIFeatureType,
  userFeedbackApi,
} from '../../core/api/user-feedback.api'
import {
  NEGATIVE_FEEDBACK_CHIPS,
  POSITIVE_FEEDBACK_CHIPS,
} from '../../core/constants'
import { ApiError } from '../FormContainer/types'
import styles from './UserFeedback.module.scss'

type Rating = 'positive' | 'negative' | null

export interface UserFeedbackProps {
  label?: string
  negativeFeedbackChips?: string[]
  feedbackContext?: string
  // Required props for API
  submissionId: string
  questionId: string
  formId: string
  userInput?: string
  aiFeatureType: AIFeatureType
  interactionId?: string | null
}

export const UserFeedback: React.FC<UserFeedbackProps> = ({
  label,
  negativeFeedbackChips = NEGATIVE_FEEDBACK_CHIPS,
  feedbackContext = 'this feature',
  interactionId,
}) => {
  const [rating, setRating] = useState<Rating>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Reset state when interactionId changes (switching between different AI features)
  useEffect(() => {
    setRating(null)
    setIsFormVisible(false)
    setSelectedChips([])
    setComment('')
    setIsSubmitting(false)
    setFeedbackSubmitted(false)
  }, [interactionId])

  const MAX_CHARS = 500
  const chips =
    rating === 'negative' ? negativeFeedbackChips : POSITIVE_FEEDBACK_CHIPS
  const isSubmitted = rating && !isFormVisible

  const handleRatingClick = (type: 'positive' | 'negative') => {
    // Prevent multiple feedbacks for the same interaction
    if (feedbackSubmitted) {
      return
    }

    setRating(type)
    if (type === 'positive') {
      // For positive feedback, close form immediately and submit
      setIsFormVisible(false)
      setIsSubmitting(true)
      userFeedbackApi
        .submitFeedback({
          feedback_type: 'like',
          feedback_tags: null,
          user_comment: null,
          is_accepted: false,
          interaction_id: interactionId || null,
        })
        .then(() => {
          // Successfully submitted
          setFeedbackSubmitted(true)
        })
        .catch((error: ApiError) => {
          // Handle 409 Conflict (duplicate feedback)
          if (error.status === 409) {
            setFeedbackSubmitted(true)
            console.log('Feedback already submitted for this interaction')
          } else {
            // Reset on other errors to allow retry
            setRating(null)
            console.error('Failed to submit feedback:', error)
          }
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    } else {
      // For negative feedback, show the form
      setIsFormVisible(true)
    }
  }

  const handleChipToggle = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    )
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setComment(value.length > MAX_CHARS ? value.slice(0, MAX_CHARS) : value)
  }

  const handleSubmit = async () => {
    if (!rating || isSubmitting || feedbackSubmitted) return

    setIsSubmitting(true)
    try {
      await userFeedbackApi.submitFeedback({
        feedback_type: rating === 'positive' ? 'like' : 'dislike',
        feedback_tags: selectedChips.length > 0 ? selectedChips : null,
        user_comment: comment.trim() || null,
        is_accepted: false,
        interaction_id: interactionId || null,
      })
      setIsFormVisible(false)
      setFeedbackSubmitted(true)
    } catch (error) {
      // Handle 409 Conflict (duplicate feedback)
      const apiError = error as ApiError
      if (apiError.status === 409) {
        setIsFormVisible(false)
        setFeedbackSubmitted(true)
        console.log('Feedback already submitted for this interaction')
      } else {
        console.error('Failed to submit feedback:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderRatingButtons = (highlightedRating?: Rating) => (
    <div className={styles.ratingRow}>
      <span className={styles.footerLabel}>{label}</span>
      <div className={styles.ratingButtons}>
        <LdsButton
          disabled={interactionId === null || feedbackSubmitted}
          className={`${styles.ratingButton} ${
            highlightedRating === 'positive' ? styles.ratingButtonPositive : ''
          }`}
          data-testid="like-button"
          onClick={() => handleRatingClick('positive')}
        >
          <img src={thumbsUpIcon} alt="" className={styles.thumbIcon} />
        </LdsButton>
        <LdsButton
          disabled={interactionId === null || feedbackSubmitted}
          className={`${styles.ratingButton} ${
            highlightedRating === 'negative' ? styles.ratingButtonNegative : ''
          }`}
          data-testid="dislike-button"
          onClick={() => handleRatingClick('negative')}
        >
          <img src={thumbsDownIcon} alt="" className={styles.thumbIcon} />
        </LdsButton>
      </div>
      {isSubmitted && (
        <span
          className={
            rating === 'positive'
              ? styles.positiveFeedbackText
              : styles.negativeFeedbackText
          }
        >
          Thanks for your feedback!
        </span>
      )}
    </div>
  )

  return (
    <div className={styles.userFeedbackContainer}>
      {renderRatingButtons(rating)}

      {isFormVisible && (
        <>
          <h3 className={styles.heading}>
            Tell us what can be improved for {feedbackContext}
          </h3>

          <div className={styles.feedbackChipsRow}>
            {chips.map(chip => (
              <LdsButton
                key={chip}
                onClick={() => handleChipToggle(chip)}
                className={`${styles.chip} ${
                  selectedChips.includes(chip) ? styles.chipSelected : ''
                }`}
              >
                {chip}
              </LdsButton>
            ))}
          </div>

          <div className={styles.textAreaWrapper}>
            <textarea
              id="user-feedback-textarea"
              className={styles.textArea}
              value={comment}
              onChange={handleCommentChange}
              placeholder="Optional Description"
            />
            <div className={styles.charCountRow}>
              <span className={styles.charCount}>
                {comment.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          <div className={styles.submitRow}>
            <LdsButton
              classes="outlined compact radius-sm"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={selectedChips.length === 0 || isSubmitting}
              data-testid="submit-feedback-button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </LdsButton>
          </div>
        </>
      )}
    </div>
  )
}

export default UserFeedback
