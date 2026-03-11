import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useAuth from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

const ACCESS_CODE = 'BOS2025'

export default function LoginPage() {
  const navigate = useNavigate()
  const { member, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth()

  useEffect(() => {
    if (!loading && member) {
      navigate('/dashboard')
    }
  }, [member, loading, navigate])

  const [step, setStep] = useState('code') // 'code' | 'signin' | 'forgot'
  const [form, setForm] = useState({ accessCode: '', email: '', password: '' })
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

  function verifyCode() {
    if (form.accessCode.trim().toUpperCase() === ACCESS_CODE) {
      setStep('signin')
      setError('')
    } else {
      setError('Invalid access code. Please check your invitation.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (step === 'forgot') {
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

      if (!form.email.trim() || !form.password.trim()) {
        setError('Email and password are required.')
        setSubmitting(false)
        return
      }

      // Try sign in first, fall back to sign up for new users
      try {
        await signIn({
          email: form.email.toLowerCase().trim(),
          password: form.password,
        })
      } catch {
        await signUp({
          email: form.email.toLowerCase().trim(),
          password: form.password,
          name: form.email.split('@')[0],
          tier: 'ENTHUSIAST',
        })
      }
      navigate('/dashboard')
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

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>
          <h1 className={s.title}>
            {step === 'forgot' ? 'RESET PASSWORD' : 'MEMBER LOGIN'}
          </h1>
          <p className={s.subtitle}>
            {step === 'code' ? 'ENTER ACCESS CODE' : step === 'forgot' ? 'ENTER YOUR EMAIL' : 'SIGN IN TO YOUR ACCOUNT'}
          </p>

          {/* ── STEP 1: ACCESS CODE ── */}
          {step === 'code' && (
            <>
              <div className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>
                    ACCESS CODE
                    <span className={s.tooltip}>
                      <svg className={s.tooltipIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span className={s.tooltipText}>
                        You&apos;ll receive a one-time access code after your membership application is approved. Apply on our website to get started.
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    className={s.input}
                    value={form.accessCode}
                    onChange={update('accessCode')}
                    placeholder="Enter your access code"
                    autoComplete="off"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); verifyCode() } }}
                  />
                </div>
                {error && <p className={s.error}>{error}</p>}
                <button type="button" className={s.submit} onClick={verifyCode}>
                  CONTINUE
                </button>
              </div>

              <div className={s.codeFooter}>
                <p className={s.codeFooterText}>
                  Don&apos;t have a code?{' '}
                  <Link to="/membership" className={s.toggleBtn}>
                    Apply for membership
                  </Link>
                </p>
                <p className={s.codeFooterText}>
                  Already have an account? Enter your access code above to sign in.
                </p>
              </div>
              <Link to="/" className={s.back}>&larr; Back to home</Link>
            </>
          )}

          {/* ── STEP 2: SIGN IN ── */}
          {step === 'signin' && (
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

              <form onSubmit={handleSubmit} className={s.form}>
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
                <div className={s.field}>
                  <label className={s.label}>PASSWORD</label>
                  <input
                    type="password"
                    className={s.input}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={s.forgotBtn}
                    onClick={() => { setStep('forgot'); setError(''); setSuccess('') }}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && <p className={s.error}>{error}</p>}

                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'PLEASE WAIT...' : 'SIGN IN'}
                </button>
              </form>
              <Link to="/" className={s.back}>&larr; Back to home</Link>
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {step === 'forgot' && (
            <>
              <form onSubmit={handleSubmit} className={s.form}>
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

                {error && <p className={s.error}>{error}</p>}
                {success && <p className={s.success}>{success}</p>}

                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'PLEASE WAIT...' : 'SEND RESET LINK'}
                </button>
              </form>

              <div className={s.toggle}>
                <p>
                  Remember your password?{' '}
                  <button type="button" className={s.toggleBtn} onClick={() => { setStep('signin'); setError(''); setSuccess('') }}>
                    Back to sign in
                  </button>
                </p>
              </div>
              <Link to="/" className={s.back}>&larr; Back to home</Link>
            </>
          )}
        </div>
      </FadeIn>
    </section>
  )
}
