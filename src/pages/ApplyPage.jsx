import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

const TYPEFORM_ID = '01KM1G16QKVTF5J0TBKBW9VWM9'

export default function ApplyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useRef(null)

  async function handleEmailSubmit(e) {
    e.preventDefault()
    const val = email.toLowerCase().trim()
    if (!val) { setError('Please enter your email address.'); return }
    setError('')

    setStep('form')
  }

  useEffect(() => {
    if (step !== 'form' || !containerRef.current) return

    const trimmedEmail = email.toLowerCase().trim()

    const tfDiv = document.createElement('div')
    tfDiv.setAttribute('data-tf-live', TYPEFORM_ID)
    tfDiv.setAttribute('data-tf-hidden', `email=${encodeURIComponent(trimmedEmail)}`)
    containerRef.current.appendChild(tfDiv)

    const script = document.createElement('script')
    script.src = '//embed.typeform.com/next/embed.js'
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [step, email])

  return (
    <section className={s.page}>
      <Helmet>
        <title>Apply — BOS Watch Club</title>
        <meta name="description" content="Apply to join Boston Watch Club. Members are accepted by application only." />
      </Helmet>
      <FadeIn>
        {step === 'email' && (
          <div className={s.card}>
            <div className={s.logoMark}>
              <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              <h1 className={s.title} style={{ marginBottom: 0 }}>APPLY TO JOIN</h1>
              <div className={s.tooltip}>
                <span className={s.tooltipIcon} style={{ fontSize: 14 }}>&#9432;</span>
                <span className={s.tooltipText}>
                  Enter your email below, then you&apos;ll be able to fill out the membership application.
                </span>
              </div>
            </div>
            <p className={s.subtitle}>MEMBERS ARE ACCEPTED BY APPLICATION ONLY</p>

            <form onSubmit={handleEmailSubmit} className={s.form}>
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
              <button type="submit" className={s.submit}>
                CONTINUE
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 16 }}>
              <Link to="/login?step=email" className={s.back}>Go to login</Link>
              <Link to="/" className={s.back}>Back to home</Link>
            </div>
          </div>
        )}

        {step === 'form' && (
          <>
            <div
              ref={containerRef}
              style={{ width: '100%', maxWidth: 680, minHeight: 500, margin: '0 auto' }}
            />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                type="button"
                className={s.submit}
                style={{ padding: '13px 36px' }}
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true)
                  const val = email.toLowerCase().trim()
                  try {
                    await supabase.from('submissions').insert({
                      first_name: '',
                      last_name: '',
                      email: val,
                      status: 'pending',
                    })
                  } catch {
                    // Ignore duplicates
                  }
                  fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'applicationReceived', to: val, data: {} }),
                  }).catch(() => {})
                  navigate('/apply/success')
                }}
              >
                {submitting ? 'SUBMITTING...' : "I'VE SUBMITTED MY APPLICATION \u2192"}
              </button>
              <div style={{ marginTop: 12 }}>
                <button type="button" className={s.back} onClick={() => setStep('email')}>
                  Use a different email
                </button>
              </div>
            </div>
          </>
        )}
      </FadeIn>
    </section>
  )
}
