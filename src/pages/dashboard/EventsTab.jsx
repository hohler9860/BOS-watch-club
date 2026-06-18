import FadeIn from '../../components/shared/FadeIn'
import BlurImage from '../../components/shared/BlurImage'
import AddToCalendar from '../../components/shared/AddToCalendar'
import CineButton from '../../components/redesign/CineButton'
import { canAccessEvent, getPaymentBadge, getRsvpMessage, getRsvpButtonLabel, getGoingLabel, isWithin24Hours, getTierLabel } from './utils'
import s from '../DashboardPage.module.css'

function isPastEvent(event) {
  return new Date(event.datetime || event.date) < new Date()
}

export default function EventsTab({
  member,
  userTier,
  events,
  pastEvents = [],
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

  // Determine which list to show based on the active filter
  const allEvents = [...events, ...pastEvents]
  const displayEvents = eventFilter === 'upcoming' ? events
    : eventFilter === 'past' ? pastEvents
    : eventFilter === 'rsvps' ? rsvpEvents
    : events

  return (
    <div className={s.tabContent}>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Events</h1>
          <p className={s.pageSubtitle}>
            {eventFilter === 'past' ? 'Look back at past gatherings' : 'Browse and RSVP to upcoming gatherings'}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay="0.05s">
        <div className={s.filterRow}>
          <button
            className={`${s.filterBtn} ${eventFilter === 'upcoming' ? s.filterBtnActive : ''}`}
            onClick={() => { setEventFilter('upcoming'); setSelectedEvent(null) }}
          >UPCOMING</button>
          <button
            className={`${s.filterBtn} ${eventFilter === 'rsvps' ? s.filterBtnActive : ''}`}
            onClick={() => { setEventFilter('rsvps'); setSelectedEvent(null) }}
          >MY RSVPs{rsvpEvents.length > 0 && ` (${rsvpEvents.length})`}</button>
          <button
            className={`${s.filterBtn} ${eventFilter === 'past' ? s.filterBtnActive : ''}`}
            onClick={() => { setEventFilter('past'); setSelectedEvent(null) }}
          >PAST EVENTS{pastEvents.length > 0 && ` (${pastEvents.length})`}</button>
        </div>
      </FadeIn>

      {/* Event Detail View */}
      {selectedEvent && (() => {
        const event = allEvents.find((e) => e.id === selectedEvent)
        if (!event) return null
        const isPast = isPastEvent(event)
        const isRsvpd = rsvps.includes(event.id)
        const badge = getPaymentBadge(event)
        const canAccess = canAccessEvent(event, member?.id, userTier)
        return (
          <FadeIn>
            <div className={s.eventDetail}>
              <button className={s.backBtn} onClick={() => setSelectedEvent(null)}>&larr; Back to events</button>
              {event.image && (
                <div className={s.eventDetailImage}>
                  <BlurImage src={event.image?.startsWith('http') ? event.image : `${import.meta.env.BASE_URL}assets/${event.image}`} alt={event.name} />
                  {isPast && (
                    <div className={s.pastEventOverlay}>
                      <span className={s.pastEventBadge}>PAST EVENT</span>
                    </div>
                  )}
                </div>
              )}
              <div className={s.eventDetailBody}>
                <div className={s.eventDetailTitleRow}>
                  <h2 className={s.eventDetailName}>{event.name}</h2>
                  {isPast
                    ? <span className={s.pastBadgeInline}>PAST</span>
                    : badge && <span className={s[badge.className]}>{badge.label}</span>
                  }
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
                  {!isPast && event.payment_type !== 'on_us' && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>PAYMENT</span>
                      <span className={s.metaValue}>
                        {event.payment_type === 'pay_during' && 'Cover your own tab'}
                        {event.payment_type === 'pay_after' && 'Bill split at end'}
                        {event.payment_type === 'upfront' && `$${event.price} upfront`}
                      </span>
                    </div>
                  )}
                  {!isPast && event.cancellation_fee && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>CANCELLATION FEE</span>
                      <span className={s.metaValue}>${event.cancellation_fee} (within 24h)</span>
                    </div>
                  )}
                </div>
                <p className={s.eventDetailDesc}>{event.long_description || event.description}</p>
                <div className={s.eventDetailActions}>
                  {isPast ? (
                    <span className={s.pastEventNote}>This event has concluded.</span>
                  ) : event.partiful_url ? (
                    <CineButton
                      onClick={() => window.open(event.partiful_url, '_blank', 'noopener,noreferrer')}
                      style={{ minWidth: 0, width: 180, height: 46 }}
                    >
                      RSVP NOW
                    </CineButton>
                  ) : canAccess ? (
                    <CineButton
                      onClick={() => handleRsvpClick(event)}
                      style={{ minWidth: 0, width: 180, height: 46 }}
                    >
                      {isRsvpd ? getGoingLabel(event) : 'RSVP NOW'}
                    </CineButton>
                  ) : (
                    <span className={s.tierLock}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      {getTierLabel(event.tier_minimum)}
                    </span>
                  )}
                  {!isPast && isRsvpd && <AddToCalendar event={event} />}
                  {!isPast && isRsvpd && event.guest_policy === 'members_plus_one' && !eventGuests?.[event.id] && (
                    <button
                      className={s.actionBtn}
                      style={{ background: 'transparent', border: '1px solid rgba(184,196,212,0.25)', fontSize: 11, padding: '8px 16px' }}
                      onClick={() => handleAddGuestClick(event)}
                    >
                      + ADD GUEST
                    </button>
                  )}
                </div>
                {/* Attended badge for past events the user RSVP'd to */}
                {isPast && isRsvpd && (
                  <div className={s.attendedBadge}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    You attended this event
                  </div>
                )}
                {/* Guest info card */}
                {isRsvpd && eventGuests?.[event.id] && (() => {
                  const guest = eventGuests[event.id]
                  const isPending = guest.status === 'pending'
                  return (
                    <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(26,26,26,0.03)', border: '1px solid rgba(26,26,26,0.08)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.15em', color: 'rgba(26,26,26,0.5)' }}>YOUR +1 GUEST</span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                          color: isPending ? '#8a6d1a' : '#1f7a4d',
                          padding: '2px 8px',
                          background: isPending ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                          borderRadius: 4,
                        }}>
                          {isPending ? 'PENDING' : 'ACCEPTED'}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 400, margin: '4px 0 2px' }}>{guest.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(26,26,26,0.45)', margin: 0 }}>{guest.email}</p>
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
          {displayEvents.map((event, i) => {
            const isPast = isPastEvent(event)
            const isRsvpd = rsvps.includes(event.id)
            const badge = getPaymentBadge(event)
            const canAccess = canAccessEvent(event, member?.id, userTier)
            return (
              <FadeIn key={event.id} delay={`${0.05 * i}s`}>
                <div
                  className={`${s.eventCard} ${isPast ? s.eventCardPast : ''}`}
                  onClick={() => event.partiful_url ? window.open(event.partiful_url, '_blank', 'noopener,noreferrer') : setSelectedEvent(event.id)}
                >
                  {event.image && (
                    <div className={s.eventImage}>
                      <BlurImage src={event.image?.startsWith('http') ? event.image : `${import.meta.env.BASE_URL}assets/${event.image}`} alt={event.name} />
                      <div className={s.eventDate}>
                        <span className={s.eventMonth}>{event.month}</span>
                        <span className={s.eventDay}>{event.day}</span>
                      </div>
                      {isPast
                        ? <span className={`${s.eventPayBadge} ${s.pastPayBadge}`}>PAST</span>
                        : badge && <span className={`${s.eventPayBadge} ${s[badge.className]}`}>{badge.label}</span>
                      }
                    </div>
                  )}
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
                        {event.access && <span className={s.tag}>{event.access}</span>}
                        {isPast && isRsvpd && <span className={s.tagAttended}>Attended</span>}
                      </div>
                      {!isPast && (
                        event.partiful_url ? (
                          <CineButton
                            onClick={(e) => { e.stopPropagation(); window.open(event.partiful_url, '_blank', 'noopener,noreferrer') }}
                            style={{ minWidth: 0, width: 110, height: 36 }}
                          >
                            RSVP
                          </CineButton>
                        ) : canAccess ? (
                          <CineButton
                            onClick={(e) => { e.stopPropagation(); handleRsvpClick(event) }}
                            style={{ minWidth: 0, width: 110, height: 36 }}
                          >
                            {isRsvpd ? getGoingLabel(event) : 'RSVP'}
                          </CineButton>
                        ) : (
                          <span className={s.tierLockSmall}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            {getTierLabel(event.tier_minimum)}
                          </span>
                        )
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
            <p className={s.emptyTitle}>No upcoming events</p>
            <p className={s.emptyText}>
              We will notify you when new events become available.
            </p>
            {pastEvents.length > 0 && (
              <button className={s.actionBtn} onClick={() => setEventFilter('past')}>
                VIEW PAST EVENTS
              </button>
            )}
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
      {!selectedEvent && eventFilter === 'past' && pastEvents.length === 0 && (
        <FadeIn>
          <div className={s.empty}>
            <p className={s.emptyTitle}>No past events yet</p>
            <p className={s.emptyText}>
              Past events will appear here after they&apos;ve taken place.
            </p>
            <button className={s.actionBtn} onClick={() => setEventFilter('upcoming')}>
              VIEW UPCOMING EVENTS
            </button>
          </div>
        </FadeIn>
      )}

    </div>
  )
}
