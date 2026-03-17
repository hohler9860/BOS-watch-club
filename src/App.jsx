import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import RequireRole from './components/shared/RequireRole'
import RedirectIfAuth from './components/shared/RedirectIfAuth'
import GrainOverlay from './components/shared/GrainOverlay'
import PageTransition from './components/shared/PageTransition'
import { Analytics } from '@vercel/analytics/react'

// Eagerly load the homepage (first paint)
import HomePage from './pages/HomePage'

// Lazy load everything else
const MembershipPage = lazy(() => import('./pages/MembershipPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const UpgradePage = lazy(() => import('./pages/UpgradePage'))
const JournalPostPage = lazy(() => import('./pages/JournalPostPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
// AdminAuthProvider is a named export — wrap in lazy-compatible component
const LazyAdminWrapper = lazy(() =>
  import('./admin/AdminAuth').then(mod => ({
    default: function AdminWrapper({ children }) {
      return <mod.AdminAuthProvider>{children}</mod.AdminAuthProvider>
    }
  }))
)

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <Suspense fallback={null}>
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
          <Route path="/admin" element={
            <Suspense fallback={null}>
              <LazyAdminWrapper><AdminLayout /></LazyAdminWrapper>
            </Suspense>
          } />
          <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
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
