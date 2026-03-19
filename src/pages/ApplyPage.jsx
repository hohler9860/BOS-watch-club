import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import s from './LoginPage.module.css'

export default function ApplyPage() {
  const containerRef = useRef(null)

  useEffect(() => {
    // Create the Typeform live embed div
    const tfDiv = document.createElement('div')
    tfDiv.setAttribute('data-tf-live', '01KM1G16QKVTF5J0TBKBW9VWM9')
    containerRef.current?.appendChild(tfDiv)

    // Load the embed script after the div is in the DOM
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
      </Helmet>
      <h1 className={s.title}>JOIN THE WAITLIST</h1>
      <p className={s.subtitle}>Founding membership is full. Fill out the form below and we'll reach out when new memberships open.</p>
      <div
        ref={containerRef}
        style={{ width: '100%', maxWidth: 680, minHeight: 500, margin: '0 auto' }}
      />
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/" className={s.back}>&larr; Back to home</Link>
      </div>
    </section>
  )
}
