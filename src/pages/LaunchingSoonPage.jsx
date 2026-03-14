import { useState } from 'react'
import FadeIn from '../components/shared/FadeIn'
import TypewriterText from '../components/shared/TypewriterText'
import ShinyButton from '../components/shared/ShinyButton'
import Marquee from '../components/shared/Marquee'
import GrainOverlay from '../components/shared/GrainOverlay'
import { supabase } from '../lib/supabase'
import watchData from '../data/watchData'
import s from './LaunchingSoonPage.module.css'

const TICKER_WATCHES = watchData.slice(0, 10)

export default function LaunchingSoonPage() {
  const base = import.meta.env.BASE_URL
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

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
            {TICKER_WATCHES.map((watch, i) => (
              <span key={i} className={s.tickerItem}>
                <span className={s.tickerText}>LAUNCHING SOON</span>
                <img
                  src={`${base}${watch.image.replace(/^\//, '')}`}
                  alt={watch.name}
                  className={s.tickerWatch}
                />
              </span>
            ))}
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
              <span>You're on the list. We'll be in touch.</span>
            </div>
          ) : (
            <div className={s.signupSection}>
              <p className={s.signupLabel + ' ' + s.fadeSlideIn}>Be the first to know when Boston Watch Club launches. Get early access and founding member perks.</p>
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
                  {status === 'loading' ? 'SUBMITTING...' : 'GET EARLY ACCESS'}
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
                "An exclusive community for collectors, enthusiasts, and those who appreciate the art of horology.",
                "Where passion for timepieces meets a world-class membership experience.",
                "Curated events. Rare access. A circle of true watch lovers.",
              ]}
              speed={45}
              deleteSpeed={25}
              delay={2500}
              loop
            />
          </p>
        </FadeIn>
      </div>

      <footer className={s.footer}>
        <span>&copy; {new Date().getFullYear()} BOS Watch Club</span>
      </footer>
    </div>
  )
}
