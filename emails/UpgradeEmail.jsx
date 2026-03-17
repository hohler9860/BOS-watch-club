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
  faint: 'rgba(232, 236, 240, 0.3)',
  subtle: 'rgba(232, 236, 240, 0.35)',
}

const fonts = {
  display: "'Bebas Neue', 'Arial Narrow', sans-serif",
  body: "'Unbounded', sans-serif",
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
}

const NEW_BENEFITS = {
  COLLECTOR: [
    '6 BRAND-SPONSORED EVENTS PER YEAR',
    'PRIORITY EVENT RSVP',
    'BRING ONE GUEST TO CASUAL HANGS',
    'CURATED EXPERIENCES AT MEMBER RATES',
    'WELCOME GIFT INCLUDED',
  ],
  PATRON: [
    'EXCLUSIVE DINNERS WITH BRAND CEOS',
    'GUARANTEED PRIORITY SEATING AT ALL EVENTS',
    'UNLIMITED GUESTS AT CASUAL HANGS',
    'ONE ANNUAL CURATED TRAVEL EXPERIENCE',
    'NUMBERED PERSONALIZED MEMBERSHIP CARD',
    'ANNUAL PATRON-EXCLUSIVE GIFT',
  ],
}

export default function UpgradeEmail({ firstName = 'Member', previousTier = 'ENTHUSIAST', newTier = 'COLLECTOR' }) {
  const benefits = NEW_BENEFITS[newTier] || []

  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500&family=Unbounded:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>Tier upgraded — you're now a {newTier} member.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${SITE}/assets/logo.png`}
              alt="BOS Watch Club"
              width="120"
              style={logo}
            />
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Text style={heading}>TIER UPGRADED</Text>

            <Section style={tierTransition}>
              <Text style={oldTier}>{previousTier}</Text>
              <Text style={arrow}>&darr;</Text>
              <Text style={newTierStyle}>{newTier}</Text>
            </Section>

            <Text style={paragraph}>
              Congratulations, {firstName}. Your membership has been upgraded. Here's what you've unlocked.
            </Text>

            {benefits.length > 0 && (
              <Section style={benefitsCard}>
                <Text style={benefitsTitle}>NEWLY UNLOCKED</Text>
                {benefits.map((benefit, i) => (
                  <Text key={i} style={benefitItem}>
                    {benefit}
                  </Text>
                ))}
              </Section>
            )}

            <Section style={ctaSection}>
              <Link href={`${SITE}/dashboard`} style={button}>
                GO TO DASHBOARD
              </Link>
            </Section>

            <Text style={subtext}>
              Your new benefits are available immediately.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerBrand}>BOS WATCH CLUB / BOSTON, MA</Text>
            <Section style={footerLinks}>
              <Link href={`${SITE}/events`} style={footerLink}>EVENTS</Link>
              <Text style={footerDot}>&nbsp;&middot;&nbsp;</Text>
              <Link href={`${SITE}/dashboard`} style={footerLink}>DASHBOARD</Link>
              <Text style={footerDot}>&nbsp;&middot;&nbsp;</Text>
              <Link href={`${SITE}/blog`} style={footerLink}>JOURNAL</Link>
            </Section>
            <Text style={footerMuted}>
              You received this because you upgraded your membership at boswatchclub.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: colors.bg,
  fontFamily: fonts.sans,
  margin: 0,
  padding: 0,
}

const container = { maxWidth: '520px', margin: '0 auto', padding: '48px 24px' }

const logoSection = { textAlign: 'center', paddingBottom: '32px' }

const logo = { filter: 'brightness(0) invert(1)', margin: '0 auto' }

const divider = { borderColor: colors.border, borderWidth: '1px 0 0 0', margin: '0' }

const content = { padding: '40px 0' }

const heading = {
  fontFamily: fonts.display,
  color: colors.text,
  fontSize: '36px',
  fontWeight: '400',
  letterSpacing: '4px',
  textAlign: 'center',
  margin: '0 0 24px 0',
  lineHeight: '1.1',
}

const tierTransition = {
  textAlign: 'center',
  marginBottom: '24px',
}

const oldTier = {
  fontFamily: fonts.display,
  color: colors.faint,
  fontSize: '18px',
  fontWeight: '400',
  letterSpacing: '3px',
  margin: '0 0 4px 0',
  textDecoration: 'line-through',
}

const arrow = {
  color: colors.accent,
  fontSize: '16px',
  margin: '4px 0',
}

const newTierStyle = {
  fontFamily: fonts.display,
  color: colors.accent,
  fontSize: '22px',
  fontWeight: '400',
  letterSpacing: '4px',
  margin: '4px 0 0 0',
}

const paragraph = {
  fontFamily: fonts.body,
  color: colors.muted,
  fontSize: '12px',
  fontWeight: '300',
  lineHeight: '1.8',
  textAlign: 'center',
  margin: '0 0 24px 0',
}

const benefitsCard = {
  backgroundColor: colors.card,
  border: `1px solid ${colors.border}`,
  padding: '24px',
  marginBottom: '24px',
}

const benefitsTitle = {
  fontFamily: fonts.body,
  color: colors.accent,
  fontSize: '10px',
  fontWeight: '400',
  letterSpacing: '3px',
  margin: '0 0 16px 0',
}

const benefitItem = {
  fontFamily: fonts.body,
  color: colors.muted,
  fontSize: '11px',
  fontWeight: '300',
  letterSpacing: '1px',
  lineHeight: '1.4',
  margin: '0 0 8px 0',
  paddingLeft: '12px',
  borderLeft: `2px solid ${colors.border}`,
}

const ctaSection = { textAlign: 'center', paddingTop: '8px' }

const button = {
  display: 'inline-block',
  backgroundColor: colors.accent,
  color: colors.bg,
  fontFamily: fonts.display,
  fontSize: '15px',
  fontWeight: '400',
  letterSpacing: '3px',
  padding: '14px 36px',
  borderRadius: '40px',
  textDecoration: 'none',
  textAlign: 'center',
}

const subtext = {
  fontFamily: fonts.body,
  color: colors.subtle,
  fontSize: '11px',
  fontWeight: '300',
  lineHeight: '1.6',
  textAlign: 'center',
  margin: '16px 0 0 0',
}

const footer = { paddingTop: '32px', textAlign: 'center' }

const footerBrand = { fontFamily: fonts.body, color: colors.muted, fontSize: '10px', fontWeight: '300', letterSpacing: '3px', margin: '0 0 16px 0' }

const footerLinks = { textAlign: 'center', marginBottom: '16px' }

const footerLink = { fontFamily: fonts.body, color: colors.accent, fontSize: '10px', fontWeight: '300', letterSpacing: '2px', textDecoration: 'none' }

const footerDot = { color: colors.muted, fontSize: '10px', display: 'inline', margin: 0, padding: 0 }

const footerMuted = { fontFamily: fonts.sans, color: colors.faint, fontSize: '10px', fontWeight: '300', lineHeight: '1.5', margin: 0 }
