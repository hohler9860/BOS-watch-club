import { Helmet } from 'react-helmet-async'
import MembershipHero from '../components/membership/MembershipHero'
import TermsContent from '../components/terms/TermsContent'

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms &amp; Conditions — Boston Watch Club</title>
        <meta name="description" content="Boston Watch Club bylaws, membership terms, and privacy policy." />
      </Helmet>
      <MembershipHero
        eyebrow="BOSTON WATCH CLUB"
        title="TERMS &amp; CONDITIONS"
        subtitle="BYLAWS, MEMBERSHIP PACKET &amp; PRIVACY POLICY"
      />
      <TermsContent />
    </>
  )
}
