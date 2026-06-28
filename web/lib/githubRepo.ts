// githubRepo.ts — repository-level stats via GitHub GraphQL (fetch-based).
// Richer than user mode: commit times give busiest hour, and the commit diffs
// give real lines added/deleted plus a top-contributors list.

import { NotFoundError, type Stats } from "./types";

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const QUERY = `
query($owner:String!, $name:String!, $since:GitTimestamp!, $until:GitTimestamp!, $cursor:String){
  repository(owner:$owner, name:$name){
    nameWithOwner
    stargazerCount
    forkCount
    languages(first:8, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name } } }
    defaultBranchRef{
      target{
        ... on Commit {
          history(since:$since, until:$until, first:100, after:$cursor){
            totalCount
            pageInfo{ hasNextPage endCursor }
            nodes{
              committedDate
              additions
              deletions
              author{ user{ login } name }
            }
          }
        }
      }
    }
  }
}`;

export interface RepoFetchOpts {
  since?: string;
  until?: string;
  year?: number;
  /** max commits to scan for distributions (default 600) */
  maxCommits?: number;
}

export async function fetchRepoStats(
  owner: string,
  name: string,
  opts: RepoFetchOpts = {}
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

  const maxCommits = opts.maxCommits ?? 600;

  const byHour = new Array(24).fill(0);
  const byWeekday = new Array(7).fill(0);
  const byMonth: Record<string, number> = {};
  const days = new Set<string>();
  const contrib: Record<string, number> = {};
  let linesAdded = 0;
  let linesDeleted = 0;
  let scanned = 0;
  let totalCount = 0;
  let stars = 0;
  let forks = 0;
  let repoName = `${owner}/${name}`;
  const langSize: Record<string, number> = {};

  let cursor: string | null = null;
  let firstPage = true;

  while (scanned < maxCommits) {
    const res: Response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { authorization: `bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        query: QUERY,
        variables: { owner, name, since: from, until: to, cursor },
      }),
      next: { revalidate: 21600 },
    });
    if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
    const json: any = await res.json();
    if (json.errors?.length) {
      if (json.errors.some((e: any) => e.type === "NOT_FOUND"))
        throw new NotFoundError(`No repo "${owner}/${name}"`);
      throw new Error(json.errors.map((e: any) => e.message).join("; "));
    }
    const repo = json.data?.repository;
    if (!repo) throw new NotFoundError(`No repo "${owner}/${name}"`);

    if (firstPage) {
      repoName = repo.nameWithOwner;
      stars = repo.stargazerCount;
      forks = repo.forkCount;
      for (const e of repo.languages.edges) {
        langSize[e.node.name] = (langSize[e.node.name] || 0) + e.size;
      }
      firstPage = false;
    }

    const history = repo.defaultBranchRef?.target?.history;
    if (!history) break; // empty repo
    totalCount = history.totalCount;

    for (const node of history.nodes) {
      scanned++;
      const iso: string = node.committedDate;
      byHour[parseInt(iso.slice(11, 13), 10) || 0]++;
      const ymd = iso.slice(0, 10);
      days.add(ymd);
      byMonth[iso.slice(0, 7)] = (byMonth[iso.slice(0, 7)] || 0) + 1;
      byWeekday[new Date(ymd + "T00:00:00Z").getUTCDay()]++;
      linesAdded += node.additions || 0;
      linesDeleted += node.deletions || 0;
      const who = node.author?.user?.login || node.author?.name;
      if (who) contrib[who] = (contrib[who] || 0) + 1;
    }

    if (!history.pageInfo.hasNextPage || scanned >= maxCommits) break;
    cursor = history.pageInfo.endCursor;
  }

  if (totalCount === 0 && scanned === 0) {
    throw new NotFoundError(`No commits in "${owner}/${name}" for this window`);
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

  const topLanguages = Object.entries(langSize)
    .map(([n, size]) => ({ name: n, lines: size as number, files: 0 }))
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 8);

  const topContributors = Object.entries(contrib)
    .map(([login, commits]) => ({ login, commits }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 6);

  const busiestHour = byHour.indexOf(Math.max(...byHour));
  const busiestWeekday = byWeekday.indexOf(Math.max(...byWeekday));

  return {
    schema: "dev-wrapped/1",
    repo: repoName,
    source: "repo",
    window: { since: from, until: to },
    authorMode: `repo:${repoName}`,
    totals: {
      commits: totalCount || scanned,
      activeDays: days.size,
      longestStreak,
      linesAdded,
      linesDeleted,
      net: linesAdded - linesDeleted,
    },
    time: {
      byHour,
      byWeekday,
      byMonth,
      busiestHour,
      busiestWeekday,
      busiestWeekdayName: WEEKDAYS[busiestWeekday] || "—",
    },
    topLanguages,
    topFiles: [],
    topContributors,
    repoMeta: { stars, forks, contributors: Object.keys(contrib).length },
    messages: { topWords: [], emojiCount: 0, counters: {}, avgLength: 0, longest: null, shortest: null },
    firstCommit: null,
    lastCommit: null,
  };
}
