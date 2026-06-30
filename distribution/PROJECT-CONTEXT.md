# Dev Wrapped — Full Project Context & Handoff

_Last updated: 2026-06-29. Single source of truth so a fresh session knows this project
end to end. Read this first._

---

## 1. What Dev Wrapped is
A **"Spotify Wrapped for your GitHub year"** — point it at a GitHub user or any
`owner/repo` and get a gorgeous, animated, shareable year-in-review: commit count,
longest streak, top languages, busiest hour, and a **developer persona** (with rarity
tiers). The persona reveal + curated visual themes are the magic, not the raw stats.

- **Live web app:** https://dev-wrapped-eight.vercel.app
- **Repo:** https://github.com/HMAKT99/Dev_Wrapped  (owner: `HMAKT99`, author goes by **"AKT" / Arun**)
- **Local repo path:** `/Users/arun/skills/dev-wrapped`  (NOTE: this dir is NOT a git repo per the env banner, but it IS — `git` works from here; remote = origin above)
- **Web app subdir:** `web/` (Next.js 14.2.35 App Router, deployed on Vercel, root dir = `web`)

### Four ways users consume it (the "positioning story" for distribution)
1. **Web app** — type username or `owner/repo` → instant wrapped + persona.
2. **README badge** — `[![Dev Wrapped](…/api/card/USERNAME)](…)` auto-refreshing card.
3. **CLI / Claude Code skill** — `node scripts/…`; pure `git log` local mode (private by default).
4. **Plugin install** — `/plugin marketplace add HMAKT99/Dev_Wrapped` → `/plugin install dev-wrapped@dev-wrapped`.

---

## 2. Hard constraints / working conventions (DO NOT VIOLATE)
- **User is the SOLE contributor.** NO Claude attribution anywhere — no Co-Authored-By,
  no "Generated with Claude", no bot markers in commits / PRs / manifests / READMEs.
- **Batch changes; ASK PERMISSION before pushing.** The GitHub account `HMAKT99` was
  **suspended once for too much activity / self-promotional PR bursts.** Account hygiene
  is the #1 constraint. (See memory: `git-push-batching.md`, `sole-contributor-no-claude-attribution.md`.)
- **Distribution = low volume, high relevance, handcrafted, disclosed authorship.**
  One PR at a time; wait days between; halt on any maintainer pushback or GitHub warning.
  Max ~4–5 PRs total, ever.
- Keep `web/lib/persona.ts` and `scripts/compute-persona.mjs` **in sync** (persona table
  is the key asset).
- If a Vercel deploy doesn't go live, the webhook likely missed it → empty commit
  (`git commit --allow-empty -m "redeploy" && git push`) re-triggers it.

---

## 3. Current status — EVERYTHING BELOW IS SHIPPED & LIVE
- User wrapped (`/u/<user>`) + Repo wrapped (`/r/<owner>/<repo>`)
- Self-contained animated HTML story engine (zero deps); **6 themes** (midnight, synthwave,
  terminal, editorial, bubblegum, sunset); **light/dark** toggle
