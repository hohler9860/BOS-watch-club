import { useSearchParams } from 'react-router'
import { Helmet } from 'react-helmet-async'

export default function GuestResponsePage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
  const name = searchParams.get('name') || 'Guest'

  let title, message
  if (status === 'accepted') {
    title = "YOU'RE IN!"
    message = `Thanks ${name}, your spot is confirmed. We look forward to seeing you.`
  } else if (status === 'already-accepted') {
    title = 'ALREADY CONFIRMED'
    message = `${name}, you've already accepted this invitation. See you there!`
  } else {
    title = 'INVITATION NOT FOUND'
    message = 'This invitation may have expired or already been used.'
  }

  return (
    <>
      <Helmet><title>Guest RSVP — Boston Watch Club</title></Helmet>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, letterSpacing: '0.04em', color: '#E8ECF0', marginBottom: 16 }}>{title}</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 300, lineHeight: 1.8, color: 'rgba(232,236,240,0.6)' }}>{message}</p>
        </div>
      </div>
    </>
  )
}
