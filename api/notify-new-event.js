import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createElement } from 'react'
import NewEventEmail from '../emails/NewEventEmail.jsx'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { eventName, venue, date, time, dressCode, access, tierMinimum } = req.body

  if (!eventName) {
    return res.status(400).json({ error: 'Missing eventName' })
  }

  try {
    // Fetch all members (role = 'member' or higher)
    const { data: members, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, name, tier')
      .in('role', ['member', 'founding_member', 'vip'])

    if (fetchErr) throw fetchErr
    if (!members || members.length === 0) {
      return res.status(200).json({ success: true, sent: 0 })
    }

    // Filter by tier if event has a minimum
    const tierRank = { ENTHUSIAST: 1, COLLECTOR: 2, PATRON: 3 }
    const minRank = tierRank[tierMinimum] || 0
    const eligible = minRank > 0
      ? members.filter(m => (tierRank[m.tier] || 0) >= minRank)
      : members

    // Fetch emails from auth.users via admin API
    const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (usersErr) throw usersErr

    const emailMap = {}
    for (const u of users) {
      emailMap[u.id] = u.email
    }

    let sent = 0
    const errors = []

    for (const member of eligible) {
      const email = emailMap[member.id]
      if (!email) continue

      const firstName = member.name?.split(' ')[0] || 'Member'

      try {
        const html = await render(createElement(NewEventEmail, {
          firstName, eventName, venue, date, time, dressCode, access,
        }))

        await resend.emails.send({
          from: 'BOS Watch Club <hello@bosswatchclub.com>',
          to: email,
          subject: `New Event: ${eventName}`,
          html,
        })
        sent++
      } catch (err) {
        errors.push({ email, error: err.message })
      }
    }

    return res.status(200).json({ success: true, sent, errors })
  } catch (err) {
    console.error('Notify new event failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
