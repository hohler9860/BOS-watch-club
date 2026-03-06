import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router'
import { AuthProvider } from './hooks/useAuth'
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
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
