/**
 * Generates "Add to Calendar" links for various providers.
 *
 * Expects event objects shaped like:
 *   { name, date: "March 21, 2026", time: "7:00 PM – 10:30 PM", venue, description }
 */

function parseEventDateTime(dateStr, timeStr) {
  // dateStr: "March 21, 2026"
  // timeStr: "7:00 PM – 10:30 PM"
  const parts = timeStr.split(/\s*[–-]\s*/)
  const startTime = parts[0].trim()
  const endTime = parts[1]?.trim() || startTime

  const start = new Date(`${dateStr} ${startTime}`)
  const end = new Date(`${dateStr} ${endTime}`)

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
  const { start, end } = parseEventDateTime(event.date, event.time)
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
  const { start, end } = parseEventDateTime(event.date, event.time)
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
  const { start, end } = parseEventDateTime(event.date, event.time)
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
  const { start, end } = parseEventDateTime(event.date, event.time)
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
