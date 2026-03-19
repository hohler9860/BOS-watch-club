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
          <p className={s.subtitle} style={{ lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
            We&apos;ll review your application and be in touch. Once approved, you&apos;ll receive an email with a link, access code, and steps to create your password.
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(232, 236, 240, 0.35)', marginTop: 20, lineHeight: 1.7 }}>
            Follow us on Instagram for event updates and community highlights.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link to="/" className={s.back}>&larr; Back to home</Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
