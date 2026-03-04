import { useState, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { setApplyCallback } = useOutletContext()

  useEffect(() => {
    setApplyCallback(() => () => {
      navigate('/membership')
    })
    return () => setApplyCallback(null)
  }, [setApplyCallback, navigate])

  function handleSubmit(e) {
    e.preventDefault()
  }

  function handleApply() {
    navigate('/membership')
  }

  return (
    <section className={styles.page}>
      <FadeIn>
        <div className={styles.card}>
          <h1 className={styles.title}>MEMBER LOGIN</h1>
          <p className={styles.subtitle}>ACCESS YOUR PORTAL</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">EMAIL</label>
              <input
                className={styles.input}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">PASSWORD</label>
              <input
                className={styles.input}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button className={styles.submit} type="submit">LOG IN</button>
          </form>
          <div className={styles.divider}>
            <span>OR</span>
          </div>
          <p className={styles.noAccount}>DON&rsquo;T HAVE AN ACCOUNT?</p>
          <button className={styles.apply} onClick={handleApply}>APPLY NOW &rarr;</button>
        </div>
      </FadeIn>
    </section>
  )
}
