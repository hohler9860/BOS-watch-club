import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
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
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newTier, setNewTier] = useState('MEMBER')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [viewingApp, setViewingApp] = useState(null)

  useEffect(() => { fetchEmails(); fetchApplications() }, [])

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

  async function handleApprove(app) {
    setError('')
    setSuccess('')
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
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
      fetchEmails()
      setSuccess(`${app.email} has been accepted and notified with access code ${data.code}.`)
    } catch (err) {
      setError(err.message || 'Failed to accept applicant.')
    }
  }

  async function handleDeny(app) {
    if (!confirm(`Deny application from ${app.email}?`)) return
    await supabase.from('submissions').update({ status: 'denied' }).eq('id', app.id)

    // Send rejection email
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'rejection',
        to: app.email,
        data: { firstName: app.first_name || 'Applicant' },
      }),
    }).catch(err => console.error('Rejection email failed:', err))

    fetchApplications()
    setSuccess(`${app.email} has been denied and notified.`)
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

    const { error } = await supabase
      .from('approved_members')
      .insert({ email, name: newName.trim() || null, tier: newTier })

    if (error) {
      if (error.code === '23505') {
        setError('This email is already approved.')
      } else {
        setError(error.message)
      }
      return
    }

    setSuccess(`${email} has been approved.`)
    setNewEmail('')
    setNewName('')
    setNewTier('MEMBER')
    fetchEmails()
  }

  async function handleRemove(id, email) {
    if (!confirm(`Remove ${email} from approved list?`)) return
    const { error } = await supabase
      .from('approved_members')
      .delete()
      .eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setEmails(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div>
      <h1 className={s.pageTitle}>Applications & Approved Members</h1>
      <p className={s.pageSubtitle}>
        Review pending applications and manage the approved members list. {applications.length} pending, {emails.length} approved.
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
                <th>Instagram</th>
                <th>Tier Preference</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>{[app.first_name, app.last_name].filter(Boolean).join(' ') || '\u2014'}</td>
                  <td>{app.email}</td>
                  <td>{app.instagram || '\u2014'}</td>
                  <td>
                    <span className={`${s.badge} ${s.badgePurple}`}>{app.tier || 'MEMBER'}</span>
                  </td>
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
                <th>Tier</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {emails.map(row => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td>{row.name || '\u2014'}</td>
                  <td><span className={`${s.badge} ${s.badgePurple}`}>{row.tier}</span></td>
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

      {/* Application detail modal */}
      <ApplicationModal app={viewingApp} onClose={() => setViewingApp(null)} />
    </div>
  )
}
