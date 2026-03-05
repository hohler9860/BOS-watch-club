import { useState } from 'react'
import FadeIn from '../components/shared/FadeIn'
import EventModal from '../components/shared/EventModal'
import allEvents from '../data/events'
import styles from '../components/home/Events.module.css'
import pageStyles from './EventsPage.module.css'

export default function EventsPage() {
  const [activeEvent, setActiveEvent] = useState(null)

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
        <EventModal event={activeEvent} onClose={() => setActiveEvent(null)} />
      )}
    </>
  )
}
