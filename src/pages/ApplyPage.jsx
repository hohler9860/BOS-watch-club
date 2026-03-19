import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router'
import { createWidget } from '@typeform/embed'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

const TYPEFORM_ID = '01KM1G16QKVTF5J0TBKBW9VWM9'

export default function ApplyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const containerRef = useRef(null)

  function handleEmailSubmit(e) {
    e.preventDefault()
    const val = email.toLowerCase().trim()
    if (!val) { setError('Please enter your email address.'); return }
    setError('')
    setStep('form')
  }

  useEffect(() => {
    if (step !== 'form' || !containerRef.current) return

    const widget = createWidget(TYPEFORM_ID, {
      container: containerRef.current,
      hidden: { email: email.toLowerCase().trim() },
      onSubmit: () => {
        navigate('/apply/success')
      },
    })

    return () => {
      widget.unmount()
    }
  }, [step, email, navigate])

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

            <h1 className={s.title}>APPLY TO JOIN</h1>
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
                CONTINUE &rarr;
              </button>
            </form>

            <div style={{ marginTop: 16 }}>
              <Link to="/" className={s.back}>&larr; Back to home</Link>
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
              <button type="button" className={s.back} onClick={() => setStep('email')}>
                &larr; Use a different email
              </button>
            </div>
          </>
        )}
      </FadeIn>
    </section>
  )
}
