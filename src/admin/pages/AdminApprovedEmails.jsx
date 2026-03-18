import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminApprovedEmails() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newTier, setNewTier] = useState('ENTHUSIAST')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    // 1. Insert into approved_members
    const { error: approveErr } = await supabase
      .from('approved_members')
      .insert({ email: app.email, name: `${app.first_name} ${app.last_name}`.trim(), tier: app.tier || 'ENTHUSIAST', source: 'typeform' })
    if (approveErr) {
      if (approveErr.code === '23505') {
        // Already approved, just update submission status
      } else {
        setError(approveErr.message)
        return
      }
    }
    // 2. Update submission status
    await supabase.from('submissions').update({ status: 'approved' }).eq('id', app.id)
    // 3. Send approval email
    const session = await supabase.auth.getSession()
    const token = session?.data?.session?.access_token
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'approval', to: app.email, data: { firstName: app.first_name || 'Member' } }),
    }).catch(err => console.error('Approval email failed:', err))
    // 4. Refresh both lists
    fetchApplications()
    fetchEmails()
    setSuccess(`${app.email} has been approved and notified.`)
  }

  async function handleDeny(app) {
    if (!confirm(`Deny application from ${app.email}?`)) return
    await supabase.from('submissions').update({ status: 'denied' }).eq('id', app.id)
    fetchApplications()
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
    setNewTier('ENTHUSIAST')
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
        Review pending Typeform applications and manage the approved members list. {applications.length} pending, {emails.length} approved.
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
                    <span className={`${s.badge} ${s.badgePurple}`}>{app.tier || 'ENTHUSIAST'}</span>
                  </td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
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
                <option value="ENTHUSIAST">Enthusiast</option>
                <option value="COLLECTOR">Collector</option>
                <option value="PATRON">Patron</option>
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
    </div>
  )
}
