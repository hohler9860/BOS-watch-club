import { Link } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  return (
    <section className={styles.page}>
      <FadeIn>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className={styles.title}>MEMBER PORTAL</h1>
          <p className={styles.subtitle}>COMING SOON</p>
          <p className={styles.body}>
            The member portal will open once we reach 30 members. Current members: check WhatsApp for event details and updates.
          </p>
          <div className={styles.actions}>
            <Link to="/membership" className={styles.apply}>APPLY NOW &rarr;</Link>
            <Link to="/" className={styles.back}>&larr; BACK TO HOME</Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
