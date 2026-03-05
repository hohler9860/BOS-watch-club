import { useMemo, useState } from 'react'
import watchData from '../../data/watchData'
import styles from './Marquee.module.css'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Marquee() {
  const base = import.meta.env.BASE_URL
  const [selected, setSelected] = useState(null)

  // Shuffle once per mount so the ticker starts at a different section each visit
  const shuffled = useMemo(() => shuffleArray(watchData), [])

  // Duplicate for seamless infinite scroll
  const items = [...shuffled, ...shuffled]

  return (
    <>
      <div className={styles.marquee}>
        <div className={styles.track}>
          {items.map((watch, i) => (
            <button
              key={i}
              className={styles.item}
              onClick={() => setSelected(watch)}
            >
              <div className={styles.thumb}>
                <img src={`${base}${watch.image.replace(/^\//, '')}`} alt={watch.name} />
              </div>
              <div className={styles.info}>
                <span className={styles.name}>{watch.name}</span>
                <span className={styles.ref}>{watch.ref}</span>
              </div>
              <span className={styles.dot} />
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setSelected(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className={styles.modalImage}>
              <img src={`${base}${selected.image.replace(/^\//, '')}`} alt={selected.name} />
            </div>
            <div className={styles.modalInfo}>
              <p className={styles.modalBrand}>{selected.brand}</p>
              <h3 className={styles.modalName}>{selected.name}</h3>
              <p className={styles.modalRef}>Ref. {selected.ref}</p>
              <p className={styles.modalDetails}>{selected.details}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
