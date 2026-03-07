import {
  LdsButton,
  LdsIcon,
  LdsTabPanel,
  LdsTabs,
} from '@elilillyco/ux-lds-react'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SubmissionCard } from '../../components/SubmissionCard/SubmissionCard'
import { useUser } from '../../contexts/UserContext'
import { useUserSubmissions } from '../../contexts/UserSubmissionsContext'
import {
  SubmissionStatus,
  UserIdeaSubmission,
} from '../../core/models/dashboard.model'
import styles from './SubmitterDashboard.module.scss'

interface SubmitterDashboardProps {
  userName?: string
}

const SubmitterDashboard: React.FC<SubmitterDashboardProps> = ({
  userName,
}) => {
  // Get user info and submissions from context
  const { user } = useUser()
  const { submissions: userSubmissions, refetch } =
    useUserSubmissions()
  const navigate = useNavigate()

  // Filter out submissions with blank or undefined titles
  const validSubmissions = useMemo(
    () => (userSubmissions || []).filter(s => s.title && s.title.trim() !== ''),
    [userSubmissions]
  )

  const calculateCountByStatus = (
    submissions: UserIdeaSubmission[],
    status: SubmissionStatus
  ) => {
    return submissions.filter(s => s.status === status).length
  }

  // Map tabs to status filters
  const tabDefs = [
    {
      tabId: 1,
      label: `All Submissions (${validSubmissions.length})`,
      filter: (_s: UserIdeaSubmission) => true,
    },
    {
      tabId: 2,
      label: `In Progress (${calculateCountByStatus(validSubmissions, 'submitted')})`,
      filter: (s: UserIdeaSubmission) => s.status === 'submitted',
    },
    {
      tabId: 3,
      label: `Completed (${calculateCountByStatus(validSubmissions, 'completed')})`,
      filter: (s: UserIdeaSubmission) => s.status === 'completed',
    },
  ]

  const [activeTab, setActiveTab] = useState<number>(1)
  /** Commenting this code as BE is not yet developed for Search and Filter functionality. Will be uncommenting it once BE is developed */
  const [searchTerm, setSearchTerm] = useState<string>('')
  // const [filterLoading, setFilterLoading] = useState<boolean>(false)

  // const handleFilter = () => {
  //   setFilterLoading(true)
  //   // Simulate async filter
  //   setTimeout(() => {
  //     setFilterLoading(false)
  //   }, 600)
  // }

  const filteredData = useMemo(() => {
    const def = tabDefs.find(t => t.tabId === activeTab)
    const base = def ? validSubmissions.filter(def.filter) : validSubmissions
    const term = searchTerm.trim().toLowerCase()
    if (!term) return base
    return base.filter((s: UserIdeaSubmission) =>
      [s.title, s.category_name, s.status, s.submitted_at].some(v =>
        v ? String(v).toLowerCase().includes(term) : false
      )
    )
  }, [activeTab, validSubmissions, searchTerm])

  const renderCards = (list: UserIdeaSubmission[]) => {
    if (!list.length) return <p>No submissions found.</p>
    return (
      <div className={styles.cardsGrid}>
        {list.map(item => (
          <SubmissionCard
            key={item.id}
            id={item.id}
            title={item.title}
            data-testid={`submission-card-${item.id}`}
            ticketNumber={item.id}
            description={`Submitted at: ${item.submitted_at}`}
            aiRegistryFormId={item.ai_registry_update_form_id?.trim() || ''}
            status={item.status}
            submitted_at={item.submitted_at}
            onUpdate={id => navigate(`/form-dashboard/${id}`)}
            onRefresh={refetch}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className={styles.pageTitleRow}>
        <div className={styles.titleBlock}>
          <h1>
            Welcome,
            <span className={styles.highlightText}>
              {' '}
              {user?.name || userName || ''}!
            </span>{' '}
          </h1>
          <p>
            Form submissions are tedious and time consuming, but necessary.
            SAGE.AI makes it easier.
          </p>
        </div>
        <LdsButton
          iconPosition="after"
          icon="arrow-right"
          aria-label="Button labeled Start Submission"
          className={styles.startNewBtn}
          onClick={() => navigate('/begin')}
        >
          Start New Submission
        </LdsButton>
      </div>
      <main
        aria-label="Submitter Dashboard"
        data-testid="submitter-dashboard-page"
        className={styles.submitterDashboardPage}
      >
        {/* Search + Filter Frame */}
        <div
          className={styles.filterRow}
          aria-label="Search and filter submissions"
        >
          <div className={styles.searchWrapper}>
            <h2 className={styles.searchSubtitle}>Your Submissions</h2>
            <div className={styles.searchBarContainer}>
              <div className={styles.searchInputWrapper}>
                <LdsIcon
                  name="magnifying-glass"
                  className={styles.searchIcon}
                  style={{ backgroundColor: '#99A1AF' }}
                />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  aria-label="Search submissions"
                />
              </div>
            </div>
          </div>
          {/* Commenting this code as Filter functionality is not yet developed by BE. */}
          {/* {filterLoading ? (
          <Link
            to="#"
            className={styles.loadingButtonLink}
            aria-disabled="true"
          >
            Filtering...
          </Link>
        ) : (
          <Link
            to="#"
            onClick={e => {
              e.preventDefault()
              handleFilter()
            }}
            className={styles.filterButtonLink}
          >
            Filter
          </Link>
        )} */}
        </div>

        {/* Tabs */}
        <div className={styles.tabsWrapper}>
          <LdsTabs
            tabClass="underlined"
            tabLabels={tabDefs.map(t => ({ tabId: t.tabId, label: t.label }))}
            activeTab={activeTab}
            onChange={(arg: any) => {
              if (typeof arg === 'number') {
                setActiveTab(arg)
                return
              }
              if (arg && typeof arg === 'object' && 'tabId' in arg) {
                setActiveTab((arg as any).tabId)
                return
              }
              if (arg?.target?.value) {
                const maybe = parseInt(arg.target.value, 10)
                if (!isNaN(maybe)) {
                  setActiveTab(maybe)
                }
              }
            }}
          >
            {tabDefs.map(def => (
              <LdsTabPanel
                key={def.tabId}
                tabId={def.tabId}
                activeTab={activeTab}
              >
                {renderCards(filteredData)}
              </LdsTabPanel>
            ))}
          </LdsTabs>
        </div>
      </main>
    </div>
  )
}

export default SubmitterDashboard
