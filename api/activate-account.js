import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from './_lib/rateLimit.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { limited } = rateLimit(req, { window: 60_000, max: 5 })
  if (limited) {
    return res.status(429).json({ error: 'Too many attempts. Please wait a moment.' })
  }

  const { code } = req.body
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Access code is required' })
  }

  const normalizedCode = code.trim().toUpperCase()

  try {
    // 1. Look up access code
    const { data: accessCode, error: lookupErr } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .is('redeemed_by', null)
      .maybeSingle()

    if (lookupErr) {
      console.error('Code lookup error:', lookupErr)
      return res.status(500).json({ error: 'Failed to validate code' })
    }

    if (!accessCode) {
      return res.status(400).json({ error: 'Invalid or already used access code.' })
    }

    // Check expiration
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This access code has expired. Contact the club for a new one.' })
    }

    if (!accessCode.email) {
      return res.status(400).json({ error: 'This access code is not tied to an email. Contact the club.' })
    }

    // 2. Check no auth account already exists for this email
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === accessCode.email.toLowerCase()
    )
    if (existing) {
      return res.status(400).json({ error: 'An account already exists for this email. Try signing in or resetting your password.' })
    }

    // 3. Create Supabase Auth account (no password, email confirmed)
    const tempPassword = crypto.randomBytes(32).toString('hex')
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: accessCode.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (createErr) {
      console.error('User creation error:', createErr)
      return res.status(500).json({ error: 'Failed to create account. Please try again.' })
    }

    // 4. Mark access code as redeemed
    await supabase.from('access_codes').update({
      redeemed_by: newUser.user.id,
      redeemed_at: new Date().toISOString(),
      is_active: false,
    }).eq('id', accessCode.id)

    // 5. Update profile with access code reference
    await supabase.from('profiles').update({
      access_code: normalizedCode,
    }).eq('id', newUser.user.id)

    return res.status(200).json({
      success: true,
      email: accessCode.email,
    })
  } catch (err) {
    console.error('activate-account error:', err)
    return res.status(500).json({ error: err.message })
  }
}
