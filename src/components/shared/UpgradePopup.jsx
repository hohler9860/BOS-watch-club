import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import useAuth from '../../hooks/useAuth'
import { useTiers } from '../../hooks/useSupabaseData'

const TIER_ACCENTS = {
  ENTHUSIAST: { border: 'rgba(160, 170, 180, 0.3)', glow: 'rgba(160, 170, 180, 0.08)' },
  COLLECTOR: { border: 'rgba(184, 196, 212, 0.35)', glow: 'rgba(184, 196, 212, 0.1)' },
  PATRON: { border: 'rgba(184, 196, 212, 0.45)', glow: 'rgba(184, 196, 212, 0.14)' },
}

function fireConfetti() {
  const colors = ['#B8C4D4', '#E8ECF0', '#a786ff', '#fd8bbc', '#eca184', '#f8deb1']
  const end = Date.now() + 3000

  const frame = () => {
    if (Date.now() > end) return

    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors,
      zIndex: 10000,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors,
      zIndex: 10000,
    })

    requestAnimationFrame(frame)
  }

  frame()
}

export default function UpgradePopup({ tier, onClose }) {
  const { data: allTiers } = useTiers()
  const tierData = allTiers.find(t => t.name === tier)
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

  if (!tierData || !allTiers.length) return null

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
