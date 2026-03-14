import { useState } from 'react'
import { supabase } from '../lib/supabase'
import FadeIn from '../components/shared/FadeIn'
import SplitText from '../components/shared/SplitText'
import GrainOverlay from '../components/shared/GrainOverlay'
import s from './LaunchingSoonPage.module.css'

export default function LaunchingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const base = import.meta.env.BASE_URL

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)

    if (!supabase) {
      setError('Service unavailable. Please try again later.')
      setLoading(false)
      return
    }

    const { error: dbError } = await supabase
      .from('email_signups')
      .insert({ email: email.toLowerCase().trim() })

    setLoading(false)

    if (dbError) {
      if (dbError.code === '23505') {
        setSubmitted(true)
        return
      }
      setError('Something went wrong. Please try again.')
      return
    }

    setSubmitted(true)
  }

  return (
    <div className={s.page}>
      <GrainOverlay />
      <div className={s.orb1} />
      <div className={s.orb2} />

      <div className={s.content}>
        <FadeIn>
          <div className={s.logo}>
            <img src={`${base}assets/logo.png`} alt="BOS WATCH CLUB" />
          </div>
        </FadeIn>

        <FadeIn delay="0.15s">
          <SplitText as="p" className={s.subtitle} delay={0.2}>
            An exclusive community for collectors, enthusiasts, and those who appreciate the art of horology.
          </SplitText>
        </FadeIn>

        <FadeIn delay="0.3s">
          <div className={s.badge}>LAUNCHING SOON</div>
        </FadeIn>

        <FadeIn delay="0.45s">
          {submitted ? (
            <div className={s.success}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>You're on the list. We'll be in touch.</span>
            </div>
          ) : (
            <form className={s.form} onSubmit={handleSubmit}>
              <div className={s.inputWrap}>
                <input
                  type="email"
                  className={s.input}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                />
                <button type="submit" className={s.submitBtn} disabled={loading}>
                  {loading ? 'SUBMITTING...' : 'NOTIFY ME'}
                </button>
              </div>
              {error && <p className={s.error}>{error}</p>}
              <p className={s.hint}>Be the first to know when we launch.</p>
            </form>
          )}
        </FadeIn>
      </div>

      <footer className={s.footer}>
        <span>© {new Date().getFullYear()} BOS Watch Club</span>
      </footer>
    </div>
  )
}
