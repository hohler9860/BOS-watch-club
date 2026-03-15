import { useNavigate } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../../hooks/useAuth'
import FadeIn from '../shared/FadeIn'
import styles from './TierCard.module.css'

export default function TierCard({ tier }) {
  const navigate = useNavigate()
  const { member } = useAuth()
  const isMember = member && roleMeetsMinimum(member.role, 'member')

  function handleClick() {
    if (isMember) {
      navigate('/dashboard')
    } else if (member) {
      navigate(`/upgrade?tier=${tier.id || tier.name}`)
    } else {
      navigate('/login')
    }
  }

  return (
    <FadeIn>
      <div className={styles.card}>
        <div className={styles.inner}>
          <h3 className={styles.name}>{tier.name}</h3>
          <div className={styles.price}>
            <span className={styles.amount}>{tier.price}</span>
            <span className={styles.period}>{tier.period}</span>
          </div>
          <p className={styles.founding}>{tier.foundingText}</p>
          <ul className={styles.benefits}>
            {tier.benefits.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <button className={styles.cta} onClick={handleClick}>
            {isMember ? 'GO TO DASHBOARD' : member ? 'SELECT TIER' : 'GET STARTED'}
          </button>
        </div>
      </div>
    </FadeIn>
  )
}
