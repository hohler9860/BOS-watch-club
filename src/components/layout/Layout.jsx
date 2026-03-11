import { Outlet, useLocation } from 'react-router'
import { useEffect } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import ToastContainer from '../shared/Toast'

export default function Layout() {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      {!isDashboard && <Nav />}
      <Outlet />
      {!isDashboard && <Footer />}
      <ToastContainer />
    </>
  )
}
