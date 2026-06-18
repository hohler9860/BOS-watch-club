import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

/**
 * AdminBlog — "News" admin section.
 *
 * The Journal now lives on Substack (the redesign /redesign/journal and the member
 * dashboard read it via /api/journal), so the old blog_posts editor is retired here.
 * This section manages **Club News** (the `club_news` table that powers "Latest Updates"
 * on the member dashboard) and points to Substack for journal publishing.
 *
 * All club_news logic (create / edit / delete / publish + /api/notify-content) is
 * preserved verbatim from the prior version.
 */

const SUBSTACK_PUBLISH_URL = 'https://bostonwatchclub.substack.com/publish/posts'
const SUBSTACK_PUBLIC_URL = 'https://bostonwatchclub.substack.com'

const emptyForm = { title: '', preview: '', body: '', status: 'draft', sortDate: '' }

export default function AdminBlog() {
  const [tab, setTab] = useState('news')
  const [news, setNews] = useState([])
  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('club_news')
          .select('*')
          .order('sort_date', { ascending: false })
        if (err) throw err
        setNews(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  async function handleCreateNews(e) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    try {
      const today = new Date()
      const sortDate = form.sortDate || today.toISOString().split('T')[0]
      const displayDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      const { data, error: err } = await supabase.from('club_news').insert({
        title: form.title,
        preview: form.preview,
        body: form.body,
        date: displayDate,
        sort_date: sortDate,
        status: form.status,
      }).select().single()
      if (err) throw err
      setNews(prev => [data, ...prev])
      setShowCreate(false)
      setForm(emptyForm)

      // Notify members of new published club news
      if (form.status === 'published') {
        fetch('/api/notify-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: 'news',
            title: form.title,
            preview: form.preview || '',
          }),
        }).catch(err => console.error('News notification failed:', err))
      }
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSaveNews(e) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('club_news').update({
        title: form.title,
        preview: form.preview,
        body: form.body,
        status: form.status,
        sort_date: form.sortDate || editing.sort_date,
      }).eq('id', editing.id)
      if (err) throw err
      setNews(prev => prev.map(n => n.id === editing.id
        ? { ...n, title: form.title, preview: form.preview, body: form.body, status: form.status, sort_date: form.sortDate || n.sort_date }
        : n
      ))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteNews(id) {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('club_news').delete().eq('id', id)
      if (err) throw err
      setNews(prev => prev.filter(n => n.id !== id))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleNewsStatus(id) {
    if (!supabase) return
    const item = news.find(n => n.id === id)
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    setError(null)
    try {
      const { error: err } = await supabase.from('club_news').update({ status: newStatus }).eq('id', id)
      if (err) throw err
      setNews(prev => prev.map(n => n.id === id ? { ...n, status: newStatus } : n))

      // Notify members when publishing a draft news item
      if (newStatus === 'published') {
        fetch('/api/notify-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: 'news',
            title: item.title,
            preview: item.preview || '',
          }),
        }).catch(err => console.error('News notification failed:', err))
      }
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className={s.loading}>Loading news...</div>

  // ── Edit Club News ──────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div>
        {error && <div style={{ color: '#b3261e', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
        <button className={s.backBtn} onClick={() => setEditing(null)}>&larr; Back</button>
        <div className={s.card}>
          <div className={s.cardTitle}>Edit Club News</div>
          <form onSubmit={handleSaveNews}>
            <div className={s.formGroup}><label className={s.formLabel}>Title</label><input className={s.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Preview Text</label><input className={s.formInput} value={form.preview} onChange={e => setForm(p => ({ ...p, preview: e.target.value }))} /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Content</label><textarea className={s.formTextarea} style={{ minHeight: 200 }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Sort Date</label><input className={s.formInput} type="date" value={form.sortDate} onChange={e => setForm(p => ({ ...p, sortDate: e.target.value }))} /></div>
            <div className={s.formGroup}><label className={s.formLabel}>Status</label>
              <select className={s.formSelect} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="draft">Draft</option><option value="published">Published</option></select>
            </div>
            <div className={s.btnGroup}>
              <button className={`${s.btn} ${s.btnPrimary}`} type="submit">Save</button>
              <button className={`${s.btn} ${s.btnDanger}`} type="button" onClick={() => handleDeleteNews(editing.id)}>Delete</button>
              <button className={`${s.btn} ${s.btnOutline}`} type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      {error && <div style={{ color: '#b3261e', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>News &amp; Journal</h1>
        {tab === 'news' && (
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => { setForm(emptyForm); setShowCreate(true) }}>+ New Update</button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`${s.btn} ${tab === 'news' ? s.btnPrimary : s.btnOutline}`} onClick={() => setTab('news')}>Club News ({news.length})</button>
        <button className={`${s.btn} ${tab === 'journal' ? s.btnPrimary : s.btnOutline}`} onClick={() => setTab('journal')}>Journal (Substack)</button>
      </div>

      {tab === 'news' ? (
        <>
          <p className={s.pageSubtitle}>Updates appear in &ldquo;Latest Updates&rdquo; on the member dashboard.</p>
          <div className={s.card}><table className={s.table}>
            <thead><tr><th>Title</th><th>Date</th><th>Preview</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{[...news].sort((a, b) => (b.sort_date || '').localeCompare(a.sort_date || '')).map(n => (
              <tr key={n.id}>
                <td className={s.tableClickable} onClick={() => { setForm({ title: n.title, body: n.body, status: n.status, preview: n.preview, sortDate: n.sort_date }); setEditing(n) }}>{n.title}</td>
                <td>{n.date}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.preview}</td>
                <td><span className={`${s.badge} ${n.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{n.status}</span></td>
                <td><button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => toggleNewsStatus(n.id)}>{n.status === 'published' ? 'Unpublish' : 'Publish'}</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        </>
      ) : (
        <div className={s.card}>
          <div className={s.cardTitle}>The Journal lives on Substack</div>
          <p className={s.pageSubtitle} style={{ marginBottom: 16 }}>
            Journal posts are written and published on Substack. They appear automatically on
            the site Journal (/redesign/journal) and the member dashboard &mdash; no posting here needed.
          </p>
          <div className={s.btnGroup} style={{ marginTop: 0 }}>
            <a className={`${s.btn} ${s.btnPrimary}`} href={SUBSTACK_PUBLISH_URL} target="_blank" rel="noopener noreferrer">Write on Substack</a>
            <a className={`${s.btn} ${s.btnOutline}`} href={SUBSTACK_PUBLIC_URL} target="_blank" rel="noopener noreferrer">View Journal</a>
          </div>
        </div>
      )}

      {showCreate && (
        <div className={s.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className={s.modalTitle}>New Club News Update</div>
            <form onSubmit={handleCreateNews}>
              <div className={s.formGroup}><label className={s.formLabel}>Title</label><input className={s.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Preview Text</label><input className={s.formInput} value={form.preview} onChange={e => setForm(p => ({ ...p, preview: e.target.value }))} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Content</label><textarea className={s.formTextarea} style={{ minHeight: 150 }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Sort Date</label><input className={s.formInput} type="date" value={form.sortDate} onChange={e => setForm(p => ({ ...p, sortDate: e.target.value }))} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Status</label><select className={s.formSelect} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="draft">Draft</option><option value="published">Published</option></select></div>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnPrimary}`} type="submit">Create</button>
                <button className={`${s.btn} ${s.btnOutline}`} type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
