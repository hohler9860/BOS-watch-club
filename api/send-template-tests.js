// TEMPORARY endpoint: batch-sends every email template to Henry for design
// review, then gets deleted. Recipient is hardcoded, a one-time token is
// required, and the endpoint self-expires — safe even though the repo is public.
import { Resend } from 'resend'
import { rateLimit } from './_lib/rateLimit.js'
import * as t from '../emails/templates.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'BOS Watch Club <hello@boswatchclub.com>'
const TO = 'dialedbyh@gmail.com'
const TOKEN = 'fda82b11d442b7e5dbe632de0fedfd46'
const EXPIRES = Date.parse('2026-07-31T00:00:00Z')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (Date.now() > EXPIRES) return res.status(410).json({ error: 'Expired' })
  if (req.body?.token !== TOKEN) return res.status(401).json({ error: 'Unauthorized' })
  const { limited } = rateLimit(req, { window: 60_000, max: 2 })
  if (limited) return res.status(429).json({ error: 'Too many requests' })

  const event = {
    firstName: 'Henry',
    eventName: 'Summer Rooftop Social',
    venue: 'Contessa, Newbury St',
    date: 'Thursday, August 14',
    time: '7:00 PM',
    dressCode: 'Smart casual',
    access: 'Members + one guest',
    description: 'An evening of watches and cocktails overlooking Back Bay.',
  }

  const tests = [
    ['signup', t.signupEmail({ firstName: 'Henry' })],
    ['application received', t.applicationReceivedEmail({ firstName: 'Henry' })],
    ['acceptance', t.acceptanceEmail({ firstName: 'Henry', accessCode: 'BWC-TEST-1234' })],
    ['invitation', t.invitationEmail({ firstName: 'Henry', accessCode: 'BWC-TEST-1234' })],
    ['rejection', t.rejectionEmail({ firstName: 'Henry' })],
    ['waitlist', t.waitlistEmail({ firstName: 'Henry' })],
    ['purchase', t.purchaseEmail({ firstName: 'Henry', tier: 'COLLECTOR' })],
    ['upgrade', t.upgradeEmail({ firstName: 'Henry', previousTier: 'ENTHUSIAST', newTier: 'COLLECTOR' })],
    ['new event', t.newEventEmail(event)],
    ['rsvp confirm', t.rsvpConfirmEmail(event)],
    ['guest invite', t.guestInviteEmail({ ...event, guestName: 'Stelios', memberName: 'Henry Ohler', guestId: 'test-guest-id' })],
    ['event reminder', t.eventReminderEmail(event)],
    ['guest reminder', t.guestReminderEmail({ ...event, guestName: 'Stelios', memberName: 'Henry Ohler' })],
    ['new content', t.newContentEmail({ firstName: 'Henry', contentType: 'news', title: 'The State of the Boston Watch Scene', preview: 'A look at where collecting in Boston is headed this fall.' })],
    ['custom blast', t.customBlastEmail({ preview: 'Big news from the club', heading: 'August at BOS Watch Club', body: 'Here is what is coming up this month, including our rooftop social and two new member spotlights.', buttonText: "See What's On", buttonHref: 'https://boswatchclub.com/events' })],
    ['account deleted', t.accountDeletedEmail({ firstName: 'Henry' })],
  ]

  const { data, error } = await resend.batch.send(
    tests.map(([name, html], i) => ({
      from: FROM,
      to: TO,
      subject: `[TEST ${String(i + 1).padStart(2, '0')}/16] ${name}`,
      html,
    }))
  )
  if (error) return res.status(500).json({ error })
  return res.status(200).json({ success: true, sent: data?.data?.length ?? tests.length })
}
