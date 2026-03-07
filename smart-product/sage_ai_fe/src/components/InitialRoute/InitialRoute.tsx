import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useUserSubmissions } from '../../contexts/UserSubmissionsContext'

const InitialRoute: React.FC = () => {
  const { submissions, loading } = useUserSubmissions()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!loading) {
      setShouldRedirect(true)
    }
  }, [loading])

  if (loading || !shouldRedirect) {
    return <div>Loading...</div>
  }

  // If user has submissions, redirect to submitter dashboard
  // Otherwise, redirect to landing page
  const hasSubmissions = submissions && submissions.length > 0

  return (
    <Navigate
      to={hasSubmissions ? '/submitter-dashboard' : '/landing'}
      replace
    />
  )
}

export default InitialRoute
