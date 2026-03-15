import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { member, loading, authError, setAuthError, signUp, signIn, signInWithGoogle, resetPassword } = useAuth()

  useEffect(() => {
    if (!loading && member) {
      // Members go to dashboard, free users go to upgrade
      if (roleMeetsMinimum(member.role, 'member')) {
        navigate('/dashboard')
      } else {
        navigate('/upgrade')
      }
    }
  }, [member, loading, navigate])

  // Steps: 'email' | 'create' | 'signin' | 'forgot'
  const [step, setStep] = useState('email')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' })
  const [error, setError] = useState(authError || '')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Pick up authError from context (e.g. after Google OAuth rejection)
  useEffect(() => {
    if (authError) setError(authError)
  }, [authError])

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setError('')
      setSuccess('')
      if (authError) setAuthError('')
    }
  }

  // Step 1: Enter email → go straight to create/signin
  function handleEmailContinue(e) {
    e.preventDefault()
    const email = form.email.toLowerCase().trim()
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    // Default to create account (user can switch to sign in)
    setStep('create')
  }

  // Step 2a: Create account (open registration)
  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!form.name.trim()) {
      setError('Please enter your name.')
      setSubmitting(false)
      return
    }
    if (!form.password.trim()) {
      setError('Please enter a password.')
      setSubmitting(false)
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setSubmitting(false)
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setSubmitting(false)
      return
    }

    try {
      await signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        name: form.name.trim(),
      })
      // After signup, Supabase may auto-sign in (if email confirmation is off)
      // The onAuthStateChange listener will pick it up and redirect
    } catch (err) {
      if (err.message?.includes('already registered') || err.message?.includes('already been registered')) {
        setError('You already have an account. Please sign in instead.')
        setStep('signin')
      } else {
        setError(err.message || 'Something went wrong.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2b: Sign in with existing password
  async function handleSignIn(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!form.password.trim()) {
      setError('Please enter your password.')
      setSubmitting(false)
      return
    }

    try {
      await signIn({
        email: form.email.toLowerCase().trim(),
        password: form.password,
      })
      // Redirect handled by useEffect above
    } catch (err) {
      setError(err.message || 'Invalid credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  // Forgot password
  async function handleForgot(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await resetPassword(form.email.toLowerCase().trim())
      setSuccess('Check your email for a password reset link.')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
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

  function goBackToEmail() {
    setStep('email')
    setForm((prev) => ({ ...prev, password: '', confirmPassword: '', name: '' }))
    setError('')
    setSuccess('')
  }

  const titles = {
    email: 'SIGN IN OR SIGN UP',
    create: 'CREATE ACCOUNT',
    signin: 'WELCOME BACK',
    forgot: 'RESET PASSWORD',
  }

  const subtitles = {
    email: 'ENTER YOUR EMAIL TO CONTINUE',
    create: 'SET UP YOUR FREE ACCOUNT',
    signin: 'SIGN IN TO YOUR ACCOUNT',
    forgot: 'ENTER YOUR EMAIL',
  }

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>
          <h1 className={s.title}>{titles[step]}</h1>
          <p className={s.subtitle}>{subtitles[step]}</p>

          {/* ── STEP 1: EMAIL ── */}
          {step === 'email' && (
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

              <form onSubmit={handleEmailContinue} className={s.form}>
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

                <button type="submit" className={s.submit} disabled={submitting}>
                  CONTINUE
                </button>
              </form>
              <Link to="/" className={s.back}>&larr; Back to home</Link>
            </>
          )}

          {/* ── STEP 2a: CREATE ACCOUNT ── */}
          {step === 'create' && (
            <>
              <p className={s.emailConfirm}>{form.email}</p>

              <form onSubmit={handleCreate} className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>YOUR NAME</label>
                  <input
                    type="text"
                    className={s.input}
                    value={form.name}
                    onChange={update('name')}
                    placeholder="First and last name"
                    autoComplete="name"
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label}>PASSWORD</label>
                  <input
                    type="password"
                    className={s.input}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label}>CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    className={s.input}
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className={s.error}>{error}</p>}

                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'CREATING ACCOUNT...' : 'CREATE FREE ACCOUNT'}
                </button>
              </form>

              <div className={s.toggle}>
                <p>
                  Already have an account?{' '}
                  <button type="button" className={s.toggleBtn} onClick={() => { setStep('signin'); setError(''); setForm(prev => ({ ...prev, password: '', confirmPassword: '', name: '' })) }}>
                    Sign in
                  </button>
                </p>
              </div>
              <button type="button" className={s.back} onClick={goBackToEmail}>&larr; Use a different email</button>
            </>
          )}

          {/* ── STEP 2b: SIGN IN ── */}
          {step === 'signin' && (
            <>
              <p className={s.emailConfirm}>{form.email}</p>

              <form onSubmit={handleSignIn} className={s.form}>
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
                  {submitting ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </form>

              <div className={s.toggle}>
                <p>
                  First time here?{' '}
                  <button type="button" className={s.toggleBtn} onClick={() => { setStep('create'); setError(''); setForm(prev => ({ ...prev, password: '', confirmPassword: '', name: '' })) }}>
                    Create account
                  </button>
                </p>
              </div>
              <button type="button" className={s.back} onClick={goBackToEmail}>&larr; Use a different email</button>
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {step === 'forgot' && (
            <>
              <form onSubmit={handleForgot} className={s.form}>
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
              <button type="button" className={s.back} onClick={goBackToEmail}>&larr; Use a different email</button>
            </>
          )}
        </div>
      </FadeIn>
    </section>
  )
}
