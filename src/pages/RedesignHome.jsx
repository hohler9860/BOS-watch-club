/**
 * RedesignHome — /redesign (index route inside NewSiteLayout)
 *
 * Renders the hero + 9 watch sections.
 * CineNav and CineFooter are rendered by NewSiteLayout (the parent route element).
 *
 * FIX 1 — Parallax is now owned entirely by each CineWatchSection via its own
 *   continuous rAF loop. RedesignHome no longer manages scrollY state or passes
 *   it as a prop — that was the flakiness vector (scroll event → setState → re-render
 *   race). Each section reads the scroll value directly in its own loop.
 *
 * FIX 6 — Hero copy updated: non-repetitive, elevated, no em dashes.
 *
 * Stylesheet: src/pages/redesign-kettlekids.css (plain global import, no CSS Modules).
 */

import { Helmet } from 'react-helmet-async'
import './redesign-kettlekids.css'
import CineWatchSection from '../components/redesign/CineWatchSection'
import { WATCHES } from '../components/redesign/watchData'

// ── FIX A: Hero copy — single flowing paragraph, no split welcome/description ─
const HERO = {
  welcome: '', // intentionally blank — single-paragraph treatment (FIX A)

  description:
    "Boston Watch Club is the city's first private home for collectors, connoisseurs, and the next generation of enthusiasts. Inside, you'll find a community built around fine watchmaking and the culture that surrounds it, with real events, honest conversation, and people genuinely worth knowing. Whether you own your first piece or your fiftieth, this is where Boston's watch world comes together to discover, connect, and spend its time well.",

  founders: 'Henry & Stelios',

  signatureImg: '/assets/bwc-signatures.png',
}
// ─────────────────────────────────────────────────────────────────────────────

export default function RedesignHome() {
  return (
    <div className="kk-page">
      <Helmet>
        <title>Boston Watch Club</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Grain noise overlay — fixed, pointer-events:none, z-index 9999 */}
      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── HERO ── */}
      <header className="kk-header">
        <div className="kk-header__body-wrap">
          <div className="kk-header__body">
            {HERO.welcome && (
              <p className="kk-header__welcome">{HERO.welcome}</p>
            )}
            <p className="kk-header__description">{HERO.description}</p>
            <p className="kk-header__founders">{HERO.founders}</p>
            {HERO.signatureImg && (
              <div className="kk-header__signatures">
                <img src={HERO.signatureImg} alt="Henry & Stelios" height="64" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── WATCH SECTIONS (sticky stack) ── */}
      {WATCHES.map((watch, i) => (
        <CineWatchSection
          key={watch.id}
          watch={watch}
          index={i}
        />
      ))}
    </div>
  )
}
