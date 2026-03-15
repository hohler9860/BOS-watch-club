import { useState } from 'react'
import FadeIn from '../components/shared/FadeIn'
import TypewriterText from '../components/shared/TypewriterText'
import ShinyButton from '../components/shared/ShinyButton'
import Marquee from '../components/shared/Marquee'
import GrainOverlay from '../components/shared/GrainOverlay'
import useAdminAuth from '../admin/AdminAuth'
import { supabase } from '../lib/supabase'
import watchData from '../data/watchData'
import s from './LaunchingSoonPage.module.css'

const TICKER_WATCHES = watchData.slice(0, 10)

export default function LaunchingSoonPage() {
  const base = import.meta.env.BASE_URL
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const { login } = useAdminAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMsg('')

    if (!supabase) {
      // No backend configured – accept the signup gracefully
      setStatus('success')
      return
    }

    try {
      const { error } = await supabase
        .from('interest_signups')
        .insert({ email: email.trim().toLowerCase() })

      if (error) {
        if (error.code === '23505') {
          setStatus('success')
          return
        }
        setErrorMsg('Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setErrorMsg('Could not connect. Please try again later.')
      setStatus('error')
    }
  }

  return (
    <div className={s.page}>
      <GrainOverlay />
      <div className={s.orb1} />
      <div className={s.orb2} />

      <div className={s.ticker}>
        <FadeIn>
          <Marquee duration={40} fade fadeAmount={8}>
            {TICKER_WATCHES.flatMap((watch, i) => [
              <span key={`t-${i}`} className={s.tickerText}>LAUNCHING SOON!</span>,
              <img
                key={`w-${i}`}
                src={`${base}${watch.image.replace(/^\//, '')}`}
                alt={watch.name}
                className={s.tickerWatch}
              />,
            ])}
          </Marquee>
        </FadeIn>
      </div>

      <div className={s.content}>
        <FadeIn>
          <div className={s.logo}>
            <img src={`${base}assets/logo.png`} alt="BOS WATCH CLUB" />
          </div>
        </FadeIn>

        <FadeIn delay="0.15s">
          {status === 'success' ? (
            <div className={s.success}>
              <span>&#10003;</span>
              <span>You're on the list! We'll be in touch!</span>
            </div>
          ) : (
            <div className={s.signupSection}>
              <p className={s.signupLabel + ' ' + s.fadeSlideIn}>Be the first to know when Boston Watch Club launches! Get early access and founding member perks!</p>
              <form className={s.form} onSubmit={handleSubmit}>
                <input
                  type="email"
                  className={s.input}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
                <ShinyButton
                  as="button"
                  type="submit"
                  className={s.submitBtn}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'SUBMITTING...' : 'GET EARLY ACCESS!'}
                </ShinyButton>
              </form>
              {status === 'error' && <p className={s.error}>{errorMsg}</p>}
            </div>
          )}
        </FadeIn>

        <FadeIn delay="0.3s">
          <p className={s.subtitle}>
            <TypewriterText
              text={[
                "An exclusive community for collectors, enthusiasts, and those who appreciate the art of horology!",
                "Where passion for timepieces meets a world-class membership experience!",
                "Curated events. Rare access. A circle of true watch lovers!",
              ]}
              speed={45}
              deleteSpeed={25}
              delay={2500}
              loop
            />
          </p>
        </FadeIn>
      </div>

      {showLogin && (
        <div className={s.loginOverlay} onClick={() => setShowLogin(false)}>
          <form
            className={s.loginCard}
            onClick={e => e.stopPropagation()}
            onSubmit={e => {
              e.preventDefault()
              setLoginError('')
              if (!login(adminEmail, adminPassword)) {
                setLoginError('Invalid credentials')
              }
            }}
          >
            <div className={s.loginTitle}>Admin Login</div>
            {loginError && <div className={s.loginError}>{loginError}</div>}
            <input
              type="email"
              className={s.input}
              placeholder="Email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className={s.input}
              placeholder="Password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              required
            />
            <ShinyButton as="button" type="submit" className={s.submitBtn}>
              SIGN IN
            </ShinyButton>
          </form>
        </div>
      )}

      <footer className={s.footer}>
        <span>&copy; {new Date().getFullYear()} BOS Watch Club</span>
        <button className={s.adminLink} onClick={() => setShowLogin(true)}>Admin</button>
      </footer>
    </div>
  )
}
