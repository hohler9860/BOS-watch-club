import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = {
  api: { bodyParser: false },
}

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

function verifySignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')
  return `sha256=${hash}` === signature
}

function extractAnswer(answers, ref) {
  const answer = answers.find((a) => a.field?.ref === ref)
  if (!answer) return ''
  // Typeform answer values vary by type
  return answer.email || answer.text || answer.choice?.label || answer.url || ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawBody = await readRawBody(req)

  // Signature verification (optional — skipped if secret not configured)
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET
  if (secret) {
    const signature = req.headers['typeform-signature']
    if (!signature || !verifySignature(rawBody, signature, secret)) {
      console.error('Typeform webhook signature verification failed')
      return res.status(400).json({ error: 'Invalid signature' })
    }
  }

  let payload
  try {
    payload = JSON.parse(rawBody.toString('utf-8'))
  } catch (err) {
    console.error('Failed to parse Typeform payload:', err.message)
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const formResponse = payload.form_response
  if (!formResponse) {
    return res.status(400).json({ error: 'Missing form_response' })
  }

  const answers = formResponse.answers || []
  const email = extractAnswer(answers, 'email')
  const firstName = extractAnswer(answers, 'first_name')
  const lastName = extractAnswer(answers, 'last_name')
  const instagram = extractAnswer(answers, 'instagram')

  try {
    const { error } = await supabase.from('submissions').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      instagram,
      typeform_response_id: formResponse.response_id,
      status: 'pending',
    })

    if (error) {
      console.error('Failed to insert submission:', error)
      return res.status(500).json({ error: 'Failed to save submission' })
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Typeform webhook error:', err)
    return res.status(500).json({ error: err.message })
  }
}
