import { useState } from 'react'
import { ADMIN_SITE_CONTENT, ADMIN_FAQ_ITEMS, ADMIN_BENEFITS, ADMIN_TIERS } from '../../data/adminData'
import s from '../admin.module.css'

export default function AdminSiteContent() {
  const [tab, setTab] = useState('text') // text | faq | benefits | tiers
  const [siteContent, setSiteContent] = useState(ADMIN_SITE_CONTENT)
  const [faq, setFaq] = useState(ADMIN_FAQ_ITEMS)
  const [benefits, setBenefits] = useState(ADMIN_BENEFITS)
  const [tiers, setTiers] = useState(ADMIN_TIERS)
  const [editingFaq, setEditingFaq] = useState(null)
  const [editingBenefit, setEditingBenefit] = useState(null)
  const [editingTier, setEditingTier] = useState(null)
  const [saved, setSaved] = useState(false)

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

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

  return (
    <div>
      <h1 className={s.pageTitle}>Site Content</h1>
      <p className={s.pageSubtitle}>Manage all text, FAQ, benefits, and tier descriptions visible to members. {saved && <span style={{ color: '#059669', fontWeight: 600 }}>Saved!</span>}</p>

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
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={flash}>Save All Text{/* TODO: Save to Supabase site_content table */}</button>
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
                <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => {
                  if (editingFaq.id) { setFaq(prev => prev.map(f => f.id === editingFaq.id ? editingFaq : f)) }
                  else { setFaq(prev => [...prev, { ...editingFaq, id: Date.now() }]) }
                  setEditingFaq(null); flash()
                }}>Save</button>
                {editingFaq.id && <button className={`${s.btn} ${s.btnDanger}`} onClick={() => { setFaq(prev => prev.filter(f => f.id !== editingFaq.id)); setEditingFaq(null) }}>Delete</button>}
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
                <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => {
                  if (editingBenefit.id) { setBenefits(prev => prev.map(b => b.id === editingBenefit.id ? editingBenefit : b)) }
                  else { setBenefits(prev => [...prev, { ...editingBenefit, id: Date.now() }]) }
                  setEditingBenefit(null); flash()
                }}>Save</button>
                {editingBenefit.id && <button className={`${s.btn} ${s.btnDanger}`} onClick={() => { setBenefits(prev => prev.filter(b => b.id !== editingBenefit.id)); setEditingBenefit(null) }}>Delete</button>}
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
                <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => { setTiers(prev => prev.map(t => t.id === editingTier.id ? editingTier : t)); setEditingTier(null); flash() }}>Save</button>
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
