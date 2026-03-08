import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import events from '../data/events'
import tiers from '../data/tiers'
import FadeIn from '../components/shared/FadeIn'
import BlurImage from '../components/shared/BlurImage'
import AddToCalendar from '../components/shared/AddToCalendar'
import { toast } from '../components/shared/Toast'
import styles from './DashboardPage.module.css'

const TIER_COLORS = {
  ENTHUSIAST: { bg: 'rgba(160, 170, 180, 0.1)', border: 'rgba(160, 170, 180, 0.25)', text: '#A0AAB4' },
  COLLECTOR: { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.25)', text: '#D4AF37' },
  "WOMEN\u2019S CIRCLE": { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.25)', text: '#D4AF37' },
  PATRON: { bg: 'rgba(212, 175, 55, 0.12)', border: 'rgba(212, 175, 55, 0.35)', text: '#D4AF37' },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { member, loading, logout } = useAuth()
  const [rsvps, setRsvps] = useState([])
  const [activeTab, setActiveTab] = useState('upcoming')

  const fetchRsvps = useCallback(async () => {
    if (!supabase || !member) return
    const { data } = await supabase
      .from('rsvps')
      .select('event_id')
      .eq('user_id', member.id)
    if (data) setRsvps(data.map((r) => r.event_id))
  }, [member])

  useEffect(() => {
    if (!loading && !member) {
      navigate('/login')
      return
    }
    fetchRsvps()
  }, [member, loading, navigate, fetchRsvps])

  async function toggleRsvp(eventId) {
    if (!supabase || !member) return
    const isRsvpd = rsvps.includes(eventId)

    const eventName = events.find((e) => e.id === eventId)?.name || 'Event'

    if (isRsvpd) {
      await supabase
        .from('rsvps')
        .delete()
        .eq('user_id', member.id)
        .eq('event_id', eventId)
      setRsvps((prev) => prev.filter((id) => id !== eventId))
      toast(`RSVP cancelled for ${eventName}`)
    } else {
      await supabase
        .from('rsvps')
        .insert({ user_id: member.id, event_id: eventId })
      setRsvps((prev) => [...prev, eventId])
      toast(`You're going to ${eventName}!`)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (loading || !member) return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading your dashboard...</p>
        </div>
      </div>
    </section>
  )

  const firstName = member.name?.split(' ')[0] || 'Member'
  const userTier = member.tier || 'ENTHUSIAST'
  const tierData = tiers.find((t) => t.name === userTier) || tiers[0]
  const tierColor = TIER_COLORS[userTier] || TIER_COLORS.ENTHUSIAST
  const rsvpEvents = events.filter((e) => rsvps.includes(e.id))

  const now = new Date()
  const nextEvent = events.find((e) => new Date(e.date) >= now) || events[0]

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <FadeIn>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {member.avatar && (
                <img src={member.avatar} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
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
                <p className={styles.memberName}>{member.name}</p>
                <p className={styles.memberEmail}>{member.email}</p>
              </div>
              <div className={styles.memberCardFooter}>
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
                <BlurImage src={`${import.meta.env.BASE_URL}assets/${nextEvent.image}`} alt={nextEvent.name} />
                <div className={styles.nextEventOverlay} />
                <div className={styles.nextEventContent}>
                  <span className={styles.nextEventLabel}>NEXT EVENT</span>
                  <h3 className={styles.nextEventName}>{nextEvent.name}</h3>
                  <p className={styles.nextEventDetails}>
                    {nextEvent.date} &middot; {nextEvent.time}
                  </p>
                  <p className={styles.nextEventVenue}>{nextEvent.venue}</p>
                  <div className={styles.nextEventActions}>
                    <button
                      className={`${styles.nextEventRsvp} ${rsvps.includes(nextEvent.id) ? styles.nextEventRsvpActive : ''}`}
                      onClick={() => toggleRsvp(nextEvent.id)}
                    >
                      {rsvps.includes(nextEvent.id) ? 'GOING' : 'RSVP NOW'}
                    </button>
                    {rsvps.includes(nextEvent.id) && <AddToCalendar event={nextEvent} />}
                  </div>
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
                    <BlurImage
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
                      <div className={styles.eventActions}>
                        <button
                          className={`${styles.rsvpBtn} ${isRsvpd ? styles.rsvpActive : ''}`}
                          onClick={() => toggleRsvp(event.id)}
                        >
                          {isRsvpd ? 'GOING' : 'RSVP'}
                        </button>
                        {isRsvpd && <AddToCalendar event={event} />}
                      </div>
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
