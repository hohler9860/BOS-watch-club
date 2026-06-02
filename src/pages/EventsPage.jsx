import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import { useEvents, useSiteContent } from '../hooks/useSupabaseData'
import FadeIn from '../components/shared/FadeIn'
import EventModal from '../components/shared/EventModal'
import styles from '../components/home/Events.module.css'
import pageStyles from './EventsPage.module.css'

export default function EventsPage() {
  const { member } = useAuth()
  const { data: allEvents } = useEvents()
  const { content } = useSiteContent()
  const eventsHeroStyle = content.eventsHeroImage ? { '--events-hero-image': `url("${content.eventsHeroImage}")` } : undefined
  const [activeEvent, setActiveEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [tab, setTab] = useState('upcoming')

  const now = new Date()
  const upcomingEvents = allEvents.filter(e => new Date(e.datetime || e.date) >= now)
  const pastEvents = allEvents.filter(e => new Date(e.datetime || e.date) < now)
  const displayEvents = tab === 'upcoming' ? upcomingEvents : pastEvents

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
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Helmet>
        <title>{tab === 'past' ? 'Past Events' : 'Events'} — Boston Watch Club</title>
        <meta name="description" content="Discover curated watch events and exclusive gatherings for collectors in Boston. Private dinners, brand experiences, and casual meetups." />
      </Helmet>
      <section className={pageStyles.hero} style={eventsHeroStyle}>
        <FadeIn>
          <h2 className={pageStyles.title}>{tab === 'past' ? 'PAST EVENTS' : 'UPCOMING EVENTS'}</h2>
        </FadeIn>
        <FadeIn>
          <p className={pageStyles.subtitle}>
            {tab === 'past'
              ? 'A LOOK BACK AT OUR PAST GATHERINGS AND EXPERIENCES.'
              : 'CURATED GATHERINGS FOR COLLECTORS, ENTHUSIASTS, AND THOSE WHO APPRECIATE THE FINER THINGS.'
            }
          </p>
        </FadeIn>
        <FadeIn delay="0.1s">
          <div className={pageStyles.tabRow}>
            <button
              className={`${pageStyles.tabBtn} ${tab === 'upcoming' ? pageStyles.tabBtnActive : ''}`}
              onClick={() => setTab('upcoming')}
            >UPCOMING</button>
            <button
              className={`${pageStyles.tabBtn} ${tab === 'past' ? pageStyles.tabBtnActive : ''}`}
              onClick={() => setTab('past')}
            >PAST EVENTS{pastEvents.length > 0 && ` (${pastEvents.length})`}</button>
          </div>
        </FadeIn>
      </section>
      <section className={`${styles.events} ${pageStyles.eventsPage}`}>
        <div className={styles.inner}>
          {displayEvents.length === 0 ? (
            <FadeIn>
              <div className={pageStyles.empty}>
                <h3 className={pageStyles.emptyTitle}>
                  {tab === 'past' ? 'NO PAST EVENTS YET' : 'NO EVENTS YET'}
                </h3>
                <p className={pageStyles.emptyText}>
                  {tab === 'past'
                    ? 'Past events will appear here after they\'ve taken place.'
                    : 'New events are being planned. Check back soon.'
                  }
                </p>
                {tab === 'upcoming' && (
                  <Link to="/membership" className={pageStyles.emptyCta}>JOIN THE CLUB TO BE FIRST TO KNOW</Link>
                )}
                {tab === 'past' && upcomingEvents.length > 0 && (
                  <button className={pageStyles.emptyCta} onClick={() => setTab('upcoming')}>VIEW UPCOMING EVENTS</button>
                )}
              </div>
            </FadeIn>
          ) : (
            <div className={styles.grid}>
              {displayEvents.map((evt) => {
                const isPast = tab === 'past'
                const isRsvpd = rsvps.includes(evt.id)
                return (
                  <FadeIn key={evt.id}>
                    <div
                      className={`${styles.card} ${isPast ? pageStyles.pastCard : ''}`}
                      onClick={() => setActiveEvent(evt)}
                      role="button"
                      tabIndex={0}
                    >
                      {evt.image && (
                        <div className={styles.cardImage}>
                          <img src={evt.image} alt={evt.name} />
                          {isPast && <div className={pageStyles.pastOverlay}><span className={pageStyles.pastLabel}>PAST EVENT</span></div>}
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
                          {isPast && isRsvpd && (
                            <span className={pageStyles.attendedTag}>Attended</span>
                          )}
                        </div>
                      </div>
                      <span className={styles.cta}>{isPast ? 'VIEW DETAILS' : 'LEARN MORE'} &rarr;</span>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          member={member}
          isRsvpd={rsvps.includes(activeEvent.id)}
          onToggleRsvp={tab === 'past' ? undefined : toggleRsvp}
          isPast={tab === 'past'}
        />
      )}
    </div>
  )
}
