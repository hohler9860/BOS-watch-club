import { useState, useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router'
import FadeIn from '../components/shared/FadeIn'
import s from './LoginPage.module.css'

// Question definitions — index 0 is the email step handled separately
const QUESTIONS = [
  { key: 'first_name',      label: 'First name',                                                          type: 'text',     placeholder: 'Jane' },
  { key: 'last_name',       label: 'Last name',                                                           type: 'text',     placeholder: 'Smith' },
  { key: 'birthday',        label: 'When\u2019s your birthday?',                                                   type: 'birthday',  placeholder: '' },
  { key: 'phone',           label: 'Phone number',                                                        type: 'tel',      placeholder: '+1 (617) 000-0000' },
  { key: 'instagram',       label: 'Instagram handle',                                                    type: 'text',     placeholder: '@username' },
  { key: 'city',            label: 'What city do you call home?',                                         type: 'text',     placeholder: 'Boston, MA' },
  { key: 'profession',      label: 'What do you do professionally?',                                      type: 'text',     placeholder: 'e.g. Software engineer, Chef…' },
  { key: 'collecting_journey',  label: 'Where are you in your collecting journey?',                       type: 'choice',   options: ['Just getting started', 'A few watches in', 'Building a serious collection', 'Veteran collector'] },
  { key: 'current_watch',      label: "What's on your wrist today, or what's next on your list?",        type: 'text',     placeholder: 'Your current piece or grail watch…' },
  { key: 'preferred_brands',   label: 'What brands or styles catch your eye?',                           type: 'multichoice', options: ['Rolex', 'Omega', 'Tudor', 'Grand Seiko', 'Cartier', 'JLC', 'IWC', 'Panerai', 'AP', 'Patek Philippe', 'Seiko', 'Casio / G-Shock', 'Microbrands', 'Vintage', 'Other'] },
  { key: 'hoping_to_get',      label: 'What are you hoping to get out of BWC?',                         type: 'multichoice', options: ['Community & friendships', 'Events & meetups', 'Buy / sell / trade', 'Learning & education', 'Networking', 'Access to exclusive pieces'] },
  { key: 'other_communities',  label: 'Are you part of any other watch communities or clubs?',           type: 'choice',   options: ['No, this would be my first', 'Yes, online forums / Reddit', 'Yes, Discord / Facebook groups', 'Yes, a local club', 'Yes, multiple communities'] },
  { key: 'hobbies',            label: 'Top 3 interests or hobbies outside of watches',                  type: 'multichoice', maxSelect: 3, options: ['Fitness / Sports', 'Cooking / Food', 'Travel', 'Photography', 'Music', 'Gaming', 'Cars / Motorsport', 'Fashion', 'Art / Design', 'Reading', 'Hiking / Outdoors', 'Tech', 'Other'] },
  { key: 'watch_origin_story', label: 'How did you get into watches, and what was your first piece?',    type: 'textarea', placeholder: 'Tell us the story…' },
  { key: 'boston_spots',        label: "Name 2–3 Boston spots you'd love us to host an event at?",       type: 'textarea', placeholder: 'Restaurants, bars, venues…' },
  { key: 'holiday_destination', label: 'Favorite holiday destination?',                                  type: 'text',     placeholder: 'e.g. Tokyo, Lisbon…' },
  { key: 'heard_about',        label: 'How did you hear about BWC?',                                    type: 'choice',   options: ['Instagram', 'Friend / referral', 'Google search', 'Reddit', 'Facebook', 'TikTok', 'At an event', 'Other'] },
  { key: 'anything_else',      label: 'Anything else you want us to know?',                             type: 'textarea', placeholder: 'Optional — skip if nothing comes to mind.', optional: true },
]

const TOTAL_STEPS = QUESTIONS.length + 1 // +1 for email

function BirthdayPicker({ value, onChange }) {
  // value is stored as YYYY-MM-DD, display as MM/DD/YYYY
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
      const day = parseInt(dd, 10)
      const year = parseInt(yyyy, 10)
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
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(232, 236, 240, 0.04)',
          border: '1px solid rgba(232, 236, 240, 0.08)',
          borderRadius: 10,
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 400,
          color: '#E8ECF0',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.3s ease, background 0.3s ease',
          letterSpacing: '0.05em',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(184, 196, 212, 0.35)'
          e.target.style.background = 'rgba(232, 236, 240, 0.06)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(232, 236, 240, 0.08)'
          e.target.style.background = 'rgba(232, 236, 240, 0.04)'
        }}
      />
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(232, 236, 240, 0.3)', marginTop: 8, textAlign: 'left' }}>
        You must be at least 18 years old (born {maxYear} or earlier)
      </p>
    </div>
  )
}

