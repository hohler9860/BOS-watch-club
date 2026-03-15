import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../hooks/useAuth'
import UpgradePopup from '../components/shared/UpgradePopup'
import FadeIn from '../components/shared/FadeIn'
import ShinyButton from '../components/shared/ShinyButton'
import btnStyles from '../components/shared/ShinyButton.module.css'
import s from './LoginPage.module.css'

const TIERS = [
  { id: 'ENTHUSIAST', name: 'ENTHUSIAST', price: '$50', period: '/year', tagline: 'For the curious' },
  { id: 'COLLECTOR', name: 'COLLECTOR', price: '$1,125', period: '/year', tagline: 'For the serious collector' },
  { id: "WOMEN\u2019S CIRCLE", name: "WOMEN\u2019S CIRCLE", price: 'FREE', period: 'first year', tagline: 'A dedicated space for women' },
  { id: 'PATRON', name: 'PATRON', price: '$2,250', period: '/year', tagline: 'The highest expression' },
]

export default function UpgradePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { member, upgradeTier } = useAuth()
  const preselectedTier = searchParams.get('tier')?.toUpperCase()
  const [selectedTier, setSelectedTier] = useState(preselectedTier || null)
  const [step, setStep] = useState(preselectedTier ? 'confirm' : 'select')
  const [upgradeResult, setUpgradeResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Already a member? Go to dashboard
  if (member && roleMeetsMinimum(member.role, 'member')) {
    navigate('/dashboard', { replace: true })
    return null
  }

  // Not logged in? Go to login
  if (!member) {
    navigate('/login', { replace: true })
    return null
  }

  async function handleUpgrade() {
    setSubmitting(true)
    setError('')
    try {
      // TODO: Integrate real Stripe payment here
      // For now, placeholder — simulates successful payment
      const result = await upgradeTier(selectedTier)
      setUpgradeResult(result)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handlePopupClose() {
    setUpgradeResult(null)
    navigate('/dashboard')
  }

  return (
    <div className={s.page}>
      <FadeIn>
        <div className={s.card} style={{ maxWidth: step === 'select' ? 560 : 440 }}>
          {step === 'select' ? (
            <>
              <h2 className={s.title}>CHOOSE YOUR TIER</h2>
              <p className={s.subtitle}>SELECT A MEMBERSHIP TO UNLOCK FULL ACCESS</p>
              <p style={{ fontSize: 13, color: 'rgba(232,236,240,0.4)', marginBottom: 24 }}>
                Signed in as <strong style={{ color: 'rgba(232,236,240,0.7)' }}>{member.email}</strong>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => { setSelectedTier(tier.id); setStep('confirm') }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderRadius: 14,
                      border: '1px solid rgba(232, 236, 240, 0.06)',
                      background: 'rgba(20, 24, 32, 0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(184, 196, 212, 0.15)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(232, 236, 240, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em', color: '#E8ECF0' }}>{tier.name}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(232,236,240,0.4)', marginTop: 2, textTransform: 'none' }}>{tier.tagline}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#E8ECF0' }}>{tier.price}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'rgba(232,236,240,0.35)', letterSpacing: '0.1em' }}>{tier.period}</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(232,236,240,0.4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 8,
                  textTransform: 'none',
                }}
              >
                Not now, I&apos;ll do this later
              </button>
            </>
          ) : (
            <>
              <h2 className={s.title}>CONFIRM MEMBERSHIP</h2>
              <p className={s.subtitle}>{selectedTier}</p>

              <div style={{
                background: 'rgba(20, 24, 32, 0.8)',
                border: '1px solid rgba(232, 236, 240, 0.06)',
                borderRadius: 14,
                padding: 24,
                marginBottom: 24,
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#E8ECF0', marginBottom: 4 }}>
                  {TIERS.find(t => t.id === selectedTier)?.price}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(232,236,240,0.35)', letterSpacing: '0.12em' }}>
                  {TIERS.find(t => t.id === selectedTier)?.period}
                </div>
              </div>

              {error && <div className={s.error}>{error}</div>}

              <ShinyButton
                as="button"
                className={`${btnStyles.filled}`}
                onClick={handleUpgrade}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '16px 0',
                  fontSize: 14,
                  borderRadius: 40,
                  cursor: submitting ? 'wait' : 'pointer',
                }}
              >
                {submitting ? 'PROCESSING...' : 'COMPLETE PURCHASE'} &rarr;
              </ShinyButton>

              <button
                onClick={() => { setStep('select'); setError('') }}
                style={{
                  marginTop: 16,
                  background: 'none',
                  border: 'none',
                  color: 'rgba(232,236,240,0.4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'none',
                }}
              >
                &larr; Choose a different tier
              </button>
            </>
          )}
        </div>
      </FadeIn>

      {upgradeResult && (
        <UpgradePopup tier={upgradeResult.tier} onClose={handlePopupClose} />
      )}
    </div>
  )
}
