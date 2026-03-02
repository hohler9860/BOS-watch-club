import FadeIn from '../shared/FadeIn'
import styles from './MembershipHero.module.css'

export default function MembershipHero({ eyebrow, title, subtitle }) {
  return (
    <section className={styles.hero}>
      <FadeIn>
        <p className={styles.eyebrow}>{eyebrow}</p>
      </FadeIn>
      <FadeIn>
        <h2 className={styles.title}>{title}</h2>
      </FadeIn>
      <FadeIn>
        <p className={styles.subtitle} dangerouslySetInnerHTML={{ __html: subtitle }} />
      </FadeIn>
    </section>
  )
}
