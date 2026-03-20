import crypto from 'crypto'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { verifyAdmin } from './_lib/adminAuth.js'
import { rateLimit } from './_lib/rateLimit.js'
import { acceptanceEmail, applicationReceivedEmail, invitationEmail, rejectionEmail } from '../emails/templates.js'

const APPLICATION_FIELDS = [
  'email', 'first_name', 'last_name', 'birthday', 'phone', 'instagram',
  'city', 'profession', 'collecting_journey', 'current_watch', 'preferred_brands',
  'hoping_to_get', 'other_communities', 'hobbies', 'watch_origin_story',
  'boston_spots', 'holiday_destination', 'heard_about', 'anything_else',
]

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

// ─── DENY APPLICANT (admin-only) ─────────────────────────
async function handleDeny(req, res) {
  const auth = await verifyAdmin(req)
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error })
  }

  const { submissionId, email, firstName } = req.body
  if (!submissionId || !email) {
    return res.status(400).json({ error: 'submissionId and email are required' })
  }

  try {
    const { error: updateErr } = await supabase
      .from('submissions')
      .update({ status: 'denied' })
      .eq('id', submissionId)
    if (updateErr) {
      console.error('Failed to update submission:', updateErr)
      return res.status(500).json({ error: 'Failed to deny applicant' })
    }

    // Send rejection email
    const html = rejectionEmail({ firstName: firstName || 'Applicant' })
    const { error: emailErr } = await resend.emails.send({
      from: FROM,
      to: email.toLowerCase().trim(),
      subject: 'Application Update — BOS Watch Club',
      html,
    })
    if (emailErr) {
      console.error('Rejection email failed:', emailErr)
      return res.status(200).json({ success: true, emailFailed: true })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('deny error:', err)
    return res.status(500).json({ error: err.message })
  }
}

// ─── ACTIVATE ACCOUNT (public, rate-limited) ────────────
async function handleActivate(req, res) {
  const { limited } = rateLimit(req, { window: 60_000, max: 5 })
  if (limited) {
    return res.status(429).json({ error: 'Too many attempts. Please wait a moment.' })
  }

  const { code, password } = req.body
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Access code is required' })
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
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

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: accessCode.email,
      password,
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
    return res.status(429).json({ error: 'Too many attempts. Please wait a moment.' })
  }

  const { email, first_name, last_name, birthday, phone, instagram, city, profession,
    collecting_journey, current_watch, preferred_brands, hoping_to_get,
    other_communities, hobbies, watch_origin_story, boston_spots,
    holiday_destination, heard_about, anything_else } = req.body

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // If form fields weren't provided, try to fetch from Typeform as fallback
  let resolvedFirstName = first_name || ''
  let resolvedLastName = last_name || ''
  let resolvedInstagram = instagram || ''

  if (!first_name && !last_name) {
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
            const tfAnswers = item.answers || []
            const hidden = item.hidden || {}
            for (const a of tfAnswers) {
              const ref = a.field?.ref || ''
              const val = a.text || a.email || a.choice?.label || a.url || ''
              if (ref === 'first_name') resolvedFirstName = val
              else if (ref === 'last_name') resolvedLastName = val
              else if (ref === 'instagram') resolvedInstagram = val
            }
            if (!resolvedFirstName && hidden.first_name) resolvedFirstName = hidden.first_name
          }
        }
      } catch (err) {
        console.error('Typeform API fetch failed:', err.message)
        // Continue without Typeform data
      }
    }
  }

  try {
    const { error: upsertErr } = await supabase
      .from('submissions')
      .upsert({
        email: normalizedEmail,
        first_name: resolvedFirstName || null,
        last_name: resolvedLastName || null,
        birthday: birthday || null,
        phone: phone || null,
        instagram: resolvedInstagram || null,
        city: city || null,
        profession: profession || null,
        collecting_journey: collecting_journey || null,
        current_watch: current_watch || null,
        preferred_brands: preferred_brands || null,
        hoping_to_get: hoping_to_get || null,
        other_communities: other_communities || null,
        hobbies: hobbies || null,
        watch_origin_story: watch_origin_story || null,
        boston_spots: boston_spots || null,
        holiday_destination: holiday_destination || null,
        heard_about: heard_about || null,
        anything_else: anything_else || null,
        status: 'pending',
      }, { onConflict: 'email' })

    if (upsertErr) {
      console.error('Failed to upsert submission:', upsertErr)
      return res.status(500).json({ error: 'Failed to submit application' })
    }

    // Send confirmation email directly via Resend
    if (normalizedEmail) {
      const html = applicationReceivedEmail({ firstName: resolvedFirstName || 'Applicant' })
      resend.emails.send({
        from: FROM,
        to: normalizedEmail,
        subject: 'Application Received — BOS Watch Club',
        html,
      }).catch(err => console.error('Application confirmation email failed:', err))
    }

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

// ─── ADD APPROVED EMAIL (admin-only) ────────────────────
async function handleAddApproved(req, res) {
  const auth = await verifyAdmin(req)
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error })
  }

  const { email, name, tier } = req.body
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const memberTier = tier || 'MEMBER'
  const firstName = (name || '').trim().split(' ')[0] || ''

  try {
    // Generate access code
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

    // Insert into approved_members (service role bypasses RLS)
    const { error: insertErr } = await supabase
      .from('approved_members')
      .insert({ email: normalizedEmail, name: name?.trim() || null, tier: memberTier })

    if (insertErr) {
      if (insertErr.code === '23505') {
        return res.status(400).json({ error: 'This email is already approved.' })
      }
      console.error('Failed to insert approved member:', insertErr)
      return res.status(500).json({ error: insertErr.message })
    }

    // Send invitation email
    const html = invitationEmail({ firstName, accessCode: code })
    const { error: emailErr } = await resend.emails.send({
      from: FROM,
      to: normalizedEmail,
      subject: "You're Invited — BOS Watch Club",
      html,
    })
    if (emailErr) {
      console.error('Invitation email failed:', emailErr)
      return res.status(200).json({ success: true, code, emailFailed: true })
    }

    return res.status(200).json({ success: true, code })
  } catch (err) {
    console.error('add-approved error:', err)
    return res.status(500).json({ error: err.message })
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
    case 'deny':
      return handleDeny(req, res)
    case 'activate':
      return handleActivate(req, res)
    case 'add-approved':
      return handleAddApproved(req, res)
    case 'submit-application':
      return handleSubmitApplication(req, res)
    case 'check-email':
      return handleCheckEmail(req, res)
    default:
      return res.status(400).json({ error: 'Invalid action.' })
  }
}
