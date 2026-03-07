import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { userApi } from '../core/api/user.api'
import { UserProfile } from '../core/models/user.model'

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: React.ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const userProfile = await userApi.getUserInfo()
      setUser(userProfile)
    } catch (err) {
      console.error('Error fetching user info:', err)
      setError('Failed to fetch user information')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const value: UserContextType = useMemo(
    () => ({
      user,
      loading,
      error,
      refetch: fetchUser,
    }),
    [user, loading, error]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
