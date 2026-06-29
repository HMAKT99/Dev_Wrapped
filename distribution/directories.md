# Dev Wrapped — Passive-Discovery Directory List

Submitting to these directories is **passive distribution** — backlinks + indexing,
no PRs into other people's source repos. This is **lower flag-risk** than awesome-list
PRs (the account-flag concern was about self-promotional PR bursts). Still, keep it
unhurried: a few per week, genuine, no duplicate spammy copy.

**Before each submit:** open the site, confirm it's live and the submit mechanism still
exists (these come and go), and that Dev Wrapped fits the category. A ✅ below means the
mechanism is known; a ⚠️ means *verify the exact submit URL/flow on the site first*.

---

## Paste-ready copy (use everywhere)

**Name:** Dev Wrapped

**One-liner (≤80 chars):**
> Spotify Wrapped for your GitHub year — commits, streaks & your dev persona.

**Short description (≤200 chars):**
> Dev Wrapped turns any GitHub user or repo into a gorgeous, shareable year-in-review:
> commit count, longest streak, top languages, busiest hour, and a collectible
> "developer persona." Open-source (MIT); works as a Claude Code skill or a live web app.

**Long description:**
> Dev Wrapped is an open-source "Spotify Wrapped" for developers. Point it at a GitHub
> username or any `owner/repo` and get an animated, self-contained year-in-review —
> commits, longest streak, top languages, the hour you secretly do your best work, and a
> rarity-tiered **developer persona** (Night Owl 🦉, The Refactorer 🧹, Ship-It Gremlin 👹,
> and rarer legendaries). Output is a single zero-dependency HTML file plus PNG share
> cards sized for stories and link previews, and an embeddable README badge that
> auto-refreshes. Ships as a Claude Code skill (plain Node scripts underneath) and a live
> Next.js web app. MIT licensed.

**Links:**
- Live app: https://dev-wrapped-eight.vercel.app
- Repo: https://github.com/HMAKT99/Dev_Wrapped
- Demo GIF: `web/public/demo.gif` (in repo) · Tags/topics: `github`, `developer-tools`,
  `claude-code`, `claude-skill`, `wrapped`, `year-in-review`, `open-source`

---

## Directories

> Fit = how well Dev Wrapped matches what the directory indexes. Submit highest-fit first.

| # | Directory | What it indexes | Submit method | Fit | Notes |
|---|---|---|---|---|---|
| 1 | **Anthropic Claude Code plugin/skill marketplace** | Official Claude Code skills & plugins | ✅ Add a `.claude-plugin/plugin.json` + marketplace manifest, then submit per current plugin-directory docs | **High** | Best long-term fit — Dev Wrapped already ships `SKILL.md`. Confirm the exact manifest schema at publish time (it has changed). One-time setup, then it's listed. |
| 2 | **lobehub.com** (Discover / marketplace) | AI tools, plugins, MCP, assistants | ⚠️ Web submission / GitHub-backed listing — verify current flow on the Discover page | Medium | Large audience; categories may not have a perfect "GitHub wrapped" slot — list under dev tools. |
| 3 | **mcpmarket.com** | Primarily MCP servers | ⚠️ Verify whether they accept non-MCP dev tools; if MCP-only, **skip** | Low | Dev Wrapped is **not** an MCP server. Only submit if they have a general tools section — otherwise off-scope (skip to stay clean). |
| 4 | **awesome-skills.com** | Claude Code skills aggregator | ⚠️ Likely auto-indexes from GitHub topic / an awesome-list PR — verify on site | Medium-High | If it auto-indexes by the `claude-skill` topic, just add the topic to the repo and it appears (zero-touch). Confirm. |
| 5 | **tonsofskills** (site or `ccpi`-style GitHub index) | Claude Code skills | ⚠️ Verify: site form vs. GitHub PR to its index repo | Medium | Could not confirm exact mechanism from memory — check whether it's a website or an awesome-list repo before acting. |
| 6 | **skillsllm** | Claude/LLM skills listings | ⚠️ Verify site + submit flow | Medium | Confirm it's live before submitting. |
| 7 | **claudepluginhub** | Claude Code plugins/skills hub | ⚠️ Verify site + submit flow | Medium | Overlaps with #1; submit if it's a distinct live directory. |
| 8 | **crossaitools** | General AI tools directory | ⚠️ Web submit form (often paid/featured upsell) | Low-Medium | Generic AI-tools directories convert poorly for a dev-niche tool; only if free + quick. |
| 9 | **explainx** | AI tools / resources | ⚠️ Verify it indexes tools (some are blogs/newsletters) | Low | Confirm it's a directory, not just content, before bothering. |
| 10 | **shyft** | AI tools (verify) | ⚠️ Could not confirm; verify exists | Low | Low priority — verify before spending time. |

### Additional high-fit targets to check (awesome-list backlinks, GitHub-native)
These are GitHub awesome-lists — submitting is a PR, so they fall under the **PR safety
protocol** (low volume, disclosed authorship, one at a time), NOT the zero-risk passive
bucket. Listed here for completeness; pace them with the awesome-list PR plan.

- `abhisheknaiidu/awesome-github-profile-readme` — **Tools** section. *(Tier-1 PR #1 — already queued in the distribution plan.)*
- `hesreallyhim/awesome-claude-code` — skills/applications. *(Tier-1 #2.)*
- `travisvn/awesome-claude-skills`, `ComposioHQ/awesome-claude-skills`, `VoltAgent/awesome-agent-skills` — *(Tier-2, later.)*

### GitHub-native passive discovery (do this regardless — zero risk)
- Add repo **topics**: `claude-code`, `claude-skill`, `developer-tools`, `github`,
  `wrapped`, `year-in-review`, `open-source`. Many aggregators auto-index by topic.
- Sharp one-line repo **description** (use the one-liner above).
- Keep the **README demo GIF** + live link at the top (done).

---

## Suggested order
1. **GitHub topics + description** (zero-touch, do now).
2. **Anthropic plugin/skill marketplace** (#1 — highest fit, one-time manifest).
3. **awesome-skills.com** (#4 — if topic-auto-indexed, free).
4. Then lobehub (#2), and the smaller skill directories (#5–7) a few per week.
5. Skip anything off-scope (e.g. MCP-only #3) to keep the footprint clean.

_Skill/AI-tool directories churn fast — treat every ⚠️ as "verify live before submitting."_
