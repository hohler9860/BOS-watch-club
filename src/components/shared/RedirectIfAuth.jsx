import { Navigate } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../../hooks/useAuth'

export default function RedirectIfAuth({ to, children }) {
  const { member, loading } = useAuth()

  if (loading) return null

  if (member) {
    let destination = to
    if (!destination) {
      if (member.onboardingComplete) {
        destination = '/dashboard'
      } else if (roleMeetsMinimum(member.role, 'member')) {
        destination = '/onboarding'
      } else {
        destination = '/upgrade'
      }
    }
    return <Navigate to={destination} replace />
  }

  return children
}
