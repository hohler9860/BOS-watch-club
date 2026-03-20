import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { z } from 'zod'
import { newEventEmail } from '../emails/templates.js'
import { verifyAdmin } from './_lib/adminAuth.js'

const bodySchema = z.object({
  eventName: z.string().min(1),
  venue: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  dressCode: z.string().optional(),
  access: z.string().optional(),
  tierMinimum: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
})

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

  const auth = await verifyAdmin(req)
  if (auth.error) return res.status(auth.status).json({ error: auth.error })

  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }
  const { eventName, venue, date, time, dressCode, access, tierMinimum, description, image } = parsed.data

  try {
    const { data: members, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, name, tier')

    if (fetchErr) throw fetchErr
    if (!members || members.length === 0) {
      return res.status(200).json({ success: true, sent: 0 })
    }

    const tierRank = { MEMBER: 1 }
    const minRank = tierRank[tierMinimum] || 0
    const eligible = minRank > 0
      ? members.filter(m => (tierRank[m.tier] || 0) >= minRank)
      : members

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

      const firstName = member.name || 'Member'

      try {
        const html = newEventEmail({ firstName, eventName, venue, date, time, dressCode, access, description, image })
        await resend.emails.send({ from: FROM, replyTo: REPLY_TO, to: email, subject: `New Event: ${eventName}`, html })
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
