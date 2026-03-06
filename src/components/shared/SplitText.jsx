import { useRef, useEffect, useState } from 'react'
import styles from './SplitText.module.css'

export default function SplitText({ children, as: Tag = 'h2', className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const text = typeof children === 'string' ? children : ''
  const words = text.split(' ')

  return (
    <Tag ref={ref} className={`${styles.splitText} ${className}`}>
      {words.map((word, i) => (
        <span key={i}>
          <span className={styles.wordWrap}>
            <span
              className={`${styles.word} ${visible ? styles.visible : ''}`}
              style={{ transitionDelay: `${delay + i * 0.06}s` }}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
