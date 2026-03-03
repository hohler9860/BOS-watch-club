import { useRef, useMemo } from 'react'
import useParallax from '../../hooks/useParallax'
import FadeIn from '../shared/FadeIn'
import styles from './Hero.module.css'

export default function Hero() {
  const logoRef = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef = useRef(null)
  const scrollRef = useRef(null)
  const orb1Ref = useRef(null)
  const orb2Ref = useRef(null)

  const configs = useMemo(() => [
    { ref: logoRef, translateY: 0.15, scale: 0.08 },
    { ref: subtitleRef, translateY: 0.1 },
    { ref: ctaRef, translateY: 0.05 },
    { ref: scrollRef, opacityMultiplier: 3 },
    { ref: orb1Ref, translateX: 0.03, translateY: -0.08 },
    { ref: orb2Ref, translateX: -0.04, translateY: 0.06 },
  ], [])

  useParallax(configs)

  const base = import.meta.env.BASE_URL

  function handleScroll(e) {
    e.preventDefault()
    const el = document.getElementById('register')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className={styles.hero}>
      <div ref={orb1Ref} className={`${styles.orb} ${styles.orb1}`} />
      <div ref={orb2Ref} className={`${styles.orb} ${styles.orb2}`} />
      <div className={styles.content}>
        <FadeIn>
          <div ref={logoRef} className={styles.logo}>
            <img src={`${base}assets/logo.png`} alt="BOS WATCH CLUB" />
          </div>
        </FadeIn>
        <FadeIn delay="0.15s">
          <p ref={subtitleRef} className={styles.subtitle}>
            AN EXCLUSIVE COMMUNITY FOR COLLECTORS, ENTHUSIASTS,<br />AND THOSE WHO APPRECIATE THE ART OF HOROLOGY.
          </p>
        </FadeIn>
        <FadeIn delay="0.3s">
          <a ref={ctaRef} href="#register" className={styles.cta} onClick={handleScroll}>
            BECOME A FOUNDING MEMBER &rarr;
          </a>
        </FadeIn>
        <p className={styles.note}>FIRST 10 MEMBERS PER TIER RECEIVE FOUNDING STATUS</p>
      </div>
      <FadeIn delay="0.45s">
        <div ref={scrollRef} className={styles.scrollIndicator}>
          <span>SCROLL</span>
          <div className={styles.scrollLine} />
        </div>
      </FadeIn>
    </section>
  )
}
