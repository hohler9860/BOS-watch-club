import { useState } from 'react'
import { Navigate } from 'react-router'
import useAuth from '../hooks/useAuth'
import { DIRECTORY_MEMBERS } from '../data/mockMembers'
import { DASHBOARD_EVENTS } from '../data/mockEvents'
import { CLUB_NEWS } from '../data/mockNews'
import styles from './DashboardPage.module.css'

const TIER_ORDER = { student: 0, enthusiast: 1, collector: 2, patron: 3 }

function TierBadge({ tier }) {
  return <span className={`${styles.badge} ${styles[tier]}`}>{tier.toUpperCase()}</span>
}

function canRsvp(memberTier, minTier) {
  if (!minTier) return true
  return TIER_ORDER[memberTier] >= TIER_ORDER[minTier]
}

export default function DashboardPage() {
  const { member } = useAuth()
  const [rsvps, setRsvps] = useState({})
  const [expandedNews, setExpandedNews] = useState(null)

  if (!member) return <Navigate to="/login" replace />

  function toggleRsvp(eventId) {
    setRsvps((prev) => ({ ...prev, [eventId]: !prev[eventId] }))
  }

  return (
    <section className={styles.page}>
      <div className={styles.welcome}>
        <h1 className={styles.greeting}>Welcome back, {member.name}</h1>
        <TierBadge tier={member.tier} />
      </div>

      <div className={styles.grid}>
        {/* Member Directory */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Member Directory</h2>
          <ul className={styles.memberList}>
            {DIRECTORY_MEMBERS.slice(0, 4).map((m) => (
              <li key={m.name} className={styles.memberItem}>
                <div className={styles.memberTop}>
                  <span className={styles.memberName}>{m.name}</span>
                  <TierBadge tier={m.tier} />
                </div>
                <p className={styles.memberDetail}>Collects: {m.collects}</p>
                <p className={styles.memberHandle}>{m.instagram}</p>
              </li>
            ))}
          </ul>
          <button className={styles.cardBtn}>View All Members</button>
        </div>

        {/* Upcoming Events */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Upcoming Events</h2>
          <ul className={styles.eventList}>
            {DASHBOARD_EVENTS.map((evt) => {
              const allowed = canRsvp(member.tier, evt.minTier)
              return (
                <li key={evt.id} className={styles.eventItem}>
                  <div className={styles.eventHeader}>
                    <span className={styles.eventName}>{evt.name}</span>
                    {evt.minTier && (
                      <span className={styles.lockBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        {evt.minTier.toUpperCase()}+
                      </span>
                    )}
                  </div>
                  <p className={styles.eventMeta}>{evt.date} &mdash; {evt.venue}</p>
                  <p className={styles.eventDesc}>{evt.description}</p>
                  {allowed ? (
                    <button
                      className={`${styles.rsvpBtn} ${rsvps[evt.id] ? styles.rsvpActive : ''}`}
                      onClick={() => toggleRsvp(evt.id)}
                    >
                      {rsvps[evt.id] ? 'Going \u2713' : 'RSVP'}
                    </button>
                  ) : (
                    <button className={styles.rsvpBtn} disabled>
                      Collector+ Only
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Club News */}
        <div className={`${styles.card} ${styles.newsCard}`}>
          <h2 className={styles.cardTitle}>Club News</h2>
          <ul className={styles.newsList}>
            {CLUB_NEWS.map((item) => (
              <li key={item.id} className={styles.newsItem}>
                <button
                  className={styles.newsBtn}
                  onClick={() => setExpandedNews(expandedNews === item.id ? null : item.id)}
                >
                  <span className={styles.newsTitle}>{item.title}</span>
                  <span className={styles.newsDate}>{item.date}</span>
                  <p className={styles.newsPreview}>{item.preview}</p>
                </button>
                {expandedNews === item.id && (
                  <div className={styles.newsBody}>{item.body}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
