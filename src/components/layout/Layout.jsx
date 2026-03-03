import { Outlet, useLocation } from 'react-router'
import { useEffect, useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  const [applyCallback, setApplyCallback] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <Nav onApplyClick={applyCallback} />
      <Outlet context={{ setApplyCallback }} />
      <Footer />
    </>
  )
}
