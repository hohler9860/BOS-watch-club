import FadeIn from '../components/shared/FadeIn'
import TypewriterText from '../components/shared/TypewriterText'
import ShinyButton from '../components/shared/ShinyButton'
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
          <p className={s.subtitle}>
            <TypewriterText
              text={[
                "An exclusive community for collectors, enthusiasts, and those who appreciate the art of horology.",
                "Where passion for timepieces meets a world-class membership experience.",
                "Curated events. Rare access. A circle of true watch lovers.",
              ]}
              speed={45}
              deleteSpeed={25}
              delay={2500}
              loop
            />
          </p>
        </FadeIn>

        <FadeIn delay="0.3s">
          <ShinyButton as="div" className={s.badge}>
            LAUNCHING SOON
          </ShinyButton>
        </FadeIn>

        <FadeIn delay="0.45s">
          <p className={s.hint}>We're putting the finishing touches on something special. Stay tuned.</p>
        </FadeIn>
      </div>

      <footer className={s.footer}>
        <span>&copy; {new Date().getFullYear()} BOS Watch Club</span>
      </footer>
    </div>
  )
}