- Dynamic **OG share images** (`/api/og/...`, story + og sizes) + **README embed card** (`/api/card/...`)
- **Rare/collectible personas** (RARE/LEGENDARY badges); **live rarity odds** (needs Upstash to switch on)
- Per-IP **rate limiting** (in-memory; Upstash optional for durable)
- Reusable **GitHub Action** in `action/` (commits a card to any repo's README)
- **Animated demo** — `web/public/demo.{gif,mp4,png}`; embedded in README (gif) + landing hero (mp4 loop)
- **Share-loop polish** — `web/components/ShareBar.tsx`: native Web Share ("📤 Share my card")
  with X-intent fallback; persona-curiosity tweet text; "✨ Make your own" CTAs on both results pages
- **Claude Code plugin** — `.claude-plugin/plugin.json` + `marketplace.json`; repo is its own
  marketplace. Verified end-to-end from GitHub (strict-validated; skill discovered; installs/uninstalls clean).
- Repo **topics** set (12: claude-code, claude-skill, github-profile-readme, spotify-wrapped,
  year-in-review, developer-persona, etc.) + sharp description + homepage.
- **Env on Vercel:** `GITHUB_TOKEN` (classic PAT, read:user). Local dev token in `web/.env.local` (gitignored).

### Recent git history (origin/main)
```
82f9937 Make Dev Wrapped installable as a Claude Code plugin
18a97c7 Add animated demo (README + hero), native share + CTAs, directory list
7568293 README: add live demo showcase, Try-it link, and README embed kit
43433db chore: re-trigger Vercel deploy
6d7cd45 Fix big-number/title overflow in story scenes (min(vw,vh))
44f327d Add Repo Wrapped, rare/collectible personas, and live rarity odds
```

---

## 4. Distribution — state of play
### DONE
- **PR #1743** → `abhisheknaiidu/awesome-github-profile-readme` (Tools section). **OPEN, mergeable,
  clean +1/-0**, placed right after "All Dev Stats in Readme", human disclosed-authorship body.
  ⚠️ DO NOT open a duplicate. DO NOT bump/comment to nudge the maintainer — let it sit & watch.
- Profile README (`HMAKT99/HMAKT99`) has a Dev Wrapped section + live card.
- Repo README hub (showcase + embed kit + plugin install + demo gif).
- Repo topics + description (zero-risk, done via API).
- Plugin marketplace live on the repo (public install path verified).
- **SUBMITTED to the Claude `claude-community` marketplace** (2026-06-30) via the Console form
  (platform.claude.com/plugins/submit). Fields: repo link `HMAKT99/Dev_Wrapped`, homepage the
  vercel app, name "Dev Wrapped", MIT, platform = **Claude Code only** (not Cowork — untested),
  no privacy URL, contact arunkt.bm14@gmail.com. **Status: in review.** After approval it syncs
  nightly into `anthropics/claude-plugins-community` → installable as `@claude-community`.
  Check by searching its name in that repo's `.claude-plugin/marketplace.json`.
- `distribution/directories.md` — passive-discovery list (each ⚠️ entry = verify submit URL live first).

### PENDING (paced, one at a time — only after #1743 lands clean)
- **PR #2:** `hesreallyhim/awesome-claude-code` (47.6k★) → applications/skills section.
  Lead with the **plugin/skill** framing (not the badge). Read its CONTRIBUTING; handcraft fresh
  description; don't pre-write until #1743 merges.
- **Tier-2 (later, natural fits found):** `dhyeythumar/awesome-readme-tools`,
  `suryakantamangaraj/AwesomeGithubProfileTemplates`, `travisvn/awesome-claude-skills`,
  `ComposioHQ/awesome-claude-skills`, `VoltAgent/awesome-agent-skills`.
- **⛔ Do NOT submit (off-scope = spam risk):** addyosmani/agent-skills, punkpeye/awesome-mcp-servers
  (MCP only), NousResearch/hermes-agent, openclaw, garrytan/gstack.
- **Directories** (`distribution/directories.md`): Anthropic plugin marketplace (#1 fit now that we
  have a manifest), awesome-skills.com, lobehub, etc. A few per week.
- **Product Hunt:** prep with demo GIF + screenshots + tagline + first comment. Save for December.
- **Upstash** (free): switches on live rarity odds + durable rate limiting.
- **Custom domain** on Vercel.

### TIMING (the real shot)
The viral window is **late Nov–Dec "Wrapped season"** — seed quietly now, save the
coordinated push for December when the format already trends.

---

## 5. PR submission playbook (when it's time for the next one)
- I submit **as HMAKT99 via `gh`** (already authed, scopes: repo/workflow/gist/read:org/delete_repo).
- Read the repo's CONTRIBUTING + neighbor entries; match exact format.
- Handcraft a unique, benefit-led description (never reuse a blurb). Disclose authorship plainly.
- Single-purpose clean branch (`add-dev-wrapped`); no bot trailers.
- Open ONE PR, return URL, STOP. Watch several days. Halt on any pushback/warning.

---

## 6. Key files & gotchas
- `web/lib/persona.ts` ↔ `scripts/compute-persona.mjs` — keep in sync (PERSONAS array w/ rarity:
  legendary = centurion/ten-xer/phantom; rare = marathoner/polymath/refactorer/machine/novelist;
  common = night-owl/early-bird/weekend-warrior/streaker/specialist/gremlin).
- `web/components/Card.tsx` — satori OG/card; branches `s.source==='repo'` vs user; rarity badge + odds.
- `web/lib/themeList.ts` — pure (no fs) theme list for client/edge; `web/themes.ts` reads files (node only).
- `web/lib/personaStats.ts` — Upstash REST; graceful no-op without Upstash; `RARITY_DEV_MOCK` env hook.
- `.claude-plugin/plugin.json` uses `"skills": ["./"]` so the **root** SKILL.md is discovered
  (avoids moving SKILL.md / breaking the `node scripts/…` relative paths).
- satori gotchas: flexbox only; emoji via twemoji; `★`/some glyphs render as tofu (avoid).
- Big numbers must size off `min(vw,vh)` not `vh` alone (overflow fix).
- Demo recording: record self-contained HTML via `file://` with `#hint` hidden (don't capture API load).

### Validate the plugin locally (reversible)
```
claude plugin validate . --strict
claude plugin marketplace add HMAKT99/Dev_Wrapped
claude plugin install dev-wrapped@dev-wrapped
claude plugin details dev-wrapped          # expect: Skills (1) dev-wrapped
claude plugin uninstall dev-wrapped && claude plugin marketplace remove dev-wrapped  # cleanup
```

---

## 7. Pointers
- Plan file: `/Users/arun/.claude/plans/i-want-to-build-bright-hennessy.md` (distribution plan, current)
- Older handoff: `…/scratchpad/dev-wrapped-handoff.md` (superseded by this file)
- Memory: `/Users/arun/.claude/projects/-Users-arun-skills/memory/` (git-push-batching, sole-contributor-no-claude-attribution)
- Scheduled routine: a one-time reminder fires 2026-06-29 morning to submit the Tier-1 PR —
  **already submitted (#1743), so it's safe to ignore/dismiss.**
