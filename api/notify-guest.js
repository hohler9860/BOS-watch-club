import { z } from 'zod'
import { Resend } from 'resend'
import { guestInviteEmail } from '../emails/templates.js'
import { rateLimit } from './_lib/rateLimit.js'

const resend = new Resend(process.env.RESEND_API_KEY)
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

  const parsed = z.object({
    guestName: z.string().min(1),
    guestEmail: z.string().email(),
    memberName: z.string().min(1),
    eventName: z.string().min(1),
    venue: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    dressCode: z.string().optional(),
    guestId: z.string().min(1),
  }).safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' })
  }

  const { guestName, guestEmail, memberName, eventName, venue, date, time, dressCode, guestId } = parsed.data

  try {
    const html = guestInviteEmail({ guestName, memberName, eventName, venue, date, time, dressCode, guestId })

    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: guestEmail,
      subject: `You're Invited — ${eventName}`,
      html,
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Guest notification failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
