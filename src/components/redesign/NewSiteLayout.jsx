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
