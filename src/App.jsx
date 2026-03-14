import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from 'react-router'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import GrainOverlay from './components/shared/GrainOverlay'
import PageTransition from './components/shared/PageTransition'

import HomePage from './pages/HomePage'
import MembershipPage from './pages/MembershipPage'
import EventsPage from './pages/EventsPage'
import TermsPage from './pages/TermsPage'
import LoginPage from './pages/LoginPage'
import BlogPage from './pages/BlogPage'
import DashboardPage from './pages/DashboardPage'
import ActivatePage from './pages/ActivatePage'
import LaunchingSoonPage from './pages/LaunchingSoonPage'
import { AdminAuthProvider } from './admin/AdminAuth'
import AdminLayout from './admin/AdminLayout'
import { Analytics } from '@vercel/analytics/react'

const DEV_STORAGE_KEY = 'bwc_dev_mode'

function useDevMode() {
  const [searchParams] = useSearchParams()
  const [devMode, setDevMode] = useState(() => sessionStorage.getItem(DEV_STORAGE_KEY) === 'true')

  useEffect(() => {
    if (searchParams.get('dev') === 'true') {
      sessionStorage.setItem(DEV_STORAGE_KEY, 'true')
      setDevMode(true)
    }
  }, [searchParams])

  return devMode
}

function AnimatedRoutes() {
  const location = useLocation()
  const devMode = useDevMode()

  if (!devMode) {
    return <LaunchingSoonPage />
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/membership" element={<PageTransition><MembershipPage /></PageTransition>} />
          <Route path="/events" element={<PageTransition><EventsPage /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/activate" element={<PageTransition><ActivatePage /></PageTransition>} />
        </Route>
        <Route path="/admin" element={<AdminAuthProvider><AdminLayout /></AdminAuthProvider>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <GrainOverlay />
          <AnimatedRoutes />
          <Analytics />
      </AuthProvider>
    </BrowserRouter>
  )
}
