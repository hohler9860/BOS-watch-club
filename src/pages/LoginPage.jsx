import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useAuth from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { member, loading, signIn, signInWithGoogle, resetPassword } = useAuth()

  useEffect(() => {
    if (!loading && member) {
      navigate('/dashboard')
    }
  }, [member, loading, navigate])

  const [step, setStep] = useState('signin') // 'signin' | 'forgot'
  const [form, setForm] = useState({ email: '', password: '' })
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

      await signIn({
        email: form.email.toLowerCase().trim(),
        password: form.password,
      })
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
            {step === 'forgot' ? 'ENTER YOUR EMAIL' : 'SIGN IN TO YOUR ACCOUNT'}
          </p>

          {/* ── SIGN IN ── */}
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
