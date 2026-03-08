import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { member, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth()

  // Invite token from URL (?invite=abc123)
  const inviteToken = searchParams.get('invite')
  const [invite, setInvite] = useState(null)         // validated invite data
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken)
  const [inviteError, setInviteError] = useState('')

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && member) {
      navigate('/dashboard')
    }
  }, [member, loading, navigate])

  // Validate invite token on mount
  useEffect(() => {
    if (!inviteToken || !supabase) {
      setInviteLoading(false)
      return
    }

    async function validate() {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('token', inviteToken)
        .eq('used', false)
        .single()

      if (error || !data) {
        setInviteError('This invite link is invalid or has already been used.')
      } else {
        setInvite(data)
        setForm((prev) => ({ ...prev, email: data.email, tier: data.tier }))
        setMode('signup')
      }
      setInviteLoading(false)
    }

    validate()
  }, [inviteToken])

  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [form, setForm] = useState({ name: '', email: '', password: '', tier: 'ENTHUSIAST' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    // Don't let invited users change their email
    if (field === 'email' && invite) return () => {}
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setError('')
      setSuccess('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'forgot') {
        if (!form.email.trim()) {
          setError('Please enter your email address.')
          setSubmitting(false)
          return
        }
        await resetPassword(form.email.toLowerCase().trim())
        setSuccess('Check your email for a password reset link.')
        setSubmitting(false)
        return
      }

      if (mode === 'signup') {
        if (!invite) {
          setError('A valid invite link is required to create an account.')
          setSubmitting(false)
          return
        }
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
          setError('All fields are required.')
          setSubmitting(false)
          return
        }
        await signUp({
          email: form.email.toLowerCase().trim(),
          password: form.password,
          name: form.name.trim(),
          tier: invite.tier,
        })

        // Mark invite as used
        if (supabase) {
          await supabase
            .from('invites')
            .update({ used: true })
            .eq('id', invite.id)
        }

        navigate('/dashboard')
      } else {
        await signIn({
          email: form.email.toLowerCase().trim(),
          password: form.password,
        })
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
    }
  }

  function getTitle() {
    if (mode === 'forgot') return 'RESET PASSWORD'
    if (mode === 'signup') return 'CREATE ACCOUNT'
    return 'WELCOME BACK'
  }

  function getSubtitle() {
    if (mode === 'forgot') return 'ENTER YOUR EMAIL'
    if (mode === 'signup') return 'YOU\u2019VE BEEN INVITED'
    return 'MEMBER LOGIN'
  }

  // Show loading while validating invite
  if (inviteLoading) {
    return (
      <section className={s.page}>
        <FadeIn>
          <div className={s.card}>
            <div className={s.logoMark}>
              <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
            </div>
            <h1 className={s.title}>VERIFYING INVITE</h1>
            <p className={s.subtitle}>PLEASE WAIT...</p>
          </div>
        </FadeIn>
      </section>
    )
  }

  // Show error for invalid/used invite tokens
  if (inviteToken && inviteError) {
    return (
      <section className={s.page}>
        <FadeIn>
          <div className={s.card}>
            <div className={s.logoMark}>
              <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
            </div>
            <h1 className={s.title}>INVITE INVALID</h1>
            <p className={s.inviteMsg}>{inviteError}</p>
            <p className={s.inviteMsg}>
              If you believe this is a mistake, please contact the club.
            </p>
            <Link to="/login" className={s.toggleBtn}>Back to login</Link>
            <br />
            <Link to="/" className={s.back}>&larr; Back to home</Link>
          </div>
        </FadeIn>
      </section>
    )
  }

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>
          <h1 className={s.title}>{getTitle()}</h1>
          <p className={s.subtitle}>{getSubtitle()}</p>

          {/* Google Sign-In (only for login, not signup or forgot) */}
          {mode === 'login' && (
            <>
              <button type="button" className={s.googleBtn} onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className={s.divider}>
                <span className={s.dividerLine} />
                <span className={s.dividerText}>or</span>
                <span className={s.dividerLine} />
              </div>
            </>
          )}

          {/* Invite tier badge for signup */}
          {mode === 'signup' && invite && (
            <div className={s.inviteBadge}>
              <span className={s.inviteBadgeLabel}>INVITED AS</span>
              <span className={s.inviteBadgeTier}>{invite.tier}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={s.form}>
            {mode === 'signup' && (
              <div className={s.field}>
                <label className={s.label}>FULL NAME</label>
                <input
                  type="text"
                  className={s.input}
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div className={s.field}>
              <label className={s.label}>EMAIL</label>
              <input
                type="email"
                className={`${s.input} ${invite ? s.inputLocked : ''}`}
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                autoComplete="email"
                readOnly={!!invite}
              />
            </div>
            {mode !== 'forgot' && (
              <div className={s.field}>
                <label className={s.label}>PASSWORD</label>
                <input
                  type="password"
                  className={s.input}
                  value={form.password}
                  onChange={update('password')}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                {mode === 'login' && (
                  <button
                    type="button"
                    className={s.forgotBtn}
                    onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {error && <p className={s.error}>{error}</p>}
            {success && <p className={s.success}>{success}</p>}

            <button type="submit" className={s.submit} disabled={submitting}>
              {submitting
                ? 'PLEASE WAIT...'
                : mode === 'forgot'
                  ? 'SEND RESET LINK'
                  : mode === 'login'
                    ? 'LOG IN'
                    : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className={s.toggle}>
            {mode === 'forgot' ? (
              <p>
                Remember your password?{' '}
                <button type="button" className={s.toggleBtn} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
                  Back to login
                </button>
              </p>
            ) : mode === 'login' && !invite ? (
              <p className={s.applyNote}>
                Don&apos;t have an account?{' '}
                <a href="https://form.typeform.com/to/ntT8GKqz" target="_blank" rel="noopener noreferrer" className={s.toggleBtn}>
                  Apply for membership
                </a>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button type="button" className={s.toggleBtn} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
                  Log in
                </button>
              </p>
            ) : null}
          </div>

          <Link to="/" className={s.back}>&larr; Back to home</Link>
        </div>
      </FadeIn>
    </section>
  )
}
