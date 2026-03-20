import { useState } from 'react'
import { TIER_COLORS } from '../../constants/tiers'
import { supabase } from '../../lib/supabase'
import FadeIn from '../../components/shared/FadeIn'
import { toast } from '../../components/shared/Toast'
import s from '../DashboardPage.module.css'

export default function ProfileTab({
  member,
  firstName,
  userTier,
  tierColor,
  tierData,
  tiersList,
  profile,
  setProfile,
  avatarInputRef,
  handleAvatarUpload,
  showAllTiers,
  setShowAllTiers,
  membershipRef,
  handleTierUpgrade,
  onDeleteAccount,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  return (
    <div className={s.tabContent}>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Your Profile</h1>
          <p className={s.pageSubtitle}>This info appears in the member directory when others view your profile</p>
        </div>
      </FadeIn>

      <FadeIn delay="0.05s">
        <div className={s.profileForm}>
          <div className={s.profileAvatarSection}>
            <div className={s.profileAvatarUpload} onClick={() => avatarInputRef.current?.click()}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className={s.profileAvatarImg} />
              ) : (
                <div className={s.memberDetailAvatar}>
                  {(profile.name || firstName).charAt(0).toUpperCase()}
                </div>
              )}
              <div className={s.profileAvatarOverlay}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <p className={s.profileEmail}>{member.email}</p>
              <span className={s.sidebarTier} style={{ color: tierColor.text }}>{userTier}</span>
            </div>
          </div>

          <div className={s.profileFields}>
            <div className={s.profileField}>
              <label className={s.profileLabel}>DISPLAY NAME</label>
              <input
                type="text"
                className={s.discInput}
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>

            <div className={s.profileField}>
              <label className={s.profileLabel}>BIO</label>
              <textarea
                className={s.discTextarea}
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Tell the club about yourself, your collecting journey, what got you into watches..."
                rows={4}
              />
            </div>

            <div className={s.profileFieldRow}>
              <div className={s.profileField}>
                <label className={s.profileLabel}>NATIONALITY</label>
                <input
                  type="text"
                  className={s.discInput}
                  value={profile.nationality}
                  onChange={(e) => setProfile((p) => ({ ...p, nationality: e.target.value }))}
                  placeholder="e.g. Greek, American"
                />
              </div>
              <div className={s.profileField}>
                <label className={s.profileLabel}>LOCATION</label>
                <input
                  type="text"
                  className={s.discInput}
                  value={profile.location}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Back Bay, Boston"
                />
              </div>
            </div>

            <div className={s.profileFieldRow}>
              <div className={s.profileField}>
                <label className={s.profileLabel}>COLLECTS</label>
                <input
                  type="text"
                  className={s.discInput}
                  value={profile.collects}
                  onChange={(e) => setProfile((p) => ({ ...p, collects: e.target.value }))}
                  placeholder="e.g. Rolex, Tudor, Omega"
                />
              </div>
              <div className={s.profileField}>
                <label className={s.profileLabel}>FAVORITE WATCH RIGHT NOW</label>
                <input
                  type="text"
                  className={s.discInput}
                  value={profile.favoriteWatch}
                  onChange={(e) => setProfile((p) => ({ ...p, favoriteWatch: e.target.value }))}
                  placeholder="e.g. Rolex Submariner 124060"
                />
              </div>
            </div>

            <div className={s.profileFieldRow}>
              <div className={s.profileField}>
                <label className={s.profileLabel}>LINKEDIN</label>
                <input
                  type="text"
                  className={s.discInput}
                  value={profile.linkedin}
                  onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))}
                  placeholder="linkedin.com/in/yourname"
                />
              </div>
              <div className={s.profileField}>
                <label className={s.profileLabel}>INSTAGRAM</label>
                <input
                  type="text"
                  className={s.discInput}
                  value={profile.instagram}
                  onChange={(e) => setProfile((p) => ({ ...p, instagram: e.target.value }))}
                  placeholder="@your_handle"
                />
              </div>
            </div>

            <button
              className={s.actionBtn}
              onClick={async () => {
                if (!supabase || !member) return
                const { error: saveErr } = await supabase
                  .from('profiles')
                  .update({
                    name: profile.name.trim() || null,
                    bio: profile.bio.trim() || null,
                    nationality: profile.nationality.trim() || null,
                    linkedin: profile.linkedin.trim() || null,
                    collects: profile.collects.trim() || null,
                    favorite_watch: profile.favoriteWatch.trim() || null,
                    location: profile.location.trim() || null,
                    instagram: profile.instagram.trim() || null,
                  })
                  .eq('id', member.id)
                if (saveErr) toast('Error saving profile. Please try again.')
                else toast('Profile saved!')
              }}
            >
              SAVE PROFILE
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ── Membership section within Profile ── */}
      <FadeIn delay="0.1s">
        <div className={s.profileSectionDivider} />
        <h2 className={s.sectionTitle} style={{ marginBottom: 16 }}>YOUR MEMBERSHIP</h2>
        <div
          className={s.currentMembershipCard}
          style={{
            borderColor: tierColor.border,
            background: `linear-gradient(135deg, ${tierColor.bg}, rgba(20, 24, 32, 0.6))`,
          }}
        >
          <div className={s.currentMembershipHeader}>
            <span className={s.currentMembershipLabel}>FOUNDING MEMBER</span>
            <span className={s.activeBadge}>ACTIVE</span>
          </div>
          <h2 className={s.currentMembershipTier} style={{ color: tierColor.text }}>MEMBER</h2>
          <ul className={s.benefitsList}>
            {(tierData?.benefits || []).map((b, i) => (
              <li key={i} className={s.benefitItem}>
                <span className={s.benefitCheck}>&#10003;</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>

      {/* ── Delete Account ── */}
      <FadeIn delay="0.15s">
        <div className={s.profileSectionDivider} />
        <h2 className={s.sectionTitle} style={{ marginBottom: 8, color: '#dc2626' }}>DANGER ZONE</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 300, color: 'rgba(232,236,240,0.4)', marginBottom: 16 }}>
          Deleting your account is permanent. All your data, RSVPs, and membership will be removed. You will need to sign up again and go through onboarding as a new member.
        </p>
        <button
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            letterSpacing: '0.08em',
            padding: '10px 24px',
            background: 'rgba(220, 38, 38, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(220, 38, 38, 0.2)'; e.target.style.borderColor = 'rgba(220, 38, 38, 0.5)' }}
          onMouseLeave={e => { e.target.style.background = 'rgba(220, 38, 38, 0.1)'; e.target.style.borderColor = 'rgba(220, 38, 38, 0.3)' }}
          onClick={() => setShowDeleteModal(true)}
        >
          DELETE ACCOUNT
        </button>
      </FadeIn>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className={s.modalOverlay} onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={s.modalTitle} style={{ color: '#dc2626' }}>Delete Your Account?</h2>
            <div className={s.modalBody}>
              <p style={{ marginBottom: 12 }}>This action is <strong>permanent and cannot be undone</strong>. All your data will be removed including:</p>
              <ul style={{ fontSize: 13, color: 'rgba(232,236,240,0.5)', marginBottom: 16, paddingLeft: 20 }}>
                <li>Your profile and membership</li>
                <li>All RSVPs and event history</li>
                <li>Discussions and replies</li>
                <li>Payment records</li>
              </ul>
              <p style={{ fontSize: 13, marginBottom: 12 }}>Type <strong>DELETE</strong> to confirm:</p>
              <input
                type="text"
                className={s.discInput}
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                disabled={deleting}
                style={{ marginBottom: 16 }}
              />
            </div>
            <div className={s.modalActions}>
              <button
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  letterSpacing: '0.08em',
                  padding: '10px 24px',
                  background: deleteConfirmText === 'DELETE' ? '#dc2626' : 'rgba(220, 38, 38, 0.2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                  opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                onClick={async () => {
                  setDeleting(true)
                  try {
                    const { data: { session } } = await supabase.auth.getSession()
                    const res = await fetch('/api/delete-account', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token || ''}`,
                      },
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Failed to delete account')
                    if (onDeleteAccount) onDeleteAccount()
                  } catch (err) {
                    toast(err.message || 'Failed to delete account. Please try again.')
                    setDeleting(false)
                  }
                }}
              >
                {deleting ? 'DELETING...' : 'PERMANENTLY DELETE ACCOUNT'}
              </button>
              <button className={s.modalDismiss} onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
