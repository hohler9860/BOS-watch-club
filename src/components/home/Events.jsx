import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'
import FadeIn from '../shared/FadeIn'
import EventModal from '../shared/EventModal'
import ShinyButton from '../shared/ShinyButton'
import btnStyles from '../shared/ShinyButton.module.css'
import allEvents from '../../data/events'
import styles from './Events.module.css'

export default function Events() {
  const { member } = useAuth()
  const [activeEvent, setActiveEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const event = allEvents[0]

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
    }
  }

  return (
    <section className={styles.events} id="events">
      <div className={styles.inner}>
        <FadeIn>
          <h2 className={styles.title}>UPCOMING EVENTS</h2>
        </FadeIn>
        <div className={styles.grid}>
          <FadeIn>
            <div className={styles.card} onClick={() => setActiveEvent(event)} role="button" tabIndex={0}>
              <div className={styles.date}>
                <span className={styles.month}>{event.month}</span>
                <span className={styles.day}>{event.day}</span>
              </div>
              <div className={styles.details}>
                <h3 className={styles.name}>{event.name}</h3>
                <p className={styles.description}>{event.description}</p>
                <div className={styles.meta}>
                  <span className={styles.location}>{event.location}</span>
                </div>
              </div>
              <span className={styles.cta}>LEARN MORE &rarr;</span>
            </div>
          </FadeIn>
        </div>
        <FadeIn>
          <div className={styles.more}>
            <ShinyButton component={Link} to="/events" className={`${btnStyles.outline} ${styles.moreCta}`}>CHECK OUT OTHER UPCOMING EVENTS &rarr;</ShinyButton>
          </div>
        </FadeIn>
      </div>

      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          member={member}
          isRsvpd={rsvps.includes(activeEvent.id)}
          onToggleRsvp={toggleRsvp}
        />
      )}
    </section>
  )
}
