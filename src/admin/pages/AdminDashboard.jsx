import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ total: 0, paid: 0, free: 0, upcoming: 0 })
  const [recentMembers, setRecentMembers] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentDiscussions, setRecentDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboard() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      const now = new Date().toISOString()

      try {
        const [membersRes, eventsRes, discRes] = await Promise.all([
          supabase.from('profiles')
            .select('id, name, role, tier, created_at')
            .order('created_at', { ascending: false })
            .limit(100),
          supabase.from('events')
            .select('id, name, date, datetime, venue')
            .gt('datetime', now)
            .order('datetime', { ascending: true })
            .limit(4),
          supabase.from('discussions')
            .select('id, title, author, tier, date')
            .order('sort_date', { ascending: false })
            .limit(5),
        ])

        if (membersRes.error) throw membersRes.error
        if (eventsRes.error) throw eventsRes.error
        if (discRes.error) throw discRes.error

        const members = membersRes.data
        const paid = members.filter(m => m.role === 'member' || m.role === 'founding_member' || m.role === 'vip')

        setStats({
          total: members.length,
          paid: paid.length,
          free: members.length - paid.length,
          upcoming: eventsRes.data.length,
        })
        setRecentMembers(members.slice(0, 5).map(m => ({
          ...m,
          joinDate: m.created_at ? m.created_at.split('T')[0] : '',
          isPaid: m.role === 'member' || m.role === 'founding_member' || m.role === 'vip',
        })))
        setUpcomingEvents(eventsRes.data)
        setRecentDiscussions(discRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div className={s.loading}>Loading dashboard...</div>

  return (
    <div>
      <h1 className={s.pageTitle}>Dashboard</h1>
      {error && <div style={{ color: '#b3261e', marginBottom: 16, fontSize: 13, background: '#fbeae8', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1c9c5' }}>Error: {error}</div>}

      <div className={s.statsRow}>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('members')}>
          <span className={s.statValue}>{stats.total}</span>
          <span className={s.statLabel}>Total Members</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('members')}>
          <span className={s.statValue} style={{ color: '#1f7a4d' }}>{stats.paid}</span>
          <span className={s.statLabel}>Paid Members</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('members')}>
          <span className={s.statValue} style={{ color: '#777777' }}>{stats.free}</span>
          <span className={s.statLabel}>Free Accounts</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('events')}>
          <span className={s.statValue}>{stats.upcoming}</span>
          <span className={s.statLabel}>Upcoming Events</span>
        </div>
      </div>

      <div className={s.twoCol}>
        <div className={s.card}>
          <div className={s.cardTitle}>Recent Members</div>
          {recentMembers.length === 0 ? (
            <div className={s.empty}><p className={s.emptyText}>No members yet</p></div>
          ) : (
            <table className={s.table}>
              <thead><tr><th>Name</th><th>Tier</th><th>Status</th><th>Joined</th></tr></thead>
              <tbody>
                {recentMembers.map(m => (
                  <tr key={m.id} className={s.tableClickable} onClick={() => onNavigate('members')}>
                    <td>{m.name || '(no name)'}</td>
                    <td><span className={`${s.badge} ${s.badgePurple}`}>{m.tier || 'MEMBER'}</span></td>
                    <td><span className={`${s.badge} ${m.isPaid ? s.badgeGreen : s.badgeGray}`}>{m.isPaid ? 'Paid' : 'Free'}</span></td>
                    <td>{m.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={s.card}>
          <div className={s.cardTitle}>Upcoming Events</div>
          {upcomingEvents.length === 0 ? (
            <div className={s.empty}><p className={s.emptyText}>No upcoming events</p></div>
          ) : (
            <table className={s.table}>
              <thead><tr><th>Event</th><th>Date</th><th>Venue</th></tr></thead>
              <tbody>
                {upcomingEvents.map(ev => (
                  <tr key={ev.id} className={s.tableClickable} onClick={() => onNavigate('events')}>
                    <td>{ev.name}</td>
                    <td>{ev.date}</td>
                    <td>{ev.venue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Recent Discussions</div>
        {recentDiscussions.length === 0 ? (
          <div className={s.empty}><p className={s.emptyText}>No discussions yet</p></div>
        ) : (
          <table className={s.table}>
            <thead><tr><th>Title</th><th>Author</th><th>Tier</th><th>Date</th></tr></thead>
            <tbody>
              {recentDiscussions.map(d => (
                <tr key={d.id} className={s.tableClickable} onClick={() => onNavigate('discussions')}>
                  <td>{d.title}</td>
                  <td>{d.author}</td>
                  <td><span className={`${s.badge} ${s.badgePurple}`}>{d.tier}</span></td>
                  <td>{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
