import { useState, useEffect } from 'react'
import FadeIn from '../../components/shared/FadeIn'
import BlurImage from '../../components/shared/BlurImage'
import s from '../DashboardPage.module.css'

/**
 * JournalTab — member dashboard "Journal" tab.
 *
 * The Journal is published on Substack (consistent with the redesign /redesign/journal).
 * Posts are fetched from /api/journal (parses the BWC Substack RSS) and clicking a card
 * opens the post on Substack. The legacy `blogPosts`/`setSelectedPost` props are no longer
 * used — kept in the signature so the parent (DashboardPage) needs no change.
 */
export default function JournalTab() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/journal')
      .then(r => r.json())
      .then(d => { if (active) setPosts(Array.isArray(d.posts) ? d.posts : []) })
      .catch(() => { if (active) setPosts([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function openPost(url) {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={s.tabContent}>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>The Journal</h1>
          <p className={s.pageSubtitle}>Event recaps, collector stories, and watch culture</p>
        </div>
      </FadeIn>

      <div className={s.blogGrid}>
        {!loading && posts.length === 0 && (
          <FadeIn>
            <div className={s.empty}>
              <p className={s.emptyTitle}>No posts yet</p>
              <p className={s.emptyText}>
                New stories are published on Substack. Check back soon.
              </p>
            </div>
          </FadeIn>
        )}
        {posts.map((post, i) => (
          <FadeIn key={post.id} delay={`${0.05 * i}s`}>
            <div className={s.blogCard} onClick={() => openPost(post.url)} style={{ cursor: 'pointer' }}>
              {post.image && (
                <div className={s.blogImage}>
                  <BlurImage src={post.image} alt={post.title} />
                </div>
              )}
              <div className={s.blogBody}>
                <span className={s.blogDate}>{post.date}</span>
                <h3 className={s.blogTitle}>{post.title}</h3>
                <p className={s.blogExcerpt}>{post.excerpt}</p>
                <span className={s.blogLink}>READ ON SUBSTACK &rarr;</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
