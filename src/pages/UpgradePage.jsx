import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import useAuth, { roleMeetsMinimum } from '../hooks/useAuth'
import { useTiers } from '../hooks/useSupabaseData'
import UpgradePopup from '../components/shared/UpgradePopup'
import FadeIn from '../components/shared/FadeIn'
import ShinyButton from '../components/shared/ShinyButton'
import btnStyles from '../components/shared/ShinyButton.module.css'
import s from './LoginPage.module.css'
import { supabase } from '../lib/supabase'

function formatPrice(cents) {
  if (cents === 0) return 'FREE'
  return '$' + cents.toLocaleString()
}

export default function UpgradePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { member, upgradeTier } = useAuth()
  const { data: TIERS } = useTiers()
  const preselectedTier = searchParams.get('tier')?.toLowerCase()
  const [selectedTier, setSelectedTier] = useState(preselectedTier || null)
  const [step, setStep] = useState(preselectedTier ? 'confirm' : 'select')
  const [upgradeResult, setUpgradeResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEdu = member?.email?.endsWith('.edu')

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

  function getDisplayPrice(tier) {
    if (isEdu && tier.edu_discount) {
      return tier.price - tier.edu_discount
    }
    return tier.price
  }

  async function handleUpgrade() {
    const tier = TIERS.find(t => t.id === selectedTier)
    if (!tier) return

    // FREE tier — upgrade directly without Stripe
    if (tier.price === 0 || tier.name === 'FREE') {
      setSubmitting(true)
      try {
        const result = await upgradeTier(tier.name)
        setUpgradeResult(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Dev mode (no Supabase) — simulate upgrade
    if (!supabase) {
      setSubmitting(true)
      try {
        const result = await upgradeTier(tier.name)
        setUpgradeResult(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Real Stripe Checkout
    setSubmitting(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier.name,
          accessToken: session.access_token,
          eduDiscount: isEdu && tier.edu_discount ? true : false,
        }),
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { throw new Error('Checkout unavailable — please try again.') }
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  function handlePopupClose() {
    setUpgradeResult(null)
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
                {TIERS.map(tier => {
                  const displayPrice = getDisplayPrice(tier)
                  const hasDiscount = isEdu && tier.edu_discount
                  return (
                    <button
                      key={tier.id}
                      onClick={async () => {
                        if (tier.price === 0) {
                          if (supabase && member) {
                            await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', member.id)
                          }
                          navigate('/dashboard')
                          return
                        }
                        setSelectedTier(tier.id); setStep('confirm')
                      }}
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
                        {hasDiscount && (
                          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: '#8BB89A', marginTop: 4, letterSpacing: '0.06em' }}>
                            .EDU DISCOUNT APPLIED &mdash; ${tier.edu_discount} OFF
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {hasDiscount && (
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'rgba(232,236,240,0.3)', textDecoration: 'line-through' }}>
                            {formatPrice(tier.price)}
                          </div>
                        )}
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#E8ECF0' }}>{formatPrice(displayPrice)}</div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'rgba(232,236,240,0.35)', letterSpacing: '0.1em' }}>{tier.period}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

            </>
          ) : (
            <>
              <h2 className={s.title}>CONFIRM MEMBERSHIP</h2>
              <p className={s.subtitle}>{TIERS.find(t => t.id === selectedTier)?.name}</p>

              {(() => {
                const tier = TIERS.find(t => t.id === selectedTier)
                const displayPrice = tier ? getDisplayPrice(tier) : 0
                const hasDiscount = isEdu && tier?.edu_discount
                return (
                  <div style={{
                    background: 'rgba(20, 24, 32, 0.8)',
                    border: '1px solid rgba(232, 236, 240, 0.06)',
                    borderRadius: 14,
                    padding: 24,
                    marginBottom: 24,
                    textAlign: 'center',
                  }}>
                    {hasDiscount && (
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'rgba(232,236,240,0.3)', textDecoration: 'line-through', marginBottom: 4 }}>
                        {formatPrice(tier.price)}
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#E8ECF0', marginBottom: 4 }}>
                      {formatPrice(displayPrice)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(232,236,240,0.35)', letterSpacing: '0.12em' }}>
                      {tier?.period}
                    </div>
                    {hasDiscount && (
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#8BB89A', marginTop: 8, letterSpacing: '0.06em' }}>
                        .EDU DISCOUNT APPLIED
                      </div>
                    )}
                  </div>
                )
              })()}

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
                {submitting ? 'REDIRECTING TO CHECKOUT...' : 'COMPLETE PURCHASE'} &rarr;
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
