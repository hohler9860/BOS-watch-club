import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createElement } from 'react'
import SignupEmail from '../emails/SignupEmail.jsx'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, firstName } = req.body

  if (!email || !firstName) {
    return res.status(400).json({ error: 'Missing email or firstName' })
  }

  try {
    const html = await render(createElement(SignupEmail, { firstName }))

    const { data, error } = await resend.emails.send({
      from: 'BOS Watch Club <hello@bosswatchclub.com>',
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
