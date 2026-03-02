import { useEffect } from 'react'

export default function useParallax(configs) {
  useEffect(() => {
    // Disable on touch/mobile
    if (window.matchMedia('(max-width: 768px)').matches) return

    let ticking = false

    function onScroll() {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const vh = window.innerHeight

        if (scrollY < vh) {
          const ratio = scrollY / vh

          configs.forEach(({ ref, translateY, translateX, scale, opacity, opacityMultiplier }) => {
            const el = ref.current
            if (!el) return

            const transforms = []
            if (translateY != null) transforms.push(`translateY(${scrollY * translateY}px)`)
            if (translateX != null) transforms.push(`translateX(${scrollY * translateX}px)`)
            if (scale != null) transforms.push(`scale(${1 - ratio * scale})`)

            if (transforms.length) el.style.transform = transforms.join(' ')
            if (opacityMultiplier != null) el.style.opacity = Math.max(0, 1 - ratio * opacityMultiplier)
          })
        }

        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [configs])
}
