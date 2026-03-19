import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import useAuth from '../hooks/useAuth'
import MembershipHero from '../components/membership/MembershipHero'
import ShinyButton from '../components/shared/ShinyButton'
import btnStyles from '../components/shared/ShinyButton.module.css'
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
  const isMember = member && member.role === 'member'

  return (
    <>
      <Helmet>
        <title>Membership — Boston Watch Club</title>
        <meta name="description" content="Founding membership. Limited to 40 members. Join Boston's first watch community for exclusive events, networking, and curated experiences." />
      </Helmet>
      <MembershipHero
        title="FOUNDING MEMBERSHIP"
        subtitle="BOSTON'S FIRST WATCH COMMUNITY"
      />

      <section className={t.section}>
        <FadeIn>
          <div style={{ maxWidth: 440, margin: '0 auto' }}>
            <div className={t.card}>
              <div className={t.inner}>
                <div className={t.eduBadge}>FOUNDING MEMBERSHIP IS FULL</div>

                <div className={t.price}>
                  <span className={t.amount}>40 FOUNDING MEMBERS &mdash; SOLD OUT</span>
                </div>

                <div className={t.benefitsWrap}>
                  <ul className={t.benefits}>
                    {BENEFITS.map(b => <li key={b}>{b}</li>)}
                  </ul>
                </div>

                {isMember ? (
                  <ShinyButton component={Link} to="/dashboard" className={`${btnStyles.filled} ${t.cta}`}>
                    GO TO DASHBOARD &rarr;
                  </ShinyButton>
                ) : (
                  <ShinyButton component={Link} to="/apply" className={`${btnStyles.filled} ${t.cta}`}>
                    JOIN THE WAITLIST &rarr;
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
              Join the waitlist to be notified when new memberships become available.
            </p>
          </div>
        </FadeIn>
      </section>
    </>
  )
}
