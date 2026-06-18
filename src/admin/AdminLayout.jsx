import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import useAdminAuth from './AdminAuth'
import AdminLogin from './AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminMembers from './pages/AdminMembers'
import AdminEvents from './pages/AdminEvents'
import AdminBlog from './pages/AdminBlog'
import AdminDiscussions from './pages/AdminDiscussions'
import AdminSiteContent from './pages/AdminSiteContent'
import AdminApprovedEmails from './pages/AdminApprovedEmails'
import AdminEmailBlast from './pages/AdminEmailBlast'
import s from './admin.module.css'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
  { id: 'applications', label: 'Applications', icon: '\u{1F4E9}' },
  { id: 'members', label: 'Members', icon: '\u{1F465}' },
  { id: 'events', label: 'Events', icon: '\u{1F4C5}' },
  { id: 'blog', label: 'News', icon: '\u{1F4DD}' },
  { id: 'discussions', label: 'Discussions', icon: '\u{1F4AC}' },
  { id: 'email-blast', label: 'Email Blast', icon: '\u{2709}\u{FE0F}' },
  { id: 'site-content', label: 'Site Content', icon: '\u{2699}\u{FE0F}' },
]

export default function AdminLayout() {
  const { admin, logout, loading } = useAdminAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    const valid = NAV_ITEMS.some(item => item.id === hash)
    return valid ? hash : 'dashboard'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
    window.location.hash = activeSection
  }, [activeSection])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a1a', color: '#efede7' }}>Loading...</div>
  if (!admin) return <AdminLogin />

  function handleLogout() {
    logout()
    navigate('/admin')
  }

  return (
    <div className={s.layout}>
      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && <div className={s.sidebarBackdrop} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${s.sidebar} ${sidebarOpen ? s.sidebarOpen : ''}`}>
        <div className={s.sidebarBrand}>BOS WATCH CLUB</div>
        <nav className={s.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${s.sidebarItem} ${activeSection === item.id ? s.sidebarItemActive : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className={s.main}>
        <header className={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className={s.mobileToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span />
            </button>
            <span className={s.topbarTitle}>BOS Watch Club Admin</span>
          </div>
          <button className={s.topbarLogout} onClick={handleLogout}>Log out</button>
        </header>
        <div className={s.content}>
          {activeSection === 'dashboard' && <AdminDashboard onNavigate={setActiveSection} />}
          {activeSection === 'applications' && <AdminApprovedEmails />}
          {activeSection === 'members' && <AdminMembers />}
          {activeSection === 'events' && <AdminEvents />}
          {activeSection === 'blog' && <AdminBlog />}
          {activeSection === 'discussions' && <AdminDiscussions />}
          {activeSection === 'email-blast' && <AdminEmailBlast />}
          {activeSection === 'site-content' && <AdminSiteContent />}
        </div>
      </div>
    </div>
  )
}
