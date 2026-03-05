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
        <p className={styles.text}>&copy; 2025 BOSTON WATCH CLUB. ALL RIGHTS RESERVED.</p>
        <div className={styles.links}>
          <Link to="/terms" className={styles.termsLink}>TERMS</Link>
          <SocialIcons />
        </div>
      </div>
    </footer>
  )
}
