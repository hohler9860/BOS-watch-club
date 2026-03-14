import { useEffect, useState } from 'react'
import styles from './TypewriterText.module.css'

export default function TypewriterText({
  text,
  speed = 80,
  cursor = '|',
  loop = false,
  deleteSpeed = 40,
  delay = 1500,
  className = '',
  as: Tag = 'span',
}) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [textArrayIndex, setTextArrayIndex] = useState(0)

  const textArray = Array.isArray(text) ? text : [text]
  const currentText = textArray[textArrayIndex] || ''

  useEffect(() => {
    if (!currentText) return

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex])
            setCurrentIndex((prev) => prev + 1)
          } else if (loop || textArray.length > 1) {
            setTimeout(() => setIsDeleting(true), delay)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentIndex(0)
            setTextArrayIndex((prev) => (prev + 1) % textArray.length)
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    )

    return () => clearTimeout(timeout)
  }, [currentIndex, isDeleting, currentText, loop, speed, deleteSpeed, delay, displayText, text])

  return (
    <Tag className={`${styles.typewriter} ${className}`}>
      {displayText}
      <span className={styles.cursor}>{cursor}</span>
    </Tag>
  )
}
