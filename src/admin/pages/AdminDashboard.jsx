import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    active: 0, pending: 0, suspended: 0,
    upcoming: 0, pendingDiscussions: 0,
  })
  const [recentApps, setRecentApps] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentNews, setRecentNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboard() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      const now = new Date().toISOString()

      try {
        const [
          activeRes, pendingRes, suspendedRes,
          upcomingRes, pendingDiscRes,
          appsRes, eventsRes, newsRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
          supabase.from('events').select('id', { count: 'exact', head: true }).gt('datetime', now),
          supabase.from('discussions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('profiles')
            .select('id, name, tier, created_at')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('events')
            .select('id, name, date, capacity, payment_type, datetime')
            .gt('datetime', now)
            .order('datetime', { ascending: true })
            .limit(3),
          supabase.from('club_news')
            .select('id, title, date, sort_date, status')
            .order('sort_date', { ascending: false })
            .limit(3),
        ])

        // Throw on first error
        for (const res of [activeRes, pendingRes, suspendedRes, upcomingRes, pendingDiscRes, appsRes, eventsRes, newsRes]) {
          if (res.error) throw res.error
        }

        setStats({
          active: activeRes.count ?? 0,
          pending: pendingRes.count ?? 0,
          suspended: suspendedRes.count ?? 0,
          upcoming: upcomingRes.count ?? 0,
          pendingDiscussions: pendingDiscRes.count ?? 0,
        })

        setRecentApps(appsRes.data.map(m => ({
          ...m,
          name: m.name || m.email || m.id,
          joinDate: m.created_at ? m.created_at.split('T')[0] : '',
        })))

        setUpcomingEvents(eventsRes.data)
        setRecentNews(newsRes.data)
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
      <p className={s.pageSubtitle}>
        Overview of your watch club
        {error && <span style={{ color: '#dc2626', fontWeight: 600, marginLeft: 8 }}>Warning: some data failed to load ({error})</span>}
      </p>

      <div className={s.statsRow}>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('members')}>
          <span className={s.statValue}>{stats.active}</span>
          <span className={s.statLabel}>Active Members</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('members')}>
          <span className={s.statValue} style={{ color: stats.pending > 0 ? '#f59e0b' : undefined }}>{stats.pending}</span>
          <span className={s.statLabel}>Pending Applications</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('events')}>
          <span className={s.statValue}>{stats.upcoming}</span>
          <span className={s.statLabel}>Upcoming Events</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('discussions')}>
          <span className={s.statValue} style={{ color: stats.pendingDiscussions > 0 ? '#f59e0b' : undefined }}>{stats.pendingDiscussions}</span>
          <span className={s.statLabel}>Pending Discussions</span>
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <span className={s.statValue}>{stats.suspended}</span>
          <span className={s.statLabel}>Suspended</span>
        </div>
      </div>

      <div className={s.twoCol}>
        <div className={s.card}>
          <div className={s.cardTitle}>Recent Applications</div>
          {recentApps.length === 0 ? (
            <div className={s.empty}><p className={s.emptyText}>No pending applications</p></div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr><th>Name</th><th>Tier</th><th>Applied</th></tr>
              </thead>
              <tbody>
                {recentApps.map(m => (
                  <tr key={m.id} className={s.tableClickable} onClick={() => onNavigate('members')}>
                    <td>{m.name}</td>
                    <td><span className={`${s.badge} ${s.badgePurple}`}>{m.tier}</span></td>
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
              <thead>
                <tr><th>Event</th><th>Date</th><th>Capacity</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {upcomingEvents.map(ev => (
                  <tr key={ev.id} className={s.tableClickable} onClick={() => onNavigate('events')}>
                    <td>{ev.name}</td>
                    <td>{ev.date}</td>
                    <td>{ev.capacity}</td>
                    <td><span className={`${s.badge} ${s.badgeBlue}`}>{ev.payment_type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Recent Club News</div>
        {recentNews.length === 0 ? (
          <div className={s.empty}><p className={s.emptyText}>No club news yet</p></div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr><th>Title</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentNews.map(n => (
                <tr key={n.id} className={s.tableClickable} onClick={() => onNavigate('blog')}>
                  <td>{n.title}</td>
                  <td>{n.date}</td>
                  <td><span className={`${s.badge} ${n.status === 'published' ? s.badgeGreen : s.badgeYellow}`}>{n.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
