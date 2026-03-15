// ═══════════════════════════════════════════
// ADMIN MOCK DATA
// TODO: Replace all hardcoded data with Supabase queries
// ═══════════════════════════════════════════

export const ADMIN_CREDENTIALS = {
  email: 'admin@boswatchclub.com',
  password: 'admin123',
}

// Valid access codes for the activate flow
// TODO: Store in Supabase access_codes table
export const VALID_ACCESS_CODES = [
  { code: 'BWC-A7K2M9X1', tier: 'COLLECTOR', used: false },
  { code: 'BWC-R3T8P5Q2', tier: 'ENTHUSIAST', used: false },
  { code: 'BWC-J6N4W1Y8', tier: 'PATRON', used: false },
]

export function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'BWC-'
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// ═══════════════════════════════════════════
// MEMBERS
// TODO: Replace with Supabase members table query
// ═══════════════════════════════════════════
export const ADMIN_MEMBERS = [
  {
    id: 1, name: 'Stelios H.', email: 'stelios@boswatch.club', tier: 'COLLECTOR',
    status: 'active', joinDate: '2026-03-04', accessCode: 'BWC-A7K2M9X1',
    bio: 'Mechanical engineer by day, watch geek by night.',
    collects: 'Rolex, Tudor, Omega',
    favoriteWatch: 'Rolex Submariner 5513 (1969)',
    location: 'Back Bay, Boston',
    instagram: '@stelios_watches',
    notes: '', applicationAnswers: {
      reason: 'Lifelong watch enthusiast, mechanical engineer. Want to connect with Boston-area collectors.',
      collection: 'Rolex Submariner 5513, Tudor BB58, Omega Seamaster 300',
      referral: 'Found via Instagram',
    },
    rsvps: ['wrist-and-whiskey', 'collectors-table-dinner'],
    payments: [2],
  },
  {
    id: 2, name: 'James K.', email: 'james@boswatch.club', tier: 'PATRON',
    status: 'active', joinDate: '2026-03-04', accessCode: 'BWC-J6N4W1Y8',
    bio: 'Finance professional and lifelong collector.',
    collects: 'Patek Philippe, A. Lange & Söhne',
    favoriteWatch: 'Patek Philippe Nautilus 5711/1A',
    location: 'Beacon Hill, Boston',
    instagram: '@jk_horology',
    notes: 'Founding patron. Very engaged.', applicationAnswers: {
      reason: 'Finance professional, lifelong collector. Looking for high-level community.',
      collection: 'Patek Philippe Nautilus, A. Lange Zeitwerk, Rolex Daytona',
      referral: 'Friend of co-founder',
    },
    rsvps: ['wrist-and-whiskey', 'brand-dinner-iwc', 'collectors-table-dinner'],
    payments: [1, 5],
  },
  {
    id: 3, name: 'Marcus T.', email: 'marcus@boswatch.club', tier: 'ENTHUSIAST',
    status: 'active', joinDate: '2026-03-06', accessCode: 'BWC-R3T8P5Q2',
    bio: 'Software dev into Seiko modding.',
    collects: 'Seiko, Casio, Orient',
    favoriteWatch: 'Seiko SPB143 (62MAS reissue)',
    location: 'Cambridge, MA',
    instagram: '@marcus_wrist',
    notes: '', applicationAnswers: {
      reason: 'Software dev into Seiko modding. Want to learn from experienced collectors.',
      collection: 'Seiko SPB143, Orient Kamasu, Casio G-Shock Square',
      referral: 'Reddit r/watches',
    },
    rsvps: ['wrist-and-whiskey', 'coffee-and-chronographs'],
    payments: [3],
  },
  {
    id: 4, name: 'Sarah M.', email: 'sarah@boswatch.club', tier: "COLLECTOR",
    status: 'active', joinDate: '2026-03-10', accessCode: 'BWC-F2H9L4K7',
    bio: 'Interior designer with an eye for detail.',
    collects: 'Cartier, Jaeger-LeCoultre',
    favoriteWatch: 'Cartier Tank Must (small)',
    location: 'Brookline, MA',
    instagram: '@sarah_timeless',
    notes: '', applicationAnswers: {
      reason: 'Interior designer passionate about horology. Looking to connect with fellow collectors.',
      collection: 'Cartier Tank Must, JLC Reverso',
      referral: 'Instagram @boswatchclub',
    },
    rsvps: ['newbury-watch-walk'],
    payments: [8],
  },
  {
    id: 5, name: 'David R.', email: 'david@boswatch.club', tier: 'COLLECTOR',
    status: 'active', joinDate: '2026-03-08', accessCode: 'BWC-T5M3V8N6',
    bio: 'Attorney and vintage watch enthusiast. Also a certified watchmaker.',
    collects: 'Omega, Breitling, Heuer',
    favoriteWatch: 'Omega Speedmaster 105.012 (pre-moon)',
    location: 'South End, Boston',
    instagram: '@david_chrono',
    notes: 'Certified watchmaker — can help at events.', applicationAnswers: {
      reason: 'Attorney and vintage chronograph collector. Also a certified watchmaker.',
      collection: 'Omega Speedmaster pre-moon, Heuer Autavia, Breitling Navitimer',
      referral: 'Colleague referral',
    },
    rsvps: ['wrist-and-whiskey', 'collectors-table-dinner', 'brand-dinner-iwc'],
    payments: [4],
  },
  {
    id: 6, name: 'Tom B.', email: 'tom.b@gmail.com', tier: 'ENTHUSIAST',
    status: 'pending', joinDate: '2026-03-15', accessCode: null,
    bio: '', collects: '', favoriteWatch: '', location: '', instagram: '',
    notes: '', applicationAnswers: {
      reason: 'Just got into watches after inheriting my grandfather\'s Omega. Want to learn more.',
      collection: 'Omega Constellation 1969 (inherited), Apple Watch (daily)',
      referral: 'Google search',
    },
    rsvps: [],
    payments: [],
  },
  {
    id: 7, name: 'Elena V.', email: 'elena.v@outlook.com', tier: 'COLLECTOR',
    status: 'pending', joinDate: '2026-03-16', accessCode: null,
    bio: '', collects: '', favoriteWatch: '', location: '', instagram: '',
    notes: '', applicationAnswers: {
      reason: 'Serious collector relocating from NYC. Previously part of RedBar NYC.',
      collection: 'Rolex Datejust 36, Cartier Santos, Grand Seiko SBGA211',
      referral: 'RedBar network',
    },
    rsvps: [],
    payments: [10],
  },
  {
    id: 8, name: 'Mike P.', email: 'mike.p@yahoo.com', tier: 'ENTHUSIAST',
    status: 'suspended', joinDate: '2026-03-05', accessCode: 'BWC-X9Q1Z3B5',
    bio: '', collects: '', favoriteWatch: '', location: '', instagram: '',
    notes: 'Suspended: attempted to sell counterfeit watches at meetup.',
    applicationAnswers: {
      reason: 'Watch dealer looking to network.',
      collection: 'Various',
      referral: 'Facebook',
    },
    rsvps: ['wrist-and-whiskey'],
    payments: [9],
  },
  {
    id: 9, name: 'Chris L.', email: 'chris@boswatch.club', tier: 'PATRON',
    status: 'active', joinDate: '2026-03-04', accessCode: 'BWC-G8D2C6P4',
    bio: 'Real estate developer and founding patron.',
    collects: 'F.P. Journe, MB&F, H. Moser',
    favoriteWatch: 'F.P. Journe Chronomètre Bleu',
    location: 'Seaport, Boston',
    instagram: '@chris_independents',
    notes: 'Founding patron, organized watch meetups in NYC before.', applicationAnswers: {
      reason: 'Real estate developer, founding patron. Want to support indie watchmaking community.',
      collection: 'F.P. Journe Chronometre Bleu, MB&F LM101, H. Moser Pioneer',
      referral: 'Direct outreach from founders',
    },
    rsvps: ['wrist-and-whiskey', 'brand-dinner-iwc', 'collectors-table-dinner', 'coffee-and-chronographs'],
    payments: [6, 7],
  },
  {
    id: 10, name: 'Rachel K.', email: 'rachel.k@gmail.com', tier: 'ENTHUSIAST',
    status: 'pending', joinDate: '2026-03-18', accessCode: null,
    bio: '', collects: '', favoriteWatch: '', location: '', instagram: '',
    notes: '', applicationAnswers: {
      reason: 'Medical resident, want a hobby community outside the hospital. Love dive watches.',
      collection: 'Seiko Turtle, Marathon GSAR',
      referral: 'TikTok',
    },
    rsvps: [],
    payments: [],
  },
]

