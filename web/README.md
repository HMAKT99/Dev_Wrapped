# Dev Wrapped — Web

The viral layer for [Dev Wrapped](../README.md): type a GitHub username, get a
shareable year-in-review. Reuses the same engine (persona logic, themes, story
renderer) as the CLI/skill.

## Run locally

```bash
cd web
npm install
cp .env.example .env.local        # fill in GITHUB_TOKEN
GITHUB_TOKEN=$(gh auth token) npm run dev   # quick way to grab a token
# open http://localhost:3000  →  try /u/<your-username>
```

## Routes

| Route | What it does |
|---|---|
| `/` | Landing: username input + theme picker |
| `/u/[username]?theme=&window=` | Results: interactive wrapped + share bar + README snippet (sets `og:image`) |
| `/api/wrapped/[username]` | The self-contained interactive HTML (served in the iframe) |
| `/api/og/[username]?format=og\|story` | Dynamic share image (1200×630 / 1080×1920) |
| `/api/card/[username]` | Compact README embed card (the distribution lever) |

`?theme=` ∈ `midnight\|synthwave\|terminal\|editorial\|bubblegum\|sunset`.
`?window=` ∈ a year like `2025` (default: trailing 12 months).

## Deploy (Vercel)

1. New Vercel project → **Root Directory = `web`**.
2. Env vars: `GITHUB_TOKEN` (classic PAT, `read:user`) and `NEXT_PUBLIC_SITE_URL`
   (your final origin, e.g. `https://devwrapped.app`).
3. Deploy. Point your domain at it.

## README embed

```md
[![Dev Wrapped](https://devwrapped.app/api/card/USERNAME?theme=midnight)](https://devwrapped.app/u/USERNAME)
```

## Architecture notes

- `lib/github.ts` — GitHub GraphQL fetch (public data only), cached ~6h.
- `lib/persona.ts` — **ported from `../scripts/compute-persona.mjs`; keep the
  persona table in sync between the two.**
- `lib/build.ts` + `templates/base.html` + `themes/*.css` — the story renderer,
  reused from the CLI.
- `components/Card.tsx` — the image card (satori) used by the OG + README routes.
- Image routes run on the **edge**; the wrapped route runs on **node** (reads
  theme/template files; bundled via `outputFileTracingIncludes` in `next.config.mjs`).

## Roadmap (post-MVP)

GitHub Action (auto-post card on release/monthly), Repo Wrapped (per-repo embed),
rare/collectible personas, GitHub OAuth for private contributions, roast mode.
