import { useState } from 'react'
import { ADMIN_BLOG_POSTS, ADMIN_CLUB_NEWS } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminBlog() {
  const [tab, setTab] = useState('posts')
  const [posts, setPosts] = useState(ADMIN_BLOG_POSTS)
  const [news, setNews] = useState(ADMIN_CLUB_NEWS)
  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', status: 'draft', image: '', substackUrl: '', preview: '', sortDate: '' })

  function handleCreatePost(e) {
    e.preventDefault()
    setPosts(prev => [{ id: Date.now(), title: form.title, body: form.body, status: form.status, date: new Date().toISOString().split('T')[0], author: 'Admin', image: form.image || null, substackUrl: form.substackUrl || '' }, ...prev])
    setShowCreate(false)
    setForm({ title: '', body: '', status: 'draft', image: '', substackUrl: '', preview: '', sortDate: '' })
  }

  function handleSavePost(e) {
    e.preventDefault()
    setPosts(prev => prev.map(p => p.id === editing.id ? { ...p, title: form.title, body: form.body, status: form.status, image: form.image || null, substackUrl: form.substackUrl || '' } : p))
    setEditing(null)
  }

  function handleDeletePost(id) { setPosts(prev => prev.filter(p => p.id !== id)); setEditing(null) }
  function togglePostStatus(id) { setPosts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p)) }

  function handleCreateNews(e) {
    e.preventDefault()
    setNews(prev => [{ id: Date.now(), title: form.title, preview: form.preview, body: form.body, date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), sortDate: form.sortDate || new Date().toISOString().split('T')[0], status: form.status }, ...prev])
    setShowCreate(false)
    setForm({ title: '', body: '', status: 'draft', image: '', substackUrl: '', preview: '', sortDate: '' })
  }

  function handleSaveNews(e) {
    e.preventDefault()
    setNews(prev => prev.map(n => n.id === editing.id ? { ...n, title: form.title, preview: form.preview, body: form.body, status: form.status, sortDate: form.sortDate || n.sortDate } : n))
    setEditing(null)
  }

  function handleDeleteNews(id) { setNews(prev => prev.filter(n => n.id !== id)); setEditing(null) }
  function toggleNewsStatus(id) { setNews(prev => prev.map(n => n.id === id ? { ...n, status: n.status === 'published' ? 'draft' : 'published' } : n)) }

  if (editing) {
    const isPost = tab === 'posts'
    return (
      <div>
        <button className={s.backBtn} onClick={() => setEditing(null)}>&larr; Back</button>
        <div className={s.card}>
          <div className={s.cardTitle}>Edit {isPost ? 'Blog Post' : 'Club News'}</div>
          <form onSubmit={isPost ? handleSavePost : handleSaveNews}>
            <div className={s.formGroup}><label className={s.formLabel}>Title</label><input className={s.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
            {!isPost && <div className={s.formGroup}><label className={s.formLabel}>Preview Text</label><input className={s.formInput} value={form.preview} onChange={e => setForm(p => ({ ...p, preview: e.target.value }))} /></div>}
            <div className={s.formGroup}><label className={s.formLabel}>Content</label><textarea className={s.formTextarea} style={{ minHeight: 200 }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required />{/* TODO: Replace with rich text editor */}</div>
            {isPost && (
              <div className={s.formRow}>
                <div className={s.formGroup}><label className={s.formLabel}>Image Filename</label><input className={s.formInput} value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} />{/* TODO: Image upload */}</div>
                <div className={s.formGroup}><label className={s.formLabel}>Substack URL</label><input className={s.formInput} value={form.substackUrl} onChange={e => setForm(p => ({ ...p, substackUrl: e.target.value }))} /></div>
              </div>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Blog &amp; Club News</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => { setForm({ title: '', body: '', status: 'draft', image: '', substackUrl: '', preview: '', sortDate: '' }); setShowCreate(true) }}>+ New {tab === 'posts' ? 'Post' : 'Update'}</button>
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
                <td className={s.tableClickable} onClick={() => { setForm({ title: p.title, body: p.body, status: p.status, image: p.image || '', substackUrl: p.substackUrl || '', preview: '', sortDate: '' }); setEditing(p) }}>{p.title}</td>
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
            <tbody>{[...news].sort((a, b) => b.sortDate.localeCompare(a.sortDate)).map(n => (
              <tr key={n.id}>
                <td className={s.tableClickable} onClick={() => { setForm({ title: n.title, body: n.body, status: n.status, image: '', substackUrl: '', preview: n.preview, sortDate: n.sortDate }); setEditing(n) }}>{n.title}</td>
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
              {tab === 'posts' && <div className={s.formRow}><div className={s.formGroup}><label className={s.formLabel}>Image</label><input className={s.formInput} value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} /></div><div className={s.formGroup}><label className={s.formLabel}>Substack URL</label><input className={s.formInput} value={form.substackUrl} onChange={e => setForm(p => ({ ...p, substackUrl: e.target.value }))} /></div></div>}
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
