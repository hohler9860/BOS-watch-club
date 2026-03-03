import FadeIn from '../shared/FadeIn'
import styles from './TierGrid.module.css'

const enthusiast = {
  name: 'ENTHUSIAST',
  tagline: 'For the curious',
  price: '$50',
  period: 'PER YEAR',
  foundingText: 'FIRST 10 \u2192 FOUNDING MEMBER',
  popular: true,
  benefits: [
    'ALL CASUAL HANGS, CIGARS, HAPPY HOURS',
    'WHATSAPP / DISCORD GROUP ACCESS',
    'NEWSLETTER AND INSIDER UPDATES',
    'MEMBERS-ONLY CONTENT',
  ],
}

const collector = {
  name: 'COLLECTOR',
  tagline: 'For the serious collector',
  price: '$1,125',
  period: 'PER YEAR',
  foundingText: 'FIRST 10 \u2192 FOUNDING MEMBER',
  benefits: [
    'EVERYTHING IN ENTHUSIAST, PLUS:',
    '6 BRAND-SPONSORED EVENTS PER YEAR',
    'PRIORITY EVENT RSVP',
    'BRING ONE GUEST TO CASUAL HANGS',
    'CURATED EXPERIENCES AT MEMBER RATES',
    'WELCOME GIFT INCLUDED',
  ],
}

const patron = {
  name: 'PATRON',
  price: '$2,250',
  period: 'PER YEAR',
  foundingText: 'FIRST 10 \u2192 FOUNDING MEMBER',
  features: [
    'EXCLUSIVE DINNERS WITH BRAND CEOS',
    'GUARANTEED PRIORITY SEATING AT ALL EVENTS',
    'UNLIMITED GUESTS AT CASUAL HANGS',
    'ONE ANNUAL CURATED TRAVEL EXPERIENCE',
    'NUMBERED PERSONALIZED MEMBERSHIP CARD',
    'ANNUAL PATRON-EXCLUSIVE GIFT',
  ],
}

export default function TierGrid({ onApply }) {
  return (
    <section className={styles.section}>
      {/* Section header */}
      <FadeIn>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>MEMBERSHIP TIERS</p>
          <h2 className={styles.sectionTitle}>FIND YOUR TIER</h2>
        </div>
      </FadeIn>

      {/* Main 2-column grid */}
      <div className={styles.grid}>
        {[enthusiast, collector].map((tier) => (
          <FadeIn key={tier.name}>
            <div className={`${styles.card} ${tier.popular ? styles.popular : styles.collector}`}>
              {tier.popular && <div className={styles.badge}>MOST POPULAR</div>}
              <div className={styles.inner}>
                <h3 className={styles.name}>{tier.name}</h3>
                <p className={styles.tagline}>{tier.tagline}</p>
                <div className={styles.price}>
                  <span className={styles.amount}>{tier.price}</span>
                  <span className={styles.period}>{tier.period}</span>
                </div>
                <p className={styles.founding}>{tier.foundingText}</p>
                <ul className={styles.benefits}>
                  {tier.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                {tier.popular && (
                  <p className={styles.studentNote}>STUDENTS: $30/YR WITH A VALID .EDU EMAIL</p>
                )}
                <button className={styles.cta} onClick={() => onApply(tier.name)}>
                  APPLY NOW
                </button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Patron premium banner */}
      <FadeIn>
        <div className={styles.patron}>
          <div className={styles.patronInner}>
            <p className={styles.patronEyebrow}>EXCLUSIVE</p>
            <h3 className={styles.patronName}>{patron.name}</h3>
            <p className={styles.patronTagline}>THE HIGHEST EXPRESSION OF MEMBERSHIP</p>
            <div className={styles.patronPrice}>
              <span className={styles.patronAmount}>{patron.price}</span>
              <span className={styles.patronPeriod}>{patron.period}</span>
            </div>
            <p className={styles.patronFounding}>{patron.foundingText}</p>
            <div className={styles.patronDesc}>
              <p className={styles.patronListLabel}>EVERYTHING IN COLLECTOR, PLUS:</p>
              <ul className={styles.patronList}>
                {patron.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <button className={styles.patronCta} onClick={() => onApply(patron.name)}>
              APPLY NOW &rarr;
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Women's Circle */}
      <FadeIn>
        <div className={styles.womens}>
          <div className={styles.womensInner}>
            <p className={styles.womensEyebrow}>COMMUNITY INITIATIVE</p>
            <h3 className={styles.womensTitle}>THE WOMEN&rsquo;S CIRCLE</h3>
            <p className={styles.womensSubtitle}>A DEDICATED SPACE FOR WOMEN COLLECTORS AND ENTHUSIASTS</p>
            <p className={styles.womensDesc}>
              EVERYTHING IN THE COLLECTOR TIER, PLUS WOMEN-FOCUSED EVENTS AND COMMUNITY, EXCLUSIVE WOMEN-ONLY CHAT ACCESS, PRIORITY RSVP FOR WOMEN&rsquo;S EVENTS, AND CONCIERGE-LEVEL INTRODUCTIONS. FREE FOR THE FIRST YEAR.
            </p>
            <button className={styles.womensCta} onClick={() => onApply('WOMAN COLLECTOR')}>
              JOIN THE CIRCLE &rarr;
            </button>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
