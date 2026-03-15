import {
  Html, Head, Body, Container, Section, Text, Link, Img, Hr, Preview,
} from '@react-email/components'

const SITE = 'https://bosswatchclub.com'

const colors = {
  bg: '#07090F',
  card: '#0D1018',
  text: '#E8ECF0',
  muted: 'rgba(232, 236, 240, 0.5)',
  accent: '#B8C4D4',
  border: 'rgba(232, 236, 240, 0.08)',
}

const TIER_BENEFITS = {
  ENTHUSIAST: [
    'ALL CASUAL HANGS, CIGARS, HAPPY HOURS',
    'WHATSAPP / DISCORD GROUP ACCESS',
    'NEWSLETTER AND INSIDER UPDATES',
    'MEMBERS-ONLY CONTENT',
  ],
  COLLECTOR: [
    'ALL ENTHUSIAST BENEFITS',
    '6 BRAND-SPONSORED EVENTS PER YEAR',
    'PRIORITY EVENT RSVP',
    'BRING ONE GUEST TO CASUAL HANGS',
    'CURATED EXPERIENCES AT MEMBER RATES',
    'WELCOME GIFT INCLUDED',
  ],
  PATRON: [
    'ALL COLLECTOR BENEFITS',
    'EXCLUSIVE DINNERS WITH BRAND CEOS',
    'GUARANTEED PRIORITY SEATING AT ALL EVENTS',
    'UNLIMITED GUESTS AT CASUAL HANGS',
    'ONE ANNUAL CURATED TRAVEL EXPERIENCE',
    'NUMBERED PERSONALIZED MEMBERSHIP CARD',
    'ANNUAL PATRON-EXCLUSIVE GIFT',
  ],
}

export default function PurchaseEmail({ firstName = 'Member', tier = 'ENTHUSIAST' }) {
  const benefits = TIER_BENEFITS[tier] || TIER_BENEFITS.ENTHUSIAST

  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>You're in — your {tier} membership is now active.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
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

          {/* Content */}
          <Section style={content}>
            <Text style={heading}>YOU'RE IN, {firstName.toUpperCase()}</Text>
            <Text style={tierBadge}>{tier} MEMBER</Text>
            <Text style={paragraph}>
              Your membership is now active. Welcome to an exclusive community of collectors, enthusiasts, and those who appreciate the art of horology.
            </Text>

            {/* Benefits */}
            <Section style={benefitsCard}>
              <Text style={benefitsTitle}>YOUR BENEFITS</Text>
              {benefits.map((benefit, i) => (
                <Text key={i} style={benefitItem}>
                  {benefit}
                </Text>
              ))}
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Link href={`${SITE}/dashboard`} style={button}>
                GO TO DASHBOARD
              </Link>
            </Section>

            <Text style={subtext}>
              Explore upcoming events, connect with members, and access exclusive content from your dashboard.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
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
              You received this because you purchased a membership at bosswatchclub.com
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

const container = {
  maxWidth: '520px',
  margin: '0 auto',
  padding: '48px 24px',
}

const logoSection = {
  textAlign: 'center',
  paddingBottom: '24px',
}

const logo = {
  filter: 'brightness(0) invert(1)',
  margin: '0 auto',
}

const divider = {
  borderColor: colors.border,
  borderWidth: '1px 0 0 0',
  margin: '0',
}

const content = {
  padding: '32px 0',
}

const heading = {
  color: colors.text,
  fontSize: '28px',
  fontWeight: '300',
  letterSpacing: '4px',
  textAlign: 'center',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
}

const tierBadge = {
  color: colors.accent,
  fontSize: '12px',
  fontWeight: '500',
  letterSpacing: '3px',
  textAlign: 'center',
  margin: '0 0 24px 0',
}

const paragraph = {
  color: colors.muted,
  fontSize: '14px',
  fontWeight: '300',
  lineHeight: '1.7',
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
  color: colors.accent,
  fontSize: '11px',
  fontWeight: '500',
  letterSpacing: '3px',
  margin: '0 0 16px 0',
}

const benefitItem = {
  color: colors.muted,
  fontSize: '12px',
  fontWeight: '300',
  letterSpacing: '1px',
  lineHeight: '1.4',
  margin: '0 0 8px 0',
  paddingLeft: '12px',
  borderLeft: `2px solid ${colors.border}`,
}

const ctaSection = {
  textAlign: 'center',
  paddingTop: '8px',
}

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

const footer = {
  paddingTop: '32px',
  textAlign: 'center',
}

const footerText = {
  color: colors.muted,
  fontSize: '11px',
  fontWeight: '400',
  letterSpacing: '3px',
  margin: '0 0 16px 0',
}

const footerLinks = {
  textAlign: 'center',
  marginBottom: '16px',
}

const footerLink = {
  color: colors.accent,
  fontSize: '11px',
  fontWeight: '400',
  letterSpacing: '2px',
  textDecoration: 'none',
}

const footerDot = {
  color: colors.muted,
  fontSize: '11px',
  display: 'inline',
  margin: 0,
  padding: 0,
}

const footerMuted = {
  color: 'rgba(232, 236, 240, 0.3)',
  fontSize: '10px',
  fontWeight: '300',
  lineHeight: '1.5',
  margin: 0,
}
