import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ActivatePage() {
  const { member, redeemAccessCode } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // If already a member, redirect to dashboard
  if (member && roleMeetsMinimum(member.role, 'member')) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleActivate(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setSubmitting(true)

    try {
      const res = await redeemAccessCode(code)
      setResult({ tier: res.tier })
    } catch (err) {
      setError(err.message || 'Invalid access code. Please check your invitation email.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <h2 className={s.title}>Activate Membership</h2>

          {!member ? (
            // Not logged in — prompt to sign up first
            <>
              <p className={s.subtitle}>Create a free account first, then enter your access code</p>
              <p style={{ fontSize: 14, color: 'rgba(232,236,240,0.6)', marginBottom: 20, lineHeight: 1.6 }}>
                To activate your membership, you need an account.
                Sign up for free, then come back here to enter your code.
              </p>
              <Link to="/login" className={s.submit} style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                Sign Up or Log In
              </Link>
              <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(232,236,240,0.5)' }}>
                Don&apos;t have a code? <Link to="/membership" style={{ color: '#FFD700' }}>Apply for membership</Link>
              </p>
            </>
          ) : !result ? (
            // Logged in as free user — show code entry
            <>
              <p className={s.subtitle}>Enter the access code from your approval email</p>
              <p style={{ fontSize: 13, color: 'rgba(232,236,240,0.4)', marginBottom: 16 }}>
                Signed in as <strong style={{ color: 'rgba(232,236,240,0.7)' }}>{member.email}</strong>
              </p>
              <form onSubmit={handleActivate}>
                {error && <div className={s.error}>{error}</div>}
                <div className={s.field}>
                  <label className={s.label}>Access Code</label>
                  <input
                    className={s.input}
                    type="text"
                    value={code}
                    onChange={e => { setCode(e.target.value); setError('') }}
                    placeholder="BWC-XXXXXXXX"
                    required
                  />
                </div>
                <button className={s.submit} type="submit" disabled={submitting}>
                  {submitting ? 'ACTIVATING...' : 'ACTIVATE'}
                </button>
                <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(232,236,240,0.5)' }}>
                  Don&apos;t have a code? <Link to="/membership" style={{ color: '#FFD700' }}>Apply for membership</Link>
                </p>
              </form>
            </>
          ) : (
            // Success!
            <div>
              <div style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 8 }}>Membership Activated!</div>
                <div style={{ fontSize: 13, color: 'rgba(232,236,240,0.7)' }}>Tier: <strong style={{ color: '#FFD700' }}>{result.tier}</strong></div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(232,236,240,0.6)', marginBottom: 16 }}>
                Your membership is now active. Welcome to the club.
              </p>
              <Link to="/dashboard" className={s.submit} style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  )
}
