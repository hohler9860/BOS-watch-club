import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import styles from './LoginPage.module.css'

// Local auth helpers — swap for API calls when backend is ready
function getUsers() {
  return JSON.parse(localStorage.getItem('bwc_users') || '[]')
}
function saveUsers(users) {
  localStorage.setItem('bwc_users', JSON.stringify(users))
}
function setSession(user) {
  localStorage.setItem('bwc_session', JSON.stringify(user))
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // login | signup
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setError('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const users = getUsers()

    if (mode === 'signup') {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError('All fields are required.')
        return
      }
      if (users.find((u) => u.email === form.email.toLowerCase())) {
        setError('An account with this email already exists.')
        return
      }
      const newUser = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password, // plaintext for local only — hash on backend
        rsvps: [],
        createdAt: new Date().toISOString(),
      }
      saveUsers([...users, newUser])
      setSession({ id: newUser.id, name: newUser.name, email: newUser.email })
      navigate('/dashboard')
    } else {
      const user = users.find(
        (u) => u.email === form.email.toLowerCase().trim() && u.password === form.password
      )
      if (!user) {
        setError('Invalid email or password.')
        return
      }
      setSession({ id: user.id, name: user.name, email: user.email })
      navigate('/dashboard')
    }
  }

  return (
    <section className={styles.page}>
      <FadeIn>
        <div className={styles.card}>
          <div className={styles.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>
          <h1 className={styles.title}>
            {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login' ? 'MEMBER LOGIN' : 'JOIN THE CLUB'}
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'signup' && (
              <div className={styles.field}>
                <label className={styles.label}>FULL NAME</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>EMAIL</label>
              <input
                type="email"
                className={styles.input}
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>PASSWORD</label>
              <input
                type="password"
                className={styles.input}
                value={form.password}
                onChange={update('password')}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit}>
              {mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className={styles.toggle}>
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button type="button" className={styles.toggleBtn} onClick={() => { setMode('signup'); setError('') }}>
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" className={styles.toggleBtn} onClick={() => { setMode('login'); setError('') }}>
                  Log in
                </button>
              </p>
            )}
          </div>

          <Link to="/" className={styles.back}>&larr; Back to home</Link>
        </div>
      </FadeIn>
    </section>
  )
}
