import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import events from '../data/events'
import tiers from '../data/tiers'
import FadeIn from '../components/shared/FadeIn'
import styles from './DashboardPage.module.css'

// Local helpers — swap for API calls when backend is ready
function getSession() {
  try { return JSON.parse(localStorage.getItem('bwc_session')) } catch { return null }
}
function getUsers() {
  return JSON.parse(localStorage.getItem('bwc_users') || '[]')
}
function saveUsers(users) {
  localStorage.setItem('bwc_users', JSON.stringify(users))
}
function logout() {
  localStorage.removeItem('bwc_session')
}

const TIER_COLORS = {
  ENTHUSIAST: { bg: 'rgba(160, 170, 180, 0.1)', border: 'rgba(160, 170, 180, 0.25)', text: '#A0AAB4' },
  COLLECTOR: { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.25)', text: '#D4AF37' },
  'WOMAN COLLECTOR': { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.25)', text: '#D4AF37' },
  PATRON: { bg: 'rgba(212, 175, 55, 0.12)', border: 'rgba(212, 175, 55, 0.35)', text: '#D4AF37' },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    const s = getSession()
    if (!s) { navigate('/login'); return }
    setSession(s)
    const u = getUsers().find((usr) => usr.id === s.id)
    if (u) {
      setUser(u)
      setRsvps(u.rsvps || [])
    }
  }, [navigate])

  function toggleRsvp(eventId) {
    const users = getUsers()
    const idx = users.findIndex((u) => u.id === session.id)
    if (idx === -1) return
    const current = users[idx].rsvps || []
    const updated = current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId]
    users[idx].rsvps = updated
    saveUsers(users)
    setRsvps(updated)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!session || !user) return null

  const firstName = session.name?.split(' ')[0] || 'Member'
  const userTier = user.tier || 'ENTHUSIAST'
  const tierData = tiers.find((t) => t.name === userTier) || tiers[0]
  const tierColor = TIER_COLORS[userTier] || TIER_COLORS.ENTHUSIAST
  const rsvpEvents = events.filter((e) => rsvps.includes(e.id))

  // Find next upcoming event (first one not yet past)
  const now = new Date()
  const nextEvent = events.find((e) => new Date(e.date) >= now) || events[0]

  // Member since
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'March 2026'

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <FadeIn>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {session.avatar && (
                <img src={session.avatar} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
              )}
              <div>
                <p className={styles.greeting}>Welcome back,</p>
                <h1 className={styles.name}>{firstName}</h1>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>LOG OUT</button>
          </div>
        </FadeIn>

        {/* Membership card + Stats row */}
        <div className={styles.topRow}>
          <FadeIn delay="0.05s">
            <div
              className={styles.memberCard}
              style={{
                borderColor: tierColor.border,
                background: `linear-gradient(135deg, ${tierColor.bg}, rgba(20, 24, 32, 0.6))`,
              }}
            >
              <div className={styles.memberCardHeader}>
                <span className={styles.memberCardLabel}>MEMBERSHIP</span>
                <span
                  className={styles.tierBadge}
                  style={{ background: tierColor.bg, color: tierColor.text, borderColor: tierColor.border }}
                >
                  {userTier}
                </span>
              </div>
              <div className={styles.memberCardBody}>
                <p className={styles.memberName}>{session.name}</p>
                <p className={styles.memberEmail}>{session.email}</p>
              </div>
              <div className={styles.memberCardFooter}>
                <div>
                  <span className={styles.memberMetaLabel}>MEMBER SINCE</span>
                  <span className={styles.memberMetaValue}>{memberSince}</span>
                </div>
                <div>
                  <span className={styles.memberMetaLabel}>TIER PRICE</span>
                  <span className={styles.memberMetaValue}>{tierData.price} {tierData.period}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay="0.1s">
            <div className={styles.statsCol}>
              <div className={styles.statBox}>
                <span className={styles.statNumber}>{rsvps.length}</span>
                <span className={styles.statLabel}>RSVPs</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNumber}>{events.length}</span>
                <span className={styles.statLabel}>Events</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNumber} style={{ color: '#34A853', fontSize: '16px' }}>Active</span>
                <span className={styles.statLabel}>Status</span>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Tier Benefits */}
        <FadeIn delay="0.12s">
          <div className={styles.benefitsCard}>
            <h3 className={styles.sectionTitle}>YOUR {userTier} BENEFITS</h3>
            <ul className={styles.benefitsList}>
              {tierData.benefits.map((b, i) => (
                <li key={i} className={styles.benefitItem}>
                  <span className={styles.benefitCheck}>&#10003;</span>
                  {b}
                </li>
              ))}
            </ul>
            {userTier === 'ENTHUSIAST' && (
              <Link to="/membership" className={styles.upgradeLink}>
                Explore higher tiers &rarr;
              </Link>
            )}
          </div>
        </FadeIn>

        {/* Next Event Highlight */}
        {nextEvent && (
          <FadeIn delay="0.15s">
            <div className={styles.nextEvent}>
              <div className={styles.nextEventImage}>
                <img src={`${import.meta.env.BASE_URL}assets/${nextEvent.image}`} alt={nextEvent.name} />
                <div className={styles.nextEventOverlay} />
                <div className={styles.nextEventContent}>
                  <span className={styles.nextEventLabel}>NEXT EVENT</span>
                  <h3 className={styles.nextEventName}>{nextEvent.name}</h3>
                  <p className={styles.nextEventDetails}>
                    {nextEvent.date} &middot; {nextEvent.time}
                  </p>
                  <p className={styles.nextEventVenue}>{nextEvent.venue}</p>
                  <button
                    className={`${styles.nextEventRsvp} ${rsvps.includes(nextEvent.id) ? styles.nextEventRsvpActive : ''}`}
                    onClick={() => toggleRsvp(nextEvent.id)}
                  >
                    {rsvps.includes(nextEvent.id) ? 'GOING' : 'RSVP NOW'}
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Quick Links */}
        <FadeIn delay="0.18s">
          <div className={styles.quickLinks}>
            <Link to="/events" className={styles.quickLink}>
              <span className={styles.quickLinkIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <span className={styles.quickLinkText}>All Events</span>
            </Link>
            <Link to="/membership" className={styles.quickLink}>
              <span className={styles.quickLinkIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span className={styles.quickLinkText}>Membership</span>
            </Link>
            <a href="https://form.typeform.com/to/ntT8GKqz" target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
              <span className={styles.quickLinkIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              <span className={styles.quickLinkText}>Apply / Upgrade</span>
            </a>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay="0.2s">
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              ALL EVENTS
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'rsvps' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('rsvps')}
            >
              MY RSVPs{rsvps.length > 0 && ` (${rsvps.length})`}
            </button>
          </div>
        </FadeIn>

        {/* Events grid */}
        <div className={styles.grid}>
          {(activeTab === 'upcoming' ? events : rsvpEvents).map((event, i) => {
            const isRsvpd = rsvps.includes(event.id)
            return (
              <FadeIn key={event.id} delay={`${0.05 * i}s`}>
                <div className={styles.eventCard}>
                  <div className={styles.eventImage}>
                    <img
                      src={`${import.meta.env.BASE_URL}assets/${event.image}`}
                      alt={event.name}
                    />
                    <div className={styles.eventDate}>
                      <span className={styles.eventMonth}>{event.month}</span>
                      <span className={styles.eventYear}>{event.day}</span>
                    </div>
                  </div>
                  <div className={styles.eventBody}>
                    <h3 className={styles.eventName}>{event.name}</h3>
                    <div className={styles.eventMeta}>
                      <span>{event.date}</span>
                      <span className={styles.dot} />
                      <span>{event.time}</span>
                    </div>
                    <p className={styles.eventLocation}>{event.venue}</p>
                    <div className={styles.eventFooter}>
                      <div className={styles.eventTags}>
                        <span className={styles.tag}>{event.access}</span>
                        <span className={styles.tag}>{event.capacity}</span>
                      </div>
                      <button
                        className={`${styles.rsvpBtn} ${isRsvpd ? styles.rsvpActive : ''}`}
                        onClick={() => toggleRsvp(event.id)}
                      >
                        {isRsvpd ? 'GOING' : 'RSVP'}
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
          {activeTab === 'rsvps' && rsvpEvents.length === 0 && (
            <FadeIn>
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No RSVPs yet</p>
                <p className={styles.emptyText}>
                  Browse upcoming events and RSVP to the ones you&apos;d like to attend.
                </p>
                <button className={styles.emptyBtn} onClick={() => setActiveTab('upcoming')}>
                  VIEW EVENTS
                </button>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  )
}
