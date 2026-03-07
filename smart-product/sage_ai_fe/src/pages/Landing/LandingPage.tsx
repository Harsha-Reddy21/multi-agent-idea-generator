import { LdsButton } from '@elilillyco/ux-lds-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LandingPageCard from '@/components/LandingPageCard/LandingPageCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { serviceNowApi } from '@/core/api/service-now.api'
import {
  DashboardLatestIdeasResponse,
  TopIdeaResponse,
} from '@/core/models/dashboard.model'

import aiIcon from '../../../src/assets/ai_assist.svg'
import styles from './LandingPage.module.scss'

const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [, setNewIdeaCount] = useState<number>(0)
  const [, setTopIdeas] = useState<TopIdeaResponse[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLatestIdeas = async () => {
      try {
        setIsLoading(true)
        const response: DashboardLatestIdeasResponse =
          await serviceNowApi.getApprovedIdeasDashboard()
        if (
          response &&
          typeof response.approved_count === 'number' &&
          response.approved_count >= 0
        ) {
          setNewIdeaCount(response.approved_count)
          if (response.top_ideas && Array.isArray(response.top_ideas)) {
            setTopIdeas(response.top_ideas)
          }
        }
      } catch (error) {
        console.error('Error fetching latest ideas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLatestIdeas()
  }, [])

  {
    /*  COMMENTING THIS AS PER REQUIREMENT  */
  }
  // const formatUserName = (name: string) => {
  //   const employeeNameWithoutId = name.split('(')[0].trim()
  //   // Capitalize first letter of each word
  //   return employeeNameWithoutId
  //     .toLowerCase()
  //     .split(' ')
  //     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(' ')
  // }
  // const truncate = (text: string, max: number) => {
  //   if (text.length <= max) return text

  //   const slice = text.slice(0, max).replace(/\s+$/, '')
  //   const lastSpace = slice.lastIndexOf(' ')

  //   if (lastSpace === -1) {
  //     return slice + '…'
  //   }
  //   return slice.slice(0, lastSpace) + '…'
  // }

  if (isLoading) {
    return <LoadingSpinner message="Loading form data...." />
  }

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.landingPage} data-testid="landing-page">
        {/* Intro header section */}
        <section className={styles.introSection} aria-label="Sage.AI Intro">
          <div className={styles.introHeadingGroup}>
            <div className={styles.badge}>
              <img src={aiIcon} alt="AI Assist Icon" />
              <span className={styles.badgeText}>AI-Powered Innovation</span>
            </div>
            <h1 className={styles.introTitle}>SAGE.AI</h1>
            <h2 className={styles.introSubtitle}>Smart AI Governance Engine</h2>
          </div>
          <p className={styles.introDescription}>
            Seamless submissions within one intelligent platform.
          </p>
          <div className={styles.introActions}>
            <LdsButton
              className={`filled ${styles.introCta}`}
              iconPosition="after"
              icon="arrow-right"
              aria-label="Start New Submission"
              onClick={() => navigate('/begin')}
            >
              Start New Submission
            </LdsButton>
          </div>
        </section>
        <div className={styles.cardsGrid}>
          {/* 1. Learn How It Works Card */}
          <LandingPageCard
            title="Explore SAGE.AI in Action​"
            description="Watch a short video to learn more about how SAGE.AI works for you.​"
          >
            <div className={styles.videoWrapper}>
              <video
                className={styles.video}
                controls
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                aria-label="Introductory Sage.AI Video"
              />
            </div>
          </LandingPageCard>

          {/* 2. COMMENTING THIS AS PER REQUIREMENT  */}
          {/* <LandingPageCard
            title="Review Winning Concepts"
            description="Explore standout ideas to guide your own path to approval."
            preserveWhitespace={false}
          >
            <div className={styles.ideasList}>
              {topIdeas.map((idea, idx) => (
                <div
                  key={`top-idea-${idx}`}
                  className={`${styles.ideaItem} ${styles.text}`}
                >
                  <h4 className={`${styles.ideaTitle} ${styles.text}`}>
                    {idea.ai_system_name}
                  </h4>
                  <p className={`${styles.ideaText} ${styles.text}`}>
                    {truncate(idea.problem_statement, 150)}
                  </p>
                  <p className={styles.ideaAuthor}>
                    by {formatUserName(idea.submitted_by.user_name)}
                  </p>
                </div>
              ))}
            </div>
          </LandingPageCard> */}

          {/* 3. Submit Your First Idea Card */}
          <LandingPageCard
            title="Discover What's Next​"
            // Commented out for now until we have a better way to surface new idea count
            // descriptionEmphasis={`${newIdeaCount} new AI ideas `}
            description={
              'Form submissions are tedious and time consuming, but necessary.​ SAGE.AI makes it easier.  ​ Submit, track, and manage all your initial submissions in one place.​'
            }
          >
            <div>
              <p>Your big idea starts here:</p>
              <ul>
                <li>Complete a brief questionnaire</li>
                <li>Upload your documents</li>
                <li>Get feedback</li>
              </ul>
              <LdsButton
                className={`filled ${styles.introCta} ${styles.secondaryButton}`}
                aria-label="Start New Submission"
                onClick={() => navigate('/begin')}
              >
                Start New Submission
              </LdsButton>
            </div>
          </LandingPageCard>
        </div>
        <div className={styles.bottomDecor} aria-hidden="true" />
      </main>
    </div>
  )
}

export default LandingPage
