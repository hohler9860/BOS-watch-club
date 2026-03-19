import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ApplySuccessPage() {
  return (
    <section className={s.page}>
      <Helmet>
        <title>Waitlist — BOS Watch Club</title>
      </Helmet>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>
          <h1 className={s.title}>YOU'RE ON THE WAITLIST</h1>
          <p className={s.subtitle} style={{ lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
            We'll reach out when new memberships become available. Follow us on Instagram for event updates and community highlights.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link to="/" className={s.back}>&larr; Back to home</Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
