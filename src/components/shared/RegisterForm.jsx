import { useState } from 'react'
import styles from './RegisterForm.module.css'

export default function RegisterForm({ tier = '', variant = 'dark' }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    instagram: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const isDark = variant === 'dark'
  const isModal = variant === 'modal'

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const data = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      instagram: formData.instagram,
      tier,
    }

    const submissions = JSON.parse(localStorage.getItem('bwc_submissions') || '[]')
    submissions.push({ ...data, timestamp: new Date().toISOString() })
    localStorage.setItem('bwc_submissions', JSON.stringify(submissions))

    setSubmitted(true)
  }

  const variantClass = isModal ? styles.modal : isDark ? styles.dark : ''

  return (
    <div className={`${styles.wrapper} ${variantClass}`}>
      <p className={styles.eyebrow}>FOUNDING MEMBERSHIP</p>
      <h2 className={styles.title}>BECOME A FOUNDER</h2>
      <p className={styles.subtitle}>
        {tier
          ? `APPLY FOR ${tier} MEMBERSHIP. $40 APPLICATION FEE TO ENSURE ONLY SERIOUS COLLECTORS JOIN.`
          : 'APPLY TO BECOME A FOUNDING MEMBER. $40 APPLICATION FEE TO ENSURE ONLY SERIOUS COLLECTORS JOIN.'}
      </p>

      {!submitted ? (
        <>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <input
                type="text"
                name="firstName"
                placeholder="FIRST NAME"
                required
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="lastName"
                placeholder="LAST NAME"
                required
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="EMAIL ADDRESS"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="instagram"
              placeholder="@username"
              className={styles.instagramInput}
              autoComplete="off"
              value={formData.instagram}
              onChange={handleChange}
            />
            <button type="submit" className={styles.submit}>
              <span>APPLY NOW</span>
              <span className={styles.arrow}>&rarr;</span>
            </button>
          </form>
          <p className={styles.note}>NO SPAM, EVER. UNSUBSCRIBE ANYTIME.</p>
        </>
      ) : (
        <div className={styles.success}>
          <div className={styles.successIcon}>&#10003;</div>
          <p className={styles.successTitle}>WELCOME TO THE CLUB.</p>
          <p className={styles.successSub}>WE'LL BE IN TOUCH SOON.</p>
        </div>
      )}
    </div>
  )
}
