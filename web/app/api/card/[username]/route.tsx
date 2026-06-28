// README embed card — compact PNG meant for `![](…/api/card/USER)` in a README.
// The distribution lever: every embed is a backlink + "make yours" invite.
import { ImageResponse } from "next/og";
import { getWrappedStats, NotFoundError } from "@/lib/stats";
import { resolveTheme } from "@/lib/themeList";
import { THEME_COLORS } from "@/lib/themeColors";
import { windowOpts } from "@/lib/window";
import { Card, cardSize } from "@/components/Card";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const url = new URL(req.url);
  const theme = resolveTheme(url.searchParams.get("theme"));
  const { opts } = windowOpts(url.searchParams.get("window"));
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") || url.host;

  try {
    const stats = await getWrappedStats(params.username, opts);
    return new ImageResponse(
      (
        <Card
          stats={stats}
          colors={THEME_COLORS[theme]}
          themeId={theme}
          variant="readme"
          credit={`${site}/${params.username}`}
        />
      ),
      {
        ...cardSize("readme"),
        emoji: "twemoji",
        headers: {
          // README images are camo-proxied by GitHub; allow periodic refresh.
          "cache-control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (e) {
    const status = e instanceof NotFoundError ? 404 : 502;
    return new Response(`card error: ${(e as Error).message}`, { status });
  }
}
