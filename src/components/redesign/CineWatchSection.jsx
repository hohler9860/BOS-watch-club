/**
 * CineWatchSection — one kk-section per watch.
 *
 * FIX 1 — Single continuous rAF loop: started on mount, cancelled on unmount.
 *   Every frame reads scroll from window.__lenis?.scroll or window.scrollY,
 *   then writes transform DIRECTLY to watch img + text el via refs — no setState.
 *   Recomputes sectionTop on resize. Never gated on scroll events — always running.
 *
 * FIX 2 — Glow rendered as <img class="kk-section__glow-img"> using watch.glowImg.
 *   CSS gradient removed. Image covers the full section via CSS.
 *
 * FIX 4 — Text block shows club info (eyebrowLabel + title) not watch brand/model.
 *   Button label = section title, toggles to CLOSE when open.
 *
 * Parallax math (verbatim KK port):
 *   progress = clamp((scroll - sectionTop + winH) / (winH * 2), 0, 1)
 *   rotate   = -25 + progress * 25        → watch
 *   textY    = (progress - 0.5) * -400    → text
 *
 * IntersectionObserver at threshold 0.1 adds 'visible' for opacity fade.
 */

import { useRef, useEffect } from 'react'

export default function CineWatchSection({ watch, index }) {
  const sectionRef  = useRef(null)
  const watchImgRef = useRef(null)
  const textElRef   = useRef(null)
  const panelRef    = useRef(null)
  const labelRef    = useRef(null)
  const btnRef      = useRef(null)
  const panelId     = `kk-discover-panel-${watch.id}`

  // ── FIX 1: Continuous rAF loop ──────────────────────────────────────────────
  useEffect(() => {
    const el       = sectionRef.current
    const watchImg = watchImgRef.current
    const textEl   = textElRef.current
    if (!el || !watchImg || !textEl) return

    let rafId = null
    let sectionTop = el.offsetTop

    // Recompute on resize
    function onResize() {
      sectionTop = el.offsetTop
    }
    window.addEventListener('resize', onResize, { passive: true })

    function loop() {
      // Prefer Lenis virtual scroll; fall back to native scrollY
      const scroll = window.__lenis?.scroll ?? window.lenis?.scroll ?? window.scrollY
      const winH   = window.innerHeight
      const winW   = window.innerWidth

      const isMobile = window.matchMedia('(max-width: 768px)').matches

      let progress = (scroll - sectionTop + winH) / (winH * 2)
      progress = Math.max(0, Math.min(1, progress))

      // Watch rotation runs on ALL widths (rotation doesn't shift layout, so it's
      // safe even on the stacked mobile layout). Gentler amplitude on mobile.
      const rotate = isMobile
        ? -14 + progress * 11   // mobile: subtle ~-14deg → -3deg drift
        : -30 + progress * 27   // desktop: full travel
      watchImg.style.transform = `rotate(${rotate}deg)`

      if (!isMobile) {
        // Text vertical-drift — desktop only (on mobile it can push an open panel
        // below the section). Scale travel down at narrow widths and short heights.
        const widthFactor  = Math.min(1, (winW - 769) / (1400 - 769))
        const heightFactor = Math.min(1, Math.max(0.35, (winH - 520) / (900 - 520)))
        const maxTravel    = 200 * widthFactor * heightFactor
        const textY        = (progress - 0.5) * -maxTravel
        textEl.style.transform = `translateY(${textY}px)`
      } else {
        textEl.style.transform = ''
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // ── IntersectionObserver — adds .visible for opacity fade ──────────────────
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) el.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isLeft = watch.side === 'left'

  // ── FIX 4: DISCOVER toggle uses section title, not "DISCOVER MORE" ─────────
  function handleDiscover() {
    const panel = panelRef.current
    const btn   = btnRef.current
    const label = labelRef.current
    if (!panel || !btn || !label) return

    if (panel.hasAttribute('hidden')) {
      panel.removeAttribute('hidden')
      void panel.offsetHeight
    }
    const isOpen = panel.classList.toggle('is-open')
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    // FIX 4: label toggles between the section TITLE and CLOSE
    label.textContent = isOpen ? 'CLOSE' : watch.title
  }

  return (
    <section
      ref={sectionRef}
      className={`kk-section kk-section--watch-${watch.side}`}
      style={{ zIndex: index + 1 }}
      aria-label={watch.title}
    >
      {/* FIX 2: Background — glow rendered as <img>, not CSS gradient */}
      <div className="kk-section__background">
        <div className="kk-section__image-wrapper">
          <img
            className="kk-section__glow-img"
            src={watch.glowImg}
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Content layer */}
      <div className={`kk-section__container kk-section--watch-${watch.side}`}>
        <div className="kk-section__content-wrapper">

          {/* Watch column */}
          <div className="kk-section__watch-wrap">
            {watch.image ? (
              <img
                ref={watchImgRef}
                src={watch.image}
                alt={`${watch.brand} ${watch.model}`}
                className="kk-section__watch-img"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <div
                ref={watchImgRef}
                className="kk-watch-placeholder"
                style={{
                  boxShadow: `0 0 80px 20px ${watch.glow}`,
                  borderColor: watch.glowColor + '44',
                }}
                role="img"
                aria-label={`${watch.brand} ${watch.model} — image placeholder`}
              >
                <span className="kk-watch-placeholder__label">watch image</span>
              </div>
            )}
          </div>

          {/* FIX 4: Text column — shows eyebrowLabel + title, NOT brand/model */}
          <div
            ref={textElRef}
            className={`kk-section__text kk-section__text--${isLeft ? 'right' : 'left'}`}
          >
            {/* eyebrow (was brand) */}
            <span className="kk-section__brand">{watch.eyebrowLabel}</span>
            {/* heading (was model) */}
            <h2 className="kk-section__model">{watch.title}</h2>

            {/* Angled button — label = section title, toggles to CLOSE */}
            <button
              ref={btnRef}
              type="button"
              className="kk-discover"
              aria-expanded="false"
              aria-controls={panelId}
              onClick={handleDiscover}
            >
              <svg
                className="kk-discover__frame"
                viewBox="0 0 220 48"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M 12,1 L 208,1 L 219,12 L 219,36 L 208,47 L 12,47 L 1,36 L 1,12 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="miter"
                />
              </svg>
              <span ref={labelRef} className="kk-discover__label">{watch.title}</span>
            </button>

            {/* Expandable panel — club detail */}
            <div
              id={panelId}
              ref={panelRef}
              className="kk-discover__panel"
              hidden
            >
              <div className="kk-discover__panel-inner">
                <p>{watch.clubInfo}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
