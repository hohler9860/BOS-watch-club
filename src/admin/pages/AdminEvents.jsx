import { useState } from 'react'
import { ADMIN_EVENTS, ADMIN_MEMBERS } from '../../data/adminData'
import s from '../admin.module.css'

const PAYMENT_TYPES = [
  { value: 'on_us', label: 'Free (On Us)' },
  { value: 'pay_during', label: 'Pay Your Own' },
  { value: 'pay_after', label: 'Pay at Event (Split)' },
  { value: 'upfront', label: 'Upfront Payment Required' },
]

const TIER_OPTIONS = [
  { value: 'enthusiast', label: 'All Members' },
  { value: 'collector', label: 'Collector & Above' },
  { value: 'patron', label: 'Patron Only' },
]

const emptyForm = {
  name: '', tagline: '', description: '', longDescription: '',
  venue: '', location: '', date: '', time: '', datetime: '',
  access: 'All Members', capacity: '30 guests', dressCode: 'Smart Casual',
  image: '', payment_type: 'on_us', price: '', tier_minimum: 'enthusiast',
  cancellation_fee: '', status: 'draft', month: '', day: '',
}

export default function AdminEvents() {
  const [eventsList, setEventsList] = useState(ADMIN_EVENTS)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [cancelConfirm, setCancelConfirm] = useState(null)

  function handleSave(e) {
    e.preventDefault()
    const id = editing ? selected.id : `event-${Date.now()}`
    const dt = form.datetime || `${form.date}T18:00:00`
    const d = new Date(dt)
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
    const event = {
      ...form, id, datetime: dt,
      month: form.month || months[d.getMonth()],
      day: form.day || String(d.getDate()),
      price: form.price ? Number(form.price) : null,
      cancellation_fee: form.cancellation_fee ? Number(form.cancellation_fee) : null,
    }
    if (editing) {
      setEventsList(prev => prev.map(ev => ev.id === id ? event : ev))
      setSelected(event)
    } else {
      setEventsList(prev => [...prev, event])
    }
    setShowForm(false)
    setEditing(false)
  }

  function handleCancelEvent(id) {
    setEventsList(prev => prev.filter(e => e.id !== id))
    setSelected(null)
    setCancelConfirm(null)
  }

  function getRsvpMembers(eventId) {
    return ADMIN_MEMBERS.filter(m => m.rsvps?.includes(eventId))
  }

  function exportCsv(eventId, title) {
    const members = getRsvpMembers(eventId)
    const csv = ['Name,Email,Tier,Status', ...members.map(m =>
      `"${m.name}","${m.email}","${m.tier}","${m.status}"`
    )].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-guest-list.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function openEdit(event) {
    setForm({ ...event, price: event.price || '', cancellation_fee: event.cancellation_fee || '' })
    setEditing(true)
    setShowForm(true)
  }

  // ── Detail View ──
  if (selected && !showForm) {
    const rsvpMembers = getRsvpMembers(selected.id)
    return (
      <div>
        <button className={s.backBtn} onClick={() => setSelected(null)}>&larr; Back to Events</button>
        <div className={s.detailPanel}>
          <div className={s.detailHeader}>
            <div>
              <div className={s.detailName}>{selected.name}</div>
              <div style={{ marginTop: 4 }}>
                <span className={`${s.badge} ${selected.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{selected.status}</span>
                {' '}<span className={`${s.badge} ${s.badgeBlue}`}>{selected.payment_type}</span>
                {' '}<span className={`${s.badge} ${s.badgePurple}`}>{selected.tier_minimum}+</span>
              </div>
            </div>
            <div className={s.btnGroup} style={{ marginTop: 0 }}>
              <button className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`} onClick={() => openEdit(selected)}>Edit</button>
              <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => exportCsv(selected.id, selected.name)}>Export CSV</button>
              <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setCancelConfirm(selected)}>Cancel Event</button>
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
            <div className={s.detailItem}><div className={s.detailItemLabel}>Payment</div><div className={s.detailItemValue}>{selected.payment_type}{selected.price ? ` — $${selected.price}` : ''}</div></div>
            {selected.cancellation_fee && <div className={s.detailItem}><div className={s.detailItemLabel}>Cancel Fee</div><div className={s.detailItemValue}>${selected.cancellation_fee} (within 24h)</div></div>}
            {selected.image && <div className={s.detailItem}><div className={s.detailItemLabel}>Image</div><div className={s.detailItemValue}>{selected.image}</div></div>}
          </div>

          {selected.description && <div className={s.detailSection}><div className={s.detailSectionTitle}>Short Description</div><p style={{ fontSize: 14, color: '#374151' }}>{selected.description}</p></div>}
          {selected.longDescription && <div className={s.detailSection}><div className={s.detailSectionTitle}>Full Description</div><p style={{ fontSize: 14, color: '#374151', whiteSpace: 'pre-line' }}>{selected.longDescription}</p></div>}

          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>RSVPs ({rsvpMembers.length})</div>
            {rsvpMembers.length === 0 ? (
              <div className={s.empty}><p className={s.emptyText}>No RSVPs yet</p></div>
            ) : (
              <table className={s.table}>
                <thead><tr><th>Name</th><th>Email</th><th>Tier</th><th>Status</th></tr></thead>
                <tbody>{rsvpMembers.map(m => (
                  <tr key={m.id}><td>{m.name}</td><td>{m.email}</td><td><span className={`${s.badge} ${s.badgePurple}`}>{m.tier}</span></td><td><span className={`${s.badge} ${m.status === 'active' ? s.badgeGreen : s.badgeYellow}`}>{m.status}</span></td></tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>

        {cancelConfirm && (
          <div className={s.modalOverlay} onClick={() => setCancelConfirm(null)}>
            <div className={s.modalContent} onClick={e => e.stopPropagation()}>
              <div className={s.modalTitle}>Cancel Event</div>
              <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>Are you sure you want to cancel <strong>{cancelConfirm.name}</strong>? {getRsvpMembers(cancelConfirm.id).length > 0 && `${getRsvpMembers(cancelConfirm.id).length} members have RSVP'd.`}</p>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleCancelEvent(cancelConfirm.id)}>Yes, Cancel Event</button>
                <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setCancelConfirm(null)}>Keep Event</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Create/Edit Form ──
  if (showForm) {
    return (
      <div>
        <button className={s.backBtn} onClick={() => { setShowForm(false); setEditing(false) }}>&larr; Back</button>
        <div className={s.card}>
          <div className={s.cardTitle}>{editing ? 'Edit Event' : 'Create Event'}</div>
          <form onSubmit={handleSave}>
            <div className={s.formGroup}><label className={s.formLabel}>Event Name</label><input className={s.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Tagline</label><input className={s.formInput} value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Short Description</label><textarea className={s.formTextarea} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Full Description</label><textarea className={s.formTextarea} style={{ minHeight: 120 }} value={form.longDescription} onChange={e => setForm(p => ({ ...p, longDescription: e.target.value }))} /></div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Date (display)</label><input className={s.formInput} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="April 5, 2026" required /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Time</label><input className={s.formInput} value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="7:00 PM – 10:00 PM" /></div>
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Datetime (ISO)</label><input className={s.formInput} type="datetime-local" value={form.datetime?.slice(0, 16) || ''} onChange={e => setForm(p => ({ ...p, datetime: e.target.value }))} required /></div>
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
              <div className={s.formGroup}><label className={s.formLabel}>Tier Minimum</label>
                <select className={s.formSelect} value={form.tier_minimum} onChange={e => setForm(p => ({ ...p, tier_minimum: e.target.value }))}>{TIER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div className={s.formGroup}><label className={s.formLabel}>Cancellation Fee ($)</label><input className={s.formInput} type="number" value={form.cancellation_fee} onChange={e => setForm(p => ({ ...p, cancellation_fee: e.target.value }))} placeholder="0 (none)" /></div>
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}><label className={s.formLabel}>Image Filename</label><input className={s.formInput} value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="elegante.jpg" />{/* TODO: Replace with image upload to cloud storage */}</div>
              <div className={s.formGroup}><label className={s.formLabel}>Status</label>
                <select className={s.formSelect} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="draft">Draft</option><option value="published">Published</option></select></div>
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Access Label</label><input className={s.formInput} value={form.access} onChange={e => setForm(p => ({ ...p, access: e.target.value }))} placeholder="All Members" /></div>
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
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Events</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true) }}>+ New Event</button>
      </div>
      <p className={s.pageSubtitle}>{eventsList.length} events</p>
      <div className={s.card}>
        <table className={s.table}>
          <thead><tr><th>Name</th><th>Date</th><th>Venue</th><th>Payment</th><th>Tier</th><th>Status</th><th>RSVPs</th></tr></thead>
          <tbody>
            {eventsList.map(ev => (
              <tr key={ev.id} className={s.tableClickable} onClick={() => setSelected(ev)}>
                <td>{ev.name}</td><td>{ev.date}</td><td>{ev.venue}</td>
                <td><span className={`${s.badge} ${s.badgeBlue}`}>{ev.payment_type}</span></td>
                <td><span className={`${s.badge} ${s.badgePurple}`}>{ev.tier_minimum}</span></td>
                <td><span className={`${s.badge} ${ev.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{ev.status}</span></td>
                <td>{ADMIN_MEMBERS.filter(m => m.rsvps?.includes(ev.id)).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
