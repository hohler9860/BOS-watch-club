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
      'Boston Watch Club is Boston\'s first and only watch community, born from a shared obsession with timepieces and the culture around them. Built for collectors, enthusiasts, and everyone in between.',
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
      'We built the community Boston was missing. The mission is simple: give Boston a home for watch culture, a place to discover, connect, and experience it with people who share the passion. Own one watch or twenty; great events, great people, time well spent.',
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
      'Monthly Events, at least two a month. One bigger curated night, one casual hangout. The more you show up, the stronger your network gets.',
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
      'Members-Only Gatherings, private get-togethers over coffee, drinks, and food at some of Boston\'s best spots. Conversation and connections that go beyond the watch world.',
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
      'Private Community, a small, tight-knit group of collectors and enthusiasts who actually show up. The people in this room are worth knowing.',
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
      'The Group Chat, the one that actually gets used. Watch talk, event updates, and direct access to everyone in your network, anytime.',
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
      'Member Directory, direct access to the people you want in your network. Know who they are, what they collect, and how to reach them.',
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
      'City Access, as BWC grows, so does what we unlock: better venues, bigger experiences, and a network that opens doors across Boston and beyond.',
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
      'Membership is intentionally small. This is your invitation to claim a place in Boston\'s watch community, apply now.',
    image: '/assets/watches/patek-skeleton.png',
    glowImg: '/assets/watches/glow/g9.png',
    side: 'left',
    glow: 'rgba(210, 150, 82, 0.40)',
    glowColor: '#D29652',
  },
]
