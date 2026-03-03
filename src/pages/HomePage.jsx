import { useEffect } from 'react'
import { useLocation } from 'react-router'
import Hero from '../components/home/Hero'
import Marquee from '../components/home/Marquee'
import About from '../components/home/About'
import Snapshot from '../components/home/Snapshot'
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
    }
  }, [hash])

  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Snapshot />
      <Events />
      <Benefits />
      <Timepiece />
      <Faq />
      <Register />
    </>
  )
}
