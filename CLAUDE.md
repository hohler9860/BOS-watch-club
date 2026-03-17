# BOS Watch Club

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
- **Frontend**: Vite, vanilla JS/HTML/CSS (in `src/` and `index.html`)
- **Backend**: Supabase
- **Build**: `build.py`, `vite.config.js`
- **Assets**: `public/assets/`, `assets/`, `watches/`
