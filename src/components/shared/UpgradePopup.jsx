import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import useAuth from '../../hooks/useAuth'
import tiers from '../../data/tiers'

const TIER_ACCENTS = {
  ENTHUSIAST: { border: 'rgba(160, 170, 180, 0.3)', glow: 'rgba(160, 170, 180, 0.08)' },
  COLLECTOR: { border: 'rgba(184, 196, 212, 0.35)', glow: 'rgba(184, 196, 212, 0.1)' },
  "WOMEN\u2019S CIRCLE": { border: 'rgba(184, 196, 212, 0.35)', glow: 'rgba(184, 196, 212, 0.1)' },
  PATRON: { border: 'rgba(184, 196, 212, 0.45)', glow: 'rgba(184, 196, 212, 0.14)' },
}

function fireConfetti() {
  const colors = ['#FF0000', '#FF8000', '#FFD700', '#00C853', '#2196F3', '#7B1FA2']
  const z = 10000

  // Phase 1: Side cannons (0–3s)
  const cannonEnd = Date.now() + 3000
  const cannonFrame = () => {
    if (Date.now() > cannonEnd) return
    confetti({ particleCount: 2, angle: 60, spread: 55, startVelocity: 60, origin: { x: 0, y: 0.5 }, colors, zIndex: z })
    confetti({ particleCount: 2, angle: 120, spread: 55, startVelocity: 60, origin: { x: 1, y: 0.5 }, colors, zIndex: z })
    requestAnimationFrame(cannonFrame)
  }
  cannonFrame()

  // Phase 2: Fireworks bursts (0.5–3.5s)
  const fwDuration = 3000
  const fwEnd = Date.now() + fwDuration
  const fwDefaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: z, colors }
  const rand = (min, max) => Math.random() * (max - min) + min
  const fwInterval = setInterval(() => {
    const timeLeft = fwEnd - Date.now()
    if (timeLeft <= 0) return clearInterval(fwInterval)
    const count = 50 * (timeLeft / fwDuration)
    confetti({ ...fwDefaults, particleCount: count, origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 } })
    confetti({ ...fwDefaults, particleCount: count, origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 } })
  }, 250)

  // Phase 3: Star bursts (1s, 1.1s, 1.2s)
  const starDefaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, zIndex: z, colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'] }
  const shootStars = () => {
    confetti({ ...starDefaults, particleCount: 40, scalar: 1.2, shapes: ['star'] })
    confetti({ ...starDefaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] })
  }
  setTimeout(shootStars, 1000)
  setTimeout(shootStars, 1100)
  setTimeout(shootStars, 1200)

  // Phase 4: Custom shapes burst (2s)
  const scalar = 2
  const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' })
  const square = confetti.shapeFromPath({ path: 'M0 0 L10 0 L10 10 L0 10 Z' })
  const coin = confetti.shapeFromPath({ path: 'M5 0 A5 5 0 1 0 5 10 A5 5 0 1 0 5 0 Z' })
  const shapeDefaults = { spread: 360, ticks: 60, gravity: 0, decay: 0.96, startVelocity: 20, shapes: [triangle, square, coin], scalar, zIndex: z, colors }
  const shootShapes = () => {
    confetti({ ...shapeDefaults, particleCount: 30 })
    confetti({ ...shapeDefaults, particleCount: 15, scalar: scalar / 2, shapes: ['circle'] })
  }
  setTimeout(shootShapes, 2000)
  setTimeout(shootShapes, 2100)
  setTimeout(shootShapes, 2200)
}

export default function UpgradePopup({ tier, onClose }) {
  const tierData = tiers.find(t => t.name === tier)
  const accent = TIER_ACCENTS[tier] || TIER_ACCENTS.ENTHUSIAST
  const { member } = useAuth()
  const hasFired = useRef(false)

  const firstName = member?.name
    ? member.name.split(' ')[0]
    : null

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    if (!hasFired.current) {
      hasFired.current = true
      // Small delay so the popup is visible first
      setTimeout(fireConfetti, 400)
    }
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!tierData) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(7, 9, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(20, 24, 32, 0.95)',
            border: `1px solid ${accent.border}`,
            borderRadius: 24,
            padding: '48px 40px 40px',
            maxWidth: 420,
            width: '100%',
            textAlign: 'center',
            boxShadow: `0 0 80px ${accent.glow}, 0 24px 64px rgba(0,0,0,0.4)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer overlay */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.5, delay: 0.6, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(184, 196, 212, 0.06), transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* Welcome heading */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              letterSpacing: '0.04em',
              color: '#E8ECF0',
              marginBottom: 4,
            }}
          >
            {firstName
              ? `WELCOME, ${firstName.toUpperCase()}`
              : 'WELCOME TO THE CLUB'}
          </motion.h2>

          {/* Badge */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              borderRadius: 8,
              background: 'rgba(184, 196, 212, 0.08)',
              border: `1px solid ${accent.border}`,
              marginBottom: 8,
              marginTop: 12,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              letterSpacing: '0.06em',
              color: '#E8ECF0',
            }}>
              {tier}
            </span>
          </motion.div>

          {/* Welcome text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'rgba(232, 236, 240, 0.5)',
              marginBottom: 28,
              letterSpacing: '0.3px',
            }}
          >
            You&apos;re officially in. Here&apos;s what you&apos;ve unlocked.
          </motion.p>

          {/* Perks list */}
          <div style={{
            textAlign: 'left',
            borderTop: '1px solid rgba(232, 236, 240, 0.06)',
            paddingTop: 16,
          }}>
            {tierData.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.35 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: i < tierData.benefits.length - 1 ? '1px solid rgba(232, 236, 240, 0.04)' : 'none',
                }}
              >
                <span style={{ color: '#B8C4D4', fontSize: 11, lineHeight: '20px', flexShrink: 0 }}>&#10003;</span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 300,
                  color: 'rgba(232, 236, 240, 0.6)',
                  letterSpacing: '0.3px',
                  lineHeight: '20px',
                  textTransform: 'none',
                }}>
                  {benefit}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + tierData.benefits.length * 0.1 + 0.15, duration: 0.4 }}
            onClick={onClose}
            style={{
              marginTop: 28,
              width: '100%',
              padding: '16px 0',
              borderRadius: 40,
              border: 'none',
              background: '#B8C4D4',
              color: '#07090F',
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              letterSpacing: '0.15em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            whileHover={{ y: -1, boxShadow: '0 8px 28px rgba(184, 196, 212, 0.18)' }}
          >
            GO TO DASHBOARD &rarr;
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
