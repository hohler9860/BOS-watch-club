import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminPickups() {
  const [pickups, setPickups] = useState([])
  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', ref: '', eyebrow: 'RECENTLY PICKED UP BY A MEMBER', editorial: '', note: 'MEMBER PICKUPS UPDATED REGULARLY', image1: '', image2: '', image3: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const emptyForm = { name: '', ref: '', eyebrow: 'RECENTLY PICKED UP BY A MEMBER', editorial: '', note: 'MEMBER PICKUPS UPDATED REGULARLY', image1: '', image2: '', image3: '' }

  useEffect(() => {
    async function fetch() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      try {
        const { data, error: err } = await supabase.from('pickups').select('*').order('created_at', { ascending: false })
        if (err) throw err
        setPickups(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    try {
      const { data, error: err } = await supabase.from('pickups').insert({
        name: form.name,
        ref: form.ref || null,
        eyebrow: form.eyebrow || 'RECENTLY PICKED UP BY A MEMBER',
        editorial: form.editorial || null,
        note: form.note || 'MEMBER PICKUPS UPDATED REGULARLY',
        image1: form.image1 || null,
        image2: form.image2 || null,
        image3: form.image3 || null,
        active: false,
      }).select().single()
      if (err) throw err
      setPickups(prev => [data, ...prev])
      setShowCreate(false)
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('pickups').update({
        name: form.name,
        ref: form.ref || null,
        eyebrow: form.eyebrow || 'RECENTLY PICKED UP BY A MEMBER',
        editorial: form.editorial || null,
        note: form.note || 'MEMBER PICKUPS UPDATED REGULARLY',
        image1: form.image1 || null,
        image2: form.image2 || null,
        image3: form.image3 || null,
      }).eq('id', editing.id)
      if (err) throw err
      setPickups(prev => prev.map(p => p.id === editing.id
        ? { ...p, name: form.name, ref: form.ref, eyebrow: form.eyebrow, editorial: form.editorial, note: form.note, image1: form.image1, image2: form.image2, image3: form.image3 }
        : p
      ))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('pickups').delete().eq('id', id)
      if (err) throw err
      setPickups(prev => prev.filter(p => p.id !== id))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleActive(id) {
    if (!supabase) return
    setError(null)
    try {
      // Deactivate all first, then activate the selected one
      const pickup = pickups.find(p => p.id === id)
      const newActive = !pickup.active
      if (newActive) {
        const { error: err1 } = await supabase.from('pickups').update({ active: false }).neq('id', id)
        if (err1) throw err1
      }
      const { error: err2 } = await supabase.from('pickups').update({ active: newActive }).eq('id', id)
      if (err2) throw err2
      setPickups(prev => prev.map(p => {
        if (p.id === id) return { ...p, active: newActive }
        if (newActive) return { ...p, active: false }
        return p
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  function pickupForm(onSubmit, submitLabel) {
    return (
      <form onSubmit={onSubmit}>
        <div className={s.formGroup}><label className={s.formLabel}>Watch Name</label><input className={s.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder='e.g. Omega Speedmaster "Silver Snoopy Award"' /></div>
        <div className={s.formGroup}><label className={s.formLabel}>Reference Number</label><input className={s.formInput} value={form.ref} onChange={e => setForm(p => ({ ...p, ref: e.target.value }))} placeholder="e.g. REF. 310.32.42.50.02.001" /></div>
        <div className={s.formGroup}><label className={s.formLabel}>Eyebrow Text</label><input className={s.formInput} value={form.eyebrow} onChange={e => setForm(p => ({ ...p, eyebrow: e.target.value }))} /></div>
        <div className={s.formGroup}><label className={s.formLabel}>Editorial Description</label><textarea className={s.formTextarea} style={{ minHeight: 120 }} value={form.editorial} onChange={e => setForm(p => ({ ...p, editorial: e.target.value }))} placeholder="Write about this pickup..." /></div>
        <div className={s.formGroup}><label className={s.formLabel}>Bottom Note</label><input className={s.formInput} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} /></div>
        <div className={s.formGroup}><label className={s.formLabel}>Image 1 URL</label><input className={s.formInput} value={form.image1} onChange={e => setForm(p => ({ ...p, image1: e.target.value }))} placeholder="https://..." /></div>
        <div className={s.formGroup}><label className={s.formLabel}>Image 2 URL</label><input className={s.formInput} value={form.image2} onChange={e => setForm(p => ({ ...p, image2: e.target.value }))} placeholder="https://..." /></div>
        <div className={s.formGroup}><label className={s.formLabel}>Image 3 URL</label><input className={s.formInput} value={form.image3} onChange={e => setForm(p => ({ ...p, image3: e.target.value }))} placeholder="https://..." /></div>
        {(form.image1 || form.image2 || form.image3) && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[form.image1, form.image2, form.image3].filter(Boolean).map((url, i) => (
              <img key={i} src={url} alt={`Preview ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
            ))}
          </div>
        )}
        <div className={s.btnGroup}>
          <button className={`${s.btn} ${s.btnPrimary}`} type="submit">{submitLabel}</button>
          {editing && <button className={`${s.btn} ${s.btnDanger}`} type="button" onClick={() => handleDelete(editing.id)}>Delete</button>}
          <button className={`${s.btn} ${s.btnOutline}`} type="button" onClick={() => { setEditing(null); setShowCreate(false) }}>Cancel</button>
        </div>
      </form>
    )
  }

  if (loading) return <div className={s.loading}>Loading pickups...</div>

  if (editing) {
    return (
      <div>
        {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
        <button className={s.backBtn} onClick={() => setEditing(null)}>&larr; Back</button>
        <div className={s.card}>
          <div className={s.cardTitle}>Edit Pickup</div>
          {pickupForm(handleSave, 'Save')}
        </div>
      </div>
    )
  }

  return (
    <div>
      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Recent Pickups</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => { setForm(emptyForm); setShowCreate(true) }}>+ New Pickup</button>
      </div>
      <p className={s.pageSubtitle}>Manage the &ldquo;Recently Picked Up&rdquo; section on the home page. Only one pickup can be active at a time.</p>

      <div className={s.card}><table className={s.table}>
        <thead><tr><th>Watch</th><th>Ref</th><th>Images</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{pickups.length === 0 ? (
          <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No pickups yet. Create one to feature on the home page.</td></tr>
        ) : pickups.map(p => (
          <tr key={p.id}>
            <td className={s.tableClickable} onClick={() => { setForm({ name: p.name || '', ref: p.ref || '', eyebrow: p.eyebrow || '', editorial: p.editorial || '', note: p.note || '', image1: p.image1 || '', image2: p.image2 || '', image3: p.image3 || '' }); setEditing(p) }}>{p.name}</td>
            <td>{p.ref || '\u2014'}</td>
            <td>{[p.image1, p.image2, p.image3].filter(Boolean).length}/3</td>
            <td><span className={`${s.badge} ${p.active ? s.badgeGreen : s.badgeGray}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
            <td><button className={`${s.btn} ${p.active ? s.btnOutline : s.btnSuccess} ${s.btnSm}`} onClick={() => toggleActive(p.id)}>{p.active ? 'Deactivate' : 'Set Active'}</button></td>
          </tr>
        ))}</tbody>
      </table></div>

      {showCreate && (
        <div className={s.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className={s.modalTitle}>New Pickup</div>
            {pickupForm(handleCreate, 'Create')}
          </div>
        </div>
      )}
    </div>
  )
}
