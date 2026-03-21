/**
 * Generates "Add to Calendar" links for various providers.
 *
 * Uses event.datetime (ISO timestamptz) as the primary source.
 * Falls back to parsing event.date + event.time display strings.
 */

function parseEventDateTime(event) {
  let start, end

  if (event.datetime) {
    start = new Date(event.datetime)
  }

  // Try parsing time range for end time (and start if no datetime)
  const timeStr = event.time || ''
  const parts = timeStr.split(/\s*[—–\-]\s*/)
  const startTimeStr = parts[0]?.trim()
  const endTimeStr = parts[1]?.trim()

  if (!start || isNaN(start.getTime())) {
    // Fallback: parse from display strings
    const dateStr = event.date || ''
    start = new Date(`${dateStr} ${startTimeStr || '12:00 PM'}`)
  }

  if (endTimeStr && event.date) {
    end = new Date(`${event.date} ${endTimeStr}`)
    // If end parsed as Invalid Date, fall back
    if (isNaN(end.getTime())) end = null
  } else if (endTimeStr && event.datetime) {
    // Build end date from the same calendar day as start + end time
    const dateOnly = start.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    end = new Date(`${dateOnly} ${endTimeStr}`)
    if (isNaN(end.getTime())) end = null
  }

  // Default: 3 hours after start
  if (!end || isNaN(end.getTime())) {
    end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
  }

  // If end is before start (shouldn't happen, but guard)
  if (end < start) {
    end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
  }

  return { start, end }
}

function toGoogleDateStr(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function toOutlookDateStr(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00')
}

function toYahooDateStr(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function toICSDateStr(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function getGoogleCalendarUrl(event) {
  const { start, end } = parseEventDateTime(event)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${toGoogleDateStr(start)}/${toGoogleDateStr(end)}`,
    details: event.description || event.tagline || '',
    location: event.venue || '',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export function getOutlookCalendarUrl(event) {
  const { start, end } = parseEventDateTime(event)
  const params = new URLSearchParams({
    rru: 'addevent',
    subject: event.name,
    startdt: toOutlookDateStr(start),
    enddt: toOutlookDateStr(end),
    body: event.description || event.tagline || '',
    location: event.venue || '',
    path: '/calendar/action/compose',
  })
  return `https://outlook.live.com/calendar/0/action/compose?${params}`
}

export function getYahooCalendarUrl(event) {
  const { start, end } = parseEventDateTime(event)
  const params = new URLSearchParams({
    v: '60',
    title: event.name,
    st: toYahooDateStr(start),
    et: toYahooDateStr(end),
    desc: event.description || event.tagline || '',
    in_loc: event.venue || '',
  })
  return `https://calendar.yahoo.com/?${params}`
}

export function downloadICSFile(event) {
  const { start, end } = parseEventDateTime(event)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BOS Watch Club//Event//EN',
    'BEGIN:VEVENT',
    `DTSTART:${toICSDateStr(start)}`,
    `DTEND:${toICSDateStr(end)}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${(event.description || event.tagline || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.venue || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${event.id || 'event'}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