// Inline styles shared across question steps
const progressStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.18em',
  color: 'rgba(232, 236, 240, 0.28)',
  marginBottom: 24,
  textTransform: 'uppercase',
}

const reviewLabelStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.18em',
  color: 'rgba(232, 236, 240, 0.35)',
  textTransform: 'uppercase',
  marginBottom: 3,
}

const reviewValueStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: '#E8ECF0',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
}

const reviewRowStyle = {
  textAlign: 'left',
  padding: '10px 0',
  borderBottom: '1px solid rgba(232, 236, 240, 0.06)',
  cursor: 'pointer',
}

const reviewEditHintStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  letterSpacing: '0.12em',
  color: 'rgba(232, 236, 240, 0.2)',
  marginTop: 2,
}

const choiceGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  justifyContent: 'center',
}

const choiceBtnBase = {
  padding: '10px 18px',
  background: 'rgba(232, 236, 240, 0.04)',
  border: '1px solid rgba(232, 236, 240, 0.10)',
  borderRadius: 10,
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 400,
  color: 'rgba(232, 236, 240, 0.7)',
  cursor: 'pointer',
  transition: 'all 0.18s ease',
  outline: 'none',
  lineHeight: 1.4,
}

const choiceBtnSelected = {
  ...choiceBtnBase,
  background: 'rgba(232, 236, 240, 0.12)',
  border: '1px solid rgba(232, 236, 240, 0.30)',
  color: '#E8ECF0',
  fontWeight: 500,
}

