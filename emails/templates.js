/*
 * BWC email system — built to read like the site.
 * Language: cream #FBFAF4, hairline rules, mono uppercase labels (Courier as
 * the email-safe stand-in for Departure Mono), massive bold uppercase
 * headlines (Helvetica as the stand-in for TikTok Sans wide), corner tag
 * chips like the work-grid cards, spec-sheet rows, black code panel, and the
 * coordinates + moonphase readout in the footer.
 * All exports return HTML strings; signatures match the API callers.
 */

const SITE = process.env.SITE_URL || 'https://boswatchclub.com'

// v4 "agency monotone": pure white page, pure black type, grey whispers
const C = {
  bg: '#FFFFFF',
  ink: '#000000',
  body: '#111111',
  faint: '#999999',
  line: '#E8E8E8',
  whisper: '#B3B3B3',
  cream: '#FFFFFF',
}
// three live-recorded sky animations; each send deals a different one
const heroGif = () => `${SITE}/brand/email-hero-${1 + Math.floor(Math.random() * 3)}c.gif`
const F = {
  display: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  body: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'Courier New', Courier, monospace",
}

// ---- shared pieces ---------------------------------------------------------

function moonline() {
  const SYNODIC = 29.530588853
  const days = (Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC
  const name =
    age < 1.85 ? 'NEW MOON'
    : age < 5.54 ? 'WAXING CRESCENT'
    : age < 9.23 ? 'FIRST QUARTER'
    : age < 12.92 ? 'WAXING GIBBOUS'
    : age < 16.61 ? 'FULL MOON'
    : age < 20.3 ? 'WANING GIBBOUS'
    : age < 23.99 ? 'LAST QUARTER'
    : age < 27.68 ? 'WANING CRESCENT'
    : 'NEW MOON'
  const date = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short', day: '2-digit' })
    .format(new Date())
    .toUpperCase()
  return `${name} · ${date}`
}

const mono = (t, size = 10, color = C.faint, spacing = 2) =>
  `<span style="font-family:${F.mono};font-size:${size}px;color:${color};letter-spacing:${spacing}px;text-transform:uppercase;">${t}</span>`

// corner tag chip — the work-card tag, black on cream
function tagRow(tag) {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td align="left" style="vertical-align:middle;">${mono('BOSTON WATCH CLUB', 9, C.faint, 2.5)}</td>
    <td align="right"><span style="display:inline-block;background-color:${C.ink};color:${C.cream};font-family:${F.mono};font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:5px 10px;">${tag}</span></td>
  </tr></table>`
}

const h1 = (text) =>
  `<h1 style="font-family:${F.display};color:${C.ink};font-size:34px;font-weight:800;letter-spacing:-0.3px;line-height:1.02;text-transform:uppercase;text-align:center;margin:16px 0 16px 0;">${text}</h1>`

const p = (text, opts = {}) =>
  `<p style="font-family:${F.mono};color:${opts.color ?? C.body};font-size:${opts.size ?? 11}px;line-height:1.9;letter-spacing:0.5px;text-transform:uppercase;text-align:center;margin:0 auto 20px auto;max-width:46ch;">${text}</p>`

// spec-sheet rows: hairline-ruled, mono label left / bold value right
function specs(rows) {
  const tr = rows
    .filter((r) => r.value)
    .map(
      (r) => `<tr>
        <td style="border-top:1px solid ${C.line};padding:12px 0;white-space:nowrap;">${mono(r.label, 10, C.faint, 2)}</td>
        <td align="right" style="border-top:1px solid ${C.line};padding:12px 0;font-family:${F.body};color:${C.ink};font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;">${r.value}</td>
      </tr>`,
    )
    .join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 26px 0;border-bottom:1px solid ${C.line};">${tr}</table>`
}

// benefits / bullet list, mono-plus markers
function list(items) {
  const tr = items
    .map(
      (t) => `<tr><td style="padding:7px 0;border-top:1px solid ${C.line};">
        <span style="font-family:${F.mono};color:${C.faint};font-size:11px;">+&nbsp;&nbsp;</span>
        <span style="font-family:${F.body};color:${C.ink};font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">${t}</span>
      </td></tr>`,
    )
    .join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 26px 0;border-bottom:1px solid ${C.line};">${tr}</table>`
}

// access code: solid ink panel, cream mono code
function codePanel(code) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 30px 0;"><tr>
    <td align="center" style="border-top:1px solid ${C.line};border-bottom:1px solid ${C.line};padding:26px 10px;">
      <p style="margin:0 0 12px 0;">${mono('YOUR ACCESS CODE', 9, C.faint, 4)}</p>
      <p class="bwc-code" style="font-family:${F.mono};color:${C.ink};font-size:30px;letter-spacing:9px;font-weight:700;margin:0;">${code}</p>
    </td>
  </tr></table>`
}

function button(text, href) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 8px 0;"><tr>
    <td align="center"><a href="${href}" style="display:inline-block;background-color:${C.ink};color:#FFFFFF;font-family:${F.mono};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:17px 42px;border-radius:999px;text-decoration:none;">${text}</a></td>
  </tr></table>`
}

