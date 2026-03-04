import { Link } from 'react-router'
import FadeIn from '../shared/FadeIn'
import styles from './Events.module.css'

const events = [
  {
    month: 'MAR',
    day: '2026',
    name: "INAUGURAL COLLECTOR'S EVENING",
    description: 'OUR FIRST GATHERING. AN EVENING OF RARE PIECES, FINE SPIRITS, AND THE CONVERSATIONS THAT MAKE THIS COMMUNITY WORTH BUILDING.',
    location: 'MEMBERS ONLY \u00B7 BOSTON',
    ctaText: 'RSVP',
  },
  {
    month: 'APR',
    day: '2026',
    name: 'WATCHES & WHISKEY',
    description: "A CURATED TASTING PAIRED WITH AN INTIMATE SHOWCASE OF MEMBERS' COLLECTIONS. LIMITED TO 20 SEATS.",
    location: 'PRIVATE VENUE \u00B7 BACK BAY',
    ctaText: 'LEARN MORE',
  },
  {
    month: 'JUN',
    day: '2026',
    name: 'COLLECTOR SPOTLIGHT: SUMMER EDITION',
    description: 'ONE MEMBER. ONE COLLECTION. ONE STORY. AN EVENING DEDICATED TO THE PIECES AND JOURNEYS THAT DEFINE US.',
    location: 'TBA \u00B7 BOSTON',
    ctaText: 'LEARN MORE',
  },
]

export default function Events() {
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
            <div className={styles.card}>
              <div className={styles.date}>
                <span className={styles.month}>{events[0].month}</span>
                <span className={styles.day}>{events[0].day}</span>
              </div>
              <div className={styles.details}>
                <h3 className={styles.name}>{events[0].name}</h3>
                <p className={styles.description}>{events[0].description}</p>
                <div className={styles.meta}>
                  <span className={styles.location}>{events[0].location}</span>
                </div>
              </div>
              <Link to="/membership" className={styles.cta}>{events[0].ctaText} &rarr;</Link>
            </div>
          </FadeIn>
        </div>
        <FadeIn>
          <div className={styles.more}>
            <Link to="/events" className={styles.moreCta}>CHECK OUT OTHER UPCOMING EVENTS &rarr;</Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
