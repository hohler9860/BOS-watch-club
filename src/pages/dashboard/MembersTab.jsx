import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
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
  const [realName, setRealName] = useState('')

  useEffect(() => {
    if (!selectedMember || !supabase) { setRealName(''); return }
    const m = directoryMembers.find((d) => d.id === selectedMember)
    if (!m?.email) { setRealName(''); return }
    supabase
      .from('submissions')
      .select('first_name, last_name')
      .eq('email', m.email)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRealName(`${data.first_name || ''} ${data.last_name || ''}`.trim())
        else setRealName('')
      })
  }, [selectedMember, directoryMembers])

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
                  <div className={s.memberDetailAvatar}>
                    {(m.name || 'M').charAt(0)}
                  </div>
                  <div>
                    <h2 className={s.memberDetailName}>{m.name}</h2>
                    {realName && realName !== m.name && (
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(232,236,240,0.45)', marginTop: 2, marginBottom: 4 }}>
                        {realName}
                      </p>
                    )}
                    <span className={s.memberDetailTier} style={{ color: mColor.text, borderColor: mColor.border, background: mColor.bg }}>
                      {m.tier}
                    </span>
                    {m.created_at && (
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(232,236,240,0.35)', marginTop: 4, letterSpacing: '0.04em' }}>
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
                      <span className={s.metaValue}>{m.linkedin}</span>
                    </div>
                  )}
                  {m.instagram && (
                    <div className={s.metaItem}>
                      <span className={s.metaLabel}>INSTAGRAM</span>
                      <span className={s.metaValue}>{m.instagram}</span>
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
                    {(m.name || 'M').charAt(0)}
                  </div>
                  <h3 className={s.memberCardName}>{m.name}</h3>
                  <span className={s.memberCardTier} style={{ color: mColor.text }}>
                    {m.tier}
                  </span>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(232, 236, 240, 0.25)', marginTop: 8, textTransform: 'uppercase' }}>
                    Click to view details
                  </p>
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
