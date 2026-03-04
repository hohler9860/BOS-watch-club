import { useEffect } from 'react'
import { Link } from 'react-router'
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">&times;</button>

        {/* Hero banner */}
        <div className={styles.hero}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <span className={styles.heroDate}>{event.month} {event.day}</span>
            <h2 className={styles.heroTitle}>{event.name}</h2>
            {event.tagline && <p className={styles.heroTagline}>{event.tagline}</p>}
          </div>
        </div>

        {/* Details strip */}
        <div className={styles.detailsStrip}>
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
            <span className={styles.detailLabel}>DRESS CODE</span>
            <span className={styles.detailValue}>{event.dressCode}</span>
          </div>
        </div>

        {/* Description */}
        <div className={styles.body}>
          <p className={styles.description}>{event.description}</p>
        </div>

        {/* CTA */}
        <div className={styles.footer}>
          <Link to="/membership" className={styles.cta} onClick={onClose}>
            BECOME A MEMBER TO RSVP &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
