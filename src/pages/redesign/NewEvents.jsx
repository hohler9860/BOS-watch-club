/**
 * NewEvents — /redesign/events
 *
 * Cinematic page, same engine as home/membership/journal (CineWatchSection). No
 * header band. Two photo-free watch sections:
 *   1. RM 67-02 (right) — "UPCOMING EVENTS": discover drops down up to 3 upcoming
 *      events; each row opens the EventModal (RSVP / Partiful, member-gated).
 *   2. Patek iced (left) — "PAST EVENTS": discover drops down up to 6 past events,
 *      read-only details.
 *
 * All RSVP / Supabase / EventModal logic reused verbatim from the prior EventsPage.
 */

import { useState, useCallback, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'
import { useEvents } from '../../hooks/useSupabaseData'
import CineWatchSection from '../../components/redesign/CineWatchSection'
import EventModal from '../../components/shared/EventModal'
import s from './NewEvents.module.css'

const UPCOMING_SECTION = {
  id: 'upcoming', brand: 'Richard Mille', model: 'RM 67-02',
  eyebrowLabel: 'EVENTS', title: 'UPCOMING EVENTS',
  image: '/assets/watches/rm67-white.png',
  glowImg: '/assets/watches/glow/g2.png',           // home blue wash — matches home flow
  side: 'right', glow: 'rgba(46, 96, 180, 0.40)', glowColor: '#2E60B4',
}
const PAST_SECTION = {
  id: 'past', brand: 'Audemars Piguet', model: 'Royal Oak Black Ceramic',
  eyebrowLabel: 'EVENTS', title: 'PAST EVENTS',
  image: '/assets/watches/ap-ro-blackceramic.png',
  glowImg: '/assets/watches/glow/g5.png',           // left-blob warm wash — sits BEHIND the left watch
  side: 'left', glow: 'rgba(58, 72, 96, 0.40)', glowColor: '#3A485C',
}

function EventRows({ events, onOpen, showVenue }) {
  return (
    <ul className={s.eventList} aria-label="Events">
      {events.map(evt => (
        <li key={evt.id} className={s.eventItem}>
          <button type="button" className={s.eventRow} onClick={() => onOpen(evt)}>
            <span className={s.eventDate}>{evt.date}</span>
            <span className={s.eventName}>{evt.name}</span>
            {showVenue && evt.venue && <span className={s.eventVenue}>{evt.venue}</span>}
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
  const upcoming = allEvents.filter(e => new Date(e.datetime || e.date) >= now).slice(0, 3)
  const past = allEvents.filter(e => new Date(e.datetime || e.date) < now).slice(0, 6)

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
      // Confirmation email — the endpoint identifies the member from their
      // session token and loads event details itself.
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        fetch('/api/notify-rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ eventId }),
        }).catch(err => console.error('RSVP email failed:', err))
      }
    }
  }

  function openEvent(evt, isPast) { setActiveEvent(evt); setActiveIsPast(isPast) }

  return (
    <div className="kk-page">
      <Helmet>
        <title>Events | Boston Watch Club</title>
        <meta name="description" content="Upcoming and past Boston Watch Club events. Dinners, happy hours, brand nights, and the members-only Collector's Table." />
      </Helmet>

      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── 1. UPCOMING EVENTS ──────────────────────────────────────────────── */}
      <CineWatchSection watch={UPCOMING_SECTION} index={0}>
        <div className={s.panel}>
          {upcoming.length === 0 ? (
            <p className={s.panelText}>
              No upcoming events on the calendar just yet. Check back soon, or apply to get on the list.
            </p>
          ) : (
            <EventRows events={upcoming} onOpen={evt => openEvent(evt, false)} showVenue />
          )}
        </div>
      </CineWatchSection>

      {/* ── 2. PAST EVENTS ──────────────────────────────────────────────────── */}
      <CineWatchSection watch={PAST_SECTION} index={1}>
        <div className={s.panel}>
          {past.length === 0 ? (
            <p className={s.panelText}>
              No past events yet. The first ones are right around the corner.
            </p>
          ) : (
            <EventRows events={past} onOpen={evt => openEvent(evt, true)} />
          )}
        </div>
      </CineWatchSection>

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
