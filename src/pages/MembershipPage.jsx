import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router'
import MembershipHero from '../components/membership/MembershipHero'
import TierGrid from '../components/membership/TierGrid'
import BenefitsSection from '../components/membership/BenefitsSection'
import Modal from '../components/shared/Modal'
import GlassCard from '../components/shared/GlassCard'
import RegisterForm from '../components/shared/RegisterForm'

export default function MembershipPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState('')
  const { setApplyCallback } = useOutletContext()

  useEffect(() => {
    setApplyCallback(() => () => {
      setSelectedTier('')
      setModalOpen(true)
    })
    return () => setApplyCallback(null)
  }, [setApplyCallback])

  function handleApply(tierName) {
    setSelectedTier(tierName)
    setModalOpen(true)
  }

  return (
    <>
      <MembershipHero
        eyebrow="MEMBERSHIP"
        title="FIND YOUR TIER"
        subtitle="EVERY MEMBERSHIP INCLUDES A ONE-TIME $40 APPLICATION FEE."
      />
      <TierGrid onApply={handleApply} />
      <BenefitsSection />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <GlassCard variant="modal">
          <RegisterForm variant="modal" tier={selectedTier} />
        </GlassCard>
      </Modal>
    </>
  )
}
