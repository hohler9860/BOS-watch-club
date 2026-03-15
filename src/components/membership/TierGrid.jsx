import { useNavigate } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../../hooks/useAuth'
import { useTiers } from '../../hooks/useSupabaseData'
import FadeIn from '../shared/FadeIn'
import ShinyButton from '../shared/ShinyButton'
import btnStyles from '../shared/ShinyButton.module.css'
import styles from './TierGrid.module.css'

export default function TierGrid() {
  const navigate = useNavigate()
  const { member } = useAuth()
  const { data: tiers } = useTiers()
  const isMember = member && roleMeetsMinimum(member.role, 'member')

  function handleTierClick(tier) {
    if (isMember) {
      // Already a member — go to dashboard
      navigate('/dashboard')
    } else if (member) {
      // Logged in as free — go to upgrade with tier preselected
      navigate(`/upgrade?tier=${tier.id}`)
    } else {
      // Not logged in — go to login (they'll be redirected to upgrade after)
      navigate('/login')
    }
  }

  function getCtaLabel() {
    if (isMember) return 'GO TO DASHBOARD'
    if (member) return 'SELECT TIER'
    return 'GET STARTED'
  }

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {tiers.map((tier) => (
          <FadeIn key={tier.name}>
            <div className={styles.card}>
              <div className={styles.inner}>
                <h3 className={styles.name}>{tier.name}</h3>
                <p className={styles.tagline}>{tier.tagline}</p>
                <div className={styles.price}>
                  <span className={styles.amount}>{tier.price_display}</span>
                  <span className={styles.period}>{tier.period}</span>
                </div>
                {tier.founding_text && (
                  <p className={styles.founding}>{tier.founding_text}</p>
                )}
                <div className={styles.benefitsWrap}>
                  <ul className={styles.benefits}>
                    {tier.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  {tier.edu_discount && (
                    <p className={styles.eduBadge}>${tier.edu_discount} OFF WITH A VALID .EDU EMAIL</p>
                  )}
                </div>
                <ShinyButton
                  as="button"
                  onClick={() => handleTierClick(tier)}
                  className={`${btnStyles.filled} ${btnStyles.fullWidth} ${styles.cta}`}
                >
                  {getCtaLabel()} &rarr;
                </ShinyButton>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
