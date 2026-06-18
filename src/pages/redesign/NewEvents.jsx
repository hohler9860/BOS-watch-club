/**
 * NewEvents — /redesign/events
 *
 * Reskin of EventsPage.jsx for the Kettle Kids aesthetic:
 * white background, ABC Marist headings, Georgia body, generous whitespace,
 * angled octagon CTA buttons, editorial minimal luxury.
 *
 * LOGIC REUSE: All Supabase data-fetching, RSVP state, auth checks, and
 * the notification fetch() call are copied verbatim from EventsPage.jsx.
 * EventModal is rendered as-is (unchanged) — it owns its own styling and
 * all RSVP / toggle-rsvp / add-to-calendar behavior is preserved.
 *
 * LINKS IN-WORLD: all navigational links point to /redesign/* routes.
 *   - Empty-state membership CTA: /redesign/membership
 *   - EventModal's internal navigate('/membership') still fires on its own —
 *     that modal is rendered as-is per the "never break RSVP" rule.
 */

import { useState, useCallback, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'
import { useEvents, useSiteContent } from '../../hooks/useSupabaseData'
import FadeIn from '../../components/shared/FadeIn'
import EventModal from '../../components/shared/EventModal'
import CineButton from '../../components/redesign/CineButton'
import styles from './NewEvents.module.css'

export default function NewEvents() {
  // ── Auth & data (verbatim from EventsPage.jsx) ──────────────────────────────
  const { member } = useAuth()
  const { data: allEvents } = useEvents()
  const { content } = useSiteContent()
  const [activeEvent, setActiveEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [tab, setTab] = useState('upcoming')

  const now = new Date()
  const upcomingEvents = allEvents.filter(e => new Date(e.datetime || e.date) >= now)
  const pastEvents = allEvents.filter(e => new Date(e.datetime || e.date) < now)
  const displayEvents = tab === 'upcoming' ? upcomingEvents : pastEvents

  // ── RSVP fetch (verbatim from EventsPage.jsx) ───────────────────────────────
  const fetchRsvps = useCallback(async () => {
    if (!supabase || !member) return
    const { data } = await supabase
      .from('rsvps')
      .select('event_id')
      .eq('user_id', member.id)
    if (data) setRsvps(data.map((r) => r.event_id))
  }, [member])

  useEffect(() => {
    fetchRsvps()
  }, [fetchRsvps])

  // ── toggleRsvp (verbatim from EventsPage.jsx) ────────────────────────────────
  async function toggleRsvp(eventId) {
    if (!supabase || !member) return
    const isRsvpd = rsvps.includes(eventId)

    if (isRsvpd) {
      await supabase
        .from('rsvps')
        .delete()
        .eq('user_id', member.id)
        .eq('event_id', eventId)
      setRsvps((prev) => prev.filter((id) => id !== eventId))
    } else {
      await supabase
        .from('rsvps')
        .insert({ user_id: member.id, event_id: eventId })
      setRsvps((prev) => [...prev, eventId])

      // Send RSVP confirmation email (verbatim from EventsPage.jsx)
      const event = allEvents.find(e => e.id === eventId)
      if (event) {
        fetch('/api/notify-rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: member.id,
            eventId,
            eventName: event.name,
            venue: event.venue,
            date: event.date,
            time: event.time,
            dressCode: event.dressCode || event.dress_code,
          }),
        }).catch(err => console.error('RSVP email failed:', err))
      }
    }
  }
  // ── End verbatim logic ───────────────────────────────────────────────────────

  const isPastTab = tab === 'past'

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{isPastTab ? 'Past Events' : 'Events'} — Boston Watch Club</title>
        <meta name="description" content="Discover curated watch events and exclusive gatherings for collectors in Boston. Private dinners, brand experiences, and casual meetups." />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <FadeIn>
          <h1 className={styles.heroTitle}>
            {isPastTab ? 'Past Events' : 'Upcoming Events'}
          </h1>
        </FadeIn>
        <FadeIn>
          <p className={styles.heroSubtitle}>
            {isPastTab
              ? 'A look back at our past gatherings and experiences.'
              : (content.eventsPageSubtitle || 'Curated gatherings for collectors, enthusiasts, and those who appreciate the finer things.')
            }
          </p>
        </FadeIn>
        <FadeIn delay="0.1s">
          <div className={styles.tabRow}>
            <button
              className={`${styles.tabBtn} ${tab === 'upcoming' ? styles.tabBtnActive : ''}`}
              onClick={() => setTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`${styles.tabBtn} ${tab === 'past' ? styles.tabBtnActive : ''}`}
              onClick={() => setTab('past')}
            >
              Past Events{pastEvents.length > 0 && ` (${pastEvents.length})`}
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ── Events list ── */}
      <section className={styles.eventsSection}>
        <div className={styles.inner}>
          {displayEvents.length === 0 ? (
            /* ── Empty state ── */
            <FadeIn>
              <div className={styles.empty}>
                <h3 className={styles.emptyTitle}>
                  {isPastTab ? 'No past events yet' : 'No events yet'}
                </h3>
                <p className={styles.emptyText}>
                  {isPastTab
                    ? 'Past events will appear here after they\'ve taken place.'
                    : 'New events are being planned. Check back soon.'
                  }
                </p>

                {/* In-world links: /redesign/membership, not bare /membership */}
                {tab === 'upcoming' && (
                  <CineButton
                    to="/redesign/membership"
                    style={{ height: 52, marginTop: 32 }}
                  >
                    Join the Club
                  </CineButton>
                )}
                {tab === 'past' && upcomingEvents.length > 0 && (
                  <CineButton
                    onClick={() => setTab('upcoming')}
                    style={{ height: 52, marginTop: 32 }}
                  >
                    View upcoming events
                  </CineButton>
                )}
              </div>
            </FadeIn>
          ) : (
            /* ── Event cards ── */
            <div>
              {displayEvents.map((evt) => {
                const isRsvpd = rsvps.includes(evt.id)
                return (
                  <FadeIn key={evt.id}>
                    <article
                      className={`${styles.card} ${isPastTab ? styles.pastCard : ''}`}
                      onClick={() => setActiveEvent(evt)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveEvent(evt) }}
                      aria-label={`View details for ${evt.name}`}
                    >
                      {/* Full-width image banner when present */}
                      {evt.image && (
                        <div className={styles.cardImageWrap}>
                          <img
                            src={evt.image}
                            alt={evt.name}
                            className={styles.cardImage}
                            loading="lazy"
                          />
                          {isPastTab && (
                            <div className={styles.pastImageOverlay}>
                              <span className={styles.pastLabel}>Past Event</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Date block */}
                      <div className={styles.dateBlock}>
                        <span className={styles.dateMonth}>{evt.month}</span>
                        <span className={styles.dateDay}>{evt.day}</span>
                      </div>

                      {/* Details */}
                      <div className={styles.details}>
                        <h2 className={styles.eventName}>{evt.name}</h2>
                        <p className={styles.eventDesc}>{evt.description}</p>
                        <div className={styles.eventMeta}>
                          <span className={styles.eventLocation}>{evt.location}</span>
                          {isPastTab && isRsvpd && (
                            <span className={styles.attendedBadge}>Attended</span>
                          )}
                        </div>
                      </div>

                      {/* Octagon CTA button */}
                      <CineButton
                        onClick={e => { e.stopPropagation(); setActiveEvent(evt) }}
                        style={{ height: 40 }}
                        className={styles.ctaBtn}
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        {isPastTab ? 'View Details' : 'Learn More'}
                      </CineButton>
                    </article>
                  </FadeIn>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Event modal — rendered as-is (all RSVP/Stripe/auth logic preserved) ── */}
      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          member={member}
          isRsvpd={rsvps.includes(activeEvent.id)}
          onToggleRsvp={isPastTab ? undefined : toggleRsvp}
          isPast={isPastTab}
        />
      )}
    </div>
  )
}
