import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ApplySuccessPage() {
  return (
    <section className={s.page}>
      <Helmet>
        <title>Application Received — BOS Watch Club</title>
      </Helmet>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>
          <h1 className={s.title}>APPLICATION RECEIVED</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 300, lineHeight: 1.8, color: 'rgba(232, 236, 240, 0.5)', maxWidth: 380, margin: '0 auto 16px', textAlign: 'center' }}>
            Thank you for applying. Our founding membership is currently full, so new members are being added from the waitlist as spots open up.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 300, lineHeight: 1.8, color: 'rgba(232, 236, 240, 0.5)', maxWidth: 380, margin: '0 auto 16px', textAlign: 'center' }}>
            If approved, you&apos;ll receive an email with your access code and instructions to activate your account and set your password.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 300, lineHeight: 1.8, color: 'rgba(232, 236, 240, 0.35)', maxWidth: 380, margin: '0 auto', textAlign: 'center' }}>
            Follow us on Instagram for event updates and community highlights in the meantime.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link to="/" className={s.back}>&larr; Back to home</Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
