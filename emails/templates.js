// All email templates as plain HTML template functions
// Fonts: Bebas Neue (display), Unbounded (body), Inter (small/labels)
// Matches the site's dark theme exactly

const SITE = 'https://boswatchclub.com'

const colors = {
  bg: '#07090F',
  card: '#0D1018',
  text: '#E8ECF0',
  muted: 'rgba(232, 236, 240, 0.5)',
  accent: '#B8C4D4',
  border: 'rgba(232, 236, 240, 0.06)',
  faint: 'rgba(232, 236, 240, 0.3)',
  subtle: 'rgba(232, 236, 240, 0.35)',
}

// Font stacks matching the site
const fonts = {
  display: "'Bebas Neue', 'Arial Narrow', sans-serif",
  body: "'Unbounded', sans-serif",
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
}

function layout({ preview, content }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500&family=Unbounded:wght@300;400&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; background-color: ${colors.bg}; font-family: ${fonts.sans}; }
    a { text-decoration: none; }
  </style>
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${colors.bg};font-family:${fonts.sans};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.bg};">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <img src="${SITE}/assets/icon.png" alt="BOS Watch Club" width="48" height="48" style="filter:brightness(0) invert(1);display:block;margin:0 auto;" />
            </td>
          </tr>
          <!-- Divider -->
          <tr><td style="border-top:1px solid ${colors.border};"></td></tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 0;">
              ${content}
            </td>
          </tr>
          <!-- Divider -->
          <tr><td style="border-top:1px solid ${colors.border};"></td></tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="font-family:${fonts.body};color:${colors.muted};font-size:10px;font-weight:300;letter-spacing:3px;margin:0 0 16px 0;">BOS WATCH CLUB / BOSTON, MA</p>
              <p style="margin:0 0 16px 0;">
                <a href="${SITE}/events" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">EVENTS</a>
                <span style="color:${colors.muted};font-size:10px;">&nbsp;&middot;&nbsp;</span>
                <a href="${SITE}/dashboard" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">DASHBOARD</a>
                <span style="color:${colors.muted};font-size:10px;">&nbsp;&middot;&nbsp;</span>
                <a href="${SITE}/blog" style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:300;letter-spacing:2px;">JOURNAL</a>
              </p>
              <p style="font-family:${fonts.sans};color:${colors.faint};font-size:10px;font-weight:300;line-height:1.5;margin:0;">
                You received this because you're a member at boswatchclub.com
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
    <a href="${href}" style="display:inline-block;background-color:${colors.accent};color:${colors.bg};font-family:${fonts.display};font-size:15px;font-weight:400;letter-spacing:3px;padding:14px 36px;border-radius:40px;text-decoration:none;text-align:center;">${text}</a>
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

  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};padding:24px;margin-bottom:24px;">
    ${rows}
  </table>`
}

// ─── SIGNUP ───────────────────────────────────────────────
export function signupEmail({ firstName = 'Member' }) {
  return layout({
    preview: `Welcome to BOS Watch Club. Your account has been created.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">WELCOME, ${firstName.toUpperCase()}</h1>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 16px 0;">
        Your BOS Watch Club account has been created. You're one step closer to joining Boston's premier watch community.
      </p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        Choose a membership tier to unlock events, exclusive content, and a network of serious collectors.
      </p>
      ${button('VIEW MEMBERSHIPS', `${SITE}/membership`)}
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
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};margin-bottom:24px;">
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
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};margin-bottom:24px;">
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
export function newEventEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '', access = '' }) {
  return layout({
    preview: `New event: ${eventName}. RSVP now before it fills up.`,
    content: `
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 8px 0;">NEW EVENT</p>
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">${eventName.toUpperCase()}</h1>
      ${detailsCard([
        { label: 'VENUE', value: venue },
        { label: 'DATE', value: date },
        { label: 'TIME', value: time },
        { label: 'DRESS CODE', value: dressCode },
        { label: 'ACCESS', value: access },
      ])}
      ${button('RSVP NOW', `${SITE}/events`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        Spots are limited. Secure yours before it fills up.
      </p>
    `,
  })
}

// ─── RSVP CONFIRM ─────────────────────────────────────────
export function rsvpConfirmEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '' }) {
  return layout({
    preview: `You're going to ${eventName}. See you there.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">YOU'RE IN, ${firstName.toUpperCase()}</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">RSVP CONFIRMED</p>
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};margin-bottom:24px;">
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

// ─── EVENT REMINDER ───────────────────────────────────────
export function eventReminderEmail({ firstName = 'Member', eventName = '', venue = '', date = '', time = '', dressCode = '' }) {
  return layout({
    preview: `${eventName} is tomorrow. Don't forget.`,
    content: `
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 8px 0;">REMINDER</p>
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 24px 0;line-height:1.1;">TOMORROW</h1>
      <table width="100%" cellpadding="24" cellspacing="0" style="background-color:${colors.card};border:1px solid ${colors.border};margin-bottom:24px;">
        <tr><td>
          <p style="font-family:${fonts.display};color:${colors.text};font-size:20px;font-weight:400;letter-spacing:3px;margin:0 0 16px 0;">${eventName.toUpperCase()}</p>
          ${venue ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">VENUE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${venue}</p>` : ''}
          ${date ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DATE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${date}</p>` : ''}
          ${time ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">TIME</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0 0 12px 0;">${time}</p>` : ''}
          ${dressCode ? `<p style="font-family:${fonts.sans};color:${colors.subtle};font-size:10px;font-weight:500;letter-spacing:2px;margin:0 0 2px 0;">DRESS CODE</p><p style="font-family:${fonts.body};color:${colors.text};font-size:13px;font-weight:300;margin:0;">${dressCode}</p>` : ''}
        </td></tr>
      </table>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        ${firstName}, just a reminder. You're RSVPed for tomorrow. We look forward to seeing you.
      </p>
      ${button('VIEW EVENTS', `${SITE}/events`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        Can't make it? Please cancel your RSVP from the dashboard so someone else can attend.
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

// ─── APPROVAL ────────────────────────────────────────────
export function approvalEmail({ firstName = 'Member' }) {
  return layout({
    preview: `You've been accepted to BOS Watch Club. Create your account to get started.`,
    content: `
      <h1 style="font-family:${fonts.display};color:${colors.text};font-size:36px;font-weight:400;letter-spacing:4px;text-align:center;margin:0 0 8px 0;line-height:1.1;">YOU'VE BEEN ACCEPTED</h1>
      <p style="font-family:${fonts.body};color:${colors.accent};font-size:10px;font-weight:400;letter-spacing:3px;text-align:center;margin:0 0 24px 0;">BOS WATCH CLUB</p>
      <p style="font-family:${fonts.body};color:${colors.muted};font-size:12px;font-weight:300;line-height:1.8;text-align:center;margin:0 0 24px 0;">
        Congratulations, ${firstName}. Your application to BOS Watch Club has been reviewed and approved. Create your account with your email, a username, and a password to select your membership tier and join the community.
      </p>
      ${button('CREATE YOUR ACCOUNT', `${SITE}/login`)}
      <p style="font-family:${fonts.body};color:${colors.subtle};font-size:11px;font-weight:300;line-height:1.6;text-align:center;margin:16px 0 0 0;">
        This invitation is tied to your email address. Use the same email you applied with.
      </p>
    `,
  })
}
