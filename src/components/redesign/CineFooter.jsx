/**
 * CineFooter — verbatim port of the Kettle Kids kk-footer structure.
 *
 * Exact markup from kettlekids-raw.html:
 *   <footer class="kk-footer">
 *     .kk-footer__monogram  (img)
 *     .kk-footer__inner
 *       .kk-footer__col  Opening Hours
 *       .kk-footer__col  Location       (SVG pin icon)
 *       .kk-footer__col  Contact        (.kk-footer__icons: email / phone / WhatsApp SVGs)
 *       .kk-footer__col  Social         (Instagram SVG)
 *
 * All SVG icons are taken verbatim from kettlekids-raw.html lines 661-673.
 *
 * // PLACEHOLDER — swap Opening Hours / Location / Contact / Social for BWC's real info
 */

import { Link } from 'react-router'
import { useSiteContent } from '../../hooks/useSupabaseData'

export default function CineFooter() {
  const { content } = useSiteContent()
  // Editable via Admin → Site Content → Footer & Contact; fall back to defaults.
  const location  = content.footerLocation || 'Boston, MA'
  const email     = content.contactEmail   || 'boswatchclub@gmail.com'
  const phone     = content.contactPhone   || ''
  const whatsapp  = content.whatsappUrl     || ''
  const instagram = content.instagramUrl    || 'https://www.instagram.com/boswatchclub/'

  return (
    <footer className="kk-footer">
      {/* Monogram — use BWC icon or swap for a text monogram */}
      {/* PLACEHOLDER — replace src with BWC's monogram image */}
      <div className="kk-footer__monogram">
        <img
          src={`${import.meta.env.BASE_URL}assets/icon.png`}
          alt="Boston Watch Club"
        />
      </div>

      <div className="kk-footer__inner">
        {/* Column 1: Location */}
        {/* PLACEHOLDER — swap for BWC's real location */}
        <div className="kk-footer__col">
          <span className="kk-footer__heading">Location</span>
          <span className="kk-footer__plain">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ verticalAlign: 'middle', marginRight: '4px' }}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location}
          </span>
        </div>

        {/* Column 3: Contact — editable via Site Content */}
        <div className="kk-footer__col">
          <span className="kk-footer__heading">Contact</span>
          <div className="kk-footer__icons">
            {/* Email icon */}
            <a href={`mailto:${email}`} aria-label="Email">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13 2 4" />
              </svg>
            </a>
            {/* Phone icon — shown only when a number is set in Site Content */}
            {phone && (
            <a href={`tel:${phone}`} aria-label="Phone">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
            )}
            {/* WhatsApp icon — shown only when a link is set in Site Content */}
            {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </a>
            )}
          </div>
        </div>

        {/* Column 4: Social — editable via Site Content */}
        <div className="kk-footer__col">
          <span className="kk-footer__heading">Social</span>
          <div className="kk-footer__icons">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright + Terms */}
      <div className="kk-footer__legal">
        <span>&copy; 2026 Boston Watch Club. All Rights Reserved.</span>
        <Link to="/terms" className="kk-footer__terms">Terms</Link>
      </div>
    </footer>
  )
}
