# Boston Watch Club - Complete Website Recreation Prompt

Use this prompt with Claude Code to recreate the Boston Watch Club website. This is a React + Vite site with a dark, luxurious aesthetic designed for an exclusive watch collectors community in Boston.

---

## PROJECT OVERVIEW

**Stack:** React 19, React Router 7 (HashRouter), Vite 6, CSS Modules, GitHub Pages deployment
**Base URL:** `/BOS-watch-club/`
**Fonts:** Google Fonts - Bebas Neue (display), Inter 300/400/500 (body)
**Favicon:** `/assets/icon.png`

---

## DESIGN SYSTEM

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background Primary | `#07090F` | Main page backgrounds, hero sections |
| Background Secondary | `#0D1018` | About, Events, FAQ, tier grid sections |
| Card Background | `#141820` | Cards, modals, inputs |
| Card Hover | `#1a2030` | Card hover states |
| White | `#F4F6F8` | Primary headings, bright text |
| Light Text | `#E8ECF0` | Headings, nav links active |
| Medium Text | `rgba(232, 236, 240, 0.55)` | Body text, descriptions, subtitles |
| Muted Text | `#4A5568` | Eyebrows, secondary labels, notes |
| Accent Muted | `#5A6A7E` | Location labels, detail labels |
| CTA Primary | `#B8C4D4` | Buttons, badges, accents |
| CTA Hover | `#D6DFE8` | Button hover states |
| Border Subtle | `rgba(232, 236, 240, 0.08)` | Section dividers, card borders |
| Border Medium | `rgba(184, 196, 212, 0.06-0.08)` | Card borders |
| Border Hover | `rgba(184, 196, 212, 0.18-0.25)` | Card hover borders |
| Purple Orb | `rgba(120, 80, 200, 0.4-0.5)` | Decorative gradient orbs |
| Blue Orb | `rgba(60, 140, 220, 0.35-0.4)` | Decorative gradient orbs |
| Orange Orb | `rgba(200, 120, 80, 0.3)` | Decorative gradient orb (About) |

