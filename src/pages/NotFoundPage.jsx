import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import FadeIn from '../components/shared/FadeIn'

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — Boston Watch Club</title>
      </Helmet>
      <section style={wrapper}>
        <FadeIn>
          <p style={eyebrow}>404</p>
          <h1 style={heading}>PAGE NOT FOUND</h1>
          <p style={paragraph}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" style={button}>BACK TO HOME</Link>
        </FadeIn>
      </section>
    </>
  )
}

const wrapper = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  textAlign: 'center',
  padding: '48px 24px',
}

const eyebrow = {
  fontFamily: "'Unbounded', sans-serif",
  color: 'var(--accent)',
  fontSize: '12px',
  fontWeight: '300',
  letterSpacing: '4px',
  margin: '0 0 12px 0',
}

const heading = {
  fontFamily: "'Bebas Neue', sans-serif",
  color: 'var(--text-primary)',
  fontSize: '48px',
  fontWeight: '400',
  letterSpacing: '6px',
  margin: '0 0 24px 0',
  lineHeight: '1.1',
}

const paragraph = {
  fontFamily: "'Unbounded', sans-serif",
  color: 'var(--text-secondary)',
  fontSize: '13px',
  fontWeight: '300',
  lineHeight: '1.8',
  margin: '0 0 32px 0',
}

const button = {
  display: 'inline-block',
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: '15px',
  letterSpacing: '3px',
  padding: '14px 36px',
  borderRadius: '40px',
  backgroundColor: 'var(--accent)',
  color: 'var(--bg-primary)',
  textDecoration: 'none',
}
