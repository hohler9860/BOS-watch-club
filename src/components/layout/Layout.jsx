import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect } from 'react'
import useAuth from '../../hooks/useAuth'
import Nav from './Nav'
import Footer from './Footer'
import ToastContainer from '../shared/Toast'

const PUBLIC_ONLY_PATHS = ['/', '/membership', '/events', '/blog', '/login', '/activate']

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { member } = useAuth()
  const isDashboard = location.pathname === '/dashboard'

  useEffect(() => {
    if (member && PUBLIC_ONLY_PATHS.includes(location.pathname)) {
      navigate('/dashboard', { replace: true })
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname, member, navigate])

  return (
    <>
      {!isDashboard && <Nav />}
      <Outlet />
      {!isDashboard && <Footer />}
      <ToastContainer />
    </>
  )
}
