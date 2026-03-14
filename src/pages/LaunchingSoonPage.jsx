import FadeIn from '../components/shared/FadeIn'
import SplitText from '../components/shared/SplitText'
import GrainOverlay from '../components/shared/GrainOverlay'
import s from './LaunchingSoonPage.module.css'

export default function LaunchingSoonPage() {
  const base = import.meta.env.BASE_URL

  return (
    <div className={s.page}>
      <GrainOverlay />
      <div className={s.orb1} />
      <div className={s.orb2} />

      <div className={s.content}>
        <FadeIn>
          <div className={s.logo}>
            <img src={`${base}assets/logo.png`} alt="BOS WATCH CLUB" />
          </div>
        </FadeIn>

        <FadeIn delay="0.15s">
          <SplitText as="p" className={s.subtitle} delay={0.2}>
            An exclusive community for collectors, enthusiasts, and those who appreciate the art of horology.
          </SplitText>
        </FadeIn>

        <FadeIn delay="0.3s">
          <div className={s.badge}>LAUNCHING SOON</div>
        </FadeIn>

        <FadeIn delay="0.45s">
          <p className={s.hint}>We're putting the finishing touches on something special. Stay tuned.</p>
        </FadeIn>
      </div>

      <footer className={s.footer}>
        <span>© {new Date().getFullYear()} BOS Watch Club</span>
      </footer>
    </div>
  )
}
