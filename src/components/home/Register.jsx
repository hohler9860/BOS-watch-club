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
        <div className={styles.card}>
          <p className={styles.eyebrow}>MEMBERSHIP</p>
          <h2 className={styles.title}>READY TO JOIN?</h2>
          <p className={styles.subtitle}>
            Founding membership is full. Join the waitlist to be first in line when we open new memberships.
          </p>
          <ShinyButton component={Link} to="/apply" className={`${btnStyles.filled} ${styles.cta}`}>
            JOIN THE WAITLIST &rarr;
          </ShinyButton>
        </div>
      </div>
    </section>
  )
}
