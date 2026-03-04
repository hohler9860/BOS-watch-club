import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import styles from './ApplyPage.module.css'

export default function ApplyPage() {
  const [searchParams] = useSearchParams()
  const tierParam = searchParams.get('tier')
  const embedRef = useRef(null)

  useEffect(() => {
    const id = 'typeform-embed-script'
    if (!document.getElementById(id)) {
      const script = document.createElement('script')
      script.id = id
      script.src = '//embed.typeform.com/next/embed.js'
      script.async = true
      document.body.appendChild(script)
    }
    return () => {
      const script = document.getElementById(id)
      if (script) script.remove()
    }
  }, [])

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <FadeIn>
          <div className={styles.header}>
            <p className={styles.eyebrow}>FOUNDING MEMBERSHIP</p>
            <h1 className={styles.title}>Apply to Join</h1>
            <p className={styles.headerSub}>
              Every application is personally reviewed. You&rsquo;ll hear from us within 48 hours.
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <div className={styles.embedContainer}>
            <div
              ref={embedRef}
              data-tf-live="01KJVWE9BDC8VDCP9WNX20QMMC"
              {...(tierParam ? { 'data-tf-hidden': `tier=${tierParam}` } : {})}
              className={styles.embed}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
