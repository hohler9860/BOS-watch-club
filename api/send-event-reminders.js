import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createElement } from 'react'
import EventReminderEmail from '../emails/EventReminderEmail.jsx'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Optional auth check — you can call this via a cron service
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    // Allow if called without auth in dev, but log warning
    console.warn('Event reminder called without auth header')
  }

  try {
    // Find events happening tomorrow
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDate = tomorrow.toISOString().split('T')[0]

    // Fetch events with datetime matching tomorrow
    const { data: events, error: eventsErr } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('datetime', `${tomorrowDate}T00:00:00`)
      .lt('datetime', `${tomorrowDate}T23:59:59`)

    if (eventsErr) throw eventsErr
    if (!events || events.length === 0) {
      return res.status(200).json({ success: true, message: 'No events tomorrow', sent: 0 })
    }

    // Fetch all user emails
    const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (usersErr) throw usersErr

    const emailMap = {}
    for (const u of users) {
      emailMap[u.id] = u.email
    }

    let totalSent = 0
    const errors = []

    for (const event of events) {
      // Get RSVPs for this event
      const { data: rsvps, error: rsvpErr } = await supabase
        .from('rsvps')
        .select('user_id')
        .eq('event_id', event.id)

      if (rsvpErr) {
        errors.push({ event: event.name, error: rsvpErr.message })
        continue
      }

      if (!rsvps || rsvps.length === 0) continue

      // Get profile names
      const userIds = rsvps.map(r => r.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds)

      const nameMap = {}
      for (const p of profiles || []) {
        nameMap[p.id] = p.name
      }

      for (const rsvp of rsvps) {
        const email = emailMap[rsvp.user_id]
        if (!email) continue

        const firstName = nameMap[rsvp.user_id]?.split(' ')[0] || 'Member'

        try {
          const html = await render(createElement(EventReminderEmail, {
            firstName,
            eventName: event.name,
            venue: event.venue,
            date: event.date,
            time: event.time,
            dressCode: event.dress_code,
          }))

          await resend.emails.send({
            from: 'BOS Watch Club <hello@bosswatchclub.com>',
            to: email,
            subject: `Reminder: ${event.name} is Tomorrow`,
            html,
          })
          totalSent++
        } catch (err) {
          errors.push({ email, error: err.message })
        }
      }
    }

    return res.status(200).json({ success: true, sent: totalSent, errors })
  } catch (err) {
    console.error('Event reminders failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
