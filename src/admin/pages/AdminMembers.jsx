import { useState } from 'react'
import { ADMIN_MEMBERS, VALID_ACCESS_CODES, randomCode } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminMembers() {
  const [members, setMembers] = useState(ADMIN_MEMBERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveTier, setApproveTier] = useState('ENTHUSIAST')

  const filtered = members.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (tierFilter !== 'all' && m.tier !== tierFilter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const statusBadge = (status) => {
    const map = { active: s.badgeGreen, pending: s.badgeYellow, suspended: s.badgeRed }
    return <span className={`${s.badge} ${map[status] || s.badgeGray}`}>{status}</span>
  }

  function handleApprove() {
    const code = randomCode()
    setMembers(prev => prev.map(m =>
      m.id === selected.id ? { ...m, status: 'active', tier: approveTier, accessCode: code } : m
    ))
    setSelected(prev => ({ ...prev, status: 'active', tier: approveTier, accessCode: code }))
    setShowApproveModal(false)
  }

  function handleSuspend() {
    setMembers(prev => prev.map(m =>
      m.id === selected.id ? { ...m, status: 'suspended' } : m
    ))
    setSelected(prev => ({ ...prev, status: 'suspended' }))
  }

  function handleReactivate() {
    setMembers(prev => prev.map(m =>
      m.id === selected.id ? { ...m, status: 'active' } : m
    ))
    setSelected(prev => ({ ...prev, status: 'active' }))
  }

  if (selected) {
    return (
      <div>
        <button className={s.backBtn} onClick={() => setSelected(null)}>&larr; Back to Members</button>
        <div className={s.detailPanel}>
          <div className={s.detailHeader}>
            <div>
              <div className={s.detailName}>{selected.name}</div>
              <div style={{ marginTop: 4 }}>{statusBadge(selected.status)} <span className={`${s.badge} ${s.badgePurple}`}>{selected.tier}</span></div>
            </div>
            <div className={s.btnGroup} style={{ marginTop: 0 }}>
              {selected.status === 'pending' && (
                <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => { setApproveTier(selected.tier); setShowApproveModal(true) }}>Approve</button>
              )}
              {selected.status === 'active' && (
                <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={handleSuspend}>Suspend</button>
              )}
              {selected.status === 'suspended' && (
                <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={handleReactivate}>Reactivate</button>
              )}
            </div>
          </div>

          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>Contact</div>
            <div className={s.detailGrid}>
              <div className={s.detailItem}><div className={s.detailItemLabel}>Email</div><div className={s.detailItemValue}>{selected.email}</div></div>
              <div className={s.detailItem}><div className={s.detailItemLabel}>Join Date</div><div className={s.detailItemValue}>{selected.joinDate}</div></div>
            </div>
          </div>

          {selected.accessCode && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Access Code</div>
              <div className={s.codeDisplay}><span className={s.codeText}>{selected.accessCode}</span></div>
            </div>
          )}

          <div className={s.detailSection}>
            <div className={s.detailSectionTitle}>Application Answers</div>
            {selected.applicationAnswers && (
              <div>
                <div className={s.detailItem} style={{ marginBottom: 12 }}>
                  <div className={s.detailItemLabel}>Why do you want to join?</div>
                  <div className={s.detailItemValue}>{selected.applicationAnswers.reason}</div>
                </div>
                <div className={s.detailItem} style={{ marginBottom: 12 }}>
                  <div className={s.detailItemLabel}>Current Collection</div>
                  <div className={s.detailItemValue}>{selected.applicationAnswers.collection}</div>
                </div>
                <div className={s.detailItem}>
                  <div className={s.detailItemLabel}>How did you hear about us?</div>
                  <div className={s.detailItemValue}>{selected.applicationAnswers.referral}</div>
                </div>
              </div>
            )}
          </div>

          {selected.notes && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Admin Notes</div>
              <div className={s.detailItemValue}>{selected.notes}</div>
            </div>
          )}

          {selected.rsvps && selected.rsvps.length > 0 && (
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Event RSVPs</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selected.rsvps.map(r => <span key={r} className={`${s.badge} ${s.badgeBlue}`}>{r}</span>)}
              </div>
            </div>
          )}
        </div>

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
                  <option value="WOMEN'S CIRCLE">Women&apos;s Circle</option>
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

  return (
    <div>
      <h1 className={s.pageTitle}>Members</h1>
      <p className={s.pageSubtitle}>{members.length} total members</p>

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
          <option value="WOMEN'S CIRCLE">Women&apos;s Circle</option>
          <option value="PATRON">Patron</option>
        </select>
      </div>

      <div className={s.card}>
        <table className={s.table}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Tier</th><th>Status</th><th>Joined</th></tr>
          </thead>
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
