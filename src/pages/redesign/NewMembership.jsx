/**
 * NewMembership — /redesign/membership
 *
 * Cinematic page: same engine as the home page (CineWatchSection — full-screen
 * sticky watch sections, scroll parallax, click-to-expand DISCOVER panels). No
 * header band; the page opens straight into the watch sections. Each panel is a
 * single tight paragraph (no lists, no CTAs — applying happens via the nav).
 *
 * Order:
 *   1. FOUNDING MEMBERSHIP — AP rainbow (right)
 *   2. HOW WE GATHER       — RM green (left)
 *   3. NEW TIERS           — Patek skeleton (right)
 */

import { Helmet } from 'react-helmet-async'
import s from './NewMembership.module.css'
import CineWatchSection from '../../components/redesign/CineWatchSection'

// ── Cinematic sections (mirror watchData.js shape) ───────────────────────────
const FOUNDING_SECTION = {
  id: 'founding', brand: 'F.P. Journe', model: 'Tourbillon Souverain',
  eyebrowLabel: 'MEMBERSHIP', title: 'FOUNDING MEMBERSHIP',
  image: '/assets/watches/fpjourne-tourbillon.png',
  glowImg: '/assets/watches/glow/g7.png',          // FP Journe's own home glow (warm)
  side: 'left', glow: 'rgba(210, 163, 94, 0.40)', glowColor: '#D2A35E',
}
const GATHER_SECTION = {
  id: 'gather', brand: 'Richard Mille', model: 'RM 30-01',
  eyebrowLabel: 'WHAT WE OFFER', title: 'HOW WE GATHER',
  image: '/assets/watches/rm30-blue.png',
  glowImg: '/assets/watches/glow/g6.png',          // home blue wash (blue RM) — bright, no rising-edge seam
  side: 'right', glow: 'rgba(46, 96, 180, 0.40)', glowColor: '#2E60B4',
}
const NEWTIERS_SECTION = {
  id: 'newtiers', brand: 'Patek Philippe', model: 'Squelette',
  eyebrowLabel: 'MEMBERSHIP', title: 'NEW TIERS',
  image: '/assets/watches/patek-skeleton.png',
  glowImg: '/assets/watches/glow/g9.png',          // skeleton Patek's own home glow (warm)
  side: 'left', glow: 'rgba(210, 150, 82, 0.40)', glowColor: '#D29652',
}

export default function NewMembership() {
  return (
    <div className="kk-page">
      <Helmet>
        <title>Membership | Boston Watch Club</title>
        <meta
          name="description"
          content="Join Boston Watch Club. Most nights are free and open to all; membership unlocks the members-only gatherings, the group chat, and the rooms worth being in."
        />
      </Helmet>

      {/* Grain noise overlay — matches the home page */}
      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── 1. FOUNDING MEMBERSHIP ──────────────────────────────────────────── */}
      <CineWatchSection watch={FOUNDING_SECTION} index={0}>
        <div className={s.panel}>
          <p className={s.panelText}>
            The original tier, now closed to new members. Founders get every event, the members-only gatherings, the private community, and the group chat. This is where it all started.
          </p>
        </div>
      </CineWatchSection>

      {/* ── 2. HOW WE GATHER ────────────────────────────────────────────────── */}
      <CineWatchSection watch={GATHER_SECTION} index={1}>
        <div className={s.panel}>
          <p className={s.panelText}>
            Most of our nights are free and open to anyone. A handful are members only, and that&rsquo;s the point of joining. Happy hours, coffees, cigar nights, dinners, and time with the brands and dealers worth knowing, plus the members-only Collector&rsquo;s Table, our best night of the year.
          </p>
        </div>
      </CineWatchSection>

      {/* ── 3. NEW TIERS ────────────────────────────────────────────────────── */}
      <CineWatchSection watch={NEWTIERS_SECTION} index={2}>
        <div className={s.panel}>
          <p className={s.panelText}>
            We&rsquo;re crafting new membership tiers for the next chapter of Boston Watch Club, with flexible pricing, exclusive perks, and early access for the people who get there first.
          </p>
        </div>
      </CineWatchSection>
    </div>
  )
}
