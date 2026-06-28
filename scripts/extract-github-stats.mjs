#!/usr/bin/env node
// extract-github-stats.mjs — account-wide stats via the GitHub GraphQL API.
//
// Requires the GitHub CLI, authenticated:  gh auth status
// Produces the same stats.json schema as extract-git-stats.mjs, with these
// differences (GitHub's API doesn't expose them):
//   - time.byHour is all zeros  (hour scene auto-hides)
//   - totals.linesAdded/Deleted are 0  (lines scene auto-hides)
//   - messages.* is empty  (message-vibes scene auto-hides)
//   - topFiles is empty  (per-file data isn't available account-wide)
// What it DOES give: commits, active days, streak, weekday rhythm, monthly
// rhythm, and a languages breakdown across all your repos.
//
// Usage: node extract-github-stats.mjs --user LOGIN [--year YYYY] [--out FILE]

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const n = () => argv[++i];
    if (argv[i] === "--user") a.user = n();
    else if (argv[i] === "--year") a.year = n();
    else if (argv[i] === "--since") a.since = n();
    else if (argv[i] === "--until") a.until = n();
    else if (argv[i] === "--out") a.out = n();
  }
  return a;
}

function gh(args, input) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    input,
    maxBuffer: 1024 * 1024 * 64,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

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

function main() {
  const a = parseArgs(process.argv);
  if (!a.user) {
    console.error("Usage: node extract-github-stats.mjs --user LOGIN [--year YYYY] [--out FILE]");
    process.exit(1);
  }

  // Verify gh is authed.
  try {
    gh(["auth", "status"]);
  } catch {
    console.error("GitHub CLI not authenticated. Run: gh auth login");
    process.exit(1);
  }

  let from = a.since;
  let to = a.until;
  if (a.year) {
    from = `${a.year}-01-01T00:00:00Z`;
    to = `${a.year}-12-31T23:59:59Z`;
  }
  if (!from) {
    const d = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    from = d.toISOString();
  }
  if (!to) to = new Date().toISOString();

  let raw;
  try {
    raw = gh([
      "api", "graphql",
      "-f", `query=${QUERY}`,
      "-F", `login=${a.user}`,
      "-F", `from=${from}`,
      "-F", `to=${to}`,
    ]);
  } catch (e) {
    console.error("GitHub API call failed:\n" + (e.stderr || e.message));
    process.exit(1);
  }

  const data = JSON.parse(raw).data?.user?.contributionsCollection;
  if (!data) {
    console.error(`No contribution data for user "${a.user}".`);
    process.exit(2);
  }

  const byWeekday = new Array(7).fill(0);
  const byMonth = {};
  const days = new Set();
  let totalCommits = 0;

  for (const wk of data.contributionCalendar.weeks) {
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

  // Streak across calendar days with any contribution.
  const sortedDays = [...days].sort();
  let longestStreak = sortedDays.length ? 1 : 0;
  let streak = longestStreak;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = Math.round(
      (new Date(sortedDays[i] + "T00:00:00Z") - new Date(sortedDays[i - 1] + "T00:00:00Z")) / 86400000
    );
    streak = diff === 1 ? streak + 1 : 1;
    if (streak > longestStreak) longestStreak = streak;
  }

  // Languages aggregated by byte size across repos.
  const langSize = {};
  for (const repo of data.commitContributionsByRepository) {
    for (const e of repo.repository.languages.edges) {
      langSize[e.node.name] = (langSize[e.node.name] || 0) + e.size;
    }
  }
  const topLanguages = Object.entries(langSize)
    .map(([name, size]) => ({ name, lines: size, files: 0 }))
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 8);

  const busiestWeekday = byWeekday.indexOf(Math.max(...byWeekday));

  const stats = {
    schema: "dev-wrapped/1",
    repo: `@${a.user}`,
    source: "github",
    window: { since: from, until: to },
    authorMode: `github:${a.user}`,
    totals: {
      commits: totalCommits || data.totalCommitContributions || 0,
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
      busiestWeekdayName: [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday",
      ][busiestWeekday],
    },
    topLanguages,
    topFiles: [],
    messages: { topWords: [], emojiCount: 0, counters: {}, avgLength: 0, longest: null, shortest: null },
    firstCommit: null,
    lastCommit: null,
  };

  const out = a.out || path.join(process.cwd(), "dev-wrapped-stats.json");
  writeFileSync(out, JSON.stringify(stats, null, 2));
  console.log(out);
}

main();
