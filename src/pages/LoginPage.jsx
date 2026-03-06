import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import useAuth from '../hooks/useAuth'
import { APPROVED_MEMBERS } from '../data/mockMembers'
import FadeIn from '../components/shared/FadeIn'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const { member, login } = useAuth()
  const navigate = useNavigate()

  // If already logged in, redirect to dashboard
  if (member) {
    navigate('/dashboard', { replace: true })
    return null
  }

  function handleGoogleClick() {
    // TODO: Replace with Google OAuth via Supabase
    setShowEmailInput(true)
    setError(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = APPROVED_MEMBERS.find(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (found) {
      login(found)
      navigate('/dashboard', { replace: true })
    } else {
      setError(true)
    }
  }

  return (
    <section className={styles.page}>
      <FadeIn>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className={styles.title}>MEMBER LOGIN</h1>
          <p className={styles.subtitle}>BOSTON WATCH CLUB</p>

          {!showEmailInput ? (
            <button className={styles.googleBtn} onClick={handleGoogleClick}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <p className={styles.simNote}>Enter your email to simulate login</p>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="you@example.com"
                className={styles.input}
                autoFocus
                required
              />
              <button type="submit" className={styles.submitBtn}>Continue</button>
            </form>
          )}

          {error && (
            <div className={styles.error}>
              <p>This email isn't associated with a membership.</p>
              <p>
                If you think this is an error, <a href="mailto:boswatchclub@gmail.com">contact us</a>.
                Otherwise, <a href="https://form.typeform.com/to/ntT8GKqz" target="_blank" rel="noopener noreferrer">apply to join</a>.
              </p>
            </div>
          )}

          <Link to="/" className={styles.back}>&larr; Back to Home</Link>
        </div>
      </FadeIn>
    </section>
  )
}
