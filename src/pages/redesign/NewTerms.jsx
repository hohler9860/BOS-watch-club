/**
 * NewTerms — /redesign/terms
 *
 * Kettle Kids reskin of TermsPage + TermsContent.
 *
 * ALL legal substance is preserved verbatim from:
 *   src/components/terms/TermsContent.jsx
 *
 * Only the presentation layer changes:
 *   - White background, black text (KK editorial aesthetic)
 *   - ABC Marist hero headings, Georgia/serif body text
 *   - 760px centered reading column, generous line-height
 *   - Section headings with thin horizontal rules
 *   - No dark glass, no shimmer, no grain
 *
 * Renders inside NewSiteLayout — nav + footer are provided by the parent.
 */

import { Helmet } from 'react-helmet-async'
import s from './NewTerms.module.css'

export default function NewTerms() {
  return (
    <div className={s.page}>
      <Helmet>
        <title>Terms &amp; Conditions | Boston Watch Club</title>
        <meta
          name="description"
          content="Boston Watch Club bylaws, membership terms, and privacy policy."
        />
      </Helmet>

      {/* ── Hero banner ───────────────────────────────────────────────────── */}
      <section className={s.hero}>
        <p className={s.heroEyebrow}>Boston Watch Club</p>
        <h1 className={s.heroTitle}>Terms &amp; Conditions</h1>
        <p className={s.heroSubtitle}>Bylaws, Membership Packet &amp; Privacy Policy</p>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className={s.body}>
        <div className={s.inner}>

          {/* 1. PURPOSE */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>1. Purpose</h2>
            <p className={s.para}>
              Boston Watch Club exists to unite collectors and enthusiasts through a shared passion
              for fine timepieces, luxury lifestyle, and cultural experiences. The Club is committed
              to creating a sophisticated yet engaging community built on respect, inclusivity, and
              enjoyment.
            </p>
          </section>

          {/* 2. MEMBERSHIP */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>2. Membership</h2>

            <h3 className={s.subHeading}>2.1 Application &amp; Acceptance</h3>
            <p className={s.para}>
              Membership is open to individuals who share an appreciation for watches and luxury
              culture. Applicants must be invited or sponsored by a current member in good
              standing, complete an application, provide references if requested, and attend an
              interview or introductory event. Potential members may be required to attend a
              membership mixer which may be held quarterly or as the Board sees fit. Final
              acceptance is subject to review and approval by the Membership Board.
            </p>

            <h3 className={s.subHeading}>2.2 Membership Categories</h3>
            <ul className={s.list}>
              <li className={s.listItem}>
                <strong>Founding Member</strong> &ndash; Full access to all events, community
                features, and the member directory. Limited to 40 members. No membership fee.
              </li>
              <li className={s.listItem}>
                <strong>Future Tiers</strong> &ndash; Additional membership tiers with premium
                benefits will be introduced as the community grows. Founding members are
                grandfathered in.
              </li>
            </ul>

            <h3 className={s.subHeading}>2.3 Term &amp; Renewal</h3>
            <p className={s.para}>
              Founding membership is ongoing subject to good standing and Board approval. Members
              must uphold the Club&rsquo;s standards. If paid tiers are introduced in the future,
              founding members retain their access at no cost.
            </p>

            <h3 className={s.subHeading}>2.4 Participation Requirement</h3>
            <p className={s.para}>
              Members must attend at least five (5) official Club events, or at least 25% of
              official Club events (whichever is less), per membership year to remain in good
              standing and maintain membership eligibility.
            </p>
          </section>

          {/* 3. CODE OF CONDUCT */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>3. Code of Conduct</h2>

            <h3 className={s.subHeading}>3.1 Respect &amp; Community</h3>
            <p className={s.para}>
              Treat all members, guests, staff, and partners with courtesy and respect. No
              harassment, discrimination, or aggressive behavior of any kind. Discussions of
              politics and religion are not permitted in order to maintain inclusivity.
            </p>

            <h3 className={s.subHeading}>3.2 Watches &amp; Etiquette</h3>
            <p className={s.para}>
              At brand-sponsored events, members should wear one watch and refrain from bringing
              watch rolls. At collector-led gatherings, members may bring watches to share and
              discuss. Negative or disrespectful commentary on another member&rsquo;s watch is
              prohibited.
            </p>

            <h3 className={s.subHeading}>3.3 Confidentiality</h3>
            <p className={s.para}>
              Members must respect the privacy of fellow members and the confidentiality of Club
              business, including sponsor relationships and internal discussions.
            </p>

            <h3 className={s.subHeading}>3.4 No Solicitation</h3>
            <p className={s.para}>
              Members are prohibited from reaching out to other members to pitch business
              opportunities. The Club is a safe space where members can share their successes
              without being approached for business ventures. This includes members of the watch
              industry and dealers. That said, we understand that relationships and friendships
              will form, and some of those may naturally become business relationships.
            </p>

            <h3 className={s.subHeading}>3.5 Planning Through Official Channels</h3>
            <p className={s.para}>
              We understand that everyone wants to help, and it is encouraged and appreciated.
              That said, if you have an idea, event, or relationship you would like to pursue for
              the Club, please ask a Board member if the Club would be interested and then direct
              that relationship to the Club so it can be planned appropriately. We are working on
              many things, and although you may not have heard of an event, that does not mean
              one is not in the works.
            </p>

            <h3 className={s.subHeading}>3.6 Introduction to Potential Members</h3>
            <p className={s.para}>
              Please do not put Board members in an uncomfortable position by adding them to a
              text or group chat with a potential member without prior coordination. Please refer
              to Section 2.1 for the proper application process.
            </p>

            <h3 className={s.subHeading}>3.7 Loyalty &amp; Good Faith</h3>
            <p className={s.para}>
              Members are not to take any actions which may be deemed to undermine the Club, such
              as planning or facilitating events for competing organizations or speaking negatively
              about the Club. Members are free to participate in other groups. However, creating,
              leading, or facilitating such groups in a manner that may reasonably be deemed as
              undermining the work or planning done by Boston Watch Club is not permitted.
            </p>
          </section>

          {/* 4. EVENTS & ATTENDANCE */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>4. Events &amp; Attendance</h2>
            <p className={s.para}>
              RSVP commitments must be honored. Certain events require a refundable deposit at
              the time of RSVP; deposits are returned or applied to the member&rsquo;s bill upon
              attendance, and forfeited in the case of a no-show. Repeated no-shows may affect
              membership standing. Guests may attend at the discretion of the Club and within
              limits set for each event. Founding members may bring one guest to casual hangs;
              brand-sponsored events and private dinners may have separate guest policies. Members
              are responsible for the behavior of their guests.
            </p>
          </section>

          {/* 5. GOVERNANCE */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>5. Governance</h2>
            <p className={s.para}>
              The Club shall be overseen by the Executive Board and an advisory Membership Board.
              The Membership Board consists of and is chaired by designated Co-Chairs and
              Executive Board members.
            </p>
            <p className={s.para}>
              The Membership Board shall determine membership policies, event strategy, admission
              decisions, and disciplinary actions. While the Executive Board may normally accept
              the position of the Membership Board, the Executive Board retains final
              decision-making authority on all matters relating to the Boston Watch Club and may
              override or veto the Membership Board.
            </p>
            <p className={s.para}>
              Amendments to these Bylaws require majority Executive Board approval.
            </p>
          </section>

          {/* 6. DISCIPLINE & TERMINATION */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>6. Discipline &amp; Termination</h2>

            <h3 className={s.subHeading}>6.1 Grounds for Action</h3>
            <p className={s.para}>
              Members may face disciplinary action for breach of the Code of Conduct, failure to
              honor event deposit obligations, behavior that brings the Club into disrepute, or
              failure to meet the participation requirement.
            </p>

            <h3 className={s.subHeading}>6.2 Procedure</h3>
            <p className={s.para}>
              The Executive Board will determine discipline on a case-by-case basis. Discipline
              may take the form of a written warning, suspension, or termination of membership.
              Decisions will be made by majority vote of the Executive Board. Any outstanding
              event deposits are forfeited if removed for cause.
            </p>

            <h3 className={s.subHeading}>6.3 Expulsion</h3>
            <p className={s.para}>
              Boston Watch Club reserves the right to expel any member for any reason.
            </p>
          </section>

          {/* 7. MISCELLANEOUS */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>7. Miscellaneous</h2>
            <p className={s.para}>
              The Club may collaborate with brands, venues, and sponsors. Members must respect
              and honor these relationships. Photography and media at events must be approved in
              advance by the Club. These Bylaws are binding upon all members and may be updated
              periodically.
            </p>
          </section>

          {/* 8. LIABILITY & INDEMNITY */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>8. Liability &amp; Indemnity</h2>
            <p className={s.para}>
              The Club is not responsible for injury, property loss, or damages incurred at
              events. Members agree to indemnify and hold harmless the Club, its Board, and its
              partners against any claims arising from their conduct or participation.
            </p>
          </section>

          {/* 9. USE OF LIKENESS */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>9. Use of Likeness</h2>
            <p className={s.para}>
              Members consent to the use of their likeness in Club photography, video, and media
              for promotional purposes, unless they opt out in writing submitted to the Board.
            </p>
          </section>

          {/* 10. PRIVACY POLICY */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>10. Privacy Policy</h2>
            <p className={`${s.para} ${s.effectiveDate}`}>Effective Date: March 2, 2026</p>

            <h3 className={s.subHeading}>10.1 Information Collection</h3>
            <p className={s.para}>
              We collect various types of information in order to provide and improve our
              services, including:
            </p>
            <ul className={s.list}>
              <li className={s.listItem}>
                <strong>Personal Information:</strong> Name, email address, phone number, and
                other identifiable information you provide when registering or using our services.
              </li>
              <li className={s.listItem}>
                <strong>Usage Data:</strong> Information on how our services are accessed and
                used, including IP address, browser type, and pages visited.
              </li>
            </ul>

            <h3 className={s.subHeading}>10.2 Use of Information</h3>
            <p className={s.para}>
              We use collected information to provide and maintain our services, notify you about
              changes, allow participation in interactive features, provide customer support,
              gather analysis to improve our services, monitor usage, detect and address technical
              issues, for marketing purposes, and for the regular course of business.
            </p>

            <h3 className={s.subHeading}>10.3 Data Sharing</h3>
            <p className={s.para}>
              We may share your information with service providers to help provide our services,
              with brands to provide invitations and marketing information, and for legal reasons
              when required by law or in response to valid requests by public authorities.
            </p>

            <h3 className={s.subHeading}>10.4 User Rights</h3>
            <p className={s.para}>
              You have the right to access copies of your personal information, request
              correction of inaccurate or incomplete information, and request deletion of your
              personal data under certain conditions.
            </p>

            <h3 className={s.subHeading}>10.5 Data Security</h3>
            <p className={s.para}>
              We value your trust in providing us your personal information and strive to use
              commercially acceptable means of protecting it. However, no method of transmission
              over the internet or electronic storage is 100% secure.
            </p>

            <h3 className={s.subHeading}>10.6 Cookies &amp; Tracking</h3>
            <p className={s.para}>
              We use cookies and similar tracking technologies to track activity on our service
              and hold certain information. You can instruct your browser to refuse all cookies
              or indicate when a cookie is being sent.
            </p>

            <h3 className={s.subHeading}>10.7 Changes to Privacy Policy</h3>
            <p className={s.para}>
              We may update our privacy policy from time to time. We will notify you of any
              changes by posting the new privacy policy on this page.
            </p>
          </section>

          {/* 11. GOVERNING LAW & DISPUTE RESOLUTION */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>11. Governing Law &amp; Dispute Resolution</h2>
            <p className={s.para}>
              These Bylaws shall be governed by the laws of the Commonwealth of Massachusetts.
              Members agree that the appropriate venue to bring a civil action is Suffolk County,
              Massachusetts. Members agree that prior to filing a lawsuit, any dispute shall first
              be submitted to mediation in Boston, Massachusetts, paid in full by the disputing
              member.
            </p>
          </section>

          {/* 12. SEVERABILITY */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>12. Severability</h2>
            <p className={s.para}>
              If any provision of these Bylaws is found invalid or unenforceable, the remaining
              provisions shall remain in full force and effect.
            </p>
          </section>

          {/* 13. BINDING EFFECT & ACKNOWLEDGMENT */}
          <section className={s.section}>
            <h2 className={s.sectionHeading}>13. Binding Effect &amp; Acknowledgment</h2>
            <p className={s.para}>
              These Bylaws are binding upon all members once accepted into the Club and/or
              entering into any Boston Watch Club chat, and/or attending any Boston Watch Club
              event. Acceptance of membership constitutes agreement to these Bylaws and the member
              acknowledges and agrees to abide by the Bylaws of the Boston Watch Club.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
