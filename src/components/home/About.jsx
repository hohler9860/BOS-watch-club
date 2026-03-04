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
        <div className={styles.header}>
          <FadeIn>
            <p className={styles.sectionEyebrow}>WHO WE ARE</p>
          </FadeIn>
          <FadeIn>
            <h2 className={styles.sectionTitle}>BOSTON WATCH CLUB</h2>
          </FadeIn>
          <FadeIn>
            <p className={styles.sectionDesc}>
              BORN OUT OF A SHARED PASSION FOR TIMEPIECES AND THE CULTURE THAT SURROUNDS THEM,
              BWC IS BOSTON&rsquo;S PREMIER WATCH COMMUNITY &mdash; BUILT BY COLLECTORS, FOR COLLECTORS.
            </p>
          </FadeIn>
        </div>

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
