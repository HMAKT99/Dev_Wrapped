# Themes

A theme is just a CSS file that sets custom properties (and optionally a few
overrides). The builder splices the chosen one into `base.html`.

| Theme | Vibe |
|---|---|
| `midnight` | Deep indigo dark mode, violet→cyan. The safe default. |
| `synthwave` | Retro neon, magenta→cyan over an indigo gradient. Loud. |
| `terminal` | Phosphor green on black, monospace. For hackers. |
| `editorial` | Cream paper, serif ink, crimson accent. Tasteful. |
| `bubblegum` | Bright Y2K candy, hot pink + sky blue. Playful. |
| `sunset` | Warm amber→coral gradient, cream ink. Cozy. |

## Show, don't tell (the picking step)

Don't ask the user to describe their taste. Generate previews and let them point:

```bash
for t in midnight synthwave editorial bubblegum; do
  node scripts/build-wrapped.mjs --stats stats.json --theme "$t" --out "preview-$t.html"
  node scripts/export-png.mjs --html "preview-$t.html" --formats og   # needs Playwright
  mv dev-wrapped-og.png "preview-$t.png"
done
```

Show the four `preview-*.png` cards, let the user pick, then build the final
`wrapped.html` with the winning theme. (No Playwright? Just open the
`preview-*.html` files in a browser instead.)

## Variables a theme sets

```css
:root{
  --bg:    /* page background (a color OR a gradient) */;
  --bg2:   /* card / surface background */;
  --fg:    /* primary text */;
  --muted: /* secondary text */;
  --accent: ;  --accent2: ;   /* gradient endpoints for big numbers + bars */
  --display: /* headline font stack */;
  --body:    /* body font stack */;
  --grain:   /* 0–1 vignette strength */;
}
```

Use **system / web-safe font stacks only** — no `@import` or Google Fonts — so the
output stays a single offline file. A theme may add a few extra rules (see
`editorial.css` / `sunset.css`) but keep them minimal.

## Add a theme

1. Create `themes/<name>.css` with the variables above.
2. Add a row to the table here.
3. Build with `--theme <name>`. No code changes needed.
