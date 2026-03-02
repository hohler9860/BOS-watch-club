import { useState } from 'react'
import faqItems from '../../data/faqItems'
import FadeIn from '../shared/FadeIn'
import styles from './Faq.module.css'

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null)

  function toggle(i) {
    setActiveIndex(prev => (prev === i ? null : i))
  }

  return (
    <section className={styles.faq} id="faq">
      <div className={styles.inner}>
        <FadeIn>
          <p className={styles.eyebrow}>QUESTIONS</p>
        </FadeIn>
        <FadeIn>
          <h2 className={styles.title}>FREQUENTLY ASKED</h2>
        </FadeIn>
        <div className={styles.list}>
          {faqItems.map((item, i) => (
            <FadeIn key={i}>
              <div className={`${styles.item} ${activeIndex === i ? styles.active : ''}`}>
                <button className={styles.question} onClick={() => toggle(i)}>
                  <span>{item.question}</span>
                  <span className={styles.icon}>+</span>
                </button>
                <div className={styles.answer}>
                  <p>{item.answer}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
