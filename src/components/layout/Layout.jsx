import { Outlet, useLocation, Navigate } from 'react-router'
import { useEffect } from 'react'
import useAuth, { roleMeetsMinimum } from '../../hooks/useAuth'
import Nav from './Nav'
import Footer from './Footer'
import ToastContainer from '../shared/Toast'

const PUBLIC_ONLY_PATHS = ['/', '/membership', '/events', '/blog', '/login', '/activate']

export default function Layout() {
  const location = useLocation()
  const { member, loading } = useAuth()
  const isDashboard = location.pathname === '/dashboard'
  const isMember = member && roleMeetsMinimum(member.role, 'member')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  // Only redirect active members away from public pages (free users can still browse)
  if (isMember && PUBLIC_ONLY_PATHS.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />
  }

  // While auth is loading, don't flash public pages (they'll redirect if logged in as member)
  if (loading && PUBLIC_ONLY_PATHS.includes(location.pathname)) {
    return null
  }

  return (
    <>
      {!isDashboard && <Nav />}
      <Outlet />
      {!isDashboard && <Footer />}
      <ToastContainer />
    </>
  )
}
