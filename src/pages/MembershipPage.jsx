import { Helmet } from 'react-helmet-async'
import MembershipHero from '../components/membership/MembershipHero'
import TierGrid from '../components/membership/TierGrid'

export default function MembershipPage() {
  return (
    <>
      <Helmet>
        <title>Membership — Boston Watch Club</title>
        <meta name="description" content="Explore membership tiers: Enthusiast, Collector, and Patron. Get exclusive access to private events, member networking, and curated experiences." />
      </Helmet>
      <MembershipHero
        title="FIND YOUR TIER"
        subtitle="SELECT THE MEMBERSHIP LEVEL THAT MATCHES YOUR PASSION FOR HOROLOGY."
      />
      <TierGrid />
    </>
  )
}
