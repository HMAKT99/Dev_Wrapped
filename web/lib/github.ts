// github.ts — account-wide stats via the GitHub GraphQL API (fetch-based).
// Ported from scripts/extract-github-stats.mjs (same query + parsing), but uses
// fetch + a server token instead of the `gh` CLI so it runs on Vercel.

import { NotFoundError, type Stats } from "./types";

const QUERY = `
query($login:String!, $from:DateTime!, $to:DateTime!){
  user(login:$login){
    contributionsCollection(from:$from, to:$to){
      totalCommitContributions
      contributionCalendar{
        totalContributions
        weeks{ contributionDays{ date weekday contributionCount } }
      }
      commitContributionsByRepository(maxRepositories:100){
        contributions{ totalCount }
        repository{
          nameWithOwner
          languages(first:8, orderBy:{field:SIZE, direction:DESC}){
            edges{ size node{ name } }
          }
        }
      }
    }
  }
}`;

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export interface FetchOpts {
  /** ISO start; defaults to last 365 days */
  since?: string;
  /** ISO end; defaults to now */
  until?: string;
  year?: number;
  /** seconds to cache the GitHub response (default 6h) */
  revalidate?: number;
}

export async function fetchGithubStats(
  user: string,
  opts: FetchOpts = {}
): Promise<Stats> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env var is not set");

  let from = opts.since;
  let to = opts.until;
  if (opts.year) {
    from = `${opts.year}-01-01T00:00:00Z`;
    to = `${opts.year}-12-31T23:59:59Z`;
  }
  if (!from) from = new Date(Date.now() - 365 * 864e5).toISOString();
  if (!to) to = new Date().toISOString();

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: user, from, to } }),
    next: { revalidate: opts.revalidate ?? 21600 },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    if (json.errors.some((e: any) => e.type === "NOT_FOUND")) {
      throw new NotFoundError(`No GitHub user "${user}"`);
    }
    throw new Error(json.errors.map((e: any) => e.message).join("; "));
  }
  const cc = json.data?.user?.contributionsCollection;
  if (!cc) throw new NotFoundError(`No GitHub user "${user}"`);

  const byWeekday = new Array(7).fill(0);
  const byMonth: Record<string, number> = {};
  const days = new Set<string>();
  let totalCommits = 0;

  for (const wk of cc.contributionCalendar.weeks) {
    for (const day of wk.contributionDays) {
      const c = day.contributionCount;
      if (c > 0) {
        byWeekday[day.weekday] += c;
        byMonth[day.date.slice(0, 7)] = (byMonth[day.date.slice(0, 7)] || 0) + c;
        days.add(day.date);
        totalCommits += c;
      }
    }
  }

  const sortedDays = [...days].sort();
  let longestStreak = sortedDays.length ? 1 : 0;
  let streak = longestStreak;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = Math.round(
      (+new Date(sortedDays[i] + "T00:00:00Z") -
        +new Date(sortedDays[i - 1] + "T00:00:00Z")) /
        864e5
    );
    streak = diff === 1 ? streak + 1 : 1;
    if (streak > longestStreak) longestStreak = streak;
  }

  const langSize: Record<string, number> = {};
  for (const repo of cc.commitContributionsByRepository) {
    for (const e of repo.repository.languages.edges) {
      langSize[e.node.name] = (langSize[e.node.name] || 0) + e.size;
    }
  }
  const topLanguages = Object.entries(langSize)
    .map(([name, size]) => ({ name, lines: size as number, files: 0 }))
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 8);

  const busiestWeekday = byWeekday.indexOf(Math.max(...byWeekday));

  return {
    schema: "dev-wrapped/1",
    repo: `@${user}`,
    source: "github",
    window: { since: from, until: to },
    authorMode: `github:${user}`,
    totals: {
      commits: totalCommits || cc.totalCommitContributions || 0,
      activeDays: days.size,
      longestStreak,
      linesAdded: 0,
      linesDeleted: 0,
      net: 0,
    },
    time: {
      byHour: new Array(24).fill(0),
      byWeekday,
      byMonth,
      busiestHour: 0,
      busiestWeekday,
      busiestWeekdayName: WEEKDAYS[busiestWeekday] || "—",
    },
    topLanguages,
    topFiles: [],
    messages: {
      topWords: [],
      emojiCount: 0,
      counters: {},
      avgLength: 0,
      longest: null,
      shortest: null,
    },
    firstCommit: null,
    lastCommit: null,
  };
}
