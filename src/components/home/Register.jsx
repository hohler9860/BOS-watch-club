import { Link } from 'react-router'
import FadeIn from '../shared/FadeIn'
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
              EXPLORE OUR MEMBERSHIP TIERS AND FIND THE RIGHT FIT FOR YOUR PASSION.
              FROM CASUAL ENTHUSIAST TO DEDICATED PATRON, THERE&rsquo;S A SEAT AT THE TABLE FOR YOU.
            </p>
            <Link to="/apply" className={styles.cta}>
              VIEW MEMBERSHIP TIERS &rarr;
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
