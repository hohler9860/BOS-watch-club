/**
 * Fetches content from Notion databases and writes to src/data/ files.
 * Run before build: node scripts/fetch-notion.js
 *
 * Required env vars:
 *   NOTION_API_KEY          — Internal integration token
 *   NOTION_EVENTS_DB_ID     — Database ID for events
 *   NOTION_BLOG_DB_ID       — Database ID for blog posts
 *   NOTION_NEWS_DB_ID       — Database ID for news/updates
 *
 * If any env var is missing, that data source is skipped and
 * the existing hardcoded file is left untouched.
 */

import 'dotenv/config'
import { Client } from '@notionhq/client'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../src/data')

const notion = process.env.NOTION_API_KEY
  ? new Client({ auth: process.env.NOTION_API_KEY })
  : null

if (!notion) {
  console.log('[notion] No NOTION_API_KEY found — skipping Notion sync, using existing data files.')
  process.exit(0)
}

// ── Helpers ──────────────────────────────────────────────────

function prop(page, name) {
  const p = page.properties[name]
  if (!p) return null
  switch (p.type) {
    case 'title':
      return p.title.map(t => t.plain_text).join('')
    case 'rich_text':
      return p.rich_text.map(t => t.plain_text).join('')
    case 'number':
      return p.number
    case 'select':
      return p.select?.name ?? null
    case 'date':
      return p.date?.start ?? null
    case 'checkbox':
      return p.checkbox
    case 'url':
      return p.url
    case 'files':
      return p.files?.[0]?.file?.url ?? p.files?.[0]?.external?.url ?? null
    default:
      return null
  }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function monthAbbr(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
}

function dayOfMonth(isoDate) {
  if (!isoDate) return ''
  return String(new Date(isoDate).getDate())
}

async function queryAll(databaseId) {
  const pages = []
  let cursor
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    })
    pages.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return pages
}

// ── Events ───────────────────────────────────────────────────

async function fetchEvents() {
  const dbId = process.env.NOTION_EVENTS_DB_ID
  if (!dbId) {
    console.log('[notion] No NOTION_EVENTS_DB_ID — skipping events.')
    return
  }

  console.log('[notion] Fetching events...')
  const pages = await queryAll(dbId)

  const events = pages.map(page => {
    const name = prop(page, 'Name') || prop(page, 'name') || ''
    const datetime = prop(page, 'Date') || prop(page, 'date') || ''
    const endTime = prop(page, 'End Time') || prop(page, 'end_time') || ''

    return {
      id: slugify(name),
      month: monthAbbr(datetime),
      day: dayOfMonth(datetime),
      name: name.toUpperCase(),
      tagline: prop(page, 'Tagline') || prop(page, 'tagline') || '',
      description: (prop(page, 'Description') || prop(page, 'description') || '').toUpperCase(),
      longDescription: prop(page, 'Long Description') || prop(page, 'long_description') || '',
      location: (prop(page, 'Location') || prop(page, 'location') || '').toUpperCase(),
      venue: prop(page, 'Venue') || prop(page, 'venue') || '',
      date: formatDate(datetime),
      time: endTime
        ? `${new Date(datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${endTime}`
        : '',
      datetime,
      access: prop(page, 'Access') || prop(page, 'access') || 'All Members',
      capacity: prop(page, 'Capacity') || prop(page, 'capacity') || '',
      dressCode: prop(page, 'Dress Code') || prop(page, 'dress_code') || '',
      image: prop(page, 'Image') || prop(page, 'image') || '',
      payment_type: prop(page, 'Payment Type') || prop(page, 'payment_type') || 'on_us',
      price: prop(page, 'Price') || prop(page, 'price') || null,
      tier_minimum: prop(page, 'Tier Minimum') || prop(page, 'tier_minimum') || 'enthusiast',
      cancellation_fee: prop(page, 'Cancellation Fee') || prop(page, 'cancellation_fee') || null,
    }
  })

  const out = `// Auto-generated from Notion — do not edit manually\n// Last synced: ${new Date().toISOString()}\nconst events = ${JSON.stringify(events, null, 2)}\n\nexport default events\n`
  writeFileSync(resolve(DATA_DIR, 'events.js'), out)
  console.log(`[notion] Wrote ${events.length} events.`)
}

// ── Blog Posts ───────────────────────────────────────────────

async function fetchBlogPosts() {
  const dbId = process.env.NOTION_BLOG_DB_ID
  if (!dbId) {
    console.log('[notion] No NOTION_BLOG_DB_ID — skipping blog posts.')
    return
  }

  console.log('[notion] Fetching blog posts...')
  const pages = await queryAll(dbId)

  const posts = pages.map(page => {
    const title = prop(page, 'Title') || prop(page, 'title') || prop(page, 'Name') || prop(page, 'name') || ''
    const date = prop(page, 'Date') || prop(page, 'date') || ''

    return {
      id: slugify(title),
      title: title.toUpperCase(),
      excerpt: prop(page, 'Excerpt') || prop(page, 'excerpt') || '',
      date: formatDate(date),
      image: prop(page, 'Image') || prop(page, 'image') || '',
      substackUrl: prop(page, 'URL') || prop(page, 'url') || prop(page, 'Substack URL') || '',
    }
  })

  const out = `// Auto-generated from Notion — do not edit manually\n// Last synced: ${new Date().toISOString()}\nconst blogPosts = ${JSON.stringify(posts, null, 2)}\n\nexport default blogPosts\n`
  writeFileSync(resolve(DATA_DIR, 'blogPosts.js'), out)
  console.log(`[notion] Wrote ${posts.length} blog posts.`)
}

// ── News / Updates ───────────────────────────────────────────

async function fetchNews() {
  const dbId = process.env.NOTION_NEWS_DB_ID
  if (!dbId) {
    console.log('[notion] No NOTION_NEWS_DB_ID — skipping news.')
    return
  }

  console.log('[notion] Fetching news...')
  const pages = await queryAll(dbId)

  const news = pages.map((page, i) => {
    const title = prop(page, 'Title') || prop(page, 'title') || prop(page, 'Name') || prop(page, 'name') || ''
    const date = prop(page, 'Date') || prop(page, 'date') || ''

    return {
      id: i + 1,
      title,
      date: formatDate(date),
      sortDate: date,
      preview: prop(page, 'Preview') || prop(page, 'preview') || '',
      body: prop(page, 'Body') || prop(page, 'body') || '',
      read: false,
    }
  })

  const out = `// Auto-generated from Notion — do not edit manually\n// Last synced: ${new Date().toISOString()}\nexport const CLUB_NEWS = ${JSON.stringify(news, null, 2)}\n`
  writeFileSync(resolve(DATA_DIR, 'clubNews.js'), out)
  console.log(`[notion] Wrote ${news.length} news items.`)
}

// ── Run ──────────────────────────────────────────────────────

async function main() {
  console.log('[notion] Starting Notion sync...')
  try {
    await Promise.all([fetchEvents(), fetchBlogPosts(), fetchNews()])
    console.log('[notion] Sync complete.')
  } catch (err) {
    console.error('[notion] Sync failed:', err.message)
    console.log('[notion] Continuing build with existing data files.')
    process.exit(0) // don't fail the build
  }
}

main()
