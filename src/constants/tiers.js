export const TIER_COLORS = {
  ENTHUSIAST: { bg: 'rgba(160, 170, 180, 0.1)', border: 'rgba(160, 170, 180, 0.25)', text: '#A0AAB4' },
  COLLECTOR: { bg: 'rgba(184, 196, 212, 0.08)', border: 'rgba(184, 196, 212, 0.25)', text: '#B8C4D4' },
  PATRON: { bg: 'rgba(184, 196, 212, 0.12)', border: 'rgba(184, 196, 212, 0.35)', text: '#B8C4D4' },
}

export const TIER_RANK = { free: -1, enthusiast: 0, student: 0, collector: 1, patron: 2 }

export const ROLE_RANK = { free: 0, member: 1, founding_member: 2, vip: 3 }

export function tierMeetsMinimum(memberTier, requiredTier) {
  const memberRank = TIER_RANK[memberTier?.toLowerCase()] ?? 0
  const requiredRank = TIER_RANK[requiredTier?.toLowerCase()] ?? 0
  return memberRank >= requiredRank
}

export function roleMeetsMinimum(userRole, requiredRole) {
  const userRank = ROLE_RANK[userRole] ?? 0
  const requiredRank = ROLE_RANK[requiredRole] ?? 0
  return userRank >= requiredRank
}
