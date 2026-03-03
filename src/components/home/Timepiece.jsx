import FadeIn from '../shared/FadeIn'
import styles from './Timepiece.module.css'

export default function Timepiece() {
  return (
    <section className={styles.timepiece}>
      <div className={styles.inner}>
        <FadeIn>
          <div className={styles.imagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>WATCH IMAGE</span>
          </div>
        </FadeIn>
        <FadeIn>
          <div className={styles.content}>
            <p className={styles.eyebrow}>FEATURED TIMEPIECE</p>
            <h2 className={styles.name}>OMEGA SPEEDMASTER MOONWATCH</h2>
            <p className={styles.ref}>REF. 310.30.42.50.01.002</p>
            <p className={styles.editorial}>THE WATCH THAT WENT TO THE MOON AND NEVER CAME BACK TO EARTH IN SPIRIT. FOR OVER SIX DECADES, THE SPEEDMASTER HAS REMAINED THE DEFINITIVE CHRONOGRAPH &mdash; EQUALLY AT HOME ON A NATO STRAP AT A WEEKEND BARBECUE OR ON THE WRIST OF AN ASTRONAUT IN ZERO GRAVITY. IT IS, QUITE SIMPLY, THE MOST IMPORTANT WATCH OF THE 20TH CENTURY.</p>
            <p className={styles.note}>CONTENT UPDATED MONTHLY BY OUR EDITORIAL TEAM</p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
