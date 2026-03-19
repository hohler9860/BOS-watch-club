import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { verifyAdmin } from './_lib/adminAuth.js'
import { acceptanceEmail } from '../emails/templates.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'

function generateCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Admin-only
  const auth = await verifyAdmin(req)
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error })
  }

  const { submissionId, email, firstName, lastName, tier } = req.body
  if (!submissionId || !email) {
    return res.status(400).json({ error: 'submissionId and email are required' })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || null
  const memberTier = tier || 'MEMBER'

  try {
    // 1. Generate access code
    const code = generateCode()

    // 2. Insert into access_codes tied to this email
    const { error: codeErr } = await supabase.from('access_codes').insert({
      code,
      tier: memberTier,
      email: normalizedEmail,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })
    if (codeErr) {
      console.error('Failed to insert access code:', codeErr)
      return res.status(500).json({ error: 'Failed to generate access code' })
    }

    // 3. Insert into approved_members (ignore duplicate)
    const { error: approveErr } = await supabase
      .from('approved_members')
      .insert({ email: normalizedEmail, name, tier: memberTier, source: 'typeform' })
    if (approveErr && approveErr.code !== '23505') {
      console.error('Failed to insert approved member:', approveErr)
      return res.status(500).json({ error: 'Failed to approve member' })
    }

    // 4. Update submission status
    await supabase.from('submissions').update({ status: 'approved' }).eq('id', submissionId)

    // 5. Send acceptance email with access code
    const html = acceptanceEmail({
      firstName: firstName || 'Member',
      accessCode: code,
    })
    const { error: emailErr } = await resend.emails.send({
      from: FROM,
      to: normalizedEmail,
      subject: "You've Been Accepted — BOS Watch Club",
      html,
    })
    if (emailErr) {
      console.error('Acceptance email failed:', emailErr)
      // Don't fail the whole request — code is saved, admin can resend
    }

    return res.status(200).json({ success: true, code })
  } catch (err) {
    console.error('accept-applicant error:', err)
    return res.status(500).json({ error: err.message })
  }
}
