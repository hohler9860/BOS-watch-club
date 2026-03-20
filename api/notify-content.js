import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { z } from 'zod'
import { newContentEmail } from '../emails/templates.js'
import { verifyAdmin } from './_lib/adminAuth.js'

const bodySchema = z.object({
  title: z.string().min(1),
  contentType: z.enum(['blog', 'news', 'post']),
  preview: z.string().optional(),
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
  const { contentType, title, preview } = parsed.data

  try {
    const { data: members, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, name')
      .in('role', ['member', 'founding_member', 'vip'])

    if (fetchErr) throw fetchErr
    if (!members || members.length === 0) {
      return res.status(200).json({ success: true, sent: 0 })
    }

    const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (usersErr) throw usersErr

    const emailMap = {}
    for (const u of users) {
      emailMap[u.id] = u.email
    }

    const label = contentType === 'blog' ? 'New Journal Entry' : 'Club Update'
    let sent = 0
    const errors = []

    for (const member of members) {
      const email = emailMap[member.id]
      if (!email) continue

      const firstName = member.name?.split(' ')[0] || 'Member'

      try {
        const html = newContentEmail({ firstName, contentType, title, preview })
        await resend.emails.send({ from: FROM, replyTo: REPLY_TO, to: email, subject: `${label}: ${title}`, html })
        sent++
      } catch (err) {
        errors.push({ email, error: err.message })
      }
    }

    return res.status(200).json({ success: true, sent, errors })
  } catch (err) {
    console.error('Content notification failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
