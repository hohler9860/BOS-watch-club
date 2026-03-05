import { Link } from 'react-router'
import SocialIcons from './SocialIcons'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="BWC" />
        </div>
        <div className={styles.center}>
          <p className={styles.text}>&copy; 2026 Boston Watch Club. All Rights Reserved.</p>
          <Link to="/terms" className={styles.termsLink}>Terms</Link>
        </div>
        <div className={styles.social}>
          <SocialIcons />
        </div>
      </div>
    </footer>
  )
}
