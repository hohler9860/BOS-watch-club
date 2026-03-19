import { useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ActivatePage() {
  // Steps: 'code' | 'success'
  const [step, setStep] = useState('code')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleActivate(e) {
    e.preventDefault()
    if (!code.trim()) { setError('Please enter your access code.'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Activation failed. Please try again.')
        return
      }
      setEmail(data.email)
      setStep('success')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSendReset() {
    if (!email) return
    setSubmitting(true); setError(''); setSuccess('')
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      })
      if (resetErr) throw resetErr
      setSuccess('Password setup email sent. Check your inbox.')
    } catch (err) {
      setError(err.message || 'Failed to send reset email.')
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

              <form onSubmit={handleActivate} className={s.form}>
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
                <button type="submit" className={s.submit} disabled={submitting}>
                  {submitting ? 'ACTIVATING...' : 'ACTIVATE'}
                </button>
              </form>

              <Link to="/login" className={s.back}>Already have an account? Sign in</Link>
              <br />
              <Link to="/" className={s.back}>&larr; Back to home</Link>
            </>
          )}

          {/* ── STEP 2: ACCOUNT CREATED — SET PASSWORD ── */}
          {step === 'success' && (
            <>
              <h1 className={s.title}>YOU'RE IN</h1>
              <p className={s.subtitle}>ACCOUNT CREATED SUCCESSFULLY</p>

              <p className={s.emailConfirm}>{email}</p>

              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                lineHeight: 1.7,
                color: 'rgba(232, 236, 240, 0.5)',
                margin: '0 0 20px 0',
              }}>
                Your account has been created. Click below to receive a password setup email, then check your inbox to set your password and start using your account.
              </p>

              {error && <p className={s.error}>{error}</p>}
              {success && <p className={s.success}>{success}</p>}

              {!success ? (
                <button
                  type="button"
                  className={s.submit}
                  onClick={handleSendReset}
                  disabled={submitting}
                >
                  {submitting ? 'SENDING...' : 'SEND PASSWORD SETUP EMAIL'}
                </button>
              ) : (
                <Link to="/login" className={s.submit} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  GO TO SIGN IN &rarr;
                </Link>
              )}
            </>
          )}
        </div>
      </FadeIn>
    </section>
  )
}
