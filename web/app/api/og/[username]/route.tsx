import { ImageResponse } from "next/og";
import { getWrappedStats, NotFoundError } from "@/lib/stats";
import { resolveTheme } from "@/lib/themeList";
import { THEME_COLORS } from "@/lib/themeColors";
import { windowOpts } from "@/lib/window";
import { Card, cardSize, type Variant } from "@/components/Card";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const url = new URL(req.url);
  const theme = resolveTheme(url.searchParams.get("theme"));
  const fmt = url.searchParams.get("format");
  const variant: Variant = fmt === "story" ? "story" : "og";
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
          variant={variant}
          credit={`${site}/${params.username}`}
        />
      ),
      { ...cardSize(variant), emoji: "twemoji" }
    );
  } catch (e) {
    const status = e instanceof NotFoundError ? 404 : 502;
    return new Response(`og error: ${(e as Error).message}`, { status });
  }
}
