// stats.ts — fetch + enrich (persona) in one call, validated.
import { fetchGithubStats, type FetchOpts } from "./github";
import { computePersona } from "./persona";
import { NotFoundError, type Stats } from "./types";

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function validUsername(u: string): boolean {
  return USERNAME_RE.test(u);
}

export async function getWrappedStats(
  user: string,
  opts: FetchOpts = {}
): Promise<Stats> {
  if (!validUsername(user)) throw new NotFoundError("Invalid username");
  const raw = await fetchGithubStats(user, opts);
  return computePersona(raw);
}

export { NotFoundError };
