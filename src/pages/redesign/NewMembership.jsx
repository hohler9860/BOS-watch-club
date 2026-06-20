/**
 * NewMembership — /redesign/membership
 *
 * Cinematic page: same engine as the home page (CineWatchSection — full-screen
 * sticky watch sections, scroll parallax, click-to-expand DISCOVER panels). No
 * header band; the page opens straight into the watch sections.
 *
 * Order:
 *   1. FOUNDING MEMBERSHIP — AP rainbow (right)   → tight paragraph + Sold Out
 *   2. HOW WE GATHER       — RM green (left)       → one tight paragraph
 *   3. NEW TIERS           — Patek diamond (right) → Coming Soon + paragraph + Apply
 *
 * Each panel is a single short paragraph (no lists). Member auth (member.role
 * === 'member') swaps the founding CTA to "Go to Dashboard".
 */

import { Helmet } from 'react-helmet-async'
import useAuth from '../../hooks/useAuth'
import s from './NewMembership.module.css'
import CineButton from '../../components/redesign/CineButton'
import CineWatchSection from '../../components/redesign/CineWatchSection'

// ── Cinematic sections (mirror watchData.js shape) ───────────────────────────
const FOUNDING_SECTION = {
  id: 'founding', brand: 'Audemars Piguet', model: 'Royal Oak Rainbow',
  eyebrowLabel: 'MEMBERSHIP', title: 'FOUNDING MEMBERSHIP',
  image: '/assets/watches/ap-rainbow-rosegold.png',
  glowImg: '/assets/watches/glow/g8.png',
  side: 'right', glow: 'rgba(210, 163, 94, 0.40)', glowColor: '#D2A35E',
}
const GATHER_SECTION = {
  id: 'gather', brand: 'Richard Mille', model: 'RM 65-02',
  eyebrowLabel: 'WHAT WE OFFER', title: 'HOW WE GATHER',
  image: '/assets/watches/rm65-02-italy.png',
  glowImg: '/assets/watches/glow/g6.png',
  side: 'left', glow: 'rgba(90, 126, 210, 0.40)', glowColor: '#5A7ED2',
}
const NEWTIERS_SECTION = {
  id: 'newtiers', brand: 'Patek Philippe', model: 'Nautilus Diamond',
  eyebrowLabel: 'MEMBERSHIP', title: 'NEW TIERS',
  image: '/assets/watches/patek-5719-diamond.png',
  glowImg: '/assets/watches/glow/g2.png',
  side: 'right', glow: 'rgba(110, 134, 200, 0.40)', glowColor: '#6E86C8',
}

export default function NewMembership() {
  const { member } = useAuth()
  const isMember = member && member.role === 'member'

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
          <div className={s.miniFooter}>
            {isMember ? (
              <CineButton to="/dashboard" tone="light" fullWidth style={{ height: 48 }}>Go to Dashboard</CineButton>
            ) : (
              <CineButton disabled tone="light" fullWidth style={{ height: 48 }}>Sold Out</CineButton>
            )}
          </div>
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
          <div className={s.miniChip}>
            <span className={s.miniDot} aria-hidden="true" />Coming Soon
          </div>
          <p className={s.panelText}>
            We&rsquo;re crafting new membership tiers for the next chapter of Boston Watch Club, with flexible pricing, exclusive perks, and early access. Apply now to be first in line when they drop.
          </p>
          <div className={s.miniFooter}>
            <CineButton to="/apply" tone="light" fullWidth style={{ height: 48 }}>Apply Now</CineButton>
          </div>
        </div>
      </CineWatchSection>
    </div>
  )
}
