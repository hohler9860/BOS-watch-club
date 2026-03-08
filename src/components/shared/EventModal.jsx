import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import ShinyButton from './ShinyButton'
import AddToCalendar from './AddToCalendar'
import btnStyles from './ShinyButton.module.css'
import styles from './EventModal.module.css'

export default function EventModal({ event, onClose, member, isRsvpd, onToggleRsvp }) {
  const navigate = useNavigate()
  const base = import.meta.env.BASE_URL

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

  const paragraphs = (event.longDescription || event.description)
    .split('\n\n')
    .filter(Boolean)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">&times;</button>

        {/* Hero image */}
        <div className={styles.hero}>
          {event.image && (
            <img
              src={`${base}assets/${event.image}`}
              alt={event.name}
              className={styles.heroImage}
              style={event.imagePosition ? { objectPosition: event.imagePosition } : undefined}
            />
          )}
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <span className={styles.heroDate}>{event.date}</span>
            <h2 className={styles.heroTitle}>{event.name}</h2>
            {event.tagline && <p className={styles.heroTagline}>{event.tagline}</p>}
          </div>
        </div>

        {/* Scrollable content */}
        <div className={styles.scrollArea}>
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
              <span className={styles.detailLabel}>CAPACITY</span>
              <span className={styles.detailValue}>{event.capacity}</span>
            </div>
          </div>

          {/* Info badges */}
          <div className={styles.badges}>
            <div className={styles.badge}>
              <span className={styles.badgeLabel}>ACCESS</span>
              <span className={styles.badgeValue}>{event.access}</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeLabel}>DRESS CODE</span>
              <span className={styles.badgeValue}>{event.dressCode}</span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.body}>
            {paragraphs.map((p, i) => (
              <p key={i} className={styles.paragraph}>{p}</p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {member && onToggleRsvp ? (
            <div className={styles.memberFooter}>
              <button
                className={`${styles.rsvpBtn} ${isRsvpd ? styles.rsvpBtnActive : ''}`}
                onClick={() => onToggleRsvp(event.id)}
              >
                {isRsvpd ? 'GOING' : 'RSVP NOW'}
              </button>
              {isRsvpd && <AddToCalendar event={event} />}
            </div>
          ) : (
            <ShinyButton
              className={`${btnStyles.filled} ${styles.cta}`}
              onClick={() => { onClose(); navigate('/membership'); }}
            >
              BECOME A MEMBER TO RSVP &rarr;
            </ShinyButton>
          )}
        </div>
      </div>
    </div>
  )
}
