import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// Use service role key — this endpoint must only be callable server-side (Vercel function)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = z.object({ email: z.string().email() }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Missing or invalid email' })
  }
  const { email } = parsed.data

  try {
    const { data, error } = await supabase.auth.admin.getUserByEmail(email)

    // Supabase returns an error when the user is not found — treat that as exists: false.
    // Any other error (network, config, etc.) should propagate as a 500.
    if (error) {
      const notFound =
        error.message?.toLowerCase().includes('not found') ||
        error.status === 404

      if (notFound) {
        return res.status(200).json({ exists: false })
      }

      console.error('check-email: unexpected Supabase error:', error)
      return res.status(500).json({ error: 'Failed to check email' })
    }

    // data.user is null when no account exists (defensive fallback)
    if (!data?.user) {
      return res.status(200).json({ exists: false })
    }

    return res.status(200).json({ exists: true })
  } catch (err) {
    console.error('check-email: unhandled exception:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
