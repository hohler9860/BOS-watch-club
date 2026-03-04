import FadeIn from '../shared/FadeIn'
import GlassCard from '../shared/GlassCard'
import styles from './About.module.css'

export default function About() {
  return (
    <section className={styles.about}>
      {/* Animated ambient orbs */}
      <div className={styles.orbContainer} aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      {/* Grain overlay */}
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.inner}>
        <FadeIn>
          <GlassCard variant="dark">
            <p className={styles.eyebrow}>ROOTED IN BOSTON&rsquo;S CULTURE</p>
            <h2 className={styles.headline}>WE BRIDGE THE WORLDS OF HOROLOGY, CULTURE, AND COMMUNITY.</h2>
            <p className={styles.body}>OUR MISSION IS SIMPLE. CREATE A SPACE WHERE PASSION MEETS PURPOSE, WHERE COLLECTORS CONNECT, AND WHERE TIME IS ALWAYS WELL SPENT.</p>
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  )
}
