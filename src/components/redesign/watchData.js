// ============================================================
//  WATCHES, the 9 cinematic sections for the /redesign page
//
//  ORDER rules satisfied: (1) light/bright tones never sit next to each other
//  (light on odd slots, dark/cool on even); (2) no two watches of the SAME
//  BRAND are ever adjacent. The club narrative (eyebrowLabel / title / clubInfo)
//  stays in story order by POSITION; only the watch image + glow change per slot.
//  Each glow is colour-matched to its own watch (RM27-03 Rafa -> orange, etc.).
//
//  Fields:
//    brand / model  , kept in data but NOT displayed
//    eyebrowLabel   , small category label (shown)
//    title          , big heading + button label (shown)
//    clubInfo       , text revealed when the section button is clicked
//    image          , /assets/watches/<file>.png (transparent)
//    glowImg        , /assets/watches/glow/g<position>.png (matches this slot)
//    side           , 'left' | 'right' (alternates by position)
//    glow / glowColor, placeholder fallback only
// ============================================================

export const WATCHES = [
  {
    id: 1,
    brand: 'Richard Mille',
    model: 'RM 27-03 Rafael Nadal',
    eyebrowLabel: 'THE CLUB',
    title: 'WHO WE ARE',
    clubInfo:
      'Boston\'s first real home for watch people. Collectors and enthusiasts brought together by a love of watches. No gatekeeping, no egos, whether it\'s your first good watch or your fiftieth.',
    image: '/assets/watches/rm27-03.png',
    glowImg: '/assets/watches/glow/g1.png',
    side: 'left',
    glow: 'rgba(224, 112, 30, 0.40)',
    glowColor: '#E0701E',
  },
  {
    id: 2,
    brand: 'Patek Philippe',
    model: '5271P-010',
    eyebrowLabel: 'OUR MISSION',
    title: 'WHY WE\'RE HERE',
    clubInfo:
      'Boston had the people and the passion but nowhere to bring them together, so we built it. A home to discover new pieces, meet people who get it, and enjoy the hobby instead of living it alone.',
    image: '/assets/watches/patek-5271.png',
    glowImg: '/assets/watches/glow/g2.png',
    side: 'right',
    glow: 'rgba(110, 134, 200, 0.40)',
    glowColor: '#6E86C8',
  },
  {
    id: 3,
    brand: 'F.P. Journe',
    model: 'Chronomètre Optimum',
    eyebrowLabel: 'WHAT WE OFFER',
    title: 'MONTHLY EVENTS',
    clubInfo:
      'At least two events a month: one curated night and one casual hang. Dinners, happy hours, cigar nights, brand and dealer evenings. Some open to everyone, some members only.',
    image: '/assets/watches/fpjourne-optimum.png',
    glowImg: '/assets/watches/glow/g3.png',
    side: 'left',
    glow: 'rgba(182, 160, 121, 0.38)',
    glowColor: '#B6A079',
  },
  {
    id: 4,
    brand: 'Audemars Piguet',
    model: 'Royal Oak Black Ceramic',
    eyebrowLabel: 'WHAT WE OFFER',
    title: 'MEMBERS-ONLY GATHERINGS',
    clubInfo:
      'The smaller, more personal side of the club. Intimate get-togethers over coffee, drinks, and food at Boston\'s best spots, where acquaintances become real friends.',
    image: '/assets/watches/ap-ro-blackceramic.png',
    glowImg: '/assets/watches/glow/g4.png',
    side: 'right',
    glow: 'rgba(122, 110, 150, 0.42)',
    glowColor: '#7A6E96',
  },
  {
    id: 5,
    brand: 'Patek Philippe',
    model: 'Golden Ellipse',
    eyebrowLabel: 'WHAT WE OFFER',
    title: 'PRIVATE COMMUNITY',
    clubInfo:
      'A tight-knit group of collectors who actually show up. We keep it selective on purpose, because the magic is a room full of people genuinely worth knowing. Quality over numbers.',
    image: '/assets/watches/patek-ellipse.png',
    glowImg: '/assets/watches/glow/g5.png',
    side: 'left',
    glow: 'rgba(210, 165, 60, 0.42)',
    glowColor: '#D2A53C',
  },
  {
    id: 6,
    brand: 'Berneron',
    model: 'Mirage',
    eyebrowLabel: 'WHAT WE OFFER',
    title: 'THE GROUP CHAT',
    clubInfo:
      'A members-only chat organized by profession: doctors, lawyers, financiers, watch specialists, and more. Need a second opinion or a trusted referral? The right person is a message away.',
    image: '/assets/watches/berneron-mirage.png',
    glowImg: '/assets/watches/glow/g6.png',
    side: 'right',
    glow: 'rgba(90, 126, 210, 0.40)',
    glowColor: '#5A7ED2',
  },
  {
    id: 7,
    brand: 'Audemars Piguet',
    model: 'Royal Oak Rainbow',
    eyebrowLabel: 'WHAT WE OFFER',
    title: 'MEMBER DIRECTORY',
    clubInfo:
      'More than names. Every member has a profile: who they are, what they do, and what they collect. Find the watchmaker, collector, or contact you need and reach out directly.',
    image: '/assets/watches/ap-rainbow-rosegold.png',
    glowImg: '/assets/watches/glow/g7.png',
    side: 'left',
    glow: 'rgba(210, 163, 94, 0.40)',
    glowColor: '#D2A35E',
  },
  {
    id: 8,
    brand: 'Richard Mille',
    model: 'RM 035',
    eyebrowLabel: 'WHAT WE OFFER',
    title: 'CITY ACCESS',
    clubInfo:
      'Membership opens doors around the city: reservations worth knowing, access inside brands and dealers, and introductions that lead somewhere. The more we grow, the more we unlock.',
    image: '/assets/watches/rm035.png',
    glowImg: '/assets/watches/glow/g8.png',
    side: 'right',
    glow: 'rgba(70, 100, 160, 0.40)',
    glowColor: '#4664A0',
  },
  {
    id: 9,
    brand: 'Cartier',
    model: 'Crash Skeleton',
    eyebrowLabel: 'MEMBERSHIP',
    title: 'READY TO JOIN',
    clubInfo:
      'Membership is intentionally small, and founding spots are limited. This is your invitation to claim a seat in Boston\'s watch community while the door is still open. Apply now.',
    image: '/assets/watches/cartier-crash.png',
    glowImg: '/assets/watches/glow/g1.png',
    side: 'left',
    glow: 'rgba(180, 70, 50, 0.40)',
    glowColor: '#B44632',
  },
]
