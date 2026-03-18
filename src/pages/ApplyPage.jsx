import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ApplyPage() {
  useEffect(() => {
    // Load the Typeform embed script
    const script = document.createElement('script')
    script.src = '//embed.typeform.com/next/embed.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <section className={s.page}>
      <Helmet>
        <title>Apply — BOS Watch Club</title>
      </Helmet>
      <FadeIn>
        <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
          <div data-tf-live="01KM1G16QKVTF5J0TBKBW9VWM9" />
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/" className={s.back}>&larr; Back to home</Link>
        </div>
      </FadeIn>
    </section>
  )
}
