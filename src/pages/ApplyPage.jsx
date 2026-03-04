import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import styles from './ApplyPage.module.css'

const TIERS = [
  { id: 'enthusiast', name: 'ENTHUSIAST', price: '$50/yr', desc: 'Casual hangs, community access, and insider updates.' },
  { id: 'collector', name: 'COLLECTOR', price: '$1,125/yr', desc: 'Brand-sponsored events, priority RSVP, and welcome gift.' },
  { id: 'patron', name: 'PATRON', price: '$2,250/yr', desc: 'CEO dinners, travel experiences, and personalized membership.' },
  { id: 'student', name: 'STUDENT', price: '$30/yr', desc: 'Full Enthusiast access with a valid .edu email.' },
  { id: 'womens-circle', name: "WOMEN\u2019S CIRCLE", price: 'Free first year', desc: 'Collector-level access plus women-focused events and community.' },
]

export default function ApplyPage() {
  const [searchParams] = useSearchParams()
  const tierParam = searchParams.get('tier')

  const preselected = useMemo(() => TIERS.find(t => t.id === tierParam), [tierParam])

  const [selectedTier, setSelectedTier] = useState(preselected || null)
  const [tierLocked, setTierLocked] = useState(!!preselected)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    instagram: '',
    wristCheck: '',
  })

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleTierSelect(tier) {
    setSelectedTier(tier)
    setTierLocked(true)
  }

  function handleChangeTier(e) {
    e.preventDefault()
    setTierLocked(false)
    setSelectedTier(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const data = {
      ...formData,
      tier: selectedTier?.id,
      timestamp: new Date().toISOString(),
    }
    console.log('Application submitted:', data)
    const submissions = JSON.parse(localStorage.getItem('bwc_submissions') || '[]')
    submissions.push(data)
    localStorage.setItem('bwc_submissions', JSON.stringify(submissions))
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
          <div className={styles.card}>
            {submitted ? (
              <div className={styles.confirmation}>
                <div className={styles.checkIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h2 className={styles.confirmTitle}>Application Received</h2>
                <p className={styles.confirmBody}>
                  Thanks {formData.firstName}. We review every application personally and you&rsquo;ll
                  hear from us within 48 hours. In the meantime, follow us on Instagram for the latest.
                </p>
                <a
                  href="https://instagram.com/boswatchclub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.igLink}
                >
                  @BOSWatchClub
                </a>
                <p className={styles.confirmEmail}>
                  Questions? Email hello@boswatchclub.com
                </p>
              </div>
            ) : (
              <>
                {/* Tier selection / display */}
                {tierLocked && selectedTier ? (
                  <div className={styles.tierBanner}>
                    <div className={styles.tierBannerInfo}>
                      <span className={styles.tierBannerName}>{selectedTier.name}</span>
                      <span className={styles.tierBannerPrice}>{selectedTier.price}</span>
                    </div>
                    <button className={styles.tierChange} onClick={handleChangeTier}>
                      Change &rarr;
                    </button>
                  </div>
                ) : (
                  <div className={styles.tierSelect}>
                    <p className={styles.tierQuestion}>Which tier interests you?</p>
                    <div className={styles.tierOptions}>
                      {TIERS.map(tier => (
                        <button
                          key={tier.id}
                          className={`${styles.tierOption} ${selectedTier?.id === tier.id ? styles.tierOptionActive : ''}`}
                          onClick={() => handleTierSelect(tier)}
                        >
                          <div className={styles.tierOptionTop}>
                            <span className={styles.tierOptionName}>{tier.name}</span>
                            <span className={styles.tierOptionPrice}>{tier.price}</span>
                          </div>
                          <p className={styles.tierOptionDesc}>{tier.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form fields — only show when tier is selected */}
                {tierLocked && selectedTier && (
                  <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="firstName">FIRST NAME</label>
                        <input
                          className={styles.input}
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="lastName">LAST NAME</label>
                        <input
                          className={styles.input}
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="email">EMAIL ADDRESS</label>
                      <input
                        className={styles.input}
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="phone">PHONE NUMBER</label>
                      <input
                        className={styles.input}
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="instagram">INSTAGRAM HANDLE</label>
                      <div className={styles.igInputWrap}>
                        <span className={styles.igPrefix}>@</span>
                        <input
                          className={`${styles.input} ${styles.igInput}`}
                          id="instagram"
                          name="instagram"
                          type="text"
                          autoComplete="off"
                          placeholder="yourusername"
                          value={formData.instagram}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="wristCheck">
                        WHAT&rsquo;S ON YOUR WRIST TODAY, OR WHAT&rsquo;S NEXT ON YOUR LIST?
                      </label>
                      <textarea
                        className={styles.textarea}
                        id="wristCheck"
                        name="wristCheck"
                        required
                        rows="3"
                        placeholder="e.g. Wearing my Seiko Presage, eyeing a BB58..."
                        value={formData.wristCheck}
                        onChange={handleChange}
                      />
                    </div>
                    <button type="submit" className={styles.submit}>
                      SUBMIT APPLICATION &rarr;
                    </button>
                    <p className={styles.submitNote}>
                      No payment required to apply. Application fee and dues are collected upon acceptance.
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
