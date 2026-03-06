import { Outlet, useLocation } from 'react-router'
import { useEffect } from 'react'
import Nav from './Nav'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname])

  return (
    <>
      <Nav />
      <Outlet />
      <Footer />
    </>
  )
}
