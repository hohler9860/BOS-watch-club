import { Navigate, useSearchParams } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../../hooks/useAuth'

/**
 * Route guard that checks user role.
 * - minRole="free"    → any logged-in user
 * - minRole="member"  → only users who redeemed an access code
 * - fallback          → what to render when role is insufficient (defaults to redirect)
 *
 * Special case: ?success=true bypasses the role check so Stripe
 * redirect can land on /dashboard before the webhook upgrades the role.
 */
export default function RequireRole({ minRole = 'free', fallbackPath = '/upgrade', children }) {
  const { member, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const isStripeSuccess = searchParams.get('success') === 'true' && searchParams.get('tier')

  if (loading) return null

  // Not logged in at all → send to login
  if (!member) return <Navigate to="/login" replace />

  // Allow through if arriving from Stripe success — dashboard will handle the upgrade
  if (isStripeSuccess) return children

  // Logged in but role too low → send to activate (or custom fallback)
  if (!roleMeetsMinimum(member.role, minRole)) {
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
