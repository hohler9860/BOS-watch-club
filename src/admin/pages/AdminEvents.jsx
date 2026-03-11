import { useState } from 'react'
import eventsData from '../../data/events'
import { ADMIN_MEMBERS } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminEvents() {
  const [eventsList, setEventsList] = useState(eventsData)
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', time: '', location: '', description: '', capacity: 30, tier_minimum: 'enthusiast', payment_type: 'on_us', price: 0 })

  function handleCreate(e) {
    e.preventDefault()
    const newEvent = {
      id: `event-${Date.now()}`,
      title: form.title,
      datetime: `${form.date}T${form.time || '18:00'}`,
      location: form.location,
      description: form.description,
      capacity: Number(form.capacity),
      spotsLeft: Number(form.capacity),
      tier_minimum: form.tier_minimum,
      payment_type: form.payment_type,
      price: Number(form.price),
      cancellation_fee: 0,
      image: null,
    }
    setEventsList(prev => [...prev, newEvent])
    setShowCreate(false)
    setForm({ title: '', date: '', time: '', location: '', description: '', capacity: 30, tier_minimum: 'enthusiast', payment_type: 'on_us', price: 0 })
  }

  function handleCancel(id) {
    setEventsList(prev => prev.filter(e => e.id !== id))
    setSelected(null)
  }

  function getRsvpMembers(eventId) {
    return ADMIN_MEMBERS.filter(m => m.rsvps && m.rsvps.includes(eventId))
  }

  function exportCsv(eventId, title) {
    const members = getRsvpMembers(eventId)
    const csv = ['Name,Email,Tier,Status', ...members.map(m => `${m.name},${m.email},${m.tier},${m.status}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-rsvps.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (selected) {
    const rsvpMembers = getRsvpMembers(selected.id)
    return (
      <div>
        <button className={s.backBtn} onClick={() => setSelected(null)}>&larr; Back to Events</button>
        <div className={s.detailPanel}>
          <div className={s.detailHeader}>
            <div className={s.detailName}>{selected.title}</div>
            <div className={s.btnGroup} style={{ marginTop: 0 }}>
              <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => exportCsv(selected.id, selected.title)}>Export CSV</button>
              <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => handleCancel(selected.id)}>Cancel Event</button>
            </div>
          </div>

          <div className={s.detailGrid} style={{ marginBottom: 20 }}>
            <div className={s.detailItem}>
              <div className={s.detailItemLabel}>Date &amp; Time</div>
              <div className={s.detailItemValue}>{new Date(selected.datetime).toLocaleString()}</div>
            </div>
            <div className={s.detailItem}>
              <div className={s.detailItemLabel}>Location</div>
              <div className={s.detailItemValue}>{selected.location}</div>
            </div>
            <div className={s.detailItem}>
              <div className={s.detailItemLabel}>Capacity</div>
              <div className={s.detailItemValue}>{selected.spotsLeft}/{selected.capacity} spots left</div>
            </div>
            <div className={s.detailItem}>
              <div className={s.detailItemLabel}>Payment</div>
              <div className={s.detailItemValue}>{selected.payment_type}{selected.price ? ` — $${selected.price}` : ''}</div>
            </div>
            <div className={s.detailItem}>
              <div className={s.detailItemLabel}>Min Tier</div>
              <div className={s.detailItemValue}>{selected.tier_minimum}</div>
            </div>
          </div>

          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>RSVPs ({rsvpMembers.length})</div>
            {rsvpMembers.length === 0 ? (
              <div className={s.empty}><p className={s.emptyText}>No RSVPs yet</p></div>
            ) : (
              <table className={s.table}>
                <thead><tr><th>Name</th><th>Email</th><th>Tier</th></tr></thead>
                <tbody>
                  {rsvpMembers.map(m => (
                    <tr key={m.id}><td>{m.name}</td><td>{m.email}</td><td><span className={`${s.badge} ${s.badgePurple}`}>{m.tier}</span></td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Events</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setShowCreate(true)}>+ New Event</button>
      </div>
      <p className={s.pageSubtitle}>{eventsList.length} events</p>

      <div className={s.card}>
        <table className={s.table}>
          <thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Spots</th><th>Payment</th></tr></thead>
          <tbody>
            {eventsList.map(ev => (
              <tr key={ev.id} className={s.tableClickable} onClick={() => setSelected(ev)}>
                <td>{ev.title}</td>
                <td>{new Date(ev.datetime).toLocaleDateString()}</td>
                <td>{ev.location}</td>
                <td>{ev.spotsLeft}/{ev.capacity}</td>
                <td><span className={`${s.badge} ${s.badgeBlue}`}>{ev.payment_type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className={s.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()}>
            <div className={s.modalTitle}>Create Event</div>
            <form onSubmit={handleCreate}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Title</label>
                <input className={s.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className={s.formRow}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Date</label>
                  <input className={s.formInput} type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Time</label>
                  <input className={s.formInput} type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Location</label>
                <input className={s.formInput} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Description</label>
                <textarea className={s.formTextarea} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className={s.formRow}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Capacity</label>
                  <input className={s.formInput} type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Min Tier</label>
                  <select className={s.formSelect} value={form.tier_minimum} onChange={e => setForm(p => ({ ...p, tier_minimum: e.target.value }))}>
                    <option value="enthusiast">Enthusiast</option>
                    <option value="collector">Collector</option>
                    <option value="patron">Patron</option>
                  </select>
                </div>
              </div>
              <div className={s.formRow}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Payment Type</label>
                  <select className={s.formSelect} value={form.payment_type} onChange={e => setForm(p => ({ ...p, payment_type: e.target.value }))}>
                    <option value="on_us">On Us (Free)</option>
                    <option value="pay_during">Pay During</option>
                    <option value="pay_after">Pay After</option>
                    <option value="upfront">Upfront</option>
                  </select>
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Price ($)</label>
                  <input className={s.formInput} type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
              </div>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnPrimary}`} type="submit">Create Event</button>
                <button className={`${s.btn} ${s.btnOutline}`} type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
