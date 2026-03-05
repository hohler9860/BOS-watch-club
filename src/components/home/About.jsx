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
              Born out of a shared passion for timepieces and the culture that surrounds them,
              BWC is Boston&rsquo;s premier watch community &mdash; built by collectors, for collectors.
            </p>
          </FadeIn>
        </div>

        <FadeIn>
          <GlassCard variant="dark">
            <p className={styles.eyebrow}>ROOTED IN BOSTON&rsquo;S CULTURE</p>
            <h2 className={styles.headline}>WE BRIDGE THE WORLDS OF HOROLOGY, CULTURE, AND COMMUNITY.</h2>
            <p className={styles.body}>Our mission is simple. Create a space where passion meets purpose, where collectors connect, and where time is always well spent.</p>
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  )
}
