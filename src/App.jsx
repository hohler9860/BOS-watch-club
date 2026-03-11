import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
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
import { AdminAuthProvider } from './admin/AdminAuth'
import AdminLayout from './admin/AdminLayout'

function AnimatedRoutes() {
  const location = useLocation()

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
      </AuthProvider>
    </BrowserRouter>
  )
}