### CSS Variables
```css
:root {
  --black: #0a0a0a;
  --white: #F4F6F8;
  --gray-50: #f9f9f9;
  --gray-100: #f0f0f0;
  --gray-200: #e0e0e0;
  --gray-400: #999999;
  --gray-500: #777777;
  --gray-600: #555555;
  --gray-800: #222222;
  --font-display: 'Bebas Neue', 'Arial Narrow', sans-serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Typography Scale

**Display Font (Bebas Neue):**
- Hero/Section Titles: `clamp(36px, 5vw, 52px)`, weight 400, letter-spacing `0.02em-0.06em`
- Card Headlines: `clamp(28px, 4vw, 44px)`, weight 400
- Tier Names: `24px`, weight 400, letter-spacing `0.04em`
- Tier Prices: `40px`, letter-spacing `0.02em`
- Watch Names (Marquee): `22px`, weight 600, letter-spacing `-0.01em`
- CTA Buttons: `14-16px`, letter-spacing `0.12em-0.15em`
- Eyebrows: `11-14px`, letter-spacing `0.25em-0.3em`
- Placeholder text: `14px`, weight 400, letter-spacing `0.25em`

**Body Font (Inter):**
- Body/Description: `13-15px`, weight 300-400, line-height `1.7-1.9`
- Small Labels: `10-11px`, weight 500-600, letter-spacing `0.12em-0.25em`
- FAQ Questions: `13px`, weight 500, letter-spacing `0.08em`
- FAQ Answers: `13px`, weight 300, line-height `1.8`
- Nav Links: `11px`, weight 400, letter-spacing `0.15em`
- Footer: `11px`, letter-spacing `0.02em`

**Everything is UPPERCASE throughout the site** (text-transform: uppercase on most elements)

### Spacing System
- Section padding: `120px 40px` (desktop), `80px-100px 24px` (mobile)
- Hero padding: `120px 40px 100px` (desktop), `100px 24px 80px` (mobile)
- Card padding: `48px 32px 40px` (tier cards), `72px 56px` (glass cards), `40px` (event cards)
- Grid gaps: `12px-24px` (cards), `48px 40px` (benefits)
- Max widths: `1200px` (tier grid), `1100px` (timepiece), `900px` (events), `720px` (about/FAQ), `700px` (hero content)

### Border Radius
- Cards: `12px-16px`
- CTA Buttons: `32px-40px`
- Thumbnails/Icons: `50%` (circular)
- Badges: `0 0 8px 8px` (bottom corners only)

### Shadows
- Cards: `0 2px 12px rgba(0,0,0,0.2)`
- Card hover: `0 12px 36px rgba(0,0,0,0.3)` or `0 12px 40px rgba(0,0,0,0.4)`
- CTA hover: `0 12px 40px rgba(0,0,0,0.3-0.4)`
- Glass card: `0 0 0 1px rgba(232,236,240,0.05) inset, 0 8px 32px rgba(0,0,0,0.2)`

---

## VISUAL EFFECTS

### Glassmorphism
```css
background: rgba(232, 236, 240, 0.04);
backdrop-filter: blur(40px) saturate(180%);
-webkit-backdrop-filter: blur(40px) saturate(180%);
border: 1px solid rgba(232, 236, 240, 0.08);
border-radius: 16px;
```

### Decorative Orbs
Blurred radial gradient circles used as ambient lighting:
- Purple: `radial-gradient(circle, rgba(120, 80, 200, 0.4-0.5) 0%, transparent 70%)`
- Blue: `radial-gradient(circle, rgba(60, 140, 220, 0.35-0.4) 0%, transparent 70%)`
- Orange: `radial-gradient(circle, rgba(200, 120, 80, 0.3) 0%, transparent 70%)`
- Sizes: 280px-700px diameter
- Blur: `filter: blur(80px-120px)`
- Opacity: `0.12-0.5`
- Floating animations: ease-in-out, 14s-22s duration

### Background Image Overlays
Hero sections use background images with pseudo-elements:
```css
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('image.jpg') center / cover no-repeat;
  filter: blur(1-2px) saturate(0.4-0.5) brightness(0.35-0.4);
  opacity: 0.35-0.4;
  transform: scale(1.1-1.2);
  z-index: 0;
}
```

### Grain Texture Overlay (About section)
SVG noise pattern at 4% opacity for subtle texture.

### Parallax Scrolling
- Logo: translateY factor 0.15, scale factor 0.08
- Subtitle: translateY factor 0.1
- CTA: translateY factor 0.05
- Orbs: various translateX/Y factors
- Disabled on mobile (max-width: 768px)

### Mouse Tilt Effect (Glass Cards)
- 3D perspective with rotateX/Y up to 1.5deg
- Radial gradient shine that follows cursor
- Disabled on touch devices

### Animations
- **FadeIn**: Elements fade in when scrolling into viewport (IntersectionObserver, threshold 0.1, once)
- **Marquee scroll**: `translateX(0) → translateX(-50%)`, 60s linear infinite, pauses on hover
- **Float animations**: Orbs float with translate/scale variations, 14s/18s/22s
- **Scroll pulse**: Opacity/scaleY oscillation, 2s infinite
- **Modal**: Backdrop fadeIn 0.25s, content slideUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)
- **FAQ accordion**: max-height 0→300px 0.4s, opacity 0→1 0.3s, icon rotate(45deg) 0.3s
- **Button hovers**: translateY(-2px), 0.3s ease
- **All transitions**: 0.2s-0.4s with ease or cubic-bezier(0.25, 0.46, 0.45, 0.94)

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Description |
|-----------|-------------|
| > 1100px | Full desktop: 4-column tier grid, 3-column benefits |
| 768px-1100px | Tablet: 2-column grids, max-width constraints |
| < 768px | Mobile: 1-column, hamburger nav, reduced padding |
| < 480px | Small mobile: further size reductions |

---

## PAGES & SECTIONS

### PAGE 1: HOME (`/`)

Sections render in this order:

#### 1. HERO
- Full viewport height (`100vh`), centered content
- Background: `#07090F` with `hero-watch.jpg` overlay (blue tint `rgba(10, 20, 60, 1)` with `background-blend-mode: overlay`, blur 1px, brightness 0.35, opacity 0.4)
- Two decorative orbs (purple top-right 700px, blue bottom-left 600px, blur 120px, opacity 0.15)
- **Logo**: BWC logo image, 400px wide, `filter: brightness(0) invert(1)` (white), 44px bottom margin
- **Subtitle**: "AN EXCLUSIVE COMMUNITY FOR COLLECTORS, ENTHUSIASTS, AND THOSE WHO APPRECIATE THE ART OF HOROLOGY." - clamp(15px, 1.5vw, 17px), color `rgba(232,236,240,0.55)`, line-height 1.9, 36px bottom margin
- **CTA Button**: "BECOME A FOUNDING MEMBER →" - links to `/membership`, 18px 56px padding, border-radius 40px, bg `#B8C4D4`, color `#07090F`
- Parallax effect on all elements
- FadeIn with staggered delays (0s, 0.15s, 0.3s)

