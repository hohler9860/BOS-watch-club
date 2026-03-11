import { useState } from 'react'
import { ADMIN_DISCUSSIONS } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminDiscussions() {
  const [discussions, setDiscussions] = useState(ADMIN_DISCUSSIONS)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const filtered = discussions.filter(d => statusFilter === 'all' || d.status === statusFilter)

  const statusBadge = (status) => {
    const map = { approved: s.badgeGreen, pending: s.badgeYellow, rejected: s.badgeRed }
    return <span className={`${s.badge} ${map[status] || s.badgeGray}`}>{status}</span>
  }

  function handleApprove(id) {
    setDiscussions(prev => prev.map(d => d.id === id ? { ...d, status: 'approved', rejectionReason: null } : d))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'approved', rejectionReason: null }))
  }

  function handleReject(id) {
    if (!rejectionReason.trim()) return
    setDiscussions(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected', rejectionReason: rejectionReason.trim() } : d))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'rejected', rejectionReason: rejectionReason.trim() }))
    setRejectionReason('')
  }

  function handleDelete(id) {
    setDiscussions(prev => prev.filter(d => d.id !== id))
    setSelected(null)
  }

  if (selected) {
    return (
      <div>
        <button className={s.backBtn} onClick={() => setSelected(null)}>&larr; Back to Discussions</button>
        <div className={s.detailPanel}>
          <div className={s.detailHeader}>
            <div>
              <div className={s.detailName}>{selected.title}</div>
              <div style={{ marginTop: 4 }}>by {selected.author} &middot; {selected.date} &middot; {statusBadge(selected.status)}</div>
            </div>
          </div>

          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>Content</div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{selected.body}</p>
          </div>

          {selected.rejectionReason && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Rejection Reason</div>
              <p style={{ fontSize: 14, color: '#dc2626' }}>{selected.rejectionReason}</p>
            </div>
          )}

          <div className={s.btnGroup}>
            {selected.status !== 'approved' && (
              <button className={`${s.btn} ${s.btnSuccess}`} onClick={() => handleApprove(selected.id)}>Approve</button>
            )}
            {selected.status !== 'rejected' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <label className={s.formLabel}>Rejection Reason</label>
                  <input className={s.formInput} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Why is this being rejected?" />
                </div>
                <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleReject(selected.id)}>Reject</button>
              </div>
            )}
            <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleDelete(selected.id)}>Delete</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className={s.pageTitle}>Discussions</h1>
      <p className={s.pageSubtitle}>{discussions.length} discussions</p>

      <div className={s.filterBar}>
        <select className={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className={s.card}>
        <table className={s.table}>
          <thead><tr><th>Title</th><th>Author</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td className={s.tableClickable} onClick={() => { setSelected(d); setRejectionReason('') }}>{d.title}</td>
                <td>{d.author}</td>
                <td>{d.date}</td>
                <td>{statusBadge(d.status)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {d.status === 'pending' && (
                      <>
                        <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => handleApprove(d.id)}>Approve</button>
                        <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => { setSelected(d); setRejectionReason('') }}>Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No discussions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