// ═══════════════════════════════════════════
// BLOG POSTS (public /blog page — Substack-linked)
// TODO: Replace with Supabase blog_posts table
// ═══════════════════════════════════════════
export const ADMIN_BLOG_POSTS = [
  {
    id: 1, title: "INSIDE OUR INAUGURAL COLLECTOR'S EVENING",
    date: '2026-03-22', status: 'published', author: 'Admin',
    body: 'What happens when you put thirty passionate collectors in a room with rare spirits and even rarer timepieces? Our first-ever gathering set the tone for everything Boston Watch Club is about — unhurried conversation, incredible wrist presence, and the kind of connections that only happen when the right people find the right room.',
    image: 'elegante.jpg',
    substackUrl: 'https://substack.com/@bostonwatchclub',
  },
  {
    id: 2, title: 'WHY WE STARTED BOSTON WATCH CLUB',
    date: '2026-03-10', status: 'published', author: 'Admin',
    body: "Boston has always been a city of taste — from its architecture to its dining scene. But for watch collectors, there was no dedicated space to gather, share, and grow together. That's the gap we set out to fill. Here's the story behind BWC and where we're headed.",
    image: 'membership-hero.jpg',
    substackUrl: 'https://substack.com/@bostonwatchclub',
  },
  {
    id: 3, title: '5 WATCHES ON OUR RADAR THIS SPRING',
    date: '2026-03-05', status: 'published', author: 'Admin',
    body: "From the new Tudor Pelagos 39 to an under-the-radar Grand Seiko Spring Drive, our founding members weigh in on the pieces generating the most conversation this season. Plus, one Casio that keeps showing up at every meetup.",
    image: 'about-bg.jpg',
    substackUrl: 'https://substack.com/@bostonwatchclub',
  },
  {
    id: 4, title: 'Guide: How to Spot a Fake Rolex', date: '2026-03-20',
    status: 'draft', author: 'Admin',
    body: 'A comprehensive guide to authenticating vintage and modern Rolex watches. From dial printing to movement finishing, here\'s what to look for...',
    image: null,
    substackUrl: '',
  },
]

