import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { purchaseEmail, upgradeEmail } from '../emails/templates.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'
const REPLY_TO = 'boswatchclub@gmail.com'

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
    const metadata = session.metadata || {}
    const userId = metadata.supabase_user_id
    const tier = metadata.tier

    if (metadata.type === 'deposit') {
      // Record payment
      await supabase.from('payments').insert({
        user_id: metadata.supabase_user_id,
        amount: session.amount_total,
        currency: session.currency,
        tier: 'MEMBER',
        type: 'deposit',
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        status: 'completed',
      })

      // Auto-insert RSVP
      await supabase.from('rsvps').upsert(
        { user_id: metadata.supabase_user_id, event_id: metadata.event_id },
        { onConflict: 'user_id,event_id', ignoreDuplicates: true }
      )

      // Send RSVP confirmation email
      const customerEmail = session.customer_details?.email || session.customer_email
      if (customerEmail) {
        const { data: eventData } = await supabase
          .from('events')
          .select('name, venue, date, time, dress_code')
          .eq('id', metadata.event_id)
          .maybeSingle()

        if (eventData) {
          try {
            await resend.emails.send({
              from: FROM,
              replyTo: REPLY_TO,
              to: customerEmail,
              subject: `RSVP Confirmed — ${eventData.name}`,
              html: `<p>Your deposit has been received and your spot is confirmed for <strong>${eventData.name}</strong>.</p>
<p><strong>Date:</strong> ${eventData.date}<br/><strong>Time:</strong> ${eventData.time}<br/><strong>Venue:</strong> ${eventData.venue}<br/><strong>Dress Code:</strong> ${eventData.dress_code || 'Smart Casual'}</p>
<p>See you there!</p>`,
            })
          } catch (emailErr) {
            console.error('Failed to send deposit confirmation email:', emailErr)
          }
        }
      }

      return res.status(200).json({ received: true })
    }

    if (userId && tier) {
      // Fetch current profile to detect upgrade vs first purchase
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role, tier, name')
        .eq('id', userId)
        .maybeSingle()

      const previousTier = currentProfile?.tier
      const isUpgrade = currentProfile?.role === 'member' && previousTier && previousTier !== tier

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

      // Send confirmation email immediately
      const customerEmail = session.customer_details?.email || session.customer_email
      if (customerEmail) {
        const firstName = currentProfile?.name?.split(' ')[0] || 'Member'

        try {
          if (isUpgrade) {
            const html = upgradeEmail({ firstName, previousTier, newTier: tier })
            await resend.emails.send({
              from: FROM,
              replyTo: REPLY_TO,
              to: customerEmail,
              subject: `Tier Upgraded — ${tier} Member`,
              html,
            })
            console.log(`Upgrade email sent to ${customerEmail}`)
          } else {
            const html = purchaseEmail({ firstName, tier })
            await resend.emails.send({
              from: FROM,
              replyTo: REPLY_TO,
              to: customerEmail,
              subject: `You're In — ${tier} Membership Confirmed`,
              html,
            })
            console.log(`Purchase email sent to ${customerEmail}`)
          }
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr)
        }
      }
    }
  }

  return res.status(200).json({ received: true })
}
