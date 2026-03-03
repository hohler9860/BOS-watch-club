import FadeIn from '../shared/FadeIn'
import styles from './Snapshot.module.css'

const descriptors = ['COLLECTORS', 'DEALERS', 'ENTHUSIASTS', 'WATCHMAKERS']

const stats = [
  { number: '50+', label: 'FOUNDING MEMBERS' },
  { number: '6', label: 'EVENTS PER YEAR' },
  { number: 'EST. 2025', label: 'BOSTON, MA' },
]

export default function Snapshot() {
  return (
    <section className={styles.snapshot}>
      <div className={styles.inner}>
        {descriptors.map((d, i) => (
          <FadeIn key={d}>
            <span className={styles.item}>
              <span className={styles.label}>{d}</span>
              {i < descriptors.length - 1 && <span className={styles.dot}>&middot;</span>}
            </span>
          </FadeIn>
        ))}
      </div>
      <div className={styles.stats}>
        {stats.map((s) => (
          <FadeIn key={s.label}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{s.number}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
