import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Generic hook to fetch from a Supabase table
function useTable(table, { orderBy = 'created_at', ascending = true, filter, enabled = true } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !enabled) {
      setLoading(false)
      return
    }
    let cancelled = false

    async function fetch() {
      let query = supabase.from(table).select('*')
      if (filter) {
        for (const [col, val] of Object.entries(filter)) {
          query = query.eq(col, val)
        }
      }
      if (orderBy) query = query.order(orderBy, { ascending })

      const { data: rows, error } = await query
      if (!cancelled) {
        if (error) console.error(`useTable(${table}):`, error)
        setData(rows || [])
        setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [table, orderBy, ascending, enabled, JSON.stringify(filter)])

  return { data, loading, setData }
}

// ── Specific hooks ──

export function useEvents() {
  return useTable('events', { orderBy: 'sort_order', ascending: true, filter: { status: 'published' } })
}

export function useAllEvents() {
  return useTable('events', { orderBy: 'sort_order', ascending: true })
}

export function useBlogPosts(status) {
  const filter = status ? { status } : undefined
  return useTable('blog_posts', { orderBy: 'sort_date', ascending: false, filter })
}

export function useClubNews() {
  return useTable('club_news', { orderBy: 'sort_date', ascending: false, filter: { status: 'published' } })
}

export function useAllClubNews() {
  return useTable('club_news', { orderBy: 'sort_date', ascending: false })
}

export function useDiscussions(status) {
  const filter = status ? { status } : undefined
  return useTable('discussions', { orderBy: 'sort_date', ascending: false, filter })
}

export function useAllDiscussions() {
  return useTable('discussions', { orderBy: 'sort_date', ascending: false })
}

export function useTiers() {
  return useTable('tiers', { orderBy: 'sort_order', ascending: true })
}

export function useBenefits() {
  return useTable('benefits', { orderBy: 'sort_order', ascending: true })
}

export function useFaqItems() {
  return useTable('faq_items', { orderBy: 'sort_order', ascending: true })
}

// Discussion with replies
export function useDiscussionReplies(discussionId) {
  return useTable('discussion_replies', {
    orderBy: 'created_at',
    ascending: true,
    filter: discussionId ? { discussion_id: discussionId } : undefined,
    enabled: !!discussionId,
  })
}

// Site content as a key-value map
export function useSiteContent() {
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let cancelled = false

    async function fetch() {
      const { data, error } = await supabase.from('site_content').select('*')
      if (!cancelled) {
        if (error) console.error('useSiteContent:', error)
        const map = {}
        if (data) data.forEach(row => { map[row.key] = row.value })
        setContent(map)
        setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [])

  return { content, loading }
}

// Discussions with their replies in one call
export function useDiscussionsWithReplies(status) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let cancelled = false

    async function fetch() {
      let query = supabase
        .from('discussions')
        .select('*, discussion_replies(*)')
        .order('sort_date', { ascending: false })

      if (status) query = query.eq('status', status)

      const { data: rows, error } = await query
      if (!cancelled) {
        if (error) console.error('useDiscussionsWithReplies:', error)
        // Map replies to the shape the frontend expects
        const mapped = (rows || []).map(d => ({
          ...d,
          replies: (d.discussion_replies || []).sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          ),
        }))
        setData(mapped)
        setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [status])

  return { data, loading, setData }
}
