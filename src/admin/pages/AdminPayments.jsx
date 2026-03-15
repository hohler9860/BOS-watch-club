import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      try {
        const [paymentsRes, profilesRes] = await Promise.all([
          supabase.from('payments').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('id, name, tier, role'),
        ])
        if (paymentsRes.error) throw paymentsRes.error
        if (profilesRes.error) throw profilesRes.error

        const profileMap = {}
        for (const p of profilesRes.data) profileMap[p.id] = p
        setProfiles(profileMap)
        setPayments(paymentsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthRevenue = payments
    .filter(p => p.created_at?.slice(0, 7) === thisMonth)
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const byTier = payments.reduce((acc, p) => {
    const t = p.tier || 'Unknown'
    acc[t] = (acc[t] || 0) + (p.amount || 0)
    return acc
  }, {})

  // Monthly breakdown (last 6 months)
  const byMonth = payments.reduce((acc, p) => {
    const month = p.created_at ? p.created_at.slice(0, 7) : 'Unknown'
    if (!acc[month]) acc[month] = { revenue: 0, count: 0 }
    acc[month].revenue += p.amount || 0
    acc[month].count += 1
    return acc
  }, {})
  const months = Object.keys(byMonth).sort().reverse().slice(0, 6)

  function fmt(cents) {
    return `$${(cents / 100).toFixed(2)}`
  }

  function exportCsv() {
    const rows = payments.map(p => {
      const profile = profiles[p.user_id]
      return `"${profile?.name || ''}","${p.tier || ''}",${fmt(p.amount)},"${p.status}","${p.created_at?.split('T')[0] || ''}","${p.stripe_session_id || ''}"`
    })
    const csv = ['Member,Tier,Amount,Status,Date,Stripe Session', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className={s.loading}>Loading payments...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className={s.pageTitle}>Payments & Revenue</h1>
        <button className={`${s.btn} ${s.btnOutline}`} onClick={exportCsv}>Export CSV</button>
      </div>
      {error && <div style={{ color: '#dc2626', marginBottom: 16, fontSize: 13, background: '#fef2f2', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca' }}>Error: {error}</div>}

      {/* Stats row */}
      <div className={s.statsRow}>
        <div className={s.statCard}>
          <span className={s.statValue} style={{ color: '#16a34a' }}>{fmt(totalRevenue)}</span>
          <span className={s.statLabel}>Total Revenue</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue} style={{ color: '#16a34a' }}>{fmt(monthRevenue)}</span>
          <span className={s.statLabel}>This Month</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{payments.length}</span>
          <span className={s.statLabel}>Total Payments</span>
        </div>
        {Object.entries(byTier).map(([tier, amt]) => (
          <div key={tier} className={s.statCard}>
            <span className={s.statValue}>{fmt(amt)}</span>
            <span className={s.statLabel}>{tier}</span>
          </div>
        ))}
      </div>

      {/* Monthly breakdown */}
      {months.length > 0 && (
        <div className={s.card} style={{ marginBottom: 20 }}>
          <div className={s.cardTitle}>Monthly Revenue (Last 6 Months)</div>
          <table className={s.table}>
            <thead><tr><th>Month</th><th>Revenue</th><th>Payments</th></tr></thead>
            <tbody>
              {months.map(m => (
                <tr key={m}>
                  <td>{m}</td>
                  <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(byMonth[m].revenue)}</td>
                  <td>{byMonth[m].count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All transactions */}
      <div className={s.card}>
        <div className={s.cardTitle}>All Transactions</div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Member</th>
              <th>Tier</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Stripe Session</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => {
              const profile = profiles[p.user_id]
              return (
                <tr key={p.id}>
                  <td>{p.created_at ? p.created_at.split('T')[0] : '—'}</td>
                  <td>{profile?.name || '(unknown)'}</td>
                  <td><span className={`${s.badge} ${s.badgePurple}`}>{p.tier || '—'}</span></td>
                  <td style={{ fontWeight: 600, color: '#16a34a' }}>{fmt(p.amount)}</td>
                  <td><span className={`${s.badge} ${s.badgeGreen}`}>{p.status}</span></td>
                  <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280' }}>{p.stripe_session_id ? p.stripe_session_id.slice(0, 20) + '…' : '—'}</td>
                </tr>
              )
            })}
            {payments.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No payments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
