import MembershipHero from '../components/membership/MembershipHero'
import TierGrid from '../components/membership/TierGrid'

export default function MembershipPage() {
  return (
    <>
      <MembershipHero
        eyebrow="MEMBERSHIP TIERS"
        title="FIND YOUR TIER"
        subtitle="SELECT THE MEMBERSHIP LEVEL THAT MATCHES YOUR PASSION FOR HOROLOGY."
      />
      <TierGrid />
    </>
  )
}
