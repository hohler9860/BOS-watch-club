import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import useAuth from '../hooks/useAuth'
import MembershipHero from '../components/membership/MembershipHero'
import ShinyButton from '../components/shared/ShinyButton'
import btnStyles from '../components/shared/ShinyButton.module.css'
import FadeIn from '../components/shared/FadeIn'
import t from '../components/membership/TierGrid.module.css'

const BENEFITS = [
  'MONTHLY EVENTS',
  'MEMBERS ONLY GATHERINGS',
  'EXCLUSIVE COMMUNITY',
  'NETWORKING EVENTS',
  'WHATSAPP GROUP ACCESS',
  'MEMBER DIRECTORY',
  'CITY ACCESS',
  'PRIORITY EVENT RSVP',
  'BRING ONE GUEST TO CASUAL HANGOUTS',
]

export default function MembershipPage() {
  const { member } = useAuth()
  const isMember = member && member.role === 'member'

  return (
    <>
      <Helmet>
        <title>Membership — Boston Watch Club</title>
        <meta name="description" content="Limited founding membership. Join Boston's first watch community for exclusive events, networking, and curated experiences." />
      </Helmet>
      <MembershipHero
        title="MEMBERSHIP"
        subtitle="BOSTON'S FIRST WATCH COMMUNITY"
      />

      <section className={t.section}>
        <FadeIn>
          <div className={t.membershipGrid}>

            {/* ── Left: Founding membership (sold out) ── */}
            <div className={`${t.card} ${t.cardSoldOut} ${isMember ? t.cardMemberActive : ''}`}>
              <div className={t.inner}>
                <div className={t.eduBadge}>FOUNDING MEMBERSHIP</div>

                <div className={t.price}>
                  <span className={t.amount}>MEMBERS</span>
                </div>

                <div className={t.benefitsWrap}>
                  <ul className={t.benefits}>
                    {BENEFITS.map(b => <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>{b}</li>)}
                  </ul>
                </div>

                <div className={t.soldOutBadge}>SOLD OUT</div>

                {isMember && (
                  <ShinyButton component={Link} to="/dashboard" className={`${btnStyles.filled} ${t.cta}`}>
                    GO TO DASHBOARD &rarr;
                  </ShinyButton>
                )}
              </div>
            </div>

            {/* ── Right: New tiers launching soon ── */}
            <div className={`${t.card} ${t.cardAccent}`}>
              {/* Animated shimmer layer — sits behind content, clipped to card border-radius */}
              <div className={t.cardShimmer} aria-hidden="true" />

              <div className={t.inner}>
                <div className={t.launchingSoonLabel}>
                  <span className={t.launchingSoonDot} aria-hidden="true" />
                  COMING SOON
                </div>

                <div className={t.launchingHeading}>NEW TIERS<br />LAUNCHING SOON</div>

                <p className={t.launchingDesc}>
                  We're crafting new membership tiers for the next chapter of Boston Watch Club.
                  Apply now to be first in line when they drop.
                </p>

                {/* Teaser feature list */}
                <ul className={t.teaserList} aria-label="Upcoming features">
                  <li className={t.teaserItem}>
                    <span className={t.teaserIcon} aria-hidden="true" />
                    MULTIPLE TIER OPTIONS
                  </li>
                  <li className={t.teaserItem}>
                    <span className={t.teaserIcon} aria-hidden="true" />
                    FLEXIBLE PRICING
                  </li>
                  <li className={t.teaserItem}>
                    <span className={t.teaserIcon} aria-hidden="true" />
                    EXCLUSIVE MEMBER PERKS
                  </li>
                  <li className={t.teaserItem}>
                    <span className={t.teaserIcon} aria-hidden="true" />
                    EARLY ACCESS BENEFITS
                  </li>
                </ul>

                <p className={t.urgencyLine}>LIMITED SPOTS EXPECTED — BE FIRST IN LINE</p>

                <ShinyButton component={Link} to="/apply" className={`${btnStyles.filled} ${t.cta}`}>
                  APPLY NOW
                </ShinyButton>
              </div>
            </div>

          </div>

          <p className={t.footnote}>
            Members are accepted by application only.
          </p>
        </FadeIn>
      </section>
    </>
  )
}
