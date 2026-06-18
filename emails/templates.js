// All email templates as plain HTML template functions
// Editorial redesign theme: Georgia serif headings + system sans body,
// warm off-white / near-black palette, logo at top. Shared layout/button/
// detailsCard below rebrand every template at once.

const SITE = 'https://boswatchclub.com'

// EXACT redesign palette (matches the site's editorial tokens)
const colors = {
  bg: '#F8F7F7',     // page background (same as the redesign sections)
  card: '#F8F7F7',   // detail panels inside the white container
  text: '#1A1A1A',
  muted: '#777777',
  accent: '#1A1A1A',
  border: '#E4E2DC',
  faint: '#9B988F',
  subtle: '#777777',
}

// EXACT redesign font: ABC Marist (loaded via @font-face below for clients that
// support web fonts, e.g. Apple Mail), with Georgia as the matching serif
// fallback for clients that strip custom fonts (Gmail, Outlook).
const fonts = {
  display: "'ABC Marist', Georgia, 'Times New Roman', serif",
  body: "'ABC Marist', Georgia, 'Times New Roman', serif",
  sans: "'ABC Marist', Georgia, 'Times New Roman', serif",
}

function layout({ preview, content, footerNote = "You received this because you're a member at boswatchclub.com" }) {
  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" style="color-scheme:light only;-webkit-color-scheme:light only;">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <style>
    @font-face {
      font-family: 'ABC Marist';
      src: url('${SITE}/assets/fonts/ABCMarist-Book.otf') format('opentype');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    :root { color-scheme: light only; }
    body { margin: 0; padding: 0; background-color: ${colors.bg}; font-family: ${fonts.sans}; color: ${colors.text}; }
    a { text-decoration: none; }
  </style>
  <!--[if mso]>
  <style>body, table, td { background-color: ${colors.bg} !important; color: ${colors.text} !important; }</style>
  <![endif]-->
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${colors.bg};font-family:${fonts.sans};color:${colors.text};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.bg};" bgcolor="${colors.bg}">
    <tr>
      <td align="center" style="padding:48px 24px;" bgcolor="${colors.bg}">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;border-radius:8px;overflow:hidden;background-color:#FFFFFF;border:1px solid ${colors.border};">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:36px 32px 24px;border-radius:8px 8px 0 0;">
              <img src="${SITE}/assets/bwc-wordmark.png" alt="Boston Watch Club" width="240" style="display:block;margin:0 auto;max-width:80%;height:auto;" />
            </td>
          </tr>
          <!-- Divider -->
          <tr><td style="border-top:1px solid ${colors.border};"></td></tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Divider -->
          <tr><td style="border-top:1px solid ${colors.border};"></td></tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px;text-align:center;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 16px 0;">
                <a href="${SITE}/events" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">EVENTS</a>
                <span style="color:${colors.muted};font-size:10px;">&nbsp;&middot;&nbsp;</span>
                <a href="${SITE}/dashboard" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">DASHBOARD</a>
                <span style="color:${colors.muted};font-size:10px;">&nbsp;&middot;&nbsp;</span>
                <a href="${SITE}/blog" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">JOURNAL</a>
              </p>
              <p style="font-family:${fonts.sans};color:${colors.faint};font-size:10px;font-weight:300;line-height:1.5;margin:0;">
                ${footerNote}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function button(text, href) {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:8px;">
    <a href="${href}" style="display:inline-block;background-color:${colors.accent};color:#FFFFFF;font-family:${fonts.body};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:15px 38px;border-radius:4px;text-decoration:none;text-align:center;">${text}</a>
  </td></tr></table>`
}

function detailsCard(details) {
  const rows = details
    .filter(d => d.value)
    .map(d => `
      <tr><td style="padding-bottom:12px;">
        <p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">${d.label}</p>
        <p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0;">${d.value}</p>
      </td></tr>
    `).join('')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:6px;padding:24px;margin-bottom:24px;">
    ${rows}
  </table>`
}

// ─── SIGNUP ───────────────────────────────────────────────
export function signupEmail({ firstName = 'Member' }) {
  return layout({
    footerNote: 'You received this because you created an account at boswatchclub.com',
    preview: `Welcome to BOS Watch Club. Your account has been created.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">WELCOME, ${firstName.toUpperCase()}</h1>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        Your BOS Watch Club account has been created. You're one step closer to joining Boston's premier watch community.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        Complete your profile to get started.
      </p>
      ${button('COMPLETE YOUR PROFILE', `${SITE}/onboarding`)}
    `,
  })
}

// ─── PURCHASE ─────────────────────────────────────────────
const TIER_BENEFITS = {
  MEMBER: [
    'ALL CASUAL HANGS, CIGARS, HAPPY HOURS',
    'WHATSAPP GROUP ACCESS',
    'NEWSLETTER AND INSIDER UPDATES',
    'MEMBERS-ONLY CONTENT',
    'BRAND-SPONSORED EVENTS',
    'PRIORITY EVENT RSVP',
    'BRING ONE GUEST TO CASUAL HANGS',
    'CURATED EXPERIENCES AT MEMBER RATES',
    'WELCOME GIFT INCLUDED',
  ],
}

export function purchaseEmail({ firstName = 'Member', tier = 'MEMBER' }) {
  const benefits = TIER_BENEFITS[tier] || TIER_BENEFITS.MEMBER
  const benefitRows = benefits.map(b =>
    `<p style="font-family:${fonts.body};color:${colors.muted};font-size:11px;font-weight:300;letter-spacing:1px;line-height:1.4;margin:0 0 8px 0;padding-left:12px;border-left:2px solid ${colors.border};">${b}</p>`
  ).join('')

  return layout({
    preview: `You're in. Your ${tier} membership is now active.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">YOU'RE IN, ${firstName.toUpperCase()}</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:11px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">${tier} MEMBER</p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        Your membership is now active. Welcome to an exclusive community of collectors, enthusiasts, and those who appreciate the art of horology.
      </p>
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:16px;margin-bottom:24px;">
        <tr><td>
          <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;margin:0 0 16px 0;">YOUR BENEFITS</p>
          ${benefitRows}
        </td></tr>
      </table>
      ${button('GO TO DASHBOARD', `${SITE}/dashboard`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        Explore upcoming events, connect with members, and access exclusive content from your dashboard.
      </p>
    `,
  })
}

// ─── UPGRADE ──────────────────────────────────────────────
const NEW_BENEFITS = {
  MEMBER: [
    'ALL CASUAL HANGS, CIGARS, HAPPY HOURS',
    'WHATSAPP GROUP ACCESS',
    'NEWSLETTER AND INSIDER UPDATES',
    'MEMBERS-ONLY CONTENT',
    'BRAND-SPONSORED EVENTS',
    'PRIORITY EVENT RSVP',
    'BRING ONE GUEST TO CASUAL HANGS',
    'CURATED EXPERIENCES AT MEMBER RATES',
    'WELCOME GIFT INCLUDED',
  ],
}

export function upgradeEmail({ firstName = 'Member', previousTier = 'ENTHUSIAST', newTier = 'COLLECTOR' }) {
  const benefits = NEW_BENEFITS[newTier] || []
  const benefitRows = benefits.map(b =>
    `<p style="font-family:${fonts.body};color:${colors.muted};font-size:11px;font-weight:300;letter-spacing:1px;line-height:1.4;margin:0 0 8px 0;padding-left:12px;border-left:2px solid ${colors.border};">${b}</p>`
  ).join('')

  return layout({
    preview: `Tier upgraded. You're now a ${newTier} member.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">TIER UPGRADED</h1>
      <table width="100%" cellpadding="0" cellspacing="0" style="text-align:center;margin-bottom:24px;">
        <tr><td>
          <p style="font-family:${fonts.display};color:${colors.faint};font-size:18px;font-weight:400;letter-spacing:3px;margin:0 0 4px 0;text-decoration:line-through;">${previousTier}</p>
          <p style="color:${colors.accent};font-size:16px;margin:4px 0;">&darr;</p>
          <p style="font-family:${fonts.display};color:${colors.accent};font-size:22px;font-weight:400;letter-spacing:4px;margin:4px 0 0 0;">${newTier}</p>
        </td></tr>
      </table>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        Congratulations, ${firstName}. Your membership has been upgraded. Here's what you've unlocked.
      </p>
      ${benefits.length > 0 ? `
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:16px;margin-bottom:24px;">
        <tr><td>
          <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;margin:0 0 16px 0;">NEWLY UNLOCKED</p>
          ${benefitRows}
        </td></tr>
      </table>` : ''}
      ${button('GO TO DASHBOARD', `${SITE}/dashboard`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        Your new benefits are available immediately.
      </p>
    `,
  })
}

// ─── NEW EVENT ────────────────────────────────────────────
export function newEventEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '', access = '', description = '', image = '' }) {
  const imageBlock = image
    ? `<img src="${image}" alt="${eventName}" style="width:100%;max-width:520px;border-radius:8px;margin:0 auto 24px auto;display:block;border:1px solid ${colors.border};" />`
    : ''
  const descBlock = description
    ? `<p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">${description}</p>`
    : ''
  return layout({
    preview: `New event: ${eventName}. RSVP now before it fills up.`,
    content: `
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 8px 0;">NEW EVENT</p>
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">${eventName.toUpperCase()}</h1>
      ${imageBlock}
      ${descBlock}
      ${detailsCard([
        { label: 'VENUE', value: venue },
        { label: 'DATE', value: date },
        { label: 'TIME', value: time },
        { label: 'DRESS CODE', value: dressCode },
        { label: 'ACCESS', value: access },
      ])}
      ${button('RSVP NOW', `${SITE}/dashboard?tab=events`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        Spots are limited. Secure yours before it fills up.
      </p>
    `,
  })
}

