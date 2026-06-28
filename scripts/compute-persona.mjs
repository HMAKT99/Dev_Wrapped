#!/usr/bin/env node
// compute-persona.mjs — derive headline metrics + a persona archetype from
// a stats.json produced by extract-git-stats.mjs (or extract-github-stats.mjs).
//
// Usage: node compute-persona.mjs [statsFile] [--out FILE]
// Defaults: reads ./dev-wrapped-stats.json, writes the enriched object back
// in place (adds `derived` and `persona`). Prints a one-line summary.

import { readFileSync, writeFileSync } from "node:fs";

function parseArgs(argv) {
  const args = {};
  const rest = [];
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--out") args.out = argv[++i];
    else rest.push(argv[i]);
  }
  args.in = rest[0] || "dev-wrapped-stats.json";
  return args;
}

function pct(n) {
  return Math.round(n * 100);
}

function hour12(h) {
  const ampm = h < 12 ? "am" : "pm";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${ampm}`;
}

// Persona definitions. Each `score` returns a 0..1-ish strength given signals.
// Highest score wins; ties broken by definition order.
const PERSONAS = [
  {
    id: "night-owl",
    title: "The Night Owl",
    emoji: "🦉",
    tagline: "Your best code happens after dark.",
    score: (s) => s.lateNightShare * 1.4,
    evidence: (s) => `${pct(s.lateNightShare)}% of your commits landed between 10pm and 4am.`,
  },
  {
    id: "early-bird",
    title: "The Early Bird",
    emoji: "🌅",
    tagline: "First to the keyboard, every day.",
    score: (s) => s.earlyShare * 1.5,
    evidence: (s) => `${pct(s.earlyShare)}% of your commits happened before 9am.`,
  },
  {
    id: "weekend-warrior",
    title: "The Weekend Warrior",
    emoji: "⚔️",
    tagline: "Weekends are just extra build time.",
    score: (s) => s.weekendShare * 1.6,
    evidence: (s) => `${pct(s.weekendShare)}% of your commits came on Saturdays and Sundays.`,
  },
  {
    id: "refactorer",
    title: "The Refactorer",
    emoji: "🧹",
    tagline: "You delete more than you add — and that's a flex.",
    score: (s) => (s.deleteRatio > 0.45 ? s.deleteRatio * 1.3 : 0),
    evidence: (s) =>
      `You removed ${s.linesDeleted.toLocaleString()} lines — ${pct(s.deleteRatio)}% of all the lines you touched.`,
  },
  {
    id: "streaker",
    title: "The Streaker",
    emoji: "🔥",
    tagline: "Consistency is your superpower.",
    score: (s) => Math.min(s.longestStreak / 14, 1) * 1.2,
    evidence: (s) => `Your longest streak ran ${s.longestStreak} days straight.`,
  },
  {
    id: "machine",
    title: "The Machine",
    emoji: "🤖",
    tagline: "Sheer, relentless output.",
    score: (s) => Math.min(s.commitsPerActiveDay / 8, 1) * 1.1,
    evidence: (s) =>
      `You averaged ${s.commitsPerActiveDay.toFixed(1)} commits on every day you showed up.`,
  },
  {
    id: "polyglot",
    title: "The Polyglot",
    emoji: "🐙",
    tagline: "You don't pick favorites — you ship in everything.",
    score: (s) => (s.langCount >= 5 ? Math.min(s.langCount / 8, 1) * 1.1 : 0),
    evidence: (s) => `You wrote across ${s.langCount} different languages this year.`,
  },
  {
    id: "specialist",
    title: "The Specialist",
    emoji: "🎯",
    tagline: "One language. Total mastery.",
    score: (s) => (s.topLangShare > 0.7 && s.topLang ? s.topLangShare : 0),
    evidence: (s) => `${pct(s.topLangShare)}% of your code was ${s.topLang}.`,
  },
  {
    id: "novelist",
    title: "The Novelist",
    emoji: "📖",
    tagline: "Your commit messages tell a story.",
    score: (s) => (s.avgMsgLen > 55 ? Math.min(s.avgMsgLen / 90, 1) * 1.1 : 0),
    evidence: (s) => `Your commit messages averaged ${s.avgMsgLen} characters.`,
  },
  {
    id: "gremlin",
    title: "The Ship-It Gremlin",
    emoji: "👹",
    tagline: '"fix", "fix again", "actually fix it" — and ship.',
    score: (s) =>
      (s.avgMsgLen < 22 || s.fixShare > 0.25 ? 0.9 + s.fixShare : 0),
    evidence: (s) =>
      `${s.fixCount} of your commits were just patching things up. Short messages, fast ships.`,
  },
];

function main() {
  const args = parseArgs(process.argv);
  const s = JSON.parse(readFileSync(args.in, "utf8"));

  const total = s.totals.commits || 1;
  const byHour = s.time.byHour;
  const lateNight =
    (byHour[22] + byHour[23] + byHour[0] + byHour[1] + byHour[2] + byHour[3]) / total;
  const early = (byHour[5] + byHour[6] + byHour[7] + byHour[8]) / total;
  const weekend = (s.time.byWeekday[0] + s.time.byWeekday[6]) / total;
  const touched = s.totals.linesAdded + s.totals.linesDeleted || 1;
  const deleteRatio = s.totals.linesDeleted / touched;
  const langLinesTotal = s.topLanguages.reduce((a, l) => a + l.lines, 0) || 1;
  const topLang = s.topLanguages[0]?.name || null;
  const topLangShare = (s.topLanguages[0]?.lines || 0) / langLinesTotal;
  const fixCount = s.messages.counters.fix || 0;

  const signals = {
    lateNightShare: lateNight,
    earlyShare: early,
    weekendShare: weekend,
    deleteRatio,
    linesDeleted: s.totals.linesDeleted,
    longestStreak: s.totals.longestStreak,
    commitsPerActiveDay: total / (s.totals.activeDays || 1),
    langCount: s.topLanguages.length,
    topLang,
    topLangShare,
    avgMsgLen: s.messages.avgLength || 0,
    fixShare: fixCount / total,
    fixCount,
  };

  const ranked = PERSONAS.map((p) => ({ p, v: p.score(signals) })).sort(
    (a, b) => b.v - a.v
  );
  const winner = ranked[0].p;
  const runnerUp = ranked[1].p;

  s.derived = {
    lateNightShare: pct(lateNight),
    earlyShare: pct(early),
    weekendShare: pct(weekend),
    deleteRatio: pct(deleteRatio),
    commitsPerActiveDay: Number(signals.commitsPerActiveDay.toFixed(1)),
    busiestHourLabel: byHour.some((x) => x) ? hour12(s.time.busiestHour) : "—",
    topLang,
    topLangShare: pct(topLangShare),
  };

  s.persona = {
    id: winner.id,
    title: winner.title,
    emoji: winner.emoji,
    tagline: winner.tagline,
    evidence: winner.evidence(signals),
    runnerUp: { id: runnerUp.id, title: runnerUp.title, emoji: runnerUp.emoji },
  };

  const out = args.out || args.in;
  writeFileSync(out, JSON.stringify(s, null, 2));
  console.log(`${winner.emoji}  ${winner.title} — ${winner.evidence(signals)}`);
}

main();
