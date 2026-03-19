import crypto from 'crypto'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { verifyAdmin } from './_lib/adminAuth.js'
import { rateLimit } from './_lib/rateLimit.js'
import { acceptanceEmail, applicationReceivedEmail } from '../emails/templates.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'

function generateCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// ─── ACCEPT APPLICANT (admin-only) ──────────────────────
async function handleAccept(req, res) {
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
    const code = generateCode()

    const { error: codeErr } = await supabase.from('access_codes').insert({
      code,
      tier: memberTier,
      email: normalizedEmail,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    if (codeErr) {
      console.error('Failed to insert access code:', codeErr)
      return res.status(500).json({ error: 'Failed to generate access code' })
    }

    const { error: approveErr } = await supabase
      .from('approved_members')
      .insert({ email: normalizedEmail, name, tier: memberTier, source: 'typeform' })
    if (approveErr && approveErr.code !== '23505') {
      console.error('Failed to insert approved member:', approveErr)
      return res.status(500).json({ error: 'Failed to approve member' })
    }

    await supabase.from('submissions').update({ status: 'approved' }).eq('id', submissionId)

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
    }

    return res.status(200).json({ success: true, code })
  } catch (err) {
    console.error('accept error:', err)
    return res.status(500).json({ error: err.message })
  }
}

// ─── ACTIVATE ACCOUNT (public, rate-limited) ────────────
async function handleActivate(req, res) {
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

    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This access code has expired. Contact the club for a new one.' })
    }

    if (!accessCode.email) {
      return res.status(400).json({ error: 'This access code is not tied to an email. Contact the club.' })
    }

    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === accessCode.email.toLowerCase()
    )
    if (existing) {
      return res.status(400).json({ error: 'An account already exists for this email. Try signing in or resetting your password.' })
    }

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

    await supabase.from('access_codes').update({
      redeemed_by: newUser.user.id,
      redeemed_at: new Date().toISOString(),
      is_active: false,
    }).eq('id', accessCode.id)

    await supabase.from('profiles').update({
      access_code: normalizedCode,
    }).eq('id', newUser.user.id)

    return res.status(200).json({
      success: true,
      email: accessCode.email,
    })
  } catch (err) {
    console.error('activate error:', err)
    return res.status(500).json({ error: err.message })
  }
}

// ─── SUBMIT APPLICATION (public, rate-limited) ──────────
const TYPEFORM_ID = '01KM1G16QKVTF5J0TBKBW9VWM9'

async function handleSubmitApplication(req, res) {
  const { limited } = rateLimit(req, { window: 60_000, max: 5 })
  if (limited) {
    return res.status(429).json({ error: 'Too many requests. Please wait.' })
  }

  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const normalizedEmail = email.toLowerCase().trim()
  let firstName = ''
  let lastName = ''
  let instagram = ''

  // Try to fetch Typeform response for this email
  const tfKey = process.env.TYPEFORM_API_KEY
  if (tfKey) {
    try {
      const query = encodeURIComponent(normalizedEmail)
      const tfRes = await fetch(
        `https://api.typeform.com/forms/${TYPEFORM_ID}/responses?query=${query}&page_size=1`,
        { headers: { Authorization: `Bearer ${tfKey}` } }
      )
      if (tfRes.ok) {
        const tfData = await tfRes.json()
        const item = tfData.items?.[0]
        if (item) {
          const answers = item.answers || []
          const hidden = item.hidden || {}
          for (const a of answers) {
            const ref = a.field?.ref || ''
            const val = a.text || a.email || a.choice?.label || a.url || ''
            if (ref === 'first_name') firstName = val
            else if (ref === 'last_name') lastName = val
            else if (ref === 'instagram') instagram = val
          }
          // Fall back to hidden email if answer email is empty
          if (!firstName && hidden.first_name) firstName = hidden.first_name
        }
      }
    } catch (err) {
      console.error('Typeform API fetch failed:', err.message)
      // Continue without Typeform data
    }
  }

  try {
    // Insert submission into Supabase
    const { error: insertErr } = await supabase.from('submissions').insert({
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      instagram,
      status: 'pending',
    })
    // Ignore duplicate (23505)
    if (insertErr && insertErr.code !== '23505') {
      console.error('Submission insert error:', insertErr)
    }

    // Send confirmation email
    const html = applicationReceivedEmail({ firstName })
    await resend.emails.send({
      from: FROM,
      to: normalizedEmail,
      subject: 'Application Received — BOS Watch Club',
      html,
    }).catch(err => console.error('Confirmation email failed:', err))

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('submit-application error:', err)
    return res.status(500).json({ error: err.message })
  }
}

// ─── CHECK EMAIL (public, rate-limited) ─────────────────
async function handleCheckEmail(req, res) {
  const { limited } = rateLimit(req, { window: 60_000, max: 20 })
  if (limited) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const parsed = z.object({ email: z.string().email() }).safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Missing or invalid email' })
  }

  try {
    const { data, error } = await supabase.auth.admin.getUserByEmail(parsed.data.email)
    if (error) {
      const notFound = error.message?.toLowerCase().includes('not found') || error.status === 404
      if (notFound) return res.status(200).json({ exists: false })
      console.error('check-email: unexpected Supabase error:', error)
      return res.status(500).json({ error: 'Failed to check email' })
    }
    return res.status(200).json({ exists: !!(data?.user) })
  } catch (err) {
    console.error('check-email: unhandled exception:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ─── ROUTER ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action } = req.body
  switch (action) {
    case 'accept':
      return handleAccept(req, res)
    case 'activate':
      return handleActivate(req, res)
    case 'submit-application':
      return handleSubmitApplication(req, res)
    case 'check-email':
      return handleCheckEmail(req, res)
    default:
      return res.status(400).json({ error: 'Invalid action.' })
  }
}
