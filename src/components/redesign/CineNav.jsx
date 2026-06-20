/**
 * CineNav — fixed top nav for /redesign/*
 *
 * Layout (Kettle Kids spec):
 *   [APPLY NOW]    [WORDMARK]    [MENU ▾]
 *
 * Desktop: three-column grid — apply left, wordmark center, dropdown right.
 * Mobile: wordmark center, hamburger right (APPLY NOW hidden).
 *
 * Style switches between:
 *   kk-nav--light (over the white hero / footer)
 *   kk-nav--dark  (over the dark watch sections)
 *
 * Logo: bwc-wordmark.png is a black transparent PNG.
 *   - Over white (kk-nav--light): render as-is (black on white).
 *   - Over dark sections (kk-nav--dark): invert to white via filter.
 *
 * All nav links stay inside /redesign/* — never escape to the old site.
 */

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'

// Nav menu links — all routes inside /redesign namespace
const MENU_LINKS = [
  { label: 'Home',       to: '/' },
  { label: 'Membership', to: '/membership' },
  { label: 'Events',     to: '/events' },
  { label: 'Journal',    to: '/journal' },
  { label: 'FAQ',        to: '/faq' },
  { label: 'Log In',     to: '/login' },
]

export default function CineNav() {
  const [scrollY, setScrollY]       = useState(0)
  const [dropOpen, setDropOpen]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef(null)

  // Track scroll for light/dark switch
  useEffect(() => {
    function onScroll() { setScrollY(window.scrollY) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    if (dropOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropOpen])

  // Lock body scroll when mobile overlay open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Light over hero + footer (first ~420px), dark over watch sections
  const isLight = scrollY < 420

  const navClass = `kk-nav ${isLight ? 'kk-nav--light' : 'kk-nav--dark'}`

  // Logo invert: black wordmark PNG becomes white over dark sections.
  // Always visible — the big standalone hero wordmark has been removed from
  // RedesignHome, so the nav wordmark is the ONLY wordmark on every scroll position.
  const logoStyle = {
    height: '24px',
    width: 'auto',
    display: 'block',
    filter: isLight ? 'none' : 'invert(1)',   // black on white, white over dark sections
    transition: 'filter 0.3s ease',
  }

  function closeAll() {
    setDropOpen(false)
    setMobileOpen(false)
  }

  return (
    <>
      <nav className={navClass} role="navigation" aria-label="Main navigation">
        <div className="kk-nav__inner">
          {/* Left: APPLY NOW */}
          <Link to="/apply" className="kk-nav__apply" onClick={closeAll}>
            Apply Now
          </Link>

          {/* Center: BWC Wordmark image — links to /redesign home */}
          <Link
            to="/"
            className="kk-nav__wordmark"
            aria-label="Boston Watch Club — home"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src="/assets/bwc-wordmark.png"
              alt="Boston Watch Club"
              style={logoStyle}
            />
          </Link>

          {/* Right: MENU dropdown (desktop) + hamburger (mobile) */}
          <div className="kk-nav__right" ref={dropRef}>
            {/* Desktop: text MENU button with dropdown */}
            <button
              type="button"
              className="kk-nav__menu-btn"
              onClick={() => setDropOpen(v => !v)}
              aria-expanded={dropOpen}
              aria-haspopup="true"
            >
              Menu
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Desktop dropdown panel — Tab-navigable (ARIA disclosure pattern) */}
            <div className={`kk-nav__dropdown${dropOpen ? ' open' : ''}`}>
              {MENU_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} onClick={closeAll}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Mobile: hamburger */}
            <button
              type="button"
              className={`kk-nav__hamburger${mobileOpen ? ' active' : ''}`}
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`kk-nav__mobile-overlay${mobileOpen ? ' open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        {MENU_LINKS.map(({ label, to }) => (
          <Link key={label} to={to} className="kk-nav__mobile-link" onClick={closeAll}>
            {label}
          </Link>
        ))}
        <Link to="/apply" className="kk-nav__mobile-link" onClick={closeAll}>
          Apply Now
        </Link>
      </div>
    </>
  )
}
