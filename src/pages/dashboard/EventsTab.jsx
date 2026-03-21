import FadeIn from '../../components/shared/FadeIn'
import BlurImage from '../../components/shared/BlurImage'
import AddToCalendar from '../../components/shared/AddToCalendar'
import { canAccessEvent, getPaymentBadge, getRsvpMessage, getRsvpButtonLabel, getGoingLabel, isWithin24Hours, getTierLabel } from './utils'
import s from '../DashboardPage.module.css'

export default function EventsTab({
  member,
  userTier,
  events,
  rsvps,
  rsvpEvents,
  eventFilter,
  setEventFilter,
  selectedEvent,
  setSelectedEvent,
  handleRsvpClick,
  rsvpModal,
  setRsvpModal,
  cancelModal,
  setCancelModal,
  confirmRsvp,
  confirmCancel,
  eventGuests,
  addGuestModal,
  setAddGuestModal,
  guestForm,
  setGuestForm,
  addGuestToEvent,
  guestWarning,
  setGuestWarning,
}) {
  function handleAddGuestClick(event) {
    if (isWithin24Hours(event)) {
      setGuestWarning(true)
    } else {
      setGuestForm({ name: '', email: '', dob: '' })
      setAddGuestModal(event)
    }
  }

  return (
    <div className={s.tabContent}>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Events</h1>
          <p className={s.pageSubtitle}>Browse and RSVP to upcoming gatherings</p>
        </div>
      </FadeIn>

      <FadeIn delay="0.05s">
        <div className={s.filterRow}>
          <button
            className={`${s.filterBtn} ${eventFilter === 'upcoming' ? s.filterBtnActive : ''}`}
            onClick={() => { setEventFilter('upcoming'); setSelectedEvent(null) }}
          >ALL EVENTS</button>
          <button
            className={`${s.filterBtn} ${eventFilter === 'rsvps' ? s.filterBtnActive : ''}`}
            onClick={() => { setEventFilter('rsvps'); setSelectedEvent(null) }}
          >MY RSVPs{rsvpEvents.length > 0 && ` (${rsvpEvents.length})`}</button>
        </div>
      </FadeIn>

      {/* Event Detail View */}
      {selectedEvent && (() => {
        const event = events.find((e) => e.id === selectedEvent)
        if (!event) return null
        const isRsvpd = rsvps.includes(event.id)
        const badge = getPaymentBadge(event)
        const canAccess = canAccessEvent(event, member?.id, userTier)
        return (
          <FadeIn>
            <div className={s.eventDetail}>
              <button className={s.backBtn} onClick={() => setSelectedEvent(null)}>&larr; Back to events</button>
              <div className={s.eventDetailImage}>
                <BlurImage src={event.image?.startsWith('http') ? event.image : `${import.meta.env.BASE_URL}assets/${event.image}`} alt={event.name} />
              </div>
              <div className={s.eventDetailBody}>
                <div className={s.eventDetailTitleRow}>
                  <h2 className={s.eventDetailName}>{event.name}</h2>
                  {badge && <span className={s[badge.className]}>{badge.label}</span>}
                </div>
                <p className={s.eventDetailTagline}>{event.tagline}</p>
                <div className={s.eventDetailMeta}>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>DATE</span>
                    <span className={s.metaValue}>{event.date}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>TIME</span>
                    <span className={s.metaValue}>{event.time}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>VENUE</span>
                    <span className={s.metaValue}>{event.venue}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>DRESS CODE</span>
                    <span className={s.metaValue}>{event.dress_code}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>CAPACITY</span>
                    <span className={s.metaValue}>{event.capacity}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>ACCESS</span>
                    <span className={s.metaValue}>{event.access}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>GUESTS</span>
                    <span className={s.metaValue}>{event.guest_policy === 'members_plus_one' ? '+1 Allowed' : 'Members Only'}</span>
                  </div>
                  {event.payment_type !== 'on_us' && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>PAYMENT</span>
                      <span className={s.metaValue}>
                        {event.payment_type === 'pay_during' && 'Cover your own tab'}
                        {event.payment_type === 'pay_after' && 'Bill split at end'}
                        {event.payment_type === 'upfront' && `$${event.price} upfront`}
                      </span>
                    </div>
                  )}
                  {event.cancellation_fee && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>CANCELLATION FEE</span>
                      <span className={s.metaValue}>${event.cancellation_fee} (within 24h)</span>
                    </div>
                  )}
                </div>
                <p className={s.eventDetailDesc}>{event.long_description || event.description}</p>
                <div className={s.eventDetailActions}>
                  {canAccess ? (
                    <button
                      className={`${s.actionBtn} ${isRsvpd ? s.actionBtnActive : ''}`}
                      onClick={() => handleRsvpClick(event)}
                    >
                      {isRsvpd ? getGoingLabel(event) : 'RSVP NOW'}
                    </button>
                  ) : (
                    <span className={s.tierLock}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      {getTierLabel(event.tier_minimum)}
                    </span>
                  )}
                  {isRsvpd && <AddToCalendar event={event} />}
                  {isRsvpd && event.guest_policy === 'members_plus_one' && !eventGuests?.[event.id] && (
                    <button
                      className={s.actionBtn}
                      style={{ background: 'transparent', border: '1px solid rgba(184,196,212,0.25)', fontSize: 11, padding: '8px 16px' }}
                      onClick={() => handleAddGuestClick(event)}
                    >
                      + ADD GUEST
                    </button>
                  )}
                </div>
                {/* Guest info card */}
                {isRsvpd && eventGuests?.[event.id] && (() => {
                  const guest = eventGuests[event.id]
                  const isPending = guest.status === 'pending'
                  return (
                    <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.15em', color: 'rgba(232,236,240,0.5)' }}>YOUR +1 GUEST</span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                          color: isPending ? '#f59e0b' : '#22c55e',
                          padding: '2px 8px',
                          background: isPending ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                          borderRadius: 4,
                        }}>
                          {isPending ? 'PENDING' : 'ACCEPTED'}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: '#E8ECF0', fontWeight: 400, margin: '4px 0 2px' }}>{guest.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(232,236,240,0.45)', margin: 0 }}>{guest.email}</p>
                    </div>
                  )
                })()}
              </div>
            </div>
          </FadeIn>
        )
      })()}

      {/* Events Grid */}
      {!selectedEvent && (
        <div className={s.eventsGrid}>
          {(eventFilter === 'upcoming' ? events : rsvpEvents).map((event, i) => {
            const isRsvpd = rsvps.includes(event.id)
            const badge = getPaymentBadge(event)
            const canAccess = canAccessEvent(event, member?.id, userTier)
            return (
              <FadeIn key={event.id} delay={`${0.05 * i}s`}>
                <div className={s.eventCard} onClick={() => setSelectedEvent(event.id)}>
                  <div className={s.eventImage}>
                    <BlurImage src={event.image?.startsWith('http') ? event.image : `${import.meta.env.BASE_URL}assets/${event.image}`} alt={event.name} />
                    <div className={s.eventDate}>
                      <span className={s.eventMonth}>{event.month}</span>
                      <span className={s.eventDay}>{event.day}</span>
                    </div>
                    {badge && <span className={`${s.eventPayBadge} ${s[badge.className]}`}>{badge.label}</span>}
                  </div>
                  <div className={s.eventBody}>
                    <h3 className={s.eventName}>{event.name}</h3>
                    <div className={s.eventMeta}>
                      <span>{event.date}</span>
                      <span className={s.dot} />
                      <span>{event.time}</span>
                    </div>
                    <p className={s.eventLocation}>{event.venue}</p>
                    <div className={s.eventFooter}>
                      <div className={s.eventTags}>
                        <span className={s.tag}>{event.access}</span>
                      </div>
                      {canAccess ? (
                        <button
                          className={`${s.rsvpSmall} ${isRsvpd ? s.rsvpSmallActive : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleRsvpClick(event) }}
                        >
                          {isRsvpd ? getGoingLabel(event) : 'RSVP'}
                        </button>
                      ) : (
                        <span className={s.tierLockSmall}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          {getTierLabel(event.tier_minimum)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      )}
      {!selectedEvent && eventFilter === 'upcoming' && events.length === 0 && (
        <FadeIn>
          <div className={s.empty}>
            <p className={s.emptyTitle}>No events right now</p>
            <p className={s.emptyText}>
              We will notify you when they become available.
            </p>
          </div>
        </FadeIn>
      )}
      {!selectedEvent && eventFilter === 'rsvps' && rsvpEvents.length === 0 && (
        <FadeIn>
          <div className={s.empty}>
            <p className={s.emptyTitle}>No RSVPs yet</p>
            <p className={s.emptyText}>
              Browse upcoming events and RSVP to the ones you&apos;d like to attend.
            </p>
            <button className={s.actionBtn} onClick={() => setEventFilter('upcoming')}>
              VIEW EVENTS
            </button>
          </div>
        </FadeIn>
      )}

    </div>
  )
}
