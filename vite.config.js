import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

function devApiPlugin() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api/check-email', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { email } = JSON.parse(body)
            if (!email) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Email required' })); return }
            const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
            const { data, error } = await supabase.auth.admin.getUserByEmail(email.trim().toLowerCase())
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ exists: !error && !!data?.user }))
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Internal error' }))
          }
        })
      })

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
            const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
            const { error } = await supabase.auth.admin.deleteUser(userId)
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

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  base: '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
