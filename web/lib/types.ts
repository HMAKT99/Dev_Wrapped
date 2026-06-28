// Shared shape of the stats object the renderer + persona engine consume.
// Mirrors the JSON produced by the CLI (scripts/extract-*.mjs).

export interface Stats {
  schema: string;
  repo: string;
  source?: string;
  window: { since: string; until?: string | null; label?: string };
  authorMode?: string;
  totals: {
    commits: number;
    activeDays: number;
    longestStreak: number;
    linesAdded: number;
    linesDeleted: number;
    net: number;
  };
  time: {
    byHour: number[];
    byWeekday: number[];
    byMonth: Record<string, number>;
    busiestHour: number;
    busiestWeekday: number;
    busiestWeekdayName: string;
  };
  topLanguages: { name: string; lines: number; files: number }[];
  topFiles: { file: string; commits: number }[];
  topContributors?: { login: string; commits: number }[];
  repoMeta?: { stars: number; forks: number; contributors: number };
  messages: {
    topWords: { word: string; n: number }[];
    emojiCount: number;
    counters: Record<string, number>;
    avgLength: number;
    longest: string | null;
    shortest: string | null;
  };
  firstCommit: { iso: string; subject: string; hash: string } | null;
  lastCommit: { iso: string; subject: string; hash: string } | null;
  // added by computePersona:
  derived?: Derived;
  persona?: Persona;
  // added by the build step:
  credit?: string;
}

export interface Derived {
  lateNightShare: number;
  earlyShare: number;
  weekendShare: number;
  deleteRatio: number;
  commitsPerActiveDay: number;
  busiestHourLabel: string;
  topLang: string | null;
  topLangShare: number;
}

export type Rarity = "common" | "rare" | "legendary";

export interface Persona {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  evidence: string;
  rarity: Rarity;
  odds?: { count: number; total: number; sharePct: number };
  runnerUp: { id: string; title: string; emoji: string };
}

export class NotFoundError extends Error {}