// ═══════════════════════════════════════════
// CLUB NEWS / LATEST UPDATES (dashboard overview)
// These appear in the "Latest Updates" section on the member dashboard
// TODO: Replace with Supabase club_news table
// ═══════════════════════════════════════════
export const ADMIN_CLUB_NEWS = [
  {
    id: 1,
    title: 'Welcome to BOS Watch Club',
    date: 'March 4, 2026',
    sortDate: '2026-03-04',
    preview: "A note from the founders on what we're building.",
    body: "We started Boston Watch Club because we believe the watch community in Boston deserves a dedicated space. Whether you're into vintage Rolexes or modern independents, this is your crew. More details coming soon as we roll out member events and exclusive content.",
    status: 'published',
  },
  {
    id: 2,
    title: 'March Event Lineup Announced',
    date: 'March 10, 2026',
    sortDate: '2026-03-10',
    preview: "Three events this month. Here's what's coming.",
    body: "We've got a packed month ahead. Wrist & Whiskey at The Newbury Hotel, our first Newbury Street Watch Walk, and an exclusive Collector's Table Dinner at the Four Seasons. Check the events section for details and RSVP.",
    status: 'published',
  },
  {
    id: 3,
    title: 'Member Spotlight: Coming Soon',
    date: 'March 15, 2026',
    sortDate: '2026-03-15',
    preview: "We'll be featuring one member's collection each month.",
    body: "Starting next month, we'll spotlight one member's collection each month. If you want to be featured, reach out to us on Instagram or email. We'll photograph your top pieces and share the story behind your collection.",
    status: 'published',
  },
  {
    id: 4,
    title: 'Brand Dinner with IWC — Tickets Live',
    date: 'March 18, 2026',
    sortDate: '2026-03-18',
    preview: 'Reserve your seat for our first brand dinner. Collector+ only.',
    body: "We're thrilled to announce our first official brand partnership event — a private dinner with IWC Schaffhausen on May 3rd at Contessa. You'll get hands-on time with the new Portugieser collection before retail release. Seats are $150 and limited to 20 Collector and Patron members. Head to the Events tab to reserve your spot.",
    status: 'published',
  },
  {
    id: 5,
    title: "Patron Tier Now Available",
    date: 'March 20, 2026',
    sortDate: '2026-03-20',
    preview: 'The ultimate membership experience for serious collectors.',
    body: "We're excited to announce the Patron tier — our highest level of membership. Enjoy exclusive dinners with brand CEOs, guaranteed priority seating at all events, unlimited guests, and an annual curated travel experience. Apply now to become a Patron member.",
    status: 'published',
  },
]

