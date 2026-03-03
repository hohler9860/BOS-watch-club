import { useState } from 'react'
import FadeIn from '../shared/FadeIn'
import styles from './TierGrid.module.css'

const enthusiast = {
  name: 'ENTHUSIAST',
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
  description: 'THE HIGHEST EXPRESSION OF MEMBERSHIP. EXCLUSIVE DINNERS WITH BRAND CEOS, GUARANTEED PRIORITY SEATING AT ALL EVENTS, UNLIMITED GUESTS, ONE ANNUAL CURATED TRAVEL EXPERIENCE, A NUMBERED PERSONALIZED MEMBERSHIP CARD, AND AN ANNUAL PATRON-EXCLUSIVE GIFT.',
}

const student = {
  name: 'STUDENT',
  price: '$50',
  period: 'PER YEAR',
  foundingText: 'FIRST 10 \u2192 FOUNDING MEMBER',
  benefits: [
    'VALID .EDU EMAIL REQUIRED',
    'ACCESS TO CASUAL HANGS AND MEETUPS',
    'WHATSAPP / DISCORD GROUP ACCESS',
    'NEWSLETTER AND INSIDER UPDATES',
    'STUDENT NETWORKING EVENTS',
  ],
}

export default function TierGrid({ onApply }) {
  const [showStudent, setShowStudent] = useState(false)

  return (
    <section className={styles.section}>
      {/* Main 2-column grid */}
      <div className={styles.grid}>
        {[enthusiast, collector].map((tier) => (
          <FadeIn key={tier.name}>
            <div className={`${styles.card} ${tier.popular ? styles.popular : ''}`}>
              {tier.popular && <div className={styles.badge}>MOST POPULAR</div>}
              <div className={styles.inner}>
                <h3 className={styles.name}>{tier.name}</h3>
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
                <button className={styles.cta} onClick={() => onApply(tier.name)}>
                  APPLY NOW
                </button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Student toggle */}
      <FadeIn>
        <div className={styles.studentToggle}>
          <button
            className={styles.studentLink}
            onClick={() => setShowStudent(!showStudent)}
          >
            {showStudent ? 'HIDE STUDENT TIER' : 'CURRENTLY A STUDENT? VIEW STUDENT MEMBERSHIP \u2192'}
          </button>
          {showStudent && (
            <div className={styles.studentCard}>
              <div className={styles.studentInner}>
                <div className={styles.studentHeader}>
                  <div>
                    <h3 className={styles.studentName}>{student.name}</h3>
                    <div className={styles.studentPrice}>
                      <span>{student.price}</span>
                      <span className={styles.studentPeriod}>{student.period}</span>
                    </div>
                  </div>
                  <p className={styles.studentFounding}>{student.foundingText}</p>
                </div>
                <ul className={styles.studentBenefits}>
                  {student.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <button className={styles.studentCta} onClick={() => onApply(student.name)}>
                  APPLY NOW
                </button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Patron premium banner */}
      <FadeIn>
        <div className={styles.patron}>
          <div className={styles.patronInner}>
            <div className={styles.patronContent}>
              <p className={styles.patronEyebrow}>EXCLUSIVE</p>
              <h3 className={styles.patronName}>{patron.name}</h3>
              <div className={styles.patronPrice}>
                <span className={styles.patronAmount}>{patron.price}</span>
                <span className={styles.patronPeriod}>{patron.period}</span>
              </div>
              <p className={styles.patronFounding}>{patron.foundingText}</p>
              <p className={styles.patronDesc}>{patron.description}</p>
            </div>
            <div className={styles.patronAction}>
              <button className={styles.patronCta} onClick={() => onApply(patron.name)}>
                APPLY NOW &rarr;
              </button>
            </div>
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
