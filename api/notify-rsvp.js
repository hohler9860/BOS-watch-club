import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createElement } from 'react'
import RsvpConfirmEmail from '../emails/RsvpConfirmEmail.jsx'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, eventId, eventName, venue, date, time, dressCode } = req.body

  if (!userId || !eventId) {
    return res.status(400).json({ error: 'Missing userId or eventId' })
  }

  try {
    // Get user's email and name
    const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(userId)
    if (userErr) throw userErr

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .maybeSingle()

    const email = user.email
    const firstName = profile?.name?.split(' ')[0] || 'Member'

    const html = await render(createElement(RsvpConfirmEmail, {
      firstName, eventName, venue, date, time, dressCode,
    }))

    await resend.emails.send({
      from: 'BOS Watch Club <hello@bosswatchclub.com>',
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
