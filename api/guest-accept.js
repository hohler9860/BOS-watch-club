import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SITE = process.env.SITE_URL || 'https://boswatchclub.com'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const guestId = req.query.id
  if (!guestId) {
    return res.status(400).send('Missing guest ID')
  }

  try {
    const { data: guest, error: fetchErr } = await supabase
      .from('event_guests')
      .select('id, status, name, event_id')
      .eq('id', guestId)
      .single()

    if (fetchErr || !guest) {
      return res.redirect(`${SITE}/guest-response?status=not-found`)
    }

    if (guest.status === 'accepted') {
      return res.redirect(`${SITE}/guest-response?status=already-accepted&name=${encodeURIComponent(guest.name)}`)
    }

    const { error: updateErr } = await supabase
      .from('event_guests')
      .update({ status: 'accepted' })
      .eq('id', guestId)

    if (updateErr) throw updateErr

    return res.redirect(`${SITE}/guest-response?status=accepted&name=${encodeURIComponent(guest.name)}`)
  } catch (err) {
    console.error('Guest accept failed:', err)
    return res.status(500).send('Something went wrong')
  }
}
