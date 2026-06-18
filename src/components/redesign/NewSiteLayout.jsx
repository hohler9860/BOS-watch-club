/**
 * NewSiteLayout — shell for all /redesign/* routes.
 *
 * Renders:
 *   CineNav  (fixed top bar — always present)
 *   <Outlet> (the matched child route: RedesignHome, NewEvents, etc.)
 *   CineFooter (white kk-footer — always present)
 *
 * This sits OUTSIDE <Layout> and OUTSIDE RedirectIfAuth in App.jsx,
 * so it never inherits the old site's Nav/Footer.
 */

import { Outlet } from 'react-router'
// Global kk-nav / kk-footer / kk-header styles. Imported here (the shell that
// renders CineNav + CineFooter on every /redesign/* route) so the nav is styled
// on a direct load/reload of any page — not just when the home page mounts.
import '../../pages/redesign-kettlekids.css'
import CineNav from './CineNav'
import CineFooter from './CineFooter'
import BackToTop from './BackToTop'

export default function NewSiteLayout() {
  return (
    <>
      <CineNav />
      <Outlet />
      <CineFooter />
      <BackToTop />
    </>
  )
}
