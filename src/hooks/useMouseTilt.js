import { useEffect, useRef } from 'react'

export default function useMouseTilt() {
  const cardRef = useRef(null)
  const shineRef = useRef(null)

  useEffect(() => {
    // Disable on touch devices
    if (!window.matchMedia('(hover: hover)').matches) return

    const card = cardRef.current
    if (!card) return

    function handleMove(e) {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2

      card.style.transform = `perspective(1000px) rotateX(${y * -1.5}deg) rotateY(${x * 1.5}deg)`

      if (shineRef.current) {
        const px = e.clientX - rect.left
        const py = e.clientY - rect.top
        shineRef.current.style.background = `radial-gradient(circle at ${px}px ${py}px, rgba(255,255,255,0.15) 0%, transparent 60%)`
      }
    }

    function handleLeave() {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'
      if (shineRef.current) {
        shineRef.current.style.background = 'transparent'
      }
    }

    card.addEventListener('mousemove', handleMove)
    card.addEventListener('mouseleave', handleLeave)

    return () => {
      card.removeEventListener('mousemove', handleMove)
      card.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return { cardRef, shineRef }
}
