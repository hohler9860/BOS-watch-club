import FadeIn from '../shared/FadeIn'
import GlassCard from '../shared/GlassCard'
import RegisterForm from '../shared/RegisterForm'
import styles from './Register.module.css'

export default function Register() {
  return (
    <section className={styles.register} id="register">
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.inner}>
        <FadeIn>
          <GlassCard variant="dark">
            <RegisterForm variant="dark" />
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  )
}
