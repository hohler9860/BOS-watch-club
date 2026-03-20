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
    nationality: '',
    linkedin: '',
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
    if (!form.name.trim()) { setError('Please enter your display name.'); return }
    if (!form.bio.trim()) { setError('Please write a short bio.'); return }
    if (!form.nationality.trim()) { setError('Please enter your nationality.'); return }
    if (!form.collects.trim()) { setError('Please tell us what you collect.'); return }
    if (!form.favoriteWatch.trim()) { setError('Please share your favorite watch right now.'); return }
    if (!form.location.trim()) { setError('Please enter your location.'); return }
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
          bio: form.bio.trim(),
          nationality: form.nationality.trim(),
          linkedin: form.linkedin.trim() || null,
          collects: form.collects.trim(),
          favorite_watch: form.favoriteWatch.trim(),
          location: form.location.trim(),
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
            <label className={s.label}>BIO <span className={s.required}>*</span> <span style={{ color: 'rgba(232,236,240,0.25)', fontWeight: 300 }}>(100 WORDS MAX)</span></label>
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
              <label className={s.label}>NATIONALITY <span className={s.required}>*</span></label>
              <input
                className={s.input}
                value={form.nationality}
                onChange={update('nationality')}
                placeholder="e.g. Greek, American"
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>LOCATION <span className={s.required}>*</span></label>
              <input
                className={s.input}
                value={form.location}
                onChange={update('location')}
                placeholder="e.g. Back Bay, Boston"
              />
            </div>
          </div>

          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>COLLECTS <span className={s.required}>*</span></label>
              <input
                className={s.input}
                value={form.collects}
                onChange={update('collects')}
                placeholder="e.g. Rolex, Tudor, Omega"
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>FAVORITE WATCH RIGHT NOW <span className={s.required}>*</span></label>
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
              <label className={s.label}>LINKEDIN</label>
              <input
                className={s.input}
                value={form.linkedin}
                onChange={update('linkedin')}
                placeholder="linkedin.com/in/yourname"
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

        </form>
      </div>
    </div>
  )
}
