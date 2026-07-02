/**
 * NewMembership — /membership
 *
 * Editorial page on the shared ed- design system (editorial.css): typographic
 * hero, tier presentation, how we gather, apply CTA. All content is visible
 * immediately; no click-to-reveal panels.
 */

import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import './editorial.css'

export default function NewMembership() {
  return (
    <div className="kk-page ed-page">
      <Helmet>
        <title>Membership | Boston Watch Club</title>
        <meta
          name="description"
          content="Join Boston Watch Club. Most nights are free and open to all; membership unlocks the members-only gatherings, the group chat, and the rooms worth being in."
        />
      </Helmet>

      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── Hero ── */}
      <header className="ed-hero">
        <span className="ed-hero__eyebrow">Boston Watch Club</span>
        <h1 className="ed-hero__title">Membership</h1>
        <p className="ed-hero__lede">
          Most of our nights are free and open to anyone who loves watches.
          Membership is for the rooms that aren&rsquo;t: the private gatherings,
          the group chat, and the people who make this club what it is.
        </p>
      </header>

      {/* ── Tiers ── */}
      <section className="ed-section" aria-label="Membership tiers">
        <div className="ed-section__head">
          <span className="ed-label">The Tiers</span>
        </div>

        <div className="ed-tiers">
          <article className="ed-tier">
            <div className="ed-tier__top">
              <h2 className="ed-tier__name">Founding Membership</h2>
              <span className="ed-tag ed-tag--muted">Closed</span>
            </div>
            <p className="ed-tier__text">
              The original tier, and where it all started. Founding members
              shaped the club from night one, and their access never changes.
            </p>
            <ul className="ed-tier__list">
              <li>Every event, first</li>
              <li>Members-only gatherings</li>
              <li>The private community</li>
              <li>The group chat</li>
            </ul>
          </article>

          <article className="ed-tier">
            <div className="ed-tier__top">
              <h2 className="ed-tier__name">New Tiers</h2>
              <span className="ed-tag">Coming Soon</span>
            </div>
            <p className="ed-tier__text">
              The next chapter of Boston Watch Club. We&rsquo;re crafting new
              membership tiers with flexible pricing, exclusive perks, and
              early access for the people who get there first.
            </p>
            <ul className="ed-tier__list">
              <li>Flexible pricing</li>
              <li>Exclusive perks</li>
              <li>Early access for applicants</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ── How we gather ── */}
      <section className="ed-section" aria-label="How we gather">
        <span className="ed-label">How We Gather</span>
        <div className="ed-split">
          <h2 className="ed-statement">
            Most nights are open. The best ones are members only.
          </h2>
          <ul className="ed-deflist">
            <li className="ed-def">
              <span className="ed-def__term">Happy Hours &amp; Coffees</span>
              <span className="ed-def__detail">
                Casual, buy-your-own, and open to anyone who wants to talk
                watches in good company.
              </span>
            </li>
            <li className="ed-def">
              <span className="ed-def__term">Dinners &amp; Cigar Nights</span>
              <span className="ed-def__detail">
                Smaller rooms at Boston&rsquo;s best spots, reserved with a
                refundable deposit so every seat shows up.
              </span>
            </li>
            <li className="ed-def">
              <span className="ed-def__term">Brand &amp; Dealer Evenings</span>
              <span className="ed-def__detail">
                Time inside the brands and with the dealers worth knowing,
                arranged for the club.
              </span>
            </li>
            <li className="ed-def">
              <span className="ed-def__term">The Collector&rsquo;s Table</span>
              <span className="ed-def__detail">
                Members only. An intimate dinner with industry insiders, and
                our best night of the year.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ed-cta" aria-label="Apply">
        <h2 className="ed-cta__title">Ready to claim a seat?</h2>
        <p className="ed-cta__text">
          Membership is intentionally small, and spots are limited. Tell us
          who you are and what you collect, and we&rsquo;ll be in touch.
        </p>
        <div className="ed-cta__actions">
          <Link to="/apply" className="ed-btn">Apply Now</Link>
          <Link to="/faq" className="ed-textlink">Questions? Read the FAQ</Link>
        </div>
      </section>
    </div>
  )
}
