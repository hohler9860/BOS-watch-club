import { useState, useRef, useEffect } from 'react'
import styles from './BlurImage.module.css'

export default function BlurImage({ src, alt = '', className = '', ...props }) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`${styles.wrap} ${className}`}>
      <div className={`${styles.placeholder} ${loaded ? styles.placeholderHidden : ''}`} />
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`${styles.img} ${loaded ? styles.imgLoaded : ''}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  )
}
