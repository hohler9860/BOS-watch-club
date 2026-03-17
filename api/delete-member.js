import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { verifyAdmin } from './_lib/adminAuth.js'

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

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ success: true })
}
