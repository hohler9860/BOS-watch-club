import watchImages from '../../data/watchImages'
import styles from './Marquee.module.css'

export default function Marquee() {
  const base = import.meta.env.BASE_URL
  const logoSrc = `${base}assets/logo.png`

  // Duplicate for seamless infinite scroll
  const images = [...watchImages, ...watchImages]

  return (
    <div className={styles.marquee}>
      <div className={styles.track}>
        {images.map((src, i) => (
          <span key={i} className={styles.pair}>
            <img className={styles.logo} src={logoSrc} alt="BOS WATCH CLUB" />
            <img className={styles.watch} src={`${base}${src.replace(/^\//, '')}`} alt="TIMEPIECE" />
          </span>
        ))}
      </div>
    </div>
  )
}
