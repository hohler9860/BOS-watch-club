import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAdminAuth from '../AdminAuth'
import s from '../admin.module.css'

const emptyForm = { title: '', category: '', body: '' }

export default function AdminDmTemplates() {
  const { admin } = useAdminAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => { fetchTemplates() }, [])

  async function fetchTemplates() {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('dm_templates')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setTemplates(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(t) {
    setForm({ title: t.title || '', category: t.category || '', body: t.body || '' })
    setEditing(t)
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || null,
        body: form.body,
      }
      if (editing) {
        const { data, error: err } = await supabase
          .from('dm_templates')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editing.id)
          .select()
          .single()
        if (err) throw err
        setTemplates(prev => prev.map(t => t.id === editing.id ? data : t))
      } else {
        const { data, error: err } = await supabase
          .from('dm_templates')
          .insert({ ...payload, created_by: admin?.email || null })
          .select()
          .single()
        if (err) throw err
        setTemplates(prev => [data, ...prev])
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('dm_templates').delete().eq('id', id)
      if (err) throw err
      setTemplates(prev => prev.filter(t => t.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCopy(t) {
    try {
      await navigator.clipboard.writeText(t.body || '')
      setCopiedId(t.id)
      setTimeout(() => setCopiedId(prev => (prev === t.id ? null : prev)), 1800)
    } catch (err) {
      setError('Could not copy to clipboard.')
    }
  }

  function formatDate(dt) {
    if (!dt) return ''
    try {
      return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return ''
    }
  }

  if (loading) return <div className={s.loading}>Loading DM templates...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className={s.pageTitle}>DM Templates</div>
          <div className={s.pageSubtitle}>Save and reuse cold-outreach messages for potential members.</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={openAdd}>+ New Template</button>
      </div>

      {error && <div style={{ color: '#b3261e', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}

      {templates.length === 0 ? (
        <div className={s.empty}><div className={s.emptyText}>No DM templates yet. Add your first one above.</div></div>
      ) : (
        <div>
          {templates.map(t => (
            <div key={t.id} className={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className={s.cardTitle} style={{ marginBottom: 0, textTransform: 'none', fontSize: 15, fontWeight: 700 }}>{t.title}</span>
                    {t.category && <span className={`${s.badge} ${s.badgeGray}`}>{t.category}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#9b988f', marginTop: 4 }}>
                    Added by {t.created_by || 'unknown'} &middot; {formatDate(t.created_at)}
                  </div>
                </div>
                <div className={s.btnGroup} style={{ marginTop: 0, flexShrink: 0 }}>
                  <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => handleCopy(t)}>
                    {copiedId === t.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => openEdit(t)}>Edit</button>
                  <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setDeleteConfirm(t)}>Delete</button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#333333', marginTop: 12, marginBottom: 0, whiteSpace: 'pre-wrap' }}>{t.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className={s.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.modalContent}>
            <div className={s.modalTitle}>{editing ? 'Edit Template' : 'New DM Template'}</div>
            <form onSubmit={handleSave}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Title</label>
                <input
                  className={s.formInput}
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Category (optional)</label>
                <input
                  className={s.formInput}
                  placeholder="e.g. Cold Open, Follow-up, Instagram DM"
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Message Body</label>
                <textarea
                  className={s.formTextarea}
                  style={{ minHeight: 160 }}
                  value={form.body}
                  onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                  required
                />
                <div style={{ fontSize: 11, color: '#9b988f', marginTop: 6 }}>
                  Tip: use placeholders like [name] and personalize them before sending.
                </div>
              </div>
              <div className={s.btnGroup}>
                <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
                <button type="button" className={`${s.btn} ${s.btnOutline}`} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className={s.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null) }}>
          <div className={s.modalContent} style={{ maxWidth: 380 }}>
            <div className={s.modalTitle}>Delete Template?</div>
            <p style={{ fontSize: 13, color: '#777777' }}>
              This will permanently delete &ldquo;{deleteConfirm.title}&rdquo;. This cannot be undone.
            </p>
            <div className={s.btnGroup}>
              <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
              <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