// ═══════════════════════════════════════════
// DISCUSSIONS
// TODO: Replace with Supabase discussions table query
// ═══════════════════════════════════════════
export const ADMIN_DISCUSSIONS = [
  {
    id: 1, title: 'Best places to service a vintage Seiko in Boston?',
    author: 'Marcus T.', tier: 'ENTHUSIAST', date: '2026-03-08', status: 'approved',
    body: 'Just picked up a 6139 Pogue that needs a full service. Anyone have a trusted local watchmaker they\'d recommend? Preferably someone experienced with vintage Seiko movements.',
    tags: ['Service', 'Vintage'],
    replies: [
      { author: 'David R.', tier: 'COLLECTOR', body: "Try Bromfield Street Watch Repair. They've done great work on my vintage Omegas and they know their way around Seiko calibers too.", date: 'March 8, 2026' },
      { author: 'Stelios H.', tier: 'COLLECTOR', body: "Second Bromfield Street. Also worth checking out European Watch in Cambridge — they handle everything from quartz to complications.", date: 'March 9, 2026' },
    ],
    rejectionReason: null,
  },
  {
    id: 2, title: 'Thoughts on the new Lange Odysseus Sport?',
    author: 'James K.', tier: 'PATRON', date: '2026-03-07', status: 'approved',
    body: 'Saw the announcement this morning. Curious what fellow collectors think — is Lange moving in the right direction with a sportier piece, or should they stick to what they do best?',
    tags: ['New Release', 'Discussion'],
    replies: [
      { author: 'Chris L.', tier: 'PATRON', body: "I think it's a smart move. The steel sports watch market is massive and Lange has the finishing chops to compete at the highest level. Would love to see one in person.", date: 'March 7, 2026' },
    ],
    rejectionReason: null,
  },
  {
    id: 3, title: 'ISO: Rolex Explorer 1016 in good condition',
    author: 'David R.', tier: 'COLLECTOR', date: '2026-03-12', status: 'pending',
    body: 'Looking for a clean 1016 with a matte dial. Budget around $25-30K. Prefer to buy from a fellow club member.',
    tags: ['Buying Advice'],
    replies: [],
    rejectionReason: null,
  },
  {
    id: 4, title: 'My top 3 watches under $500',
    author: 'Tom B.', tier: 'ENTHUSIAST', date: '2026-03-14', status: 'pending',
    body: 'New to collecting but here are my picks: Seiko Presage Cocktail Time, Orient Bambino, Casio Oceanus. What do you think?',
    tags: ['Recommendations'],
    replies: [],
    rejectionReason: null,
  },
  {
    id: 5, title: 'Selling replica watches — great deals!',
    author: 'Mike P.', tier: 'ENTHUSIAST', date: '2026-03-09', status: 'rejected',
    body: 'I have top quality replicas of popular brands at amazing prices...',
    tags: [],
    replies: [],
    rejectionReason: 'Selling counterfeit watches violates club rules.',
  },
]

// ═══════════════════════════════════════════
// PAYMENTS
// TODO: Replace with Supabase/Stripe payments query
// ═══════════════════════════════════════════
export const ADMIN_PAYMENTS = [
  { id: 1, member: 'James K.', amount: 2500, type: 'membership', date: '2026-03-04', status: 'completed', description: 'Patron annual membership', txId: 'pi_3Oa1b2c3d4e5f6' },
  { id: 2, member: 'Stelios H.', amount: 1125, type: 'membership', date: '2026-03-04', status: 'completed', description: 'Collector annual membership', txId: 'pi_4Fb2c3d4e5f6g7' },
  { id: 3, member: 'Marcus T.', amount: 475, type: 'membership', date: '2026-03-06', status: 'completed', description: 'Enthusiast annual membership', txId: 'pi_5Gc3d4e5f6g7h8' },
  { id: 4, member: 'David R.', amount: 150, type: 'event', date: '2026-03-12', status: 'completed', description: 'Brand Dinner with IWC — upfront', txId: 'pi_6Hd4e5f6g7h8i9' },
  { id: 5, member: 'James K.', amount: 150, type: 'event', date: '2026-03-12', status: 'completed', description: 'Brand Dinner with IWC — upfront', txId: 'pi_7Ie5f6g7h8i9j0' },
  { id: 6, member: 'Chris L.', amount: 150, type: 'event', date: '2026-03-13', status: 'completed', description: 'Brand Dinner with IWC — upfront', txId: 'pi_8Jf6g7h8i9j0k1' },
  { id: 7, member: 'Chris L.', amount: 2500, type: 'membership', date: '2026-03-04', status: 'completed', description: 'Patron annual membership', txId: 'pi_9Kg7h8i9j0k1l2' },
  { id: 8, member: 'Sarah M.', amount: 1125, type: 'membership', date: '2026-03-10', status: 'completed', description: "Collector annual membership", txId: 'pi_0Lh8i9j0k1l2m3' },
  { id: 9, member: 'Mike P.', amount: 475, type: 'membership', date: '2026-03-05', status: 'refunded', description: 'Enthusiast membership — refunded after suspension', txId: 'pi_1Mi9j0k1l2m3n4' },
  { id: 10, member: 'Elena V.', amount: 1125, type: 'membership', date: '2026-03-16', status: 'pending', description: 'Collector membership — pending approval', txId: null },
  { id: 11, member: 'Stelios H.', amount: 50, type: 'cancellation_fee', date: '2026-03-17', status: 'completed', description: "Collector's Table Dinner — late cancellation fee", txId: 'pi_2Nj0k1l2m3n4o5' },
]

