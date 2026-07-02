import { z } from 'zod'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { guestInviteEmail } from '../emails/templates.js'
import { rateLimit } from './_lib/rateLimit.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'
const REPLY_TO = 'boswatchclub@gmail.com'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const SITE = process.env.SITE_URL || 'https://boswatchclub.com'

export default async function handler(req, res) {
  // GET = guest accept flow (merged from guest-accept.js)
  if (req.method === 'GET') {
    const guestId = req.query.id
    if (!guestId) return res.status(400).send('Missing guest ID')

    try {
      const { data: guest, error: fetchErr } = await supabase
        .from('event_guests')
        .select('id, status, name, event_id')
        .eq('id', guestId)
        .single()

      if (fetchErr || !guest) {
        return res.redirect(`${SITE}/guest-response?status=not-found`)
      }

      if (guest.status === 'accepted') {
        return res.redirect(`${SITE}/guest-response?status=already-accepted&name=${encodeURIComponent(guest.name)}`)
      }

      const { error: updateErr } = await supabase
        .from('event_guests')
        .update({ status: 'accepted' })
        .eq('id', guestId)

      if (updateErr) throw updateErr

      return res.redirect(`${SITE}/guest-response?status=accepted&name=${encodeURIComponent(guest.name)}`)
    } catch (err) {
      console.error('Guest accept failed:', err)
      return res.status(500).send('Something went wrong')
    }
  }

  // POST = send guest invitation email
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { limited } = rateLimit(req, { window: 60_000, max: 10 })
  if (limited) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  // SECURITY: caller must be signed in, and may only trigger the invite for a
  // guest THEY invited (admins may trigger any). Guest, event, and inviter
  // details all come from the database — the body carries only the guest id,
  // so no email content is caller-controlled.
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization' })
  }

  const parsed = z.object({
    guestId: z.string().min(1),
  }).safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' })
  }

  const { guestId } = parsed.data

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7))
    if (authErr || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    const { data: guest, error: guestErr } = await supabase
      .from('event_guests')
      .select('id, name, email, event_id, invited_by')
      .eq('id', guestId)
      .single()
    if (guestErr || !guest) return res.status(404).json({ error: 'Guest not found' })

    if (guest.invited_by !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      if (!profile?.is_admin) {
        return res.status(403).json({ error: 'You can only send invites for your own guests' })
      }
    }

    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('name, venue, date, time, dress_code')
      .eq('id', guest.event_id)
      .maybeSingle()
    if (eventErr) throw eventErr
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const { data: inviter } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', guest.invited_by)
      .maybeSingle()

    const html = guestInviteEmail({
      guestName: guest.name,
      memberName: inviter?.name || 'BOS Watch Club',
      eventName: event.name,
      venue: event.venue,
      date: event.date,
      time: event.time,
      dressCode: event.dress_code,
      guestId: guest.id,
    })

    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: guest.email,
      subject: `You're Invited — ${event.name}`,
      html,
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Guest notification failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
