import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAdminAuth from '../AdminAuth'
import s from '../admin.module.css'

const PAYMENT_TYPES = [
  { value: 'on_us', label: 'Free (On Us)' },
  { value: 'pay_during', label: 'Pay Your Own' },
  { value: 'pay_after', label: 'Pay at Event (Split)' },
  { value: 'upfront', label: 'Upfront Payment Required' },
]

const TIER_OPTIONS = [
  { value: 'member', label: 'All Members' },
]

const emptyForm = {
  name: '', tagline: '', description: '', longDescription: '',
  venue: '', location: '', date: '', time: '', datetime: '',
  access: 'All Members', capacity: '30 guests', dressCode: 'Smart Casual',
  image: '', payment_type: 'on_us', price: '', tier_minimum: 'member',
  cancellation_fee: '', depositAmount: '', status: 'published', month: '', day: '',
  invited_users: [], guest_policy: 'members_only',
}

export default function AdminEvents() {
  const { admin, getAdminToken } = useAdminAuth()
  const [eventsList, setEventsList] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [cancelConfirm, setCancelConfirm] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [rsvpProfiles, setRsvpProfiles] = useState({})
  const [eventGuests, setEventGuests] = useState([])
  const [adminGuestForm, setAdminGuestForm] = useState({ name: '', email: '', dob: '' })
  const [adminGuestError, setAdminGuestError] = useState(null)
  const [adminGuestSuccess, setAdminGuestSuccess] = useState(false)
  const [adminGuestLoading, setAdminGuestLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState('upcoming')

  // All profiles for the invite list selector
  const [allProfiles, setAllProfiles] = useState([])
  const [inviteSearch, setInviteSearch] = useState('')

  useEffect(() => {
    async function fetchEvents() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('events')
          .select('*')
          .order('datetime', { ascending: false })
        if (err) throw err
        // Normalize DB columns to camelCase fields used in the UI
        setEventsList(data.map(normalizeEvent))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Fetch all member profiles once so the invite picker is ready when the form opens
  useEffect(() => {
    if (!supabase) return
    supabase
      .from('profiles')
      .select('id, name, tier, role')
      .order('name', { ascending: true })
      .then(({ data }) => { if (data) setAllProfiles(data) })
  }, [])

  // Map snake_case DB columns to camelCase UI fields
  function normalizeEvent(ev) {
    return {
      ...ev,
      longDescription: ev.long_description,
      dressCode: ev.dress_code,
      invited_users: ev.invited_users || [],
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!supabase) return
    setError(null)

    const dt = form.datetime || `${form.date}T18:00:00`
    const d = new Date(dt)
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

    const payload = {
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      long_description: form.longDescription,
      venue: form.venue,
      location: form.location,
      date: form.date,
      time: form.time,
      datetime: dt,
      access: form.access,
      capacity: form.capacity,
      dress_code: form.dressCode,
      image: form.image || null,
      payment_type: form.payment_type,
      price: form.price ? Number(form.price) : null,
      tier_minimum: form.tier_minimum,
      cancellation_fee: form.cancellation_fee ? Number(form.cancellation_fee) : null,
      deposit_amount: form.depositAmount ? Number(form.depositAmount) * 100 : 0,
      status: form.status,
      month: form.month || months[d.getMonth()],
      day: form.day || String(d.getDate()),
      // Store null when list is empty so the dashboard treats it as open to all
      invited_users: form.invited_users.length > 0 ? form.invited_users : null,
      guest_policy: form.guest_policy,
    }

    try {
      if (editing) {
        const { error: err } = await supabase.from('events').update(payload).eq('id', selected.id)
        if (err) throw err
        const updated = normalizeEvent({ ...selected, ...payload })
        setEventsList(prev => prev.map(ev => ev.id === selected.id ? updated : ev))
        setSelected(updated)
      } else {
        const id = `event-${Date.now()}`
        const { data, error: err } = await supabase.from('events').insert({ ...payload, id }).select().single()
        if (err) throw err
        setEventsList(prev => [normalizeEvent(data), ...prev])

        // Notify members of new published event
        if (payload.status === 'published') {
          fetch('/api/notify-new-event', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAdminToken() || ''}`,
            },
            body: JSON.stringify({
              eventName: payload.name,
              venue: payload.venue,
              date: payload.date,
              time: payload.time,
              dressCode: payload.dress_code,
              access: payload.access,
              tierMinimum: payload.tier_minimum,
              description: payload.description || '',
              image: payload.image || '',
            }),
          }).catch(err => console.error('Event notification failed:', err))
        }
      }
      setShowForm(false)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCancelEvent(id) {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
      if (err) throw err
      setEventsList(prev => prev.map(e => e.id === id ? { ...e, status: 'cancelled' } : e))
      setSelected(prev => prev ? { ...prev, status: 'cancelled' } : null)
      setCancelConfirm(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteEvent(id) {
    if (!supabase) return
    setError(null)
    try {
      await supabase.from('rsvps').delete().eq('event_id', id)
      const { error: err } = await supabase.from('events').delete().eq('id', id)
      if (err) throw err
      setEventsList(prev => prev.filter(e => e.id !== id))
      setSelected(null)
      setDeleteConfirm(null)
    } catch (err) {
      setError(err.message)
    }
  }

  function exportCsv(eventId, title) {
    const rows = rsvps.map(r => {
      const profile = rsvpProfiles[r.user_id]
      const isPaid = profile?.role === 'member' || profile?.role === 'founding_member' || profile?.role === 'vip'
      return `"${profile?.name || ''}","${profile?.tier || ''}","${isPaid ? 'Paid' : 'Free'}","Member","${r.created_at?.split('T')[0] || ''}"`
    })
    const guestRows = eventGuests.map(g => {
      return `"${g.name}","—","—","Guest of ${g.inviter_name || 'Unknown'}","${g.created_at?.split('T')[0] || ''}"`
    })
    const csv = ['Name,Tier,Membership,Type,RSVP Date', ...rows, ...guestRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-guest-list.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function openEdit(event) {
    setForm({
      ...event,
      price: event.price || '',
      cancellation_fee: event.cancellation_fee || '',
      depositAmount: event.deposit_amount ? (event.deposit_amount / 100).toString() : '',
      invited_users: event.invited_users || [],
    })
    setInviteSearch('')
    setEditing(true)
    setShowForm(true)
  }

  async function fetchRsvps(eventId) {
    if (!supabase) return
    setRsvps([])
    setRsvpProfiles({})
    setEventGuests([])
    const { data } = await supabase.rpc('get_event_rsvps', { p_event_id: eventId })
    if (data && data.length > 0) {
      // data rows: { rsvp_id, user_id, rsvp_date, name, email, tier, role }
      setRsvps(data.map(r => ({ id: r.rsvp_id, user_id: r.user_id, created_at: r.rsvp_date })))
      const map = {}
      for (const r of data) map[r.user_id] = { name: r.name, email: r.email, tier: r.tier, role: r.role }
      setRsvpProfiles(map)
    }
    const { data: guestData } = await supabase.rpc('get_event_guests', { p_event_id: eventId })
    if (guestData) setEventGuests(guestData)
  }

  // Toggle a user in/out of the invite list
  function toggleInvitedUser(userId) {
    setForm(prev => {
      const current = prev.invited_users || []
      return {
        ...prev,
        invited_users: current.includes(userId)
          ? current.filter(id => id !== userId)
          : [...current, userId],
      }
    })
  }

  async function removeInvitedUser(eventId, userId) {
    const event = events.find(e => e.id === eventId)
    if (!event) return
    const updated = (event.invited_users || []).filter(id => id !== userId)
    await supabase.from('events').update({ invited_users: updated.length > 0 ? updated : null }).eq('id', eventId)
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, invited_users: updated } : e))
  }

  function handleDobInput(e) {
    let v = e.target.value.replace(/\D/g, '') // strip non-digits
    if (v.length > 8) v = v.slice(0, 8)
    // Insert slashes: MM/DD/YYYY
    if (v.length >= 5) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4)
    else if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
    setAdminGuestForm(prev => ({ ...prev, dob: v }))
  }

  async function handleAdminGuestInvite(e) {
    e.preventDefault()
    setAdminGuestError(null)
    setAdminGuestSuccess(false)

    const { name, email, dob } = adminGuestForm
    if (!name.trim() || !email.trim() || !dob.trim()) {
      setAdminGuestError('All fields are required.')
      return
    }

    // Validate DOB format and age
    const dobMatch = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!dobMatch) {
      setAdminGuestError('DOB must be in MM/DD/YYYY format.')
      return
    }
    const [, mm, dd, yyyy] = dobMatch
    const birth = new Date(`${yyyy}-${mm}-${dd}`)
    if (isNaN(birth.getTime())) {
      setAdminGuestError('Please enter a valid date of birth.')
      return
    }
    const today = new Date()
    const age = today.getFullYear() - birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
    if (age < 18) {
      setAdminGuestError('Guest must be 18 or older.')
      return
    }

    setAdminGuestLoading(true)
    try {
      // Ensure admin has an RSVP for this event (upsert to avoid duplicates)
      const { data: rsvpData, error: rsvpErr } = await supabase
        .from('rsvps')
        .upsert({ user_id: admin.id, event_id: selected.id }, { onConflict: 'user_id,event_id' })
        .select('id')
        .single()
      if (rsvpErr) throw rsvpErr

      const { data: inserted, error: insertErr } = await supabase
        .from('event_guests')
        .insert({
          rsvp_id: rsvpData.id,
          event_id: selected.id,
          invited_by: admin.id,
          name: name.trim(),
          email: email.trim(),
          date_of_birth: `${yyyy}-${mm}-${dd}`,
          status: 'pending',
        })
        .select()
        .single()
      if (insertErr) throw insertErr

      // Send invitation email
      await fetch('/api/notify-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: inserted.id,
          guestName: name.trim(),
          guestEmail: email.trim(),
          memberName: 'BOS Watch Club',
          eventName: selected.name,
          venue: selected.venue,
          date: selected.date,
          time: selected.time,
          dressCode: selected.dressCode,
        }),
      })

      // Refresh guest list
      const { data: guestData } = await supabase.rpc('get_event_guests', { p_event_id: selected.id })
      if (guestData) setEventGuests(guestData)

      setAdminGuestForm({ name: '', email: '', dob: '' })
      setAdminGuestSuccess(true)
      setTimeout(() => setAdminGuestSuccess(false), 4000)
    } catch (err) {
      setAdminGuestError(err.message)
    } finally {
      setAdminGuestLoading(false)
    }
  }

  if (loading) return <div className={s.loading}>Loading events...</div>

  // ── Detail View ──
  if (selected && !showForm) {
    const invitedCount = selected.invited_users?.length || 0
    return (
      <div>
        {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
        <button className={s.backBtn} onClick={() => { setSelected(null); setRsvps([]); setRsvpProfiles({}); setEventGuests([]) }}>&larr; Back to Events</button>
        <div className={s.detailPanel}>
          <div className={s.detailHeader}>
            <div>
              <div className={s.detailName}>{selected.name}</div>
              <div style={{ marginTop: 4 }}>
                <span className={`${s.badge} ${selected.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{selected.status}</span>
                {' '}<span className={`${s.badge} ${s.badgeBlue}`}>{selected.payment_type}</span>
                {' '}<span className={`${s.badge} ${s.badgePurple}`}>{selected.tier_minimum}+</span>
                {' '}<span className={`${s.badge} ${selected.guest_policy === 'members_plus_one' ? s.badgeGreen : s.badgeGray}`}>{selected.guest_policy === 'members_plus_one' ? '+1 Allowed' : 'Members Only'}</span>
                {invitedCount > 0 && <>{' '}<span className={`${s.badge} ${s.badgeGray}`}>Invite-only ({invitedCount})</span></>}
              </div>
            </div>
            <div className={s.btnGroup} style={{ marginTop: 0 }}>
              <button className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`} onClick={() => openEdit(selected)}>Edit</button>
              <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => exportCsv(selected.id, selected.name)}>Export CSV</button>
              <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setCancelConfirm(selected)}>Cancel Event</button>
              <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setDeleteConfirm(selected)} style={{ background: '#7f1d1d' }}>Delete</button>
            </div>
          </div>

          {selected.tagline && <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16, fontStyle: 'italic' }}>{selected.tagline}</p>}

          <div className={s.detailGrid} style={{ marginBottom: 20 }}>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Date</div><div className={s.detailItemValue}>{selected.date}</div></div>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Time</div><div className={s.detailItemValue}>{selected.time}</div></div>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Venue</div><div className={s.detailItemValue}>{selected.venue}</div></div>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Location</div><div className={s.detailItemValue}>{selected.location}</div></div>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Capacity</div><div className={s.detailItemValue}>{selected.capacity}</div></div>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Dress Code</div><div className={s.detailItemValue}>{selected.dressCode}</div></div>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Access</div><div className={s.detailItemValue}>{selected.access}</div></div>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Guest Policy</div><div className={s.detailItemValue}>{selected.guest_policy === 'members_plus_one' ? 'Members + 1 Guest' : 'Members Only'}</div></div>
            <div className={s.detailItem}><div className={s.detailItemLabel}>Payment</div><div className={s.detailItemValue}>{selected.payment_type}{selected.price ? ` — $${selected.price}` : ''}</div></div>
            {selected.cancellation_fee && <div className={s.detailItem}><div className={s.detailItemLabel}>Cancel Fee</div><div className={s.detailItemValue}>${selected.cancellation_fee} (within 24h)</div></div>}
            {selected.image && <div className={s.detailItem}><div className={s.detailItemLabel}>Image</div><div className={s.detailItemValue}>{selected.image}</div></div>}
          </div>

          {selected.description && <div className={s.detailSection}><div className={s.detailSectionTitle}>Short Description</div><p style={{ fontSize: 14, color: '#374151' }}>{selected.description}</p></div>}
          {selected.longDescription && <div className={s.detailSection}><div className={s.detailSectionTitle}>Full Description</div><p style={{ fontSize: 14, color: '#374151', whiteSpace: 'pre-line' }}>{selected.longDescription}</p></div>}

          {invitedCount > 0 && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Invite List ({invitedCount} users)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(selected.invited_users || []).map(uid => {
                  const p = allProfiles.find(x => x.id === uid)
                  return (
                    <span
                      key={uid}
                      className={`${s.badge} ${s.badgeGray}`}
                      style={{ fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      onClick={() => removeInvitedUser(selected.id, uid)}
                      title="Click to uninvite"
                    >
                      {p ? `${p.name} (${p.tier || '—'})` : uid}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <div className={s.detailSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className={s.detailSectionTitle}>RSVPs ({rsvps.length} members{eventGuests.length > 0 ? ` + ${eventGuests.length} guests` : ''} — {rsvps.length + eventGuests.length} total)</div>
              {rsvps.length > 0 && (
                <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => exportCsv(selected.id, selected.name)}>Export CSV</button>
              )}
            </div>
            {rsvps.length === 0 ? (
              <div className={s.empty}><p className={s.emptyText}>No RSVPs yet</p></div>
            ) : (
              <table className={s.table}>
                <thead><tr><th>Name</th><th>Email</th><th>Tier</th><th>Membership</th><th>RSVP Date</th></tr></thead>
                <tbody>
                  {rsvps.map(r => {
                    const profile = rsvpProfiles[r.user_id]
                    const isPaid = profile?.role === 'member' || profile?.role === 'founding_member' || profile?.role === 'vip'
                    return (
                      <tr key={r.id}>
                        <td>{profile?.name || '—'}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{profile?.email || '—'}</td>
                        <td><span className={`${s.badge} ${s.badgePurple}`}>{profile?.tier || '—'}</span></td>
                        <td><span className={`${s.badge} ${isPaid ? s.badgeGreen : s.badgeGray}`}>{isPaid ? 'Paid' : 'Free'}</span></td>
                        <td>{r.created_at ? r.created_at.split('T')[0] : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            {eventGuests.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Guests (+1)</div>
                <table className={s.table}>
                  <thead><tr><th>Guest Name</th><th>Email</th><th>DOB</th><th>Invited By</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {eventGuests.map(g => (
                      <tr key={g.guest_id}>
                        <td>{g.name}</td>
                        <td style={{ fontSize: 12, color: '#6b7280' }}>{g.email}</td>
                        <td>{g.date_of_birth}</td>
                        <td>{g.inviter_name || '—'}</td>
                        <td>
                          <span className={`${s.badge} ${
                            (g.status || 'pending') === 'accepted' ? s.badgeGreen :
                            (g.status || 'pending') === 'declined' ? s.badgeRed :
                            s.badgeYellow
                          }`}>{g.status || 'pending'}</span>
                        </td>
                        <td>{g.created_at ? g.created_at.split('T')[0] : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Admin Invite Guest ── */}
          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>Invite Guest</div>
            <form onSubmit={handleAdminGuestInvite}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
                <div>
                  <label className={s.formLabel} style={{ display: 'block', marginBottom: 4 }}>Name</label>
                  <input
                    className={s.formInput}
                    placeholder="Guest full name"
                    value={adminGuestForm.name}
                    onChange={e => setAdminGuestForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={s.formLabel} style={{ display: 'block', marginBottom: 4 }}>Email</label>
                  <input
                    className={s.formInput}
                    type="email"
                    placeholder="guest@email.com"
                    value={adminGuestForm.email}
                    onChange={e => setAdminGuestForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={s.formLabel} style={{ display: 'block', marginBottom: 4 }}>Date of Birth</label>
                  <input
                    className={s.formInput}
                    placeholder="MM/DD/YYYY"
                    value={adminGuestForm.dob}
                    onChange={handleDobInput}
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className={`${s.btn} ${s.btnPrimary}`}
                    disabled={adminGuestLoading}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {adminGuestLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </div>
              {adminGuestError && (
                <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{adminGuestError}</p>
              )}
              {adminGuestSuccess && (
                <p style={{ fontSize: 12, color: '#059669', marginTop: 8 }}>Invitation sent successfully.</p>
              )}
            </form>
          </div>
        </div>

        {cancelConfirm && (
          <div className={s.modalOverlay} onClick={() => setCancelConfirm(null)}>
            <div className={s.modalContent} onClick={e => e.stopPropagation()}>
              <div className={s.modalTitle}>Cancel Event</div>
              <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>Are you sure you want to cancel <strong>{cancelConfirm.name}</strong>? This will set its status to cancelled.</p>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleCancelEvent(cancelConfirm.id)}>Yes, Cancel Event</button>
                <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setCancelConfirm(null)}>Keep Event</button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className={s.modalOverlay} onClick={() => setDeleteConfirm(null)}>
            <div className={s.modalContent} onClick={e => e.stopPropagation()}>
              <div className={s.modalTitle}>Delete Event Permanently</div>
              <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>Are you sure you want to permanently delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleDeleteEvent(deleteConfirm.id)}>Yes, Delete Forever</button>
                <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setDeleteConfirm(null)}>Keep Event</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Create/Edit Form ──
  if (showForm) {
    const invitedSet = new Set(form.invited_users || [])
    const filteredProfiles = allProfiles.filter(p => {
      if (!inviteSearch.trim()) return true
      const q = inviteSearch.toLowerCase()
      return (p.name || '').toLowerCase().includes(q) || (p.tier || '').toLowerCase().includes(q)
    })

    return (
      <div>
        {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
        <button className={s.backBtn} onClick={() => { setShowForm(false); setEditing(false) }}>&larr; Back</button>
        <div className={s.card}>
          <div className={s.cardTitle}>{editing ? 'Edit Event' : 'Create Event'}</div>
          <form onSubmit={handleSave}>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Event Name</label><input className={s.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Tagline</label><input className={s.formInput} value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} /></div>
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Short Description</label><textarea className={s.formTextarea} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Full Description</label><textarea className={s.formTextarea} style={{ minHeight: 120 }} value={form.longDescription} onChange={e => setForm(p => ({ ...p, longDescription: e.target.value }))} /></div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Date (display)</label><input className={s.formInput} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="April 5, 2026" required /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Time</label><input className={s.formInput} value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="7:00 PM - 10:00 PM" /></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Datetime (ISO)</label><input className={s.formInput} type="datetime-local" value={form.datetime?.slice(0, 16) || ''} onChange={e => setForm(p => ({ ...p, datetime: e.target.value }))} required /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Image URL</label><input className={s.formInput} value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." /></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Venue Name</label><input className={s.formInput} value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} required /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Location</label><input className={s.formInput} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Capacity</label><input className={s.formInput} value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Dress Code</label><input className={s.formInput} value={form.dressCode} onChange={e => setForm(p => ({ ...p, dressCode: e.target.value }))} /></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Payment Type</label>
                <select className={s.formSelect} value={form.payment_type} onChange={e => setForm(p => ({ ...p, payment_type: e.target.value }))}>{PAYMENT_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}</select></div>
              <div className={s.formGroup}><label className={s.formLabel}>Price ($)</label><input className={s.formInput} type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0" /></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Cancellation Fee ($)</label><input className={s.formInput} type="number" value={form.cancellation_fee} onChange={e => setForm(p => ({ ...p, cancellation_fee: e.target.value }))} placeholder="0 (none)" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Deposit Amount ($)</label><input className={s.formInput} type="number" value={form.depositAmount} onChange={e => setForm(p => ({ ...p, depositAmount: e.target.value }))} placeholder="0 (none)" /></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Tier Minimum</label>
                <select className={s.formSelect} value={form.tier_minimum} onChange={e => setForm(p => ({ ...p, tier_minimum: e.target.value }))}>{TIER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div className={s.formGroup}><label className={s.formLabel}>Status</label>
                <select className={s.formSelect} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="published">Published</option><option value="draft">Draft</option></select></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Guest Policy</label>
                <select className={s.formSelect} value={form.guest_policy} onChange={e => setForm(p => ({ ...p, guest_policy: e.target.value }))}>
                  <option value="members_only">Members Only</option>
                  <option value="members_plus_one">Members + 1 Guest</option>
                </select>
              </div>
              <div className={s.formGroup}><label className={s.formLabel}>Access Label</label><input className={s.formInput} value={form.access} onChange={e => setForm(p => ({ ...p, access: e.target.value }))} placeholder="All Members" /></div>
            </div>

            {/* ── Invite List ── */}
            <div className={s.formGroup}>
              <label className={s.formLabel}>
                Invite List
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9ca3af', marginLeft: 6 }}>
                  optional — leave empty to allow all members matching the tier minimum
                </span>
              </label>

              {invitedSet.size > 0 && (
                <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {Array.from(invitedSet).map(uid => {
                    const p = allProfiles.find(x => x.id === uid)
                    return (
                      <span
                        key={uid}
                        className={`${s.badge} ${s.badgePurple}`}
                        style={{ fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => toggleInvitedUser(uid)}
                        title="Click to remove"
                      >
                        {p ? p.name : uid}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </span>
                    )
                  })}
                  <button
                    type="button"
                    style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                    onClick={() => setForm(p => ({ ...p, invited_users: [] }))}
                  >
                    Clear all
                  </button>
                </div>
              )}

              <input
                className={s.formInput}
                placeholder="Search members by name or tier..."
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                style={{ marginBottom: 6 }}
              />
              <div style={{ border: '1px solid #d1d5db', borderRadius: 8, maxHeight: 220, overflowY: 'auto', background: '#fff' }}>
                {filteredProfiles.length === 0 && (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>No members found</div>
                )}
                {filteredProfiles.map(p => (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: 13,
                      color: '#374151',
                      background: invitedSet.has(p.id) ? '#f5f3ff' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={invitedSet.has(p.id)}
                      onChange={() => toggleInvitedUser(p.id)}
                      style={{ accentColor: '#6366f1', width: 15, height: 15, flexShrink: 0 }}
                    />
                    <span style={{ fontWeight: invitedSet.has(p.id) ? 600 : 400 }}>{p.name || '(unnamed)'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>{p.tier || '—'}</span>
                  </label>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                {invitedSet.size === 0
                  ? 'No restrictions — any member meeting the tier minimum can RSVP.'
                  : `${invitedSet.size} user${invitedSet.size === 1 ? '' : 's'} selected. Only these users will be able to RSVP.`}
              </div>
            </div>

            <div className={s.btnGroup}>
              <button className={`${s.btn} ${s.btnPrimary}`} type="submit">{editing ? 'Save Changes' : 'Create Event'}</button>
              <button className={`${s.btn} ${s.btnOutline}`} type="button" onClick={() => { setShowForm(false); setEditing(false) }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ── List View ──
  const now = new Date()
  const upcomingList = eventsList.filter(e => new Date(e.datetime || e.date) >= now)
  const pastList = eventsList.filter(e => new Date(e.datetime || e.date) < now)
  const filteredList = timeFilter === 'all' ? eventsList : timeFilter === 'past' ? pastList : upcomingList

  return (
    <div>
      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Events</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => { setForm(emptyForm); setInviteSearch(''); setEditing(false); setShowForm(true) }}>+ New Event</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button
          className={`${s.btn} ${timeFilter === 'upcoming' ? s.btnPrimary : s.btnOutline}`}
          style={{ fontSize: 12, padding: '6px 14px' }}
          onClick={() => setTimeFilter('upcoming')}
        >Upcoming ({upcomingList.length})</button>
        <button
          className={`${s.btn} ${timeFilter === 'past' ? s.btnPrimary : s.btnOutline}`}
          style={{ fontSize: 12, padding: '6px 14px' }}
          onClick={() => setTimeFilter('past')}
        >Past ({pastList.length})</button>
        <button
          className={`${s.btn} ${timeFilter === 'all' ? s.btnPrimary : s.btnOutline}`}
          style={{ fontSize: 12, padding: '6px 14px' }}
          onClick={() => setTimeFilter('all')}
        >All ({eventsList.length})</button>
      </div>
      <div className={s.card}>
        <table className={s.table}>
          <thead><tr><th>Name</th><th>Date</th><th>Venue</th><th>Payment</th><th>Tier</th><th>Guest</th><th>Invite</th><th>Status</th></tr></thead>
          <tbody>
            {filteredList.map(ev => {
              const isPast = new Date(ev.datetime || ev.date) < now
              return (
                <tr key={ev.id} className={s.tableClickable} onClick={() => { setSelected(ev); fetchRsvps(ev.id) }} style={isPast ? { opacity: 0.6 } : undefined}>
                  <td>
                    {ev.name}
                    {isPast && <span className={`${s.badge} ${s.badgeGray}`} style={{ marginLeft: 6, fontSize: 9 }}>PAST</span>}
                  </td>
                  <td>{ev.date}</td><td>{ev.venue}</td>
                  <td><span className={`${s.badge} ${s.badgeBlue}`}>{ev.payment_type}</span></td>
                  <td><span className={`${s.badge} ${s.badgePurple}`}>{ev.tier_minimum}</span></td>
                  <td><span className={`${s.badge} ${ev.guest_policy === 'members_plus_one' ? s.badgeGreen : s.badgeGray}`}>{ev.guest_policy === 'members_plus_one' ? '+1' : '—'}</span></td>
                  <td>
                    {ev.invited_users?.length > 0
                      ? <span className={`${s.badge} ${s.badgeGray}`}>{ev.invited_users.length} users</span>
                      : <span style={{ color: '#9ca3af', fontSize: 12 }}>Open</span>}
                  </td>
                  <td><span className={`${s.badge} ${ev.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{ev.status}</span></td>
                </tr>
              )
            })}
            {filteredList.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
                {timeFilter === 'past' ? 'No past events' : timeFilter === 'upcoming' ? 'No upcoming events' : 'No events yet'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
