import FadeIn from '../shared/FadeIn'
import GlassCard from '../shared/GlassCard'
import styles from './About.module.css'

export default function About() {
  return (
    <section className={styles.about}>
      <div className={styles.inner}>
        <FadeIn>
          <GlassCard>
            <p className={styles.eyebrow}>ROOTED IN BOSTON'S CULTURE</p>
            <h2 className={styles.headline}>WE BRIDGE THE WORLDS OF HOROLOGY, CULTURE, AND COMMUNITY.</h2>
            <p className={styles.body}>OUR MISSION IS SIMPLE. CREATE A SPACE WHERE PASSION MEETS PURPOSE, WHERE COLLECTORS CONNECT, AND WHERE TIME IS ALWAYS WELL SPENT.</p>
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  )
}
