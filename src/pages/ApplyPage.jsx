import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function ApplyPage() {
  const containerRef = useRef(null)

  useEffect(() => {
    const tfDiv = document.createElement('div')
    tfDiv.setAttribute('data-tf-live', '01KM1G16QKVTF5J0TBKBW9VWM9')
    containerRef.current?.appendChild(tfDiv)

    const script = document.createElement('script')
    script.src = '//embed.typeform.com/next/embed.js'
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <section className={s.page}>
      <Helmet>
        <title>Apply — BOS Watch Club</title>
        <meta name="description" content="Apply to join Boston Watch Club. Members are accepted by application only." />
      </Helmet>
      <FadeIn>
        <div
          ref={containerRef}
          style={{ width: '100%', maxWidth: 680, minHeight: 500, margin: '0 auto' }}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/" className={s.back}>&larr; Back to home</Link>
        </div>
      </FadeIn>
    </section>
  )
}
