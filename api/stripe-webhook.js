import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Use Supabase service role key so we can update any user's profile
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const rawBody = await readRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.supabase_user_id
    const tier = session.metadata?.tier

    if (userId && tier) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'member', tier })
        .eq('id', userId)

      if (error) {
        console.error('Failed to upgrade user:', error)
        return res.status(500).json({ error: 'Failed to upgrade user' })
      }

      console.log(`Upgraded user ${userId} to ${tier}`)

      // Record payment
      const amount = session.amount_total || 0
      const currency = session.currency || 'usd'
      const stripeSessionId = session.id
      const stripePaymentIntent = session.payment_intent || null

      const { error: payErr } = await supabase.from('payments').insert({
        user_id: userId,
        amount,
        currency,
        tier,
        stripe_session_id: stripeSessionId,
        stripe_payment_intent: stripePaymentIntent,
        status: 'completed',
      })
      if (payErr) console.error('Failed to record payment:', payErr)
    }
  }

  return res.status(200).json({ received: true })
}
