// stats.ts — fetch + enrich (persona) in one call, validated.
import { fetchGithubStats, type FetchOpts } from "./github";
import { fetchRepoStats, type RepoFetchOpts } from "./githubRepo";
import { computePersona } from "./persona";
import { NotFoundError, type Stats } from "./types";

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const REPONAME_RE = /^[a-zA-Z0-9._-]{1,100}$/;

export function validUsername(u: string): boolean {
  return USERNAME_RE.test(u);
}
export function validRepoName(n: string): boolean {
  return REPONAME_RE.test(n);
}

export async function getWrappedStats(
  user: string,
  opts: FetchOpts = {}
): Promise<Stats> {
  if (!validUsername(user)) throw new NotFoundError("Invalid username");
  const raw = await fetchGithubStats(user, opts);
  return computePersona(raw);
}

export async function getWrappedRepoStats(
  owner: string,
  name: string,
  opts: RepoFetchOpts = {}
): Promise<Stats> {
  if (!validUsername(owner) || !validRepoName(name))
    throw new NotFoundError("Invalid owner/repo");
  const raw = await fetchRepoStats(owner, name, opts);
  return computePersona(raw);
}

export { NotFoundError };
