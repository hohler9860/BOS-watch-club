import { Outlet, useLocation } from 'react-router'
import { useEffect, useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  const [applyCallback, setApplyCallback] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <Nav onApplyClick={applyCallback} />
      <Outlet context={{ setApplyCallback }} />
      <Footer />
    </>
  )
}
