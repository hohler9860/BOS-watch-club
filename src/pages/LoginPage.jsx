import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useAuth from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { member, loading, signIn, resetPassword, updatePassword, passwordRecovery } = useAuth()
  const tierParam = searchParams.get('tier')
  const emailParam = searchParams.get('email')

  // Route after auth resolves (skip if in password recovery mode)
  useEffect(() => {
    if (passwordRecovery) return
    if (!loading && member) {
      if (member.is_admin) {
        navigate('/admin', { replace: true })
      } else if (member.onboardingComplete) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    }
  }, [member, loading, navigate, passwordRecovery])

  // Steps: 'landing' | 'email' | 'signin' | 'forgot' | 'reset'
  const [step, setStep] = useState(emailParam ? 'email' : 'landing')

  // Auto-switch to reset step when recovery token is detected
  useEffect(() => {
    if (passwordRecovery) setStep('reset')
  }, [passwordRecovery])
  const [email, setEmail] = useState(emailParam || '')
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateForm(field) {
    return (e) => { setForm(p => ({ ...p, [field]: e.target.value })); setError('') }
  }

  // Step 1: check email against backend, route to signin or create
  function handleEmailContinue(e) {
    e.preventDefault()
    const val = email.toLowerCase().trim()
    if (!val) { setError('Please enter your email address.'); return }
    setError('')
    setStep('signin')
  }

  async function handleSignIn(e) {
    e.preventDefault()
    if (!form.password) { setError('Please enter your password.'); return }
    setSubmitting(true); setError('')
    try {
      await signIn({ email: email.trim(), password: form.password })
    } catch (err) {
      const msg = err.message || ''
      setError(msg || 'Invalid login credentials. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    setSubmitting(true); setError(''); setSuccess('')
    try {
      await resetPassword(email.trim())
      setSuccess('Check your inbox for a reset link.')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    if (!form.password) { setError('Please enter a new password.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setSubmitting(true); setError(''); setSuccess('')
    try {
      await updatePassword(form.password)
      setSuccess('Password updated! Redirecting...')
      setForm({ firstName: '', lastName: '', username: '', password: '', confirmPassword: '' })
      setTimeout(() => {
        setStep('email')
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetToEmail() {
    setStep('email'); setEmail(''); setForm({ firstName: '', lastName: '', username: '', password: '', confirmPassword: '' }); setError(''); setSuccess('')
  }

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>

          {/* ── LANDING: SIGN IN OR APPLY ── */}
          {step === 'landing' && (
            <>
              <h1 className={s.title}>WELCOME</h1>
              <p className={s.subtitle}>MEMBERS-ONLY ACCESS</p>
              <p className={s.hint}>
                Don&apos;t have login details yet? This is a members-only club, so access begins with an application &mdash; not account creation. You&apos;ll first enter your email, then complete the application. If approved, you&apos;ll receive an email with your access code and instructions to set your password.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/apply" className={s.submit} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  APPLY NOW &rarr;
                </Link>
              </div>
              <button type="button" className={s.back} onClick={() => setStep('email')} style={{ marginTop: 20, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Already accepted? Sign in
              </button>
              <Link to="/" className={s.back}>&larr; Back to home</Link>
            </>
          )}

          {/* ── STEP 1: EMAIL ── */}
          {step === 'email' && (
            <>
              <h1 className={s.title}>WELCOME</h1>
              <p className={s.subtitle}>ENTER YOUR EMAIL TO CONTINUE</p>

              <form onSubmit={handleEmailContinue} className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>EMAIL</label>
                  <input
                    type="email" className={s.input} value={email} autoFocus
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com" autoComplete="email"
                  />
                </div>
                {error && <p className={s.error}>{error}</p>}
                <button type="submit" className={s.submit}>CONTINUE &rarr;</button>
              </form>

              <Link to="/" className={s.back}>&larr; Back to home</Link>
            </>
          )}

          {/* ── STEP 2a: SIGN IN (existing user) ── */}
          {step === 'signin' && (
            <>
              <h1 className={s.title}>WELCOME BACK</h1>
              <p className={s.emailConfirm}>{email}</p>

              <form onSubmit={handleSignIn} className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>PASSWORD</label>
                  <input
                    type="password" className={s.input} value={form.password} autoFocus
                    onChange={updateForm('password')} placeholder="Your password"
                    autoComplete="current-password"
                  />
                  <button type="button" className={s.forgotBtn}
                    onClick={() => { setStep('forgot'); setError(''); setSuccess('') }}>
                    Forgot password?
                  </button>
                </div>
                {error && <p className={s.error}>{error}</p>}
                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'SIGNING IN...' : 'SIGN IN →'}
                </button>
              </form>

              <button type="button" className={s.back} onClick={resetToEmail}>&larr; Use a different email</button>
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {step === 'forgot' && (
            <>
              <h1 className={s.title}>RESET PASSWORD</h1>
              <p className={s.subtitle}>WE&apos;LL EMAIL YOU A RESET LINK</p>

              <form onSubmit={handleForgot} className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>EMAIL</label>
                  <input
                    type="email" className={s.input} value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com" autoComplete="email"
                  />
                </div>
                {error && <p className={s.error}>{error}</p>}
                {success && <p className={s.success}>{success}</p>}
                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'SENDING...' : 'SEND RESET LINK'}
                </button>
              </form>

              <button type="button" className={s.back}
                onClick={() => { setStep('signin'); setError(''); setSuccess('') }}>
                &larr; Back to sign in
              </button>
            </>
          )}

          {/* ── SET NEW PASSWORD (after clicking reset link) ── */}
          {step === 'reset' && (
            <>
              <h1 className={s.title}>SET NEW PASSWORD</h1>
              <p className={s.subtitle}>ENTER YOUR NEW PASSWORD BELOW</p>

              <form onSubmit={handleReset} className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>NEW PASSWORD</label>
                  <input
                    type="password" className={s.input} value={form.password} autoFocus
                    onChange={updateForm('password')} placeholder="New password (min 6 chars)"
                    autoComplete="new-password"
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label}>CONFIRM PASSWORD</label>
                  <input
                    type="password" className={s.input} value={form.confirmPassword}
                    onChange={updateForm('confirmPassword')} placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>
                {error && <p className={s.error}>{error}</p>}
                {success && <p className={s.success}>{success}</p>}
                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </form>
            </>
          )}
        </div>
      </FadeIn>
    </section>
  )
}
