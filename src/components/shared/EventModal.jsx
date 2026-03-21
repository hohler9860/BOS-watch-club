import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import ShinyButton from './ShinyButton'
import AddToCalendar from './AddToCalendar'
import { isWithin24Hours } from '../../pages/dashboard/utils'
import btnStyles from './ShinyButton.module.css'
import styles from './EventModal.module.css'

export default function EventModal({ event, onClose, member, isRsvpd, onToggleRsvp, guestForm, setGuestForm }) {
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

        {/* Hero image */}
        <div className={styles.hero}>
          {event.image && (
            <img
              src={event.image?.startsWith('http') ? event.image : `${base}assets/${event.image}`}
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
              <span className={styles.badgeValue}>{event.dress_code || event.dressCode}</span>
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
              {event.guest_policy === 'members_plus_one' && !isRsvpd && guestForm && setGuestForm && (() => {
                const locked = isWithin24Hours(event)
                const inputStyle = { width: '100%', marginBottom: 8, padding: '10px 12px', background: locked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: locked ? 'rgba(232,236,240,0.3)' : '#E8ECF0', fontSize: 13, boxSizing: 'border-box', cursor: locked ? 'not-allowed' : 'text' }
                return (
                  <div style={{ marginBottom: 16, width: '100%' }}>
                    <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: 'rgba(232,236,240,0.7)', marginBottom: 12 }}>BRING A GUEST (OPTIONAL)</p>
                    <input style={inputStyle} placeholder="Guest name" value={guestForm.name} onChange={e => setGuestForm(p => ({ ...p, name: e.target.value }))} disabled={locked} />
                    <input style={inputStyle} placeholder="Guest email" type="email" value={guestForm.email} onChange={e => setGuestForm(p => ({ ...p, email: e.target.value }))} disabled={locked} />
                    <input style={{ ...inputStyle, marginBottom: 4 }} placeholder="MM/DD/YYYY" type="text" value={guestForm.dob} onChange={e => setGuestForm(p => ({ ...p, dob: e.target.value }))} disabled={locked} />
                    <p style={{ fontSize: 11, color: '#e74c3c', marginTop: 4, fontWeight: 600 }}>* Your guest counts toward event capacity. Guest details must be submitted at least 24 hours before the event.</p>
                    {locked && <p style={{ fontSize: 11, color: '#e74c3c', marginTop: 4, fontWeight: 600 }}>* The 24-hour window has passed. To add a guest, please email <a href="mailto:boswatchclub@gmail.com" style={{ color: '#e74c3c', textDecoration: 'underline' }}>boswatchclub@gmail.com</a> with the details above.</p>}
                  </div>
                )
              })()}
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
