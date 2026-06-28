# 🎁 Dev Wrapped

<p align="center">
  <a href="https://dev-wrapped-eight.vercel.app">
    <img src="https://dev-wrapped-eight.vercel.app/api/card/HMAKT99?theme=midnight" alt="Dev Wrapped — example card" width="640">
  </a>
</p>

<p align="center">
  <b>▶ Try it live: <a href="https://dev-wrapped-eight.vercel.app">dev-wrapped-eight.vercel.app</a></b><br>
  Type any GitHub <b>username</b> or <b>owner/repo</b> — get a shareable card in seconds.
</p>

Your year in code — wrapped. Point it at a git repo (or your GitHub account) and
get a gorgeous, animated, **Spotify-Wrapped-style** year-in-review of your coding:
your commit count, your longest streak, the hour you secretly do your best work,
your top languages, and your **developer persona** — *Night Owl 🦉*, *The
Refactorer 🧹*, *Ship-It Gremlin 👹*, and more.

The output is a **single self-contained HTML file** (no dependencies, works
offline) plus shareable PNG cards sized for stories and link previews.

> Built as a [Claude Code](https://claude.com/claude-code) skill, but the scripts
> are plain Node and run on their own too.

## ✨ Why it's nice

- **One file, zero dependencies.** No CDNs, no web fonts, hand-rolled charts. Open
  it anywhere, host it anywhere, send it to anyone.
- **Private by default.** Local mode is pure `git log` — your data never leaves
  your machine.
- **It has taste.** Six hand-designed themes (`midnight`, `synthwave`, `terminal`,
  `editorial`, `bubblegum`, `sunset`) so it never looks like generic output.
- **Made to share.** Every run ends on a flex card built for a screenshot.

## 📌 Add it to your README

Drop a live card into any README — it refreshes automatically (no build step):

**Your profile** — replace `USERNAME`:
```md
[![Dev Wrapped](https://dev-wrapped-eight.vercel.app/api/card/USERNAME?theme=midnight)](https://dev-wrapped-eight.vercel.app/u/USERNAME)
```

**Any repo** — replace `OWNER/REPO`:
```md
[![Dev Wrapped](https://dev-wrapped-eight.vercel.app/api/card/repo/OWNER/REPO?theme=synthwave)](https://dev-wrapped-eight.vercel.app/r/OWNER/REPO)
```

Swap `?theme=` for any of: `midnight` · `synthwave` · `terminal` · `editorial` · `bubblegum` · `sunset`.
Prefer a committed PNG that auto-refreshes on a schedule? Use the [GitHub Action](action/README.md).

## 🚀 Quick start (CLI / Claude Code skill)

```bash
# 1. From inside any git repo — extract your stats (last 365 days, your commits)
node scripts/extract-git-stats.mjs --out stats.json

# 2. Add your persona + headline numbers
node scripts/compute-persona.mjs stats.json

# 3. Build the wrapped (pick a theme)
node scripts/build-wrapped.mjs --stats stats.json --theme midnight --out wrapped.html

# 4. Open wrapped.html in your browser. Arrow keys / tap / scroll to advance.
```

Want shareable PNGs? (optional, needs Playwright)

```bash
npm i playwright && npx playwright install chromium
node scripts/export-png.mjs --html wrapped.html --formats story,og
# -> dev-wrapped-story.png (1080x1920)  +  dev-wrapped-og.png (1200x630)
```

### Whole-account mode (GitHub)

```bash
gh auth login   # once
node scripts/extract-github-stats.mjs --user <login> --year 2026 --out stats.json
node scripts/compute-persona.mjs stats.json
node scripts/build-wrapped.mjs --stats stats.json --theme synthwave --out wrapped.html
```

## 🎨 Themes

`midnight` · `synthwave` · `terminal` · `editorial` · `bubblegum` · `sunset`
— see [`themes/THEMES.md`](themes/THEMES.md). Adding one is just a CSS file.

## 🔧 Useful flags

| Flag | What it does |
|---|---|
| `--year 2026` | Restrict to a calendar year |
| `--since 2026-01-01` | Custom start date |
| `--all-authors` | Include everyone, not just you |
| `--author <substr>` | Filter by a name/email substring |
| `--repo <path>` | Point at a repo other than the current dir |

## 🗺️ How it works

```
extract-git-stats.mjs   git log         ─┐
extract-github-stats.mjs gh GraphQL      ├─> stats.json
                                          │
compute-persona.mjs      + persona/derived┘
                                          │
build-wrapped.mjs        + theme + template ─> wrapped.html (self-contained)
                                          │
export-png.mjs           Playwright          ─> PNG share cards
```

## 📄 License

MIT — see [LICENSE](LICENSE).
