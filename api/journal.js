/**
 * GET /api/journal
 *
 * Fetches the Boston Watch Club Substack publication feed, parses it into a
 * clean JSON array, and returns it for the Journal page to render.
 *
 * Why a serverless function (not a client fetch or a build-time fetch):
 *   - Substack's RSS feed sends no CORS headers, so the browser can't read it directly.
 *   - Fetching here, server-side, lets new Substack posts appear on the Journal
 *     automatically — no redeploy needed. The CDN caches the response ~1h.
 *
 * Source feed: https://bostonwatchclub.substack.com/feed
 */

const FEED_URL = 'https://bostonwatchclub.substack.com/feed'

// ── tiny helpers ─────────────────────────────────────────────────────────────

// Pull the inner text of <tag>…</tag> from a chunk, unwrapping CDATA if present.
function tag(chunk, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i')
  const m = chunk.match(re)
  if (!m) return ''
  return m[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1').trim()
}

// Decode the handful of HTML entities that show up in feed text.
function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8230;|&hellip;/g, '…')
}

// Strip HTML tags → plain text, collapse whitespace.
function strip(html) {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function excerpt(html, max = 220) {
  const text = strip(html)
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

// Cover image: prefer <enclosure url="…">, fall back to first <img> in the body.
function coverImage(itemChunk, contentHtml) {
  const enc = itemChunk.match(/<enclosure\s[^>]*url="([^"]+)"/i)
  if (enc) return enc[1]
  const img = contentHtml.match(/<img[^>]*\ssrc="([^"]+)"/i)
  return img ? img[1] : ''
}

function formatDate(pubDate) {
  if (!pubDate) return ''
  const d = new Date(pubDate)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function parseFeed(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || []
  return items.map((chunk) => {
    const content = tag(chunk, 'content:encoded')
    const link = tag(chunk, 'link')
    const pubDate = tag(chunk, 'pubDate')
    return {
      id: tag(chunk, 'guid') || link,
      title: decode(tag(chunk, 'title')),
      url: link,
      date: formatDate(pubDate),
      isoDate: pubDate ? new Date(pubDate).toISOString() : '',
      author: decode(tag(chunk, 'dc:creator')),
      excerpt: excerpt(tag(chunk, 'description') || content),
      image: coverImage(chunk, content),
    }
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const r = await fetch(FEED_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (BostonWatchClub Journal)' },
    })
    if (!r.ok) throw new Error(`Substack feed responded ${r.status}`)

    const xml = await r.text()
    const posts = parseFeed(xml)

    // Cache at the edge for an hour; serve stale for a day while revalidating.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({ posts })
  } catch (err) {
    console.error('[api/journal] failed to load Substack feed:', err)
    // Degrade gracefully: the page shows its empty state rather than an error.
    res.setHeader('Cache-Control', 's-maxage=60')
    return res.status(200).json({ posts: [], error: 'feed_unavailable' })
  }
}
