import { Navigate } from 'react-router-dom'

import { useUserSubmissions } from '../../contexts/UserSubmissionsContext'

interface ProtectedRouteProps {
  children: React.ReactElement
  requiresNoSubmissions?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresNoSubmissions = false,
}) => {
  const { submissions, loading } = useUserSubmissions()

  if (loading) {
    return <div>Loading...</div>
  }

  const hasSubmissions = submissions && submissions.length > 0

  // If route requires no submissions (like /landing) but user has submissions
  if (requiresNoSubmissions && hasSubmissions) {
    return <Navigate to="/submitter-dashboard" replace />
  }

  return children
}

export default ProtectedRoute