#### 2. MARQUEE (Watch Carousel)
- Horizontal infinite scroll strip
- Background: `#07090F`, borders top/bottom `1px solid rgba(232,236,240,0.06)`, padding 28px 0
- Each item: circular thumbnail (44px), watch name (22px Bebas Neue, `rgba(232,236,240,0.45)`), reference number (10px Inter, `#4A5568`), separator dot (4px circle `#4A5568`)
- 60s linear infinite animation, pauses on hover
- Click opens modal with watch details

**Watch Data (12 watches, array is duplicated for seamless loop):**
1. AP Royal Oak - 15407BA - Audemars Piguet
2. Chronometre Souverain - CS.RG - F.P. Journe
3. Celestia Grand - 6102P - Patek Philippe
4. Daytona - 116506 - Rolex
5. RM 035 - RM035 - Richard Mille
6. Laureato - 81010 - Girard-Perregaux
7. Zeitwerk - 140.029 - A. Lange & Sohne
8. Tank Normale - WSTA0109 - Cartier
9. DB28 - DB28T - De Bethune
10. Legacy Machine - LM2 - MB&F
11. Seamaster 300 - 210.30 - Omega
12. Overseas - 4500V - Vacheron Constantin

**Watch Modal**: Dark card (#141820), watch image (240px height), brand (10px, #4A5568), name (28px Bebas), ref (11px, #4A5568), details text (13px, rgba(232,236,240,0.55))

#### 3. ABOUT
- Background: `#0D1018`, padding 140px 40px
- Three floating orbs (400px purple, 350px blue, 280px orange) with continuous float animations
- Grain texture overlay at 4% opacity
- **Header** (centered, 60px bottom margin):
  - Eyebrow: "WHO WE ARE" - 13px Bebas, `#4A5568`, letter-spacing 0.3em
  - Title: "BOSTON WATCH CLUB" - clamp(36px, 5vw, 52px) Bebas, `#E8ECF0`
  - Description: "BORN OUT OF A SHARED PASSION FOR TIMEPIECES AND THE CULTURE THAT SURROUNDS THEM, BWC IS BOSTON'S PREMIER WATCH COMMUNITY — BUILT BY COLLECTORS, FOR COLLECTORS." - 14px Inter 300, `rgba(232,236,240,0.55)`, max-width 520px
- **Glass Card** (dark variant, mouse tilt effect):
  - Eyebrow: "ROOTED IN BOSTON'S CULTURE" - 14px Bebas, `#4A5568`, letter-spacing 0.25em
  - Headline: "WE BRIDGE THE WORLDS OF HOROLOGY, CULTURE, AND COMMUNITY." - clamp(28px, 4vw, 44px) Bebas, white
  - Body: "OUR MISSION IS SIMPLE. CREATE A SPACE WHERE PASSION MEETS PURPOSE, WHERE COLLECTORS CONNECT, AND WHERE TIME IS ALWAYS WELL SPENT." - 15px Inter 300, `rgba(232,236,240,0.55)`, max-width 480px

#### 4. BENEFITS
- Background: `#07090F` with background image overlay
- 3-column grid (2 on tablet, 1 on mobile), gap 48px 40px
- Section header: Eyebrow "WHY JOIN BOSTON WATCH CLUB?", Title "WHAT YOU GET", Subtitle "THIS IS NOT JUST A MEMBERSHIP..."
- 6 benefit cards, each with:
  - Circular icon (68px, border 1.5px `rgba(184,196,212,0.15)`, color `#B8C4D4`)
  - Card background: `#141820`, border `1px rgba(184,196,212,0.08)`, border-radius 12px, padding 36px 20px
  - Hover: translateY(-6px), bg `#1a2030`, border-color `rgba(184,196,212,0.25)`

**Benefits:**
1. PRIORITY EVENT ACCESS (clock icon) - "YOU HEAR ABOUT IT BEFORE IT'S ANNOUNCED..."
2. MEMBERS-ONLY DINNERS (cup icon) - "CURATED EVENINGS IN BOSTON'S MOST EXCLUSIVE..."
3. PRIVATE COMMUNITY (people icon) - "A TIGHT, VETTED CIRCLE OF COLLECTORS..."
4. FOUNDING MEMBER STATUS (star icon) - "YOUR NAME IS ON THE WALL FOREVER..."
5. MEMBER DIRECTORY (book icon) - "DIRECT ACCESS TO EVERY MEMBER IN THE NETWORK..."
6. EARLY ACCESS (briefcase icon) - "BRAND COLLABORATIONS, LIMITED DROPS..."

#### 5. EVENTS
- Background: `#0D1018`, padding 120px 40px
- Eyebrow: "CALENDAR", Title: "UPCOMING EVENTS"
- Shows first event as a card:
  - Grid: date column | details column | CTA column
  - Date: Month (11px, `#4A5568`) + Day (32px Bebas)
  - Details: Name (clamp 18-24px), description (13px), location (11px, `#5A6A7E`)
  - CTA: "LEARN MORE →" pill button (border 1.5px `rgba(184,196,212,0.2)`, border-radius 32px)
  - Card: bg `#141820`, border-radius 12px, hover translateY(-2px)
- Bottom link: "CHECK OUT OTHER UPCOMING EVENTS →" (border 1.5px `#B8C4D4`, color `#B8C4D4`, border-radius 32px)
- Click opens EventModal

#### 6. TIMEPIECE (Featured Watch)
- Background: `#07090F`, padding 120px 40px
- 2-column grid, 80px gap, max-width 1100px
- **Left**: Square placeholder (aspect-ratio 1/1, bg `#141820`, border-radius 12px) with clock SVG icon + "COMING SOON" text in `#4A5568`
- **Right**:
  - Eyebrow: "FEATURED TIMEPIECE" - 13px, `#4A5568`
  - Name: "OMEGA SPEEDMASTER MOONWATCH" - clamp(32px, 4vw, 48px)
  - Ref: "REF. 310.30.42.50.01.002" - 11px, `rgba(232,236,240,0.55)`
  - Editorial: Long description about the Moonwatch - 14px Inter 300, line-height 1.9
  - Note: "CONTENT UPDATED MONTHLY BY OUR EDITORIAL TEAM" - 10px, `#4A5568`

#### 7. FAQ
- Background: `#0D1018`, padding 120px 40px, max-width 720px
- Eyebrow: "QUESTIONS", Title: "FREQUENTLY ASKED"
- Accordion list with border-top `1px rgba(232,236,240,0.08)` between items
- Question button: full width, 13px Inter 500, `#E8ECF0`, padding 24px 0
- "+" icon rotates 45deg when active, color `#4A5568`
- Answer: max-height transition 0→300px, 13px Inter 300, `rgba(232,236,240,0.55)`, line-height 1.8

**FAQ Items (9 total):**
1. "DO I NEED TO OWN A LUXURY WATCH TO JOIN?"
2. "WHAT KIND OF EVENTS DO YOU HOST?"
3. "HOW IS THIS DIFFERENT FROM REDBAR OR OTHER WATCH GROUPS?"
4. "WHAT DOES THE $40 APPLICATION FEE COVER?"
5. "I'M A STUDENT. IS THERE A WAY IN?"
6. "WHERE IN BOSTON ARE EVENTS HELD?"
7. "CAN I BRING A GUEST?"
8. "IS THERE A REFERRAL PROGRAM?"
9. "WHAT'S THE DIFFERENCE BETWEEN ENTHUSIAST AND COLLECTOR?"

#### 8. REGISTER (CTA Section)
- Background: `#0D1018` with `about-bg.jpg` overlay (blur 5px, brightness 0.4, opacity 0.35)
- Two orbs (500px purple, 400px blue, blur 100px, opacity 0.12)
- Centered glass card: padding 72px 56px, bg `rgba(232,236,240,0.04)`, backdrop-filter blur 40px, border-radius 16px
- Eyebrow: "FOUNDING MEMBERSHIP"
- Title: "READY TO JOIN?" - clamp(36px, 5vw, 52px), `#F4F6F8`
- Subtitle: "EXPLORE OUR MEMBERSHIP TIERS AND FIND THE RIGHT FIT FOR YOUR PASSION. FROM CASUAL ENTHUSIAST TO DEDICATED PATRON, THERE'S A SEAT AT THE TABLE FOR YOU."
- CTA: "VIEW MEMBERSHIP TIERS →" - bg `#B8C4D4`, color `#07090F`, padding 18px 52px, border-radius 32px

---

### PAGE 2: MEMBERSHIP (`/membership`)

#### Membership Hero
- Padding 160px 40px 60px, bg `#07090F`
- Background image: `membership-hero.jpg` (contain, not cover, scale 1.2, blur 0.75px, saturate 0.4, brightness 0.4, opacity 0.35)
- Eyebrow: "MEMBERSHIP TIERS"
- Title: "FIND YOUR TIER" - clamp(36px, 5vw, 52px)
- Subtitle: "SELECT THE MEMBERSHIP LEVEL THAT MATCHES YOUR PASSION FOR HOROLOGY."

#### Tier Grid
- Background: `#0D1018`, padding 80px 40px 100px
- 4-column grid (2 @1100px, 1 @768px), gap 24px, max-width 1200px

**4 Tier Cards:**

1. **ENTHUSIAST** - `$50` PER YEAR
   - Tagline: "For the curious" (italic)
   - Badge: "MOST POPULAR" (absolute top, bg `#B8C4D4`, color `#07090F`)
   - Border: `2px solid #B8C4D4` (popular highlight)
   - Founding: "FIRST 10 → FOUNDING MEMBER" (bg `#B8C4D4`, color `#07090F`, inline-block)
   - Benefits: 4 items
   - Student note: "STUDENTS: $30/YR WITH A VALID .EDU EMAIL" (link, color `#B8C4D4`, underline)
   - CTA: "APPLY NOW →"

2. **COLLECTOR** - `$1,125` PER YEAR
   - Tagline: "For the serious collector"
   - Benefits: 6 items (starts with "EVERYTHING IN ENTHUSIAST, PLUS:")
   - CTA: "APPLY NOW →"

3. **WOMAN COLLECTOR** - `FREE` FIRST YEAR
   - Tagline: "A dedicated space for women"
   - Benefits: 6 items
   - CTA: "JOIN THE CIRCLE"

4. **PATRON** - `$2,250` PER YEAR
   - Tagline: "The highest expression"
   - Benefits: 7 items
   - CTA: "APPLY NOW →"

**Card Styling:**
- Background: `#141820`, border-radius 16px, no border (except popular)
- Inner padding: 48px 32px 40px
- Name: 24px Bebas, `#E8ECF0`
- Price: 40px Bebas, `#E8ECF0`
- Period: 10px Inter, `#4A5568`
- Benefits: 12px Inter, `rgba(232,236,240,0.55)`, separated by `1px rgba(232,236,240,0.06)` borders
- CTA: full width, bg `#B8C4D4`, color `#07090F`, border-radius 32px, 16px padding
- Hover: translateY(-3px), shadow `0 12px 36px rgba(0,0,0,0.3)`
- CTA links to Typeform: `https://form.typeform.com/to/ntT8GKqz?tier={tier-id}`

---

### PAGE 3: EVENTS (`/events`)

- Hero section with title/subtitle
- Full grid of all 6 events
- EventModal on click

**6 Events:**
1. INAUGURAL COLLECTOR'S EVENING - Mar 2026 - Beacon Hill - All Members - 30 guests - Smart Casual
2. WATCHES & WHISKEY - Apr 2026 - Back Bay - Collector & Patron - 20 guests - Smart Casual
3. COLLECTOR SPOTLIGHT: SUMMER EDITION - Jun 2026 - TBA - All Members - 40 guests - Casual
4. SUMMER SOCIAL - Aug 2026 - Seaport - All Members + 1 Guest - 60 guests - Casual
5. FALL WATCH FAIR - Oct 2026 - Financial District - All Members - 50 guests - Casual
6. END OF YEAR GALA - Dec 2026 - Downtown Boston - All Members + 1 Guest - 80 guests - Black Tie

**Event Modal:**
- Overlay: `rgba(0,0,0,0.7)`, backdrop-filter blur 8px
- Modal: max-width 720px, bg `#141820`, border-radius 16px
- Hero banner: 180px height, gradient bg `135deg #1a1f2e → #0D1018`
- Details strip: DATE, TIME, VENUE, ACCESS, DRESS CODE (flex row, borders between)
- Description body: 14px, `rgba(232,236,240,0.65)`, line-height 1.8
- CTA: "BECOME A MEMBER TO RSVP & LEARN MORE →" - bg `#B8C4D4`

---

### PAGE 4: TERMS (`/terms`)

- Membership Hero with "TERMS & CONDITIONS" title
- TermsContent component with bylaws: Purpose, Membership, Code of Conduct, Events, Governance, Discipline, Liability, Privacy Policy, etc.
- Styled with h2 (22px), h3 (14px), p (14px, line-height 1.9), custom bullet lists

---

### PAGE 5: LOGIN (`/login`)

- Full viewport centered card (max-width 520px)
- Clock icon in `#B8C4D4` circle (52px)
- Title: "MEMBER PORTAL" (40px Bebas)
- Subtitle: "COMING SOON" (13px, `#4A5568`)
- Description text
- Two CTAs: "APPLY NOW" (bg `#B8C4D4`) and "BACK TO HOME" (border only)

---

## GLOBAL LAYOUT

### Navigation Bar (Fixed)
- Height: 72px desktop, 64px mobile
- Glass morphism: `backdrop-filter: blur(40px) saturate(180%)`
- Not scrolled: bg `rgba(7, 9, 15, 0.2)`, no shadow
- Scrolled (>40px): bg `rgba(7, 9, 15, 0.45)`, shadow `0 1px 24px rgba(0,0,0,0.12)`
- Logo: 60px x 60px, white (inverted)
- Links: HOME, MEMBERSHIP, EVENTS - 11px Inter, `rgba(232,236,240,0.55)`, active: `#E8ECF0` weight 600
- "APPLY NOW": border 1.5px `#B8C4D4`, color `#B8C4D4`, hover: bg `#B8C4D4` color `#07090F`
- "LOG IN": same style, routes to /login
- Mobile: hamburger (3 lines → X animation), fullscreen overlay menu

### Footer
- Background: `#07090F`, padding 48px 40px
- 3-column grid: Logo (52px) | Copyright centered | Social links right
- Copyright: "© 2025 BOSTON WATCH CLUB. ALL RIGHTS RESERVED." - 11px, `#4A5568`
- Links: TERMS (text), Instagram (SVG icon), Email (SVG icon) - color `#4A5568`, hover `#E8ECF0`
- Social: Instagram `https://www.instagram.com/boswatchclub/`, Email `boswatchclub@gmail.com`

---

## SHARED COMPONENTS

### FadeIn
- IntersectionObserver (threshold 0.1, once: true)
- Opacity 0→1, translateY 16px→0
- Optional `delay` prop for staggering

### GlassCard
- Variants: light (default), dark, modal
- Mouse tilt 3D effect (rotateX/Y up to 1.5deg)
- Shine gradient follows cursor
- Border glow: `linear-gradient(135deg, rgba(232,236,240,0.3) 0%, transparent 40%, transparent 60%, rgba(232,236,240,0.15) 100%)`

### Modal
- Fixed overlay, z-index 9999
- Escape key closes
- Backdrop click closes
- Body overflow hidden when open

### RegisterForm
- Fields: First Name, Last Name (side by side), Email, Instagram
- Dark input styling: bg `rgba(232,236,240,0.08)`, border `rgba(232,236,240,0.15)`
- Submit: "APPLY NOW →" with arrow animation on hover
- Stores to localStorage key `bwc_submissions`
- Success state: checkmark + "WELCOME TO THE CLUB."

---

## ASSETS REQUIRED

Images in `/public/assets/`:
- `icon.png` - Favicon/logo icon
- `logo.png` - Full BWC logo (used in hero, 400px wide, inverted to white)
- `hero-watch.jpg` - Home hero background (watch photo, 2100x1400)
- `membership-hero.jpg` - Membership page hero background
- `about-bg.jpg` - Register section background
- `benefits-bg.webp` - Benefits section background (optional)
- `membership-bg.webp` - (optional)
- `watch-1.png` through `watch-12.png` - Individual watch images for marquee carousel (transparent PNGs)

---

## KEY INTERACTIONS

1. **Marquee**: Click watch → modal with details
2. **Events**: Click event card → EventModal with full details and RSVP CTA
3. **FAQ**: Click question → accordion expand/collapse with + rotation
4. **Tier Cards**: "APPLY NOW" → links to Typeform with tier query param
5. **Nav**: Scroll changes glass opacity, hamburger for mobile
6. **Glass Cards**: 3D tilt follows mouse on desktop
7. **All sections**: Fade in on scroll into viewport
8. **Hero**: Parallax on scroll (multiple layers at different speeds)
9. **Home page**: Hash anchor support for smooth scrolling to sections

---

## EXTERNAL INTEGRATIONS

- **Typeform**: `https://form.typeform.com/to/ntT8GKqz?tier={tier-id}` for membership applications
- **Google Fonts**: Bebas Neue + Inter (300, 400, 500)
- **GitHub Pages**: Deployed with `gh-pages` package, base `/BOS-watch-club/`
- **Instagram**: `https://www.instagram.com/boswatchclub/`
- **Email**: `boswatchclub@gmail.com`
