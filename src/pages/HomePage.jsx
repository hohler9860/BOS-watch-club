import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Helmet } from 'react-helmet-async'
import Hero from '../components/home/Hero'
import Marquee from '../components/home/Marquee'
import About from '../components/home/About'
import Events from '../components/home/Events'
import Benefits from '../components/membership/BenefitsSection'
import Timepiece from '../components/home/Timepiece'
import Faq from '../components/home/Faq'
import Register from '../components/home/Register'

export default function HomePage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash])

  return (
    <>
      <Helmet>
        <title>Boston Watch Club — Boston's Premier Watch Collectors Community</title>
        <meta name="description" content="An exclusive community for collectors, enthusiasts, and those who appreciate the art of horology. Events, networking, and curated experiences in Boston." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Boston Watch Club",
          "url": "https://boswatchclub.com",
          "logo": "https://boswatchclub.com/assets/logo.png",
          "description": "Boston's premier watch collectors community. Curated events, exclusive access, and a network of serious collectors.",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Boston",
            "addressRegion": "MA",
            "addressCountry": "US"
          }
        })}</script>
      </Helmet>
      <Hero />
      <Marquee />
      <About />
      <Benefits />
      <Events />
      <Timepiece />
      <Faq />
      <Register />
    </>
  )
}
