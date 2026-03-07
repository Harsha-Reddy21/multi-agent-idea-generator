import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { dashboardApi } from '../core/api/dashboard.api'
import { UserIdeaSubmission } from '../core/models/dashboard.model'
import { useUser } from './UserContext'

interface UserSubmissionsContextType {
  submissions: UserIdeaSubmission[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const UserSubmissionsContext = createContext<
  UserSubmissionsContextType | undefined
>(undefined)

export const useUserSubmissions = () => {
  const context = useContext(UserSubmissionsContext)
  if (!context) {
    throw new Error(
      'useUserSubmissions must be used within UserSubmissionsProvider'
    )
  }
  return context
}

interface UserSubmissionsProviderProps {
  children: React.ReactNode
}

export const UserSubmissionsProvider: React.FC<
  UserSubmissionsProviderProps
> = ({ children }) => {
  const { user, loading: userLoading } = useUser()
  const [submissions, setSubmissions] = useState<UserIdeaSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardApi.getUserSubmissions()
      setSubmissions(response.data || [])
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError('Failed to fetch submissions')
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch submissions after user info is loaded
    if (!userLoading && user) {
      fetchSubmissions()
    } else if (!userLoading && !user) {
      // User info failed to load
      setLoading(false)
    }
  }, [userLoading, user])

  const value: UserSubmissionsContextType = useMemo(
    () => ({
      submissions,
      loading,
      error,
      refetch: fetchSubmissions,
    }),
    [submissions, loading, error]
  )

  return (
    <UserSubmissionsContext.Provider value={value}>
      {children}
    </UserSubmissionsContext.Provider>
  )
}
