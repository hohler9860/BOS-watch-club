import { z } from 'zod'
import { Resend } from 'resend'
import { signupEmail } from '../emails/templates.js'
import { rateLimit } from './_lib/rateLimit.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'

const bodySchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { limited } = rateLimit(req, { window: 60_000, max: 5 })
  if (limited) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' })
  }

  const { email, firstName } = parsed.data

  try {
    const html = signupEmail({ firstName })

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Welcome, ${firstName} — BOS Watch Club`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, id: data.id })
  } catch (err) {
    console.error('Welcome email failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
