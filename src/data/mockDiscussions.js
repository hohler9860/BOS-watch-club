// TODO: Replace with Supabase query
const discussions = [
  {
    id: 1,
    author: "Marcus T.",
    tier: "ENTHUSIAST",
    title: "Best places to service a vintage Seiko in Boston?",
    body: "Just picked up a 6139 Pogue that needs a full service. Anyone have a trusted local watchmaker they'd recommend? Preferably someone experienced with vintage Seiko movements.",
    date: "March 8, 2026",
    replies: [
      { author: "David R.", tier: "COLLECTOR", body: "Try Bromfield Street Watch Repair. They've done great work on my vintage Omegas and they know their way around Seiko calibers too.", date: "March 8, 2026" },
      { author: "Stelios H.", tier: "COLLECTOR", body: "Second Bromfield Street. Also worth checking out European Watch in Cambridge — they handle everything from quartz to complications.", date: "March 9, 2026" },
    ],
    tags: ["Service", "Vintage"],
  },
  {
    id: 2,
    author: "James K.",
    tier: "PATRON",
    title: "Thoughts on the new Lange Odysseus Sport?",
    body: "Saw the announcement this morning. Curious what fellow collectors think — is Lange moving in the right direction with a sportier piece, or should they stick to what they do best?",
    date: "March 7, 2026",
    replies: [
      { author: "Chris L.", tier: "PATRON", body: "I think it's a smart move. The steel sports watch market is massive and Lange has the finishing chops to compete at the highest level. Would love to see one in person.", date: "March 7, 2026" },
    ],
    tags: ["New Release", "Discussion"],
  },
  {
    id: 3,
    author: "Sarah M.",
    tier: "COLLECTOR",
    title: "Smaller watch recommendations (36mm and under)?",
    body: "Looking for something elegant for everyday wear. Currently between the Cartier Tank Must and JLC Reverso Classic Small. Would love to hear what others are wearing day-to-day at 36mm or under.",
    date: "March 6, 2026",
    replies: [
      { author: "Alex P.", tier: "ENTHUSIAST", body: "The Tank Must is incredible value for what you get. The Reverso is more of a statement piece. Can't go wrong either way honestly.", date: "March 6, 2026" },
      { author: "Stelios H.", tier: "COLLECTOR", body: "Have you considered the Rolex OP 36? A bit more sporty but works with everything. My wife wears hers daily.", date: "March 7, 2026" },
      { author: "Sarah M.", tier: "COLLECTOR", body: "Great suggestions! I actually tried the OP 36 on recently — it's gorgeous. Might need to add it to the shortlist.", date: "March 7, 2026" },
    ],
    tags: ["Recommendations", "Everyday Wear"],
  },
  {
    id: 4,
    author: "Chris L.",
    tier: "PATRON",
    title: "Anyone going to the Geneva Watch Days in August?",
    body: "Planning to attend Geneva Watch Days this year. Would be great to organize a BWC group trip if there's enough interest. Could try to arrange some private brand appointments too.",
    date: "March 5, 2026",
    replies: [],
    tags: ["Travel", "Events"],
  },
]

export default discussions
