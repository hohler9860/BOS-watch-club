import MembershipHero from '../components/membership/MembershipHero'
import TermsContent from '../components/terms/TermsContent'

export default function TermsPage() {
  return (
    <>
      <MembershipHero
        eyebrow="BOSTON WATCH CLUB"
        title="TERMS &amp; CONDITIONS"
        subtitle="BYLAWS, MEMBERSHIP PACKET &amp; PRIVACY POLICY"
      />
      <TermsContent />
    </>
  )
}
