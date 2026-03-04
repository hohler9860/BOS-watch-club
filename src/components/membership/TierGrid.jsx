import FadeIn from '../shared/FadeIn'
import ShinyButton from '../shared/ShinyButton'
import btnStyles from '../shared/ShinyButton.module.css'
import styles from './TierGrid.module.css'

const TYPEFORM_URL = 'https://form.typeform.com/to/ntT8GKqz'

const tiers = [
  {
    id: 'enthusiast',
    name: 'ENTHUSIAST',
    tagline: 'For the curious',
    price: '$30',
    period: 'PER YEAR',
    foundingText: 'FIRST 10 \u2192 FOUNDING MEMBER',
    benefits: [
      'ALL CASUAL HANGS, CIGARS, HAPPY HOURS',
      'WHATSAPP / DISCORD GROUP ACCESS',
      'NEWSLETTER AND INSIDER UPDATES',
      'MEMBERS-ONLY CONTENT',
      'VALID .EDU EMAIL ACCEPTED',
    ],
  },
  {
    id: 'collector',
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
  },
  {
    id: 'patron',
    name: 'PATRON',
    tagline: 'The highest expression',
    price: '$2,250',
    period: 'PER YEAR',
    foundingText: 'FIRST 10 \u2192 FOUNDING MEMBER',
    benefits: [
      'EVERYTHING IN COLLECTOR, PLUS:',
      'EXCLUSIVE DINNERS WITH BRAND CEOS',
      'GUARANTEED PRIORITY SEATING',
      'UNLIMITED GUESTS AT CASUAL HANGS',
      'ANNUAL CURATED TRAVEL EXPERIENCE',
      'PERSONALIZED MEMBERSHIP CARD',
    ],
  },
  {
    id: 'womens-circle',
    name: "WOMEN\u2019S CIRCLE",
    tagline: 'A dedicated space for women',
    price: 'FREE',
    period: 'FIRST YEAR',
    foundingText: 'FIRST 10 \u2192 FOUNDING MEMBER',
    benefits: [
      'EVERYTHING IN COLLECTOR TIER',
      'WOMEN-FOCUSED EVENTS & COMMUNITY',
      'EXCLUSIVE WOMEN-ONLY CHAT ACCESS',
      "PRIORITY RSVP FOR WOMEN\u2019S EVENTS",
      'CONCIERGE-LEVEL INTRODUCTIONS',
    ],
    ctaLabel: 'JOIN THE CIRCLE',
  },
]

export default function TierGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {tiers.map((tier) => (
          <FadeIn key={tier.name}>
            <div className={styles.card}>
              <div className={styles.inner}>
                <h3 className={styles.name}>{tier.name}</h3>
                <p className={styles.tagline}>{tier.tagline}</p>
                <div className={styles.price}>
                  <span className={styles.amount}>{tier.price}</span>
                  <span className={styles.period}>{tier.period}</span>
                </div>
                {tier.foundingText && (
                  <p className={styles.founding}>{tier.foundingText}</p>
                )}
                <ul className={styles.benefits}>
                  {tier.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <ShinyButton component="a" href={`${TYPEFORM_URL}?tier=${tier.id}`} target="_blank" rel="noopener noreferrer" className={`${btnStyles.filled} ${btnStyles.fullWidth} ${styles.cta}`}>
                  {tier.ctaLabel || 'APPLY NOW'} &rarr;
                </ShinyButton>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
