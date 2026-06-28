# Dev Wrapped — GitHub Action

Keep a fresh **Dev Wrapped** card in any repo's README on autopilot. The Action
downloads your card as a committed PNG (always renders, even where external
images are blocked) and keeps it inside marker comments in your README.

## Quick start

1. Add the markers anywhere in your `README.md`:

   ```md
   <!-- DEV-WRAPPED:START -->
   <!-- DEV-WRAPPED:END -->
   ```

   (Optional — if absent, a "My Dev Wrapped" section is appended.)

2. Copy [`example-workflow.yml`](./example-workflow.yml) to
   `.github/workflows/dev-wrapped.yml`. That's it — it runs weekly and on manual
   dispatch.

## Usage

```yaml
- uses: actions/checkout@v4
- uses: HMAKT99/Dev_Wrapped/action@main
  with:
    username: ${{ github.repository_owner }}   # who to wrap
    theme: midnight                            # midnight|synthwave|terminal|editorial|bubblegum|sunset
    # window: "2025"                           # a year, or omit for last 12 months
    # output: .github/dev-wrapped.png          # where to write the PNG
    # readme: README.md                        # set "" to skip README editing
    # commit: "true"
```

The job needs `permissions: contents: write` to commit the refreshed card.

## Inputs

| Input | Default | Notes |
|---|---|---|
| `username` | repo owner | GitHub login to wrap |
| `theme` | `midnight` | one of the six themes |
| `window` | last 12 months | e.g. `2025` |
| `service-url` | the hosted Dev Wrapped | self-host? point this at your instance |
| `output` | `.github/dev-wrapped.png` | committed PNG path |
| `readme` | `README.md` | `""` to skip README edits |
| `commit` | `true` | commit + push changes |

## Prefer a live image instead?

If you don't want a committed PNG, skip the Action and just embed the
always-fresh card directly:

```md
[![Dev Wrapped](https://dev-wrapped-eight.vercel.app/api/card/USERNAME?theme=midnight)](https://dev-wrapped-eight.vercel.app/u/USERNAME)
```
