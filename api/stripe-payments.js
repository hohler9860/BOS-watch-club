import Stripe from 'stripe'
import { verifyAdmin } from './_lib/adminAuth.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await verifyAdmin(req)
  if (auth.error) return res.status(auth.status).json({ error: auth.error })

  try {
    // Fetch completed checkout sessions from Stripe (last 100)
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
      expand: ['data.customer_details', 'data.line_items'],
    })

    // Also fetch recent charges for a fuller picture
    const charges = await stripe.charges.list({
      limit: 100,
    })

    // Build payment records from checkout sessions
    const payments = sessions.data.map(session => ({
      id: session.id,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: session.payment_status,
      email: session.customer_details?.email || session.customer_email || '',
      name: session.customer_details?.name || '',
      tier: session.metadata?.tier || '',
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      created_at: new Date(session.created * 1000).toISOString(),
    }))

    // Build summary stats
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthRevenue = payments
      .filter(p => p.created_at.slice(0, 7) === thisMonth)
      .reduce((sum, p) => sum + p.amount, 0)

    // Revenue by tier
    const byTier = payments.reduce((acc, p) => {
      const t = p.tier || 'Unknown'
      acc[t] = (acc[t] || 0) + p.amount
      return acc
    }, {})

    // Stripe account balance
    const balance = await stripe.balance.retrieve()
    const available = balance.available.reduce((sum, b) => sum + b.amount, 0)
    const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0)

    return res.status(200).json({
      payments,
      stats: {
        totalRevenue,
        monthRevenue,
        totalPayments: payments.length,
        byTier,
        stripeBalance: { available, pending },
      },
    })
  } catch (err) {
    console.error('Stripe payments fetch error:', err)
    return res.status(500).json({ error: err.message })
  }
}
