import useInView from '../../hooks/useInView'
import styles from './FadeIn.module.css'

export default function FadeIn({ children, delay, className = '' }) {
  const [ref, isVisible] = useInView()

  return (
    <div
      ref={ref}
      className={`${styles.fadeIn} ${isVisible ? styles.visible : ''} ${className}`}
      style={delay ? { transitionDelay: delay } : undefined}
    >
      {children}
    </div>
  )
}
