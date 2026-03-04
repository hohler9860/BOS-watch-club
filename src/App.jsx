import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router'
import Layout from './components/layout/Layout'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
import HomePage from './pages/HomePage'
import MembershipPage from './pages/MembershipPage'
import EventsPage from './pages/EventsPage'
import TermsPage from './pages/TermsPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
