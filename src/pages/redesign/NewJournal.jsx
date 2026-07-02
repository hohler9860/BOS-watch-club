/**
 * NewJournal — /journal
 *
 * Editorial page on the shared ed- design system (editorial.css). The latest
 * Substack articles are visible immediately as hairline rows that link out.
 *
 * Data: GET /api/journal (Substack RSS, see api/journal.js). Posts auto-update.
 */

import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import './editorial.css'

const SUBSTACK_URL = 'https://bostonwatchclub.substack.com'

export default function NewJournal() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/journal')
      .then(r => r.json())
      .then(d => { if (active) setPosts(Array.isArray(d.posts) ? d.posts.slice(0, 6) : []) })
      .catch(() => { if (active) setPosts([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div className="kk-page ed-page">
      <Helmet>
        <title>The Journal | Boston Watch Club</title>
        <meta name="description" content="Stories, event recaps, market takes, and dispatches from Boston Watch Club. Published on Substack." />
      </Helmet>

      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── Hero ── */}
      <header className="ed-hero">
        <span className="ed-hero__eyebrow">Boston Watch Club</span>
        <h1 className="ed-hero__title">The Journal</h1>
        <p className="ed-hero__lede">
          Event recaps, market takes, watches worth knowing, and the occasional
          rant. No corporate fluff, just the stuff we&rsquo;d text a friend who
          actually cares about this world.
        </p>
      </header>

      {/* ── Latest dispatches ── */}
      <section className="ed-section" aria-label="Latest articles">
        <div className="ed-section__head">
          <span className="ed-label">Latest Dispatches</span>
          {posts.length > 0 && (
            <span className="ed-section__note">Published on Substack</span>
          )}
        </div>

        {loading ? null : posts.length === 0 ? (
          <div className="ed-empty">
            <p className="ed-empty__text">
              New dispatches are on the way. Subscribe on Substack and
              you&rsquo;ll read them first.
            </p>
            <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className="ed-btn">
              Subscribe on Substack
            </a>
          </div>
        ) : (
          <ul className="ed-rows ed-rows--wide-date">
            {posts.map(p => (
              <li key={p.id} className="ed-row">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-row__inner"
                >
                  <span className="ed-row__when">{p.date}</span>
                  <span className="ed-row__body">
                    <h3 className="ed-row__title">{p.title}</h3>
                  </span>
                  <span className="ed-row__cue">Read&nbsp;&nbsp;&rarr;</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="ed-cta" aria-label="Subscribe">
        <h2 className="ed-cta__title">New pieces land on Substack first.</h2>
        <p className="ed-cta__text">
          Subscribe and every dispatch arrives in your inbox the moment we
          publish it.
        </p>
        <div className="ed-cta__actions">
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className="ed-btn">
            Read on Substack
          </a>
        </div>
      </section>
    </div>
  )
}
