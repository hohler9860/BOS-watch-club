import { z } from 'zod'
import { Resend } from 'resend'
import { signupEmail } from '../emails/templates.js'
import { rateLimit } from './_lib/rateLimit.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'
const REPLY_TO = 'boswatchclub@gmail.com'

// SECURITY: this endpoint is unauthenticated (it fires right after signup,
// before a session exists), so it must stay locked to the one template the
// public flow actually needs. Everything else (acceptance, invitation,
// rejection, ...) is sent server-side by admin-verified endpoints — exposing
// those templates here let anyone send official-looking club emails to any
// address. Keep this enum at 'signup' only.
const bodySchema = z.object({
  type: z.enum(['signup']),
  to: z.string().email(),
  data: z.object({
    firstName: z.string().max(64).optional(),
  }),
})

// Neutralize HTML in user-supplied strings before they reach a template.
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const templates = {
  signup: { render: signupEmail, subject: (d) => `Welcome, ${d.firstName || 'Member'} — BOS Watch Club` },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { limited } = rateLimit(req, { window: 60_000, max: 10 })
  if (limited) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' })
  }

  const { type, to, data } = parsed.data
  const template = templates[type]

  // Escape every user-supplied string so nothing renders as HTML.
  const safeData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? escapeHtml(v) : v])
  )

  try {
    const html = template.render(safeData)
    const subject = template.subject(safeData)

    const { data: result, error } = await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, id: result.id })
  } catch (err) {
    console.error('Email send failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
