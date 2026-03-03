import watchImages from '../../data/watchImages'
import styles from './Marquee.module.css'

export default function Marquee() {
  const base = import.meta.env.BASE_URL

  // Duplicate for seamless infinite scroll
  const images = [...watchImages, ...watchImages]

  return (
    <div className={styles.marquee}>
      <div className={styles.track}>
        {images.map((src, i) => (
          <img key={i} className={styles.watch} src={`${base}${src.replace(/^\//, '')}`} alt="TIMEPIECE" />
        ))}
      </div>
    </div>
  )
}
