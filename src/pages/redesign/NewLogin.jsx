/**
 * NewLogin — /redesign/login
 *
 * Kettle Kids reskin of LoginPage.
 *
 * ALL backend logic is preserved verbatim:
 *   - useAuth() hook (signIn, resetPassword, updatePassword, passwordRecovery)
 *   - supabase.from('approved_members') email-gate check
 *   - step state machine: 'landing' | 'email' | 'signin' | 'forgot' | 'reset'
 *   - handleEmailContinue, handleSignIn, handleForgot, handleReset, resetToEmail
 *   - useSearchParams() for ?step= and ?email= query params
 *   - useEffect auto-redirect on already-authenticated member
 *   - useEffect auto-switch to 'reset' step on passwordRecovery token
 *   - form / error / success / submitting state
 *
 * Presentation changes only:
 *   - White (#fff) background, black (#000) text
 *   - ABC Marist / Georgia heading font
 *   - Solid-black primary buttons, outline secondary buttons (matching NewApply KKButton pattern)
 *   - Clean centered card, generous vertical padding
 *   - Tooltip preserved, restyled for light background
 *
 * LINKS IN-WORLD: all navigational links point to /redesign/* routes.
 * Auth redirects (/admin, /dashboard, /onboarding) are server-driven post-login
 * routes outside the redesign shell — kept as-is; they are not in-page nav links.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'
import s from './NewLogin.module.css'
import CineButton from '../../components/redesign/CineButton'

export default function NewLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { member, loading, signIn, resetPassword, updatePassword, passwordRecovery } = useAuth()
  const tierParam = searchParams.get('tier')   // eslint-disable-line no-unused-vars
  const emailParam = searchParams.get('email')

  // ── Auth redirect (verbatim from LoginPage) ───────────────────────────────────
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

  // ── Step state machine (verbatim from LoginPage) ──────────────────────────────
  const stepParam = searchParams.get('step')
  const [step, setStep] = useState(stepParam === 'email' ? 'email' : emailParam ? 'email' : 'landing')

  // Auto-switch to reset step when recovery token is detected (verbatim)
  useEffect(() => {
    if (passwordRecovery) setStep('reset')
  }, [passwordRecovery])

  const [email, setEmail] = useState(emailParam || '')
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── Form field updater (verbatim from LoginPage) ──────────────────────────────
  function updateForm(field) {
    return (e) => { setForm(p => ({ ...p, [field]: e.target.value })); setError('') }
  }

  // ── Step 1: check email against approved_members (verbatim from LoginPage) ────
  async function handleEmailContinue(e) {
    e.preventDefault()
    const val = email.toLowerCase().trim()
    if (!val) { setError('Please enter your email address.'); return }
    setSubmitting(true); setError('')
    try {
      const { data } = await supabase
        .from('approved_members')
        .select('email')
        .eq('email', val)
        .maybeSingle()
      if (!data) {
        setError('Become a member to sign in.')
        return
      }
      setStep('signin')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Sign in (verbatim from LoginPage) ─────────────────────────────────────────
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

  // ── Forgot password (verbatim from LoginPage) ─────────────────────────────────
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

  // ── Reset password (verbatim from LoginPage) ──────────────────────────────────
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

  // ── Reset to email step (verbatim from LoginPage) ─────────────────────────────
  function resetToEmail() {
    setStep('email')
    setEmail('')
    setForm({ firstName: '', lastName: '', username: '', password: '', confirmPassword: '' })
    setError('')
    setSuccess('')
  }

  // ── Shared input focus/blur handlers ──────────────────────────────────────────
  function onInputFocus(e) { e.target.style.borderColor = '#000'; e.target.style.background = '#fff' }
  function onInputBlur(e)  { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }

  // ── Tooltip content (shared across steps) ────────────────────────────────────
  const tooltipContent = (
    'Approved members can sign in. New applicants should click Apply Now, enter the email they plan to use for sign-in, and complete the membership application. If accepted, login details will be sent by email.'
  )

  return (
    <div className={s.page}>
      <div className={s.card}>
        {/* ── LANDING: SIGN IN OR APPLY ─────────────────────────────────────── */}
        {step === 'landing' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h1 className={s.title}>Welcome</h1>
              <div className={s.tooltip}>
                <span className={s.tooltipIcon} style={{ fontSize: 14 }}>&#9432;</span>
                <span className={s.tooltipText}>{tooltipContent}</span>
              </div>
            </div>

            <p className={s.subtitle}>Members-only access</p>

            <div className={s.btnStack}>
              {/* Apply Now — primary */}
              <CineButton to="/apply" fullWidth style={{ height: 52 }}>
                Apply Now
              </CineButton>

              {/* Log In — secondary (same octagon, same tone) */}
              <CineButton
                type="button"
                fullWidth
                style={{ height: 52 }}
                onClick={() => setStep('email')}
              >
                Log In
              </CineButton>
            </div>

            <div className={s.linkRow}>
              <Link to="/" className={s.back}>Back to home</Link>
            </div>
          </>
        )}

        {/* ── STEP 1: EMAIL ─────────────────────────────────────────────────── */}
        {step === 'email' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h1 className={s.title}>Welcome</h1>
              <div className={s.tooltip}>
                <span className={s.tooltipIcon} style={{ fontSize: 14 }}>&#9432;</span>
                <span className={s.tooltipText}>{tooltipContent}</span>
              </div>
            </div>

            <p className={s.subtitle}>Enter your email to continue</p>

            <form onSubmit={handleEmailContinue} className={s.form}>
              <div className={s.field}>
                <label className={s.label}>Email</label>
                <input
                  type="email"
                  className={s.input}
                  value={email}
                  autoFocus
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
              </div>
              {error && <p className={s.error}>{error}</p>}
              <CineButton type="submit" fullWidth style={{ height: 52, marginTop: 4 }} disabled={submitting}>
                {submitting ? 'Checking...' : 'Continue'}
              </CineButton>
            </form>

            <div className={s.linkRow}>
              <Link to="/apply" className={s.back}>
                Don&apos;t have an account? Apply
              </Link>
              <button type="button" className={s.back} onClick={() => setStep('landing')}>
                Back
              </button>
              <Link to="/" className={s.back}>Back to home</Link>
            </div>
          </>
        )}

        {/* ── STEP 2: SIGN IN ───────────────────────────────────────────────── */}
        {step === 'signin' && (
          <>
            <h1 className={s.title}>Welcome Back</h1>
            <p className={s.emailConfirm}>{email}</p>

            <form onSubmit={handleSignIn} className={s.form}>
              <div className={s.field}>
                <label className={s.label}>Password</label>
                <input
                  type="password"
                  className={s.input}
                  value={form.password}
                  autoFocus
                  onChange={updateForm('password')}
                  placeholder="Your password"
                  autoComplete="current-password"
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
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
              <CineButton type="submit" fullWidth style={{ height: 52, marginTop: 4 }} disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </CineButton>
            </form>

            <div className={s.linkRow}>
              <button type="button" className={s.back} onClick={resetToEmail}>
                Use a different email
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD ────────────────────────────────────────────────── */}
        {step === 'forgot' && (
          <>
            <h1 className={s.title}>Reset Password</h1>
            <p className={s.subtitle}>We&apos;ll email you a reset link</p>

            <form onSubmit={handleForgot} className={s.form}>
              <div className={s.field}>
                <label className={s.label}>Email</label>
                <input
                  type="email"
                  className={s.input}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
              </div>
              {error && <p className={s.error}>{error}</p>}
              {success && <p className={s.success}>{success}</p>}
              <CineButton type="submit" fullWidth style={{ height: 52, marginTop: 4 }} disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </CineButton>
            </form>

            <div className={s.linkRow}>
              <button
                type="button"
                className={s.back}
                onClick={() => { setStep('signin'); setError(''); setSuccess('') }}
              >
                Back to sign in
              </button>
            </div>
          </>
        )}

        {/* ── RESET PASSWORD (after clicking reset link email) ──────────────── */}
        {step === 'reset' && (
          <>
            <h1 className={s.title}>Set New Password</h1>
            <p className={s.subtitle}>Enter your new password below</p>

            <form onSubmit={handleReset} className={s.form}>
              <div className={s.field}>
                <label className={s.label}>New Password</label>
                <input
                  type="password"
                  className={s.input}
                  value={form.password}
                  autoFocus
                  onChange={updateForm('password')}
                  placeholder="New password (min 6 chars)"
                  autoComplete="new-password"
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Confirm Password</label>
                <input
                  type="password"
                  className={s.input}
                  value={form.confirmPassword}
                  onChange={updateForm('confirmPassword')}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
              </div>
              {error && <p className={s.error}>{error}</p>}
              {success && <p className={s.success}>{success}</p>}
              <CineButton type="submit" fullWidth style={{ height: 52, marginTop: 4 }} disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Password'}
              </CineButton>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
