import { useSiteContent } from '../../hooks/useSupabaseData'
import FadeIn from '../shared/FadeIn'
import styles from './MembershipHero.module.css'

export default function MembershipHero({ eyebrow, title, subtitle }) {
  const { content } = useSiteContent()
  const membershipHeroStyle = content.membershipHeroImage ? { '--membership-hero-image': `url("${content.membershipHeroImage}")` } : undefined

  return (
    <section className={styles.hero} style={membershipHeroStyle}>
      {eyebrow && (
        <FadeIn>
          <p className={styles.eyebrow}>{eyebrow}</p>
        </FadeIn>
      )}
      <FadeIn>
        <h2 className={styles.title}>{title}</h2>
      </FadeIn>
      <FadeIn>
        <p className={styles.subtitle}>{subtitle}</p>
      </FadeIn>
    </section>
  )
}
