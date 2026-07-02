/**
 * NewEvents — /events
 *
 * Editorial page on the shared ed- design system (editorial.css). Upcoming and
 * past events are visible immediately as hairline rows; clicking a row opens
 * the existing EventModal (RSVP / Partiful / auth logic preserved verbatim).
 */

import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'
import { useEvents } from '../../hooks/useSupabaseData'
import EventModal from '../../components/shared/EventModal'
import './editorial.css'

function EventRows({ events, onOpen, muted }) {
  return (
    <ul className="ed-rows">
      {events.map(evt => (
        <li key={evt.id} className={`ed-row${muted ? ' ed-row--muted' : ''}`}>
          <button type="button" className="ed-row__inner" onClick={() => onOpen(evt)}>
            <span className="ed-row__date">
              <span className="ed-row__month">{evt.month}</span>
              <span className="ed-row__day">{evt.day}</span>
            </span>
            <span className="ed-row__body">
              <h3 className="ed-row__title">{evt.name}</h3>
              <span className="ed-row__meta">
                {(evt.venue || evt.location) && <span>{evt.venue || evt.location}</span>}
                {evt.time && <span>{evt.time}</span>}
              </span>
            </span>
            <span className="ed-row__cue">{muted ? 'Recap' : 'Details'}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function NewEvents() {
  const { member } = useAuth()
  const { data: allEvents } = useEvents()
  const [rsvps, setRsvps] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeIsPast, setActiveIsPast] = useState(false)

  const now = new Date()
  const upcoming = allEvents.filter(e => new Date(e.datetime || e.date) >= now)
  const past = allEvents.filter(e => new Date(e.datetime || e.date) < now).slice(0, 8)

  // ── RSVP fetch (verbatim) ───────────────────────────────────────────────────
  const fetchRsvps = useCallback(async () => {
    if (!supabase || !member) return
    const { data } = await supabase.from('rsvps').select('event_id').eq('user_id', member.id)
    if (data) setRsvps(data.map(r => r.event_id))
  }, [member])
  useEffect(() => { fetchRsvps() }, [fetchRsvps])

  // ── toggleRsvp (verbatim) ───────────────────────────────────────────────────
  async function toggleRsvp(eventId) {
    if (!supabase || !member) return
    const isRsvpd = rsvps.includes(eventId)
    if (isRsvpd) {
      await supabase.from('rsvps').delete().eq('user_id', member.id).eq('event_id', eventId)
      setRsvps(prev => prev.filter(id => id !== eventId))
    } else {
      await supabase.from('rsvps').insert({ user_id: member.id, event_id: eventId })
      setRsvps(prev => [...prev, eventId])
      const event = allEvents.find(e => e.id === eventId)
      if (event) {
        fetch('/api/notify-rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: member.id, eventId, eventName: event.name, venue: event.venue,
            date: event.date, time: event.time, dressCode: event.dressCode || event.dress_code,
          }),
        }).catch(err => console.error('RSVP email failed:', err))
      }
    }
  }

  function openEvent(evt, isPast) { setActiveEvent(evt); setActiveIsPast(isPast) }

  return (
    <div className="kk-page ed-page">
      <Helmet>
        <title>Events | Boston Watch Club</title>
        <meta name="description" content="Upcoming and past Boston Watch Club events. Dinners, happy hours, brand nights, and the members-only Collector's Table." />
      </Helmet>

      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── Hero ── */}
      <header className="ed-hero">
        <span className="ed-hero__eyebrow">Boston Watch Club</span>
        <h1 className="ed-hero__title">Events</h1>
        <p className="ed-hero__lede">
          Two or three nights a month, from casual happy hours to private brand
          dinners and the members-only Collector&rsquo;s Table. Most are open to
          anyone who loves watches.
        </p>
      </header>

      {/* ── Upcoming ── */}
      <section className="ed-section" aria-label="Upcoming events">
        <div className="ed-section__head">
          <span className="ed-label">Upcoming</span>
          {upcoming.length > 0 && (
            <span className="ed-section__note">Select an event for details and RSVP</span>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="ed-empty">
            <p className="ed-empty__text">
              Nothing on the calendar just yet. The next one is always close;
              apply and you&rsquo;ll be the first to know.
            </p>
            <Link to="/apply" className="ed-btn">Apply Now</Link>
          </div>
        ) : (
          <EventRows events={upcoming} onOpen={evt => openEvent(evt, false)} />
        )}
      </section>

      {/* ── Past ── */}
      {past.length > 0 && (
        <section className="ed-section" aria-label="Past events">
          <div className="ed-section__head">
            <span className="ed-label">Past</span>
          </div>
          <EventRows events={past} onOpen={evt => openEvent(evt, true)} muted />
        </section>
      )}

      {/* ── CTA ── */}
      <section className="ed-cta" aria-label="Apply">
        <h2 className="ed-cta__title">Be in the room.</h2>
        <p className="ed-cta__text">
          Members hear about every event first, and some rooms are members
          only. Apply now and join us at the next one.
        </p>
        <div className="ed-cta__actions">
          <Link to="/apply" className="ed-btn">Apply Now</Link>
          <Link to="/faq" className="ed-textlink">How events work</Link>
        </div>
      </section>

      {/* Event modal — RSVP / Partiful / auth logic preserved as-is */}
      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          member={member}
          isRsvpd={rsvps.includes(activeEvent.id)}
          onToggleRsvp={activeIsPast ? undefined : toggleRsvp}
          isPast={activeIsPast}
        />
      )}
    </div>
  )
}
