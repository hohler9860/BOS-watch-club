import useMouseTilt from '../../hooks/useMouseTilt'
import styles from './GlassCard.module.css'

export default function GlassCard({ children, variant = 'light', className = '' }) {
  const { cardRef, shineRef } = useMouseTilt()

  const variantClass = variant === 'dark' ? styles.dark : variant === 'modal' ? styles.modal : ''

  return (
    <div ref={cardRef} className={`${styles.card} ${variantClass} ${className}`}>
      <div ref={shineRef} className={styles.shine} />
      <div className={styles.borderGlow} />
      {children}
    </div>
  )
}
