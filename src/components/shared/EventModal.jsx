import { useEffect } from 'react'
import styles from './EventModal.module.css'

export default function EventModal({ event, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  if (!event) return null

  const paragraphs = event.longDescription.split('\n\n')

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">&times;</button>

        <div className={styles.scroll}>
          {/* Hero image placeholder */}
          <div className={styles.hero}>
            <div className={styles.heroOverlay} />
            <div className={styles.heroContent}>
              <span className={styles.heroDate}>{event.month} {event.day}</span>
              <h2 className={styles.heroTitle}>{event.name}</h2>
              {event.tagline && <p className={styles.heroTagline}>{event.tagline}</p>}
            </div>
          </div>

          {/* Body */}
          <div className={styles.body}>
            <div className={styles.content}>
              {/* Details sidebar */}
              <aside className={styles.sidebar}>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>DATE</span>
                  <span className={styles.detailValue}>{event.date}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>TIME</span>
                  <span className={styles.detailValue}>{event.time}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>VENUE</span>
                  <span className={styles.detailValue}>{event.venue}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>ACCESS</span>
                  <span className={styles.detailValue}>{event.access}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>CAPACITY</span>
                  <span className={styles.detailValue}>{event.capacity}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>DRESS CODE</span>
                  <span className={styles.detailValue}>{event.dressCode}</span>
                </div>
              </aside>

              {/* Long description */}
              <div className={styles.description}>
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className={styles.footer}>
              <a href="/membership" className={styles.cta}>BECOME A MEMBER TO RSVP &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
