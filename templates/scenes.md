# Scene catalog

Scenes live in `base.html` as `add(() => { ... return {node, animate} })` blocks
and play in order. Each fills the viewport; the controller adds `.active` and
calls `animate()` on enter. Scenes with no data auto-hide (guarded by an `if`).

| # | Scene | Shows | Auto-hides when |
|---|---|---|---|
| 1 | Intro | repo name + "Your YEAR in code" | never |
| 2 | Commits | count-up of total commits + active days | never |
| 3 | Streak | longest streak count-up | never |
| 4 | Busiest hour | peak-hour label + 24-bar heatmap | `byHour` all zero (GitHub mode) |
| 5 | Power day | busiest weekday + 7-bar chart | `byWeekday` all zero |
| 6 | Lines | +added / −deleted count-ups | both zero (GitHub mode) |
| 7 | Languages | horizontal bars, top 6 | no languages |
| 8 | Top files | most-changed files list | no files (GitHub mode) |
| 9 | Message vibes | "fix" count + word cloud + emoji | no `topWords` (GitHub mode) |
| 10 | Persona reveal | big emoji + title + tagline + evidence | never |
| 11 | Flex card | stat grid + persona + credit (screenshot target) | never |

## Conventions

- Build DOM with the `el(tag, class, html)` helper; return `{node, animate?}`.
- Charts are hand-rolled (`.bars` / `.hbars`) — **no chart libraries**, to keep
  the file self-contained.
- All colors come from CSS custom properties (`--bg`, `--accent`, …) so themes
  restyle everything for free. Don't hard-code colors in a scene.
- `animate()` runs on scene entry — use it for count-ups and bar fills.

## Export hooks

`?export=story|og&scene=card` switches `body` to a fixed-size frame and shows
only the flex card (`#card-scene`) for screenshotting. Story-size overrides
(larger card) live in the `body.export.story` CSS block.
