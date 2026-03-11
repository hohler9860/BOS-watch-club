import { useState } from 'react'
import { ADMIN_BLOG_POSTS } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminBlog() {
  const [posts, setPosts] = useState(ADMIN_BLOG_POSTS)
  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', status: 'draft' })

  function handleCreate(e) {
    e.preventDefault()
    const newPost = {
      id: Date.now(),
      title: form.title,
      body: form.body,
      status: form.status,
      date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      image: null,
    }
    setPosts(prev => [newPost, ...prev])
    setShowCreate(false)
    setForm({ title: '', body: '', status: 'draft' })
  }

  function handleSave(e) {
    e.preventDefault()
    setPosts(prev => prev.map(p => p.id === editing.id ? { ...p, title: form.title, body: form.body, status: form.status } : p))
    setEditing(null)
  }

  function handleDelete(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
    setEditing(null)
  }

  function toggleStatus(id) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p))
  }

  if (editing) {
    return (
      <div>
        <button className={s.backBtn} onClick={() => setEditing(null)}>&larr; Back to Blog</button>
        <div className={s.card}>
          <div className={s.cardTitle}>Edit Post</div>
          <form onSubmit={handleSave}>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Title</label>
              <input className={s.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Content</label>
              <textarea className={s.formTextarea} style={{ minHeight: 200 }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Status</label>
              <select className={s.formSelect} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className={s.btnGroup}>
              <button className={`${s.btn} ${s.btnPrimary}`} type="submit">Save Changes</button>
              <button className={`${s.btn} ${s.btnDanger}`} type="button" onClick={() => handleDelete(editing.id)}>Delete Post</button>
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
        <h1 className={s.pageTitle}>Blog Posts</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => { setForm({ title: '', body: '', status: 'draft' }); setShowCreate(true) }}>+ New Post</button>
      </div>
      <p className={s.pageSubtitle}>{posts.length} posts</p>

      <div className={s.card}>
        <table className={s.table}>
          <thead><tr><th>Title</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id}>
                <td className={s.tableClickable} onClick={() => { setForm({ title: p.title, body: p.body, status: p.status }); setEditing(p) }}>{p.title}</td>
                <td>{p.date}</td>
                <td>
                  <span className={`${s.badge} ${p.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{p.status}</span>
                </td>
                <td>
                  <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => toggleStatus(p.id)}>
                    {p.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className={s.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()}>
            <div className={s.modalTitle}>New Blog Post</div>
            <form onSubmit={handleCreate}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Title</label>
                <input className={s.formInput} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Content</label>
                <textarea className={s.formTextarea} style={{ minHeight: 150 }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Status</label>
                <select className={s.formSelect} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnPrimary}`} type="submit">Create Post</button>
                <button className={`${s.btn} ${s.btnOutline}`} type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
