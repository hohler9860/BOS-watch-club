import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import confetti from 'canvas-confetti'
import useAuth from '../hooks/useAuth'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

const BENEFITS = [
  'MONTHLY EVENTS',
  'MEMBERS ONLY GATHERINGS',
  'EXCLUSIVE COMMUNITY',
  'NETWORKING EVENTS',
  'WHATSAPP GROUP ACCESS',
  'MEMBER DIRECTORY',
  'CITY ACCESS',
  'PRIORITY EVENT RSVP',
  'BRING ONE GUEST TO CASUAL HANGOUTS',
]

export default function WelcomePage() {
  const navigate = useNavigate()
  const { member, loading } = useAuth()

  useEffect(() => {
    // Fire confetti on mount
    const end = Date.now() + 2000
    const colors = ['#B8C4D4', '#E8ECF0', '#7850C8', '#3C8CDC']
    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !member) {
      navigate('/login', { replace: true })
    }
  }, [loading, member, navigate])

  const firstName = member?.name?.split(' ')[0] || 'Member'

  return (
    <section className={s.page}>
      <FadeIn>
        <div className={s.card} style={{ maxWidth: 560 }}>
          <div className={s.logoMark}>
            <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
          </div>

          <h1 className={s.title} style={{ fontSize: 32 }}>WELCOME, {firstName.toUpperCase()}</h1>
          <p className={s.subtitle}>YOU&apos;RE OFFICIALLY A MEMBER</p>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            fontWeight: 300,
            lineHeight: 1.8,
            color: 'rgba(232, 236, 240, 0.5)',
            margin: '0 0 24px 0',
            textAlign: 'center',
          }}>
            Welcome to BOS Watch Club. You&apos;re now part of Boston&apos;s premier community of watch collectors and enthusiasts. Here&apos;s what your membership includes:
          </p>

          <div style={{
            background: 'rgba(232, 236, 240, 0.03)',
            border: '1px solid rgba(232, 236, 240, 0.06)',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 24,
            textAlign: 'left',
          }}>
            {BENEFITS.map(b => (
              <p key={b} style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 300,
                letterSpacing: '0.05em',
                lineHeight: 1.4,
                color: 'rgba(232, 236, 240, 0.6)',
                margin: '0 0 10px 0',
                paddingLeft: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                {b}
              </p>
            ))}
          </div>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontStyle: 'italic',
            color: 'rgba(232, 236, 240, 0.5)',
            marginBottom: 24,
            textAlign: 'left',
          }}>
            Plus a welcome gift at your first event.
          </p>

          <button
            type="button"
            className={s.submit}
            onClick={() => navigate('/onboarding')}
          >
            COMPLETE YOUR PROFILE &rarr;
          </button>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'rgba(232, 236, 240, 0.3)',
            marginTop: 12,
            textAlign: 'center',
          }}>
            Set up your profile so other members can find you in the directory.
          </p>
        </div>
      </FadeIn>
    </section>
  )
}
