import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import events from '../data/events'
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

export default function DashboardPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    const s = getSession()
    if (!s) { navigate('/login'); return }
    setSession(s)
    const user = getUsers().find((u) => u.id === s.id)
    if (user) setRsvps(user.rsvps || [])
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

  if (!session) return null

  const firstName = session.name?.split(' ')[0] || 'Member'
  const rsvpEvents = events.filter((e) => rsvps.includes(e.id))
  const upcomingEvents = events

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <FadeIn>
          <div className={styles.header}>
            <div>
              <p className={styles.greeting}>Welcome back,</p>
              <h1 className={styles.name}>{firstName}</h1>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              LOG OUT
            </button>
          </div>
        </FadeIn>

        {/* Stats strip */}
        <FadeIn delay="0.05s">
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{rsvps.length}</span>
              <span className={styles.statLabel}>RSVPs</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>{events.length}</span>
              <span className={styles.statLabel}>Upcoming</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>Active</span>
              <span className={styles.statLabel}>Status</span>
            </div>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay="0.1s">
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
          {(activeTab === 'upcoming' ? upcomingEvents : rsvpEvents).map((event, i) => {
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
