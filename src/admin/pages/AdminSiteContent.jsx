import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import s from '../admin.module.css'

export default function AdminSiteContent() {
  const [tab, setTab] = useState('text') // text | faq | benefits | tiers
  const [siteContent, setSiteContent] = useState({})
  const [faq, setFaq] = useState([])
  const [benefits, setBenefits] = useState([])
  const [tiers, setTiers] = useState([])
  const [editingFaq, setEditingFaq] = useState(null)
  const [editingBenefit, setEditingBenefit] = useState(null)
  const [editingTier, setEditingTier] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  useEffect(() => {
    async function fetchAll() {
      if (!supabase) { setLoading(false); return }
      setLoading(true)
      setError(null)
      try {
        const [scRes, faqRes, benRes, tierRes] = await Promise.all([
          supabase.from('site_content').select('key, value'),
          supabase.from('faq_items').select('*').order('sort_order', { ascending: true }),
          supabase.from('benefits').select('*').order('sort_order', { ascending: true }),
          supabase.from('tiers').select('*').order('sort_order', { ascending: true }),
        ])
        if (scRes.error) throw scRes.error
        if (faqRes.error) throw faqRes.error
        if (benRes.error) throw benRes.error
        if (tierRes.error) throw tierRes.error

        // Convert site_content rows to a key→value map
        const contentMap = {}
        for (const row of scRes.data) contentMap[row.key] = row.value
        setSiteContent(contentMap)
        setFaq(faqRes.data)
        setBenefits(benRes.data.map(b => ({ ...b, desc: b.description })))
        setTiers(tierRes.data.map(t => ({
          ...t,
          foundingText: t.founding_text,
          benefits: Array.isArray(t.benefits) ? t.benefits : [],
        })))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Text Blocks ──
  const textSections = [
    { label: 'Homepage — Hero', fields: [
      { key: 'heroSubtitle', label: 'Hero Subtitle' },
      { key: 'heroCta', label: 'Hero CTA Button Text' },
    ]},
    { label: 'Homepage — About Section', fields: [
      { key: 'aboutEyebrow', label: 'Eyebrow' },
      { key: 'aboutTitle', label: 'Title' },
      { key: 'aboutDescription', label: 'Description', textarea: true },
      { key: 'aboutCardEyebrow', label: 'Card Eyebrow' },
      { key: 'aboutCardHeadline', label: 'Card Headline' },
      { key: 'aboutCardBody', label: 'Card Body', textarea: true },
    ]},
    { label: 'Homepage — Register CTA', fields: [
      { key: 'registerEyebrow', label: 'Eyebrow' },
      { key: 'registerTitle', label: 'Title' },
      { key: 'registerSubtitle', label: 'Subtitle', textarea: true },
      { key: 'registerCta', label: 'CTA Button Text' },
    ]},
    { label: 'Homepage — Timepiece Spotlight', fields: [
      { key: 'timepieceEyebrow', label: 'Eyebrow' },
      { key: 'timepieceName', label: 'Watch Name' },
      { key: 'timepieceRef', label: 'Reference Number' },
      { key: 'timepieceDescription', label: 'Description', textarea: true },
      { key: 'timepieceNote', label: 'Bottom Note' },
    ]},
    { label: 'Events Page', fields: [
      { key: 'eventsPageTitle', label: 'Page Title' },
      { key: 'eventsPageSubtitle', label: 'Page Subtitle' },
    ]},
    { label: 'Blog Page', fields: [
      { key: 'blogPageTitle', label: 'Page Title' },
      { key: 'blogPageSubtitle', label: 'Page Subtitle' },
    ]},
    { label: 'Membership Page', fields: [
      { key: 'membershipTitle', label: 'Page Title' },
      { key: 'membershipSubtitle', label: 'Page Subtitle' },
    ]},
    { label: 'Benefits Section', fields: [
      { key: 'benefitsEyebrow', label: 'Eyebrow' },
      { key: 'benefitsTitle', label: 'Title' },
      { key: 'benefitsSubtitle', label: 'Subtitle', textarea: true },
    ]},
    { label: 'FAQ Section', fields: [
      { key: 'faqEyebrow', label: 'Eyebrow' },
      { key: 'faqTitle', label: 'Title' },
    ]},
    { label: 'Footer & Social', fields: [
      { key: 'footerCopyright', label: 'Copyright Text' },
      { key: 'instagramUrl', label: 'Instagram URL' },
      { key: 'tiktokUrl', label: 'TikTok URL' },
      { key: 'substackUrl', label: 'Substack URL' },
      { key: 'contactEmail', label: 'Contact Email' },
      { key: 'typeformUrl', label: 'Application Typeform URL' },
    ]},
  ]

  async function handleSaveTextBlocks() {
    if (!supabase) { flash(); return }
    setError(null)
    try {
      const upserts = Object.entries(siteContent).map(([key, value]) => ({ key, value: value || '' }))
      const { error: err } = await supabase.from('site_content').upsert(upserts, { onConflict: 'key' })
      if (err) throw err
      flash()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSaveFaq() {
    if (!supabase) { setEditingFaq(null); flash(); return }
    setError(null)
    try {
      if (editingFaq.id) {
        const { error: err } = await supabase.from('faq_items').update({
          question: editingFaq.question,
          answer: editingFaq.answer,
        }).eq('id', editingFaq.id)
        if (err) throw err
        setFaq(prev => prev.map(f => f.id === editingFaq.id ? { ...f, ...editingFaq } : f))
      } else {
        const { data, error: err } = await supabase.from('faq_items').insert({
          question: editingFaq.question,
          answer: editingFaq.answer,
          sort_order: faq.length,
        }).select().single()
        if (err) throw err
        setFaq(prev => [...prev, data])
      }
      setEditingFaq(null)
      flash()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteFaq(id) {
    if (!supabase) { setFaq(prev => prev.filter(f => f.id !== id)); setEditingFaq(null); return }
    setError(null)
    try {
      const { error: err } = await supabase.from('faq_items').delete().eq('id', id)
      if (err) throw err
      setFaq(prev => prev.filter(f => f.id !== id))
      setEditingFaq(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSaveBenefit() {
    if (!supabase) { setEditingBenefit(null); flash(); return }
    setError(null)
    try {
      if (editingBenefit.id) {
        const { error: err } = await supabase.from('benefits').update({
          name: editingBenefit.name,
          description: editingBenefit.desc,
          icon: editingBenefit.icon,
        }).eq('id', editingBenefit.id)
        if (err) throw err
        setBenefits(prev => prev.map(b => b.id === editingBenefit.id ? { ...b, ...editingBenefit, description: editingBenefit.desc } : b))
      } else {
        const { data, error: err } = await supabase.from('benefits').insert({
          name: editingBenefit.name,
          description: editingBenefit.desc,
          icon: editingBenefit.icon,
          sort_order: benefits.length,
        }).select().single()
        if (err) throw err
        setBenefits(prev => [...prev, { ...data, desc: data.description }])
      }
      setEditingBenefit(null)
      flash()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteBenefit(id) {
    if (!supabase) { setBenefits(prev => prev.filter(b => b.id !== id)); setEditingBenefit(null); return }
    setError(null)
    try {
      const { error: err } = await supabase.from('benefits').delete().eq('id', id)
      if (err) throw err
      setBenefits(prev => prev.filter(b => b.id !== id))
      setEditingBenefit(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSaveTier() {
    if (!supabase) { setTiers(prev => prev.map(t => t.id === editingTier.id ? editingTier : t)); setEditingTier(null); flash(); return }
    setError(null)
    try {
      const { error: err } = await supabase.from('tiers').update({
        name: editingTier.name,
        price: editingTier.price ? Number(editingTier.price) : null,
        period: editingTier.period,
        founding_text: editingTier.foundingText,
        benefits: editingTier.benefits,
      }).eq('id', editingTier.id)
      if (err) throw err
      setTiers(prev => prev.map(t => t.id === editingTier.id ? { ...t, ...editingTier } : t))
      setEditingTier(null)
      flash()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className={s.loading}>Loading site content...</div>

  return (
    <div>
      <h1 className={s.pageTitle}>Site Content</h1>
      <p className={s.pageSubtitle}>
        Manage all text, FAQ, benefits, and tier descriptions visible to members.{' '}
        {saved && <span style={{ color: '#059669', fontWeight: 600 }}>Saved!</span>}
        {error && <span style={{ color: '#dc2626', fontWeight: 600 }}>Error: {error}</span>}
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={`${s.btn} ${tab === 'text' ? s.btnPrimary : s.btnOutline}`} onClick={() => setTab('text')}>Text Blocks</button>
        <button className={`${s.btn} ${tab === 'faq' ? s.btnPrimary : s.btnOutline}`} onClick={() => setTab('faq')}>FAQ ({faq.length})</button>
        <button className={`${s.btn} ${tab === 'benefits' ? s.btnPrimary : s.btnOutline}`} onClick={() => setTab('benefits')}>Benefits ({benefits.length})</button>
        <button className={`${s.btn} ${tab === 'tiers' ? s.btnPrimary : s.btnOutline}`} onClick={() => setTab('tiers')}>Tiers ({tiers.length})</button>
      </div>

      {/* ── Text Blocks ── */}
      {tab === 'text' && (
        <div>
          {textSections.map(section => (
            <div key={section.label} className={s.card}>
              <div className={s.cardTitle}>{section.label}</div>
              {section.fields.map(field => (
                <div key={field.key} className={s.formGroup}>
                  <label className={s.formLabel}>{field.label}</label>
                  {field.textarea ? (
                    <textarea className={s.formTextarea} value={siteContent[field.key] || ''} onChange={e => setSiteContent(prev => ({ ...prev, [field.key]: e.target.value }))} />
                  ) : (
                    <input className={s.formInput} value={siteContent[field.key] || ''} onChange={e => setSiteContent(prev => ({ ...prev, [field.key]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
          ))}
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSaveTextBlocks}>Save All Text</button>
        </div>
      )}

      {/* ── FAQ ── */}
      {tab === 'faq' && (
        <div>
          {editingFaq ? (
            <div className={s.card}>
              <div className={s.cardTitle}>{editingFaq.id ? 'Edit FAQ' : 'New FAQ'}</div>
              <div className={s.formGroup}><label className={s.formLabel}>Question</label><input className={s.formInput} value={editingFaq.question} onChange={e => setEditingFaq(p => ({ ...p, question: e.target.value }))} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Answer</label><textarea className={s.formTextarea} style={{ minHeight: 100 }} value={editingFaq.answer} onChange={e => setEditingFaq(p => ({ ...p, answer: e.target.value }))} /></div>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSaveFaq}>Save</button>
                {editingFaq.id && <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleDeleteFaq(editingFaq.id)}>Delete</button>}
                <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setEditingFaq(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button className={`${s.btn} ${s.btnPrimary}`} style={{ marginBottom: 16 }} onClick={() => setEditingFaq({ id: null, question: '', answer: '' })}>+ New FAQ</button>
              <div className={s.card}><table className={s.table}>
                <thead><tr><th>Question</th><th>Answer (preview)</th><th>Actions</th></tr></thead>
                <tbody>{faq.map(f => (
                  <tr key={f.id}>
                    <td className={s.tableClickable} onClick={() => setEditingFaq({ ...f })}>{f.question}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.answer}</td>
                    <td><button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => setEditingFaq({ ...f })}>Edit</button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </>
          )}
        </div>
      )}

      {/* ── Benefits ── */}
      {tab === 'benefits' && (
        <div>
          {editingBenefit ? (
            <div className={s.card}>
              <div className={s.cardTitle}>{editingBenefit.id ? 'Edit Benefit' : 'New Benefit'}</div>
              <div className={s.formGroup}><label className={s.formLabel}>Name</label><input className={s.formInput} value={editingBenefit.name} onChange={e => setEditingBenefit(p => ({ ...p, name: e.target.value }))} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Description</label><textarea className={s.formTextarea} value={editingBenefit.desc} onChange={e => setEditingBenefit(p => ({ ...p, desc: e.target.value }))} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Icon (clock, cup, people, star, book, briefcase)</label><input className={s.formInput} value={editingBenefit.icon} onChange={e => setEditingBenefit(p => ({ ...p, icon: e.target.value }))} /></div>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSaveBenefit}>Save</button>
                {editingBenefit.id && <button className={`${s.btn} ${s.btnDanger}`} onClick={() => handleDeleteBenefit(editingBenefit.id)}>Delete</button>}
                <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setEditingBenefit(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button className={`${s.btn} ${s.btnPrimary}`} style={{ marginBottom: 16 }} onClick={() => setEditingBenefit({ id: null, name: '', desc: '', icon: 'star' })}>+ New Benefit</button>
              <div className={s.card}><table className={s.table}>
                <thead><tr><th>Name</th><th>Description</th><th>Icon</th><th>Actions</th></tr></thead>
                <tbody>{benefits.map(b => (
                  <tr key={b.id}>
                    <td className={s.tableClickable} onClick={() => setEditingBenefit({ ...b })}>{b.name}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.desc}</td>
                    <td>{b.icon}</td>
                    <td><button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => setEditingBenefit({ ...b })}>Edit</button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </>
          )}
        </div>
      )}

      {/* ── Tiers ── */}
      {tab === 'tiers' && (
        <div>
          {editingTier ? (
            <div className={s.card}>
              <div className={s.cardTitle}>Edit Tier: {editingTier.name}</div>
              <div className={s.formRow}>
                <div className={s.formGroup}><label className={s.formLabel}>Name</label><input className={s.formInput} value={editingTier.name} onChange={e => setEditingTier(p => ({ ...p, name: e.target.value }))} /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Price</label><input className={s.formInput} value={editingTier.price} onChange={e => setEditingTier(p => ({ ...p, price: e.target.value }))} /></div>
              </div>
              <div className={s.formRow}>
                <div className={s.formGroup}><label className={s.formLabel}>Period</label><input className={s.formInput} value={editingTier.period} onChange={e => setEditingTier(p => ({ ...p, period: e.target.value }))} /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Founding Text</label><input className={s.formInput} value={editingTier.foundingText} onChange={e => setEditingTier(p => ({ ...p, foundingText: e.target.value }))} /></div>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Benefits (one per line)</label>
                <textarea className={s.formTextarea} style={{ minHeight: 120 }} value={editingTier.benefits.join('\n')} onChange={e => setEditingTier(p => ({ ...p, benefits: e.target.value.split('\n') }))} />
              </div>
              <div className={s.btnGroup}>
                <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSaveTier}>Save</button>
                <button className={`${s.btn} ${s.btnOutline}`} onClick={() => setEditingTier(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={s.card}><table className={s.table}>
              <thead><tr><th>Tier</th><th>Price</th><th>Period</th><th>Benefits</th><th>Actions</th></tr></thead>
              <tbody>{tiers.map(t => (
                <tr key={t.id}>
                  <td className={s.tableClickable} onClick={() => setEditingTier({ ...t })}><strong>{t.name}</strong></td>
                  <td>{t.price}</td>
                  <td>{t.period}</td>
                  <td>{t.benefits.length} items</td>
                  <td><button className={`${s.btn} ${s.btnOutline} ${s.btnSm}`} onClick={() => setEditingTier({ ...t })}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      )}
    </div>
  )
}
