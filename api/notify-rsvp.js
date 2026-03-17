import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { rsvpConfirmEmail } from '../emails/templates.js'

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

  const parsed = z.object({
    userId: z.string().uuid(),
    eventId: z.string().min(1),
    eventName: z.string().optional(),
    venue: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    dressCode: z.string().optional(),
  }).safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' })
  }

  const { userId, eventId, eventName, venue, date, time, dressCode } = parsed.data

  try {
    const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(userId)
    if (userErr) throw userErr

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .maybeSingle()

    const email = user.email
    const firstName = profile?.name?.split(' ')[0] || 'Member'

    const html = rsvpConfirmEmail({ firstName, eventName, venue, date, time, dressCode })

    await resend.emails.send({
      from: FROM,
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
