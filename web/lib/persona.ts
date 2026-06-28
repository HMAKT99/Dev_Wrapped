// persona.ts — derive headline metrics + a persona archetype (with rarity).
// Ported (logic-wise) from scripts/compute-persona.mjs.
// KEEP IN SYNC with that file — the persona table is the product's key asset.

import type { Stats, Derived, Persona, Rarity } from "./types";

interface Signals {
  lateNightShare: number;
  earlyShare: number;
  weekendShare: number;
  deleteRatio: number;
  linesDeleted: number;
  longestStreak: number;
  activeDays: number;
  commitsPerActiveDay: number;
  langCount: number;
  topLang: string | null;
  topLangShare: number;
  avgMsgLen: number;
  fixShare: number;
  fixCount: number;
  hourSpread: number; // distinct hours with commits (0..24)
}

const pct = (n: number) => Math.round(n * 100);
const hour12 = (h: number) => {
  const ampm = h < 12 ? "am" : "pm";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${ampm}`;
};

interface Archetype {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  rarity: Rarity;
  score: (s: Signals) => number;
  evidence: (s: Signals) => string;
}

// Order matters only for tie-breaks. Higher score wins; rare/legendary archetypes
// use larger multipliers so they outrank commons WHEN their condition is truly met.
const PERSONAS: Archetype[] = [
  // ---------- legendary ----------
  {
    id: "centurion", title: "The Centurion", emoji: "🏛️", rarity: "legendary",
    tagline: "100 days without missing. Iron discipline.",
    score: (s) => (s.longestStreak >= 100 ? 3 + s.longestStreak / 365 : 0),
    evidence: (s) => `An unbroken ${s.longestStreak}-day streak. Almost nobody does this.`,
  },
  {
    id: "ten-xer", title: "The 10×", emoji: "⚡", rarity: "legendary",
    tagline: "Output that doesn't look real.",
    score: (s) => (s.commitsPerActiveDay >= 15 ? 2.8 + s.commitsPerActiveDay / 50 : 0),
    evidence: (s) => `${s.commitsPerActiveDay.toFixed(1)} commits on every active day. A machine among machines.`,
  },
  {
    id: "phantom", title: "The Phantom", emoji: "👻", rarity: "legendary",
    tagline: "There is no hour you don't code.",
    score: (s) => (s.hourSpread >= 20 ? 2.6 + s.hourSpread / 100 : 0),
    evidence: (s) => `You committed in ${s.hourSpread} different hours of the day. Do you sleep?`,
  },
  // ---------- rare ----------
  {
    id: "marathoner", title: "The Marathoner", emoji: "🏃", rarity: "rare",
    tagline: "You showed up almost every single day.",
    score: (s) => (s.activeDays >= 250 ? 1.7 + s.activeDays / 365 : 0),
    evidence: (s) => `${s.activeDays} active days this year. Relentless.`,
  },
  {
    id: "polymath", title: "The Polymath", emoji: "🧠", rarity: "rare",
    tagline: "You speak in many tongues.",
    score: (s) => (s.langCount >= 8 ? 1.6 + s.langCount / 20 : 0),
    evidence: (s) => `You shipped in ${s.langCount} different languages.`,
  },
  {
    id: "refactorer", title: "The Refactorer", emoji: "🧹", rarity: "rare",
    tagline: "You delete more than you add — and that's a flex.",
    score: (s) => (s.deleteRatio > 0.45 ? s.deleteRatio * 1.3 : 0),
    evidence: (s) => `You removed ${s.linesDeleted.toLocaleString()} lines — ${pct(s.deleteRatio)}% of all the lines you touched.`,
  },
  {
    id: "machine", title: "The Machine", emoji: "🤖", rarity: "rare",
    tagline: "Sheer, relentless output.",
    score: (s) => Math.min(s.commitsPerActiveDay / 8, 1) * 1.15,
    evidence: (s) => `You averaged ${s.commitsPerActiveDay.toFixed(1)} commits on every day you showed up.`,
  },
  {
    id: "novelist", title: "The Novelist", emoji: "📖", rarity: "rare",
    tagline: "Your commit messages tell a story.",
    score: (s) => (s.avgMsgLen > 55 ? Math.min(s.avgMsgLen / 90, 1) * 1.1 : 0),
    evidence: (s) => `Your commit messages averaged ${s.avgMsgLen} characters.`,
  },
  // ---------- common ----------
  {
    id: "night-owl", title: "The Night Owl", emoji: "🦉", rarity: "common",
    tagline: "Your best code happens after dark.",
    score: (s) => s.lateNightShare * 1.4,
    evidence: (s) => `${pct(s.lateNightShare)}% of your commits landed between 10pm and 4am.`,
  },
  {
    id: "early-bird", title: "The Early Bird", emoji: "🌅", rarity: "common",
    tagline: "First to the keyboard, every day.",
    score: (s) => s.earlyShare * 1.5,
    evidence: (s) => `${pct(s.earlyShare)}% of your commits happened before 9am.`,
  },
  {
    id: "weekend-warrior", title: "The Weekend Warrior", emoji: "⚔️", rarity: "common",
    tagline: "Weekends are just extra build time.",
    score: (s) => s.weekendShare * 1.6,
    evidence: (s) => `${pct(s.weekendShare)}% of your commits came on Saturdays and Sundays.`,
  },
  {
    id: "streaker", title: "The Streaker", emoji: "🔥", rarity: "common",
    tagline: "Consistency is your superpower.",
    score: (s) => Math.min(s.longestStreak / 14, 1) * 1.2,
    evidence: (s) => `Your longest streak ran ${s.longestStreak} days straight.`,
  },
  {
    id: "specialist", title: "The Specialist", emoji: "🎯", rarity: "common",
    tagline: "One language. Total mastery.",
    score: (s) => (s.topLangShare > 0.7 && s.topLang ? s.topLangShare : 0),
    evidence: (s) => `${pct(s.topLangShare)}% of your code was ${s.topLang}.`,
  },
  {
    id: "gremlin", title: "The Ship-It Gremlin", emoji: "👹", rarity: "common",
    tagline: '"fix", "fix again", "actually fix it" — and ship.',
    score: (s) => (s.avgMsgLen < 22 || s.fixShare > 0.25 ? 0.9 + s.fixShare : 0),
    evidence: (s) => `${s.fixCount} of your commits were just patching things up. Short messages, fast ships.`,
  },
];

export function computePersona(s: Stats): Stats {
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

  const signals: Signals = {
    lateNightShare: lateNight,
    earlyShare: early,
    weekendShare: weekend,
    deleteRatio,
    linesDeleted: s.totals.linesDeleted,
    longestStreak: s.totals.longestStreak,
    activeDays: s.totals.activeDays,
    commitsPerActiveDay: total / (s.totals.activeDays || 1),
    langCount: s.topLanguages.length,
    topLang,
    topLangShare,
    avgMsgLen: s.messages.avgLength || 0,
    fixShare: fixCount / total,
    fixCount,
    hourSpread: byHour.filter((x) => x > 0).length,
  };

  const ranked = PERSONAS.map((p) => ({ p, v: p.score(signals) })).sort(
    (a, b) => b.v - a.v
  );
  const winner = ranked[0].p;
  const runnerUp = ranked[1].p;

  const derived: Derived = {
    lateNightShare: pct(lateNight),
    earlyShare: pct(early),
    weekendShare: pct(weekend),
    deleteRatio: pct(deleteRatio),
    commitsPerActiveDay: Number(signals.commitsPerActiveDay.toFixed(1)),
    busiestHourLabel: byHour.some((x) => x) ? hour12(s.time.busiestHour) : "—",
    topLang,
    topLangShare: pct(topLangShare),
  };

  const persona: Persona = {
    id: winner.id,
    title: winner.title,
    emoji: winner.emoji,
    tagline: winner.tagline,
    evidence: winner.evidence(signals),
    rarity: winner.rarity,
    runnerUp: { id: runnerUp.id, title: runnerUp.title, emoji: runnerUp.emoji },
  };

  return { ...s, derived, persona };
}
