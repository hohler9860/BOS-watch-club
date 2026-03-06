import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router'
import tiers from '../data/tiers'
import FadeIn from '../components/shared/FadeIn'
import styles from './LoginPage.module.css'

// Google Client ID — replace with your own from Google Cloud Console
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Local auth helpers — swap for API calls when backend is ready
function getUsers() {
  return JSON.parse(localStorage.getItem('bwc_users') || '[]')
}
function saveUsers(users) {
  localStorage.setItem('bwc_users', JSON.stringify(users))
}
function setSession(user) {
  localStorage.setItem('bwc_session', JSON.stringify(user))
}
function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch { return null }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // login | signup
  const [form, setForm] = useState({ name: '', email: '', password: '', tier: 'ENTHUSIAST' })
  const [error, setError] = useState('')
  const googleBtnRef = useRef(null)

  const handleGoogleSuccess = useCallback((response) => {
    const payload = decodeJwt(response.credential)
    if (!payload) { setError('Google sign-in failed. Please try again.'); return }

    const users = getUsers()
    let user = users.find((u) => u.email === payload.email)

    if (!user) {
      // Auto-create account on first Google sign-in
      user = {
        id: crypto.randomUUID(),
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        avatar: payload.picture || '',
        tier: 'ENTHUSIAST',
        rsvps: [],
        googleAuth: true,
        createdAt: new Date().toISOString(),
      }
      saveUsers([...users, user])
    }

    setSession({ id: user.id, name: user.name, email: user.email, avatar: user.avatar || payload.picture })
    navigate('/dashboard')
  }, [navigate])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts) return
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSuccess,
    })
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        width: 360,
        text: 'continue_with',
        shape: 'pill',
      })
    }
  }, [mode, handleGoogleSuccess])

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setError('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const users = getUsers()

    if (mode === 'signup') {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError('All fields are required.')
        return
      }
      if (users.find((u) => u.email === form.email.toLowerCase())) {
        setError('An account with this email already exists.')
        return
      }
      const newUser = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password, // plaintext for local only — hash on backend
        tier: form.tier,
        rsvps: [],
        createdAt: new Date().toISOString(),
      }
      saveUsers([...users, newUser])
      setSession({ id: newUser.id, name: newUser.name, email: newUser.email })
      navigate('/dashboard')
    } else {
      const user = users.find(
        (u) => u.email === form.email.toLowerCase().trim() && u.password === form.password
      )
      if (!user) {
        setError('Invalid email or password.')
        return
      }
      setSession({ id: user.id, name: user.name, email: user.email, avatar: user.avatar })
      navigate('/dashboard')
    }
  }

  return (
    <section className={styles.page}>
      <FadeIn>
        <div className={styles.card}>
          <div className={styles.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>
          <h1 className={styles.title}>
            {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login' ? 'MEMBER LOGIN' : 'JOIN THE CLUB'}
          </p>

          {/* Google Sign-In */}
          {GOOGLE_CLIENT_ID ? (
            <>
              <div ref={googleBtnRef} className={styles.googleWrap} />
              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>or</span>
                <span className={styles.dividerLine} />
              </div>
            </>
          ) : null}

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'signup' && (
              <div className={styles.field}>
                <label className={styles.label}>FULL NAME</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>EMAIL</label>
              <input
                type="email"
                className={styles.input}
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>PASSWORD</label>
              <input
                type="password"
                className={styles.input}
                value={form.password}
                onChange={update('password')}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            {mode === 'signup' && (
              <div className={styles.field}>
                <label className={styles.label}>MEMBERSHIP TIER</label>
                <div className={styles.tierGrid}>
                  {tiers.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      className={`${styles.tierOption} ${form.tier === t.name ? styles.tierSelected : ''}`}
                      onClick={() => setForm((prev) => ({ ...prev, tier: t.name }))}
                    >
                      <span className={styles.tierName}>{t.name}</span>
                      <span className={styles.tierPrice}>{t.price}<span className={styles.tierPeriod}> / {t.period}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit}>
              {mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className={styles.toggle}>
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button type="button" className={styles.toggleBtn} onClick={() => { setMode('signup'); setError('') }}>
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" className={styles.toggleBtn} onClick={() => { setMode('login'); setError('') }}>
                  Log in
                </button>
              </p>
            )}
          </div>

          <Link to="/" className={styles.back}>&larr; Back to home</Link>
        </div>
      </FadeIn>
    </section>
  )
}
