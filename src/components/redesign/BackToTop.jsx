/**
 * BackToTop — minimal angled button that fades in once you've scrolled down,
 * and smoothly returns to the top (cooperating with the global Lenis).
 */
import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    function onScroll() {
      const y = window.__lenis?.scroll ?? window.scrollY
      setShow(y > 700)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function toTop() {
    if (window.__lenis?.scrollTo) window.__lenis.scrollTo(0, { duration: 1.1 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      className={`kk-totop${show ? ' show' : ''}`}
      onClick={toTop}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V6M6 12l6-6 6 6" />
      </svg>
    </button>
  )
}
