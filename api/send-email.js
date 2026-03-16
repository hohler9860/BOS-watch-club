import { Resend } from 'resend'
import { signupEmail, purchaseEmail, upgradeEmail, newEventEmail, rsvpConfirmEmail, eventReminderEmail, newContentEmail } from '../emails/templates.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@send.bosswatchclub.com>'

const templates = {
  signup: { render: signupEmail, subject: (d) => `Welcome, ${d.firstName} — BOS Watch Club` },
  purchase: { render: purchaseEmail, subject: (d) => `You're In — ${d.tier} Membership Confirmed` },
  upgrade: { render: upgradeEmail, subject: (d) => `Tier Upgraded — ${d.newTier} Member` },
  newEvent: { render: newEventEmail, subject: (d) => `New Event: ${d.eventName}` },
  rsvp: { render: rsvpConfirmEmail, subject: (d) => `RSVP Confirmed — ${d.eventName}` },
  reminder: { render: eventReminderEmail, subject: (d) => `Reminder: ${d.eventName} is Tomorrow` },
  content: { render: newContentEmail, subject: (d) => `${d.contentType === 'blog' ? 'New Journal Entry' : 'Club Update'}: ${d.title}` },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, to, data } = req.body

  if (!type || !to || !data) {
    return res.status(400).json({ error: 'Missing required fields: type, to, data' })
  }

  const template = templates[type]
  if (!template) {
    return res.status(400).json({ error: `Unknown email type: ${type}` })
  }

  try {
    const html = template.render(data)
    const subject = template.subject(data)

    const { data: result, error } = await resend.emails.send({
      from: FROM,
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
