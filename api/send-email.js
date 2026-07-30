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

  // TEMPORARY (remove after email design review): token-gated batch send of
  // every template to Henry only. One-time token, self-expires 2026-07-31.
  if (req.body?.type === 'test-all') {
    if (Date.now() > Date.parse('2026-07-31T00:00:00Z')) return res.status(410).json({ error: 'Expired' })
    if (req.body?.token !== 'fda82b11d442b7e5dbe632de0fedfd46') return res.status(401).json({ error: 'Unauthorized' })
    const t = await import('../emails/templates.js')
    const event = {
      firstName: 'Henry',
      eventName: 'Summer Rooftop Social',
      venue: 'Contessa, Newbury St',
      date: 'Thursday, August 14',
      time: '7:00 PM',
      dressCode: 'Smart casual',
      access: 'Members + one guest',
      description: 'An evening of watches and cocktails overlooking Back Bay.',
    }
    const tests = [
      ['signup', t.signupEmail({ firstName: 'Henry' })],
      ['application received', t.applicationReceivedEmail({ firstName: 'Henry' })],
      ['acceptance', t.acceptanceEmail({ firstName: 'Henry', accessCode: 'BWC-TEST-1234' })],
      ['invitation', t.invitationEmail({ firstName: 'Henry', accessCode: 'BWC-TEST-1234' })],
      ['rejection', t.rejectionEmail({ firstName: 'Henry' })],
      ['waitlist', t.waitlistEmail({ firstName: 'Henry' })],
      ['purchase', t.purchaseEmail({ firstName: 'Henry', tier: 'COLLECTOR' })],
      ['upgrade', t.upgradeEmail({ firstName: 'Henry', previousTier: 'ENTHUSIAST', newTier: 'COLLECTOR' })],
      ['new event', t.newEventEmail(event)],
      ['rsvp confirm', t.rsvpConfirmEmail(event)],
      ['guest invite', t.guestInviteEmail({ ...event, guestName: 'Stelios', memberName: 'Henry Ohler', guestId: 'test-guest-id' })],
      ['event reminder', t.eventReminderEmail(event)],
      ['guest reminder', t.guestReminderEmail({ ...event, guestName: 'Stelios', memberName: 'Henry Ohler' })],
      ['new content', t.newContentEmail({ firstName: 'Henry', contentType: 'news', title: 'The State of the Boston Watch Scene', preview: 'A look at where collecting in Boston is headed this fall.' })],
      ['custom blast', t.customBlastEmail({ preview: 'Big news from the club', heading: 'August at BOS Watch Club', body: 'Here is what is coming up this month, including our rooftop social and two new member spotlights.', buttonText: "See What's On", buttonHref: 'https://boswatchclub.com/events' })],
      ['account deleted', t.accountDeletedEmail({ firstName: 'Henry' })],
    ]
    const { data: batch, error } = await resend.batch.send(
      tests.map(([name, html], i) => ({
        from: FROM,
        to: 'dialedbyh@gmail.com',
        subject: `[TEST ${String(i + 1).padStart(2, '0')}/16] ${name}`,
        html,
      }))
    )
    if (error) return res.status(500).json({ error })
    return res.status(200).json({ success: true, sent: batch?.data?.length ?? tests.length })
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
