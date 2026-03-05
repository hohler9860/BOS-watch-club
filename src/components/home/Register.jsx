import { Link } from 'react-router'
import FadeIn from '../shared/FadeIn'
import ShinyButton from '../shared/ShinyButton'
import btnStyles from '../shared/ShinyButton.module.css'
import styles from './Register.module.css'

export default function Register() {
  return (
    <section className={styles.register} id="register">
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.inner}>
        <FadeIn>
          <div className={styles.card}>
            <p className={styles.eyebrow}>FOUNDING MEMBERSHIP</p>
            <h2 className={styles.title}>READY TO JOIN?</h2>
            <p className={styles.subtitle}>
              Explore our membership tiers and find the right fit for your passion.
              From casual enthusiast to dedicated patron, there&rsquo;s a seat at the table for you.
            </p>
            <ShinyButton component={Link} to="/membership" className={`${btnStyles.filled} ${styles.cta}`}>
              VIEW MEMBERSHIP TIERS &rarr;
            </ShinyButton>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
