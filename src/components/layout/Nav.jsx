import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import useScrolledNav from '../../hooks/useScrolledNav'
import styles from './Nav.module.css'

export default function Nav({ onApplyClick }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = useScrolledNav()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

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

  function handleAnchorClick(e, hash) {
    e.preventDefault()
    closeMenu()
    if (isHome) {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  function handleApply(e) {
    e.preventDefault()
    closeMenu()
    if (onApplyClick) {
      onApplyClick()
    } else {
      handleAnchorClick(e, 'register')
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
        <Link to="/" className={styles.logo} onClick={closeMenu}>
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
          {!isHome && (
            <Link to="/" className={styles.link} onClick={closeMenu}>HOME</Link>
          )}
          <Link to="/membership" className={styles.link} onClick={closeMenu}>MEMBERSHIP</Link>
          {isHome && (
            <>
              <a href="#events" className={styles.link} onClick={(e) => handleAnchorClick(e, 'events')}>EVENTS</a>
              <a href="#faq" className={styles.link} onClick={(e) => handleAnchorClick(e, 'faq')}>FAQ</a>
            </>
          )}
          <button className={styles.cta} onClick={handleApply}>APPLY NOW</button>
        </div>
      </div>
    </nav>
  )
}
