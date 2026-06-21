/**
 * NewJournal — /redesign/journal
 *
 * Cinematic page, same engine as home/membership (CineWatchSection). No header band.
 * Two photo-free watch sections:
 *   1. ROLEX Daytona (left)   — "LATEST DISPATCHES": discover drops down the 3 most
 *      recent Substack articles (title + date, link out) + Read all on Substack.
 *   2. RM 72-01 white (right) — "WHY WE WRITE": a short human blurb about the Journal.
 *
 * Data: GET /api/journal (Substack RSS, see api/journal.js). Posts auto-update.
 */

import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import CineWatchSection from '../../components/redesign/CineWatchSection'
import s from './NewJournal.module.css'

const SUBSTACK_URL = 'https://bostonwatchclub.substack.com'

const LATEST_SECTION = {
  id: 'latest', brand: 'Rolex', model: 'Cosmograph Daytona',
  eyebrowLabel: 'THE JOURNAL', title: 'LATEST DISPATCHES',
  image: '/assets/watches/rolex-daytona.png',
  glowImg: '/assets/watches/glow/g-slate.png',
  side: 'left', glow: 'rgba(58, 72, 96, 0.40)', glowColor: '#3A485C',
}
const ABOUT_SECTION = {
  id: 'about', brand: 'Richard Mille', model: 'RM 72-01',
  eyebrowLabel: 'THE JOURNAL', title: 'WHY WE WRITE',
  image: '/assets/watches/rm72-white.png',
  glowImg: '/assets/watches/glow/g-warmwhite.png',
  side: 'right', glow: 'rgba(140, 104, 62, 0.40)', glowColor: '#8C683E',
}

export default function NewJournal() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/journal')
      .then(r => r.json())
      .then(d => { if (active) setPosts(Array.isArray(d.posts) ? d.posts.slice(0, 3) : []) })
      .catch(() => { if (active) setPosts([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div className="kk-page">
      <Helmet>
        <title>The Journal | Boston Watch Club</title>
        <meta name="description" content="Stories, event recaps, market takes, and dispatches from Boston Watch Club. Published on Substack." />
      </Helmet>

      <div className="kk-noise-overlay" aria-hidden="true" />

      {/* ── 1. LATEST DISPATCHES — 3 most recent Substack articles ──────────── */}
      <CineWatchSection watch={LATEST_SECTION} index={0}>
        <div className={s.panel}>
          {loading ? null : posts.length === 0 ? (
            <p className={s.panelText}>
              New dispatches are on the way. Subscribe on Substack to read them first.
            </p>
          ) : (
            <ul className={s.articleList} aria-label="Recent articles">
              {posts.map(p => (
                <li key={p.id} className={s.articleItem}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className={s.articleLink}>
                    <span className={s.articleDate}>{p.date}</span>
                    <span className={s.articleTitle}>{p.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className={s.readAll}>
            Read all on Substack
          </a>
        </div>
      </CineWatchSection>

      {/* ── 2. WHY WE WRITE — human blurb ──────────────────────────────────── */}
      <CineWatchSection watch={ABOUT_SECTION} index={1}>
        <div className={s.panel}>
          <p className={s.panelText}>
            The Journal is where we write it all down. Event recaps, market takes, watches worth knowing, and the occasional rant. No corporate fluff, just the stuff we&rsquo;d text a friend who actually cares about this world. New pieces land on Substack first.
          </p>
        </div>
      </CineWatchSection>
    </div>
  )
}
