import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminDiscussions() {
  const [discussions, setDiscussions] = useState([])
  const [selected, setSelected] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null) // { id, author_id, title }
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchDiscussions() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('discussions')
          .select('*')
          .order('sort_date', { ascending: false })
        if (err) throw err
        setDiscussions(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDiscussions()
  }, [])

  async function loadReplies(discussionId) {
    if (!supabase) return
    try {
      const { data, error: err } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true })
      if (err) throw err
      setReplies(data)
    } catch (err) {
      console.error('Failed to load replies:', err.message)
      setReplies([])
    }
  }

  function openSelected(d) {
    setSelected(d)
    loadReplies(d.id)
  }

  function promptDelete(discussion) {
    setDeleteModal({ id: discussion.id, author_id: discussion.author_id, title: discussion.title })
    setDeleteReason('')
    setError(null)
  }

  async function confirmDelete() {
    if (!deleteReason.trim()) return
    if (!supabase) return
    setDeleting(true)
    setError(null)
    try {
      const { error: delErr } = await supabase.from('discussions').delete().eq('id', deleteModal.id)
      if (delErr) throw delErr

      // Notify the author
      if (deleteModal.author_id) {
        const { error: notifErr } = await supabase.from('user_notifications').insert({
          user_id: deleteModal.author_id,
          title: 'Your discussion was removed',
          body: `Your post "${deleteModal.title}" was removed by an admin.\n\nReason: ${deleteReason.trim()}`,
        })
        if (notifErr) console.error('Notification insert failed:', notifErr.message)
      }

      setDiscussions(prev => prev.filter(d => d.id !== deleteModal.id))
      if (selected?.id === deleteModal.id) setSelected(null)
      setDeleteModal(null)
      setDeleteReason('')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className={s.loading}>Loading discussions...</div>

  const deleteModalUI = deleteModal && (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => !deleting && setDeleteModal(null)}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 440, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Why are you deleting this post?</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#777777' }}>
          <strong>&ldquo;{deleteModal.title}&rdquo;</strong> will be permanently removed and the author will be notified.
        </p>
        <label className={s.formLabel}>Reason <span style={{ color: '#b3261e' }}>*</span></label>
        <textarea
          className={s.formInput}
          style={{ height: 80, resize: 'vertical' }}
          value={deleteReason}
          onChange={e => setDeleteReason(e.target.value)}
          placeholder="Explain why this post is being removed..."
          disabled={deleting}
          autoFocus
        />
        {error && <div style={{ color: '#b3261e', fontSize: 12, marginTop: 6 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className={s.btn} onClick={() => setDeleteModal(null)} disabled={deleting}>Cancel</button>
          <button className={`${s.btn} ${s.btnDanger}`} onClick={confirmDelete} disabled={deleting || !deleteReason.trim()}>
            {deleting ? 'Deleting...' : 'Delete Post'}
          </button>
        </div>
      </div>
    </div>
  )

  if (selected) {
    return (
      <div>
        {deleteModalUI}
        {error && <div style={{ color: '#b3261e', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
        <button className={s.backBtn} onClick={() => setSelected(null)}>&larr; Back to Discussions</button>
        <div className={s.detailPanel}>
          <div className={s.detailHeader}>
            <div>
              <div className={s.detailName}>{selected.title}</div>
              <div style={{ marginTop: 4 }}>
                by {selected.author}
                {selected.tier && <span className={`${s.badge} ${s.badgePurple}`} style={{ marginLeft: 6 }}>{selected.tier}</span>}
                {' '}&middot; {selected.date}
              </div>
            </div>
          </div>

          {selected.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {selected.tags.map(t => <span key={t} className={`${s.badge} ${s.badgeBlue}`}>{t}</span>)}
            </div>
          )}

          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>Content</div>
            <p style={{ fontSize: 14, color: '#333333', lineHeight: 1.6 }}>{selected.body}</p>
          </div>

          {replies.length > 0 && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Replies ({replies.length})</div>
              {replies.map((r, i) => (
                <div key={r.id || i} style={{ padding: '10px 0', borderBottom: i < replies.length - 1 ? '1px solid #efede7' : 'none' }}>
                  <div style={{ fontSize: 12, color: '#777777', marginBottom: 4 }}>
                    <strong>{r.author}</strong>
                    {r.tier && <span className={`${s.badge} ${s.badgePurple}`} style={{ marginLeft: 4 }}>{r.tier}</span>}
                    {' '}&middot; {r.date}
                  </div>
                  <p style={{ fontSize: 14, color: '#333333' }}>{r.body}</p>
                </div>
              ))}
            </div>
          )}

          <div className={s.btnGroup}>
            <button className={`${s.btn} ${s.btnDanger}`} onClick={() => promptDelete(selected)}>Delete Post</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {deleteModalUI}
      {error && <div style={{ color: '#b3261e', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
      <h1 className={s.pageTitle}>Discussions</h1>
      <p className={s.pageSubtitle}>{discussions.length} discussions</p>

      <div className={s.card}><table className={s.table}>
        <thead><tr><th>Title</th><th>Author</th><th>Tier</th><th>Date</th><th>Tags</th><th>Actions</th></tr></thead>
        <tbody>
          {discussions.map(d => (
            <tr key={d.id}>
              <td className={s.tableClickable} onClick={() => openSelected(d)}>{d.title}</td>
              <td>{d.author}</td>
              <td>{d.tier && <span className={`${s.badge} ${s.badgePurple}`}>{d.tier}</span>}</td>
              <td>{d.date}</td>
              <td>{d.tags?.map(t => <span key={t} className={`${s.badge} ${s.badgeBlue}`} style={{ marginRight: 2 }}>{t}</span>)}</td>
              <td>
                <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => promptDelete(d)}>Delete</button>
              </td>
            </tr>
          ))}
          {discussions.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9b988f', padding: 24 }}>No discussions found</td></tr>}
        </tbody>
      </table></div>
    </div>
  )
}
