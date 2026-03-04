import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import useScrolledNav from '../../hooks/useScrolledNav'
import styles from './Nav.module.css'

export default function Nav({ onApplyClick }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = useScrolledNav()
  const location = useLocation()
  const navigate = useNavigate()

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

  function handleApply(e) {
    e.preventDefault()
    closeMenu()
    if (onApplyClick) {
      onApplyClick()
    } else {
      if (location.pathname === '/') {
        const el = document.getElementById('register')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById('register')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }

  return (
    <nav className={styles.nav}>
      <div
        className={styles.glass}
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.82)' : 'rgba(255, 255, 255, 0.6)',
          boxShadow: scrolled ? '0 1px 24px rgba(0, 0, 0, 0.06)' : '0 1px 12px rgba(0, 0, 0, 0.02)',
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
          <Link to="/" className={`${styles.link} ${location.pathname === '/' ? styles.linkActive : ''}`} onClick={handleHomeClick}>HOME</Link>
          <Link to="/membership" className={`${styles.link} ${location.pathname === '/membership' ? styles.linkActive : ''}`} onClick={closeMenu}>MEMBERSHIP</Link>
          <Link to="/events" className={`${styles.link} ${location.pathname === '/events' ? styles.linkActive : ''}`} onClick={closeMenu}>EVENTS</Link>
          <button className={styles.cta} onClick={handleApply}>APPLY NOW</button>
          <button className={styles.login} onClick={() => navigate('/login')}>LOG IN</button>
        </div>
      </div>
    </nav>
  )
}
