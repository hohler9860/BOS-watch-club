import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { randomCode } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveTier, setApproveTier] = useState('ENTHUSIAST')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState({})
  const [copiedCode, setCopiedCode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMembers() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('id, name, tier, status, created_at, bio, collects, favorite_watch, location, instagram, admin_notes, access_code, show_in_directory')
          .order('created_at', { ascending: false })
        if (err) throw err
        // Normalize DB column names to UI field names
        setMembers(data.map(normalizeProfile))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  function normalizeProfile(p) {
    return {
      ...p,
      name: p.name || p.id,
      joinDate: p.created_at ? p.created_at.split('T')[0] : '',
      favoriteWatch: p.favorite_watch,
      notes: p.admin_notes,
      accessCode: p.access_code,
    }
  }

  const filtered = members.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (tierFilter !== 'all' && m.tier !== tierFilter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !(m.email || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const statusBadge = (status) => {
    const map = { active: s.badgeGreen, pending: s.badgeYellow, suspended: s.badgeRed }
    return <span className={`${s.badge} ${map[status] || s.badgeGray}`}>{status}</span>
  }

  function updateLocal(id, updates) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
    setSelected(prev => prev?.id === id ? { ...prev, ...updates } : prev)
  }

  async function handleApprove() {
    if (!supabase) return
    setError(null)
    const code = randomCode()
    try {
      const { error: err } = await supabase.from('profiles').update({
        status: 'active',
        tier: approveTier,
        access_code: code,
      }).eq('id', selected.id)
      if (err) throw err

      // Also insert into access_codes table so the activation flow works
      await supabase.from('access_codes').insert({
        code,
        tier: approveTier,
        is_active: true,
      })

      updateLocal(selected.id, { status: 'active', tier: approveTier, accessCode: code, access_code: code })
      setShowApproveModal(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSuspend() {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('profiles').update({ status: 'suspended' }).eq('id', selected.id)
      if (err) throw err
      updateLocal(selected.id, { status: 'suspended' })
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReactivate() {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('profiles').update({ status: 'active' }).eq('id', selected.id)
      if (err) throw err
      updateLocal(selected.id, { status: 'active' })
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRegenerateCode() {
    if (!supabase) return
    setError(null)
    const code = randomCode()
    try {
      const { error: err } = await supabase.from('profiles').update({ access_code: code }).eq('id', selected.id)
      if (err) throw err

      await supabase.from('access_codes').insert({
        code,
        tier: selected.tier,
        is_active: true,
      })

      updateLocal(selected.id, { accessCode: code, access_code: code })
    } catch (err) {
      setError(err.message)
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  async function handleSaveNotes() {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('profiles').update({ admin_notes: notesDraft }).eq('id', selected.id)
      if (err) throw err
      updateLocal(selected.id, { notes: notesDraft, admin_notes: notesDraft })
      setEditingNotes(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSaveProfile() {
    if (!supabase) return
    setError(null)
    try {
      const { error: err } = await supabase.from('profiles').update({
        name: profileDraft.name,
        tier: profileDraft.tier,
        bio: profileDraft.bio,
        collects: profileDraft.collects,
        favorite_watch: profileDraft.favoriteWatch,
        location: profileDraft.location,
        instagram: profileDraft.instagram,
      }).eq('id', selected.id)
      if (err) throw err
      updateLocal(selected.id, {
        ...profileDraft,
        name: profileDraft.name,
        name: profileDraft.name,
        favorite_watch: profileDraft.favoriteWatch,
      })
      setEditingProfile(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className={s.loading}>Loading members...</div>

  // ── Detail View ──
  if (selected) {
    return (
      <div>
        {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
        <button className={s.backBtn} onClick={() => { setSelected(null); setEditingNotes(false); setEditingProfile(false) }}>&larr; Back to Members</button>
        <div className={s.detailPanel}>
          <div className={s.detailHeader}>
            <div>
              <div className={s.detailName}>{selected.name}</div>
              <div style={{ marginTop: 4 }}>{statusBadge(selected.status)} <span className={`${s.badge} ${s.badgePurple}`}>{selected.tier}</span></div>
            </div>
            <div className={s.btnGroup} style={{ marginTop: 0 }}>
              {selected.status === 'pending' && (
                <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => { setApproveTier(selected.tier || 'ENTHUSIAST'); setShowApproveModal(true) }}>Approve</button>
              )}
              {selected.status === 'active' && (
                <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={handleSuspend}>Suspend</button>
              )}
              {selected.status === 'suspended' && (
                <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={handleReactivate}>Reactivate</button>
              )}
            </div>
          </div>

          {/* Profile */}
          <div className={s.detailSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={s.detailSectionTitle}>Profile</div>
              {!editingProfile && (
                <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => { setProfileDraft({ name: selected.name, tier: selected.tier || '', bio: selected.bio || '', collects: selected.collects || '', favoriteWatch: selected.favoriteWatch || '', location: selected.location || '', instagram: selected.instagram || '' }); setEditingProfile(true) }}>Edit</button>
              )}
            </div>
            {editingProfile ? (
              <div style={{ marginTop: 8 }}>
                <div className={s.formRow}>
                  <div className={s.formGroup}><label className={s.formLabel}>Name</label><input className={s.formInput} value={profileDraft.name} onChange={e => setProfileDraft(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Tier</label>
                    <select className={s.formSelect} value={profileDraft.tier} onChange={e => setProfileDraft(p => ({ ...p, tier: e.target.value }))}>
                      <option value="ENTHUSIAST">Enthusiast</option>
                      <option value="COLLECTOR">Collector</option>
                      <option value="WOMEN\u2019S CIRCLE">Women&apos;s Circle</option>
                      <option value="PATRON">Patron</option>
                    </select>
                  </div>
                </div>
                <div className={s.formGroup}><label className={s.formLabel}>Bio</label><textarea className={s.formTextarea} value={profileDraft.bio} onChange={e => setProfileDraft(p => ({ ...p, bio: e.target.value }))} /></div>
                <div className={s.formRow}>
                  <div className={s.formGroup}><label className={s.formLabel}>Collects</label><input className={s.formInput} value={profileDraft.collects} onChange={e => setProfileDraft(p => ({ ...p, collects: e.target.value }))} /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Favorite Watch</label><input className={s.formInput} value={profileDraft.favoriteWatch} onChange={e => setProfileDraft(p => ({ ...p, favoriteWatch: e.target.value }))} /></div>
                </div>
                <div className={s.formRow}>
                  <div className={s.formGroup}><label className={s.formLabel}>Location</label><input className={s.formInput} value={profileDraft.location} onChange={e => setProfileDraft(p => ({ ...p, location: e.target.value }))} /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Instagram</label><input className={s.formInput} value={profileDraft.instagram} onChange={e => setProfileDraft(p => ({ ...p, instagram: e.target.value }))} /></div>
                </div>
                <div className={s.btnGroup}>
                  <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSaveProfile}>Save</button>
                  <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setEditingProfile(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className={s.detailGrid} style={{ marginTop: 8 }}>
                <div className={s.detailItem}><div className={s.detailItemLabel}>Email</div><div className={s.detailItemValue}>{selected.email}</div></div>
                <div className={s.detailItem}><div className={s.detailItemLabel}>Join Date</div><div className={s.detailItemValue}>{selected.joinDate}</div></div>
                <div className={s.detailItem}><div className={s.detailItemLabel}>Location</div><div className={s.detailItemValue}>{selected.location || '\u2014'}</div></div>
                <div className={s.detailItem}><div className={s.detailItemLabel}>Instagram</div><div className={s.detailItemValue}>{selected.instagram || '\u2014'}</div></div>
                <div className={s.detailItem}><div className={s.detailItemLabel}>Collects</div><div className={s.detailItemValue}>{selected.collects || '\u2014'}</div></div>
                <div className={s.detailItem}><div className={s.detailItemLabel}>Favorite Watch</div><div className={s.detailItemValue}>{selected.favoriteWatch || '\u2014'}</div></div>
                {selected.bio && <div className={s.detailItem} style={{ gridColumn: '1 / -1' }}><div className={s.detailItemLabel}>Bio</div><div className={s.detailItemValue}>{selected.bio}</div></div>}
              </div>
            )}
          </div>

          {/* Access Code */}
          {selected.accessCode && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Access Code</div>
              <div className={s.codeDisplay}>
                <span className={s.codeText}>{selected.accessCode}</span>
                <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => copyCode(selected.accessCode)}>{copiedCode ? 'Copied!' : 'Copy'}</button>
                <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={handleRegenerateCode}>Regenerate</button>
              </div>
            </div>
          )}

          {/* Application */}
          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>Application Answers</div>
            {selected.applicationAnswers ? (
              <div>
                <div className={s.detailItem} style={{ marginBottom: 12 }}><div className={s.detailItemLabel}>Why do you want to join?</div><div className={s.detailItemValue}>{selected.applicationAnswers.reason}</div></div>
                <div className={s.detailItem} style={{ marginBottom: 12 }}><div className={s.detailItemLabel}>Current Collection</div><div className={s.detailItemValue}>{selected.applicationAnswers.collection}</div></div>
                <div className={s.detailItem}><div className={s.detailItemLabel}>How did you hear about us?</div><div className={s.detailItemValue}>{selected.applicationAnswers.referral}</div></div>
              </div>
            ) : <p style={{ fontSize: 13, color: '#9ca3af' }}>No application answers on file</p>}
          </div>

          {/* Notes */}
          <div className={s.detailSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={s.detailSectionTitle}>Admin Notes</div>
              {!editingNotes && <button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => { setNotesDraft(selected.notes || ''); setEditingNotes(true) }}>Edit</button>}
            </div>
            {editingNotes ? (
              <div>
                <textarea className={s.formTextarea} value={notesDraft} onChange={e => setNotesDraft(e.target.value)} rows={3} />
                <div className={s.btnGroup}>
                  <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSaveNotes}>Save</button>
                  <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setEditingNotes(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: selected.notes ? '#374151' : '#9ca3af' }}>{selected.notes || 'No notes'}</p>
            )}
          </div>
        </div>

        {/* Approve Modal */}
        {showApproveModal && (
          <div className={s.modalOverlay} onClick={() => setShowApproveModal(false)}>
            <div className={s.modalContent} onClick={e => e.stopPropagation()}>
              <div className={s.modalTitle}>Approve {selected.name}</div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Select a tier and an access code will be generated automatically.</p>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Membership Tier</label>
                <select className={s.formSelect} value={approveTier} onChange={e => setApproveTier(e.target.value)}>
                  <option value="ENTHUSIAST">Enthusiast</option>
                  <option value="COLLECTOR">Collector</option>
                  <option value="WOMEN\u2019S CIRCLE">Women&apos;s Circle</option>
                  <option value="PATRON">Patron</option>
                </select>
              </div>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnSuccess}`} onClick={handleApprove}>Approve &amp; Generate Code</button>
                <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setShowApproveModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── List View ──
  return (
    <div>
      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>Error: {error}</div>}
      <h1 className={s.pageTitle}>Members</h1>
      <p className={s.pageSubtitle}>{members.length} total &middot; {members.filter(m => m.status === 'active').length} active &middot; {members.filter(m => m.status === 'pending').length} pending</p>

      <div className={s.filterBar}>
        <input className={s.searchInput} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className={s.filterSelect} value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
          <option value="all">All Tiers</option>
          <option value="ENTHUSIAST">Enthusiast</option>
          <option value="COLLECTOR">Collector</option>
          <option value="WOMEN\u2019S CIRCLE">Women&apos;s Circle</option>
          <option value="PATRON">Patron</option>
        </select>
      </div>

      <div className={s.card}>
        <table className={s.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Tier</th><th>Status</th><th>Joined</th></tr></thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className={s.tableClickable} onClick={() => setSelected(m)}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td><span className={`${s.badge} ${s.badgePurple}`}>{m.tier}</span></td>
                <td>{statusBadge(m.status)}</td>
                <td>{m.joinDate}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
