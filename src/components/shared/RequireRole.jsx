import { Navigate } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../../hooks/useAuth'

/**
 * Route guard that checks user role.
 * - minRole="free"    → any logged-in user
 * - minRole="member"  → only users who redeemed an access code
 * - fallback          → what to render when role is insufficient (defaults to redirect)
 */
export default function RequireRole({ minRole = 'free', fallbackPath = '/membership', children }) {
  const { member, loading } = useAuth()

  if (loading) return (
    <section style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07090F' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(232,236,240,0.1)', borderTopColor: 'rgba(232,236,240,0.5)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </section>
  )

  // Not logged in at all → send to login
  if (!member) return <Navigate to="/login" replace />

  // Logged in but role too low → send to activate (or custom fallback)
  if (!roleMeetsMinimum(member.role, minRole)) {
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
