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
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '160px 40px 100px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ fontFamily: "'ABC Marist', Georgia, serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#000', marginBottom: 16 }}>{title}</h1>
          <p style={{ fontFamily: "'ABC Marist', Georgia, serif", fontSize: 14, fontWeight: 400, lineHeight: 1.8, color: '#555' }}>{message}</p>
        </div>
      </div>
    </>
  )
}
