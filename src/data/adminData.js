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

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'BWC-'
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// TODO: Replace with Supabase members table query
export const ADMIN_MEMBERS = [
  {
    id: 1, name: 'Stelios H.', email: 'stelios@boswatch.club', tier: 'COLLECTOR',
    status: 'active', joinDate: '2026-03-04', accessCode: 'BWC-A7K2M9X1',
    notes: '', applicationAnswers: {
      reason: 'Lifelong watch enthusiast, mechanical engineer. Want to connect with Boston-area collectors.',
      collection: 'Rolex Submariner 5513, Tudor BB58, Omega Seamaster 300',
      referral: 'Found via Instagram',
    },
    rsvps: ['wrist-and-whiskey', 'collectors-table-dinner'],
  },
  {
    id: 2, name: 'James K.', email: 'james@boswatch.club', tier: 'PATRON',
    status: 'active', joinDate: '2026-03-04', accessCode: 'BWC-J6N4W1Y8',
    notes: 'Founding patron. Very engaged.', applicationAnswers: {
      reason: 'Finance professional, lifelong collector. Looking for high-level community.',
      collection: 'Patek Philippe Nautilus, A. Lange Zeitwerk, Rolex Daytona',
      referral: 'Friend of co-founder',
    },
    rsvps: ['wrist-and-whiskey', 'brand-dinner-iwc', 'collectors-table-dinner'],
  },
  {
    id: 3, name: 'Marcus T.', email: 'marcus@boswatch.club', tier: 'ENTHUSIAST',
    status: 'active', joinDate: '2026-03-06', accessCode: 'BWC-R3T8P5Q2',
    notes: '', applicationAnswers: {
      reason: 'Software dev into Seiko modding. Want to learn from experienced collectors.',
      collection: 'Seiko SPB143, Orient Kamasu, Casio G-Shock Square',
      referral: 'Reddit r/watches',
    },
    rsvps: ['wrist-and-whiskey', 'coffee-and-chronographs'],
  },
  {
    id: 4, name: 'Sarah M.', email: 'sarah@boswatch.club', tier: "WOMEN\u2019S CIRCLE",
    status: 'active', joinDate: '2026-03-10', accessCode: 'BWC-F2H9L4K7',
    notes: '', applicationAnswers: {
      reason: 'Interior designer passionate about horology. Want a space for women collectors.',
      collection: 'Cartier Tank Must, JLC Reverso',
      referral: 'Instagram @boswatchclub',
    },
    rsvps: ['newbury-watch-walk'],
  },
  {
    id: 5, name: 'David R.', email: 'david@boswatch.club', tier: 'COLLECTOR',
    status: 'active', joinDate: '2026-03-08', accessCode: 'BWC-T5M3V8N6',
    notes: 'Certified watchmaker — can help at events.', applicationAnswers: {
      reason: 'Attorney and vintage chronograph collector. Also a certified watchmaker.',
      collection: 'Omega Speedmaster pre-moon, Heuer Autavia, Breitling Navitimer',
      referral: 'Colleague referral',
    },
    rsvps: ['wrist-and-whiskey', 'collectors-table-dinner', 'brand-dinner-iwc'],
  },
  {
    id: 6, name: 'Tom B.', email: 'tom.b@gmail.com', tier: 'ENTHUSIAST',
    status: 'pending', joinDate: '2026-03-15', accessCode: null,
    notes: '', applicationAnswers: {
      reason: 'Just got into watches after inheriting my grandfather\'s Omega. Want to learn more.',
      collection: 'Omega Constellation 1969 (inherited), Apple Watch (daily)',
      referral: 'Google search',
    },
    rsvps: [],
  },
  {
    id: 7, name: 'Elena V.', email: 'elena.v@outlook.com', tier: 'COLLECTOR',
    status: 'pending', joinDate: '2026-03-16', accessCode: null,
    notes: '', applicationAnswers: {
      reason: 'Serious collector relocating from NYC. Previously part of RedBar NYC.',
      collection: 'Rolex Datejust 36, Cartier Santos, Grand Seiko SBGA211',
      referral: 'RedBar network',
    },
    rsvps: [],
  },
  {
    id: 8, name: 'Mike P.', email: 'mike.p@yahoo.com', tier: 'ENTHUSIAST',
    status: 'suspended', joinDate: '2026-03-05', accessCode: 'BWC-X9Q1Z3B5',
    notes: 'Suspended: attempted to sell counterfeit watches at meetup.',
    applicationAnswers: {
      reason: 'Watch dealer looking to network.',
      collection: 'Various',
      referral: 'Facebook',
    },
    rsvps: ['wrist-and-whiskey'],
  },
  {
    id: 9, name: 'Chris L.', email: 'chris@boswatch.club', tier: 'PATRON',
    status: 'active', joinDate: '2026-03-04', accessCode: 'BWC-G8D2C6P4',
    notes: 'Founding patron, organized watch meetups in NYC before.', applicationAnswers: {
      reason: 'Real estate developer, founding patron. Want to support indie watchmaking community.',
      collection: 'F.P. Journe Chronometre Bleu, MB&F LM101, H. Moser Pioneer',
      referral: 'Direct outreach from founders',
    },
    rsvps: ['wrist-and-whiskey', 'brand-dinner-iwc', 'collectors-table-dinner', 'coffee-and-chronographs'],
  },
  {
    id: 10, name: 'Rachel K.', email: 'rachel.k@gmail.com', tier: 'ENTHUSIAST',
    status: 'pending', joinDate: '2026-03-18', accessCode: null,
    notes: '', applicationAnswers: {
      reason: 'Medical resident, want a hobby community outside the hospital. Love dive watches.',
      collection: 'Seiko Turtle, Marathon GSAR',
      referral: 'TikTok',
    },
    rsvps: [],
  },
]