function layout({ preview = '', tag = 'THE CLUB', content, footerNote = "You received this because you're part of boswatchclub.com" }) {
  return `<!DOCTYPE html>
<html lang="en" style="color-scheme:light only;">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <style>
    :root { color-scheme: light only; }
    body { margin:0; padding:0; background-color:${C.bg}; }
    a { text-decoration:none; }
    @media only screen and (max-width: 480px) {
      h1 { font-size: 27px !important; }
      .bwc-code { font-size: 24px !important; letter-spacing: 6px !important; }
      .bwc-pad { padding-left: 16px !important; padding-right: 16px !important; }
    }
  </style>
  <!--[if mso]><style>body, table, td { background-color:${C.bg} !important; }</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${C.bg};">
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};" bgcolor="${C.bg}">
    <tr><td align="center" style="padding:0 0 64px;">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

        <!-- sky from the very top: live-recorded animation, wordmark inside,
             one long fade into the white page (first frame carries the look
             for clients that freeze GIFs) -->
        <tr><td style="padding:0;">
          <a href="${SITE}"><img src="${heroGif()}" alt="Boston Watch Club" width="640" style="display:block;width:100%;max-width:640px;height:auto;" /></a>
        </td></tr>

        <tr><td align="center" class="bwc-pad" style="padding:0 24px;">
          <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;"><tr><td align="center">

          <!-- eyebrow -->
          <p style="margin:4px 0 0 0;">${mono(tag, 10, C.body, 4)}</p>

          <!-- content -->
          ${content}

          <!-- footer -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:56px;"><tr><td align="center">
            <p style="margin:0 0 10px 0;white-space:normal;">
              <a href="https://www.instagram.com/boswatchclub" style="font-family:${F.mono};font-size:10px;letter-spacing:1.5px;color:${C.ink};">INSTAGRAM</a>
              <span style="font-family:${F.mono};font-size:10px;color:${C.whisper};"> · </span>
              <a href="mailto:boswatchclub@gmail.com" style="font-family:${F.mono};font-size:10px;letter-spacing:1.5px;color:${C.ink};">EMAIL</a>
              <span style="font-family:${F.mono};font-size:10px;color:${C.whisper};"> · </span>
              <a href="https://bostonwatchclub.substack.com" style="font-family:${F.mono};font-size:10px;letter-spacing:1.5px;color:${C.ink};">SUBSTACK</a>
            </p>
            <p style="margin:0 0 14px 0;">${mono('BWC (C) 2026', 9, C.whisper, 2)}</p>
            <p style="font-family:${F.mono};color:${C.whisper};font-size:8px;letter-spacing:1px;line-height:1.6;margin:0;text-transform:uppercase;">${footerNote}</p>
          </td></tr></table>

          </td></tr></table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ---- application flow --------------------------------------------------------

export function applicationReceivedEmail({ firstName = '' }) {
  const name = firstName || 'there'
  return layout({
    tag: 'APPLICATION',
    preview: 'Your application to Boston Watch Club has been received.',
    footerNote: 'You received this because you applied to boswatchclub.com',
    content: `
      ${h1('APPLICATION<br/>RECEIVED')}
      ${p(`${name}, we've received your application to join Boston Watch Club. Thank you for wanting to be part of what we're building.`)}
      ${p('Membership is intentionally small and founding spots are limited — every application gets read personally by Henry and Stelios.')}
      ${specs([
        { label: 'STATUS', value: 'IN REVIEW' },
        { label: 'NEXT STEP', value: 'WE REACH OUT' },
      ])}
      ${p('If accepted, your access code and activation instructions arrive by email.', { size: 13, color: C.faint })}
    `,
  })
}

export function acceptanceEmail({ firstName = 'Member', accessCode = '' }) {
  return layout({
    tag: 'MEMBERSHIP',
    preview: "You're in. Activate your Boston Watch Club membership.",
    footerNote: 'You received this because you applied to boswatchclub.com',
    content: `
      ${h1("YOU'RE&nbsp;IN,<br/>" + firstName.toUpperCase())}
      ${p('Your application has been reviewed and approved. Welcome to Boston’s home for watch people.')}
      ${codePanel(accessCode)}
      ${button('ACTIVATE YOUR ACCOUNT', `${SITE}/activate/?code=${encodeURIComponent(accessCode)}`)}
      ${p('This code is single-use and tied to your email address. You’ll set your password during activation.', { size: 12, color: C.faint })}
    `,
  })
}

export function invitationEmail({ firstName = '', accessCode = '' }) {
  const name = firstName ? `, ${firstName.toUpperCase()}` : ''
  return layout({
    tag: 'INVITATION',
    preview: "You're invited to join Boston Watch Club.",
    footerNote: 'You received this because you were invited to boswatchclub.com',
    content: `
      ${h1(`YOU'RE<br/>INVITED${name}`)}
      ${p('You’ve been invited to join Boston Watch Club — a private community of collectors and enthusiasts who spend their time well.')}
      ${accessCode ? codePanel(accessCode) : ''}
      ${button('ACTIVATE YOUR ACCOUNT', accessCode ? `${SITE}/activate/?code=${encodeURIComponent(accessCode)}` : `${SITE}/activate/`)}
      ${p('This invitation is tied to your email address.', { size: 12, color: C.faint })}
    `,
  })
}

export function waitlistEmail({ firstName = '' }) {
  const name = firstName || 'there'
  return layout({
    tag: 'WAITLIST',
    preview: "You're on the Boston Watch Club waitlist.",
    footerNote: 'You received this because you applied to boswatchclub.com',
    content: `
      ${h1("YOU'RE ON<br/>THE LIST")}
      ${p(`${name}, we’ve reviewed your application and we’re impressed — but founding membership is currently at capacity.`)}
      ${p('You’re on the waitlist and among the first to be considered as spots open. No action needed — we’ll reach out.')}
      ${specs([
        { label: 'STATUS', value: 'WAITLISTED' },
        { label: 'YOUR MOVE', value: 'SIT TIGHT' },
      ])}
      ${button('FOLLOW ALONG', 'https://www.instagram.com/boswatchclub')}
    `,
  })
}

export function rejectionEmail({ firstName = '' }) {
  const name = firstName || 'there'
  return layout({
    tag: 'APPLICATION',
    preview: 'An update on your Boston Watch Club application.',
    footerNote: 'You received this because you applied to boswatchclub.com',
    content: `
      ${h1('APPLICATION<br/>UPDATE')}
      ${p(`${name}, thank you for taking the time to apply. We genuinely appreciate your interest in what we’re building.`)}
      ${p('After careful consideration, we’re not able to extend an invitation right now. Founding membership is at capacity, and we want every seat to be the right fit.')}
      ${p('This isn’t necessarily permanent — as the club grows and spots open, we’d welcome you to apply again.')}
      ${button('VISIT THE CLUB', SITE)}
    `,
  })
}

// ---- account -------------------------------------------------------------------

export function signupEmail({ firstName = 'Member' }) {
  return layout({
    tag: 'ACCOUNT',
    preview: 'Welcome to Boston Watch Club.',
    footerNote: 'You received this because you created an account at boswatchclub.com',
    content: `
      ${h1('WELCOME,<br/>' + firstName.toUpperCase())}
      ${p('Your account has been created. Set up your profile — photo, collection, socials — so other members know who they’re talking to.')}
      ${button('COMPLETE YOUR PROFILE', `${SITE}/members/`)}
    `,
  })
}

const TIER_BENEFITS = [
  'ALL CASUAL HANGS, CIGARS, HAPPY HOURS',
  'WHATSAPP GROUP ACCESS',
  'NEWSLETTER AND INSIDER UPDATES',
  'MEMBERS-ONLY CONTENT',
  'BRAND-SPONSORED EVENTS',
  'PRIORITY EVENT RSVP',
  'BRING ONE GUEST TO CASUAL HANGS',
  'CURATED EXPERIENCES AT MEMBER RATES',
]

export function purchaseEmail({ firstName = 'Member', tier = 'MEMBER' }) {
  return layout({
    tag: 'MEMBERSHIP',
    preview: 'Your Boston Watch Club membership is active.',
    content: `
      ${h1("YOU'RE&nbsp;IN,<br/>" + firstName.toUpperCase())}
      ${p(`Your <strong>${tier}</strong> membership is now active. Welcome to Boston’s home for watch people.`)}
      ${list(TIER_BENEFITS)}
      ${button('GO TO DASHBOARD', `${SITE}/members/`)}
    `,
  })
}

export function upgradeEmail({ firstName = 'Member', previousTier = 'MEMBER', newTier = 'FOUNDING MEMBER' }) {
  return layout({
    tag: 'MEMBERSHIP',
    preview: 'Your membership tier has been upgraded.',
    content: `
      ${h1('TIER<br/>UPGRADED')}
      ${p(`Congratulations, ${firstName}. Your membership has been upgraded — new benefits are live immediately.`)}
      ${specs([
        { label: 'FROM', value: previousTier },
        { label: 'TO', value: newTier },
      ])}
      ${button('GO TO DASHBOARD', `${SITE}/members/`)}
    `,
  })
}

export function accountDeletedEmail({ firstName = 'Member' }) {
  return layout({
    tag: 'ACCOUNT',
    preview: 'Your Boston Watch Club account has been removed.',
    footerNote: 'You received this because your account was removed from boswatchclub.com',
    content: `
      ${h1('SORRY TO<br/>SEE YOU GO')}
      ${p(`${firstName}, your account has been removed. We hope you enjoyed being part of the community.`)}
      ${p('If this was a mistake, or you’d like to rejoin down the line, you’re always welcome back.')}
      ${button('VISIT THE CLUB', SITE)}
    `,
  })
}

// ---- events ----------------------------------------------------------------------

const eventSpecs = ({ venue, date, time, dressCode, access }) =>
  specs([
    { label: 'VENUE', value: venue },
    { label: 'DATE', value: date },
    { label: 'TIME', value: time },
    { label: 'DRESS CODE', value: dressCode },
    { label: 'ACCESS', value: access },
  ])

export function newEventEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '', access = '', description = '', image = '' }) {
  return layout({
    tag: 'NEW EVENT',
    preview: `New event: ${eventName}`,
    content: `
      ${h1(eventName)}
      ${image ? `<img src="${image}" alt="" width="560" style="display:block;width:100%;height:auto;border:1px solid ${C.line};margin:0 0 20px 0;" />` : ''}
      ${description ? p(description) : ''}
      ${eventSpecs({ venue, date, time, dressCode, access })}
      ${button('RSVP NOW', `${SITE}/members/`)}
      ${p('Spots are limited — secure yours before it fills up.', { size: 12, color: C.faint })}
    `,
  })
}

export function rsvpConfirmEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '' }) {
  return layout({
    tag: 'RSVP',
    preview: `You're confirmed for ${eventName}`,
    footerNote: 'You received this because you RSVPed to an event at boswatchclub.com',
    content: `
      ${h1("YOU'RE&nbsp;IN,<br/>" + firstName.toUpperCase())}
      ${p(`Your RSVP for <strong>${eventName}</strong> is confirmed. See you there.`)}
      ${eventSpecs({ venue, date, time, dressCode })}
      ${button('VIEW IN DASHBOARD', `${SITE}/members/`)}
      ${p('Need to cancel? Update your RSVP anytime from your dashboard.', { size: 12, color: C.faint })}
    `,
  })
}

