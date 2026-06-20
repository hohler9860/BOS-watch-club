import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import AddToCalendar from './AddToCalendar'
import CineButton from '../redesign/CineButton'
import styles from './EventModal.module.css'

export default function EventModal({ event, onClose, member, isRsvpd, onToggleRsvp, isPast }) {
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

  const paragraphs = (event.long_description || event.longDescription || event.description)
    .split('\n\n')
    .filter(Boolean)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">&times;</button>

        {/* Hero — photo header when there's an image, clean editorial header when not */}
        {event.image ? (
          <div className={styles.hero}>
            <img
              src={event.image?.startsWith('http') ? event.image : `${base}assets/${event.image}`}
              alt={event.name}
              className={styles.heroImage}
              style={event.imagePosition ? { objectPosition: event.imagePosition } : undefined}
            />
            <div className={styles.heroOverlay} />
            <div className={styles.heroContent}>
              <span className={styles.heroDate}>{event.date}</span>
              <h2 className={styles.heroTitle}>{event.name}</h2>
              {event.tagline && <p className={styles.heroTagline}>{event.tagline}</p>}
            </div>
          </div>
        ) : (
          <div className={styles.heroPlain}>
            <span className={styles.heroPlainDate}>{event.date}</span>
            <h2 className={styles.heroPlainTitle}>{event.name}</h2>
            {event.tagline && <p className={styles.heroPlainTagline}>{event.tagline}</p>}
          </div>
        )}

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

          {/* Description */}
          <div className={styles.body}>
            {paragraphs.map((p, i) => (
              <p key={i} className={styles.paragraph}>{p}</p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {isPast ? (
            <span className={styles.pastNote}>This event has concluded.</span>
          ) : event.partiful_url ? (
            member ? (
              <CineButton onClick={() => window.open(event.partiful_url, '_blank', 'noopener,noreferrer')}>
                RSVP Now
              </CineButton>
            ) : (
              <CineButton onClick={() => { onClose(); navigate('/login') }}>
                Members Only
              </CineButton>
            )
          ) : member && onToggleRsvp ? (
            <div className={styles.memberFooter}>
              <CineButton onClick={() => onToggleRsvp(event.id)}>
                {isRsvpd ? 'Going' : 'RSVP Now'}
              </CineButton>
              {isRsvpd && <AddToCalendar event={event} />}
            </div>
          ) : (
            <CineButton onClick={() => { onClose(); navigate('/membership') }}>
              Become a Member
            </CineButton>
          )}
        </div>
      </div>
    </div>
  )
}
