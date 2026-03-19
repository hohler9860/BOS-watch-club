import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import s from './OnboardingPage.module.css'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { member, refreshProfile, markOnboardingComplete } = useAuth()
  const welcomeTier = searchParams.get('tier')?.toUpperCase()
  const isWelcome = searchParams.get('welcome') === 'true'

  const [form, setForm] = useState({
    name: member?.name || '',
    bio: '',
    collects: '',
    favoriteWatch: '',
    location: '',
    instagram: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(field) {
    return (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter your display name so other members know who you are.'); return }
    if (!supabase || !member) return
    setSaving(true)
    setError('')
    try {
      // If coming from Stripe, refresh profile to pick up webhook-applied tier
      if (isWelcome && welcomeTier) {
        await refreshProfile()
      }

      const { error: saveErr } = await supabase
        .from('profiles')
        .update({
          name: form.name.trim(),
          bio: form.bio.trim() || null,
          collects: form.collects.trim() || null,
          favorite_watch: form.favoriteWatch.trim() || null,
          location: form.location.trim() || null,
          instagram: form.instagram.trim() || null,
          onboarding_complete: true,
          role: 'member',
          tier: 'MEMBER',
        })
        .eq('id', member.id)
      if (saveErr) throw saveErr
      markOnboardingComplete()

      if (isWelcome && welcomeTier) {
        navigate(`/dashboard?welcome=true&tier=${welcomeTier}`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSkip() {
    if (!supabase || !member) { navigate('/dashboard', { replace: true }); return }
    try {
      if (isWelcome && welcomeTier) await refreshProfile()
      await supabase.from('profiles').update({ onboarding_complete: true, role: 'member', tier: 'MEMBER' }).eq('id', member.id)
      markOnboardingComplete()
    } catch (_) { /* non-fatal */ }
    if (isWelcome && welcomeTier) {
      navigate(`/dashboard?welcome=true&tier=${welcomeTier}`, { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.logoWrap}>
          <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="BOS Watch Club" className={s.logo} />
        </div>

        <div className={s.header}>
          <h1 className={s.title}>SET UP YOUR PROFILE</h1>
          <p className={s.subtitle}>This info will be visible to other members in the directory. You can update it anytime.</p>
        </div>

        <form className={s.form} onSubmit={handleSave}>
          <div className={s.field}>
            <label className={s.label}>DISPLAY NAME <span className={s.required}>*</span></label>
            <input
              className={s.input}
              value={form.name}
              onChange={update('name')}
              placeholder="Your name"
              autoFocus
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>BIO <span style={{ color: 'rgba(232,236,240,0.25)', fontWeight: 300 }}>(100 WORDS MAX)</span></label>
            <textarea
              className={s.textarea}
              value={form.bio}
              onChange={e => {
                const words = e.target.value.split(/\s+/).filter(Boolean)
                if (words.length <= 100) setForm(f => ({ ...f, bio: e.target.value }))
              }}
              placeholder="Tell the club about yourself, your collecting journey, what got you into watches..."
              rows={4}
            />
            <span style={{ fontSize: 11, color: 'rgba(232,236,240,0.35)', marginTop: 4, display: 'block', textAlign: 'right' }}>
              {form.bio.split(/\s+/).filter(Boolean).length}/100 words
            </span>
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>COLLECTS</label>
              <input
                className={s.input}
                value={form.collects}
                onChange={update('collects')}
                placeholder="e.g. Rolex, Tudor, Omega"
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>FAVORITE WATCH RIGHT NOW</label>
              <input
                className={s.input}
                value={form.favoriteWatch}
                onChange={update('favoriteWatch')}
                placeholder="e.g. Rolex Submariner 124060"
              />
            </div>
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>LOCATION</label>
              <input
                className={s.input}
                value={form.location}
                onChange={update('location')}
                placeholder="e.g. Back Bay, Boston"
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>INSTAGRAM</label>
              <input
                className={s.input}
                value={form.instagram}
                onChange={update('instagram')}
                placeholder="@your_handle"
              />
            </div>
          </div>

          {error && <p className={s.error}>{error}</p>}

          <button type="submit" className={s.saveBtn} disabled={saving}>
            {saving ? 'SAVING...' : 'COMPLETE SETUP'}
          </button>

          <button type="button" className={s.skipBtn} onClick={handleSkip} disabled={saving}>
            Skip for now
          </button>
        </form>
      </div>
    </div>
  )
}
