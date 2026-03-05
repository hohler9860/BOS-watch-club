import FadeIn from '../shared/FadeIn'
import styles from './Benefits.module.css'

const benefits = [
  {
    name: 'PRIORITY EVENT ACCESS',
    desc: 'First to know, first to RSVP. Every gathering, every time.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
  },
  {
    name: 'MEMBERS-ONLY DINNERS',
    desc: "Intimate evenings at Boston's finest private dining rooms.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
    ),
  },
  {
    name: 'PRIVATE COMMUNITY',
    desc: 'A vetted group of like-minded collectors. No noise, just substance.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
    ),
  },
  {
    name: 'FOUNDING MEMBER STATUS',
    desc: 'A permanent distinction. You were here from the beginning.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    ),
  },
  {
    name: 'MEMBER DIRECTORY',
    desc: 'Connect directly with collectors, dealers, and watchmakers in the network.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
    ),
  },
  {
    name: 'EARLY ACCESS',
    desc: 'Collaborations, drops, and partnerships \u2014 members see it first.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
    ),
  },
]

export default function Benefits() {
  return (
    <section className={styles.benefits}>
      <div className={styles.inner}>
        <FadeIn>
          <p className={styles.eyebrow}>FOUNDING MEMBERS</p>
        </FadeIn>
        <FadeIn>
          <h2 className={styles.title}>WHAT YOU GET</h2>
        </FadeIn>
        <FadeIn>
          <p className={styles.subtitle}>Membership is more than access. It&rsquo;s an invitation into a world built for those who take time seriously.</p>
        </FadeIn>
        <div className={styles.grid}>
          {benefits.map((b) => (
            <FadeIn key={b.name}>
              <div className={styles.item}>
                <div className={styles.icon}>{b.icon}</div>
                <h3 className={styles.name}>{b.name}</h3>
                <p className={styles.desc}>{b.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
