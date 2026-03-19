import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import useScrolledNav from '../../hooks/useScrolledNav'
import useAuth, { roleMeetsMinimum } from '../../hooks/useAuth'
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
  const isMember = member && roleMeetsMinimum(member.role, 'member')

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

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
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
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerActive : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
        <div className={`${styles.links} ${mobileOpen ? styles.linksOpen : ''}`}>
          {/* Active members see Dashboard */}
          {isMember && (
            <ShinyButton component={Link} to="/dashboard" className={`${styles.navLink} ${styles.navShimmer} ${location.pathname === '/dashboard' ? styles.navLinkActive : ''}`} onClick={closeMenu}>DASHBOARD</ShinyButton>
          )}
          {member?.is_admin && (
            <ShinyButton component={Link} to="/admin" className={`${styles.navLink} ${styles.navShimmer} ${location.pathname === '/admin' ? styles.navLinkActive : ''}`} onClick={closeMenu}>ADMIN</ShinyButton>
          )}
          <ShinyButton component={Link} to="/membership" className={`${styles.navLink} ${styles.navShimmer} ${location.pathname === '/membership' ? styles.navLinkActive : ''}`} onClick={closeMenu}>MEMBERSHIP</ShinyButton>
          <ShinyButton component={Link} to="/events" className={`${styles.navLink} ${styles.navShimmer} ${location.pathname === '/events' ? styles.navLinkActive : ''}`} onClick={closeMenu}>EVENTS</ShinyButton>
          <ShinyButton component={Link} to="/blog" className={`${styles.navLink} ${styles.navShimmer} ${location.pathname === '/blog' ? styles.navLinkActive : ''}`} onClick={closeMenu}>BLOG</ShinyButton>
          {!loggedIn && (
            <ShinyButton as="button" className={`${styles.navLink} ${styles.navShimmer}`} onClick={() => { closeMenu(); navigate('/login') }}>LOG IN</ShinyButton>
          )}
          {!isMember && (
            loggedIn
              ? <ShinyButton component={Link} to="/upgrade" className={`${btnStyles.filled} ${styles.navCta}`} onClick={closeMenu}>JOIN WAITLIST</ShinyButton>
              : <ShinyButton component={Link} to="/apply" className={`${btnStyles.filled} ${styles.navCta}`} onClick={closeMenu}>JOIN WAITLIST</ShinyButton>
          )}
        </div>
      </div>
    </nav>
  )
}
