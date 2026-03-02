import tiers from '../../data/tiers'
import TierCard from './TierCard'
import styles from './TierGrid.module.css'

export default function TierGrid({ onApply }) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {tiers.map((tier, i) => (
          <TierCard key={i} tier={tier} onApply={onApply} />
        ))}
      </div>
    </section>
  )
}
