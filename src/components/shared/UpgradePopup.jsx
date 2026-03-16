import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import useAuth from '../../hooks/useAuth'
import { useTiers } from '../../hooks/useSupabaseData'
import { supabase } from '../../lib/supabase'

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

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(232, 236, 240, 0.08)',
  background: 'rgba(20, 24, 32, 0.8)',
  color: '#E8ECF0',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s ease',
}

const labelStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.15em',
  color: 'rgba(232, 236, 240, 0.4)',
  marginBottom: 6,
  display: 'block',
}

export default function UpgradePopup({ tier, onClose }) {
  const { data: allTiers } = useTiers()
  const tierData = allTiers.find(t => t.name === tier)
  const accent = TIER_ACCENTS[tier] || TIER_ACCENTS.ENTHUSIAST
  const { member } = useAuth()
  const hasFired = useRef(false)
  const [step, setStep] = useState('welcome') // 'welcome' | 'profile'

  const firstName = member?.name
    ? member.name.split(' ')[0]
    : null

  const [form, setForm] = useState({
    name: member?.name || '',
    bio: '',
    collects: '',
    favoriteWatch: '',
    location: '',
    instagram: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    if (!hasFired.current) {
      hasFired.current = true
      setTimeout(fireConfetti, 400)
    }
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleSaveProfile() {
    if (!supabase || !member) return
    setSaving(true)
    try {
      await supabase
        .from('profiles')
        .update({
          name: form.name.trim() || null,
          bio: form.bio.trim() || null,
          collects: form.collects.trim() || null,
          favorite_watch: form.favoriteWatch.trim() || null,
          location: form.location.trim() || null,
          instagram: form.instagram.trim() || null,
          onboarding_complete: true,
        })
        .eq('id', member.id)
    } catch (_) { /* non-fatal */ }
    setSaving(false)
    onClose()
  }

  async function handleSkip() {
    if (supabase && member) {
      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', member.id)
    }
    onClose()
  }

  if (!tierData || !allTiers.length) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(7, 9, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: 24,
          overflowY: 'auto',
        }}
      >
        {step === 'welcome' ? (
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

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + tierData.benefits.length * 0.1 + 0.15, duration: 0.4 }}
              onClick={() => setStep('profile')}
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
              SET UP YOUR PROFILE &rarr;
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(20, 24, 32, 0.95)',
              border: `1px solid ${accent.border}`,
              borderRadius: 24,
              padding: '40px 36px 36px',
              maxWidth: 520,
              width: '100%',
              boxShadow: `0 0 80px ${accent.glow}, 0 24px 64px rgba(0,0,0,0.4)`,
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              letterSpacing: '0.04em',
              color: '#E8ECF0',
              textAlign: 'center',
              marginBottom: 6,
            }}>
              SET UP YOUR PROFILE
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'rgba(232, 236, 240, 0.45)',
              textAlign: 'center',
              marginBottom: 28,
              letterSpacing: '0.3px',
            }}>
              This info will be visible to other members in the directory.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>DISPLAY NAME</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  autoFocus
                />
              </div>

              <div>
                <label style={labelStyle}>BIO</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell the club about yourself, your collecting journey, what got you into watches..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>COLLECTS</label>
                  <input
                    style={inputStyle}
                    value={form.collects}
                    onChange={e => setForm(p => ({ ...p, collects: e.target.value }))}
                    placeholder="e.g. Rolex, Tudor, Omega"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ ...labelStyle, flex: 1 }}>FAVORITE WATCH</label>
                  <input
                    style={inputStyle}
                    value={form.favoriteWatch}
                    onChange={e => setForm(p => ({ ...p, favoriteWatch: e.target.value }))}
                    placeholder="e.g. Rolex Submariner 124060"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>LOCATION</label>
                  <input
                    style={inputStyle}
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Back Bay, Boston"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>INSTAGRAM</label>
                  <input
                    style={inputStyle}
                    value={form.instagram}
                    onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                    placeholder="@your_handle"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              style={{
                marginTop: 24,
                width: '100%',
                padding: '16px 0',
                borderRadius: 40,
                border: 'none',
                background: '#B8C4D4',
                color: '#07090F',
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                letterSpacing: '0.15em',
                cursor: saving ? 'default' : 'pointer',
                opacity: saving ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              {saving ? 'SAVING...' : 'COMPLETE SETUP'}
            </button>

          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
