import { useNavigate } from 'react-router'
import { roleMeetsMinimum } from '../../hooks/useAuth'
import { TIER_COLORS } from '../../constants/tiers'
import FadeIn from '../../components/shared/FadeIn'
import ShinyButton from '../../components/shared/ShinyButton'
import shiny from '../../components/shared/ShinyButton.module.css'
import s from '../DashboardPage.module.css'

export default function MembersTab({
  member,
  directoryMembers,
  selectedMember,
  setSelectedMember,
  setActiveTab,
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
        const mColor = TIER_COLORS[m.tier] || TIER_COLORS.MEMBER
        return (
          <FadeIn>
            <div className={s.memberDetail}>
              <button className={s.backBtn} onClick={() => setSelectedMember(null)}>&larr; Back to directory</button>
              <div className={s.memberDetailCard}>
                <div className={s.memberDetailTop}>
                  <div
                    className={s.memberDetailAvatar}
                    style={m.id === member?.id ? { cursor: 'pointer' } : undefined}
                    onClick={m.id === member?.id && setActiveTab ? () => setActiveTab('profile') : undefined}
                    title={m.id === member?.id ? 'Edit your profile photo' : undefined}
                  >
                    {m.avatar_url
                      ? <img src={m.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : (m.name || 'M').charAt(0)}
                  </div>
                  <div className={s.memberDetailInfo}>
                    <div className={s.memberDetailRow}>
                      <h2 className={s.memberDetailName}>{m.official_name || m.name}</h2>
                      <span className={s.memberDetailTier} style={{ color: mColor.text, borderColor: mColor.border, background: mColor.bg }}>
                        {m.tier}
                      </span>
                    </div>
                    <p className={s.memberDetailRealName}>{m.name}</p>
                    {m.created_at && (
                      <p className={s.memberDetailJoined}>
                        Joined {new Date(m.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                    )}
                  </div>
                </div>
                {m.bio && <p className={s.memberDetailBio}>{m.bio}</p>}
                <div className={s.memberDetailGrid}>
                  {m.nationality && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>NATIONALITY</span>
                      <span className={s.metaValue}>{m.nationality}</span>
                    </div>
                  )}
                  {m.location && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>LOCATION</span>
                      <span className={s.metaValue}>{m.location}</span>
                    </div>
                  )}
                  {m.collects && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>COLLECTS</span>
                      <span className={s.metaValue}>{m.collects}</span>
                    </div>
                  )}
                  {m.favorite_watch && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>FAVORITE WATCH RIGHT NOW</span>
                      <span className={s.metaValue}>{m.favorite_watch}</span>
                    </div>
                  )}
                  {m.linkedin && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>LINKEDIN</span>
                      <ShinyButton as="a" href={m.linkedin.startsWith('http') ? m.linkedin : `https://${m.linkedin}`} target="_blank" rel="noopener noreferrer" className={`${shiny.outline} ${s.profileBtn}`}>
                        Take to Profile
                      </ShinyButton>
                    </div>
                  )}
                  {m.instagram && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>INSTAGRAM</span>
                      <ShinyButton as="a" href={`https://instagram.com/${m.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '')}`} target="_blank" rel="noopener noreferrer" className={`${shiny.outline} ${s.profileBtn}`}>
                        Take to Profile
                      </ShinyButton>
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
            const mColor = TIER_COLORS[m.tier] || TIER_COLORS.MEMBER
            return (
              <FadeIn key={m.id} delay={`${0.05 * i}s`}>
                <div className={s.memberCard} onClick={() => setSelectedMember(m.id)}>
                  <div className={s.memberCardAvatar}>
                    {m.avatar_url
                      ? <img src={m.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : (m.name || 'M').charAt(0)}
                  </div>
                  <h3 className={s.memberCardName}>{m.name}</h3>
                  {m.official_name && m.official_name !== m.name && (
                    <p className={s.memberCardRealName}>{m.official_name}</p>
                  )}
                  <span className={s.memberCardTier} style={{ color: mColor.text }}>
                    {m.tier}
                  </span>
                  <p className={s.memberCardHint}>Click to view details</p>
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
