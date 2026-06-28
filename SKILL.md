---
name: dev-wrapped
description: >-
  Turn any git repo (or a GitHub account) into a gorgeous, self-contained,
  Spotify-Wrapped-style year-in-review of someone's coding — a single animated
  HTML file plus shareable PNG cards. Use when the user asks for a "dev wrapped",
  "coding wrapped", "year in code", "git wrapped", "GitHub wrapped", a
  developer-stats recap, or a shareable summary of their commit history.
---

# Dev Wrapped

Generate a beautiful, shareable "Wrapped" for a developer's year in code. The
output is a **single self-contained HTML file** (no dependencies, works offline)
that plays like Instagram/Spotify stories, plus optional **PNG share cards**.

The magic isn't the stats — it's the **persona reveal** ("You're a Night Owl 🦉")
and the **curated visual themes**. Lead with those.

## Workflow

### 1. Pick the data source
- **Local (default, zero-auth, private):** the git repo in the current directory.
  Nothing leaves the machine. Use this unless the user asks otherwise.
- **GitHub account-wide (optional):** all of a user's repos via `gh`. Requires
  `gh auth status` to pass. Use when the user wants their *whole year*, not one repo.

### 2. Extract stats → `stats.json`
- Local:  `node scripts/extract-git-stats.mjs --out stats.json`
  - Defaults to the last 365 days and **your** commits (`git config user.email`).
  - Useful flags: `--year 2026`, `--since 2026-01-01`, `--all-authors`,
    `--author <name|email substr>`, `--repo <path>`.
- GitHub: `node scripts/extract-github-stats.mjs --user <login> --out stats.json`
  (per-hour data isn't available from GitHub; the hour scene auto-hides.)
- Full metric list + exact commands: **reference/metrics.md**.

### 3. Compute the persona → enriches `stats.json`
`node scripts/compute-persona.mjs stats.json`
Adds `derived` (headline numbers) and `persona` (archetype + evidence). Tell the
user their persona out loud — it's the hook. Archetype rules: **reference/personas.md**.

### 4. Show, don't tell — let the user pick a theme
Don't ask the user to describe taste in words. Render 3–4 **theme preview cards**
and let them pick. The six themes and how to preview them: **themes/THEMES.md**.
Themes: `midnight` (default), `synthwave`, `terminal`, `editorial`, `bubblegum`, `sunset`.

### 5. Build the wrapped HTML
`node scripts/build-wrapped.mjs --stats stats.json --theme <name> --out wrapped.html`
Splices the data + chosen theme into `templates/base.html`. Open `wrapped.html` in
any browser — arrow keys / tap / scroll to advance. Scene catalog: **templates/scenes.md**.
Optional: `--credit "github.com/<user>/<repo>"` sets the share-card credit link,
and `--label "Last 12 months"` overrides the date label (otherwise the year).

### 6. (Optional) Export share cards
`node scripts/export-png.mjs --html wrapped.html --formats story,og`
Produces `dev-wrapped-story.png` (1080×1920) and `dev-wrapped-og.png` (1200×630).
This step — and only this step — needs Playwright:
`npm i playwright && npx playwright install chromium`. The HTML itself is zero-dep.

## Customizing
- New persona → add to the `PERSONAS` array in `scripts/compute-persona.mjs` and
  document it in `reference/personas.md`.
- New theme → add `themes/<name>.css` (just CSS custom properties) and list it in
  `themes/THEMES.md`. No code change needed.
- New scene → add an `add(() => {...})` block in `templates/base.html`.

## Notes
- The HTML is intentionally dependency-free: no CDNs, no web fonts, hand-rolled
  SVG/CSS charts. Keep it that way — it's the trust + shareability moat.
- Scenes for empty data (no languages, no per-hour data) auto-hide.
