import { useState } from 'react'
import FadeIn from '../components/shared/FadeIn'
import TypewriterText from '../components/shared/TypewriterText'
import ShinyButton from '../components/shared/ShinyButton'
import GrainOverlay from '../components/shared/GrainOverlay'
import { supabase } from '../lib/supabase'
import s from './LaunchingSoonPage.module.css'

export default function LaunchingSoonPage() {
  const base = import.meta.env.BASE_URL
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMsg('')

    if (!supabase) {
      setErrorMsg('Service unavailable. Please try again later.')
      setStatus('error')
      return
    }

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

        <FadeIn delay="0.3s">
          <ShinyButton as="div" className={s.badge}>
            LAUNCHING SOON
          </ShinyButton>
        </FadeIn>

        <FadeIn delay="0.45s">
          {status === 'success' ? (
            <div className={s.success}>
              <span>&#10003;</span>
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
                  required
                  disabled={status === 'loading'}
                />
                <ShinyButton
                  as="button"
                  type="submit"
                  className={s.submitBtn}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'SUBMITTING...' : 'NOTIFY ME'}
                </ShinyButton>
              </div>
              {status === 'error' && <p className={s.error}>{errorMsg}</p>}
            </form>
          )}
        </FadeIn>

        <FadeIn delay="0.6s">
          <p className={s.hint}>We're putting the finishing touches on something special.</p>
        </FadeIn>
      </div>

      <footer className={s.footer}>
        <span>&copy; {new Date().getFullYear()} BOS Watch Club</span>
      </footer>
    </div>
  )
}
