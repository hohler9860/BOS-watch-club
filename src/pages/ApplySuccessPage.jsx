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
            We got your submission. Look out for an email about your application.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link to="/" className={s.back}>&larr; Back to home</Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
