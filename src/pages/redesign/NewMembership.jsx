/**
 * NewMembership — /redesign/membership
 *
 * Kettle Kids reskin of MembershipPage.
 *
 * ALL backend / auth logic reused verbatim from MembershipPage:
 *   - useAuth() hook and isMember check (member.role === 'member')
 *   - BENEFITS array (same items, same order)
 *   - Dashboard redirect link for existing members
 *   - Helmet meta tags
 *
 * Only the PRESENTATION layer changes:
 *   - White (#fff) background, black (#000) text, #F8F7F7 body section
 *   - ABC Marist / Georgia heading font
 *   - Solid black full-width CTA buttons (KK editorial style)
 *   - Clean editorial card layout, no dark glass, no shimmer animation
 *   - Diamond teaserIcon markers matching KK aesthetic
 *
 * Links in-world:
 *   - /apply → /redesign/apply
 *   - /dashboard → /dashboard (dashboard is outside the redesign world, keep as-is)
 */

import { Helmet } from 'react-helmet-async'
import useAuth from '../../hooks/useAuth'
import { useSiteContent } from '../../hooks/useSupabaseData'
import s from './NewMembership.module.css'
import CineButton from '../../components/redesign/CineButton'
import FadeIn from '../../components/shared/FadeIn'

// ── Benefits list — trimmed to 4 to match the right card's teaser count ──
const BENEFITS = [
  'MONTHLY EVENTS',
  'MEMBERS ONLY GATHERINGS',
  'EXCLUSIVE COMMUNITY',
  'WHATSAPP GROUP ACCESS',
]

// ── Check SVG (green, matches MembershipPage inline SVG exactly) ──────────
function CheckIcon() {
  return (
    <svg
      className={s.benefitCheck}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4CAF50"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function NewMembership() {
  // ── Auth logic (verbatim from MembershipPage) ─────────────────────────
  const { member } = useAuth()
  const { content } = useSiteContent()
  const isMember = member && member.role === 'member'

  return (
    <div className={s.page}>
      <Helmet>
        <title>Membership | Boston Watch Club</title>
        <meta
          name="description"
          content="Limited founding membership. Join Boston's first watch community for exclusive events, networking, and curated experiences."
        />
      </Helmet>

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <section
        className={`${s.hero} ${content.membershipHeroImage ? s.heroImage : ''}`}
        style={content.membershipHeroImage ? { backgroundImage: `url(${content.membershipHeroImage})`, backgroundSize: 'cover', backgroundPosition: content.membershipHeroImagePosition || 'center' } : undefined}
      >
        <FadeIn>
          <h1 className={s.heroTitle}>Membership</h1>
        </FadeIn>
        <FadeIn delay="0.08s">
          <p className={s.heroSubtitle}>Boston&rsquo;s First Watch Community</p>
        </FadeIn>
      </section>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className={s.body}>
        <div className={s.bodyInner}>

          <FadeIn delay="0.16s">
          <div className={s.membershipGrid}>

            {/* ── Left: Founding membership (sold out) ─────────────────── */}
            <div className={`${s.card} ${s.cardSoldOut} ${isMember ? s.cardMemberActive : ''}`}>
              <div className={s.cardInner}>

                <div className={s.eduBadge}>Founding Membership</div>

                <div className={s.priceBlock}>
                  <span className={s.amount}>Members</span>
                </div>

                <div className={s.benefitsWrap}>
                  <ul className={s.benefits} aria-label="Founding membership benefits">
                    {BENEFITS.map(b => (
                      <li key={b} className={s.benefitItem}>
                        <CheckIcon />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={s.cardFooter}>
                  {isMember ? (
                    <CineButton to="/dashboard" fullWidth style={{ height: 52 }}>
                      Go to Dashboard
                    </CineButton>
                  ) : (
                    <CineButton disabled fullWidth style={{ height: 52 }}>
                      Sold Out
                    </CineButton>
                  )}
                </div>

              </div>
            </div>

            {/* ── Right: New tiers launching soon ─────────────────────── */}
            <div className={`${s.card} ${s.cardAccent}`}>
              <div className={s.cardInner}>

                <div className={s.comingSoonChip}>
                  <span className={s.comingSoonDot} aria-hidden="true" />
                  Coming Soon
                </div>

                <h2 className={s.launchingHeading}>
                  New Tiers<br />Launching Soon
                </h2>

                <p className={s.launchingDesc}>
                  We&rsquo;re crafting new membership tiers for the next chapter of Boston Watch Club.
                  Apply now to be first in line when they drop.
                </p>

                <ul className={s.teaserList} aria-label="Upcoming features">
                  <li className={s.teaserItem}>
                    <span className={s.teaserIcon} aria-hidden="true" />
                    Multiple Tier Options
                  </li>
                  <li className={s.teaserItem}>
                    <span className={s.teaserIcon} aria-hidden="true" />
                    Flexible Pricing
                  </li>
                  <li className={s.teaserItem}>
                    <span className={s.teaserIcon} aria-hidden="true" />
                    Exclusive Member Perks
                  </li>
                  <li className={s.teaserItem}>
                    <span className={s.teaserIcon} aria-hidden="true" />
                    Early Access Benefits
                  </li>
                </ul>

                <p className={s.urgencyLine}>Limited Spots Expected. Be First in Line</p>

                <div className={s.cardFooter}>
                  {/* Link stays in-world: /apply → /redesign/apply */}
                  <CineButton to="/redesign/apply" fullWidth style={{ height: 52 }}>
                    Apply Now
                  </CineButton>
                </div>

              </div>
            </div>

          </div>
          </FadeIn>

          <FadeIn delay="0.24s">
            <p className={s.footnote}>
              Members are accepted by application only.
            </p>
          </FadeIn>

        </div>
      </div>
    </div>
  )
}
