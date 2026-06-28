// middleware.ts — per-IP rate limiting on the expensive API routes.
//
// Works out of the box with an in-memory limiter (per edge instance — blunts
// bursts; combined with the 6h response cache this protects the GitHub token).
// For durable, multi-instance limiting set UPSTASH_REDIS_REST_URL +
// UPSTASH_REDIS_REST_TOKEN (used via REST — no extra npm dependency).

import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/api/og/:path*", "/api/card/:path*", "/api/wrapped/:path*"],
};

const WINDOW = 60; // seconds
const LIMIT = 30; // requests per window per IP

const hits = new Map<string, { count: number; reset: number }>();

function memIncr(key: string, resetAt: number): number {
  const e = hits.get(key);
  if (e) {
    e.count++;
    return e.count;
  }
  hits.set(key, { count: 1, reset: resetAt });
  if (hits.size > 10000) {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }
  return 1;
}

async function upstashIncr(key: string): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(WINDOW), "NX"],
      ]),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Number(data?.[0]?.result ?? 0) || null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.ip ||
    "unknown";
  const bucket = Math.floor(Date.now() / (WINDOW * 1000));
  const key = `rl:${ip}:${bucket}`;

  let count = await upstashIncr(key);
  if (count === null) count = memIncr(key, (bucket + 1) * WINDOW * 1000);

  if (count > LIMIT) {
    return new NextResponse(
      JSON.stringify({ error: "Rate limit exceeded — slow down a moment." }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": String(WINDOW),
        },
      }
    );
  }
  return NextResponse.next();
}
