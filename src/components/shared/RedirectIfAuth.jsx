import { Navigate } from 'react-router'
import useAuth from '../../hooks/useAuth'

export default function RedirectIfAuth({ to, children }) {
  const { member, loading } = useAuth()

  if (loading) return null

  if (member) {
    let destination = to
    if (!destination) {
      if (member.onboardingComplete) {
        destination = '/dashboard'
      } else {
        destination = '/onboarding'
      }
    }
    return <Navigate to={destination} replace />
  }

  return children
}
