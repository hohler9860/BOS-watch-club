import { Link } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import styles from '../components/home/Events.module.css'
import pageStyles from './EventsPage.module.css'

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
    ctaText: 'RSVP',
  },
  {
    month: 'JUN',
    day: '2026',
    name: 'COLLECTOR SPOTLIGHT: SUMMER EDITION',
    description: 'ONE MEMBER. ONE COLLECTION. ONE STORY. AN EVENING DEDICATED TO THE PIECES AND JOURNEYS THAT DEFINE US.',
    location: 'TBA \u00B7 BOSTON',
    ctaText: 'LEARN MORE',
  },
  {
    month: 'AUG',
    day: '2026',
    name: 'SUMMER SOCIAL',
    description: 'A RELAXED ROOFTOP GATHERING WITH COCKTAILS AND WRIST CHECKS. OPEN TO MEMBERS AND ONE GUEST EACH.',
    location: 'ROOFTOP VENUE \u00B7 SEAPORT',
    ctaText: 'LEARN MORE',
  },
  {
    month: 'OCT',
    day: '2026',
    name: 'FALL WATCH FAIR',
    description: 'AN AFTERNOON OF BUY, SELL, AND TRADE AMONGST MEMBERS. BRING YOUR PIECES, DISCOVER NEW ONES.',
    location: 'PRIVATE VENUE \u00B7 BOSTON',
    ctaText: 'LEARN MORE',
  },
  {
    month: 'DEC',
    day: '2026',
    name: 'END OF YEAR GALA',
    description: 'OUR ANNUAL BLACK-TIE CELEBRATION. A NIGHT OF FINE DINING, RARE WATCHES, AND REFLECTIONS ON THE YEAR.',
    location: 'MEMBERS ONLY \u00B7 BOSTON',
    ctaText: 'RSVP',
  },
]

export default function EventsPage() {
  return (
    <>
      <section className={pageStyles.hero}>
        <FadeIn>
          <p className={pageStyles.eyebrow}>CALENDAR</p>
        </FadeIn>
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
            {events.map((evt) => (
              <FadeIn key={evt.name}>
                <div className={styles.card}>
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
                  <Link to="/membership" className={styles.cta}>{evt.ctaText} &rarr;</Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
