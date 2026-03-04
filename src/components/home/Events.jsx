import { useState } from 'react'
import { Link } from 'react-router'
import FadeIn from '../shared/FadeIn'
import EventModal from '../shared/EventModal'
import allEvents from '../../data/events'
import styles from './Events.module.css'

export default function Events() {
  const [activeEvent, setActiveEvent] = useState(null)
  const event = allEvents[0]

  return (
    <section className={styles.events} id="events">
      <div className={styles.inner}>
        <FadeIn>
          <p className={styles.eyebrow}>CALENDAR</p>
        </FadeIn>
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
            <Link to="/events" className={styles.moreCta}>CHECK OUT OTHER UPCOMING EVENTS &rarr;</Link>
          </div>
        </FadeIn>
      </div>

      {activeEvent && (
        <EventModal event={activeEvent} onClose={() => setActiveEvent(null)} />
      )}
    </section>
  )
}
