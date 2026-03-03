import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router'
import TierGrid from '../components/membership/TierGrid'
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
      <TierGrid onApply={handleApply} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <GlassCard variant="modal">
          <RegisterForm variant="modal" tier={selectedTier} />
        </GlassCard>
      </Modal>
    </>
  )
}
