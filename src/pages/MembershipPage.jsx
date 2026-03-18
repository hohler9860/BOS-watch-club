import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../hooks/useAuth'
import MembershipHero from '../components/membership/MembershipHero'
import ShinyButton from '../components/shared/ShinyButton'
import FadeIn from '../components/shared/FadeIn'
import t from '../components/membership/TierGrid.module.css'

const BENEFITS = [
  'ALL CASUAL HANGS, CIGARS, HAPPY HOURS',
  'WHATSAPP GROUP ACCESS',
  'NEWSLETTER AND INSIDER UPDATES',
  'MEMBERS-ONLY CONTENT',
  'BRAND-SPONSORED EVENTS',
  'PRIORITY EVENT RSVP',
  'BRING ONE GUEST TO CASUAL HANGS',
  'CURATED EXPERIENCES AT MEMBER RATES',
  'WELCOME GIFT INCLUDED',
]

export default function MembershipPage() {
  const { member } = useAuth()
  const isMember = member && roleMeetsMinimum(member.role, 'member')

  return (
    <>
      <Helmet>
        <title>Membership — Boston Watch Club</title>
        <meta name="description" content="One tier. Full access. $200 per year. Join the Boston Watch Club for exclusive events, networking, and curated experiences." />
      </Helmet>
      <MembershipHero
        title="MEMBERSHIP"
        subtitle="ONE TIER. FULL ACCESS. $200 PER YEAR."
      />

      <section className={t.section}>
        <FadeIn>
          <div style={{ maxWidth: 440, margin: '0 auto' }}>
            <div className={t.card}>
              <div className={t.inner}>
                <div className={t.price}>
                  <span className={t.amount}>$200</span>
                  <span className={t.period}>PER YEAR</span>
                </div>

                <div className={t.eduBadge}>$30 OFF WITH A VALID .EDU EMAIL</div>

                <div className={t.benefitsWrap}>
                  <ul className={t.benefits}>
                    {BENEFITS.map(b => <li key={b}>{b}</li>)}
                  </ul>
                </div>

                {isMember ? (
                  <ShinyButton as={Link} to="/dashboard" className={t.cta}>
                    GO TO DASHBOARD
                  </ShinyButton>
                ) : (
                  <ShinyButton as={Link} to="/apply" className={t.cta}>
                    APPLY NOW
                  </ShinyButton>
                )}
              </div>
            </div>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'rgba(232, 236, 240, 0.35)',
              textAlign: 'center',
              marginTop: 32,
              letterSpacing: '0.3px',
              textTransform: 'none',
            }}>
              As we grow, exclusive tiers with elevated benefits will be introduced for our community.
            </p>
          </div>
        </FadeIn>
      </section>
    </>
  )
}
