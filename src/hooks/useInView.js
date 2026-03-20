import { useEffect, useRef, useState } from 'react'

export default function useInView({ threshold = 0.1, once = true } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Small delay to let layout settle, then check viewport
    const timer = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setIsVisible(true)
        if (once) return
      }
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '50px' }
    )

    observer.observe(el)
    return () => {
      cancelAnimationFrame(timer)
      observer.disconnect()
    }
  }, [threshold, once])

  return [ref, isVisible]
}
