# Metrics reference

Everything `stats.json` can contain, and where it comes from.

## Local mode (`extract-git-stats.mjs`)

Parses one `git log` pass with `--numstat`. Default window: last 365 days.
Default author: your `git config user.email` (override with `--all-authors` or
`--author <substr>`).

| Field | Meaning | Source |
|---|---|---|
| `totals.commits` | non-merge commits in window | `git log --no-merges` |
| `totals.activeDays` | distinct calendar days with a commit | commit dates |
| `totals.longestStreak` | longest run of consecutive active days | derived |
| `totals.linesAdded/Deleted/net` | line churn | `--numstat` |
| `time.byHour[24]` | commits per hour of day | commit author time |
| `time.byWeekday[7]` | commits per weekday (0=Sun) | commit author time |
| `time.byMonth` | commits per `YYYY-MM` | commit author time |
| `time.busiestHour` / `busiestWeekdayName` | peaks | derived |
| `topLanguages[]` | `{name, lines, files}` by churn, ranked | file extensions |
| `topFiles[]` | `{file, commits}` most-changed | per-file touch count |
| `messages.topWords[]` | frequent words (stopwords removed) | commit subjects |
| `messages.counters` | counts of `fix/oops/revert/wtf/hack/todo/wip` | commit subjects |
| `messages.emojiCount` | emoji in commit subjects | commit subjects |
| `messages.avgLength` / `longest` / `shortest` | subject length stats | commit subjects |
| `firstCommit` / `lastCommit` | `{iso, subject, hash}` | window bounds |

Languages are mapped from file extension in `extract-git-stats.mjs` (`LANG`
table) — extend it there for more languages.

## GitHub mode (`extract-github-stats.mjs`)

Uses `gh api graphql` on `contributionsCollection`. Account-wide, but the API
exposes less than local git:

| Available | Not available (auto-hidden scenes) |
|---|---|
| commits, active days, streak | per-hour rhythm (`byHour` is zeros) |
| weekday + monthly rhythm | line churn (`linesAdded/Deleted` = 0) |
| languages across all repos | commit-message vibes |
| | per-file `topFiles` |

When a metric is absent, the corresponding scene auto-hides and the share card
swaps in a meaningful alternative (e.g. "power day" instead of "peak hour",
"commits / active day" instead of "lines added").

## After extraction

Always run `compute-persona.mjs` next — it adds the `derived` block (percentages,
labels) and the `persona` block that the template and share card rely on.
