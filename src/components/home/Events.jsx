import FadeIn from '../shared/FadeIn'
import styles from './Events.module.css'

export default function Events() {
  function handleClick(e) {
    e.preventDefault()
    const el = document.getElementById('register')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
                <span className={styles.month}>2026</span>
                <span className={styles.day}>TBA</span>
              </div>
              <div className={styles.details}>
                <h3 className={styles.name}>OUR FIRST EVENT</h3>
                <p className={styles.description}>SOMETHING SPECIAL IS IN THE WORKS. OUR INAUGURAL EVENT WILL SET THE STANDARD FOR EVERYTHING THAT FOLLOWS. FOUNDING MEMBERS WILL BE THE FIRST TO KNOW.</p>
                <div className={styles.meta}>
                  <span className={styles.location}>DETAILS COMING SOON &middot; BOSTON</span>
                </div>
              </div>
              <a href="#register" className={styles.cta} onClick={handleClick}>STAY UPDATED &rarr;</a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
