// Repo README embed card.
import { ImageResponse } from "next/og";
import { getWrappedRepoStats, NotFoundError } from "@/lib/stats";
import { resolveTheme } from "@/lib/themeList";
import { THEME_COLORS } from "@/lib/themeColors";
import { windowOpts } from "@/lib/window";
import { readOdds } from "@/lib/personaStats";
import { Card, cardSize } from "@/components/Card";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { owner: string; name: string } }
) {
  const url = new URL(req.url);
  const theme = resolveTheme(url.searchParams.get("theme"));
  const { opts, label } = windowOpts(url.searchParams.get("window"));
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") || url.host;

  try {
    const stats = await getWrappedRepoStats(params.owner, params.name, opts);
    stats.window.label = label;
    if (stats.persona) {
      const odds = await readOdds(stats.persona.id);
      if (odds) stats.persona.odds = odds;
    }
    return new ImageResponse(
      (
        <Card
          stats={stats}
          colors={THEME_COLORS[theme]}
          themeId={theme}
          variant="readme"
          credit={`${site}/r/${params.owner}/${params.name}`}
        />
      ),
      {
        ...cardSize("readme"),
        emoji: "twemoji",
        headers: {
          "cache-control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (e) {
    const status = e instanceof NotFoundError ? 404 : 502;
    return new Response(`card error: ${(e as Error).message}`, { status });
  }
}
