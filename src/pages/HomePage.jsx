import { useEffect, useState } from 'react'
import { useLocation, useOutletContext } from 'react-router'
import Hero from '../components/home/Hero'
import Marquee from '../components/home/Marquee'
import About from '../components/home/About'
import Events from '../components/home/Events'
import Benefits from '../components/membership/BenefitsSection'
import Timepiece from '../components/home/Timepiece'
import Faq from '../components/home/Faq'
import Register from '../components/home/Register'
import Modal from '../components/shared/Modal'
import GlassCard from '../components/shared/GlassCard'
import RegisterForm from '../components/shared/RegisterForm'

export default function HomePage() {
  const { hash } = useLocation()
  const [modalOpen, setModalOpen] = useState(false)
  const { setApplyCallback } = useOutletContext()

  useEffect(() => {
    setApplyCallback(() => () => {
      setModalOpen(true)
    })
    return () => setApplyCallback(null)
  }, [setApplyCallback])

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
      <Benefits />
      <Events />
      <Timepiece />
      <Faq />
      <Register />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <GlassCard variant="modal">
          <RegisterForm variant="modal" />
        </GlassCard>
      </Modal>
    </>
  )
}
