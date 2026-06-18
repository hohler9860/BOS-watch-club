/**
 * NewFaq — /redesign/faq
 *
 * Standalone editorial FAQ page for the redesign, reachable from the CineNav menu
 * (alongside Membership / Events / Journal).
 *
 * Data: useFaqItems() — the SAME `faq_items` Supabase table the live-site FAQ reads
 * (src/components/home/Faq.jsx), so this page mirrors the live FAQ content and stays
 * in sync. Accordion open/close logic is ported verbatim from that component.
 *
 * Presentation only: Kettle Kids editorial style (off-white page, ABC Marist serif,
 * flat accordion rows) — matches NewJournal / NewMembership masthead pattern.
 */

import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import FadeIn from '../../components/shared/FadeIn'
import { useFaqItems, useSiteContent } from '../../hooks/useSupabaseData'
import styles from './NewFaq.module.css'

export default function NewFaq() {
  const { data: faqItems } = useFaqItems()
  const { content } = useSiteContent()
  const [activeIndex, setActiveIndex] = useState(null)

  function toggle(i) {
    setActiveIndex(prev => (prev === i ? null : i))
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>FAQ | Boston Watch Club</title>
        <meta name="description" content="Frequently asked questions about Boston Watch Club: membership, events, guests, deposits, and how the community works." />
      </Helmet>

      {/* ── Editorial masthead ──────────────────────────────────────────────── */}
      <section
        className={`${styles.hero} ${content.faqHeroImage ? styles.heroImage : ''}`}
        style={content.faqHeroImage ? { backgroundImage: `url(${content.faqHeroImage})`, backgroundSize: 'cover', backgroundPosition: content.faqHeroImagePosition || 'center' } : undefined}
      >
        <FadeIn>
          <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
        </FadeIn>
        <FadeIn>
          <p className={styles.heroSubtitle}>
            Everything you need to know about membership, events, and how the club works.
          </p>
        </FadeIn>
      </section>

      {/* ── Accordion ───────────────────────────────────────────────────────── */}
      <section className={styles.body}>
        <div className={styles.list}>
          {faqItems.map((item, i) => (
            <FadeIn key={item.id ?? i}>
              <div className={`${styles.item} ${activeIndex === i ? styles.active : ''}`}>
                <button
                  className={styles.question}
                  onClick={() => toggle(i)}
                  aria-expanded={activeIndex === i}
                >
                  <span>{item.question}</span>
                  <span className={styles.icon} aria-hidden="true">+</span>
                </button>
                <div className={styles.answerWrap}>
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}
