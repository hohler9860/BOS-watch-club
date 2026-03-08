import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import useScrolledNav from '../../hooks/useScrolledNav'
import useAuth from '../../hooks/useAuth'
import ShinyButton from '../shared/ShinyButton'
import btnStyles from '../shared/ShinyButton.module.css'
import styles from './Nav.module.css'

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = useScrolledNav()
  const location = useLocation()
  const navigate = useNavigate()
  const { member } = useAuth()
  const loggedIn = !!member

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  function closeMenu() {
    setMobileOpen(false)
  }

  function handleHomeClick(e) {
    closeMenu()
    if (location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const typeformUrl = 'https://form.typeform.com/to/ntT8GKqz'

  return (
    <nav className={styles.nav}>
      <div
        className={styles.glass}
        style={{
          boxShadow: scrolled ? '0 1px 24px rgba(0, 0, 0, 0.15)' : 'none',
        }}
      />
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} onClick={handleHomeClick}>
          <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="BOSTON WATCH CLUB" />
        </Link>
        {loggedIn ? (
          <Link to="/dashboard" className={styles.profileLink}>
            <svg className={styles.profileIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        ) : (
          <>
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerActive : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
            <div className={`${styles.links} ${mobileOpen ? styles.linksOpen : ''}`}>
              <ShinyButton component={Link} to="/membership" className={`${styles.navBtn} ${location.pathname === '/membership' ? styles.navBtnActive : ''}`} onClick={closeMenu}>MEMBERSHIP</ShinyButton>
              <ShinyButton component={Link} to="/events" className={`${styles.navBtn} ${location.pathname === '/events' ? styles.navBtnActive : ''}`} onClick={closeMenu}>EVENTS</ShinyButton>
              <ShinyButton as="button" className={styles.navBtn} onClick={() => { closeMenu(); navigate('/login') }}>LOG IN</ShinyButton>
              {location.pathname === '/membership' ? (
                <ShinyButton component="a" href={typeformUrl} target="_blank" rel="noopener noreferrer" className={`${btnStyles.filled} ${styles.navCta}`} onClick={closeMenu}>APPLY NOW</ShinyButton>
              ) : (
                <ShinyButton component={Link} to="/membership" className={`${btnStyles.filled} ${styles.navCta}`} onClick={closeMenu}>APPLY NOW</ShinyButton>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
