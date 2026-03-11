import { useState } from 'react'
import { Link } from 'react-router'
import { VALID_ACCESS_CODES } from '../data/adminData'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ActivatePage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function handleActivate(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    const trimmed = code.trim().toUpperCase()
    const found = VALID_ACCESS_CODES.find(c => c.code === trimmed)

    if (!found) {
      setError('Invalid access code. Please check your invitation email.')
      return
    }
    if (found.used) {
      setError('This access code has already been used.')
      return
    }

    // Mark as used (local state only — TODO: Supabase update)
    found.used = true
    setResult({ code: found.code, tier: found.tier })
  }

  return (
    <div className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <h2 className={s.title}>Activate Membership</h2>
          <p className={s.subtitle}>Enter the access code from your approval email</p>

          {!result ? (
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
              <button className={s.submit} type="submit">Activate</button>
              <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(232,236,240,0.5)' }}>
                Already activated? <Link to="/login" style={{ color: '#FFD700' }}>Sign in here</Link>
              </p>
            </form>
          ) : (
            <div>
              <div style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 8 }}>Membership Activated!</div>
                <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: 8 }}>{result.code}</div>
                <div style={{ fontSize: 13, color: 'rgba(232,236,240,0.7)' }}>Tier: <strong style={{ color: '#FFD700' }}>{result.tier}</strong></div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(232,236,240,0.6)', marginBottom: 16 }}>
                Your membership is now active. Sign in to access the member dashboard.
              </p>
              <Link to="/login" className={s.submit} style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                Go to Sign In
              </Link>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  )
}
