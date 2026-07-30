import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const TIER_PRICES = {
  MEMBER: { amount: 20000, name: 'BOS Watch Club — Member', eduDiscountCents: 3000 },
}

const ALLOWED_ORIGINS = ['https://www.boswatchclub.com', 'https://boswatchclub.com', 'http://localhost:5173', 'http://localhost:4173']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Handle event deposit checkout
  if (req.body.type === 'deposit') {
    const { eventId, eventName, amount, accessToken } = req.body
    if (!eventId || !amount) return res.status(400).json({ error: 'Missing deposit details' })

    // Verify auth
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) return res.status(401).json({ error: 'Not authenticated' })

    const origin = ALLOWED_ORIGINS.includes(req.headers.origin) ? req.headers.origin : 'https://www.boswatchclub.com'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      metadata: { supabase_user_id: user.id, type: 'deposit', event_id: eventId },
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Event Deposit — ${eventName}` },
          unit_amount: amount, // already in cents
        },
        quantity: 1,
      }],
      success_url: `${origin}/dashboard?deposit=paid&event=${eventId}`,
      cancel_url: `${origin}/dashboard`,
    })

    return res.status(200).json({ url: session.url })
  }

  const { tier, accessToken, eduDiscount } = req.body

  if (!tier || !TIER_PRICES[tier]) {
    return res.status(400).json({ error: 'Invalid tier' })
  }

  // Verify the user is authenticated via Supabase
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
  if (authError || !user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const tierData = TIER_PRICES[tier]

  // Verify .edu discount server-side — only apply if email actually ends in .edu
  let amount = tierData.amount
  if (eduDiscount && tierData.eduDiscountCents && user.email?.endsWith('.edu')) {
    amount -= tierData.eduDiscountCents
  }

  const origin = ALLOWED_ORIGINS.includes(req.headers.origin)
    ? req.headers.origin
    : 'https://www.boswatchclub.com'

  try {
    const productName = amount < tierData.amount
      ? `${tierData.name} (.edu discount)`
      : tierData.name

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
        tier,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: productName },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?welcome=true&tier=${tier}`,
      cancel_url: `${origin}/membership?tier=${tier}`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
