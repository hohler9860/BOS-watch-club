import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { accountDeletedEmail } from '../emails/templates.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization' })
  }

  const token = authHeader.slice(7)

  try {
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Verify the user from their JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    // Get profile info before deletion for goodbye email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    // Capture email before user is deleted
    const userEmail = user.email
    const firstName = profile?.name || 'Member'

    // Send goodbye email BEFORE deletion so we still have their email address
    try {
      if (userEmail && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'
        const REPLY_TO = 'boswatchclub@gmail.com'

        await resend.emails.send({
          from: FROM,
          replyTo: REPLY_TO,
          to: userEmail,
          subject: `Goodbye, ${firstName} — BOS Watch Club`,
          html: accountDeletedEmail({ firstName }),
        })
      }
    } catch (emailErr) {
      console.error('Goodbye email failed:', emailErr)
    }

    // Delete from auth.users (cascades to profiles via FK)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('delete-account error:', err)
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' })
  }
}
