import { useState, useEffect } from 'react'
import FadeIn from '../shared/FadeIn'
import styles from './Timepiece.module.css'

const images = [
  `${import.meta.env.BASE_URL}assets/omegafront1.jpeg`,
  `${import.meta.env.BASE_URL}assets/omegaback2.jpeg`,
  `${import.meta.env.BASE_URL}assets/omegawhole3.jpeg`,
  `${import.meta.env.BASE_URL}assets/omegalast4.jpeg`,
]

export default function Timepiece() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className={styles.timepiece}>
      <div className={styles.inner}>
        <FadeIn>
          <div className={styles.imageWrap}>
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="Omega Speedmaster Silver Snoopy Award 50th Anniversary"
                className={`${styles.watchImage} ${i === active ? styles.active : ''}`}
              />
            ))}
            <div className={styles.dots}>
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </FadeIn>
        <FadeIn>
          <div className={styles.card}>
            <p className={styles.eyebrow}>RECENTLY PICKED UP BY A MEMBER</p>
            <h2 className={styles.name}>OMEGA SPEEDMASTER &ldquo;SILVER SNOOPY AWARD&rdquo; 50TH ANNIVERSARY</h2>
            <p className={styles.ref}>REF. 310.32.42.50.02.001</p>
            <p className={styles.editorial}>ONE OF OUR MEMBERS JUST LANDED THE GRAIL. THE SILVER SNOOPY AWARD EDITION CELEBRATES NASA&rsquo;S HIGHEST HONOR, GIVEN TO OMEGA AFTER THE SPEEDMASTER HELPED BRING THE APOLLO 13 CREW HOME SAFELY. THE CASEBACK FEATURES A HAND-ENGRAVED SNOOPY THAT ORBITS THE DARK SIDE OF THE MOON IN REAL TIME VIA A MECHANICAL ANIMATION &mdash; A DETAIL THAT STILL STOPS COLLECTORS IN THEIR TRACKS. IMPOSSIBLE TO FIND AT RETAIL, IMPOSSIBLE TO FORGET ON THE WRIST.</p>
            <p className={styles.note}>MEMBER PICKUPS UPDATED REGULARLY</p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
