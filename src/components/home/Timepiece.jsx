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
            <p className={styles.editorial}>One of our members just landed the grail. The Silver Snoopy Award edition celebrates NASA&rsquo;s highest honor, given to Omega after the Speedmaster helped bring the Apollo 13 crew home safely. The caseback features a hand-engraved Snoopy that orbits the dark side of the moon in real time via a mechanical animation &mdash; a detail that still stops collectors in their tracks. Impossible to find at retail, impossible to forget on the wrist.</p>
            <p className={styles.note}>MEMBER PICKUPS UPDATED REGULARLY</p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