export function guestInviteEmail({ guestName = 'Guest', memberName = 'A member', eventName = '', venue = '', date = '', time = '', dressCode = '', guestId = '' }) {
  return layout({
    tag: 'GUEST LIST',
    preview: `${memberName} invited you to ${eventName}`,
    footerNote: 'You received this because a Boston Watch Club member invited you to an event',
    content: `
      ${h1("YOU'RE INVITED,<br/>" + guestName.toUpperCase())}
      ${p(`<strong>${memberName}</strong> has invited you as their guest to <strong>${eventName}</strong>. Confirm below to lock in your spot.`)}
      ${eventSpecs({ venue, date, time, dressCode })}
      ${button('ACCEPT INVITATION', `${SITE}/api/notify-guest?id=${encodeURIComponent(guestId)}`)}
      ${p('Can’t make it? No action needed — your spot won’t be reserved.', { size: 12, color: C.faint })}
    `,
  })
}

export function eventReminderEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '' }) {
  return layout({
    tag: 'REMINDER',
    preview: `Tonight: ${eventName}`,
    footerNote: 'You received this because you RSVPed to an event at boswatchclub.com',
    content: `
      ${h1('SEE YOU<br/>TONIGHT')}
      ${p(`${firstName}, a friendly reminder — <strong>${eventName}</strong> is tonight. Wear something good.`)}
      ${eventSpecs({ venue, date, time, dressCode })}
    `,
  })
}

