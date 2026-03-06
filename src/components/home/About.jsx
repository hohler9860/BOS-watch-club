import FadeIn from '../shared/FadeIn'
import SplitText from '../shared/SplitText'
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
          <SplitText className={styles.sectionTitle} delay={0.1}>BOSTON WATCH CLUB</SplitText>
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
            <SplitText className={styles.headline} delay={0.05}>WE BRIDGE THE WORLDS OF HOROLOGY, CULTURE, AND COMMUNITY.</SplitText>
            <p className={styles.body}>Our mission is simple. Create a space where passion meets purpose, where collectors connect, and where time is always well spent.</p>
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  )
}
