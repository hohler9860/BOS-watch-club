import FadeIn from '../../components/shared/FadeIn'
import s from '../DashboardPage.module.css'

export default function NotificationsTab({
  actualUnread,
  userNotifications,
  sortedNews,
  readNotifications,
  setReadNotifications,
  setSelectedUpdate,
}) {
  return (
    <div className={s.tabContent}>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Notifications</h1>
          <p className={s.pageSubtitle}>{actualUnread > 0 ? `${actualUnread} unread` : 'All caught up'}</p>
        </div>
      </FadeIn>

      {userNotifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(232,236,240,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>MODERATION ALERTS</p>
          <div className={s.notificationsList}>
            {userNotifications.map((item, i) => {
              const isUnread = !item.read && !readNotifications.includes(item.id)
              return (
                <FadeIn key={item.id} delay={`${0.05 * i}s`}>
                  <div
                    className={`${s.notificationItem} ${isUnread ? s.notificationUnread : ''}`}
                    onClick={() => {
                      setSelectedUpdate({ title: item.title, body: item.body, date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) })
                      if (isUnread) setReadNotifications((prev) => [...prev, item.id])
                    }}
                  >
                    {isUnread && <div className={s.notifDot} />}
                    <div className={s.notifContent}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p className={s.notifTitle}>{item.title}</p>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.12em', color: 'rgba(220,38,38,0.8)', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase', flexShrink: 0 }}>Admin</span>
                      </div>
                      <p className={s.notifPreview}>{item.body?.split('\n')[0]}</p>
                      <span className={s.notifDate}>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      )}

      {sortedNews.length > 0 && (
        <>
          {userNotifications.length > 0 && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(232,236,240,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>CLUB UPDATES</p>
          )}
          <div className={s.notificationsList}>
            {sortedNews.map((item, i) => {
              const isUnread = !item.read && !readNotifications.includes(item.id)
              return (
                <FadeIn key={item.id} delay={`${0.05 * i}s`}>
                  <div
                    className={`${s.notificationItem} ${isUnread ? s.notificationUnread : ''}`}
                    onClick={() => {
                      setSelectedUpdate(item)
                      if (isUnread) setReadNotifications((prev) => [...prev, item.id])
                    }}
                  >
                    {isUnread && <div className={s.notifDot} />}
                    <div className={s.notifContent}>
                      <p className={s.notifTitle}>{item.title}</p>
                      <p className={s.notifPreview}>{item.preview}</p>
                      <span className={s.notifDate}>{item.date}</span>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </>
      )}

      {userNotifications.length === 0 && sortedNews.length === 0 && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(232,236,240,0.3)', textAlign: 'center', padding: '40px 0' }}>No notifications yet</p>
      )}
    </div>
  )
}
