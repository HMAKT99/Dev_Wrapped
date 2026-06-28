# Persona archetypes

The persona is the viral hook — "you're a Night Owl" is what people screenshot.
`compute-persona.mjs` scores every archetype against the stats and picks the
highest; the runner-up is also stored. Each archetype has a `score(signals)`
function (highest wins), so tuning is just editing those.

Signals available to scoring (see `compute-persona.mjs`):
`lateNightShare, earlyShare, weekendShare, deleteRatio, longestStreak,
commitsPerActiveDay, langCount, topLang, topLangShare, avgMsgLen, fixShare`.

| Persona | Emoji | Fires when… |
|---|---|---|
| The Night Owl | 🦉 | high share of commits 10pm–4am |
| The Early Bird | 🌅 | high share of commits before 9am |
| The Weekend Warrior | ⚔️ | high share of commits on Sat/Sun |
| The Refactorer | 🧹 | deletions ≥ ~45% of lines touched |
| The Streaker | 🔥 | long longest-streak (≈14+ days saturates) |
| The Machine | 🤖 | many commits per active day |
| The Polyglot | 🐙 | 5+ languages used |
| The Specialist | 🎯 | one language is 70%+ of code |
| The Novelist | 📖 | long average commit-message length |
| The Ship-It Gremlin | 👹 | very short messages or lots of "fix" |

## Adding a persona

Append an object to the `PERSONAS` array in `scripts/compute-persona.mjs`:

```js
{
  id: "the-archivist",
  title: "The Archivist",
  emoji: "🗄️",
  tagline: "Every change, documented.",
  score: (s) => (s.avgMsgLen > 70 ? 1 : 0),
  evidence: (s) => `Your commit messages averaged ${s.avgMsgLen} characters.`,
}
```

If you need a signal that doesn't exist yet, compute it in the `signals` object
in the same file (it's derived from `stats.json`). Keep scores roughly in the
0–1.6 range so multipliers stay comparable across archetypes.
