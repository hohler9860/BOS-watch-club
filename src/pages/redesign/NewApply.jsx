/**
 * NewApply — /redesign/apply
 *
 * Kettle Kids reskin of ApplyPage.
 *
 * ALL backend logic is copied verbatim from src/pages/ApplyPage.jsx:
 *   - QUESTIONS array (field definitions, types, validations)
 *   - BirthdayPicker component (YYYY-MM-DD storage, MM/DD/YYYY display)
 *   - phase / qIndex / answers / fieldValue / email state machine
 *   - transition() animation helper (opacity + translateY)
 *   - handleEmailSubmit, handleContinue, handleBack, handleKeyDown
 *   - handleEditQuestion, handleDoneEditing, handleEditPrev, handleEditNext
 *   - handleSubmit → POST /api/membership { action: 'submit-application' }
 *   - navigate('/') on success (no /redesign/apply/success route exists)
 *
 * Presentation changes only:
 *   - White (#fff) background, black (#000) text
 *   - ABC Marist / Georgia heading font (via NewApply.module.css)
 *   - Clean centered card on a white page
 *   - Module CSS (NewApply.module.css) instead of inline dark-theme styles
 *
 * LINKS: all in-world — /redesign, /redesign/login
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router'
import s from './NewApply.module.css'
import CineButton from '../../components/redesign/CineButton'

// ── Question definitions (verbatim from ApplyPage) ───────────────────────────
const QUESTIONS = [
  { key: 'first_name',         label: 'First name',                                                        type: 'text',        placeholder: 'Jane' },
  { key: 'last_name',          label: 'Last name',                                                         type: 'text',        placeholder: 'Smith' },
  { key: 'birthday',           label: 'When’s your birthday?',                                                type: 'birthday',    placeholder: '' },
  { key: 'phone',              label: 'Phone number',                                                      type: 'tel',         placeholder: '+1 (617) 000-0000' },
  { key: 'instagram',          label: 'Instagram handle',                                                  type: 'text',        placeholder: '@username' },
  { key: 'city',               label: 'What city do you call home?',                                       type: 'text',        placeholder: 'Boston, MA' },
  { key: 'profession',         label: 'What do you do professionally?',                                    type: 'text',        placeholder: 'e.g. Software engineer, Chef…' },
  { key: 'collecting_journey', label: 'Where are you in your collecting journey?',                         type: 'choice',      options: ['Just getting started', 'A few watches in', 'Building a serious collection', 'Veteran collector'] },
  { key: 'current_watch',      label: "What’s on your wrist today, or what’s next on your list?",        type: 'text',        placeholder: 'Your current piece or grail watch…' },
  { key: 'preferred_brands',   label: 'What brands or styles catch your eye?',                             type: 'multichoice', options: ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Richard Mille', 'F.P. Journe', 'A. Lange & Söhne', 'Vacheron Constantin', 'Cartier', 'Omega', 'Tudor', 'Jaeger-LeCoultre', 'IWC', 'Panerai', 'Grand Seiko', 'Gerald Genta', 'Daniel Roth', 'Konstantin Chaykin', 'MB&F', 'Independents', 'Vintage', 'Other'] },
  { key: 'hoping_to_get',      label: 'What are you hoping to get out of BWC?',                           type: 'multichoice', options: ['Community & friendships', 'Events & meetups', 'Buy / sell / trade', 'Learning & education', 'Networking', 'Access to exclusive pieces'] },
  { key: 'other_communities',  label: 'Are you part of any other watch communities or clubs?',             type: 'choice',      options: ['No, this would be my first', 'Yes, online forums / Reddit', 'Yes, Discord / Facebook groups', 'Yes, a local club', 'Yes, multiple communities'] },
  { key: 'hobbies',            label: 'Top 3 interests or hobbies outside of watches',                    type: 'multichoice', maxSelect: 3, options: ['Fitness / Sports', 'Cooking / Food', 'Travel', 'Photography', 'Music', 'Gaming', 'Cars / Motorsport', 'Fashion', 'Art / Design', 'Reading', 'Hiking / Outdoors', 'Tech', 'Other'] },
  { key: 'watch_origin_story', label: 'How did you get into watches, and what was your first piece?',      type: 'textarea',    placeholder: 'Tell us the story…' },
  { key: 'boston_spots',       label: 'Name 2–3 Boston spots you’d love us to host an event at?',        type: 'textarea',    placeholder: 'Restaurants, bars, venues…' },
  { key: 'holiday_destination',label: 'Favorite holiday destination?',                                    type: 'text',        placeholder: 'e.g. Tokyo, Lisbon…' },
  { key: 'heard_about',        label: 'How did you hear about BWC?',                                      type: 'choice',      options: ['Instagram', 'Friend / referral', 'Google search', 'Reddit', 'Facebook', 'TikTok', 'At an event', 'Other'] },
  { key: 'anything_else',      label: 'Anything else you want us to know?',                               type: 'textarea',    placeholder: 'Optional, skip if nothing comes to mind.', optional: true },
]

const TOTAL_STEPS = QUESTIONS.length + 1 // +1 for email step

// ── BirthdayPicker (logic verbatim from ApplyPage, styles via module CSS) ────
function BirthdayPicker({ value, onChange }) {
  const [display, setDisplay] = useState(() => {
    if (!value) return ''
    const [y, m, d] = value.split('-')
    return `${m}/${d}/${y}`
  })

  useEffect(() => {
    if (!value) { setDisplay(''); return }
    const [y, m, d] = value.split('-')
    setDisplay(`${m}/${d}/${y}`)
  }, [value])

  function handleChange(e) {
    let raw = e.target.value.replace(/[^\d]/g, '')
    if (raw.length > 2) raw = raw.slice(0, 2) + '/' + raw.slice(2)
    if (raw.length > 5) raw = raw.slice(0, 5) + '/' + raw.slice(5)
    if (raw.length > 10) raw = raw.slice(0, 10)
    setDisplay(raw)

    const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (match) {
      const [, mm, dd, yyyy] = match
      const month = parseInt(mm, 10)
      const day   = parseInt(dd, 10)
      const year  = parseInt(yyyy, 10)
      const today = new Date()
      const maxYear = today.getFullYear() - 18

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1920 && year <= maxYear) {
        const date = new Date(year, month - 1, day)
        if (date.getMonth() === month - 1 && date.getDate() === day) {
          onChange(`${yyyy}-${mm}-${dd}`)
          return
        }
      }
    }
    if (value) onChange('')
  }

  const today = new Date()
  const maxYear = today.getFullYear() - 18

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="MM/DD/YYYY"
        autoComplete="bday"
        className={s.input}
      />
      <p className={s.birthdayHint}>
        You must be at least 18 years old (born {maxYear} or earlier)
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NewApply() {
  const navigate = useNavigate()

  // ── State (verbatim from ApplyPage) ─────────────────────────────────────
  const [phase, setPhase]                         = useState('email')
  const [qIndex, setQIndex]                       = useState(0)
  const [animOut, setAnimOut]                     = useState(false)
  const nextStateRef                              = useRef(null)
  const [answers, setAnswers]                     = useState({})
  const [fieldValue, setFieldValue]               = useState('')
  const [email, setEmail]                         = useState('')
  const [error, setError]                         = useState('')
  const [submitting, setSubmitting]               = useState(false)
  const [submitError, setSubmitError]             = useState('')
  const [editingFromReview, setEditingFromReview] = useState(false)
  const inputRef                                  = useRef(null)

  // Focus input whenever step changes (verbatim from ApplyPage)
  useEffect(() => {
    if (phase !== 'email' && phase !== 'review') {
      const q = QUESTIONS[qIndex]
      if (q && q.type !== 'choice' && q.type !== 'multichoice') {
        const t = setTimeout(() => inputRef.current?.focus(), 80)
        return () => clearTimeout(t)
      }
    }
  }, [phase, qIndex])

  // Restore saved value when navigating back to a question (verbatim from ApplyPage)
  useEffect(() => {
    if (phase === 'question') {
      const q = QUESTIONS[qIndex]
      setFieldValue(answers[q.key] ?? '')
    }
  }, [phase, qIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Animate out then run the state transition (verbatim from ApplyPage)
  const transition = useCallback((fn) => {
    nextStateRef.current = fn
    setAnimOut(true)
    setTimeout(() => {
      fn()
      setAnimOut(false)
      nextStateRef.current = null
    }, 180)
  }, [])

  // ── Email step handler (verbatim from ApplyPage) ─────────────────────────
  function handleEmailSubmit(e) {
    e.preventDefault()
    const val = email.toLowerCase().trim()
    if (!val) { setError('Please enter your email address.'); return }
    setError('')
    setAnswers(prev => ({ ...prev, email: val }))
    transition(() => {
      setPhase('question')
      setQIndex(0)
    })
  }

  // ── Question step handlers (verbatim from ApplyPage) ─────────────────────
  const currentQuestion = phase === 'question' ? QUESTIONS[qIndex] : null

  function handleContinue() {
    const q = QUESTIONS[qIndex]
    const val = fieldValue.trim()
    if (!val && !q.optional) { setError('Please answer this question before continuing.'); return }
    setError('')

    const updatedAnswers = { ...answers, [q.key]: val }
    setAnswers(updatedAnswers)

    if (qIndex < QUESTIONS.length - 1) {
      transition(() => setQIndex(i => i + 1))
    } else {
      transition(() => setPhase('review'))
    }
  }

  function handleBack() {
    setError('')
    if (phase === 'question') {
      if (qIndex === 0) {
        transition(() => setPhase('email'))
      } else {
        transition(() => setQIndex(i => i - 1))
      }
    } else if (phase === 'review') {
      transition(() => {
        setQIndex(QUESTIONS.length - 1)
        setPhase('question')
      })
    }
  }

  function handleKeyDown(e) {
    if (
      e.key === 'Enter' &&
      currentQuestion?.type !== 'textarea' &&
      currentQuestion?.type !== 'choice' &&
      currentQuestion?.type !== 'multichoice'
    ) {
      e.preventDefault()
      handleContinue()
    }
  }

  // Jump directly to a question from the review screen (verbatim from ApplyPage)
  function handleEditQuestion(index) {
    transition(() => {
      setQIndex(index)
      setPhase('question')
      setEditingFromReview(true)
    })
  }

  // Return to review after editing (verbatim from ApplyPage)
  function handleDoneEditing() {
    const q = QUESTIONS[qIndex]
    const val = fieldValue.trim()
    if (!val && !q.optional) { setError('Please answer this question before continuing.'); return }
    setError('')
    setAnswers(prev => ({ ...prev, [q.key]: val }))
    transition(() => {
      setPhase('review')
      setEditingFromReview(false)
    })
  }

  // Navigate between questions while editing from review (verbatim from ApplyPage)
  function handleEditPrev() {
    const q = QUESTIONS[qIndex]
    const val = fieldValue.trim()
    setAnswers(prev => ({ ...prev, [q.key]: val }))
    if (qIndex === 0) {
      transition(() => setPhase('email'))
    } else {
      transition(() => setQIndex(i => i - 1))
    }
  }

  function handleEditNext() {
    const q = QUESTIONS[qIndex]
    const val = fieldValue.trim()
    setAnswers(prev => ({ ...prev, [q.key]: val }))
    if (qIndex < QUESTIONS.length - 1) {
      transition(() => setQIndex(i => i + 1))
    }
  }

  // ── Submit (verbatim from ApplyPage, redirect updated to /redesign) ──────
  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit-application', ...answers }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Server error ${res.status}`)
      }
      // Show an in-page confirmation instead of bouncing to the homepage scroll.
      window.scrollTo({ top: 0 })
      transition(() => setPhase('success'))
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Progress label (verbatim from ApplyPage) ─────────────────────────────
  const currentStepNumber = phase === 'email' ? 1
    : phase === 'question' ? qIndex + 2
    : TOTAL_STEPS + 1

  const progressLabel = phase === 'review'
    ? 'REVIEW'
    : `${currentStepNumber} OF ${TOTAL_STEPS}`

  // ── Animation style applied inline (timing values verbatim from ApplyPage) ─
  const stepStyle = {
    opacity:   animOut ? 0 : 1,
    transform: animOut ? 'translateY(8px)' : 'translateY(0)',
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={s.page}>
      <Helmet>
        <title>Apply | Boston Watch Club</title>
        <meta name="description" content="Apply to join Boston Watch Club. Members are accepted by application only." />
      </Helmet>

      {/* ── EMAIL STEP ──────────────────────────────────────────────────── */}
      {phase === 'email' && (
        <div className={s.card} style={stepStyle}>
          <h1 className={s.heading}>Apply to Join</h1>
          <p className={s.subheading}>Members are accepted by application only</p>

          <form
            className={s.form}
            onSubmit={editingFromReview ? (e) => {
              e.preventDefault()
              const val = email.toLowerCase().trim()
              if (!val) { setError('Please enter your email address.'); return }
              setError('')
              setAnswers(prev => ({ ...prev, email: val }))
              transition(() => { setPhase('review'); setEditingFromReview(false) })
            } : handleEmailSubmit}
          >
            <div className={s.field}>
              <label className={s.label}>Email</label>
              <input
                type="email"
                className={s.input}
                value={email}
                autoFocus
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {error && <p className={s.error}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <CineButton type="submit" style={{ height: 52 }}>
                {editingFromReview ? 'Done Editing' : 'Continue'}
              </CineButton>
            </div>
          </form>

          {!editingFromReview && (
            <div className={s.linkCluster}>
              <Link to="/login" className={s.ghost}>Go to login</Link>
              <Link to="/" className={s.ghost}>Back to home</Link>
            </div>
          )}
        </div>
      )}

      {/* ── QUESTION STEP ────────────────────────────────────────────────── */}
      {phase === 'question' && currentQuestion && (
        <div className={s.card} style={stepStyle}>
          <p className={s.progress}>{progressLabel}</p>

          <form
            className={s.form}
            onSubmit={e => { e.preventDefault(); handleContinue() }}
          >
            <div className={s.field}>
              <label className={s.label}>{currentQuestion.label.toUpperCase()}</label>

              {currentQuestion.type === 'birthday' ? (
                <BirthdayPicker
                  value={fieldValue}
                  onChange={val => { setFieldValue(val); setError('') }}
                />
              ) : currentQuestion.type === 'choice' ? (
                <div className={s.pillGrid}>
                  {currentQuestion.options.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setFieldValue(opt); setError('') }}
                      className={`${s.pill} ${fieldValue === opt ? s.pillActive : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : currentQuestion.type === 'multichoice' ? (
                <div className={s.pillGrid}>
                  {currentQuestion.options.map(opt => {
                    const selected = fieldValue ? fieldValue.split(' // ').includes(opt) : false
                    const count    = fieldValue ? fieldValue.split(' // ').filter(Boolean).length : 0
                    const atMax    = currentQuestion.maxSelect && count >= currentQuestion.maxSelect && !selected
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={atMax}
                        onClick={() => {
                          setError('')
                          const parts = fieldValue ? fieldValue.split(' // ').filter(Boolean) : []
                          if (selected) {
                            setFieldValue(parts.filter(p => p !== opt).join(' // '))
                          } else {
                            setFieldValue([...parts, opt].join(' // '))
                          }
                        }}
                        className={`${s.pill} ${selected ? s.pillActive : ''} ${atMax ? s.pillDisabled : ''}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                  {currentQuestion.maxSelect && (
                    <p className={s.maxNote}>Select up to {currentQuestion.maxSelect}</p>
                  )}
                </div>
              ) : currentQuestion.type === 'textarea' ? (
                <>
                  <textarea
                    ref={inputRef}
                    className={s.textarea}
                    rows={4}
                    value={fieldValue}
                    onChange={e => {
                      const words = e.target.value.trim().split(/\s+/).filter(Boolean)
                      if (words.length > 30) return
                      setFieldValue(e.target.value)
                      setError('')
                    }}
                    placeholder={currentQuestion.placeholder}
                  />
                  <p className={s.wordCount}>
                    {fieldValue.trim() ? fieldValue.trim().split(/\s+/).filter(Boolean).length : 0} / 30 words
                  </p>
                </>
              ) : (
                <input
                  ref={inputRef}
                  type={currentQuestion.type}
                  className={s.input}
                  value={fieldValue}
                  onChange={e => { setFieldValue(e.target.value); setError('') }}
                  onKeyDown={handleKeyDown}
                  placeholder={currentQuestion.placeholder}
                  autoComplete="off"
                />
              )}
            </div>

            {currentQuestion.optional && (
              <p className={s.optionalNote}>Optional</p>
            )}

            {error && <p className={s.error}>{error}</p>}

            {editingFromReview ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                  <CineButton type="button" style={{ height: 52 }} onClick={handleDoneEditing}>
                    Done Editing
                  </CineButton>
                </div>
                <div className={s.editNav}>
                  <button
                    type="button"
                    className={s.ghost}
                    onClick={handleEditPrev}
                  >
                    {qIndex === 0 ? '← Edit email' : '← Prev'}
                  </button>
                  <button
                    type="button"
                    className={s.ghost}
                    onClick={handleEditNext}
                    disabled={qIndex === QUESTIONS.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <CineButton type="submit" style={{ height: 52 }}>
                  {qIndex < QUESTIONS.length - 1 ? 'Continue' : 'Review My Application'}
                </CineButton>
              </div>
            )}
          </form>

          {!editingFromReview && (
            <div className={s.backRow}>
              <button type="button" className={s.ghost} onClick={handleBack}>
                {qIndex === 0 ? '← Change email' : '← Back'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── REVIEW STEP ──────────────────────────────────────────────────── */}
      {phase === 'review' && (
        <div className={s.cardWide} style={stepStyle}>
          <p className={s.progress} style={{ textAlign: 'center' }}>Review Your Application</p>
          <p className={s.reviewNote}>Click any answer to go back and edit it.</p>

          {/* Email row */}
          <div
            className={s.reviewRow}
            role="button"
            tabIndex={0}
            onClick={() => transition(() => { setPhase('email'); setEditingFromReview(true) })}
            onKeyDown={e => e.key === 'Enter' && transition(() => { setPhase('email'); setEditingFromReview(true) })}
          >
            <p className={s.reviewLabel}>Email</p>
            <p className={s.reviewValue}>{answers.email || <em style={{ opacity: 0.4 }}>--</em>}</p>
            <p className={s.reviewHint}>Click to edit</p>
          </div>

          {/* Question rows */}
          {QUESTIONS.map((q, i) => (
            <div
              key={q.key}
              className={s.reviewRow}
              style={i === QUESTIONS.length - 1 ? { borderBottom: 'none' } : undefined}
              role="button"
              tabIndex={0}
              onClick={() => handleEditQuestion(i)}
              onKeyDown={e => e.key === 'Enter' && handleEditQuestion(i)}
            >
              <p className={s.reviewLabel}>{q.label.toUpperCase()}</p>
              <p className={s.reviewValue}>
                {answers[q.key]
                  ? answers[q.key]
                  : <em style={{ opacity: 0.4 }}>{q.optional ? 'Skipped' : 'Not answered'}</em>
                }
              </p>
              <p className={s.reviewHint}>Click to edit</p>
            </div>
          ))}

          {submitError && (
            <p className={s.error} style={{ marginTop: 16, textAlign: 'center' }}>{submitError}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
            <CineButton
              type="button"
              style={{ height: 52 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </CineButton>
          </div>

          <div className={s.reviewActions}>
            <button
              type="button"
              className={s.ghost}
              onClick={() => handleEditQuestion(0)}
            >
              Edit answers
            </button>
          </div>
        </div>
      )}

      {/* ── SUCCESS STEP ─────────────────────────────────────────────────── */}
      {phase === 'success' && (
        <div className={s.card} style={stepStyle}>
          <p className={s.progress} style={{ textAlign: 'center' }}>Application Received</p>
          <h1 className={s.heading}>Thank You</h1>
          <p className={s.subheading}>
            Your application to Boston Watch Club is in. We review every one by hand and
            will reach out by email{answers.email ? ` at ${answers.email}` : ''} once we have
            looked it over. Keep an eye on your inbox.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <CineButton type="button" style={{ height: 52 }} onClick={() => navigate('/')}>
              Back to Home
            </CineButton>
          </div>
        </div>
      )}
    </div>
  )
}
