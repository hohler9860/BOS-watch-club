import { useState } from 'react'
import useAdminAuth from './AdminAuth'
import s from './admin.module.css'

export default function AdminLogin() {
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!login(email, password)) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className={s.loginPage}>
      <form className={s.loginCard} onSubmit={handleSubmit}>
        <div className={s.loginTitle}>Admin Panel</div>
        <div className={s.loginSubtitle}>BOS Watch Club — Internal</div>
        {error && <div className={s.loginError}>{error}</div>}
        <div className={s.formGroup}>
          <label className={s.formLabel}>Email</label>
          <input className={s.formInput} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Password</label>
          <input className={s.formInput} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className={`${s.btn} ${s.btnPrimary} ${s.btnBlock}`} type="submit">Sign In</button>
      </form>
    </div>
  )
}
