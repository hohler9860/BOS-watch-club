import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useMatch } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import RequireRole from './components/shared/RequireRole'
import RedirectIfAuth from './components/shared/RedirectIfAuth'
import GrainOverlay from './components/shared/GrainOverlay'
import PageTransition from './components/shared/PageTransition'
import Loader from './components/shared/Loader'
import RouteLoader from './components/shared/RouteLoader'
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
const ApplyPage = lazy(() => import('./pages/ApplyPage'))
const ApplySuccessPage = lazy(() => import('./pages/ApplySuccessPage'))
const ActivatePage = lazy(() => import('./pages/ActivatePage'))
const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const GuestResponsePage = lazy(() => import('./pages/GuestResponsePage'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))

// Redesign shell + pages (outside old Layout)
const NewSiteLayout = lazy(() => import('./components/redesign/NewSiteLayout'))
const RedesignHome  = lazy(() => import('./pages/RedesignHome'))
const NewApply      = lazy(() => import('./pages/redesign/NewApply'))
const NewMembership = lazy(() => import('./pages/redesign/NewMembership'))
const NewEvents     = lazy(() => import('./pages/redesign/NewEvents'))
const NewJournal    = lazy(() => import('./pages/redesign/NewJournal'))
const NewLogin         = lazy(() => import('./pages/redesign/NewLogin'))
const NewJournalPost   = lazy(() => import('./pages/redesign/NewJournalPost'))
const NewTerms         = lazy(() => import('./pages/redesign/NewTerms'))
const NewFaq           = lazy(() => import('./pages/redesign/NewFaq'))

// AdminAuthProvider is a named export — wrap in lazy-compatible component
const LazyAdminWrapper = lazy(() =>
  import('./admin/AdminAuth').then(mod => ({
    default: function AdminWrapper({ children }) {
      return <mod.AdminAuthProvider>{children}</mod.AdminAuthProvider>
    }
  }))
)

// Suspense fallback: moonphase loader on the public site, blank dark screen
// inside the admin dashboard (no loading screen there).
function LoadingScreen() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) {
    return <div style={{ minHeight: '100vh', background: '#07090F' }} />
  }
  // Route transitions show a clean blank screen — the moonphase loader appears
  // only once, via the boot splash in index.html on the very first load.
  return <div style={{ minHeight: '100vh', background: '#ffffff' }} />
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* ── OLD SITE — wrapped in the existing Layout (Nav + Footer) ── */}
          <Route element={<Layout />}>
            <Route path="/" element={<RedirectIfAuth><PageTransition><HomePage /></PageTransition></RedirectIfAuth>} />
            <Route path="/membership" element={<RedirectIfAuth><PageTransition><MembershipPage /></PageTransition></RedirectIfAuth>} />
            <Route path="/events" element={<RedirectIfAuth><PageTransition><EventsPage /></PageTransition></RedirectIfAuth>} />
            <Route path="/blog" element={<RedirectIfAuth><PageTransition><BlogPage /></PageTransition></RedirectIfAuth>} />
            <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
            <Route path="/apply" element={<PageTransition><ApplyPage /></PageTransition>} />
            <Route path="/apply/success" element={<PageTransition><ApplySuccessPage /></PageTransition>} />
            <Route path="/login" element={<RedirectIfAuth><PageTransition><LoginPage /></PageTransition></RedirectIfAuth>} />
            <Route path="/activate" element={<PageTransition><ActivatePage /></PageTransition>} />
            <Route path="/welcome" element={
              <RequireRole minRole="free" fallbackPath="/login">
                <PageTransition><WelcomePage /></PageTransition>
              </RequireRole>
            } />
            <Route path="/upgrade" element={<PageTransition><UpgradePage /></PageTransition>} />
            <Route path="/journal/:id" element={<PageTransition><JournalPostPage /></PageTransition>} />
          </Route>

          {/* ── MEMBER DASHBOARD — standalone (self-contained sidebar chrome, editorial reskin),
              outside the old Layout so the old Nav/Footer don't wrap it ── */}
          <Route path="/dashboard" element={
            <RequireRole minRole="free" fallbackPath="/login">
              <PageTransition><DashboardPage /></PageTransition>
            </RequireRole>
          } />

          {/* ── REDESIGN SITE — standalone shell, outside Layout, outside RedirectIfAuth ── */}
          {/* CineNav + Outlet + CineFooter are provided by NewSiteLayout.                  */}
          <Route path="/redesign" element={<NewSiteLayout />}>
            <Route index element={<RedesignHome />} />
            <Route path="apply"      element={<NewApply />} />
            <Route path="membership" element={<NewMembership />} />
            <Route path="events"     element={<NewEvents />} />
            <Route path="journal"    element={<NewJournal />} />
            <Route path="login"      element={<NewLogin />} />
            <Route path="journal/:id" element={<NewJournalPost />} />
            <Route path="terms"      element={<NewTerms />} />
            <Route path="faq"        element={<NewFaq />} />
          </Route>

          {/* ── OTHER ── */}
          <Route path="/onboarding" element={
            <RequireRole minRole="free" fallbackPath="/login">
              <OnboardingPage />
            </RequireRole>
          } />
          <Route path="/admin" element={
            <Suspense fallback={<LoadingScreen />}>
              <LazyAdminWrapper><AdminLayout /></LazyAdminWrapper>
            </Suspense>
          } />
          <Route path="/guest-response" element={<PageTransition><GuestResponsePage /></PageTransition>} />
          {/* Unknown routes fall back into the redesign rather than the old 404 page */}
          <Route path="*" element={<Navigate to="/redesign" replace />} />

        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

// Suppress GrainOverlay on all /redesign/* routes — those pages use kk-noise-overlay
function ConditionalGrainOverlay() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/redesign')) return null
  return <GrainOverlay />
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
            <ConditionalGrainOverlay />
            <AnimatedRoutes />
            <Analytics />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
