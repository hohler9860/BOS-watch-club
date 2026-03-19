import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ApplyPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const val = email.toLowerCase().trim()
    if (!val) { setError('Please enter your email address.'); return }

    setSubmitting(true)
    setError('')

    try {
      // Insert into submissions table (application)
      const { error: insertErr } = await supabase
        .from('submissions')
        .insert({ first_name: '', last_name: '', email: val, status: 'pending' })

      if (insertErr) {
        // Duplicate email — treat as already applied
        if (insertErr.code === '23505') {
          navigate('/apply/success')
          return
        }
        throw new Error(insertErr.message)
      }

      navigate('/apply/success')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={s.page}>
      <Helmet>
        <title>Apply — BOS Watch Club</title>
        <meta name="description" content="Apply to join Boston Watch Club. Members are accepted by application only." />
      </Helmet>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>

          <h1 className={s.title}>APPLY TO JOIN</h1>
          <p className={s.subtitle}>MEMBERS ARE ACCEPTED BY APPLICATION ONLY</p>

          <form onSubmit={handleSubmit} className={s.form}>
            <div className={s.field}>
              <label className={s.label}>EMAIL</label>
              <input
                type="email"
                className={s.input}
                value={email}
                autoFocus
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {error && <p className={s.error}>{error}</p>}
            <div className={s.tooltip} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <button type="submit" className={s.submit} disabled={submitting}>
                {submitting ? 'SUBMITTING...' : 'APPLY NOW →'}
              </button>
              <span className={s.tooltipText} style={{ bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}>
                Members-only access: Enter your email to apply. Once approved, you&apos;ll get an email with a link, access code, and steps to create your password.
              </span>
            </div>
          </form>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', color: '#4A5568', textTransform: 'uppercase', marginTop: 16 }}>
            Members are accepted by application only
          </p>

          <button
            type="button"
            className={s.back}
            onClick={() => navigate('/login')}
            style={{ marginTop: 16, textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Already accepted? Sign in
          </button>

          <div style={{ marginTop: 8 }}>
            <Link to="/" className={s.back}>&larr; Back to home</Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
