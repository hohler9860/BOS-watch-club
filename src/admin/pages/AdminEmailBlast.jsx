import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import useAdminAuth from '../AdminAuth'
import s from '../admin.module.css'

export default function AdminEmailBlast() {
  const { getAdminToken } = useAdminAuth()

  // Form state
  const [subject, setSubject] = useState('')
  const [preview, setPreview] = useState('')
  const [heading, setHeading] = useState('')
  const [body, setBody] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [buttonHref, setButtonHref] = useState('')
  const [image, setImage] = useState('')

  // Audience state
  const [audience, setAudience] = useState('all')
  const [audienceValue, setAudienceValue] = useState('')
  const [events, setEvents] = useState([])
  const [recipientCount, setRecipientCount] = useState(null)
  const [countLoading, setCountLoading] = useState(false)

  // Send state
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Preview toggle
  const [showPreview, setShowPreview] = useState(false)

  // Load events for the event audience option
  useEffect(() => {
    supabase.from('events').select('id, name, date').order('date', { ascending: false })
      .then(({ data }) => setEvents(data || []))
  }, [])

  // Count recipients when audience changes
  useEffect(() => {
    let cancelled = false
    async function count() {
      setCountLoading(true)
      setRecipientCount(null)
      try {
        if (audience === 'all') {
          const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
          if (!cancelled) setRecipientCount(count || 0)
        } else if (audience === 'tier' && audienceValue) {
          const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('tier', audienceValue)
          if (!cancelled) setRecipientCount(count || 0)
        } else if (audience === 'event' && audienceValue) {
          const { count } = await supabase.from('rsvps').select('user_id', { count: 'exact', head: true }).eq('event_id', audienceValue)
          if (!cancelled) setRecipientCount(count || 0)
        } else {
          if (!cancelled) setRecipientCount(null)
        }
      } catch {
        if (!cancelled) setRecipientCount(null)
      }
      if (!cancelled) setCountLoading(false)
    }
    count()
    return () => { cancelled = true }
  }, [audience, audienceValue])

  // Generate preview HTML (mirrors customBlastEmail from emails/templates.js)
  const previewHtml = useMemo(() => {
    const colors = {
      bg: '#07090F', card: '#0D1018', text: '#E8ECF0',
      muted: 'rgba(232, 236, 240, 0.5)', accent: '#B8C4D4',
      border: 'rgba(232, 236, 240, 0.06)', faint: 'rgba(232, 236, 240, 0.3)',
      subtle: 'rgba(232, 236, 240, 0.35)',
    }
    const fonts = {
      display: "'Bebas Neue', 'Arial Narrow', sans-serif",
      body: "'Unbounded', sans-serif",
      sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }
    const SITE = 'https://boswatchclub.com'

    const imageBlock = image
      ? `<img src="${image}" alt="" style="width:100%;max-width:520px;border-radius:8px;margin:0 auto 24px auto;display:block;border:1px solid ${colors.border};" />`
      : ''
    const bodyHtml = body
      ? `<p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">${body.replace(/\n/g, '<br>')}</p>`
      : ''
    const btnBlock = buttonText && buttonHref
      ? `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:8px;">
          <a href="${buttonHref}" style="display:inline-block;background-color:${colors.accent};color:${colors.bg};font-family:${fonts.display};font-size:15px;font-weight:400;letter-spacing:3px;padding:14px 36px;border-radius:40px;text-decoration:none;text-align:center;">${buttonText}</a>
        </td></tr></table>`
      : ''

    return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8" />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500&family=Unbounded:wght@300;400&display=swap" rel="stylesheet" />
  <style>body{margin:0;padding:0;background-color:${colors.bg};font-family:${fonts.sans};}a{text-decoration:none;}</style>
</head><body style="margin:0;padding:0;background-color:${colors.bg};font-family:${fonts.sans};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.bg};">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr><td align="center" style="padding-bottom:24px;">
          <img src="${SITE}/assets/icon.png" alt="BOS Watch Club" width="48" height="48" style="filter:brightness(0) invert(1);display:block;margin:0 auto;" />
        </td></tr>
        <tr><td style="border-top:1px solid ${colors.border};"></td></tr>
        <tr><td style="padding:32px 0;">
          <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">${(heading || 'YOUR HEADING').toUpperCase()}</h1>
          ${imageBlock}
          ${bodyHtml || `<p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">Your email body text will appear here...</p>`}
          ${btnBlock}
        </td></tr>
        <tr><td style="border-top:1px solid ${colors.border};"></td></tr>
        <tr><td style="padding-top:32px;text-align:center;">
          <p style="font-family:${fonts.body};color:${colors.muted};font-size:10px;font-weight:300;letter-spacing:3px;margin:0 0 16px 0;">BOS WATCH CLUB / BOSTON, MA</p>
          <p style="margin:0 0 16px 0;">
            <a href="${SITE}/events" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">EVENTS</a>
            <span style="color:${colors.muted};font-size:10px;">&middot;</span>
            <a href="${SITE}/dashboard" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">DASHBOARD</a>
            <span style="color:${colors.muted};font-size:10px;">&middot;</span>
            <a href="${SITE}/blog" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">JOURNAL</a>
          </p>
          <p style="font-family:${fonts.sans};color:${colors.faint};font-size:10px;font-weight:300;line-height:1.5;margin:0;">
            You received this because you're a member at boswatchclub.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
  }, [heading, body, image, buttonText, buttonHref])

  async function handleSend() {
    setShowConfirm(false)
    setSending(true)
    setResult(null)
    setError('')

    try {
      const token = await getAdminToken()
      const res = await fetch('/api/send-blast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject, preview, heading, body, buttonText, buttonHref, image,
          audience, audienceValue: audience === 'all' ? undefined : audienceValue,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err.message)
    }
    setSending(false)
  }

  const canSend = subject && heading && body && (audience === 'all' || audienceValue)

  return (
    <div>
      <h1 className={s.pageTitle}>Email Blast</h1>
      <p className={s.pageSubtitle}>Compose and send a branded email to your members</p>

      {result && (
        <div className={s.card} style={{ marginBottom: 24, borderLeft: '3px solid #22c55e' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>
            Sent to {result.sent} member{result.sent !== 1 ? 's' : ''}
            {result.errors?.length > 0 && ` (${result.errors.length} failed)`}
          </p>
          {result.errors?.length > 0 && (
            <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13, color: '#ef4444' }}>
              {result.errors.map((e, i) => <li key={i}>{e.email}: {e.error}</li>)}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className={s.card} style={{ marginBottom: 24, borderLeft: '3px solid #ef4444' }}>
          <p style={{ margin: 0, color: '#ef4444' }}>{error}</p>
        </div>
      )}

      <div className={s.twoCol}>
        {/* Left: Compose Form */}
        <div className={s.card}>
          <h3 className={s.cardTitle}>Compose</h3>

          <div className={s.formGroup}>
            <label className={s.formLabel}>Subject Line *</label>
            <input className={s.formInput} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Spring Gathering This Saturday" />
          </div>

          <div className={s.formGroup}>
            <label className={s.formLabel}>Preview Text</label>
            <input className={s.formInput} value={preview} onChange={e => setPreview(e.target.value)} placeholder="Snippet shown in inbox preview" />
          </div>

          <div className={s.formGroup}>
            <label className={s.formLabel}>Heading *</label>
            <input className={s.formInput} value={heading} onChange={e => setHeading(e.target.value)} placeholder="e.g. YOU'RE INVITED" />
          </div>

          <div className={s.formGroup}>
            <label className={s.formLabel}>Body *</label>
            <textarea className={s.formTextarea} rows={6} value={body} onChange={e => setBody(e.target.value)} placeholder="Write your email message here..." />
          </div>

          <div className={s.formGroup}>
            <label className={s.formLabel}>Image URL (optional)</label>
            <input className={s.formInput} value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
          </div>

          <div className={s.formRow}>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Button Text (optional)</label>
              <input className={s.formInput} value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder="e.g. RSVP NOW" />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Button URL</label>
              <input className={s.formInput} value={buttonHref} onChange={e => setButtonHref(e.target.value)} placeholder="https://boswatchclub.com/..." />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

          <h3 className={s.cardTitle}>Audience</h3>

          <div className={s.formGroup}>
            <label className={s.formLabel}>Send To</label>
            <select className={s.formSelect} value={audience} onChange={e => { setAudience(e.target.value); setAudienceValue('') }}>
              <option value="all">All Members</option>
              <option value="tier">By Tier</option>
              <option value="event">Event RSVPs</option>
            </select>
          </div>

          {audience === 'tier' && (
            <div className={s.formGroup}>
              <label className={s.formLabel}>Tier</label>
              <select className={s.formSelect} value={audienceValue} onChange={e => setAudienceValue(e.target.value)}>
                <option value="">Select tier...</option>
                <option value="MEMBER">MEMBER</option>
                <option value="FOUNDING">FOUNDING</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          )}

          {audience === 'event' && (
            <div className={s.formGroup}>
              <label className={s.formLabel}>Event</label>
              <select className={s.formSelect} value={audienceValue} onChange={e => setAudienceValue(e.target.value)}>
                <option value="">Select event...</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} ({ev.date || 'no date'})</option>
                ))}
              </select>
            </div>
          )}

          <p style={{ fontSize: 13, color: '#6b7280', margin: '8px 0 16px' }}>
            {countLoading ? 'Counting...' : recipientCount !== null ? `${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}` : ''}
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className={`${s.btn} ${s.btnPrimary}`}
              disabled={!canSend || sending}
              onClick={() => setShowConfirm(true)}
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
            <button
              className={`${s.btn} ${s.btnOutline}`}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Right: Live Preview */}
        {showPreview && (
          <div className={s.card} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 className={s.cardTitle} style={{ margin: 0 }}>Preview</h3>
            </div>
            <iframe
              srcDoc={previewHtml}
              title="Email Preview"
              style={{ width: '100%', height: 700, border: 'none', display: 'block' }}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={s.modalOverlay} onClick={() => setShowConfirm(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>Confirm Send</h3>
            <p style={{ margin: '12px 0' }}>
              <strong>Subject:</strong> {subject}
            </p>
            <p style={{ margin: '0 0 12px' }}>
              <strong>Audience:</strong>{' '}
              {audience === 'all' && 'All Members'}
              {audience === 'tier' && `Tier: ${audienceValue}`}
              {audience === 'event' && `Event RSVPs: ${events.find(e => e.id === audienceValue)?.name || audienceValue}`}
              {recipientCount !== null && ` (${recipientCount} recipient${recipientCount !== 1 ? 's' : ''})`}
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>
              This will send an email to all selected recipients. This action cannot be undone.
            </p>
            <div className={s.btnGroup}>
              <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSend}>Send Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