// ═══════════════════════════════════════════
// SITE CONTENT — Editable text blocks shown to members
// TODO: Replace with Supabase site_content table
// ═══════════════════════════════════════════
export const ADMIN_SITE_CONTENT = {
  // Homepage - Hero
  heroSubtitle: 'An exclusive community for collectors, enthusiasts, and those who appreciate the art of horology.',
  heroCta: 'BECOME A FOUNDING MEMBER →',

  // Homepage - About
  aboutEyebrow: 'WHO WE ARE',
  aboutTitle: 'BOSTON WATCH CLUB',
  aboutDescription: "Born out of a shared passion for timepieces and the culture that surrounds them, BWC is Boston's premier watch community — built by collectors, for collectors.",
  aboutCardEyebrow: "ROOTED IN BOSTON'S CULTURE",
  aboutCardHeadline: 'WE BRIDGE THE WORLDS OF HOROLOGY, CULTURE, AND COMMUNITY.',
  aboutCardBody: 'Our mission is simple. Create a space where passion meets purpose, where collectors connect, and where time is always well spent.',

  // Homepage - Register CTA
  registerEyebrow: 'FOUNDING MEMBERSHIP',
  registerTitle: 'READY TO JOIN?',
  registerSubtitle: "Explore our membership tiers and find the right fit for your passion. From casual enthusiast to dedicated patron, there's a seat at the table for you.",
  registerCta: 'VIEW MEMBERSHIP TIERS →',

  // Homepage - Timepiece Spotlight
  timepieceEyebrow: 'RECENTLY PICKED UP BY A MEMBER',
  timepieceName: 'OMEGA SPEEDMASTER "SILVER SNOOPY AWARD" 50TH ANNIVERSARY',
  timepieceRef: 'REF. 310.32.42.50.02.001',
  timepieceDescription: "One of our members just landed the grail. The Silver Snoopy Award edition celebrates NASA's highest honor, given to Omega after the Speedmaster helped bring the Apollo 13 crew home safely. The caseback features a hand-engraved Snoopy that orbits the dark side of the moon in real time via a mechanical animation — a detail that still stops collectors in their tracks. Impossible to find at retail, impossible to forget on the wrist.",
  timepieceNote: 'MEMBER PICKUPS UPDATED REGULARLY',

  // Events page
  eventsPageTitle: 'UPCOMING EVENTS',
  eventsPageSubtitle: 'CURATED GATHERINGS FOR COLLECTORS, ENTHUSIASTS, AND THOSE WHO APPRECIATE THE FINER THINGS.',

  // Blog page
  blogPageTitle: 'THE JOURNAL',
  blogPageSubtitle: 'EVENT RECAPS, COLLECTOR STORIES, AND DISPATCHES FROM THE BOSTON WATCH CLUB.',

  // Membership page
  membershipTitle: 'FIND YOUR TIER',
  membershipSubtitle: 'SELECT THE MEMBERSHIP LEVEL THAT MATCHES YOUR PASSION FOR HOROLOGY.',

  // Benefits section
  benefitsEyebrow: 'WHY JOIN BOSTON WATCH CLUB?',
  benefitsTitle: 'WHAT YOU GET',
  benefitsSubtitle: "This is not just a membership. It's your seat at the table before anyone else knows the table exists.",

  // FAQ section
  faqEyebrow: 'QUESTIONS',
  faqTitle: 'FREQUENTLY ASKED',

  // Footer
  footerCopyright: '© 2026 Boston Watch Club. All Rights Reserved.',

  // Social links
  instagramUrl: 'https://instagram.com/boswatchclub',
  tiktokUrl: 'https://tiktok.com/@boswatchclub',
  substackUrl: 'https://substack.com/@bostonwatchclub',
  contactEmail: 'bostonwatchclub@gmail.com',

  // Typeform application URL
  typeformUrl: 'https://form.typeform.com/to/ntT8GKqz',
}

