import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import FadeIn from '../shared/FadeIn'
import styles from './Timepiece.module.css'

const fallbackImages = [
  `${import.meta.env.BASE_URL}assets/omegafront1.jpeg`,
  `${import.meta.env.BASE_URL}assets/omegaback2.jpeg`,
  `${import.meta.env.BASE_URL}assets/omegawhole3.jpeg`,
  `${import.meta.env.BASE_URL}assets/omegalast4.jpeg`,
]

const fallback = {
  eyebrow: 'RECENTLY PICKED UP BY A MEMBER',
  name: 'OMEGA SPEEDMASTER \u201CSILVER SNOOPY AWARD\u201D 50TH ANNIVERSARY',
  ref: 'REF. 310.32.42.50.02.001',
  editorial: 'One of our members just landed the grail. The Silver Snoopy Award edition celebrates NASA\u2019s highest honor, given to Omega after the Speedmaster helped bring the Apollo 13 crew home safely. The caseback features a hand-engraved Snoopy that orbits the dark side of the moon in real time via a mechanical animation \u2014 a detail that still stops collectors in their tracks. Impossible to find at retail, impossible to forget on the wrist.',
  note: 'MEMBER PICKUPS UPDATED REGULARLY',
}

export default function Timepiece() {
  const [active, setActive] = useState(0)
  const [pickup, setPickup] = useState(null)

  useEffect(() => {
    async function load() {
      if (!supabase) return
      const { data } = await supabase.from('pickups').select('*').eq('active', true).limit(1).maybeSingle()
      if (data) setPickup(data)
    }
    load()
  }, [])

  const images = pickup
    ? [pickup.image1, pickup.image2, pickup.image3].filter(Boolean)
    : fallbackImages

  const info = pickup
    ? { eyebrow: pickup.eyebrow, name: pickup.name, ref: pickup.ref, editorial: pickup.editorial, note: pickup.note }
    : fallback

  useEffect(() => {
    if (images.length === 0) return
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className={styles.timepiece}>
      <div className={styles.inner}>
        <FadeIn>
          <div className={styles.imageWrap}>
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={info.name}
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
            <p className={styles.eyebrow}>{info.eyebrow}</p>
            <h2 className={styles.name}>{info.name}</h2>
            {info.ref && <p className={styles.ref}>{info.ref}</p>}
            <p className={styles.editorial}>{info.editorial}</p>
            <p className={styles.note}>{info.note}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
