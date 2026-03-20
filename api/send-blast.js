import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { verifyAdmin } from './_lib/adminAuth.js'
import { customBlastEmail } from '../emails/templates.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req)
  if (auth.error) return res.status(auth.status).json({ error: auth.error })

  const { subject, preview, heading, body, buttonText, buttonHref, image, audience, audienceValue } = req.body

  if (!subject || !heading || !body) {
    return res.status(400).json({ error: 'subject, heading, and body are required' })
  }
  if (!audience || !['all', 'tier', 'event'].includes(audience)) {
    return res.status(400).json({ error: 'audience must be "all", "tier", or "event"' })
  }
  if (audience === 'tier' && !audienceValue) {
    return res.status(400).json({ error: 'audienceValue (tier) is required when audience is "tier"' })
  }
  if (audience === 'event' && !audienceValue) {
    return res.status(400).json({ error: 'audienceValue (event ID) is required when audience is "event"' })
  }

  try {
    let memberIds = []

    if (audience === 'event') {
      // Get users who RSVPed to this event
      const { data: rsvps, error: rsvpErr } = await supabase
        .from('rsvps')
        .select('user_id')
        .eq('event_id', audienceValue)
      if (rsvpErr) throw rsvpErr
      memberIds = (rsvps || []).map(r => r.user_id)
    } else {
      // Get all profiles, optionally filtered by tier
      let query = supabase.from('profiles').select('id, tier')
      if (audience === 'tier') {
        query = query.eq('tier', audienceValue)
      }
      const { data: profiles, error: profileErr } = await query
      if (profileErr) throw profileErr
      memberIds = (profiles || []).map(p => p.id)
    }

    if (memberIds.length === 0) {
      return res.status(200).json({ success: true, sent: 0, errors: [] })
    }

    // Map user IDs to emails
    const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (usersErr) throw usersErr

    const emailMap = {}
    for (const u of users) {
      emailMap[u.id] = u.email
    }

    const html = customBlastEmail({ preview, heading, body, buttonText, buttonHref, image })

    let sent = 0
    const errors = []

    for (const id of memberIds) {
      const email = emailMap[id]
      if (!email) continue

      try {
        await resend.emails.send({ from: FROM, to: email, subject, html })
        sent++
      } catch (err) {
        errors.push({ email, error: err.message })
      }
    }

    return res.status(200).json({ success: true, sent, errors })
  } catch (err) {
    console.error('send-blast error:', err)
    return res.status(500).json({ error: err.message })
  }
}
