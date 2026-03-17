import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import RequireRole from './components/shared/RequireRole'
import RedirectIfAuth from './components/shared/RedirectIfAuth'
import GrainOverlay from './components/shared/GrainOverlay'
import PageTransition from './components/shared/PageTransition'

import HomePage from './pages/HomePage'
import MembershipPage from './pages/MembershipPage'
import EventsPage from './pages/EventsPage'
import TermsPage from './pages/TermsPage'
import LoginPage from './pages/LoginPage'
import BlogPage from './pages/BlogPage'
import DashboardPage from './pages/DashboardPage'
import UpgradePage from './pages/UpgradePage'
import JournalPostPage from './pages/JournalPostPage'
import OnboardingPage from './pages/OnboardingPage'
import { AdminAuthProvider } from './admin/AdminAuth'
import AdminLayout from './admin/AdminLayout'
import { Analytics } from '@vercel/analytics/react'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<RedirectIfAuth><PageTransition><HomePage /></PageTransition></RedirectIfAuth>} />
          <Route path="/membership" element={<RedirectIfAuth><PageTransition><MembershipPage /></PageTransition></RedirectIfAuth>} />
          <Route path="/events" element={<RedirectIfAuth><PageTransition><EventsPage /></PageTransition></RedirectIfAuth>} />
          <Route path="/blog" element={<RedirectIfAuth><PageTransition><BlogPage /></PageTransition></RedirectIfAuth>} />
          <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
          <Route path="/login" element={<RedirectIfAuth><PageTransition><LoginPage /></PageTransition></RedirectIfAuth>} />
          <Route path="/upgrade" element={<PageTransition><UpgradePage /></PageTransition>} />
          <Route path="/journal/:id" element={<PageTransition><JournalPostPage /></PageTransition>} />
          <Route path="/onboarding" element={
            <RequireRole minRole="free" fallbackPath="/login">
              <OnboardingPage />
            </RequireRole>
          } />
          <Route path="/dashboard" element={
            <PageTransition>
              <RequireRole minRole="free" fallbackPath="/login">
                <DashboardPage />
              </RequireRole>
            </PageTransition>
          } />
        </Route>
        <Route path="/admin" element={<AdminAuthProvider><AdminLayout /></AdminAuthProvider>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
            <GrainOverlay />
            <AnimatedRoutes />
            <Analytics />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
