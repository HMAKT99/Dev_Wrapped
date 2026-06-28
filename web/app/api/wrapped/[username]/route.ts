import { NextResponse } from "next/server";
import { getWrappedStats, NotFoundError } from "@/lib/stats";
import { buildWrappedHtml } from "@/lib/build";
import { resolveTheme, themeCss } from "@/lib/themes";
import { windowOpts } from "@/lib/window";

export const runtime = "nodejs";
export const revalidate = 21600; // 6h

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const url = new URL(req.url);
  const theme = resolveTheme(url.searchParams.get("theme"));
  const { opts, label } = windowOpts(url.searchParams.get("window"));
  const user = params.username;

  try {
    const stats = await getWrappedStats(user, opts);
    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ||
      url.host;
    const html = buildWrappedHtml(stats, themeCss(theme), {
      credit: `${site}/${user}`,
      label,
    });
    return new NextResponse(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const code = e instanceof NotFoundError ? 404 : 502;
    return new NextResponse(
      `<!doctype html><meta charset=utf-8><body style="font-family:system-ui;background:#0b0b12;color:#f5f5fa;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><h1>${
        code === 404 ? "No such GitHub user" : "Couldn't load that wrapped"
      }</h1><p style="opacity:.6">${String((e as Error).message)}</p></div>`,
      { status: code, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }
}
