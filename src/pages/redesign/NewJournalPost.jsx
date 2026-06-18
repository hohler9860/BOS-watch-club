/**
 * NewJournalPost — /redesign/journal/:id
 *
 * Kettle Kids reskin of JournalPostPage.
 *
 * DATA LOGIC: copied verbatim from JournalPostPage.jsx — same Supabase query,
 * same useParams(:id), same useAuth() back-link logic, same BlurImage src
 * resolution. Nothing about the data layer changes.
 *
 * PRESENTATION: entirely new — white background, ABC Marist display headings,
 * Georgia serif body prose, centered 740px column, clean date/category eyebrow,
 * full-bleed hero image, and a "Back to Journal" link that stays inside
 * /redesign/journal.
 *
 * DO NOT change: data fetch, useParams, useAuth, supabase import, BlurImage src
 * resolution logic.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import BlurImage from '../../components/shared/BlurImage'
import FadeIn from '../../components/shared/FadeIn'
import s from './NewJournalPost.module.css'

// ── Heuristic: same logic as JournalPostPage — short line followed by longer
// one is treated as a section heading. Kept identical so content renders
// consistently across both pages.
function renderBody(rawText) {
  if (!rawText) return null
  const lines = rawText.split('\n')
  return lines.map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <br key={i} />
    const nextLine = lines[i + 1]?.trim()
    const isHeading = trimmed.length < 60 && nextLine && nextLine.length > trimmed.length
    return isHeading
      ? <h2 key={i} className={s.subheading}>{trimmed}</h2>
      : <p key={i}>{trimmed}</p>
  })
}

export default function NewJournalPost() {
  // ── Data (verbatim from JournalPostPage) ───────────────────────────────────
  const { id } = useParams()
  const navigate = useNavigate()

  // Back link: always /redesign/journal. Unlike the old JournalPostPage which
  // checked useAuth() and sent members to /dashboard?tab=blogs, this page only
  // lives inside /redesign and always returns to the redesign journal index.
  const journalBack = '/redesign/journal'

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return }
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      setPost(data)
      setLoading(false)
    }
    load()
  }, [id])

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={s.loading}>
        <div className={s.spinner} aria-label="Loading post…" role="status" />
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!post) {
    return (
      <div className={s.notFound}>
        <Helmet><title>Post Not Found | Boston Watch Club</title></Helmet>
        <p className={s.notFoundText}>Post not found.</p>
        <button className={s.back} onClick={() => navigate(journalBack)}>
          &larr; Back to Journal
        </button>
      </div>
    )
  }

  // ── Resolve image src (verbatim from JournalPostPage) ─────────────────────
  const heroSrc = post.image
    ? (post.image.startsWith('http')
        ? post.image
        : `${import.meta.env.BASE_URL}assets/${post.image}`)
    : null

  const bodyText = post.content || post.body

  return (
    <>
      <Helmet>
        <title>{post.title} | Boston Watch Club Journal</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Helmet>

      {/* ── Header band: back link ──────────────────────────────────────────── */}
      <div className={s.header}>
        <div className={s.headerInner}>
          <button
            className={s.back}
            onClick={() => navigate(journalBack)}
            aria-label="Back to Journal"
          >
            &larr; The Journal
          </button>
        </div>
      </div>

      {/* ── Article ────────────────────────────────────────────────────────── */}
      <div className={s.article}>
        <div className={s.container}>

          {/* Hero image — full-bleed via CSS negative margins */}
          {heroSrc && (
            <div className={s.hero}>
              <BlurImage src={heroSrc} alt={post.title} />
            </div>
          )}

          {/* Eyebrow: date + category */}
          <FadeIn>
            <div className={s.meta}>
              {post.date && <span className={s.date}>{post.date}</span>}
              {post.category && <span className={s.category}>{post.category}</span>}
            </div>
          </FadeIn>

          {/* Title */}
          <FadeIn>
            <h1 className={s.title}>{post.title}</h1>
          </FadeIn>

          {/* Author byline */}
          {post.author && (
            <FadeIn>
              <p className={s.author}>By {post.author}</p>
            </FadeIn>
          )}

          {/* Body prose */}
          <FadeIn>
            <div className={s.body}>
              {bodyText
                ? renderBody(bodyText)
                : <p>{post.excerpt}</p>
              }
            </div>
          </FadeIn>

          {/* Bottom divider + back link */}
          <hr className={s.divider} />
          <button
            className={s.back}
            onClick={() => navigate(journalBack)}
            aria-label="Back to Journal"
          >
            &larr; The Journal
          </button>

        </div>
      </div>
    </>
  )
}
