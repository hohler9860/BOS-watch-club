import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAdminAuth from '../AdminAuth'
import s from '../admin.module.css'

const APPLICATION_DETAIL_FIELDS = [
  { key: 'city', label: 'City' },
  { key: 'phone', label: 'Phone' },
  { key: 'birthday', label: 'Birthday' },
  { key: 'profession', label: 'Profession' },
  { key: 'collecting_journey', label: 'Collecting Journey' },
  { key: 'current_watch', label: 'Current Watch' },
  { key: 'preferred_brands', label: 'Preferred Brands' },
  { key: 'hoping_to_get', label: 'Hoping to Get' },
  { key: 'other_communities', label: 'Other Communities' },
  { key: 'hobbies', label: 'Hobbies' },
  { key: 'watch_origin_story', label: 'Watch Origin Story' },
  { key: 'boston_spots', label: 'Boston Spots' },
  { key: 'holiday_destination', label: 'Holiday Destination' },
  { key: 'heard_about', label: 'Heard About' },
  { key: 'anything_else', label: 'Anything Else' },
]

function ApplicationModal({ app, onClose }) {
  if (!app) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: 28, maxWidth: 560, width: '100%',
          maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <strong style={{ fontSize: 15, color: '#f9fafb' }}>
            {[app.first_name, app.last_name].filter(Boolean).join(' ') || app.email}
          </strong>
          <button
            className={`${s.btn} ${s.btnSm}`}
            style={{ background: 'transparent', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2, color: '#6b7280', margin: '0 0 3px 0', textTransform: 'uppercase' }}>Email</p>
            <p style={{ fontSize: 13, color: '#e5e7eb', margin: 0 }}>{app.email}</p>
          </div>
          {app.instagram && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2, color: '#6b7280', margin: '0 0 3px 0', textTransform: 'uppercase' }}>Instagram</p>
              <p style={{ fontSize: 13, color: '#e5e7eb', margin: 0 }}>{app.instagram}</p>
            </div>
          )}
          {APPLICATION_DETAIL_FIELDS.map(({ key, label }) =>
            app[key] ? (
              <div key={key}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2, color: '#6b7280', margin: '0 0 3px 0', textTransform: 'uppercase' }}>{label}</p>
                <p style={{ fontSize: 13, color: '#e5e7eb', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{app[key]}</p>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminApprovedEmails() {
  const { getAdminToken } = useAdminAuth()
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [deniedApps, setDeniedApps] = useState([])
  const [waitlistedApps, setWaitlistedApps] = useState([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newTier, setNewTier] = useState('MEMBER')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [viewingApp, setViewingApp] = useState(null)

  const [registeredEmails, setRegisteredEmails] = useState(new Set())

  useEffect(() => { fetchEmails(); fetchApplications(); fetchDenied(); fetchWaitlisted(); fetchRegistered() }, [])

  async function fetchEmails() {
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('approved_members')
      .select('*')
      .order('added_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setEmails(data || [])
    }
    setLoading(false)
  }

  async function fetchRegistered() {
    if (!supabase) return
    const { data } = await supabase.from('profiles').select('email')
    if (data) setRegisteredEmails(new Set(data.map(p => p.email?.toLowerCase()).filter(Boolean)))
  }

  async function fetchApplications() {
    if (!supabase) { setLoadingApps(false); return }
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setApplications(data || [])
    setLoadingApps(false)
  }

  async function fetchDenied() {
    if (!supabase) return
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'denied')
      .order('created_at', { ascending: false })
    setDeniedApps(data || [])
  }

  async function fetchWaitlisted() {
    if (!supabase) return
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'waitlisted')
      .order('created_at', { ascending: false })
    setWaitlistedApps(data || [])
  }

  async function handleWaitlist(app) {
    setError('')
    setSuccess('')
    try {
      const token = getAdminToken()
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'waitlist',
          submissionId: app.id,
          email: app.email,
          firstName: app.first_name || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to waitlist applicant.')
        return
      }
      fetchApplications()
      fetchWaitlisted()
      if (data.emailFailed) {
        setSuccess(`${app.email} has been waitlisted, but the notification email failed to send.`)
      } else {
        setSuccess(`${app.email} has been waitlisted and notified.`)
      }
    } catch (err) {
      setError(err.message || 'Failed to waitlist applicant.')
    }
  }

  async function handleApprove(app) {
    setError('')
    setSuccess('')
    try {
      const token = getAdminToken()
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'accept',
          submissionId: app.id,
          email: app.email,
          firstName: app.first_name || '',
          lastName: app.last_name || '',
          tier: app.tier || 'MEMBER',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to accept applicant.')
        return
      }
      fetchApplications()
      fetchWaitlisted()
      fetchDenied()
      fetchEmails()
      setSuccess(`${app.email} has been accepted and notified with access code ${data.code}.`)
    } catch (err) {
      setError(err.message || 'Failed to accept applicant.')
    }
  }

  async function handleDeny(app) {
    if (!confirm(`Deny application from ${app.email}?`)) return
    setError('')
    setSuccess('')
    try {
      const token = getAdminToken()
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'deny',
          submissionId: app.id,
          email: app.email,
          firstName: app.first_name || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to deny applicant.')
        return
      }
      fetchApplications()
      fetchDenied()
      if (data.emailFailed) {
        setSuccess(`${app.email} has been denied, but the rejection email failed to send.`)
      } else {
        setSuccess(`${app.email} has been denied and notified.`)
      }
    } catch (err) {
      setError(err.message || 'Failed to deny applicant.')
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const email = newEmail.toLowerCase().trim()
    if (!email) {
      setError('Email is required.')
      return
    }

    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }

    try {
      const token = getAdminToken()
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'add-approved',
          email,
          name: newName.trim() || null,
          tier: newTier,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add approved email.')
        return
      }
      if (data.emailFailed) {
        setSuccess(`${email} has been invited with code ${data.code}, but the invitation email failed to send.`)
      } else {
        setSuccess(`${email} has been invited and sent an email with code ${data.code}.`)
      }
    } catch (err) {
      setError(err.message || 'Failed to add approved email.')
      return
    }

    setNewEmail('')
    setNewName('')
    setNewTier('MEMBER')
    fetchEmails()
    fetchRegistered()
  }

  async function handleRemove(id, email) {
    if (!confirm(`Completely remove ${email}? This deletes their account, profile, and all records.`)) return
    setError('')
    setSuccess('')
    try {
      const token = getAdminToken()

      // Find auth user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (profile?.id) {
        const res = await fetch('/api/delete-member', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: profile.id }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Failed to delete member.')
          return
        }
      } else {
        // No auth account — just clean up tables
        await supabase.from('approved_members').delete().eq('id', id)
        await supabase.from('submissions').delete().eq('email', email)
      }

      setEmails(prev => prev.filter(e => e.id !== id))
      fetchApplications()
      fetchRegistered()
      setSuccess(`${email} has been completely removed.`)
    } catch (err) {
      setError(err.message || 'Failed to remove member.')
    }
  }

  return (
    <div>
      <h1 className={s.pageTitle}>Applications & Approved Members</h1>
      <p className={s.pageSubtitle}>
        Review pending applications and manage the approved members list. {applications.length} pending, {waitlistedApps.length} waitlisted, {emails.length} approved, {deniedApps.length} denied.
      </p>

      {/* Pending Applications */}
      <div className={s.card}>
        <div className={s.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Pending Applications
          <span className={`${s.badge} ${s.badgeYellow}`}>{applications.length}</span>
        </div>
        {loadingApps ? (
          <p style={{ fontSize: 13, color: '#6b7280' }}>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No pending applications.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>{[app.first_name, app.last_name].filter(Boolean).join(' ') || '\u2014'}</td>
                  <td>{app.email}</td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button
                      className={`${s.btn} ${s.btnSm}`}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#d1d5db' }}
                      onClick={() => setViewingApp(app)}
                    >
                      View
                    </button>
                    <button
                      className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`}
                      onClick={() => handleApprove(app)}
                    >
                      Approve
                    </button>
                    <button
                      className={`${s.btn} ${s.btnSm}`}
                      style={{ background: '#dbeafe', color: '#1e40af', border: 'none' }}
                      onClick={() => handleWaitlist(app)}
                    >
                      Waitlist
                    </button>
                    <button
                      className={`${s.btn} ${s.btnDanger} ${s.btnSm}`}
                      onClick={() => handleDeny(app)}
                    >
                      Deny
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Waitlisted Applications */}
      <div className={s.card}>
        <div className={s.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Waitlisted
          <span className={`${s.badge} ${s.badgeBlue}`}>{waitlistedApps.length}</span>
        </div>
        {waitlistedApps.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No waitlisted applications.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitlistedApps.map(app => (
                <tr key={app.id}>
                  <td>{[app.first_name, app.last_name].filter(Boolean).join(' ') || '\u2014'}</td>
                  <td>{app.email}</td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button
                      className={`${s.btn} ${s.btnSm}`}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#d1d5db' }}
                      onClick={() => setViewingApp(app)}
                    >
                      View
                    </button>
                    <button
                      className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`}
                      onClick={() => handleApprove(app)}
                    >
                      Accept
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add new email */}
      <div className={s.card}>
        <div className={s.cardTitle}>Add Approved Email</div>
        <form onSubmit={handleAdd}>
          <div className={s.formRow} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className={s.formGroup} style={{ flex: '1 1 250px' }}>
              <label className={s.formLabel}>Email *</label>
              <input
                className={s.formInput}
                type="email"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setError(''); setSuccess('') }}
                placeholder="member@example.com"
              />
            </div>
            <div className={s.formGroup} style={{ flex: '1 1 200px' }}>
              <label className={s.formLabel}>Name (optional)</label>
              <input
                className={s.formInput}
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className={s.formGroup} style={{ flex: '0 0 160px' }}>
              <label className={s.formLabel}>Tier</label>
              <select className={s.formSelect} value={newTier} onChange={e => setNewTier(e.target.value)}>
                <option value="MEMBER">Member</option>
              </select>
            </div>
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          {success && <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 12 }}>{success}</p>}
          <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>Add Email</button>
        </form>
      </div>

      {/* List */}
      <div className={s.card}>
        {loading ? (
          <p style={{ fontSize: 13, color: '#6b7280' }}>Loading...</p>
        ) : !supabase ? (
          <p style={{ fontSize: 13, color: '#6b7280' }}>Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.</p>
        ) : emails.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No approved emails yet. Add one above.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {emails.map(row => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td>{row.name || '\u2014'}</td>
                  <td>
                    {registeredEmails.has(row.email?.toLowerCase())
                      ? <span className={`${s.badge} ${s.badgePurple}`}>{row.tier}</span>
                      : <span className={`${s.badge} ${s.badgeYellow}`}>INVITED</span>
                    }
                  </td>
                  <td>{new Date(row.added_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`${s.btn} ${s.btnDanger} ${s.btnSm}`}
                      onClick={() => handleRemove(row.id, row.email)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Denied Applications */}
      <div className={s.card}>
        <div className={s.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Denied Applications
          <span className={`${s.badge} ${s.badgeRed}`}>{deniedApps.length}</span>
        </div>
        {deniedApps.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No denied applications.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deniedApps.map(app => (
                <tr key={app.id}>
                  <td>{[app.first_name, app.last_name].filter(Boolean).join(' ') || '\u2014'}</td>
                  <td>{app.email}</td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button
                      className={`${s.btn} ${s.btnSm}`}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#d1d5db' }}
                      onClick={() => setViewingApp(app)}
                    >
                      View
                    </button>
                    <button
                      className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`}
                      onClick={() => handleApprove(app)}
                    >
                      Accept
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Application detail modal */}
      <ApplicationModal app={viewingApp} onClose={() => setViewingApp(null)} />
    </div>
  )
}
