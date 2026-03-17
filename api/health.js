import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const checks = { supabase: 'unknown' }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { error } = await supabase.from('profiles').select('id').limit(1)
    checks.supabase = error ? 'error' : 'ok'
  } catch {
    checks.supabase = 'error'
  }

  const healthy = checks.supabase === 'ok'
  return res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'degraded', checks })
}
