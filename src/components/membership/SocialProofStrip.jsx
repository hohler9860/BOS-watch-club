import FadeIn from '../shared/FadeIn'
import styles from './SocialProofStrip.module.css'

export default function SocialProofStrip() {
  return (
    <FadeIn>
      <div className={styles.strip}>
        <div className={styles.inner}>
          <span className={styles.item}>FIRST EVENT: SPRING 2026 &middot; NEWBURY STREET</span>
          <span className={styles.divider} />
          <span className={styles.item}>JOIN 50+ FOUNDING MEMBERS</span>
          <span className={styles.divider} />
          <span className={styles.item}>BOSTON&rsquo;S PREMIER WATCH COMMUNITY</span>
        </div>
      </div>
    </FadeIn>
  )
}
