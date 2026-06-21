/**
 * NewFaq — /redesign/faq
 *
 * Cinematic page, same engine as home/membership/journal/events (CineWatchSection).
 * No header band. Three photo-free watch sections, each a click-to-expand panel with
 * an accordion of the relevant questions:
 *   1. OP Celebration (left)   — "THE CLUB": who can join, vs RedBar, referrals.
 *   2. Daytona sapphire (right) — "EVENTS & ACCESS": events, venues, guests.
 *   3. RM 055 (left)           — "MEMBERSHIP & MONEY": free, students, deposits, Founding 40.
 *
 * Content: src/data/faqItems.js (the same Q&As as the live-site FAQ).
 */

import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import CineWatchSection from '../../components/redesign/CineWatchSection'
import faqItems from '../../data/faqItems'
import s from './NewFaq.module.css'

const CLUB_SECTION = {
  id: 'club', brand: 'Audemars Piguet', model: 'Royal Oak Perpetual Calendar',
  eyebrowLabel: 'FAQ', title: 'THE CLUB',
  image: '/assets/watches/faq-ap-perpetual.png',
  glowImg: '/assets/watches/glow/g7-clean.png',     // moon-removed warm glow, left
  side: 'left', glow: 'rgba(210, 163, 94, 0.40)', glowColor: '#D2A35E',
}
const ACCESS_SECTION = {
  id: 'access', brand: 'Rolex', model: 'Daytona Sapphire',
  eyebrowLabel: 'FAQ', title: 'EVENTS & ACCESS',
  image: '/assets/watches/faq-daytona-sapphire.png',
  glowImg: '/assets/watches/glow/g6-clean.png',     // moon-removed blue glow, right
  side: 'right', glow: 'rgba(46, 96, 180, 0.40)', glowColor: '#2E60B4',
}
const MONEY_SECTION = {
  id: 'money', brand: 'Richard Mille', model: 'RM 055',
  eyebrowLabel: 'FAQ', title: 'MEMBERSHIP & MONEY',
  image: '/assets/watches/faq-rm055-white.png',
  glowImg: '/assets/watches/glow/g-white.png',      // white glow for the white RM 055
  side: 'left', glow: 'rgba(210, 165, 60, 0.40)', glowColor: '#D2A53C',
}

// Indices into faqItems, grouped by theme.
const CLUB_Q   = [0, 2, 7]
const ACCESS_Q = [1, 5, 6]
const MONEY_Q  = [3, 4, 8, 9]

function FaqAccordion({ indices }) {
  const [open, setOpen] = useState(null)
  return (
    <ul className={s.faqList} aria-label="Questions">
      {indices.map(i => {
        const item = faqItems[i]
        if (!item) return null
        const isOpen = open === i
        return (
          <li key={i} className={s.faqItem}>
            <button
              type="button"
              className={s.faqQ}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{item.question}</span>
              <span className={s.faqIcon} aria-hidden="true">{isOpen ? '–' : '+'}</span>
            </button>
            {isOpen && <p className={s.faqA}>{item.answer}</p>}
          </li>
        )
      })}
    </ul>
  )
}

export default function NewFaq() {
  return (
    <div className="kk-page">
      <Helmet>
        <title>FAQ | Boston Watch Club</title>
        <meta name="description" content="Frequently asked questions about Boston Watch Club: who can join, whether it's free, events, venues, guests, and deposits." />
      </Helmet>

      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── 1. THE CLUB ──────────────────────────────────────────────────────── */}
      <CineWatchSection watch={CLUB_SECTION} index={0}>
        <div className={s.panel}>
          <FaqAccordion indices={CLUB_Q} />
        </div>
      </CineWatchSection>

      {/* ── 2. EVENTS & ACCESS ───────────────────────────────────────────────── */}
      <CineWatchSection watch={ACCESS_SECTION} index={1}>
        <div className={s.panel}>
          <FaqAccordion indices={ACCESS_Q} />
        </div>
      </CineWatchSection>

      {/* ── 3. MEMBERSHIP & MONEY ────────────────────────────────────────────── */}
      <CineWatchSection watch={MONEY_SECTION} index={2}>
        <div className={s.panel}>
          <FaqAccordion indices={MONEY_Q} />
        </div>
      </CineWatchSection>
    </div>
  )
}
