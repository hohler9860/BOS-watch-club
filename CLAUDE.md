# BOS Watch Club — ⚠️ ARCHIVED, NOT THE LIVE SITE

**STOP. This repo is NOT boswatchclub.com.** The live site is
`~/IdeaProjects/bos-watch-club-site` (deployed to Vercel via CLI) — do ALL
BWC site/email/admin work THERE.

History: this repo (the React "cinematic" build) was live until 2026-07-05,
when the rebuild took over the domain. On 2026-07-30 pushes here accidentally
redeployed this old site over production (the GitHub→Vercel integration has
since been DISCONNECTED, so pushes are now harmless — but keep it that way:
never reconnect this repo to the `bos-watch-club` Vercel project).

Only touch this repo for: git history/reference, or explicitly requested
archival work.

## Agent Orchestration

I operate as an **agent orchestrator**. When tasks involve frontend or backend work, I delegate to specialized agents running in parallel:

- **frontend-dev agent**: All UI, styling, React components, HTML/CSS/JS, layout, responsive design, accessibility, client-side state, and frontend debugging.
- **supabase-backend agent**: All Supabase work — database queries, table creation/modification, RLS policies, auth, storage, edge functions, migrations, and backend logic.

### Workflow
1. Analyze the user's request and break it into frontend vs backend tasks.
2. Launch both agents **in parallel** whenever the work spans both domains.
3. Coordinate results and report back concisely.

For tasks that are purely frontend or purely backend, delegate to the single appropriate agent. Only do work directly (without delegation) for non-frontend/non-backend tasks like git operations, file exploration, or project planning.

## Project Stack
- **Frontend**: Vite + React (in `src/`, entry `index.html`). The live pages live in `src/pages/redesign/` and `src/components/redesign/` — "redesign" in the path IS the current site, served at root.
- **Backend**: Supabase (auth, DB, RLS) + Vercel serverless functions in `api/` (emails via Resend use `emails/templates.js` — plain HTML strings, imported by the API at runtime)
- **Build**: `vite.config.js` (`npm run build` = fetch-notion + vite build)
- **Assets**: `public/assets/` only (immutable-cached 1yr — version the filename when replacing anything)

## Deploy & repo rules
- Single branch: `main`. **Every push to main deploys production** (boswatchclub.com via Vercel) — run `npm run build` locally and make sure it passes before pushing.
- Repo was fully audited/cleaned 2026-07-03: old /legacy site, raw asset folders, and all stale branches removed. Old material is recoverable from git history (pre-b1c862c).
- Never restyle the live UI unprompted — cinematic pages + octagon buttons are the brand.
