import { lazy, Suspense, useEffect } from 'react'
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

// Lazy import wrapper that auto-recovers from stale chunks. A failed dynamic import
// almost always means a NEW deploy changed the chunk hashes while this tab still holds
// the old index.html — so the old chunk URL 404s. Instead of crashing into the error
// boundary, reload once to pull the fresh assets. The user just sees a blink, never an
// error screen. (sessionStorage guard prevents an infinite reload loop.)
function lazyWithRetry(factory) {
  return lazy(() =>
    factory().catch((err) => {
      const KEY = 'bwc-chunk-reloaded-at'
      const last = Number(sessionStorage.getItem(KEY) || 0)
      // only auto-reload if we haven't already done so in the last 10s
      if (performance.now() - last > 10000) {
        sessionStorage.setItem(KEY, String(performance.now()))
        window.location.reload()
        return new Promise(() => {}) // keep Suspense pending; the reload takes over
      }
      throw err
    })
  )
}

// Lazy load everything else
const MembershipPage = lazyWithRetry(() => import('./pages/MembershipPage'))
const EventsPage = lazyWithRetry(() => import('./pages/EventsPage'))
const BlogPage = lazyWithRetry(() => import('./pages/BlogPage'))
const TermsPage = lazyWithRetry(() => import('./pages/TermsPage'))
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'))
const UpgradePage = lazyWithRetry(() => import('./pages/UpgradePage'))
const JournalPostPage = lazyWithRetry(() => import('./pages/JournalPostPage'))
const OnboardingPage = lazyWithRetry(() => import('./pages/OnboardingPage'))
const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage'))
const ApplyPage = lazyWithRetry(() => import('./pages/ApplyPage'))
const ApplySuccessPage = lazyWithRetry(() => import('./pages/ApplySuccessPage'))
const ActivatePage = lazyWithRetry(() => import('./pages/ActivatePage'))
const WelcomePage = lazyWithRetry(() => import('./pages/WelcomePage'))
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'))
const GuestResponsePage = lazyWithRetry(() => import('./pages/GuestResponsePage'))
const AdminLayout = lazyWithRetry(() => import('./admin/AdminLayout'))

// Redesign shell + pages (outside old Layout)
const NewSiteLayout = lazyWithRetry(() => import('./components/redesign/NewSiteLayout'))
const RedesignHome  = lazyWithRetry(() => import('./pages/RedesignHome'))
const NewApply      = lazyWithRetry(() => import('./pages/redesign/NewApply'))
const NewMembership = lazyWithRetry(() => import('./pages/redesign/NewMembership'))
const NewEvents     = lazyWithRetry(() => import('./pages/redesign/NewEvents'))
const NewJournal    = lazyWithRetry(() => import('./pages/redesign/NewJournal'))
const NewLogin         = lazyWithRetry(() => import('./pages/redesign/NewLogin'))
const NewJournalPost   = lazyWithRetry(() => import('./pages/redesign/NewJournalPost'))
const NewTerms         = lazyWithRetry(() => import('./pages/redesign/NewTerms'))
const NewFaq           = lazyWithRetry(() => import('./pages/redesign/NewFaq'))

// AdminAuthProvider is a named export — wrap in lazy-compatible component
const LazyAdminWrapper = lazyWithRetry(() =>
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

          {/* ── PRIMARY SITE (redesign) — now at root. CineNav + Outlet + CineFooter via NewSiteLayout. ── */}
          <Route path="/" element={<NewSiteLayout />}>
            <Route index element={<RedesignHome />} />
            <Route path="apply"       element={<NewApply />} />
            <Route path="membership"  element={<NewMembership />} />
            <Route path="events"      element={<NewEvents />} />
            <Route path="journal"     element={<NewJournal />} />
            <Route path="login"       element={<NewLogin />} />
            <Route path="journal/:id" element={<NewJournalPost />} />
            <Route path="terms"       element={<NewTerms />} />
            <Route path="faq"         element={<NewFaq />} />
          </Route>

          {/* ── MEMBER DASHBOARD — standalone editorial chrome ── */}
          <Route path="/dashboard" element={
            <RequireRole minRole="free" fallbackPath="/login">
              <PageTransition><DashboardPage /></PageTransition>
            </RequireRole>
          } />

          {/* ── SHARED auth-transition pages — kept at top-level so activation/upgrade
              emails and the post-signup flow keep working exactly as before. ── */}
          <Route element={<Layout />}>
            <Route path="/activate" element={<PageTransition><ActivatePage /></PageTransition>} />
            <Route path="/welcome" element={
              <RequireRole minRole="free" fallbackPath="/login">
                <PageTransition><WelcomePage /></PageTransition>
              </RequireRole>
            } />
            <Route path="/upgrade" element={<PageTransition><UpgradePage /></PageTransition>} />
          </Route>

          {/* ── OTHER system routes ── */}
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

          {/* ── OLD SITE — preserved at /legacy as a browsable fallback. Vercel rollback
              remains the true instant-undo. Internal nav may lead back to the new site. ── */}
          <Route path="/legacy" element={<Layout />}>
            <Route index element={<RedirectIfAuth><PageTransition><HomePage /></PageTransition></RedirectIfAuth>} />
            <Route path="membership" element={<RedirectIfAuth><PageTransition><MembershipPage /></PageTransition></RedirectIfAuth>} />
            <Route path="events" element={<RedirectIfAuth><PageTransition><EventsPage /></PageTransition></RedirectIfAuth>} />
            <Route path="blog" element={<RedirectIfAuth><PageTransition><BlogPage /></PageTransition></RedirectIfAuth>} />
            <Route path="terms" element={<PageTransition><TermsPage /></PageTransition>} />
            <Route path="apply" element={<PageTransition><ApplyPage /></PageTransition>} />
            <Route path="apply/success" element={<PageTransition><ApplySuccessPage /></PageTransition>} />
            <Route path="login" element={<RedirectIfAuth><PageTransition><LoginPage /></PageTransition></RedirectIfAuth>} />
            <Route path="journal/:id" element={<PageTransition><JournalPostPage /></PageTransition>} />
          </Route>

          {/* /blog email links → new Substack-powered journal */}
          <Route path="/blog" element={<Navigate to="/journal" replace />} />

          {/* Unknown routes → new home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

// GrainOverlay is the OLD-site texture. The redesign (now at root) uses its own
// kk-noise-overlay, so only render grain on the old-Layout routes (/legacy + the
// shared auth-transition pages).
function ConditionalGrainOverlay() {
  const { pathname } = useLocation()
  const isOldLayout = pathname.startsWith('/legacy') ||
    ['/activate', '/welcome', '/upgrade'].includes(pathname)
  return isOldLayout ? <GrainOverlay /> : null
}

// Scroll to top on every route change. Without this, react-router keeps the prior
// scroll position, so clicking Home from a scrolled page lands mid-page. Resets Lenis too.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const id = requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
            <ScrollToTop />
            <ConditionalGrainOverlay />
            <AnimatedRoutes />
            <Analytics />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
