import { useRef, useState } from 'react'
import styles from './Marquee.module.css'

export default function Marquee({
  children,
  duration = 20,
  pauseOnHover = false,
  direction = 'left',
  fade = true,
  fadeAmount = 10,
  className = '',
}) {
  const containerRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  const isVertical = direction === 'up' || direction === 'down'
  const isReverse = direction === 'right' || direction === 'down'

  const dirClass = isVertical ? styles.vertical : ''
  const scrollClass = [
    styles.scroller,
    isVertical ? styles.vertical : '',
    isReverse ? styles.reverse : '',
    isPaused ? styles.paused : '',
  ].filter(Boolean).join(' ')

  const maskStyle = fade
    ? {
        maskImage: isVertical
          ? `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`
          : `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`,
        WebkitMaskImage: isVertical
          ? `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`
          : `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`,
      }
    : {}

  const items = Array.isArray(children) ? children : [children]

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${dirClass} ${className}`}
      style={{ ...maskStyle, '--marquee-duration': `${duration}s` }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div className={scrollClass}>
        {items.map((item, i) => (
          <div key={`a-${i}`} className={styles.item}>{item}</div>
        ))}
        {items.map((item, i) => (
          <div key={`b-${i}`} className={styles.item}>{item}</div>
        ))}
      </div>
    </div>
  )
}
