import { ADMIN_MEMBERS, ADMIN_PAYMENTS, ADMIN_EVENTS, ADMIN_DISCUSSIONS, ADMIN_CLUB_NEWS } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminDashboard({ onNavigate }) {
  const active = ADMIN_MEMBERS.filter(m => m.status === 'active').length
  const pending = ADMIN_MEMBERS.filter(m => m.status === 'pending').length
  const suspended = ADMIN_MEMBERS.filter(m => m.status === 'suspended').length
  const completedPayments = ADMIN_PAYMENTS.filter(p => p.status === 'completed')
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthRevenue = completedPayments.filter(p => p.date.startsWith(thisMonth)).reduce((sum, p) => sum + p.amount, 0)
  const upcoming = ADMIN_EVENTS.filter(e => new Date(e.datetime) > now).length
  const pendingDiscussions = ADMIN_DISCUSSIONS.filter(d => d.status === 'pending').length
  const pendingPayments = ADMIN_PAYMENTS.filter(p => p.status === 'pending').length
  const refunds = ADMIN_PAYMENTS.filter(p => p.status === 'refunded').length

  const recentApps = ADMIN_MEMBERS.filter(m => m.status === 'pending').slice(0, 5)
  const upcomingEvents = ADMIN_EVENTS.filter(e => new Date(e.datetime) > now).slice(0, 3)
  const recentNews = [...ADMIN_CLUB_NEWS].sort((a, b) => b.sortDate.localeCompare(a.sortDate)).slice(0, 3)

  return (
    <div>
      <h1 className={s.pageTitle}>Dashboard</h1>
      <p className={s.pageSubtitle}>Overview of your watch club</p>

      <div className={s.statsRow}>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('members')}>
          <span className={s.statValue}>{active}</span>
          <span className={s.statLabel}>Active Members</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('members')}>
          <span className={s.statValue} style={{ color: pending > 0 ? '#f59e0b' : undefined }}>{pending}</span>
          <span className={s.statLabel}>Pending Applications</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('payments')}>
          <span className={s.statValue}>${totalRevenue.toLocaleString()}</span>
          <span className={s.statLabel}>Total Revenue</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('payments')}>
          <span className={s.statValue}>${monthRevenue.toLocaleString()}</span>
          <span className={s.statLabel}>Revenue This Month</span>
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <span className={s.statValue}>{upcoming}</span>
          <span className={s.statLabel}>Upcoming Events</span>
        </div>
        <div className={s.statCard} style={{ cursor: 'pointer' }} onClick={() => onNavigate('discussions')}>
          <span className={s.statValue} style={{ color: pendingDiscussions > 0 ? '#f59e0b' : undefined }}>{pendingDiscussions}</span>
          <span className={s.statLabel}>Pending Discussions</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{suspended}</span>
          <span className={s.statLabel}>Suspended</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{pendingPayments}</span>
          <span className={s.statLabel}>Pending Payments</span>
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
                <tr><th>Name</th><th>Tier</th><th>Applied</th><th>Referral</th></tr>
              </thead>
              <tbody>
                {recentApps.map(m => (
                  <tr key={m.id} className={s.tableClickable} onClick={() => onNavigate('members')}>
                    <td>{m.name}</td>
                    <td><span className={`${s.badge} ${s.badgePurple}`}>{m.tier}</span></td>
                    <td>{m.joinDate}</td>
                    <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.applicationAnswers?.referral}</td>
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
      </div>
    </div>
  )
}
