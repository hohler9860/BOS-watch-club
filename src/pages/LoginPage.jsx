import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { member, loading, signUp, signIn, signInWithGoogle, resetPassword } = useAuth()
  const tierParam = searchParams.get('tier')

  // Route after auth resolves
  useEffect(() => {
    if (!loading && member) {
      navigate('/dashboard', { replace: true })
    }
  }, [member, loading, navigate, tierParam])

  // Steps: 'email' | 'signin' | 'create' | 'forgot'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '', confirmPassword: '' })
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
      setError(err.message || 'Incorrect password. Try again or use Google.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.firstName.trim()) { setError('Please enter your first name.'); return }
    if (!form.lastName.trim()) { setError('Please enter your last name.'); return }
    if (!form.password) { setError('Please enter a password.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setSubmitting(true); setError('')
    try {
      await signUp({ email: email.trim(), password: form.password, name: `${form.firstName.trim()} ${form.lastName.trim()}` })
    } catch (err) {
      if (err.message?.toLowerCase().includes('already')) {
        setError('Account already exists. Sign in instead.')
        setStep('signin')
      } else {
        setError(err.message || 'Something went wrong.')
      }
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

  async function handleGoogle() {
    try { await signInWithGoogle() } catch { /* redirect handles it */ }
  }

  function resetToEmail() {
    setStep('email'); setEmail(''); setForm({ firstName: '', lastName: '', password: '', confirmPassword: '' }); setError(''); setSuccess('')
  }

  // ── Google divider ──
  const GoogleDivider = () => (
    <>
      <div className={s.divider}>
        <span className={s.dividerLine} /><span className={s.dividerText}>or</span><span className={s.dividerLine} />
      </div>
      <button type="button" className={s.googleBtn} onClick={handleGoogle}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </>
  )

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>

          {/* ── STEP 1: EMAIL ── */}
          {step === 'email' && (
            <>
              <h1 className={s.title}>WELCOME</h1>
              <p className={s.subtitle}>ENTER YOUR EMAIL TO GET STARTED</p>

              <GoogleDivider />

              <div className={s.divider}>
                <span className={s.dividerLine} />
                <span className={s.dividerText} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  or use email
                  <span className={s.tooltip}>
                    <svg className={s.tooltipIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span className={s.tooltipText}>
                      Enter your email below and hit Continue. If you already have an account, you&apos;ll be asked for your password. If you&apos;re new, you&apos;ll be taken to create an account.
                    </span>
                  </span>
                </span>
                <span className={s.dividerLine} />
              </div>

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
                <button type="submit" className={s.submit}>CONTINUE →</button>
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

              <GoogleDivider />

              <div className={s.toggle}>
                <p>New here?{' '}
                  <button type="button" className={s.toggleBtn}
                    onClick={() => { setStep('create'); setError(''); setForm(p => ({ ...p, password: '' })) }}>
                    Create an account
                  </button>
                </p>
              </div>
              <button type="button" className={s.back} onClick={resetToEmail}>&larr; Use a different email</button>
            </>
          )}

          {/* ── STEP 2b: CREATE ACCOUNT (new user) ── */}
          {step === 'create' && (
            <>
              <h1 className={s.title}>CREATE ACCOUNT</h1>
              <p className={s.emailConfirm}>{email}</p>

              <form onSubmit={handleCreate} className={s.form}>
                <div className={s.formRow}>
                  <div className={s.field}>
                    <label className={s.label}>FIRST NAME</label>
                    <input
                      type="text" className={s.input} value={form.firstName} autoFocus
                      onChange={updateForm('firstName')} placeholder="First name"
                      autoComplete="given-name"
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>LAST NAME</label>
                    <input
                      type="text" className={s.input} value={form.lastName}
                      onChange={updateForm('lastName')} placeholder="Last name"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className={s.field}>
                  <label className={s.label}>PASSWORD</label>
                  <input
                    type="password" className={s.input} value={form.password}
                    onChange={updateForm('password')} placeholder="Create a password (min 6 chars)"
                    autoComplete="new-password"
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label}>CONFIRM PASSWORD</label>
                  <input
                    type="password" className={s.input} value={form.confirmPassword}
                    onChange={updateForm('confirmPassword')} placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>
                {error && <p className={s.error}>{error}</p>}
                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
                </button>
              </form>

              <GoogleDivider />

              <div className={s.toggle}>
                <p>Already have an account?{' '}
                  <button type="button" className={s.toggleBtn} onClick={() => { setStep('signin'); setError('') }}>
                    Sign in
                  </button>
                </p>
              </div>
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
        </div>
      </FadeIn>
    </section>
  )
}
