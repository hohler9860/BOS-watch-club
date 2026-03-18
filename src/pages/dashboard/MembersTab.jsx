import { useNavigate } from 'react-router'
import { roleMeetsMinimum } from '../../hooks/useAuth'
import { TIER_COLORS } from '../../constants/tiers'
import FadeIn from '../../components/shared/FadeIn'
import s from '../DashboardPage.module.css'

export default function MembersTab({
  member,
  directoryMembers,
  selectedMember,
  setSelectedMember,
}) {
  const navigate = useNavigate()

  return (
    <div className={s.tabContent}>
      {!roleMeetsMinimum(member.role, 'member') ? (
        <FadeIn>
          <div className={s.pageHeader}>
            <h1 className={s.pageTitle}>Member Directory</h1>
          </div>
          <div style={{ background: 'rgba(184,196,212,0.04)', border: '1px solid rgba(184,196,212,0.15)', borderRadius: 16, padding: '40px 32px', textAlign: 'center', marginTop: 8 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.06em', color: '#E8ECF0', marginBottom: 10 }}>MEMBERS ONLY</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(232,236,240,0.45)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 24px' }}>
              The member directory is available to paid members. Upgrade your membership to connect with the community.
            </p>
            <button onClick={() => navigate('/upgrade')} style={{ padding: '12px 28px', background: '#B8C4D4', color: '#07090F', border: 'none', borderRadius: 40, fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer' }}>
              VIEW MEMBERSHIPS &rarr;
            </button>
          </div>
        </FadeIn>
      ) : (<>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Member Directory</h1>
          <p className={s.pageSubtitle}>{directoryMembers.length} members in the club</p>
        </div>
      </FadeIn>

      {/* Member Detail */}
      {selectedMember && (() => {
        const m = directoryMembers.find((d) => d.id === selectedMember)
        if (!m) return null
        const mColor = TIER_COLORS[m.tier] || TIER_COLORS.ENTHUSIAST
        return (
          <FadeIn>
            <div className={s.memberDetail}>
              <button className={s.backBtn} onClick={() => setSelectedMember(null)}>&larr; Back to directory</button>
              <div className={s.memberDetailCard}>
                <div className={s.memberDetailTop}>
                  <div className={s.memberDetailAvatar}>
                    {(m.name || 'M').charAt(0)}
                  </div>
                  <div>
                    <h2 className={s.memberDetailName}>{m.name}</h2>
                    <span className={s.memberDetailTier} style={{ color: mColor.text, borderColor: mColor.border, background: mColor.bg }}>
                      {m.tier}
                    </span>
                  </div>
                </div>
                <p className={s.memberDetailBio}>{m.bio}</p>
                <div className={s.memberDetailGrid}>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>COLLECTS</span>
                    <span className={s.metaValue}>{m.collects}</span>
                  </div>
                  {m.favorite_watch && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>FAVORITE WATCH RIGHT NOW</span>
                      <span className={s.metaValue}>{m.favorite_watch}</span>
                    </div>
                  )}
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>LOCATION</span>
                    <span className={s.metaValue}>{m.location}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>INSTAGRAM</span>
                    <span className={s.metaValue}>{m.instagram}</span>
                  </div>
                  {m.created_at && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>JOINED</span>
                      <span className={s.metaValue}>{new Date(m.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        )
      })()}

      {/* Members Grid */}
      {!selectedMember && (
        <div className={s.membersGrid}>
          {directoryMembers.map((m, i) => {
            const mColor = TIER_COLORS[m.tier] || TIER_COLORS.ENTHUSIAST
            return (
              <FadeIn key={m.id} delay={`${0.05 * i}s`}>
                <div className={s.memberCard} onClick={() => setSelectedMember(m.id)}>
                  <div className={s.memberCardAvatar}>
                    {(m.name || 'M').charAt(0)}
                  </div>
                  <h3 className={s.memberCardName}>{m.name}</h3>
                  <span className={s.memberCardTier} style={{ color: mColor.text }}>
                    {m.tier}
                  </span>
                  <p className={s.memberCardCollects}>{m.collects}</p>
                  {m.favorite_watch && (
                    <p className={s.memberCardFav}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {m.favorite_watch}
                    </p>
                  )}
                  <p className={s.memberCardLocation}>{m.location}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      )}
      </>)}
    </div>
  )
}
