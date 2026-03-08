import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import EventModal from '../components/shared/EventModal'
import allEvents from '../data/events'
import styles from '../components/home/Events.module.css'
import pageStyles from './EventsPage.module.css'

export default function EventsPage() {
  const { member } = useAuth()
  const [activeEvent, setActiveEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])

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
    <>
      <section className={pageStyles.hero}>
        <FadeIn>
          <h2 className={pageStyles.title}>UPCOMING EVENTS</h2>
        </FadeIn>
        <FadeIn>
          <p className={pageStyles.subtitle}>CURATED GATHERINGS FOR COLLECTORS, ENTHUSIASTS, AND THOSE WHO APPRECIATE THE FINER THINGS.</p>
        </FadeIn>
      </section>
      <section className={`${styles.events} ${pageStyles.eventsPage}`}>
        <div className={styles.inner}>
          <div className={styles.grid}>
            {allEvents.map((evt) => (
              <FadeIn key={evt.id}>
                <div className={styles.card} onClick={() => setActiveEvent(evt)} role="button" tabIndex={0}>
                  <div className={styles.date}>
                    <span className={styles.month}>{evt.month}</span>
                    <span className={styles.day}>{evt.day}</span>
                  </div>
                  <div className={styles.details}>
                    <h3 className={styles.name}>{evt.name}</h3>
                    <p className={styles.description}>{evt.description}</p>
                    <div className={styles.meta}>
                      <span className={styles.location}>{evt.location}</span>
                    </div>
                  </div>
                  <span className={styles.cta}>LEARN MORE &rarr;</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          member={member}
          isRsvpd={rsvps.includes(activeEvent.id)}
          onToggleRsvp={toggleRsvp}
        />
      )}
    </>
  )
}
