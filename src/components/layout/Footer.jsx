import { Link } from 'react-router'
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
          <a href="https://www.instagram.com/boswatchclub/" target="_blank" rel="noopener" aria-label="INSTAGRAM">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="mailto:boswatchclub@gmail.com" aria-label="EMAIL">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
