import { Navigate } from 'react-router'
import useAuth from '../../hooks/useAuth'

export default function RedirectIfAuth({ to = '/dashboard', children }) {
  const { member, loading } = useAuth()

  if (loading) return null
  if (member) return <Navigate to={to} replace />

  return children
}
