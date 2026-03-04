import { useState } from 'react'
import TierGrid from '../components/membership/TierGrid'
import Modal from '../components/shared/Modal'
import GlassCard from '../components/shared/GlassCard'
import RegisterForm from '../components/shared/RegisterForm'

export default function MembershipPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState('')

  function handleApply(tierName) {
    setSelectedTier(tierName)
    setModalOpen(true)
  }

  return (
    <>
      <TierGrid onApply={handleApply} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <GlassCard variant="modal">
          <RegisterForm variant="modal" tier={selectedTier} />
        </GlassCard>
      </Modal>
    </>
  )
}
