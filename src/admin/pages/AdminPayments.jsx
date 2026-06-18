import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAdminAuth from '../AdminAuth'
import s from '../admin.module.css'

export default function AdminPayments() {
  const { getAdminToken } = useAdminAuth()
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('stripe') // 'stripe' or 'local'

  useEffect(() => {
    fetchStripeData()
  }, [])

  async function fetchStripeData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe-payments', {
        headers: { 'Authorization': `Bearer ${getAdminToken() || ''}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch Stripe data')
      setPayments(data.payments)
      setStats(data.stats)
      setSource('stripe')
    } catch (err) {
      console.error('Stripe fetch failed, falling back to local:', err)
      // Fallback to Supabase payments table
      await fetchLocalData()
    } finally {
      setLoading(false)
    }
  }

  async function fetchLocalData() {
    try {
      const { data, error: err } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setPayments(data.map(p => ({
        ...p,
        email: '',
        name: '',
      })))
      setStats(null)
      setSource('local')
    } catch (err) {
      setError(err.message)
    }
  }

  const totalRevenue = stats?.totalRevenue ?? payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const monthRevenue = stats?.monthRevenue ?? 0
  const totalPayments = stats?.totalPayments ?? payments.length
  const byTier = stats?.byTier ?? {}
  const stripeBalance = stats?.stripeBalance

  // Monthly breakdown
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
      return `"${p.name || p.email || ''}","${p.tier || ''}",${fmt(p.amount)},"${p.status}","${p.created_at?.split('T')[0] || ''}","${p.stripe_session_id || ''}"`
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`${s.btn} ${s.btnOutline}`} onClick={fetchStripeData} disabled={loading}>
            Refresh
          </button>
          <button className={`${s.btn} ${s.btnOutline}`} onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#777777', marginBottom: 16 }}>
        {source === 'stripe' ? 'Live data from Stripe' : 'Local data from database'}
      </p>
      {error && <div style={{ color: '#b3261e', marginBottom: 16, fontSize: 13, background: '#fbeae8', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1c9c5' }}>Error: {error}</div>}

      {/* Stats row */}
      <div className={s.statsRow}>
        <div className={s.statCard}>
          <span className={s.statValue} style={{ color: '#1f7a4d' }}>{fmt(totalRevenue)}</span>
          <span className={s.statLabel}>Total Revenue</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue} style={{ color: '#1f7a4d' }}>{fmt(monthRevenue)}</span>
          <span className={s.statLabel}>This Month</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{totalPayments}</span>
          <span className={s.statLabel}>Total Payments</span>
        </div>
        {stripeBalance && (
          <>
            <div className={s.statCard}>
              <span className={s.statValue} style={{ color: '#1f7a4d' }}>{fmt(stripeBalance.available)}</span>
              <span className={s.statLabel}>Stripe Available</span>
            </div>
            <div className={s.statCard}>
              <span className={s.statValue} style={{ color: '#8a6d1a' }}>{fmt(stripeBalance.pending)}</span>
              <span className={s.statLabel}>Stripe Pending</span>
            </div>
          </>
        )}
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
                  <td style={{ color: '#1f7a4d', fontWeight: 600 }}>{fmt(byMonth[m].revenue)}</td>
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
            {payments.map(p => (
              <tr key={p.id}>
                <td>{p.created_at ? p.created_at.split('T')[0] : '—'}</td>
                <td>{p.name || p.email || '(unknown)'}</td>
                <td><span className={`${s.badge} ${s.badgePurple}`}>{p.tier || '—'}</span></td>
                <td style={{ fontWeight: 600, color: '#1f7a4d' }}>{fmt(p.amount)}</td>
                <td><span className={`${s.badge} ${s.badgeGreen}`}>{p.status}</span></td>
                <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#777777' }}>{p.stripe_session_id ? p.stripe_session_id.slice(0, 20) + '...' : '—'}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9b988f', padding: 24 }}>No payments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
