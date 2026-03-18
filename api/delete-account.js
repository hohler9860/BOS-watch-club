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

  // Delete from auth.users (cascades to profiles via FK)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  if (error) return res.status(500).json({ error: error.message })

  // Send goodbye email (fire and forget)
  if (user.email) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'
    const firstName = profile?.name?.split(' ')[0] || 'Member'

    resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `Goodbye, ${firstName} — BOS Watch Club`,
      html: accountDeletedEmail({ firstName }),
    }).catch(err => console.error('Goodbye email failed:', err))
  }

  return res.status(200).json({ success: true })
}
