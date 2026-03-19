import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ActivatePage() {
  const navigate = useNavigate()
  // Steps: 'code' | 'password'
  const [step, setStep] = useState('code')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCodeSubmit(e) {
    e.preventDefault()
    if (!code.trim()) { setError('Please enter your access code.'); return }
    setError('')
    setStep('password')
  }

  async function handleActivate(e) {
    e.preventDefault()
    if (!password) { setError('Please enter a password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setSubmitting(true); setError('')
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
        setError('Account created but auto-login failed. Go to sign in.')
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

      navigate('/welcome', { replace: true })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>

          {/* ── STEP 1: ENTER ACCESS CODE ── */}
          {step === 'code' && (
            <>
              <h1 className={s.title}>ACTIVATE ACCOUNT</h1>
              <p className={s.subtitle}>ENTER YOUR ACCESS CODE TO GET STARTED</p>

              <form onSubmit={handleCodeSubmit} className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>ACCESS CODE</label>
                  <input
                    type="text"
                    className={s.input}
                    value={code}
                    autoFocus
                    onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                    placeholder="e.g. A1B2C3D4"
                    autoComplete="off"
                    style={{ letterSpacing: '0.2em', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 18 }}
                  />
                </div>
                {error && <p className={s.error}>{error}</p>}
                <button type="submit" className={s.submit}>
                  CONTINUE
                </button>
              </form>

              <Link to="/login" className={s.back} style={{ marginTop: 10 }}>Already have an account? Sign in</Link>
              <Link to="/" className={s.back}>&larr; Back to home</Link>
            </>
          )}

          {/* ── STEP 2: SET PASSWORD ── */}
          {step === 'password' && (
            <>
              <h1 className={s.title}>SET YOUR PASSWORD</h1>
              <p className={s.subtitle}>CREATE A PASSWORD TO COMPLETE ACTIVATION</p>

              <form onSubmit={handleActivate} className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>PASSWORD</label>
                  <input
                    type="password"
                    className={s.input}
                    value={password}
                    autoFocus
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label}>CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    className={s.input}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                </div>
                {error && <p className={s.error}>{error}</p>}
                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'ACTIVATING...' : 'ACTIVATE MY ACCOUNT'}
                </button>
              </form>

              <button type="button" className={s.back} onClick={() => { setStep('code'); setError('') }} style={{ marginTop: 10 }}>
                &larr; Change access code
              </button>
            </>
          )}
        </div>
      </FadeIn>
    </section>
  )
}
