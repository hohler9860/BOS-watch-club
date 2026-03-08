import { useState, useRef, useEffect } from 'react'
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getYahooCalendarUrl,
  downloadICSFile,
} from '../../utils/calendar'
import s from './AddToCalendar.module.css'

const PROVIDERS = [
  {
    key: 'google',
    label: 'Google Calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 2v4M8 2v4M4 10h16" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="15" r="1.5" fill="#4285F4" />
      </svg>
    ),
  },
  {
    key: 'apple',
    label: 'Apple Calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 2v4M8 2v4M4 10h16" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'outlook',
    label: 'Outlook',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 2v4M8 2v4M4 10h16" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="15" r="1.5" fill="#0078D4" />
      </svg>
    ),
  },
  {
    key: 'yahoo',
    label: 'Yahoo Calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 2v4M8 2v4M4 10h16" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="15" r="1.5" fill="#6001D2" />
      </svg>
    ),
  },
]

export default function AddToCalendar({ event }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleSelect(key) {
    setOpen(false)
    if (key === 'apple') {
      downloadICSFile(event)
    } else if (key === 'google') {
      window.open(getGoogleCalendarUrl(event), '_blank', 'noopener')
    } else if (key === 'outlook') {
      window.open(getOutlookCalendarUrl(event), '_blank', 'noopener')
    } else if (key === 'yahoo') {
      window.open(getYahooCalendarUrl(event), '_blank', 'noopener')
    }
  }

  return (
    <div className={s.wrapper} ref={ref}>
      <button
        type="button"
        className={s.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
        <span>Add to Calendar</span>
      </button>

      {open && (
        <ul className={s.dropdown} role="listbox">
          {PROVIDERS.map((p) => (
            <li key={p.key}>
              <button
                type="button"
                className={s.option}
                onClick={() => handleSelect(p.key)}
                role="option"
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
