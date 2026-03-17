const hits = new Map()

/**
 * Simple in-memory rate limiter.
 *
 * NOTE: In-memory state does not persist across Vercel serverless invocations,
 * so this only protects against rapid-fire abuse within a single warm instance.
 * For production-grade limiting, use a Redis-backed solution.
 *
 * @param {import('http').IncomingMessage} req
 * @param {{ window?: number, max?: number }} opts
 * @returns {{ limited: boolean }}
 */
export function rateLimit(req, { window = 60_000, max = 10 } = {}) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  const now = Date.now()
  const entry = hits.get(ip)

  // Clean up expired entry
  if (entry && now - entry.start > window) {
    hits.delete(ip)
  }

  const current = hits.get(ip)

  if (!current) {
    hits.set(ip, { start: now, count: 1 })
    return { limited: false }
  }

  current.count += 1

  if (current.count > max) {
    return { limited: true }
  }

  return { limited: false }
}
