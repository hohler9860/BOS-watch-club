import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import Loader from './Loader'

// How long the moonphase loader shows on every page navigation.
// Change this one number to speed it up / slow it down.
const HOLD_MS = 2000

// Shows the loading screen for a fixed time on each route change so every
// visitor sees it. The initial page load is handled by the boot splash in
// index.html, so we skip the very first render here to avoid doubling up.
export default function RouteLoader() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setVisible(true)
    setFading(false)
    const fadeTimer = setTimeout(() => setFading(true), HOLD_MS)
    const hideTimer = setTimeout(() => setVisible(false), HOLD_MS + 450)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [location.pathname])

  if (!visible) return null
  return <Loader fading={fading} />
}
