import { Navigate } from 'react-router'
import useAuth from '../../hooks/useAuth'

export default function RedirectIfAuth({ to, children }) {
  const { member, loading } = useAuth()

  // Show children while auth is loading — don't block rendering
  if (loading) return children

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