// ═══════════════════════════════════════════
// FAQ ITEMS
// TODO: Replace with Supabase faq_items table
// ═══════════════════════════════════════════
export const ADMIN_FAQ_ITEMS = [
  { id: 1, question: 'DO I NEED TO OWN A LUXURY WATCH TO JOIN?', answer: 'No. BOS Watch Club is for anyone who appreciates horology  - whether you wear a Casio or a Calatrava. Some of our members are seasoned collectors. Others are just getting started. What matters is curiosity and respect for the craft.' },
  { id: 2, question: 'WHAT KIND OF EVENTS DO YOU HOST?', answer: "Everything from casual Wrist & Whiskey meetups at Back Bay bars to private brand dinners on Newbury Street, Cars & Chronographs mornings, auction watch parties, and intimate Collector's Table dinners with industry insiders. We host 2–3 events per month across different formats and price points." },
  { id: 3, question: 'HOW IS THIS DIFFERENT FROM REDBAR OR OTHER WATCH GROUPS?', answer: "RedBar is great  - we're fans. But BOS Watch Club is a structured membership community with tiered access, brand partnerships, curated lifestyle events, and a private network. Think of us less as a meetup group and more as a private social club built around horology." },
  { id: 4, question: 'WHAT DOES THE $40 APPLICATION FEE COVER?', answer: 'It covers the review process and helps us keep the community intentional. Every applicant is reviewed to ensure the club stays tight-knit and high-quality. The fee is non-refundable but is credited toward your first year if accepted.' },
  { id: 5, question: "I'M A STUDENT. IS THERE A WAY IN?", answer: 'Yes. Our Enthusiast tier is $50/year, and students with a valid .edu email get $20 off. You get access to casual hangs, the WhatsApp/Discord community, and networking events. We believe the next generation of collectors starts now.' },
  { id: 6, question: 'WHERE IN BOSTON ARE EVENTS HELD?', answer: 'Primarily Back Bay, Newbury Street, and Seaport  - think boutique showrooms, hotel lounges, private dining rooms, and cigar bars. Occasionally we go to Cambridge, the North End, or beyond. Members receive location details 48 hours before each event.' },
  { id: 7, question: 'CAN I BRING A GUEST?', answer: 'Depends on your tier. Collector members can bring one guest to casual hangs. Patron members get unlimited guest access. Enthusiast members can purchase a guest pass for select events. Brand-sponsored events may have separate guest policies.' },
  { id: 8, question: 'IS THERE A REFERRAL PROGRAM?', answer: "Yes. Refer a friend who gets accepted and you both receive a credit toward next year's dues. Details provided after you join." },
  { id: 9, question: "WHAT'S THE DIFFERENCE BETWEEN ENTHUSIAST AND COLLECTOR?", answer: "Enthusiast gives you access to the community and casual events  - it's perfect for someone who wants to get involved. Collector unlocks brand-sponsored events, priority access, guest privileges, and curated experiences. If you want the full BOS Watch Club experience, Collector is where it's at." },
]

// ═══════════════════════════════════════════
// BENEFITS
// TODO: Replace with Supabase benefits table
// ═══════════════════════════════════════════
export const ADMIN_BENEFITS = [
  { id: 1, name: 'PRIORITY EVENT ACCESS', desc: "You hear about it before it's announced. You're in before it fills up.", icon: 'clock' },
  { id: 2, name: 'MEMBERS-ONLY DINNERS', desc: "Curated evenings in Boston's most exclusive private dining rooms. Real conversations over rare pours.", icon: 'cup' },
  { id: 3, name: 'PRIVATE COMMUNITY', desc: "A tight, vetted circle of collectors, dealers, and enthusiasts who actually know what they're talking about.", icon: 'people' },
  { id: 4, name: 'FOUNDING MEMBER STATUS', desc: "Your name is on the wall forever. First 10 per tier. Once they're gone, they're gone.", icon: 'star' },
  { id: 5, name: 'MEMBER DIRECTORY', desc: 'Direct access to every member in the network. Collectors, dealers, watchmakers. All in one place.', icon: 'book' },
  { id: 6, name: 'EARLY ACCESS', desc: 'Brand collaborations, limited drops, and partnerships. You see it before the public does.', icon: 'briefcase' },
]

