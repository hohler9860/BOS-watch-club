import { Navigate } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../../hooks/useAuth'

/**
 * Route guard that checks user role.
 * - minRole="free"    → any logged-in user
 * - minRole="member"  → only users who redeemed an access code
 * - fallback          → what to render when role is insufficient (defaults to redirect)
 */
export default function RequireRole({ minRole = 'free', fallbackPath = '/upgrade', children }) {
  const { member, loading } = useAuth()

  if (loading) return null

  // Not logged in at all → send to login
  if (!member) return <Navigate to="/login" replace />

  // Logged in but role too low → send to activate (or custom fallback)
  if (!roleMeetsMinimum(member.role, minRole)) {
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
