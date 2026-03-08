import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useAuth from '../hooks/useAuth'
import tiers from '../data/tiers'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { member, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth()

  // Redirect to dashboard if already logged in (e.g. after OAuth callback)
  useEffect(() => {
    if (!loading && member) {
      navigate('/dashboard')
    }
  }, [member, loading, navigate])
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [form, setForm] = useState({ name: '', email: '', password: '', tier: 'ENTHUSIAST' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setError('')
      setSuccess('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'forgot') {
        if (!form.email.trim()) {
          setError('Please enter your email address.')
          setSubmitting(false)
          return
        }
        await resetPassword(form.email.toLowerCase().trim())
        setSuccess('Check your email for a password reset link.')
        setSubmitting(false)
        return
      }

      if (mode === 'signup') {
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
          setError('All fields are required.')
          setSubmitting(false)
          return
        }
        await signUp({
          email: form.email.toLowerCase().trim(),
          password: form.password,
          name: form.name.trim(),
          tier: form.tier,
        })
        navigate('/dashboard')
      } else {
        await signIn({
          email: form.email.toLowerCase().trim(),
          password: form.password,
        })
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
    }
  }

  function getTitle() {
    if (mode === 'forgot') return 'RESET PASSWORD'
    if (mode === 'signup') return 'CREATE ACCOUNT'
    return 'WELCOME BACK'
  }

  function getSubtitle() {
    if (mode === 'forgot') return 'ENTER YOUR EMAIL'
    if (mode === 'signup') return 'JOIN THE CLUB'
    return 'MEMBER LOGIN'
  }

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>
          <h1 className={s.title}>{getTitle()}</h1>
          <p className={s.subtitle}>{getSubtitle()}</p>

          {/* Google Sign-In (hidden on forgot password) */}
          {mode !== 'forgot' && (
            <>
              <button type="button" className={s.googleBtn} onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className={s.divider}>
                <span className={s.dividerLine} />
                <span className={s.dividerText}>or</span>
                <span className={s.dividerLine} />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className={s.form}>
            {mode === 'signup' && (
              <div className={s.field}>
                <label className={s.label}>FULL NAME</label>
                <input
                  type="text"
                  className={s.input}
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div className={s.field}>
              <label className={s.label}>EMAIL</label>
              <input
                type="email"
                className={s.input}
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {mode !== 'forgot' && (
              <div className={s.field}>
                <label className={s.label}>PASSWORD</label>
                <input
                  type="password"
                  className={s.input}
                  value={form.password}
                  onChange={update('password')}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                {mode === 'login' && (
                  <button
                    type="button"
                    className={s.forgotBtn}
                    onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div className={s.field}>
                <label className={s.label}>MEMBERSHIP TIER</label>
                <div className={s.tierGrid}>
                  {tiers.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      className={`${s.tierOption} ${form.tier === t.name ? s.tierSelected : ''}`}
                      onClick={() => setForm((prev) => ({ ...prev, tier: t.name }))}
                    >
                      <span className={s.tierName}>{t.name}</span>
                      <span className={s.tierPrice}>{t.price}<span className={s.tierPeriod}> / {t.period}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className={s.error}>{error}</p>}
            {success && <p className={s.success}>{success}</p>}

            <button type="submit" className={s.submit} disabled={submitting}>
              {submitting
                ? 'PLEASE WAIT...'
                : mode === 'forgot'
                  ? 'SEND RESET LINK'
                  : mode === 'login'
                    ? 'LOG IN'
                    : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className={s.toggle}>
            {mode === 'forgot' ? (
              <p>
                Remember your password?{' '}
                <button type="button" className={s.toggleBtn} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
                  Back to login
                </button>
              </p>
            ) : mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button type="button" className={s.toggleBtn} onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" className={s.toggleBtn} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
                  Log in
                </button>
              </p>
            )}
          </div>

          <Link to="/" className={s.back}>&larr; Back to home</Link>
        </div>
      </FadeIn>
    </section>
  )
}
