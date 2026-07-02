import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { rsvpConfirmEmail } from '../emails/templates.js'
import { rateLimit } from './_lib/rateLimit.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'
const REPLY_TO = 'boswatchclub@gmail.com'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { limited } = rateLimit(req, { window: 60_000, max: 10 })
  if (limited) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  // SECURITY: the recipient is derived from the caller's own session token,
  // never from the request body — otherwise anyone holding a member's user id
  // could push arbitrary email content to them.
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization' })
  }

  const parsed = z.object({
    eventId: z.string().min(1),
  }).safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' })
  }

  const { eventId } = parsed.data

  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser(authHeader.slice(7))
    if (userErr || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    // Event details come from the database, not the request body.
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('name, venue, date, time, dress_code')
      .eq('id', eventId)
      .maybeSingle()
    if (eventErr) throw eventErr
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .maybeSingle()

    const email = user.email
    const firstName = profile?.name || 'Member'
    const eventName = event.name

    const html = rsvpConfirmEmail({
      firstName,
      eventName,
      venue: event.venue,
      date: event.date,
      time: event.time,
      dressCode: event.dress_code,
    })

    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: email,
      subject: `RSVP Confirmed — ${eventName}`,
      html,
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('RSVP notification failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