export default function ApplyPage() {
  const navigate = useNavigate()

  // 'email' | 'question' | 'review'
  const [phase, setPhase] = useState('email')

  // Current question index within QUESTIONS (0-based)
  const [qIndex, setQIndex] = useState(0)

  // Whether the current step is animating out
  const [animOut, setAnimOut] = useState(false)

  // Pending next state after animation
  const nextStateRef = useRef(null)

  // All collected answers
  const [answers, setAnswers] = useState({})

  // The value being typed in the current field
  const [fieldValue, setFieldValue] = useState('')

  // Email field value (kept separate for the entry step)
  const [email, setEmail] = useState('')

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [editingFromReview, setEditingFromReview] = useState(false)

  const inputRef = useRef(null)

  // Focus the input whenever the step changes
  useEffect(() => {
    if (phase !== 'email' && phase !== 'review') {
      const q = QUESTIONS[qIndex]
      if (q && q.type !== 'choice' && q.type !== 'multichoice') {
        // Small delay so the fade-in doesn't fight with focus
        const t = setTimeout(() => inputRef.current?.focus(), 80)
        return () => clearTimeout(t)
      }
    }
  }, [phase, qIndex])

  // Restore saved value when navigating back to a question
  useEffect(() => {
    if (phase === 'question') {
      const q = QUESTIONS[qIndex]
      setFieldValue(answers[q.key] ?? '')
    }
  }, [phase, qIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Animate out then run the state transition
  const transition = useCallback((fn) => {
    nextStateRef.current = fn
    setAnimOut(true)
    setTimeout(() => {
      fn()
      setAnimOut(false)
      nextStateRef.current = null
    }, 180)
  }, [])

  // ── Email step ───────────────────────────────────────────────────────────────

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

  // ── Question step ────────────────────────────────────────────────────────────

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
    if (e.key === 'Enter' && currentQuestion?.type !== 'textarea' && currentQuestion?.type !== 'choice' && currentQuestion?.type !== 'multichoice') {
      e.preventDefault()
      handleContinue()
    }
  }

  // Jump directly to a question from the review screen
  function handleEditQuestion(index) {
    transition(() => {
      setQIndex(index)
      setPhase('question')
      setEditingFromReview(true)
    })
  }

  // Return to review after editing
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

  // Navigate between questions while editing from review
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

  // ── Submit ───────────────────────────────────────────────────────────────────

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
      navigate('/apply/success')
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Progress label ───────────────────────────────────────────────────────────

  // Email = step 1, questions = steps 2…N, review = after N
  const currentStepNumber = phase === 'email' ? 1
    : phase === 'question' ? qIndex + 2
    : TOTAL_STEPS + 1

  const progressLabel = phase === 'review'
    ? `REVIEW`
    : `${currentStepNumber} OF ${TOTAL_STEPS}`

  // ── Shared animation wrapper ─────────────────────────────────────────────────

  const stepStyle = {
    transition: 'opacity 0.18s ease, transform 0.18s ease',
    opacity: animOut ? 0 : 1,
    transform: animOut ? 'translateY(8px)' : 'translateY(0)',
  }

  // ── Textarea style (mirrors .input) ─────────────────────────────────────────

  const textareaStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(232, 236, 240, 0.04)',
    border: '1px solid rgba(232, 236, 240, 0.08)',
    borderRadius: 10,
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    fontWeight: 400,
    color: '#E8ECF0',
    outline: 'none',
    resize: 'vertical',
    minHeight: 96,
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, background 0.3s ease',
    lineHeight: 1.6,
  }

  return (
    <section className={s.page}>
      <Helmet>
        <title>Apply — BOS Watch Club</title>
        <meta name="description" content="Apply to join Boston Watch Club. Members are accepted by application only." />
      </Helmet>
      <FadeIn>
        {/* ── EMAIL STEP ─────────────────────────────────────────────────── */}
        {phase === 'email' && (
          <div className={s.card} style={stepStyle}>
            <div className={s.logoMark}>
              <img src={`${import.meta.env.BASE_URL}assets/icon.png`} alt="" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              <h1 className={s.title} style={{ marginBottom: 0 }}>APPLY TO JOIN</h1>
              <div className={s.tooltip}>
                <span className={s.tooltipIcon} style={{ fontSize: 14 }}>&#9432;</span>
                <span className={s.tooltipText}>
                  Enter your email below to begin your membership application. You&apos;ll answer a few short questions — takes about 5 minutes.
                </span>
              </div>
            </div>
            <p className={s.subtitle}>MEMBERS ARE ACCEPTED BY APPLICATION ONLY</p>

            <form onSubmit={editingFromReview ? (e) => {
              e.preventDefault()
              const val = email.toLowerCase().trim()
              if (!val) { setError('Please enter your email address.'); return }
              setError('')
              setAnswers(prev => ({ ...prev, email: val }))
              transition(() => { setPhase('review'); setEditingFromReview(false) })
            } : handleEmailSubmit} className={s.form}>
              <div className={s.field}>
                <label className={s.label}>EMAIL</label>
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
              <button type="submit" className={s.submit}>
                {editingFromReview ? 'DONE EDITING' : 'CONTINUE'}
              </button>
            </form>

            {!editingFromReview && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 16 }}>
                <Link to="/login?step=email" className={s.back}>Go to login</Link>
                <Link to="/" className={s.back}>Back to home</Link>
              </div>
            )}
          </div>
        )}

        {/* ── QUESTION STEP ──────────────────────────────────────────────── */}
        {phase === 'question' && currentQuestion && (
          <div className={s.card} style={stepStyle}>
            <p style={progressStyle}>{progressLabel}</p>

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
                  <div style={choiceGridStyle}>
                    {currentQuestion.options.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setFieldValue(opt); setError('') }}
                        style={fieldValue === opt ? choiceBtnSelected : choiceBtnBase}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : currentQuestion.type === 'multichoice' ? (
                  <div style={choiceGridStyle}>
                    {currentQuestion.options.map(opt => {
                      const selected = fieldValue ? fieldValue.split(' // ').includes(opt) : false
                      const count = fieldValue ? fieldValue.split(' // ').filter(Boolean).length : 0
                      const atMax = currentQuestion.maxSelect && count >= currentQuestion.maxSelect && !selected
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
                          style={{
                            ...(selected ? choiceBtnSelected : choiceBtnBase),
                            ...(atMax ? { opacity: 0.3, cursor: 'not-allowed' } : {}),
                          }}
                        >
                          {opt}
                        </button>
                      )
                    })}
                    {currentQuestion.maxSelect && (
                      <p style={{ width: '100%', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(232, 236, 240, 0.25)', marginTop: 4, textAlign: 'center' }}>
                        Select up to {currentQuestion.maxSelect}
                      </p>
                    )}
                  </div>
                ) : currentQuestion.type === 'textarea' ? (
                  <textarea
                    ref={inputRef}
                    style={textareaStyle}
                    rows={4}
                    value={fieldValue}
                    onChange={e => { setFieldValue(e.target.value); setError('') }}
                    placeholder={currentQuestion.placeholder}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(184, 196, 212, 0.35)'
                      e.target.style.background = 'rgba(232, 236, 240, 0.06)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(232, 236, 240, 0.08)'
                      e.target.style.background = 'rgba(232, 236, 240, 0.04)'
                    }}
                  />
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
                <p style={{ ...reviewLabelStyle, marginTop: -4, textAlign: 'left' }}>OPTIONAL</p>
              )}

              {error && <p className={s.error}>{error}</p>}

              {editingFromReview ? (
                <>
                  <button type="button" className={s.submit} onClick={handleDoneEditing}>
                    DONE EDITING
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
                    <button
                      type="button"
                      className={s.back}
                      onClick={handleEditPrev}
                    >
                      {qIndex === 0 ? '← Edit email' : '← Prev'}
                    </button>
                    <button
                      type="button"
                      className={s.back}
                      onClick={handleEditNext}
                      disabled={qIndex === QUESTIONS.length - 1}
                      style={{ opacity: qIndex === QUESTIONS.length - 1 ? 0.3 : 1 }}
                    >
                      Next →
                    </button>
                  </div>
                </>
              ) : (
                <button type="submit" className={s.submit}>
                  {qIndex < QUESTIONS.length - 1 ? 'CONTINUE' : 'REVIEW MY APPLICATION'}
                </button>
              )}
            </form>

            {!editingFromReview && (
              <button type="button" className={s.back} onClick={handleBack} style={{ marginTop: 14 }}>
                {qIndex === 0 ? '← Change email' : '← Back'}
              </button>
            )}
          </div>
        )}

        {/* ── REVIEW STEP ────────────────────────────────────────────────── */}
        {phase === 'review' && (
          <div
            className={s.card}
            style={{ ...stepStyle, maxWidth: 560, textAlign: 'left' }}
          >
            <p style={{ ...progressStyle, textAlign: 'center' }}>REVIEW YOUR APPLICATION</p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'rgba(232, 236, 240, 0.35)',
              marginBottom: 20,
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              Click any answer to go back and edit it.
            </p>

            {/* Email row */}
            <div
              style={reviewRowStyle}
              role="button"
              tabIndex={0}
              onClick={() => transition(() => { setPhase('email'); setEditingFromReview(true) })}
              onKeyDown={e => e.key === 'Enter' && transition(() => { setPhase('email'); setEditingFromReview(true) })}
            >
              <p style={reviewLabelStyle}>EMAIL</p>
              <p style={reviewValueStyle}>{answers.email || <em style={{ opacity: 0.3 }}>--</em>}</p>
              <p style={reviewEditHintStyle}>CLICK TO EDIT</p>
            </div>

            {/* Question rows */}
            {QUESTIONS.map((q, i) => (
              <div
                key={q.key}
                style={{
                  ...reviewRowStyle,
                  borderBottom: i === QUESTIONS.length - 1 ? 'none' : reviewRowStyle.borderBottom,
                }}
                role="button"
                tabIndex={0}
                onClick={() => handleEditQuestion(i)}
                onKeyDown={e => e.key === 'Enter' && handleEditQuestion(i)}
              >
                <p style={reviewLabelStyle}>{q.label.toUpperCase()}</p>
                <p style={reviewValueStyle}>
                  {answers[q.key]
                    ? answers[q.key]
                    : <em style={{ opacity: 0.3 }}>{q.optional ? 'Skipped' : '—'}</em>
                  }
                </p>
                <p style={reviewEditHintStyle}>CLICK TO EDIT</p>
              </div>
            ))}

            {submitError && (
              <p className={s.error} style={{ marginTop: 16, textAlign: 'center' }}>{submitError}</p>
            )}

            <button
              type="button"
              className={s.submit}
              style={{ marginTop: 24 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button type="button" className={s.back} onClick={() => handleEditQuestion(0)} style={{ marginTop: 14 }}>
                Edit answers
              </button>
            </div>
          </div>
        )}
      </FadeIn>
    </section>
  )
}
