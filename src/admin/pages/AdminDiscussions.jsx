import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminDiscussions() {
  const [discussions, setDiscussions] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [replies, setReplies] = useState([]) // replies for the selected discussion
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
        setDiscussions(data.map(normalizeDiscussion))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDiscussions()
  }, [])

  function normalizeDiscussion(d) {
    return {
      ...d,
      rejectionReason: d.rejection_reason,
    }
  }

  async function loadReplies(discussionId) {
    if (!supabase) return
    try {
      const { data, error: err } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('date', { ascending: true })
      if (err) throw err
      setReplies(data)
    } catch (err) {
      // Non-fatal: replies failing shouldn't block the detail view
      console.error('Failed to load replies:', err.message)
      setReplies([])
    }
  }

  function openSelected(d) {
    setSelected(d)
    setRejectionReason('')
    loadReplies(d.id)
  }

  const filtered = discussions.filter(d => statusFilter === 'all' || d.status === statusFilter)
  const pendingCount = discussions.filter(d => d.status === 'pending').length

  const statusBadge = (status) => {
    const map = { approved: s.badgeGreen, pending: s.badgeYellow, rejected: s.badgeRed }
    return <span className={`${s.badge} ${map[status] || s.badgeGray}`}>{status}</span>
  }

  async function handleApprove(id) {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('discussions').update({
        status: 'approved',
        rejection_reason: null,
      }).eq('id', id)
      if (err) throw err
      setDiscussions(prev => prev.map(d => d.id === id ? { ...d, status: 'approved', rejectionReason: null } : d))
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'approved', rejectionReason: null }))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReject(id) {
    if (!rejectionReason.trim()) return
    if (!supabase) return
    setError(null)
    const reason = rejectionReason.trim()
    try {
      const { error: err } = await supabase.from('discussions').update({
        status: 'rejected',
        rejection_reason: reason,
      }).eq('id', id)
      if (err) throw err
      setDiscussions(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected', rejectionReason: reason } : d))
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'rejected', rejectionReason: reason }))
      setRejectionReason('')
    } catch (err) {
      setError(err.message)
    }
  }

  function promptDelete(discussion) {
    setDeleteModal({ id: discussion.id, author_id: discussion.author_id, title: discussion.title })
    setDeleteReason('')
  }

  async function confirmDelete() {
    if (!deleteReason.trim()) return
    if (!supabase) return
    setDeleting(true)
    setError(null)
    try {
      // Delete the discussion
      const { error: delErr } = await supabase.from('discussions').delete().eq('id', deleteModal.id)
      if (delErr) throw delErr

      // Notify the author if we have their user id
      if (deleteModal.author_id) {
        await supabase.from('user_notifications').insert({
          user_id: deleteModal.author_id,
          title: 'Your discussion was removed',
          body: `Your post "${deleteModal.title}" was removed by an admin.\n\nReason: ${deleteReason.trim()}`,
          type: 'moderation',
        })
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

  // Delete confirmation modal
  const deleteModalUI = deleteModal && (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => !deleting && setDeleteModal(null)}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 440, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Delete Discussion</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
          You are about to delete <strong>&ldquo;{deleteModal.title}&rdquo;</strong>. The author will be notified. This cannot be undone.
        </p>
        <label className={s.formLabel}>Reason for deletion <span style={{ color: '#dc2626' }}>*</span></label>
        <textarea
          className={s.formInput}
          style={{ height: 80, resize: 'vertical' }}
          value={deleteReason}
          onChange={e => setDeleteReason(e.target.value)}
          placeholder="Explain why this post is being removed..."
          disabled={deleting}
        />
        {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className={`${s.btn}`} onClick={() => setDeleteModal(null)} disabled={deleting}>Cancel</button>
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
        {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
        <button className={s.backBtn} onClick={() => setSelected(null)}>&larr; Back to Discussions</button>
        <div className={s.detailPanel}>
          <div className={s.detailHeader}>
            <div>
              <div className={s.detailName}>{selected.title}</div>
              <div style={{ marginTop: 4 }}>
                by {selected.author}
                {selected.tier && <span className={`${s.badge} ${s.badgePurple}`} style={{ marginLeft: 6 }}>{selected.tier}</span>}
                {' '}&middot; {selected.date} &middot; {statusBadge(selected.status)}
              </div>
            </div>
          </div>

          {selected.tags?.length > 0 && <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>{selected.tags.map(t => <span key={t} className={`${s.badge} ${s.badgeBlue}`}>{t}</span>)}</div>}

          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>Content</div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{selected.body}</p>
          </div>

          {replies.length > 0 && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Replies ({replies.length})</div>
              {replies.map((r, i) => (
                <div key={r.id || i} style={{ padding: '10px 0', borderBottom: i < replies.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    <strong>{r.author}</strong>
                    {r.tier && <span className={`${s.badge} ${s.badgePurple}`} style={{ marginLeft: 4 }}>{r.tier}</span>}
                    {' '}&middot; {r.date}
                  </div>
                  <p style={{ fontSize: 14, color: '#374151' }}>{r.body}</p>
                </div>
              ))}
            </div>
          )}

          {selected.rejectionReason && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Rejection Reason</div>
              <p style={{ fontSize: 14, color: '#dc2626' }}>{selected.rejectionReason}</p>
            </div>
          )}

          <div className={s.btnGroup}>
            {selected.status !== 'approved' && <button className={`${s.btn} ${s.btnSuccess}`} onClick={() => handleApprove(selected.id)}>Approve</button>}
            {selected.status !== 'rejected' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <label className={s.formLabel}>Rejection Reason</label>
                  <input className={s.formInput} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Why is this being rejected?" />
                </div>
                <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleReject(selected.id)}>Reject</button>
              </div>
            )}
            <button className={`${s.btn} ${s.btnDanger}`} onClick={() => promptDelete(selected)}>Delete</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {deleteModalUI}
      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
      <h1 className={s.pageTitle}>Discussions</h1>
      <p className={s.pageSubtitle}>{discussions.length} discussions{pendingCount > 0 && <> &middot; <strong style={{ color: '#f59e0b' }}>{pendingCount} pending review</strong></>}</p>

      <div className={s.filterBar}>
        <select className={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
        </select>
      </div>

      <div className={s.card}><table className={s.table}>
        <thead><tr><th>Title</th><th>Author</th><th>Tier</th><th>Date</th><th>Tags</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map(d => (
            <tr key={d.id}>
              <td className={s.tableClickable} onClick={() => openSelected(d)}>{d.title}</td>
              <td>{d.author}</td>
              <td>{d.tier && <span className={`${s.badge} ${s.badgePurple}`}>{d.tier}</span>}</td>
              <td>{d.date}</td>
              <td>{d.tags?.map(t => <span key={t} className={`${s.badge} ${s.badgeBlue}`} style={{ marginRight: 2 }}>{t}</span>)}</td>
              <td>{statusBadge(d.status)}</td>
              <td><div style={{ display: 'flex', gap: 4 }}>
                {d.status === 'pending' && (<><button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => handleApprove(d.id)}>Approve</button><button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => openSelected(d)}>Reject</button></>)}
                <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => promptDelete(d)}>Delete</button>
              </div></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No discussions found</td></tr>}
        </tbody>
      </table></div>
    </div>
  )
}
