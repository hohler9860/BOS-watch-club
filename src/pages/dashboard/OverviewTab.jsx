import FadeIn from '../../components/shared/FadeIn'
import BlurImage from '../../components/shared/BlurImage'
import AddToCalendar from '../../components/shared/AddToCalendar'
import CineButton from '../../components/redesign/CineButton'
import { canAccessEvent, getPaymentBadge, getGoingLabel, getTierLabel } from './utils'
import s from '../DashboardPage.module.css'

export default function OverviewTab({
  member,
  firstName,
  userTier,
  tierColor,
  events,
  upcomingEvents,
  attendedEvents,
  nextEvent,
  rsvps,
  sortedNews,
  directoryMembers,
  selectedUpdate,
  setSelectedUpdate,
  setActiveTab,
  setSelectedEvent,
  setShowAllTiers,
  membershipRef,
  handleRsvpClick,
}) {
  return (
    <div className={s.tabContent}>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Welcome back, {firstName}</h1>
          <p className={s.pageSubtitle}>Here&apos;s what&apos;s happening at Boston Watch Club</p>
        </div>
      </FadeIn>

      {/* Updates / Notifications — newest first */}
      <FadeIn delay="0.05s">
        <div className={s.sectionCard}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>LATEST UPDATES</h2>
            <button className={s.seeAllBtn} onClick={() => setActiveTab('notifications')}>
              View all &rarr;
            </button>
          </div>
          <div className={s.updatesList}>
            {sortedNews.slice(0, 3).map((item) => (
              <div key={item.id} className={s.updateItem} onClick={() => setSelectedUpdate(item)} style={{ cursor: 'pointer' }}>
                <div className={s.updateDot} />
                <div>
                  <p className={s.updateTitle}>{item.title}</p>
                  <p className={s.updatePreview}>{item.preview}</p>
                  <span className={s.updateDate}>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Update Detail Modal */}
      {selectedUpdate && (
        <div className={s.modalOverlay} onClick={() => setSelectedUpdate(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>{selectedUpdate.title}</h2>
              <button className={s.modalClose} onClick={() => setSelectedUpdate(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <span className={s.modalDate}>{selectedUpdate.date}</span>
            <div className={s.modalBody}>
              <p>{selectedUpdate.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <FadeIn delay="0.1s">
        <div className={s.kpiRow}>
          <div className={s.kpiCard}>
            <span className={s.kpiValue}>{rsvps.length}</span>
            <span className={s.kpiLabel}>Events RSVP&apos;d</span>
          </div>
          <div className={s.kpiCard}>
            <span className={s.kpiValue}>{attendedEvents.length}</span>
            <span className={s.kpiLabel}>Events Attended</span>
          </div>
          <div className={s.kpiCard}>
            <span className={s.kpiValue}>{directoryMembers.length}</span>
            <span className={s.kpiLabel}>Members</span>
          </div>
          <div className={s.kpiCard}>
            <span className={s.kpiValue} style={{ color: '#1f7a4d', fontSize: '20px' }}>Active</span>
            <span className={s.kpiLabel}>Status</span>
          </div>
        </div>
      </FadeIn>

      {/* Next Event Highlight */}
      {nextEvent && (
        <FadeIn delay="0.15s">
          <div className={s.nextEvent}>
            <span className={s.nextEventLabel}>NEXT EVENT</span>
            <h3 className={s.nextEventName}>{nextEvent.name}</h3>
            <p className={s.nextEventDetails}>{nextEvent.date} &middot; {nextEvent.time}</p>
            {nextEvent.venue && <p className={s.nextEventVenue}>{nextEvent.venue}</p>}
            <div className={s.nextEventActions}>
              {nextEvent.partiful_url ? (
                <CineButton
                  onClick={() => window.open(nextEvent.partiful_url, '_blank', 'noopener,noreferrer')}
                  style={{ minWidth: 0, width: 160, height: 44 }}
                >
                  RSVP NOW
                </CineButton>
              ) : canAccessEvent(nextEvent, member?.id, userTier) ? (
                <CineButton
                  onClick={() => handleRsvpClick(nextEvent)}
                  style={{ minWidth: 0, width: 160, height: 44 }}
                >
                  {rsvps.includes(nextEvent.id) ? getGoingLabel(nextEvent) : 'RSVP NOW'}
                </CineButton>
              ) : (
                <span className={s.tierLock}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  {getTierLabel(nextEvent.tier_minimum)}
                </span>
              )}
              {!nextEvent.partiful_url && rsvps.includes(nextEvent.id) && <AddToCalendar event={nextEvent} />}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Upcoming Events Preview */}
      <FadeIn delay="0.2s">
        <div className={s.sectionCard}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>UPCOMING EVENTS</h2>
            <button className={s.seeAllBtn} onClick={() => setActiveTab('events')}>
              See all &rarr;
            </button>
          </div>
          <div className={s.upcomingList}>
            {upcomingEvents.length === 0 && (
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, letterSpacing: '0.06em', color: 'rgba(26,26,26,0.5)', textAlign: 'center', padding: '24px 0' }}>
                No events right now. We will notify you when they become available.
              </p>
            )}
            {upcomingEvents.slice(1, 4).map((event) => {
              const badge = getPaymentBadge(event)
              const canAccess = canAccessEvent(event, member?.id, userTier)
              return (
                <div
                  key={event.id}
                  className={s.upcomingItem}
                  onClick={() => { setActiveTab('events'); setSelectedEvent(event.id) }}
                >
                  <div className={s.upcomingDate}>
                    <span className={s.upcomingMonth}>{event.month}</span>
                    <span className={s.upcomingDay}>{event.day}</span>
                  </div>
                  <div className={s.upcomingInfo}>
                    <p className={s.upcomingName}>{event.name}</p>
                    <p className={s.upcomingMeta}>{event.time} &middot; {event.venue}</p>
                  </div>
                  {canAccess ? (
                    <button
                      className={`${s.rsvpSmall} ${rsvps.includes(event.id) ? s.rsvpSmallActive : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleRsvpClick(event) }}
                    >
                      {rsvps.includes(event.id) ? getGoingLabel(event) : 'RSVP'}
                    </button>
                  ) : (
                    <span className={s.tierLockSmall}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      {getTierLabel(event.tier_minimum)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
