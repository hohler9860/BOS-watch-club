/**
 * NewActivate — /activate
 *
 * Kettle Kids reskin of the old ActivatePage, rendered inside NewSiteLayout
 * (same shell as /login) instead of the legacy <Layout/> wrapper.
 *
 * Behavior (ported verbatim from ActivatePage, plus the ?code= prefill):
 *   - Reads ?code= from the URL, uppercases + trims it, and prefills the
 *     access-code field. Works fine with no param too.
 *   - Step 1: confirm/enter access code.
 *   - Step 2: choose password + confirm, POST /api/membership
 *     {action:'activate', code, password}, then auto sign-in with the
 *     returned email, then navigate('/onboarding') directly — the old
 *     /welcome interstitial is gone.
 *   - Every error state links to /login ("already activated? sign in")
 *     and a mailto: for invalid/expired codes.
 *
 * Presentation reuses NewLogin.module.css + CineButton for a 1:1 visual
 * match with /login.
 */

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { supabase } from '../../lib/supabase'
import s from './NewLogin.module.css'
import CineButton from '../../components/redesign/CineButton'

const SUPPORT_EMAIL = 'boswatchclub@gmail.com'

export default function NewActivate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const codeParam = (searchParams.get('code') || '').toUpperCase().trim()

  // Steps: 'code' | 'password'
  const [step, setStep] = useState('code')
  const [code, setCode] = useState(codeParam)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [expiredOrInvalid, setExpiredOrInvalid] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function onInputFocus(e) { e.target.style.borderColor = '#000'; e.target.style.background = '#fff' }
  function onInputBlur(e)  { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }

  function handleCodeSubmit(e) {
    e.preventDefault()
    if (!code.trim()) { setError('Please enter your access code.'); return }
    setError('')
    setExpiredOrInvalid(false)
    setStep('password')
  }

  async function handleActivate(e) {
    e.preventDefault()
    if (!password) { setError('Please enter a password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setSubmitting(true); setError(''); setExpiredOrInvalid(false)
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', code: code.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Activation failed. Please try again.')
        if (data.error?.includes('Invalid') || data.error?.includes('expired')) {
          setExpiredOrInvalid(true)
          setStep('code')
        }
        return
      }

      // Auto-login with the email and password they just set
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password,
      })
      if (signInErr) {
        setError('Account created but auto-login failed.')
        return
      }

      // Wait for auth state to propagate before navigating
      await new Promise(resolve => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_IN') {
            subscription.unsubscribe()
            resolve()
          }
        })
        // Fallback in case event already fired
        setTimeout(() => { subscription.unsubscribe(); resolve() }, 1500)
      })

      navigate('/onboarding', { replace: true })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        {/* ── STEP 1: ENTER ACCESS CODE ── */}
        {step === 'code' && (
          <>
            <h1 className={s.title}>Activate Account</h1>
            <p className={s.subtitle}>Enter your access code to get started</p>

            <form onSubmit={handleCodeSubmit} className={s.form}>
              <div className={s.field}>
                <label className={s.label}>Access Code</label>
                <input
                  type="text"
                  className={s.input}
                  value={code}
                  autoFocus
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                  placeholder="e.g. A1B2C3D4"
                  autoComplete="off"
                  style={{ letterSpacing: '0.2em', textAlign: 'center' }}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
              </div>
              {error && (
                <p className={s.error}>
                  {error}
                  {expiredOrInvalid && (
                    <>
                      {' '}Need a new code? Email{' '}
                      <a href={`mailto:${SUPPORT_EMAIL}`} className={s.back} style={{ display: 'inline', marginTop: 0 }}>
                        {SUPPORT_EMAIL}
                      </a>.
                    </>
                  )}
                </p>
              )}
              <CineButton type="submit" fullWidth style={{ height: 52, marginTop: 4 }}>
                Continue
              </CineButton>
            </form>

            <div className={s.linkRow}>
              <Link to="/login" className={s.back}>Already activated? Sign in</Link>
              <Link to="/" className={s.back}>Back to home</Link>
            </div>
          </>
        )}

        {/* ── STEP 2: SET PASSWORD ── */}
        {step === 'password' && (
          <>
            <h1 className={s.title}>Set Your Password</h1>
            <p className={s.subtitle}>Create a password to complete activation</p>

            <form onSubmit={handleActivate} className={s.form}>
              <div className={s.field}>
                <label className={s.label}>Password</label>
                <input
                  type="password"
                  className={s.input}
                  value={password}
                  autoFocus
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Min 6 characters"
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
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
              </div>
              {error && (
                <p className={s.error}>
                  {error}{' '}
                  <Link to="/login" className={s.back} style={{ display: 'inline', marginTop: 0 }}>
                    Go to sign in
                  </Link>
                  {' '}or email{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className={s.back} style={{ display: 'inline', marginTop: 0 }}>
                    {SUPPORT_EMAIL}
                  </a>.
                </p>
              )}
              <CineButton type="submit" fullWidth style={{ height: 52, marginTop: 4 }} disabled={submitting}>
                {submitting ? 'Activating...' : 'Activate My Account'}
              </CineButton>
            </form>

            <div className={s.linkRow}>
              <button type="button" className={s.back} onClick={() => { setStep('code'); setError('') }}>
                Change access code
              </button>
              <Link to="/login" className={s.back}>Already activated? Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
