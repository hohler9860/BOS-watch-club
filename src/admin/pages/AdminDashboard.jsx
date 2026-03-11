import { ADMIN_MEMBERS, ADMIN_PAYMENTS } from '../../data/adminData'
import events from '../../data/events'
import s from '../admin.module.css'

export default function AdminDashboard({ onNavigate }) {
  const active = ADMIN_MEMBERS.filter(m => m.status === 'active').length
  const pending = ADMIN_MEMBERS.filter(m => m.status === 'pending').length
  const revenue = ADMIN_PAYMENTS.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const upcoming = events.filter(e => new Date(e.datetime) > new Date()).length

  const recentApps = ADMIN_MEMBERS.filter(m => m.status === 'pending').slice(0, 5)
  const upcomingEvents = events.filter(e => new Date(e.datetime) > new Date()).slice(0, 3)

  return (
    <div>
      <h1 className={s.pageTitle}>Dashboard</h1>
      <p className={s.pageSubtitle}>Overview of your watch club</p>

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <span className={s.statValue}>{active}</span>
          <span className={s.statLabel}>Active Members</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{pending}</span>
          <span className={s.statLabel}>Pending Applications</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>${revenue.toLocaleString()}</span>
          <span className={s.statLabel}>Total Revenue</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{upcoming}</span>
          <span className={s.statLabel}>Upcoming Events</span>
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
                <tr><th>Name</th><th>Tier</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentApps.map(m => (
                  <tr key={m.id} className={s.tableClickable} onClick={() => onNavigate('members')}>
                    <td>{m.name}</td>
                    <td><span className={`${s.badge} ${s.badgeYellow}`}>{m.tier}</span></td>
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
                <tr><th>Event</th><th>Date</th><th>Spots</th></tr>
              </thead>
              <tbody>
                {upcomingEvents.map(ev => (
                  <tr key={ev.id} className={s.tableClickable} onClick={() => onNavigate('events')}>
                    <td>{ev.title}</td>
                    <td>{new Date(ev.datetime).toLocaleDateString()}</td>
                    <td>{ev.spotsLeft}/{ev.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
