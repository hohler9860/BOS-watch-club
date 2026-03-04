import FadeIn from '../shared/FadeIn'
import styles from './TierCard.module.css'

const TYPEFORM_URL = 'https://form.typeform.com/to/01KJVWE9BDC8VDCP9WNX20QMMC'

export default function TierCard({ tier }) {
  return (
    <FadeIn>
      <div className={styles.card}>
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
          <a className={styles.cta} href={`${TYPEFORM_URL}?tier=${tier.id}`} target="_blank" rel="noopener noreferrer">
            APPLY NOW
          </a>
        </div>
      </div>
    </FadeIn>
  )
}
