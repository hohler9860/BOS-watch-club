/**
 * NewFaq — /faq
 *
 * Editorial page on the shared ed- design system (editorial.css). Three themed
 * groups (The Club / Events & Access / Membership & Money), each an accordion
 * that is visible immediately. Content: src/data/faqItems.js.
 */

import { useState } from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import faqItems from '../../data/faqItems'
import './editorial.css'

// Indices into faqItems, grouped by theme.
const GROUPS = [
  { label: 'The Club',           indices: [0, 2, 7] },
  { label: 'Events & Access',    indices: [1, 5, 6] },
  { label: 'Membership & Money', indices: [3, 4, 8, 9] },
]

function FaqAccordion({ indices, open, setOpen }) {
  return (
    <ul className="ed-acc">
      {indices.map(i => {
        const item = faqItems[i]
        if (!item) return null
        const isOpen = open === i
        return (
          <li key={i} className={`ed-acc__item${isOpen ? ' ed-acc__item--open' : ''}`}>
            <button
              type="button"
              className="ed-acc__q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{item.question}</span>
              <span className="ed-acc__icon" aria-hidden="true">{isOpen ? '–' : '+'}</span>
            </button>
            <div className="ed-acc__panel">
              <div className="ed-acc__panel-inner">
                <p className="ed-acc__a">{item.answer}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function NewFaq() {
  // One open question across the whole page keeps the reading focused.
  const [open, setOpen] = useState(null)

  return (
    <div className="kk-page ed-page">
      <Helmet>
        <title>FAQ | Boston Watch Club</title>
        <meta name="description" content="Frequently asked questions about Boston Watch Club: who can join, whether it's free, events, venues, guests, and deposits." />
      </Helmet>

      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── Hero ── */}
      <header className="ed-hero">
        <span className="ed-hero__eyebrow">Boston Watch Club</span>
        <h1 className="ed-hero__title">Questions, Answered</h1>
        <p className="ed-hero__lede">
          Everything people ask us before they apply: who can join, what the
          events are like, and how the money works.
        </p>
      </header>

      {/* ── Groups ── */}
      {GROUPS.map(group => (
        <section className="ed-section" key={group.label} aria-label={group.label}>
          <div className="ed-faqgroup">
            <span className="ed-label">{group.label}</span>
            <FaqAccordion indices={group.indices} open={open} setOpen={setOpen} />
          </div>
        </section>
      ))}

      {/* ── CTA ── */}
      <section className="ed-cta" aria-label="Contact">
        <h2 className="ed-cta__title">Still curious?</h2>
        <p className="ed-cta__text">
          Ask us anything at{' '}
          <a
            href="mailto:boswatchclub@gmail.com"
            style={{ color: 'inherit', textDecorationColor: 'rgba(255,255,255,0.35)' }}
          >
            boswatchclub@gmail.com
          </a>
          , or skip straight to the application.
        </p>
        <div className="ed-cta__actions">
          <Link to="/apply" className="ed-btn">Apply Now</Link>
        </div>
      </section>
    </div>
  )
}
