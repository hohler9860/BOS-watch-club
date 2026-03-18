import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
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
  const { member } = useAuth()
  const { data: TIERS } = useTiers()
  const [upgradeResult, setUpgradeResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEdu = member?.email?.endsWith('.edu')

  // Already a paid member? Go to dashboard
  if (member && roleMeetsMinimum(member.role, 'member')) {
    navigate('/dashboard', { replace: true })
    return null
  }

  // Not logged in? Go to login
  if (!member) {
    navigate('/login', { replace: true })
    return null
  }

  const tier = TIERS.find(t => t.name === 'MEMBER') || TIERS[0]

  function getDisplayPrice(t) {
    if (isEdu && t.edu_discount) {
      return t.price - t.edu_discount
    }
    return t.price
  }

  const displayPrice = tier ? getDisplayPrice(tier) : 0
  const hasDiscount = isEdu && tier?.edu_discount

  async function handleUpgrade() {
    if (!tier) return

    // Dev mode (no Supabase) — cannot process payments
    if (!supabase) {
      setError('Payment processing is not available in dev mode.')
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
        <div className={s.card} style={{ maxWidth: 440 }}>
          <h2 className={s.title}>CONFIRM MEMBERSHIP</h2>
          <p className={s.subtitle}>{tier?.name}</p>

          <p style={{ fontSize: 13, color: 'rgba(232,236,240,0.4)', marginBottom: 24 }}>
            Signed in as <strong style={{ color: 'rgba(232,236,240,0.7)' }}>{member.email}</strong>
          </p>

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

          <Link
            to="/membership"
            style={{
              display: 'block',
              marginTop: 16,
              background: 'none',
              border: 'none',
              color: 'rgba(232,236,240,0.4)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'none',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            &larr; Back to membership
          </Link>
        </div>
      </FadeIn>

      {upgradeResult && (
        <UpgradePopup tier={upgradeResult.tier} onClose={handlePopupClose} />
      )}
    </div>
  )
}
