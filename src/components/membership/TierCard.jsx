import FadeIn from '../shared/FadeIn'
import styles from './TierCard.module.css'

export default function TierCard({ tier, onApply }) {
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
          <button className={styles.cta} onClick={() => onApply(tier.name)}>
            APPLY NOW
          </button>
        </div>
      </div>
    </FadeIn>
  )
}
