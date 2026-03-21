import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import { useEvents } from '../hooks/useSupabaseData'
import FadeIn from '../components/shared/FadeIn'
import EventModal from '../components/shared/EventModal'
import styles from '../components/home/Events.module.css'
import pageStyles from './EventsPage.module.css'

export default function EventsPage() {
  const { member } = useAuth()
  const { data: allEvents } = useEvents()
  const [activeEvent, setActiveEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [guestForm, setGuestForm] = useState({ name: '', email: '', dob: '' })

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

      // Send RSVP confirmation email
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

        // Insert guest if provided and event allows +1
        if (guestForm.name && guestForm.email && guestForm.dob && event.guest_policy === 'members_plus_one') {
          const { data: rsvpData } = await supabase
            .from('rsvps')
            .select('id')
            .eq('user_id', member.id)
            .eq('event_id', eventId)
            .single()

          if (rsvpData) {
            const { data: guestData } = await supabase.from('event_guests').insert({
              rsvp_id: rsvpData.id,
              event_id: eventId,
              invited_by: member.id,
              name: guestForm.name,
              email: guestForm.email,
              date_of_birth: guestForm.dob,
            }).select('id').single()

            if (guestData) {
              // Send guest invitation email
              const profileRes = await supabase.from('profiles').select('name').eq('id', member.id).single()
              fetch('/api/notify-guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  guestId: guestData.id,
                  guestName: guestForm.name,
                  guestEmail: guestForm.email,
                  memberName: profileRes?.data?.name || 'A member',
                  eventName: event.name,
                  venue: event.venue,
                  date: event.date,
                  time: event.time,
                  dressCode: event.dressCode || event.dress_code,
                }),
              }).catch(err => console.error('Guest email failed:', err))
            }
          }
        }
        setGuestForm({ name: '', email: '', dob: '' })
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>Events — Boston Watch Club</title>
        <meta name="description" content="Discover curated watch events and exclusive gatherings for collectors in Boston. Private dinners, brand experiences, and casual meetups." />
      </Helmet>
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
          {allEvents.length === 0 ? (
            <FadeIn>
              <div className={pageStyles.empty}>
                <h3 className={pageStyles.emptyTitle}>NO EVENTS YET</h3>
                <p className={pageStyles.emptyText}>New events are being planned. Check back soon.</p>
                <Link to="/membership" className={pageStyles.emptyCta}>JOIN THE CLUB TO BE FIRST TO KNOW</Link>
              </div>
            </FadeIn>
          ) : (
            <div className={styles.grid}>
              {allEvents.map((evt) => (
                <FadeIn key={evt.id}>
                  <div className={styles.card} onClick={() => setActiveEvent(evt)} role="button" tabIndex={0}>
                    {evt.image && (
                      <div className={styles.cardImage}>
                        <img src={evt.image} alt={evt.name} />
                      </div>
                    )}
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
          )}
        </div>
      </section>

      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => { setActiveEvent(null); setGuestForm({ name: '', email: '', dob: '' }) }}
          member={member}
          isRsvpd={rsvps.includes(activeEvent.id)}
          onToggleRsvp={toggleRsvp}
          guestForm={guestForm}
          setGuestForm={setGuestForm}
        />
      )}
    </>
  )
}
