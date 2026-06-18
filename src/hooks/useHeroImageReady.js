import { useState, useEffect } from 'react'

/**
 * useHeroImageReady — gate a section header's reveal until its background image
 * is fully decoded, so the image and the heading text animate in together
 * (instead of the text appearing first and the image popping in late).
 *
 * @param {string|undefined} url      the hero background image URL (may be empty)
 * @param {boolean} contentLoading    true while site_content is still being fetched
 * @returns {boolean} ready           true once it's safe to reveal the header
 *
 * Behavior:
 *   - while site_content is still loading → not ready (avoids deciding too early)
 *   - no image set → ready as soon as content has loaded (no needless wait)
 *   - image set → ready only after the image has loaded/decoded (or errored)
 */
export default function useHeroImageReady(url, contentLoading) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (contentLoading) return
    if (!url) { setReady(true); return }

    let active = true
    const done = () => { if (active) setReady(true) }
    const img = new Image()
    img.onload = done
    img.onerror = done
    img.src = url
    // Cached images may already be complete before handlers attach.
    if (img.complete) done()

    return () => { active = false }
  }, [url, contentLoading])

  return ready
}
