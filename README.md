# C9 Analytics UI

Web dashboard for **C9 Analytics**, an esports analytics suite for Cloud9 covering **League of Legends** and **VALORANT**. Built with React, TypeScript and Vite.

Backend: [C9-Analytics-API](https://github.com/AvishKaushik/C9-Analytics-API)

## Features

Switch between LoL and VALORANT with the game toggle. Three sections:

- **Assistant Coach**: overview, players, team, matches, player/team comparison, performance trends, macro review, what-if scenarios
- **Scouting Report**: generate opponent reports, threat rankings, map stats, counter-strategies, ask-the-coach chat, report history
- **Draft Assistant**: draft board with live recommendations, draft simulation, meta champions, champion search, draft history

> The data is currently **sample data** served by the backend. The original data source (GRID) is no longer available. Team names are real organisations, but players and stats are invented.

## Quick start

Requires Node.js 18+.

```bash
npm install
npm run dev            # http://localhost:3000
```

By default the app calls the deployed API at `https://c9-analytics-api.onrender.com/api/v1`. The first request can take 30–60 seconds while the free-tier server wakes up.

### Run against a local backend

Start the [API](https://github.com/AvishKaushik/C9-Analytics-API) first, then point the UI at it:

```bash
VITE_API_URL=http://localhost:8000/api/v1 npm run dev
```

Or put `VITE_API_URL=...` in a `.env.local` file (git-ignored).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Render deployment URL | Base URL of the API, including `/api/v1` |

## Project structure

```
src/
  api/          Axios clients per module (insights, scouting, draft)
  components/   Shared UI (header, tab bar, team search, stat cards, ...)
  hooks/        Game context, data loading, debounce
  pages/
    coach/      Assistant Coach tabs
    scout/      Scouting Report tabs
    draft/      Draft Assistant tabs
```

## Deployment (Vercel)

Import the repo in Vercel (framework preset: Vite). Optionally set `VITE_API_URL` in the project's environment variables to point at your backend.

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts, Framer Motion, Axios.