// ═══════════════════════════════════════════
// MEMBERSHIP TIERS
// TODO: Replace with Supabase tiers table
// ═══════════════════════════════════════════
export const ADMIN_TIERS = [
  {
    id: 1, name: 'ENTHUSIAST', price: '$50', period: 'PER YEAR',
    foundingText: 'FIRST 10 → FOUNDING MEMBER',
    benefits: ['ALL CASUAL HANGS, CIGARS, HAPPY HOURS', 'WHATSAPP / DISCORD GROUP ACCESS', 'NEWSLETTER AND INSIDER UPDATES', 'MEMBERS-ONLY CONTENT'],
  },
  {
    id: 2, name: 'COLLECTOR', price: '$1,125', period: 'PER YEAR',
    foundingText: 'FIRST 10 → FOUNDING MEMBER',
    benefits: ['EVERYTHING IN ENTHUSIAST, PLUS:', '6 BRAND-SPONSORED EVENTS PER YEAR', 'PRIORITY EVENT RSVP', 'BRING ONE GUEST TO CASUAL HANGS', 'CURATED EXPERIENCES AT MEMBER RATES', 'WELCOME GIFT INCLUDED'],
  },
  {
    id: 3, name: 'PATRON', price: '$2,250', period: 'PER YEAR',
    foundingText: 'FIRST 10 → FOUNDING MEMBER',
    benefits: ['EVERYTHING IN COLLECTOR, PLUS:', 'EXCLUSIVE DINNERS WITH BRAND CEOS', 'GUARANTEED PRIORITY SEATING AT ALL EVENTS', 'UNLIMITED GUESTS AT CASUAL HANGS', 'ONE ANNUAL CURATED TRAVEL EXPERIENCE', 'NUMBERED PERSONALIZED MEMBERSHIP CARD', 'ANNUAL PATRON-EXCLUSIVE GIFT'],
  },
]

