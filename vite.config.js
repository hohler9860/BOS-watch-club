import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: '.env.local' })
dotenv.config()

function devApiPlugin() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api/create-checkout', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { tier, accessToken, eduDiscount } = JSON.parse(body)
            const TIER_PRICES = {
              ENTHUSIAST: { amount: 5000, name: 'BOS Watch Club — Enthusiast', eduDiscountCents: 2000 },
              COLLECTOR: { amount: 112500, name: 'BOS Watch Club — Collector' },
              PATRON: { amount: 225000, name: 'BOS Watch Club — Patron' },
            }
            if (!tier || !TIER_PRICES[tier]) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Invalid tier' })); return }

            const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
            const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
            if (authError || !user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Not authenticated' })); return }

            const tierData = TIER_PRICES[tier]
            let amount = tierData.amount
            if (eduDiscount && tierData.eduDiscountCents && user.email?.endsWith('.edu')) {
              amount -= tierData.eduDiscountCents
            }

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
            const origin = req.headers.origin || 'http://localhost:5173'
            const productName = amount < tierData.amount ? `${tierData.name} (.edu discount)` : tierData.name

            const session = await stripe.checkout.sessions.create({
              mode: 'payment',
              customer_email: user.email,
              metadata: { supabase_user_id: user.id, tier },
              line_items: [{
                price_data: { currency: 'usd', product_data: { name: productName }, unit_amount: amount },
                quantity: 1,
              }],
              success_url: `${origin}/dashboard?welcome=true&tier=${tier}`,
              cancel_url: `${origin}/upgrade?tier=${tier}`,
            })

            res.statusCode = 200
            res.end(JSON.stringify({ url: session.url }))
          } catch (err) {
            console.error('Stripe checkout error:', err)
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message || 'Failed to create checkout session' }))
          }
        })
      })

      // Generic handler for Vercel-style API routes
      function handleVercelApi(apiPath) {
        return async (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const mod = await import(apiPath)
              const parsed = JSON.parse(body || '{}')
              const fakeReq = { method: 'POST', body: parsed, headers: req.headers }
              const fakeRes = {
                statusCode: 200,
                _headers: { 'Content-Type': 'application/json' },
                setHeader(k, v) { this._headers[k] = v },
                status(code) { this.statusCode = code; return this },
                json(data) {
                  res.statusCode = this.statusCode
                  Object.entries(this._headers).forEach(([k, v]) => res.setHeader(k, v))
                  res.end(JSON.stringify(data))
                },
              }
              await mod.default(fakeReq, fakeRes)
            } catch (err) {
              console.error(`API error (${apiPath}):`, err)
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message || 'Internal error' }))
            }
          })
        }
      }

      server.middlewares.use('/api/membership', handleVercelApi(resolve(__dirname, 'api/membership.js')))
      server.middlewares.use('/api/send-email', handleVercelApi(resolve(__dirname, 'api/send-email.js')))

      server.middlewares.use('/api/delete-member', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { userId } = JSON.parse(body)
            if (!userId) { res.statusCode = 400; res.end(JSON.stringify({ error: 'userId is required' })); return }
            const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

            // Verify admin
            const authHeader = req.headers.authorization
            if (!authHeader?.startsWith('Bearer ')) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Unauthorized' })); return }
            const token = authHeader.replace('Bearer ', '')
            const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
            if (authErr || !user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Unauthorized' })); return }
            const { data: profile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
            if (!profile?.is_admin) { res.statusCode = 403; res.end(JSON.stringify({ error: 'Forbidden' })); return }
            if (userId === user.id) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Cannot delete yourself' })); return }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
            if (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error.message })); return }
            res.statusCode = 200
            res.end(JSON.stringify({ success: true }))
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Internal error' }))
          }
        })
      })
    },
  }
}

// Validate required env vars for production builds (skip in CI/local without vars)
if (process.env.VERCEL === '1') {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  base: '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
