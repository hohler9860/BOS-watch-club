import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { member, loading, signInWithGoogle } = useAuth()
  const tierParam = searchParams.get('tier')

  // Once auth resolves, route to the right place
  useEffect(() => {
    if (!loading && member) {
      if (roleMeetsMinimum(member.role, 'member')) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate(tierParam ? `/upgrade?tier=${tierParam}` : '/upgrade', { replace: true })
      }
    }
  }, [member, loading, navigate, tierParam])

  async function handleGoogle() {
    try {
      await signInWithGoogle()
      // Browser redirects to Google — nothing else to do here
    } catch {
      // signInWithGoogle rarely throws; OAuth errors come back via URL
    }
  }

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>

          <h1 className={s.title}>BOSTON WATCH CLUB</h1>

          {tierParam && (
            <p className={s.tierBadge}>
              Joining as <strong>{decodeURIComponent(tierParam)}</strong>
            </p>
          )}

          <p className={s.hint}>
            New member? Your account is created automatically.<br />
            Already a member? You&apos;ll be signed right back in.
          </p>

          <button type="button" className={s.googleBtn} onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <Link to="/" className={s.back} style={{ marginTop: 20 }}>&larr; Back to home</Link>
        </div>
      </FadeIn>
    </section>
  )
}
