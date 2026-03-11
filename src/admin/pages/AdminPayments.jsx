import { useState } from 'react'
import { ADMIN_PAYMENTS } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminPayments() {
  const [payments, setPayments] = useState(ADMIN_PAYMENTS)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = payments.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (search && !p.member.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalRevenue = filtered.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)

  const statusBadge = (status) => {
    const map = { completed: s.badgeGreen, pending: s.badgeYellow, refunded: s.badgeRed }
    return <span className={`${s.badge} ${map[status] || s.badgeGray}`}>{status}</span>
  }

  function handleRefund(id) {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'refunded' } : p))
  }

  function exportCsv() {
    const csv = ['Member,Amount,Type,Date,Status,Description,Transaction ID', ...filtered.map(p =>
      `${p.member},${p.amount},${p.type},${p.date},${p.status},"${p.description}",${p.txId || 'N/A'}`
    )].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payments-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Payments</h1>
        <button className={`${s.btn} ${s.btnOutline}`} onClick={exportCsv}>Export CSV</button>
      </div>
      <p className={s.pageSubtitle}>Total revenue (filtered): ${totalRevenue.toLocaleString()}</p>

      <div className={s.statsRow} style={{ marginBottom: 20 }}>
        <div className={s.statCard}>
          <span className={s.statValue}>${payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
          <span className={s.statLabel}>Total Completed</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{payments.filter(p => p.status === 'completed' && p.type === 'membership').length}</span>
          <span className={s.statLabel}>Membership Payments</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{payments.filter(p => p.status === 'completed' && p.type === 'event').length}</span>
          <span className={s.statLabel}>Event Payments</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{payments.filter(p => p.status === 'refunded').length}</span>
          <span className={s.statLabel}>Refunds</span>
        </div>
      </div>

      <div className={s.filterBar}>
        <input className={s.searchInput} placeholder="Search by member or description..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className={s.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="membership">Membership</option>
          <option value="event">Event</option>
        </select>
        <select className={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className={s.card}>
        <table className={s.table}>
          <thead><tr><th>Member</th><th>Amount</th><th>Type</th><th>Date</th><th>Status</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{p.member}</td>
                <td>${p.amount.toLocaleString()}</td>
                <td><span className={`${s.badge} ${p.type === 'membership' ? s.badgePurple : s.badgeBlue}`}>{p.type}</span></td>
                <td>{p.date}</td>
                <td>{statusBadge(p.status)}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                <td>
                  {p.status === 'completed' && (
                    <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => handleRefund(p.id)}>Refund</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
