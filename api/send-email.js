import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createElement } from 'react'
import SignupEmail from '../emails/SignupEmail.jsx'
import PurchaseEmail from '../emails/PurchaseEmail.jsx'
import UpgradeEmail from '../emails/UpgradeEmail.jsx'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'BOS Watch Club <hello@bosswatchclub.com>'

const templates = {
  signup: {
    component: SignupEmail,
    subject: ({ firstName }) => `Welcome, ${firstName} — BOS Watch Club`,
  },
  purchase: {
    component: PurchaseEmail,
    subject: ({ tier }) => `You're In — ${tier} Membership Confirmed`,
  },
  upgrade: {
    component: UpgradeEmail,
    subject: ({ newTier }) => `Tier Upgraded — ${newTier} Member`,
  },
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
    const html = await render(createElement(template.component, data))
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
