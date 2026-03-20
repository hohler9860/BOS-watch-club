import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminBlog() {
  const [tab, setTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [news, setNews] = useState([])
  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', status: 'draft', image: '', preview: '', sortDate: '', date: '', author: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      try {
        const [postsRes, newsRes] = await Promise.all([
          supabase.from('blog_posts').select('*').order('sort_date', { ascending: false }),
          supabase.from('club_news').select('*').order('sort_date', { ascending: false }),
        ])
        if (postsRes.error) throw postsRes.error
        if (newsRes.error) throw newsRes.error
        setPosts(postsRes.data)
        setNews(newsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const emptyForm = { title: '', body: '', status: 'draft', image: '', preview: '', sortDate: '', date: '', author: '' }

  async function handleCreatePost(e) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error: err } = await supabase.from('blog_posts').insert({
        title: form.title,
        body: form.body,
        status: form.status,
        date: form.date || today,
        sort_date: form.sortDate || today,
        author: form.author || 'Admin',
        image: form.image || null,
      }).select().single()
      if (err) throw err
      setPosts(prev => [data, ...prev])
      setShowCreate(false)
      setForm(emptyForm)

      // Notify members of new published blog post
      if (form.status === 'published') {
        fetch('/api/notify-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: 'blog',
            title: form.title,
            preview: form.body?.substring(0, 150) || '',
          }),
        }).catch(err => console.error('Blog notification failed:', err))
      }
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSavePost(e) {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('blog_posts').update({
        title: form.title,
        body: form.body,
        status: form.status,
        image: form.image || null,
        date: form.date || editing.date,
        author: form.author || editing.author,
        sort_date: form.sortDate || editing.sort_date,
      }).eq('id', editing.id)
      if (err) throw err
      setPosts(prev => prev.map(p => p.id === editing.id
        ? { ...p, title: form.title, body: form.body, status: form.status, image: form.image || null, date: form.date || p.date, author: form.author || p.author, sort_date: form.sortDate || p.sort_date }
        : p
      ))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeletePost(id) {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('blog_posts').delete().eq('id', id)
      if (err) throw err
      setPosts(prev => prev.filter(p => p.id !== id))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function togglePostStatus(id) {
    if (!supabase) return
    const post = posts.find(p => p.id === id)
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    setError(null)
    try {
      const { error: err } = await supabase.from('blog_posts').update({ status: newStatus }).eq('id', id)
      if (err) throw err
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))

      // Notify members when publishing a draft post
      if (newStatus === 'published') {
        fetch('/api/notify-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: 'blog',
            title: post.title,
            preview: post.body?.substring(0, 150) || '',
          }),
        }).catch(err => console.error('Blog notification failed:', err))
      }
    } catch (err) {
      setError(err.message)
    }
  }

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

  if (loading) return <div className={s.loading}>Loading blog content...</div>

  if (editing) {
    const isPost = tab === 'posts'
    return (
      <div>
        {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
        <button className={s.backBtn} onClick={() => setEditing(null)}>&larr; Back</button>
        <div className={s.card}>
          <div className={s.cardTitle}>Edit {isPost ? 'Blog Post' : 'Club News'}</div>
          <form onSubmit={isPost ? handleSavePost : handleSaveNews}>
            <div className={s.formGroup}><label className={s.formLabel}>Title</label><input className={s.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
            {!isPost && <div className={s.formGroup}><label className={s.formLabel}>Preview Text</label><input className={s.formInput} value={form.preview} onChange={e => setForm(p => ({ ...p, preview: e.target.value }))} /></div>}
            <div className={s.formGroup}><label className={s.formLabel}>Content</label><textarea className={s.formTextarea} style={{ minHeight: 200 }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required /></div>
            {isPost && (
              <>
                <div className={s.formGroup}><label className={s.formLabel}>Image URL</label><input className={s.formInput} value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Display Date</label><input className={s.formInput} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="e.g. March 20, 2026" /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Author</label><input className={s.formInput} value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} placeholder="Admin" /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Sort Date</label><input className={s.formInput} type="date" value={form.sortDate} onChange={e => setForm(p => ({ ...p, sortDate: e.target.value }))} /></div>
              </>
            )}
            {!isPost && <div className={s.formGroup}><label className={s.formLabel}>Sort Date</label><input className={s.formInput} type="date" value={form.sortDate} onChange={e => setForm(p => ({ ...p, sortDate: e.target.value }))} /></div>}
            <div className={s.formGroup}><label className={s.formLabel}>Status</label>
              <select className={s.formSelect} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="draft">Draft</option><option value="published">Published</option></select>
            </div>
            <div className={s.btnGroup}>
              <button className={`${s.btn} ${s.btnPrimary}`} type="submit">Save</button>
              <button className={`${s.btn} ${s.btnDanger}`} type="button" onClick={() => isPost ? handleDeletePost(editing.id) : handleDeleteNews(editing.id)}>Delete</button>
              <button className={`${s.btn} ${s.btnOutline}`} type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Blog &amp; Club News</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => { setForm(emptyForm); setShowCreate(true) }}>+ New {tab === 'posts' ? 'Post' : 'Update'}</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`${s.btn} ${tab === 'posts' ? s.btnPrimary : s.btnOutline}`} onClick={() => setTab('posts')}>Blog Posts ({posts.length})</button>
        <button className={`${s.btn} ${tab === 'news' ? s.btnPrimary : s.btnOutline}`} onClick={() => setTab('news')}>Club News ({news.length})</button>
      </div>

      {tab === 'posts' ? (
        <>
          <p className={s.pageSubtitle}>Posts appear on /blog and the dashboard Journal tab.</p>
          <div className={s.card}><table className={s.table}>
            <thead><tr><th>Title</th><th>Date</th><th>Image</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{posts.map(p => (
              <tr key={p.id}>
                <td className={s.tableClickable} onClick={() => { setForm({ title: p.title, body: p.body, status: p.status, image: p.image || '', preview: '', sortDate: p.sort_date || '', date: p.date || '', author: p.author || '' }); setEditing(p) }}>{p.title}</td>
                <td>{p.date}</td><td>{p.image || '\u2014'}</td>
                <td><span className={`${s.badge} ${p.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{p.status}</span></td>
                <td><button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => togglePostStatus(p.id)}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        </>
      ) : (
        <>
          <p className={s.pageSubtitle}>Updates appear in &ldquo;Latest Updates&rdquo; on the member dashboard.</p>
          <div className={s.card}><table className={s.table}>
            <thead><tr><th>Title</th><th>Date</th><th>Preview</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{[...news].sort((a, b) => (b.sort_date || '').localeCompare(a.sort_date || '')).map(n => (
              <tr key={n.id}>
                <td className={s.tableClickable} onClick={() => { setForm({ title: n.title, body: n.body, status: n.status, image: '', preview: n.preview, sortDate: n.sort_date }); setEditing(n) }}>{n.title}</td>
                <td>{n.date}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.preview}</td>
                <td><span className={`${s.badge} ${n.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{n.status}</span></td>
                <td><button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => toggleNewsStatus(n.id)}>{n.status === 'published' ? 'Unpublish' : 'Publish'}</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        </>
      )}

      {showCreate && (
        <div className={s.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className={s.modalTitle}>New {tab === 'posts' ? 'Blog Post' : 'Club News Update'}</div>
            <form onSubmit={tab === 'posts' ? handleCreatePost : handleCreateNews}>
              <div className={s.formGroup}><label className={s.formLabel}>Title</label><input className={s.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
              {tab === 'news' && <div className={s.formGroup}><label className={s.formLabel}>Preview Text</label><input className={s.formInput} value={form.preview} onChange={e => setForm(p => ({ ...p, preview: e.target.value }))} /></div>}
              <div className={s.formGroup}><label className={s.formLabel}>Content</label><textarea className={s.formTextarea} style={{ minHeight: 150 }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required /></div>
              {tab === 'posts' && (
                <>
                  <div className={s.formGroup}><label className={s.formLabel}>Image URL</label><input className={s.formInput} value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Display Date</label><input className={s.formInput} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="e.g. March 20, 2026" /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Author</label><input className={s.formInput} value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} placeholder="Admin" /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Sort Date</label><input className={s.formInput} type="date" value={form.sortDate} onChange={e => setForm(p => ({ ...p, sortDate: e.target.value }))} /></div>
                </>
              )}
              {tab === 'news' && <div className={s.formGroup}><label className={s.formLabel}>Sort Date</label><input className={s.formInput} type="date" value={form.sortDate} onChange={e => setForm(p => ({ ...p, sortDate: e.target.value }))} /></div>}
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
