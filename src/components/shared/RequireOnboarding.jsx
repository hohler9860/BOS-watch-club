import { Navigate } from 'react-router'
import useAuth from '../../hooks/useAuth'

export default function RequireOnboarding({ children }) {
  const { member, loading, onboardingComplete } = useAuth()

  if (loading) return null
  if (!member) return <Navigate to="/login" replace />
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />

  return children
}
