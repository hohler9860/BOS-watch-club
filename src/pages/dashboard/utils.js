import { tierMeetsMinimum } from '../../constants/tiers'

// Returns true if the member can access the event:
// - Must meet the tier minimum, AND
// - If invited_users is a non-empty array, the member must be in it.
export function canAccessEvent(event, memberId, memberTier) {
  if (!tierMeetsMinimum(memberTier, event.tier_minimum)) return false
  if (event.invited_users && event.invited_users.length > 0) {
    return event.invited_users.includes(memberId)
  }
  return true
}

export function getPaymentBadge(event) {
  if (event.deposit_amount > 0) {
    return { label: '$' + (event.deposit_amount / 100) + ' DEPOSIT', className: 'payBadgeGold' }
  }
  switch (event.payment_type) {
    case 'on_us': return { label: 'Free', className: 'payBadgeFree' }
    case 'pay_during': return { label: 'Pay Your Own', className: 'payBadgeGray' }
    case 'pay_after': return { label: 'Pay at Event', className: 'payBadgeGray' }
    case 'upfront': return { label: `$${event.price}, Payment Required`, className: 'payBadgeGold' }
    default: return null
  }
}

export function getRsvpMessage(event) {
  if (event.deposit_amount > 0) {
    return 'A $' + (event.deposit_amount / 100) + ' refundable deposit is required. You\'ll only be charged if you don\'t show up.'
  }
  switch (event.payment_type) {
    case 'on_us': return "This one's on us. No payment needed."
    case 'pay_during': return "No upfront payment. Just cover your own tab at the event."
    case 'pay_after': return "No upfront payment. The bill will be split at the end of the event."
    case 'upfront': return `This event requires a $${event.price} payment to reserve your spot.`
    default: return ''
  }
}

export function getRsvpButtonLabel(event) {
  if (event.deposit_amount > 0) return 'PAY $' + (event.deposit_amount / 100) + ' DEPOSIT & RSVP'
  if (event.payment_type === 'upfront') return `Pay & RSVP, $${event.price}`
  return 'Confirm RSVP'
}

export function getGoingLabel(event) {
  if (event.payment_type === 'upfront') return 'Spot Reserved \u2713'
  return 'Going \u2713'
}

export function isWithin24Hours(event) {
  if (!event.datetime) return false
  const eventTime = new Date(event.datetime).getTime()
  if (isNaN(eventTime)) return false
  const now = Date.now()
  return (eventTime - now) < 24 * 60 * 60 * 1000
}

export function getTierLabel(tierMinimum) {
  return 'Members Only'
}
