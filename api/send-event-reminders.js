import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { eventReminderEmail, guestReminderEmail } from '../emails/templates.js'

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

  try {
    // Find events happening today (reminder sent ~12h before)
    const now = new Date()
    const todayDate = now.toISOString().split('T')[0]

    const { data: events, error: eventsErr } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('datetime', `${todayDate}T00:00:00`)
      .lt('datetime', `${todayDate}T23:59:59`)

    if (eventsErr) throw eventsErr
    if (!events || events.length === 0) {
      return res.status(200).json({ success: true, message: 'No events today', sent: 0 })
    }

    const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (usersErr) throw usersErr

    const emailMap = {}
    for (const u of users) {
      emailMap[u.id] = u.email
    }

    let totalSent = 0
    const errors = []

    for (const event of events) {
      // Get all RSVPs for this event
      const { data: rsvps, error: rsvpErr } = await supabase
        .from('rsvps')
        .select('id, user_id')
        .eq('event_id', event.id)

      if (rsvpErr) { errors.push({ event: event.name, error: rsvpErr.message }); continue }
      if (!rsvps || rsvps.length === 0) continue

      const userIds = rsvps.map(r => r.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds)

      const nameMap = {}
      for (const p of profiles || []) {
        nameMap[p.id] = p.name
      }

      // Send reminders to members
      for (const rsvp of rsvps) {
        const email = emailMap[rsvp.user_id]
        if (!email) continue

        const firstName = nameMap[rsvp.user_id]?.split(' ')[0] || 'Member'

        try {
          const html = eventReminderEmail({
            firstName,
            eventName: event.name,
            venue: event.venue,
            date: event.date,
            time: event.time,
            dressCode: event.dress_code,
          })
          await resend.emails.send({ from: FROM, replyTo: REPLY_TO, to: email, subject: `Reminder: ${event.name} is Tonight`, html })
          totalSent++
        } catch (err) {
          errors.push({ email, error: err.message })
        }
      }

      // Send reminders to guests (+1s)
      const rsvpIds = rsvps.map(r => r.id)
      const { data: guests, error: guestErr } = await supabase
        .from('event_guests')
        .select('name, email, invited_by, status')
        .eq('event_id', event.id)
        .in('rsvp_id', rsvpIds)

      if (guestErr) { errors.push({ event: event.name, error: guestErr.message }); continue }

      for (const guest of guests || []) {
        if (!guest.email) continue
        const memberName = nameMap[guest.invited_by] || 'your host'

        try {
          const html = guestReminderEmail({
            guestName: guest.name,
            memberName,
            eventName: event.name,
            venue: event.venue,
            date: event.date,
            time: event.time,
            dressCode: event.dress_code,
          })
          await resend.emails.send({ from: FROM, replyTo: REPLY_TO, to: guest.email, subject: `Reminder: ${event.name} is Tonight`, html })
          totalSent++
        } catch (err) {
          errors.push({ email: guest.email, error: err.message })
        }
      }
    }

    return res.status(200).json({ success: true, sent: totalSent, errors })
  } catch (err) {
    console.error('Event reminders failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
