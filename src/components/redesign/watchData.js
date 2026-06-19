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
      'Boston Watch Club is the city\'s first real home for watch people. We are collectors, enthusiasts, and the genuinely curious, brought together by a love of watches and the culture around them. No gatekeeping, no egos. Whether this is your first good watch or your fiftieth, there is a seat here for you.',
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
      'Boston has the people and the passion. It was just missing the place to bring them together, so we built it. The mission is simple: give the city a home for watch culture, somewhere to discover new pieces, meet people who get it, and enjoy the hobby instead of living it alone behind a screen. Own one watch or twenty. Great watches, great people, time well spent.',
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
      'At least two events a month. One bigger, curated night and one easy, casual hang. Think dinners, happy hours, cigar nights, brand and dealer evenings, and the occasional something special. Some are open to everyone, some are members only. The more you show up, the more the room starts to feel like yours.',
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
      'The smaller, more personal side of the club. Private get-togethers over coffee, drinks, and food at some of Boston\'s best spots, kept intimate on purpose. This is where acquaintances become real friends, and where the conversation goes well beyond watches.',
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
      'A small, tight-knit group of collectors and enthusiasts who actually show up. We keep it selective on purpose, not to be exclusive for its own sake, but because the magic is a room full of people genuinely worth knowing. Quality over numbers, always.',
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
      'The members-only group chat. It is organized into channels by profession, so you can ask the right people the right questions: doctors, lawyers, financiers, watch specialists, and more. Hunting a reference, want a second opinion on a deal, or need a trusted referral? The right person is a message away. Plus watch talk, event updates, and direct access to your whole network, anytime.',
    image: '/assets/watches/berneron-mirage.png',
    glowImg: '/assets/watches/glow/g6.png',
    side: 'right',
    glow: 'rgba(90, 126, 210, 0.40)',
    glowColor: '#5A7ED2',
  },
  {
    id: 7,
    brand: 'F.P. Journe',
    model: 'Tourbillon Souverain',
    eyebrowLabel: 'WHAT WE OFFER',
    title: 'MEMBER DIRECTORY',
    clubInfo:
      'More than a list of names. Every member has a profile: who they are, what they do, what they collect, and how to reach them. Looking for a watchmaker you can trust, a collector who owns the reference you are chasing, or someone in your own field? Find them in seconds and reach out directly. It turns a room full of strangers into a network you can actually use.',
    image: '/assets/watches/fpjourne-tourbillon.png',
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
      'Being a member opens doors around the city. Reservations at the spots worth knowing, time inside brands, boutiques, and dealers most people never get, and introductions that actually lead somewhere. As Boston Watch Club grows, so does what we can unlock, here first and in the cities we expand to next.',
    image: '/assets/watches/rm035.png',
    glowImg: '/assets/watches/glow/g8.png',
    side: 'right',
    glow: 'rgba(70, 100, 160, 0.40)',
    glowColor: '#4664A0',
  },
  {
    id: 9,
    brand: 'Patek Philippe',
    model: 'Squelette',
    eyebrowLabel: 'MEMBERSHIP',
    title: 'READY TO JOIN',
    clubInfo:
      'Membership is intentionally small, and founding spots are limited. This is your invitation to claim a seat in Boston\'s watch community while the door is still open. Apply now.',
    image: '/assets/watches/patek-skeleton.png',
    glowImg: '/assets/watches/glow/g9.png',
    side: 'left',
    glow: 'rgba(210, 150, 82, 0.40)',
    glowColor: '#D29652',
  },
]
