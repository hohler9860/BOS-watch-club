import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { z } from 'zod'
import { verifyAdmin } from './_lib/adminAuth.js'
import { accountDeletedEmail } from '../emails/templates.js'

const bodySchema = z.object({
  userId: z.string().uuid(),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await verifyAdmin(req)
  if (auth.error) return res.status(auth.status).json({ error: auth.error })

  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }
  const { userId } = parsed.data

  if (userId === auth.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Get user info before deletion so we can send the goodbye email
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, role, tier')
    .eq('id', userId)
    .single()

  // Clean up related records so they can reapply
  if (user?.email) {
    await supabaseAdmin.from('approved_members').delete().eq('email', user.email)
    await supabaseAdmin.from('submissions').delete().eq('email', user.email)
    await supabaseAdmin.from('access_codes').update({ is_active: false }).eq('email', user.email)
  }

  // Record in deleted_members before deletion
  await supabaseAdmin.from('deleted_members').insert({
    name: profile?.name || null,
    email: user?.email || null,
    role: profile?.role || null,
    tier: profile?.tier || null,
    deleted_by: 'admin',
  })

  // Delete from auth.users (cascades to profiles)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) return res.status(500).json({ error: error.message })

  // Send goodbye email (fire and forget — don't block the response)
  if (user?.email) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'
    const REPLY_TO = 'boswatchclub@gmail.com'
    const firstName = profile?.name || 'Member'

    resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: user.email,
      subject: `Goodbye, ${firstName} — BOS Watch Club`,
      html: accountDeletedEmail({ firstName }),
    }).catch(err => console.error('Goodbye email failed:', err))
  }

  return res.status(200).json({ success: true })
}