// ─── RSVP CONFIRM ─────────────────────────────────────────
export function rsvpConfirmEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '' }) {
  return layout({
    footerNote: 'You received this because you RSVPed to an event at boswatchclub.com',
    preview: `You're going to ${eventName}. See you there.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">YOU'RE IN, ${firstName.toUpperCase()}</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">RSVP CONFIRMED</p>
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:16px;margin-bottom:24px;">
        <tr><td>
          <p style="font-family:${fonts.display};color:${colors.text};font-size:20px;font-weight:400;letter-spacing:3px;margin:0 0 16px 0;">${eventName.toUpperCase()}</p>
          ${venue ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">VENUE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${venue}</p>` : ''}
          ${date ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DATE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${date}</p>` : ''}
          ${time ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">TIME</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${time}</p>` : ''}
          ${dressCode ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DRESS CODE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0;">${dressCode}</p>` : ''}
        </td></tr>
      </table>
      ${button('VIEW IN DASHBOARD', `${SITE}/dashboard`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        Need to cancel? You can update your RSVP anytime from your dashboard.
      </p>
    `,
  })
}

// ─── GUEST INVITE ─────────────────────────────────────────
export function guestInviteEmail({ guestName = 'Guest', memberName = 'A member', eventName = '', venue = '', date = '', time = '', dressCode = '', guestId = '' }) {
  return layout({
    footerNote: 'You received this because you were invited to an event by a Boston Watch Club member.',
    preview: `${memberName} invited you to ${eventName}. You're in.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">YOU'RE INVITED, ${guestName.split(' ')[0].toUpperCase()}</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">GUEST OF ${memberName.toUpperCase()}</p>
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:16px;margin-bottom:24px;">
        <tr><td>
          <p style="font-family:${fonts.display};color:${colors.text};font-size:20px;font-weight:400;letter-spacing:3px;margin:0 0 16px 0;">${eventName.toUpperCase()}</p>
          ${venue ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">VENUE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${venue}</p>` : ''}
          ${date ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DATE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${date}</p>` : ''}
          ${time ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">TIME</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${time}</p>` : ''}
          ${dressCode ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DRESS CODE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0;">${dressCode}</p>` : ''}
        </td></tr>
      </table>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        ${memberName} has invited you as their guest. Please confirm your attendance below.
      </p>
      ${button('ACCEPT INVITATION', `${SITE}/api/notify-guest?id=${guestId}`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        Can't make it? No action needed — your spot will not be reserved.
      </p>
    `,
  })
}

// ─── EVENT REMINDER ───────────────────────────────────────
export function eventReminderEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '' }) {
  return layout({
    footerNote: 'You received this because you RSVPed to an event at boswatchclub.com',
    preview: `${eventName} is tonight. See you there.`,
    content: `
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 8px 0;">FRIENDLY REMINDER</p>
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">SEE YOU TONIGHT</h1>
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:16px;margin-bottom:24px;">
        <tr><td>
          <p style="font-family:${fonts.display};color:${colors.text};font-size:20px;font-weight:400;letter-spacing:3px;margin:0 0 16px 0;">${eventName.toUpperCase()}</p>
          ${venue ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">VENUE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${venue}</p>` : ''}
          ${date ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DATE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${date}</p>` : ''}
          ${time ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">TIME</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${time}</p>` : ''}
          ${dressCode ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DRESS CODE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0;">${dressCode}</p>` : ''}
        </td></tr>
      </table>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0;">
        ${firstName}, just a friendly reminder — we're looking forward to seeing you tonight.
      </p>
    `,
  })
}

// ─── GUEST EVENT REMINDER ────────────────────────────────
export function guestReminderEmail({ guestName = 'Guest', memberName = '', eventName = '', venue = '', date = '', time = '', dressCode = '' }) {
  return layout({
    footerNote: 'You received this because you were invited to an event at boswatchclub.com',
    preview: `${eventName} is tonight. See you there.`,
    content: `
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 8px 0;">FRIENDLY REMINDER</p>
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">SEE YOU TONIGHT</h1>
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:16px;margin-bottom:24px;">
        <tr><td>
          <p style="font-family:${fonts.display};color:${colors.text};font-size:20px;font-weight:400;letter-spacing:3px;margin:0 0 16px 0;">${eventName.toUpperCase()}</p>
          ${venue ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">VENUE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${venue}</p>` : ''}
          ${date ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DATE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${date}</p>` : ''}
          ${time ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">TIME</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${time}</p>` : ''}
          ${dressCode ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DRESS CODE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0;">${dressCode}</p>` : ''}
        </td></tr>
      </table>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0;">
        ${guestName.split(' ')[0]}, just a friendly reminder — you're attending tonight as ${memberName}'s guest. See you there.
      </p>
    `,
  })
}

// ─── NEW CONTENT ──────────────────────────────────────────
export function newContentEmail({ firstName = 'Member', contentType = 'news', title = '', preview = '' }) {
  const isBlog = contentType === 'blog'
  const label = isBlog ? 'NEW JOURNAL ENTRY' : 'CLUB UPDATE'
  const link = isBlog ? `${SITE}/blog` : `${SITE}/dashboard`
  const ctaText = isBlog ? 'READ NOW' : 'VIEW UPDATE'

  return layout({
    preview: `${label}: ${title}`,
    content: `
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 8px 0;">${label}</p>
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:32px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;line-height:1.2;">${title.toUpperCase()}</h1>
      ${preview ? `<p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">${preview}</p>` : ''}
      ${button(ctaText, link)}
    `,
  })
}

// ─── ACCOUNT DELETED ─────────────────────────────────────
export function accountDeletedEmail({ firstName = 'Member' }) {
  return layout({
    footerNote: 'You received this because your account was removed from boswatchclub.com',
    preview: `Your BOS Watch Club account has been removed.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">WE'RE SORRY TO SEE YOU GO</h1>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        ${firstName}, your BOS Watch Club account has been removed. We hope you enjoyed being part of the community.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        If this was a mistake or you'd like to rejoin in the future, you're always welcome back.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        Thank you for being part of Boston's watch community. We wish you all the best.
      </p>
      ${button('VISIT BOS WATCH CLUB', SITE)}
    `,
  })
}

// ─── APPLICATION RECEIVED ────────────────────────────────
export function applicationReceivedEmail({ firstName = '' }) {
  const greeting = firstName ? `${firstName}, we` : 'We'
  return layout({
    footerNote: 'You received this because you applied to boswatchclub.com',
    preview: `We've received your application to BOS Watch Club.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">APPLICATION RECEIVED</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">BOS WATCH CLUB</p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        ${greeting}'ve received your application to join BOS Watch Club. Thank you for your interest in becoming part of Boston's watch community.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        Our founding membership is currently at capacity, so new members are being added from the waitlist as spots open. We review every application personally and will be in touch.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        If accepted, you'll receive an email with your access code and instructions to activate your account, complete your profile, and join the community.
      </p>
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:0;">
        In the meantime, follow us on Instagram for event updates and community highlights.
      </p>
    `,
  })
}

// ─── ACCEPTANCE ──────────────────────────────────────────
export function acceptanceEmail({ firstName = 'Member', accessCode = '' }) {
  return layout({
    footerNote: 'You received this because you applied to boswatchclub.com',
    preview: `You've been accepted to BOS Watch Club. Activate your account to get started.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">YOU'VE BEEN ACCEPTED</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">BOS WATCH CLUB</p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        Congratulations, ${firstName}. Your application to BOS Watch Club has been reviewed and approved. Use the access code below to activate your account and join the community.
      </p>
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:16px;margin-bottom:24px;">
        <tr><td style="text-align:center;">
          <p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 8px 0;">YOUR ACCESS CODE</p>
          <p style="font-family:${fonts.display};color:${colors.text};font-size:32px;font-weight:400;letter-spacing:8px;margin:0;">${accessCode}</p>
        </td></tr>
      </table>
      ${button('ACTIVATE YOUR ACCOUNT', `${SITE}/activate`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        This code is single-use and tied to your email address. You'll set your password after activation.
      </p>
    `,
  })
}

// ─── INVITATION (admin manually adds approved email) ─────
export function invitationEmail({ firstName = '', accessCode = '' }) {
  const greeting = firstName ? `${firstName}, you're` : "You're"
  return layout({
    footerNote: 'You received this because you were invited to boswatchclub.com',
    preview: `You're invited to join BOS Watch Club — Boston's first watch community.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">YOU'RE INVITED</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">BOS WATCH CLUB</p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        ${greeting} invited to join Boston's first watch club — an exclusive community of collectors, enthusiasts, and those who appreciate the art of horology.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        We think you'd be a great fit. Use the link below to activate your account, set your password, and join the community.
      </p>
      ${accessCode ? `
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:16px;margin-bottom:24px;">
        <tr><td style="text-align:center;">
          <p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 8px 0;">YOUR ACCESS CODE</p>
          <p style="font-family:${fonts.display};color:${colors.text};font-size:32px;font-weight:400;letter-spacing:8px;margin:0;">${accessCode}</p>
        </td></tr>
      </table>` : ''}
      ${button('ACTIVATE YOUR ACCOUNT', `${SITE}/activate`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        This invitation is tied to your email address. You'll set your password after activation.
      </p>
    `,
  })
}

// ─── REJECTION ───────────────────────────────────────────
export function rejectionEmail({ firstName = '' }) {
  const greeting = firstName ? `${firstName}, thank` : 'Thank'
  return layout({
    footerNote: 'You received this because you applied to boswatchclub.com',
    preview: `An update on your BOS Watch Club application.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">APPLICATION UPDATE</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">BOS WATCH CLUB</p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        ${greeting} you for taking the time to apply to BOS Watch Club. We genuinely appreciate your interest in being part of what we're building.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        After careful consideration, we're not able to extend an invitation at this time. Our founding membership is at capacity, and we want to make sure every new member is the right fit for the community.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        This isn't necessarily a permanent decision. As the club grows and new spots open, we'd welcome you to apply again. We're always looking for people who share a genuine passion for watches and community.
      </p>
      ${button('VISIT BOS WATCH CLUB', SITE)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        Follow us on Instagram to stay connected with the community in the meantime.
      </p>
    `,
  })
}

// ─── CUSTOM BLAST (admin email generator) ───────────────
export function customBlastEmail({ preview = '', heading = '', body = '', buttonText = '', buttonHref = '', image = '' }) {
  const imageBlock = image
    ? `<img src="${image}" alt="" style="width:100%;max-width:520px;border-radius:8px;margin:0 auto 24px auto;display:block;border:1px solid ${colors.border};" />`
    : ''
  const bodyHtml = body
    ? `<p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">${body.replace(/\n/g, '<br>')}</p>`
    : ''
  const btnBlock = buttonText && buttonHref ? button(buttonText, buttonHref) : ''

  return layout({
    preview,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">${heading.toUpperCase()}</h1>
      ${imageBlock}
      ${bodyHtml}
      ${btnBlock}
    `,
  })
}

// ─── WAITLIST ────────────────────────────────────────────
export function waitlistEmail({ firstName = '' }) {
  const greeting = firstName ? `${firstName}, thank` : 'Thank'
  return layout({
    footerNote: 'You received this because you applied to boswatchclub.com',
    preview: `You've been placed on the BOS Watch Club waitlist.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">YOU'RE ON THE WAITLIST</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">BOS WATCH CLUB</p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        ${greeting} you for applying to BOS Watch Club. We've reviewed your application and we're impressed — but our current membership is at capacity.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        You've been placed on our waitlist and will be among the first to be considered as spots open up. We'll reach out as soon as a spot becomes available.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        In the meantime, follow us on Instagram to stay connected with the community and be the first to hear about upcoming events.
      </p>
      ${button('VISIT BOS WATCH CLUB', SITE)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        No action is needed on your part — we'll be in touch.
      </p>
    `,
  })
}
