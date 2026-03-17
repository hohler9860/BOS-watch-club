import {
  Html, Head, Body, Container, Section, Text, Link, Img, Hr, Preview,
} from '@react-email/components'

const SITE = 'https://boswatchclub.com'

const colors = {
  bg: '#07090F',
  card: '#0D1018',
  text: '#E8ECF0',
  muted: 'rgba(232, 236, 240, 0.5)',
  accent: '#B8C4D4',
  border: 'rgba(232, 236, 240, 0.08)',
}

export default function EventReminderEmail({
  firstName = 'Member',
  eventName = '',
  venue = '',
  date = '',
  time = '',
  dressCode = '',
}) {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{eventName} is tomorrow — don't forget.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${SITE}/assets/icon.png`}
              alt="BOS Watch Club"
              width="48"
              height="48"
              style={logo}
            />
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Text style={eyebrow}>REMINDER</Text>
            <Text style={heading}>TOMORROW</Text>

            <Section style={detailsCard}>
              <Text style={eventTitle}>{eventName.toUpperCase()}</Text>
              {venue && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>VENUE</Text>
                  <Text style={detailValue}>{venue}</Text>
                </Section>
              )}
              {date && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>DATE</Text>
                  <Text style={detailValue}>{date}</Text>
                </Section>
              )}
              {time && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>TIME</Text>
                  <Text style={detailValue}>{time}</Text>
                </Section>
              )}
              {dressCode && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>DRESS CODE</Text>
                  <Text style={detailValue}>{dressCode}</Text>
                </Section>
              )}
            </Section>

            <Text style={paragraph}>
              {firstName}, just a reminder — you're RSVPed for tomorrow. We look forward to seeing you.
            </Text>

            <Section style={ctaSection}>
              <Link href={`${SITE}/dashboard`} style={button}>
                VIEW DETAILS
              </Link>
            </Section>

            <Text style={subtext}>
              Can't make it? Please cancel your RSVP from the dashboard so someone else can attend.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>BOS WATCH CLUB — BOSTON, MA</Text>
            <Section style={footerLinks}>
              <Link href={`${SITE}/events`} style={footerLink}>EVENTS</Link>
              <Text style={footerDot}>&nbsp;&middot;&nbsp;</Text>
              <Link href={`${SITE}/dashboard`} style={footerLink}>DASHBOARD</Link>
              <Text style={footerDot}>&nbsp;&middot;&nbsp;</Text>
              <Link href={`${SITE}/blog`} style={footerLink}>JOURNAL</Link>
            </Section>
            <Text style={footerMuted}>
              You received this because you RSVPed to an event at boswatchclub.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: colors.bg,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  margin: 0,
  padding: 0,
}

const container = { maxWidth: '520px', margin: '0 auto', padding: '48px 24px' }

const logoSection = { textAlign: 'center', paddingBottom: '24px' }

const logo = { filter: 'brightness(0) invert(1)', margin: '0 auto' }

const divider = { borderColor: colors.border, borderWidth: '1px 0 0 0', margin: '0' }

const content = { padding: '32px 0' }

const eyebrow = {
  color: colors.accent,
  fontSize: '11px',
  fontWeight: '500',
  letterSpacing: '3px',
  textAlign: 'center',
  margin: '0 0 8px 0',
}

const heading = {
  color: colors.text,
  fontSize: '28px',
  fontWeight: '300',
  letterSpacing: '4px',
  textAlign: 'center',
  margin: '0 0 24px 0',
  lineHeight: '1.2',
}

const detailsCard = {
  backgroundColor: colors.card,
  border: `1px solid ${colors.border}`,
  padding: '24px',
  marginBottom: '24px',
}

const eventTitle = {
  color: colors.text,
  fontSize: '16px',
  fontWeight: '400',
  letterSpacing: '3px',
  margin: '0 0 16px 0',
}

const detailRow = { marginBottom: '12px' }

const detailLabel = {
  color: 'rgba(232, 236, 240, 0.35)',
  fontSize: '10px',
  fontWeight: '500',
  letterSpacing: '2px',
  margin: '0 0 2px 0',
}

const detailValue = { color: colors.text, fontSize: '14px', fontWeight: '300', margin: '0' }

const paragraph = {
  color: colors.muted,
  fontSize: '14px',
  fontWeight: '300',
  lineHeight: '1.7',
  textAlign: 'center',
  margin: '0 0 24px 0',
}

const ctaSection = { textAlign: 'center', paddingTop: '8px' }

const button = {
  display: 'inline-block',
  backgroundColor: colors.accent,
  color: colors.bg,
  fontSize: '13px',
  fontWeight: '500',
  letterSpacing: '2px',
  padding: '14px 32px',
  textDecoration: 'none',
  textAlign: 'center',
}

const subtext = {
  color: 'rgba(232, 236, 240, 0.35)',
  fontSize: '12px',
  fontWeight: '300',
  lineHeight: '1.6',
  textAlign: 'center',
  margin: '16px 0 0 0',
}

const footer = { paddingTop: '32px', textAlign: 'center' }

const footerText = { color: colors.muted, fontSize: '11px', fontWeight: '400', letterSpacing: '3px', margin: '0 0 16px 0' }

const footerLinks = { textAlign: 'center', marginBottom: '16px' }

const footerLink = { color: colors.accent, fontSize: '11px', fontWeight: '400', letterSpacing: '2px', textDecoration: 'none' }

const footerDot = { color: colors.muted, fontSize: '11px', display: 'inline', margin: 0, padding: 0 }

const footerMuted = { color: 'rgba(232, 236, 240, 0.3)', fontSize: '10px', fontWeight: '300', lineHeight: '1.5', margin: 0 }
