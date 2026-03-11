import { useState, useMemo } from 'react'
import { ADMIN_PAYMENTS } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminPayments() {
  const [payments, setPayments] = useState(ADMIN_PAYMENTS)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => payments.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (search && !p.member.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false
    if (dateFrom && p.date < dateFrom) return false
    if (dateTo && p.date > dateTo) return false
    return true
  }), [payments, typeFilter, statusFilter, search, dateFrom, dateTo])

  const totalAll = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthRevenue = payments.filter(p => p.status === 'completed' && p.date.startsWith(thisMonth)).reduce((sum, p) => sum + p.amount, 0)
  const pendingTotal = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const refundTotal = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)

  const statusBadge = (status) => {
    const map = { completed: s.badgeGreen, pending: s.badgeYellow, refunded: s.badgeRed }
    return <span className={`${s.badge} ${map[status] || s.badgeGray}`}>{status}</span>
  }

  function handleRefund(id) {
    // TODO: Process refund through Stripe
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'refunded' } : p))
  }

  function exportCsv() {
    const csv = ['Member,Amount,Type,Date,Status,Description,Transaction ID', ...filtered.map(p =>
      `"${p.member}",${p.amount},"${p.type}","${p.date}","${p.status}","${p.description}","${p.txId || 'N/A'}"`
    )].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Payments</h1>
        <button className={`${s.btn} ${s.btnOutline}`} onClick={exportCsv}>Export CSV</button>
      </div>
      <p className={s.pageSubtitle}>{filtered.length} records shown</p>

      <div className={s.statsRow}>
        <div className={s.statCard}><span className={s.statValue}>${totalAll.toLocaleString()}</span><span className={s.statLabel}>Total Revenue</span></div>
        <div className={s.statCard}><span className={s.statValue}>${monthRevenue.toLocaleString()}</span><span className={s.statLabel}>This Month</span></div>
        <div className={s.statCard}><span className={s.statValue} style={{ color: pendingTotal > 0 ? '#f59e0b' : undefined }}>${pendingTotal.toLocaleString()}</span><span className={s.statLabel}>Pending</span></div>
        <div className={s.statCard}><span className={s.statValue} style={{ color: refundTotal > 0 ? '#dc2626' : undefined }}>${refundTotal.toLocaleString()}</span><span className={s.statLabel}>Refunds</span></div>
      </div>

      <div className={s.filterBar}>
        <input className={s.searchInput} placeholder="Search member or description..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className={s.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option><option value="membership">Membership</option><option value="event">Event</option><option value="cancellation_fee">Cancellation Fee</option>
        </select>
        <select className={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="refunded">Refunded</option>
        </select>
        <input className={s.formInput} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 'auto', padding: '6px 8px', fontSize: 12 }} />
        <input className={s.formInput} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 'auto', padding: '6px 8px', fontSize: 12 }} />
      </div>

      <div className={s.card}><table className={s.table}>
        <thead><tr><th>Member</th><th>Amount</th><th>Type</th><th>Date</th><th>Status</th><th>Description</th><th>Tx ID</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id}>
              <td>{p.member}</td>
              <td>${p.amount.toLocaleString()}</td>
              <td><span className={`${s.badge} ${p.type === 'membership' ? s.badgePurple : p.type === 'cancellation_fee' ? s.badgeRed : s.badgeBlue}`}>{p.type}</span></td>
              <td>{p.date}</td>
              <td>{statusBadge(p.status)}</td>
              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
              <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280' }}>{p.txId || '\u2014'}</td>
              <td>{p.status === 'completed' && <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => handleRefund(p.id)}>Refund</button>}</td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No payments found</td></tr>}
        </tbody>
      </table></div>
    </div>
  )
}