// TODO: Replace with Supabase blog_posts table query
export const ADMIN_BLOG_POSTS = [
  {
    id: 1, title: 'Welcome to BOS Watch Club', date: '2026-03-04',
    status: 'published', author: 'Admin',
    body: 'We started Boston Watch Club because we believe the watch community in Boston deserves a dedicated space. Whether you\'re into vintage Rolexes or modern independents, this is your crew.',
    image: null,
  },
  {
    id: 2, title: 'March Event Lineup Announced', date: '2026-03-10',
    status: 'published', author: 'Admin',
    body: 'We\'ve got a packed month ahead. Wrist & Whiskey at The Newbury Hotel, our first Newbury Street Watch Walk, and an exclusive Collector\'s Table Dinner at the Four Seasons.',
    image: null,
  },
  {
    id: 3, title: 'Member Spotlight: Coming Soon', date: '2026-03-15',
    status: 'published', author: 'Admin',
    body: 'Starting next month, we\'ll spotlight one member\'s collection each month. If you want to be featured, reach out to us on Instagram or email.',
    image: null,
  },
  {
    id: 4, title: 'Guide: How to Spot a Fake Rolex', date: '2026-03-20',
    status: 'draft', author: 'Admin',
    body: 'A comprehensive guide to authenticating vintage and modern Rolex watches. From dial printing to movement finishing, here\'s what to look for...',
    image: null,
  },
]

// TODO: Replace with Supabase discussions table query
export const ADMIN_DISCUSSIONS = [
  {
    id: 1, title: 'Best places to service a vintage Seiko in Boston?',
    author: 'Marcus T.', date: '2026-03-08', status: 'approved',
    body: 'Just picked up a 6139 Pogue that needs a full service. Anyone have a trusted local watchmaker?',
    rejectionReason: null,
  },
  {
    id: 2, title: 'Thoughts on the new Lange Odysseus Sport?',
    author: 'James K.', date: '2026-03-07', status: 'approved',
    body: 'Saw the leaked images. Thoughts on Lange going sporty? Is it brand dilution or smart evolution?',
    rejectionReason: null,
  },
  {
    id: 3, title: 'ISO: Rolex Explorer 1016 in good condition',
    author: 'David R.', date: '2026-03-12', status: 'pending',
    body: 'Looking for a clean 1016 with a matte dial. Budget around $25-30K. Prefer to buy from a fellow club member.',
    rejectionReason: null,
  },
  {
    id: 4, title: 'My top 3 watches under $500',
    author: 'Tom B.', date: '2026-03-14', status: 'pending',
    body: 'New to collecting but here are my picks: Seiko Presage Cocktail Time, Orient Bambino, Casio Oceanus. What do you think?',
    rejectionReason: null,
  },
  {
    id: 5, title: 'Selling replica watches — great deals!',
    author: 'Mike P.', date: '2026-03-09', status: 'rejected',
    body: 'I have top quality replicas of popular brands at amazing prices...',
    rejectionReason: 'Selling counterfeit watches violates club rules.',
  },
]

// TODO: Replace with Supabase/Stripe payments query
export const ADMIN_PAYMENTS = [
  { id: 1, member: 'James K.', amount: 2500, type: 'membership', date: '2026-03-04', status: 'completed', description: 'Patron annual membership', txId: 'pi_3Oa1b2c3d4e5f6' },
  { id: 2, member: 'Stelios H.', amount: 1125, type: 'membership', date: '2026-03-04', status: 'completed', description: 'Collector annual membership', txId: 'pi_4Fb2c3d4e5f6g7' },
  { id: 3, member: 'Marcus T.', amount: 475, type: 'membership', date: '2026-03-06', status: 'completed', description: 'Enthusiast annual membership', txId: 'pi_5Gc3d4e5f6g7h8' },
  { id: 4, member: 'David R.', amount: 150, type: 'event', date: '2026-03-12', status: 'completed', description: 'Brand Dinner with IWC — upfront', txId: 'pi_6Hd4e5f6g7h8i9' },
  { id: 5, member: 'James K.', amount: 150, type: 'event', date: '2026-03-12', status: 'completed', description: 'Brand Dinner with IWC — upfront', txId: 'pi_7Ie5f6g7h8i9j0' },
  { id: 6, member: 'Chris L.', amount: 150, type: 'event', date: '2026-03-13', status: 'completed', description: 'Brand Dinner with IWC — upfront', txId: 'pi_8Jf6g7h8i9j0k1' },
  { id: 7, member: 'Chris L.', amount: 2500, type: 'membership', date: '2026-03-04', status: 'completed', description: 'Patron annual membership', txId: 'pi_9Kg7h8i9j0k1l2' },
  { id: 8, member: 'Sarah M.', amount: 1125, type: 'membership', date: '2026-03-10', status: 'completed', description: "Women\u2019s Circle annual membership", txId: 'pi_0Lh8i9j0k1l2m3' },
  { id: 9, member: 'Mike P.', amount: 475, type: 'membership', date: '2026-03-05', status: 'refunded', description: 'Enthusiast membership — refunded after suspension', txId: 'pi_1Mi9j0k1l2m3n4' },
  { id: 10, member: 'Elena V.', amount: 1125, type: 'membership', date: '2026-03-16', status: 'pending', description: 'Collector membership — pending approval', txId: null },
]

export { randomCode }
