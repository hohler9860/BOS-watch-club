/**
 * NewJournal — /redesign/journal
 *
 * Substack-powered Journal. Henry writes on Substack
 * (bostonwatchclub.substack.com); posts show up here automatically.
 *
 * Data source: GET /api/journal — a serverless function that fetches and parses
 * the Substack RSS feed (see api/journal.js). Each post: { id, title, url, date,
 * author, excerpt, image }. Clicking a post opens it on Substack in a new tab.
 *
 * Presentation layer (unchanged Kettle Kids editorial style):
 *   - White (#fff) / off-white (#F8F7F7) background
 *   - ABC Marist / Georgia heading font
 *   - Clean editorial hero (no background photo)
 *   - Cards: flat border, subtle hover shadow — no rounded corners
 *   - Empty-state CTA: solid black rectangle button
 */

import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import FadeIn from '../../components/shared/FadeIn'
import BlurImage from '../../components/shared/BlurImage'
import CineButton from '../../components/redesign/CineButton'
import styles from './NewJournal.module.css'

const SUBSTACK_URL = 'https://bostonwatchclub.substack.com'

function openPost(url) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

export default function NewJournal() {
  // ── Data: Substack feed via /api/journal ───────────────────────────────────
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/journal')
      .then(r => r.json())
      .then(d => { if (active) setBlogPosts(Array.isArray(d.posts) ? d.posts : []) })
      .catch(() => { if (active) setBlogPosts([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div className={styles.page}>
      <Helmet>
        <title>The Journal — Boston Watch Club</title>
        <meta name="description" content="Stories, event recaps, and insights from Boston Watch Club members. Horology culture, collector spotlights, and community updates." />
      </Helmet>

      {/* ── Editorial masthead ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <FadeIn>
          <h1 className={styles.heroTitle}>The Journal</h1>
        </FadeIn>
        <FadeIn>
          <p className={styles.heroSubtitle}>
            Event recaps, collector stories, and dispatches from the Boston Watch Club.
          </p>
        </FadeIn>
      </section>

      {/* ── Posts ───────────────────────────────────────────────────────────── */}
      <section className={styles.posts}>
        {loading ? null : blogPosts.length === 0 ? (
          <FadeIn>
            <div className={styles.empty}>
              <h2 className={styles.emptyTitle}>Nothing here yet</h2>
              <p className={styles.emptyText}>
                New stories and recaps are on the way. Subscribe on Substack to read them first.
              </p>
              <CineButton
                style={{ height: 48, marginTop: 0 }}
                onClick={() => openPost(SUBSTACK_URL)}
              >
                Read us on Substack
              </CineButton>
            </div>
          </FadeIn>
        ) : (
          <div className={styles.grid}>
            {blogPosts.map((post, i) => (
              <FadeIn key={post.id} delay={`${0.05 * i}s`}>
                <article
                  className={styles.card}
                  onClick={() => openPost(post.url)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openPost(post.url)
                    }
                  }}
                  aria-label={`Read on Substack: ${post.title}`}
                >
                  {/* Cover image from the Substack post */}
                  {post.image ? (
                    <div className={styles.imageWrap}>
                      <BlurImage src={post.image} alt={post.title} />
                    </div>
                  ) : (
                    <div className={styles.imagePlaceholder} aria-hidden="true" />
                  )}

                  <div className={styles.body}>
                    <span className={styles.date}>{post.date}</span>
                    <h2 className={styles.postTitle}>{post.title}</h2>
                    <p className={styles.excerpt}>{post.excerpt}</p>
                    <CineButton
                      type="button"
                      onClick={e => { e.stopPropagation(); openPost(post.url) }}
                      style={{ height: 40, marginTop: 8, alignSelf: 'flex-start' }}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      Read on Substack
                    </CineButton>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