export function guestReminderEmail({ guestName = 'Guest', memberName = '', eventName = '', venue = '', date = '', time = '', dressCode = '' }) {
  return layout({
    tag: 'REMINDER',
    preview: `Tonight: ${eventName}`,
    footerNote: 'You received this because you were invited to an event at boswatchclub.com',
    content: `
      ${h1('SEE YOU<br/>TONIGHT')}
      ${p(`${guestName}, a friendly reminder — you’re attending <strong>${eventName}</strong> tonight${memberName ? ` as ${memberName}’s guest` : ''}. See you there.`)}
      ${eventSpecs({ venue, date, time, dressCode })}
    `,
  })
}

// ---- content ---------------------------------------------------------------------

export function newContentEmail({ firstName = 'Member', contentType = 'news', title = '', preview = '' }) {
  const tag = contentType === 'journal' ? 'THE JOURNAL' : 'CLUB NEWS'
  return layout({
    tag,
    preview: title,
    content: `
      ${h1(title)}
      ${preview ? p(preview) : ''}
      ${button(contentType === 'journal' ? 'READ THE JOURNAL' : 'READ THE UPDATE', contentType === 'journal' ? 'https://bostonwatchclub.substack.com' : `${SITE}/members/`)}
    `,
  })
}

export function customBlastEmail({ preview = '', heading = '', body = '', buttonText = '', buttonHref = '', image = '' }) {
  const paragraphs = String(body)
    .split(/\n{2,}|\n/)
    .filter(Boolean)
    .map((t) => p(t))
    .join('')
  return layout({
    tag: 'THE CLUB',
    preview: preview || heading,
    content: `
      ${h1(heading)}
      ${image ? `<img src="${image}" alt="" width="560" style="display:block;width:100%;height:auto;border:1px solid ${C.line};margin:0 0 20px 0;" />` : ''}
      ${paragraphs}
      ${buttonText && buttonHref ? button(buttonText, buttonHref) : ''}
    `,
  })
}
