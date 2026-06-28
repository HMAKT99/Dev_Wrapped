// personaStats.ts — "live rarity odds": a running tally of how often each persona
// has been generated, so we can show "only X% of devs are The Phantom".
//
// Backed by Upstash Redis via REST (set UPSTASH_REDIS_REST_URL +
// UPSTASH_REDIS_REST_TOKEN). With no Upstash configured the feature is a no-op:
// recording does nothing and odds are null (the UI just hides the line).

const MIN_TOTAL = 25; // don't show odds until there's enough signal

export interface Odds {
  count: number;
  total: number;
  sharePct: number; // % of all wraps that got this persona
}

function creds(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // Optional offline mock for local verification.
  if (!url || !token) return null;
  return { url, token };
}

async function pipeline(cmds: (string | number)[][]): Promise<any[] | null> {
  const c = creds();
  if (!c) return null;
  try {
    const res = await fetch(`${c.url}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${c.token}`, "content-type": "application/json" },
      body: JSON.stringify(cmds),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function toOdds(count: number, total: number): Odds | null {
  if (!total || total < MIN_TOTAL) return null;
  const sharePct = Math.max(0.1, Math.round((count / total) * 1000) / 10);
  return { count, total, sharePct };
}

// Increment this persona + the global total, and return the resulting odds.
export async function recordAndOdds(id: string): Promise<Odds | null> {
  if (process.env.RARITY_DEV_MOCK === "1") return { count: 23, total: 1000, sharePct: 2.3 };
  const data = await pipeline([
    ["INCR", `pp:${id}`],
    ["INCR", "pp:__total"],
  ]);
  if (!data) return null;
  return toOdds(Number(data[0]?.result ?? 0), Number(data[1]?.result ?? 0));
}

// Read-only odds (used by image routes so they don't double-count).
export async function readOdds(id: string): Promise<Odds | null> {
  if (process.env.RARITY_DEV_MOCK === "1") return { count: 23, total: 1000, sharePct: 2.3 };
  const data = await pipeline([
    ["GET", `pp:${id}`],
    ["GET", "pp:__total"],
  ]);
  if (!data) return null;
  return toOdds(Number(data[0]?.result ?? 0), Number(data[1]?.result ?? 0));
}
