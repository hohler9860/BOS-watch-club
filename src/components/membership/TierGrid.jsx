import FadeIn from '../shared/FadeIn'
import styles from './TierGrid.module.css'

const enthusiast = {
  name: 'Enthusiast',
  tagline: 'For the curious',
  price: '$50',
  period: 'PER YEAR',
  benefits: [
    'All casual hangs, cigars, happy hours',
    'WhatsApp / Discord group access',
    'Newsletter and insider updates',
    'Members-only content',
  ],
}

const collector = {
  name: 'Collector',
  tagline: 'For the serious collector',
  price: '$1,125',
  period: 'PER YEAR',
  benefits: [
    'Everything in Enthusiast, plus:',
    '6 brand-sponsored events per year',
    'Priority event RSVP',
    'Bring one guest to casual hangs',
    'Curated experiences at member rates',
    'Welcome gift included',
  ],
}

const patron = {
  name: 'Patron',
  price: '$2,250',
  period: 'PER YEAR',
  features: 'Exclusive dinners with brand CEOs, guaranteed priority seating at all events, unlimited guests at casual hangs, one annual curated travel experience, a numbered personalized membership card, and an annual Patron-exclusive gift.',
}

export default function TierGrid({ onApply }) {
  return (
    <section className={styles.section}>
      {/* Section header */}
      <FadeIn>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>MEMBERSHIP TIERS</p>
          <h2 className={styles.sectionTitle}>Find Your Tier</h2>
          <p className={styles.sectionSubtitle}>Every membership includes a one-time $40 application fee.</p>
        </div>
      </FadeIn>

      {/* Main 2-column grid */}
      <div className={styles.grid}>
        <FadeIn>
          <div className={styles.card}>
            <div className={styles.inner}>
              <h3 className={styles.name}>{enthusiast.name}</h3>
              <p className={styles.tagline}>{enthusiast.tagline}</p>
              <div className={styles.price}>
                <span className={styles.amount}>{enthusiast.price}</span>
                <span className={styles.period}>{enthusiast.period}</span>
              </div>
              <div className={styles.foundingRule}>
                <span className={styles.foundingText}>Founding member spots available</span>
              </div>
              <ul className={styles.benefits}>
                {enthusiast.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <p className={styles.studentNote}>Students: $30/yr with a valid .edu email</p>
              <button className={styles.cta} onClick={() => onApply('ENTHUSIAST')}>
                Apply Now
              </button>
            </div>
          </div>
        </FadeIn>
        <FadeIn>
          <div className={`${styles.card} ${styles.collectorCard}`}>
            <div className={styles.inner}>
              <h3 className={styles.collectorName}>{collector.name}</h3>
              <p className={styles.collectorTagline}>{collector.tagline}</p>
              <div className={styles.price}>
                <span className={styles.collectorAmount}>{collector.price}</span>
                <span className={styles.collectorPeriod}>{collector.period}</span>
              </div>
              <div className={styles.collectorFoundingRule}>
                <span className={styles.collectorFoundingText}>Founding member spots available</span>
              </div>
              <ul className={styles.collectorBenefits}>
                {collector.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <button className={styles.collectorCta} onClick={() => onApply('COLLECTOR')}>
                Apply Now
              </button>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Patron premium banner */}
      <FadeIn>
        <div className={styles.patron}>
          <div className={styles.patronInner}>
            <p className={styles.patronEyebrow}>EXCLUSIVE</p>
            <h3 className={styles.patronName}>{patron.name}</h3>
            <div className={styles.patronPrice}>
              <span className={styles.patronAmount}>{patron.price}</span>
              <span className={styles.patronPeriod}>{patron.period}</span>
            </div>
            <div className={styles.patronFoundingRule}>
              <span className={styles.patronFoundingText}>Founding member spots available</span>
            </div>
            <p className={styles.patronDesc}>
              Everything in Collector, plus: {patron.features}
            </p>
            <button className={styles.patronCta} onClick={() => onApply('PATRON')}>
              Apply Now &rarr;
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Women's Circle */}
      <FadeIn>
        <div className={styles.womens}>
          <div className={styles.womensInner}>
            <p className={styles.womensEyebrow}>COMMUNITY INITIATIVE</p>
            <h3 className={styles.womensTitle}>The Women&rsquo;s Circle</h3>
            <p className={styles.womensSubtitle}>A dedicated space for women collectors and enthusiasts</p>
            <p className={styles.womensDesc}>
              Everything in the Collector tier, plus women-focused events and community, exclusive women-only chat access, priority RSVP for women&rsquo;s events, and concierge-level introductions. Free for the first year.
            </p>
            <button className={styles.womensCta} onClick={() => onApply('WOMAN COLLECTOR')}>
              Join the Circle &rarr;
            </button>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