// ═══════════════════════════════════════════
// EVENTS (admin copy — mirrors events.js with editable fields)
// TODO: Replace with Supabase events table
// ═══════════════════════════════════════════
export const ADMIN_EVENTS = [
  {
    id: 'wrist-and-whiskey',
    name: 'WRIST & WHISKEY',
    tagline: 'Casual meetup. Bring your favorite piece.',
    description: 'A RELAXED EVENING TO SHARE STORIES, SHOW YOUR COLLECTION, AND ENJOY FINE WHISKEY WITH FELLOW MEMBERS.',
    longDescription: "A casual evening at The Newbury Hotel where members gather over curated whiskey flights to share the watches on their wrists and the stories behind them.\n\nNo agenda, no presentations — just good conversation among people who appreciate fine timepieces and fine spirits. Whether you're wearing a vintage Seiko or a Patek Philippe, everyone's welcome.\n\nBring your favorite piece and a story to go with it.",
    venue: 'The Newbury Hotel',
    location: 'THE NEWBURY HOTEL · BOSTON',
    date: 'March 22, 2026',
    time: '7:00 PM – 10:00 PM',
    datetime: '2026-03-22T19:00:00',
    access: 'All Members',
    capacity: '30 guests',
    dressCode: 'Smart Casual',
    image: 'elegante.jpg',
    payment_type: 'on_us',
    price: null,
    tier_minimum: 'enthusiast',
    cancellation_fee: null,
    status: 'published',
    month: 'MAR',
    day: '22',
  },
  {
    id: 'newbury-watch-walk',
    name: 'NEWBURY STREET WATCH WALK',
    tagline: 'Guided boutique tour ending at Contessa.',
    description: "A GUIDED TOUR OF NEWBURY STREET'S FINEST WATCH BOUTIQUES, ENDING WITH DRINKS AT CONTESSA.",
    longDescription: "Join us for a curated walking tour of Newbury Street's best watch boutiques, starting at European Watch Co. and ending with drinks at Contessa.\n\nOur guide — a veteran dealer with 20+ years on Newbury — will share insider knowledge about each boutique, what to look for, and the history behind Boston's watch retail scene.\n\nCover your own drinks and any purchases along the way. The tour itself is free for all members.",
    venue: 'Starting at European Watch Co.',
    location: 'NEWBURY STREET · BOSTON',
    date: 'April 5, 2026',
    time: '2:00 PM – 5:30 PM',
    datetime: '2026-04-05T14:00:00',
    access: 'All Members',
    capacity: '20 guests',
    dressCode: 'Smart Casual',
    image: 'membership-hero.jpg',
    payment_type: 'pay_during',
    price: null,
    tier_minimum: 'enthusiast',
    cancellation_fee: null,
    status: 'published',
    month: 'APR',
    day: '5',
  },
  {
    id: 'collectors-table-dinner',
    name: "COLLECTOR'S TABLE DINNER",
    tagline: 'Intimate 12-person dinner with a master watchmaker.',
    description: 'AN INTIMATE 12-PERSON DINNER WITH A MASTER WATCHMAKER. COLLECTOR TIER AND ABOVE.',
    longDescription: "An intimate dinner limited to just 12 seats at the Four Seasons, featuring a master watchmaker as our guest of honor.\n\nOver a multi-course meal, our guest will share insights into the art of haute horlogerie, answer your most burning questions about movements and complications, and even bring a few pieces from the bench for hands-on viewing.\n\nThe bill will be split evenly at the end of the evening. Collector and Patron members only.",
    venue: 'Four Seasons',
    location: 'FOUR SEASONS · BOSTON',
    date: 'April 18, 2026',
    time: '7:30 PM – 10:30 PM',
    datetime: '2026-04-18T19:30:00',
    access: 'Collector & Above',
    capacity: '12 guests',
    dressCode: 'Business Casual',
    image: 'bwdrinksandwatches.jpg',
    payment_type: 'pay_after',
    price: null,
    tier_minimum: 'collector',
    cancellation_fee: 50,
    status: 'published',
    month: 'APR',
    day: '18',
  },
  {
    id: 'brand-dinner-iwc',
    name: 'BRAND DINNER WITH IWC',
    tagline: 'Private presentation of the new Portugieser line. Limited to 20 seats.',
    description: 'A PRIVATE BRAND DINNER WITH IWC FEATURING THE NEW PORTUGIESER COLLECTION. LIMITED SEATING.',
    longDescription: "An exclusive evening with IWC Schaffhausen, featuring a private presentation of the new Portugieser line by their Head of Product.\n\nYou'll have hands-on time with every piece in the new collection before it hits retail, plus an intimate Q&A over a multi-course dinner. This is a rare opportunity to go deep with one of the most respected names in watchmaking.\n\nPayment of $150 is required upfront to reserve your seat. Limited to 20 guests. Collector and Patron members only.",
    venue: 'Contessa',
    location: 'CONTESSA · BOSTON',
    date: 'May 3, 2026',
    time: '7:00 PM – 10:30 PM',
    datetime: '2026-05-03T19:00:00',
    access: 'Collector & Above',
    capacity: '20 guests',
    dressCode: 'Business Casual',
    image: 'membership.jpg',
    payment_type: 'upfront',
    price: 150,
    tier_minimum: 'collector',
    cancellation_fee: 75,
    status: 'published',
    month: 'MAY',
    day: '3',
  },
  {
    id: 'coffee-and-chronographs',
    name: 'COFFEE & CHRONOGRAPHS',
    tagline: "Morning meetup. Grab a coffee, show what you're wearing.",
    description: 'A CASUAL MORNING MEETUP OVER GREAT COFFEE. BRING YOUR DAILY WEARER.',
    longDescription: "Our most casual gathering — a Saturday morning meetup at George Howell Coffee on Newbury Street.\n\nGrab a pour-over, show off what's on the wrist, and chat with fellow collectors in a relaxed setting. No RSVP pressure, no dress code, no agenda.\n\nJust great coffee and great watches. Cover your own coffee.",
    venue: 'George Howell Coffee, Newbury St',
    location: 'GEORGE HOWELL COFFEE · NEWBURY ST',
    date: 'May 10, 2026',
    time: '9:00 AM – 11:30 AM',
    datetime: '2026-05-10T09:00:00',
    access: 'All Members',
    capacity: '15 guests',
    dressCode: 'Casual',
    image: 'takingwristshot.jpg',
    payment_type: 'pay_during',
    price: null,
    tier_minimum: 'enthusiast',
    cancellation_fee: null,
    status: 'published',
    month: 'MAY',
    day: '10',
  },
]
